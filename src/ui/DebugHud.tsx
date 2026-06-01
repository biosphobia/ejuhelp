import { useDebug } from '../lib/debug';

// Read-only pointer-event log for diagnosing input issues. Enable in Settings.
export default function DebugHud() {
  const enabled = useDebug((s) => s.enabled);
  const lines = useDebug((s) => s.lines);
  if (!enabled) return null;
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-30 max-w-[80vw] rounded-lg bg-black/80 p-2 font-mono text-[10px] leading-tight text-emerald-300 shadow-lg">
      <div className="mb-1 font-sans text-white">
        pointer log · v{__APP_VERSION__} · {__BUILD_ID__}
      </div>
      {lines.length === 0 ? (
        <div className="text-slate-400">tap once with the pen, then once with a finger…</div>
      ) : (
        lines.map((l, i) => <div key={i}>{l}</div>)
      )}
    </div>
  );
}
