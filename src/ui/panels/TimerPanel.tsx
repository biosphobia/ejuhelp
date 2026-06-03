import Panel from '../Panel';
import { Label } from '../atoms';
import { PlayIcon, PauseIcon, UndoIcon } from '../icons';
import { useTimer, useTick, formatTime } from '../../lib/timer';
import { useT } from '../../i18n';

const PRESETS_MIN = [5, 15, 25, 50];

export default function TimerPanel() {
  const t = useT();
  const mode = useTimer((s) => s.mode);
  const durationMs = useTimer((s) => s.durationMs);
  const running = useTimer((s) => s.running);
  const showOnBoard = useTimer((s) => s.showOnBoard);
  const setMode = useTimer((s) => s.setMode);
  const setDurationMs = useTimer((s) => s.setDurationMs);
  const start = useTimer((s) => s.start);
  const pause = useTimer((s) => s.pause);
  const reset = useTimer((s) => s.reset);
  const setShowOnBoard = useTimer((s) => s.setShowOnBoard);
  const elapsed = useTimer((s) => s.elapsed);
  const remaining = useTimer((s) => s.remaining);

  useTick(running);

  const shownMs = mode === 'up' ? elapsed() : remaining();
  const started = running || elapsed() > 0;
  const finished = mode === 'down' && durationMs > 0 && remaining() <= 0 && elapsed() > 0;

  const mins = Math.floor(durationMs / 60000);
  const secs = Math.floor((durationMs % 60000) / 1000);
  const setMin = (m: number) => setDurationMs((Math.max(0, m) * 60 + secs) * 1000);
  const setSec = (sec: number) => setDurationMs((mins * 60 + Math.min(59, Math.max(0, sec))) * 1000);

  const canStart = mode === 'up' || durationMs > 0;
  const primaryLabel = running ? t('pause') : elapsed() > 0 ? t('resume') : t('start');

  return (
    <Panel title={t('timer')}>
      <p className="mb-3 text-xs text-slate-500">{t('timerHint')}</p>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <ModeBtn on={mode === 'up'} onClick={() => setMode('up')} label={t('countUp')} />
        <ModeBtn on={mode === 'down'} onClick={() => setMode('down')} label={t('countDown')} />
      </div>

      {mode === 'down' ? (
        <div className="mb-4">
          <Label>{t('duration')}</Label>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {PRESETS_MIN.map((m) => (
              <button
                key={m}
                type="button"
                disabled={running}
                onClick={() => setDurationMs(m * 60 * 1000)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition disabled:opacity-40 ${
                  mins === m && secs === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m} {t('minutesShort')}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <NumField label={t('minutesShort')} value={mins} max={600} disabled={running} onChange={setMin} />
            <span className="pb-2 text-lg font-semibold text-slate-400">:</span>
            <NumField label={t('secondsShort')} value={secs} max={59} disabled={running} onChange={setSec} />
          </div>
        </div>
      ) : null}

      <div
        className={`my-4 rounded-2xl py-6 text-center ${
          finished ? 'bg-red-50 ring-1 ring-red-200' : 'bg-slate-900'
        }`}
      >
        <div
          className={`font-mono text-5xl font-bold tabular-nums tracking-tight ${
            finished ? 'text-red-600' : 'text-white'
          }`}
        >
          {formatTime(shownMs)}
        </div>
        {finished ? <div className="mt-1 text-sm font-semibold text-red-600">{t('timeUp')}</div> : null}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canStart}
          onClick={() => (running ? pause() : start())}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40"
        >
          {running ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          {primaryLabel}
        </button>
        <button
          type="button"
          disabled={!started}
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-40"
        >
          <UndoIcon className="h-4 w-4" /> {t('reset')}
        </button>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-xl p-2 hover:bg-slate-50">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4"
          checked={showOnBoard}
          onChange={(e) => setShowOnBoard(e.target.checked)}
        />
        <span className="text-sm">
          <span className="font-medium text-slate-800">{t('showOnBoard')}</span>
          <span className="block text-xs text-slate-500">{t('showOnBoardHint')}</span>
        </span>
      </label>
    </Panel>
  );
}

function ModeBtn({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        on ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
}

function NumField({
  label,
  value,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex-1">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-lg font-semibold tabular-nums outline-none focus:border-slate-400 disabled:opacity-50"
      />
    </label>
  );
}
