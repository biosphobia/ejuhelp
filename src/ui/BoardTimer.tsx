import { useEffect, type PointerEvent as ReactPointerEvent } from 'react';
import { useTimer, useTick, formatTime, chime } from '../lib/timer';
import { useT } from '../i18n';
import { PlayIcon, PauseIcon, UndoIcon, CloseIcon } from './icons';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export default function BoardTimer() {
  const t = useT();
  const mode = useTimer((s) => s.mode);
  const durationMs = useTimer((s) => s.durationMs);
  const running = useTimer((s) => s.running);
  const showOnBoard = useTimer((s) => s.showOnBoard);
  const pos = useTimer((s) => s.pos);
  const start = useTimer((s) => s.start);
  const pause = useTimer((s) => s.pause);
  const reset = useTimer((s) => s.reset);
  const complete = useTimer((s) => s.complete);
  const setShowOnBoard = useTimer((s) => s.setShowOnBoard);
  const setPos = useTimer((s) => s.setPos);
  const elapsed = useTimer((s) => s.elapsed);
  const remaining = useTimer((s) => s.remaining);

  // This component is always mounted, so it owns countdown completion: it ticks
  // while running (driving the display) and stops + chimes when a countdown ends.
  useTick(running);
  useEffect(() => {
    if (running && mode === 'down' && remaining() <= 0) {
      complete();
      chime();
    }
  });

  if (!showOnBoard || !(running || elapsed() > 0)) return null;

  const shownMs = mode === 'up' ? elapsed() : remaining();
  const finished = mode === 'down' && durationMs > 0 && remaining() <= 0;
  const left = pos ? pos.x : window.innerWidth - 220;
  const top = pos ? pos.y : 64;

  const startDrag = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // let buttons work
    const sx = e.clientX;
    const sy = e.clientY;
    const bx = left;
    const by = top;
    const move = (ev: PointerEvent) => {
      setPos({
        x: clamp(bx + (ev.clientX - sx), 4, window.innerWidth - 90),
        y: clamp(by + (ev.clientY - sy), 4, window.innerHeight - 44),
      });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    e.preventDefault();
  };

  return (
    <div
      onPointerDown={startDrag}
      style={{ left, top }}
      className={`pointer-events-auto absolute z-20 flex cursor-move touch-none items-center gap-2 rounded-2xl px-3 py-2 shadow-2xl ring-1 backdrop-blur ${
        finished ? 'bg-red-50/95 ring-red-200' : 'bg-white/95 ring-black/10'
      }`}
    >
      <span
        className={`font-mono text-2xl font-bold tabular-nums tracking-tight ${
          finished ? 'text-red-600' : 'text-slate-900'
        }`}
        title={mode === 'up' ? t('countUp') : t('countDown')}
      >
        {formatTime(shownMs)}
      </span>
      <button
        type="button"
        onClick={() => (running ? pause() : start())}
        aria-label={running ? t('pause') : t('start')}
        className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-white hover:bg-slate-800"
      >
        {running ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={reset}
        aria-label={t('reset')}
        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
      >
        <UndoIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setShowOnBoard(false)}
        aria-label={t('close')}
        className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-600"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
