import type { Server } from 'node:http';
import type { Socket } from 'node:net';
import { WebSocketServer, WebSocket } from 'ws';
import { verifyIdToken } from './auth';

// Live device-mirroring relay: one "room" per signed-in user (uid). Every message a
// device sends is fanned out verbatim to the SAME user's other connected devices —
// the server holds no state and understands no ops; all merge/apply logic lives in the
// client (src/lib/live.ts). The only server-generated message is the peer count
// ({k:'peers', n}), sent whenever a room's membership changes so clients know whether
// streaming ink is worth the bandwidth.

interface LiveSocket extends WebSocket {
  uid?: string;
  isAlive?: boolean;
}

const rooms = new Map<string, Set<LiveSocket>>();

function roomOf(uid: string): Set<LiveSocket> {
  let r = rooms.get(uid);
  if (!r) {
    r = new Set();
    rooms.set(uid, r);
  }
  return r;
}

function broadcastPeers(uid: string) {
  const room = rooms.get(uid);
  if (!room) return;
  for (const ws of room) {
    // each device's peer count excludes itself
    const msg = JSON.stringify({ k: 'peers', n: room.size - 1 });
    try {
      ws.send(msg);
    } catch {
      /* ignore */
    }
  }
}

function leave(ws: LiveSocket) {
  const uid = ws.uid;
  if (!uid) return;
  const room = rooms.get(uid);
  if (!room) return;
  room.delete(ws);
  if (room.size === 0) rooms.delete(uid);
  else broadcastPeers(uid);
}

export function setupLive(server: Server) {
  // Ink batches are tiny, but a stroke-add can carry a pasted photo (data URL) and the
  // connect-time snapshot exchange can carry a whole notebook — allow generous frames.
  const wss = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024 * 1024 });

  server.on('upgrade', (req, socket, head) => {
    let url: URL;
    try {
      url = new URL(req.url ?? '', 'http://x');
    } catch {
      socket.destroy();
      return;
    }
    if (url.pathname !== '/ws/live') return; // not ours (let other handlers/404 deal with it)
    void (async () => {
      const token = url.searchParams.get('token') ?? '';
      const claimedUid = url.searchParams.get('uid') ?? '';
      const v = await verifyIdToken(token);
      // With Firebase Admin configured, the VERIFIED uid is the room key — a client can
      // never join another user's room. Without Admin (open/dev mode) we fall back to the
      // claimed uid, mirroring the REST API's open-mode policy.
      const uid = v.available ? v.uid : claimedUid || null;
      if (!uid) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket as Socket, head, (ws) => {
        const ls = ws as LiveSocket;
        ls.uid = uid;
        ls.isAlive = true;
        roomOf(uid).add(ls);
        broadcastPeers(uid);

        ls.on('pong', () => {
          ls.isAlive = true;
        });
        ls.on('message', (data, isBinary) => {
          if (isBinary) return;
          const text = data.toString();
          if (text.length > 16 * 1024 * 1024) return;
          // heartbeat frames stay between client and server
          if (text === '{"k":"hb"}') return;
          const room = rooms.get(uid);
          if (!room) return;
          for (const peer of room) {
            if (peer !== ls && peer.readyState === WebSocket.OPEN) {
              try {
                peer.send(text);
              } catch {
                /* ignore */
              }
            }
          }
        });
        ls.on('close', () => leave(ls));
        ls.on('error', () => {
          try {
            ls.close();
          } catch {
            /* ignore */
          }
        });
      });
    })();
  });

  // Dead-connection sweep: proxies (and sleeping iPads) can drop sockets without a FIN.
  const sweep = setInterval(() => {
    for (const room of rooms.values()) {
      for (const ws of room) {
        if (ws.isAlive === false) {
          try {
            ws.terminate();
          } catch {
            /* ignore */
          }
          leave(ws);
          continue;
        }
        ws.isAlive = false;
        try {
          ws.ping();
        } catch {
          /* ignore */
        }
      }
    }
  }, 30_000);
  sweep.unref?.();

  console.log('[eju] live-sync relay listening on /ws/live');
}
