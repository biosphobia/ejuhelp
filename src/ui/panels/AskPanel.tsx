import { useRef, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import Markdown from '../Markdown';
import { ErrorNote } from '../atoms';
import { SpinnerIcon } from '../icons';
import { askClaude, type ChatMessage } from '../../lib/api';
import { useUI } from '../../lib/ui';
import { useT } from '../../i18n';
import { errorMessage } from '../atoms';

export default function AskPanel() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const lang = useUI((s) => s.lang);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setErr(null);
    try {
      const res = await askClaude({ subject, lang, messages: next });
      setMessages([...next, { role: 'assistant', content: res.text }]);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 1e9 }));
    } catch (e) {
      setErr(errorMessage(e, t)); // keep the user's message visible; just surface the error
    } finally {
      setBusy(false);
    }
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
                void send();
              }
            }}
            rows={2}
            placeholder={t('askPlaceholder')}
            className="thin-scroll max-h-32 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={busy || !input.trim()}
            className="grid h-10 shrink-0 place-items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
          >
            {busy ? <SpinnerIcon className="h-4 w-4" /> : t('send')}
          </button>
        </div>
      }
    >
      <SubjectChips />
      <p className="mb-3 text-xs text-slate-500">{t('askHint')}</p>

      <div ref={scrollRef} className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-3 py-2 ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-800 ring-1 ring-slate-100'
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
        {err ? <ErrorNote>{err}</ErrorNote> : null}
      </div>
    </Panel>
  );
}
