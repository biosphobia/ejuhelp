import type { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { readFileSync } from 'node:fs';

let initialized = false;
let adminAvailable = false;

function initAdmin() {
  if (initialized) return;
  initialized = true;
  try {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT;
    const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (json && json.trim().startsWith('{')) {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(json)) });
      adminAvailable = true;
    } else if (path) {
      // firebase-admin reads GOOGLE_APPLICATION_CREDENTIALS automatically.
      const svc = JSON.parse(readFileSync(path, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(svc) });
      adminAvailable = true;
    }
  } catch (e) {
    console.warn('[auth] firebase-admin not initialized:', (e as Error).message);
  }
}

export interface AuthedRequest extends Request {
  uid?: string;
}

/**
 * Verify the caller's Firebase ID token. In local dev (ALLOW_ANON=true) or when
 * Firebase Admin isn't configured, requests pass through anonymously.
 */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  initAdmin();
  const allowAnon = process.env.ALLOW_ANON === 'true';

  if (!adminAvailable) {
    if (allowAnon) return next();
    return res.status(401).json({ error: 'auth_not_configured' });
  }

  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    if (allowAnon) return next();
    return res.status(401).json({ error: 'missing_token' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    return next();
  } catch {
    if (allowAnon) return next();
    return res.status(401).json({ error: 'invalid_token' });
  }
}
