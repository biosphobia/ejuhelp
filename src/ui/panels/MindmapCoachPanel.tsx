import { useEffect, useRef, useState } from 'react';
import Panel from '../Panel';
import Markdown from '../Markdown';
import { errorMessage } from '../atoms';
import { SpinnerIcon, TrashIcon } from '../icons';
import { useMindmapCoach } from '../../lib/mindmapCoach';
import { useUI } from '../../lib/ui';
import { useT } from '../../i18n';

export default function MindmapCoachPanel() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const messages = useMindmapCoach((s) => s.messages);
  const busy = useMindmapCoach((s) => s.busy);
  const error = useMindmapCoach((s) => s.error);
  const lastChange = useMindmapCoach((s) => s.lastChange);
  const send = useMindmapCoach((s) => s.send);
  const reset = useMindmapCoach((s) => s.reset);

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // The conversation is about the active subject's map — start fresh per subject.
  useEffect(() => {
    reset();
  }, [subject, reset]);

  useEffect(() => {
    const id = requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ block: 'end' }));
    return () => cancelAnimationFrame(id);
  }, [messages, busy]);

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    void send(text);
  };

  return (
    <Panel
      dark
      title={`${t('mindmapCoachTitle')} · ${t(subject)}`}
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
            placeholder={t('mindmapCoachPlaceholder')}
            className="thin-scroll max-h-32 flex-1 resize-none rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-white/30"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy || !input.trim()}
            className="grid h-10 shrink-0 place-items-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 disabled:opacity-40"
          >
            {busy ? <SpinnerIcon className="h-4 w-4" /> : t('send')}
          </button>
        </div>
      }
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-xs text-slate-400">{t('mindmapCoachHint')}</p>
        {messages.length ? (
          <button
            type="button"
            onClick={reset}
            title={t('clearChatHint')}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-400"
          >
            <TrashIcon className="h-3.5 w-3.5" /> {t('clearChat')}
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`max-w-[92%] rounded-2xl px-3 py-2 ${
                m.role === 'user' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-100 ring-1 ring-white/10'
              }`}
            >
              {m.role === 'user' ? (
                <span className="whitespace-pre-wrap text-sm">{m.content}</span>
              ) : (
                <Markdown text={m.content} className="text-slate-100" />
              )}
            </div>
          </div>
        ))}
        {busy ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <SpinnerIcon className="h-4 w-4" /> {t('loading')}
          </div>
        ) : null}
        {!busy && lastChange ? (
          <div className="rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20">
            ✓ {t('mindmapChanged', { added: lastChange.added, removed: lastChange.removed, updated: lastChange.updated })}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-300 ring-1 ring-red-500/20">
            {errorMessage(error, t)}
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>
    </Panel>
  );
}
