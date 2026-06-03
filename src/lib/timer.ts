import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimerMode = 'up' | 'down';

interface TimerState {
  mode: TimerMode;
  /** Countdown length in ms (used when mode === 'down'). */
  durationMs: number;
  running: boolean;
  /** Epoch ms when the current running segment began (null when paused). */
  startedAt: number | null;
  /** Time banked from previous run segments, in ms. */
  accumulatedMs: number;
  /** Whether the floating timer is shown on the whiteboard. */
  showOnBoard: boolean;
  pos: { x: number; y: number } | null;

  setMode: (m: TimerMode) => void;
  setDurationMs: (ms: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  /** Stop and bank exactly the full countdown duration (called when it hits 0). */
  complete: () => void;
  setShowOnBoard: (b: boolean) => void;
  setPos: (p: { x: number; y: number }) => void;

  /** Live elapsed time since the last reset, in ms. */
  elapsed: () => number;
  /** Live remaining time for a countdown, in ms (clamped at 0). */
  remaining: () => number;
}

const DEFAULT_DURATION = 25 * 60 * 1000; // 25 min

export const useTimer = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: 'up',
      durationMs: DEFAULT_DURATION,
      running: false,
      startedAt: null,
      accumulatedMs: 0,
      showOnBoard: true,
      pos: null,

      setMode: (mode) => set({ mode, running: false, startedAt: null, accumulatedMs: 0 }),
      setDurationMs: (durationMs) =>
        set({ durationMs: Math.max(0, durationMs), running: false, startedAt: null, accumulatedMs: 0 }),
      start: () =>
        set((s) => (s.running ? s : { running: true, startedAt: Date.now() })),
      pause: () =>
        set((s) =>
          s.running && s.startedAt != null
            ? { running: false, startedAt: null, accumulatedMs: s.accumulatedMs + (Date.now() - s.startedAt) }
            : s
        ),
      reset: () => set({ running: false, startedAt: null, accumulatedMs: 0 }),
      complete: () =>
        set((s) => (s.running ? { running: false, startedAt: null, accumulatedMs: s.durationMs } : s)),
      setShowOnBoard: (showOnBoard) => set({ showOnBoard }),
      setPos: (pos) => set({ pos }),

      elapsed: () => {
        const s = get();
        return s.running && s.startedAt != null ? s.accumulatedMs + (Date.now() - s.startedAt) : s.accumulatedMs;
      },
      remaining: () => Math.max(0, get().durationMs - get().elapsed()),
    }),
    {
      name: 'eju-timer',
      // Persist configuration only — the running clock resets on reload so we
      // never silently count time while the tab was closed.
      partialize: (s) => ({ mode: s.mode, durationMs: s.durationMs, showOnBoard: s.showOnBoard, pos: s.pos }),
    }
  )
);

/** Re-render on an interval while `active`, so a live clock display updates. */
export function useTick(active: boolean, ms = 250) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => force((n) => (n + 1) % 1_000_000), ms);
    return () => window.clearInterval(id);
  }, [active, ms]);
}

/** Format ms as M:SS, or H:MM:SS once past an hour. */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Short, gentle two-tone chime when a countdown finishes. Best-effort. */
export function chime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const play = (freq: number, start: number, dur: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = freq;
      o.type = 'sine';
      const t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.2, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    };
    play(880, 0, 0.25);
    play(1175, 0.18, 0.35);
    setTimeout(() => ctx.close().catch(() => {}), 900);
  } catch {
    /* audio not available — ignore */
  }
}
