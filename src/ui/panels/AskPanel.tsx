import { useEffect, useRef, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import Markdown from '../Markdown';
import { ErrorNote, errorMessage } from '../atoms';
import { SpinnerIcon } from '../icons';
import { useAsk } from '../../lib/ask';
import { useT } from '../../i18n';

export default function AskPanel() {
  const t = useT();
  const messages = useAsk((s) => s.messages);
  const busy = useAsk((s) => s.busy);
  const error = useAsk((s) => s.error);
  const savedCount = useAsk((s) => s.lastSaved);
  const send = useAsk((s) => s.send);
  const reset = useAsk((s) => s.reset);

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 1e9 }));
  }, [messages, busy]);

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    void send(text);
  };

  return (
    <Panel
      title={t('askTitle')}
      footer={
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder={t('askPlaceholder')}
            className="thin-scroll max-h-32 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy || !input.trim()}
            className="grid h-10 shrink-0 place-items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
          >
            {busy ? <SpinnerIcon className="h-4 w-4" /> : t('send')}
          </button>
        </div>
      }
    >
      <div className="mb-2 flex items-center justify-between">
        <SubjectChips />
        {messages.length ? (
          <button
            type="button"
            onClick={reset}
            className="shrink-0 text-xs font-semibold text-slate-400 hover:text-slate-700"
          >
            {t('clearChat')}
          </button>
        ) : null}
      </div>
      <p className="mb-3 text-xs text-slate-500">{t('askHint')}</p>

      <div ref={scrollRef} className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`max-w-[92%] rounded-2xl px-3 py-2 ${
                m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800 ring-1 ring-slate-100'
              }`}
            >
              {m.role === 'user' ? (
                <span className="whitespace-pre-wrap text-sm">{m.content}</span>
              ) : (
                <Markdown text={m.content} />
              )}
            </div>
          </div>
        ))}
        {busy ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <SpinnerIcon className="h-4 w-4" /> {t('loading')}
          </div>
        ) : null}
        {!busy && savedCount > 0 ? (
          <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
            ★ {t('savedKeyPoints', { n: savedCount })}
          </div>
        ) : null}
        {error ? <ErrorNote>{errorMessage(error, t)}</ErrorNote> : null}
      </div>
    </Panel>
  );
}
