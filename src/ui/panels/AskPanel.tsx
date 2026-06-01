import { useEffect, useRef, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import Markdown from '../Markdown';
import { ErrorNote, errorMessage } from '../atoms';
import { SpinnerIcon, CheckIcon } from '../icons';
import { useAsk, type CheckMeta } from '../../lib/ask';
import { usePractice } from '../../lib/practice';
import { errorTagLabel } from '../../lib/labels';
import { useT, type TFunc } from '../../i18n';

function CheckVerdict({ meta, t }: { meta: CheckMeta; t: TFunc }) {
  const tone =
    meta.correct === 'yes'
      ? 'bg-emerald-100 text-emerald-800'
      : meta.correct === 'no' || meta.correct === 'partial'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-slate-200 text-slate-600';
  const label =
    meta.correct === 'yes' ? t('correctMark') : meta.correct === 'unknown' ? t('check') : t('incorrectMark');
  return (
    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>
      {meta.errorTags
        .filter((tag) => tag !== 'none')
        .map((tag) => (
          <span key={tag} className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
            {errorTagLabel(tag, t)}
          </span>
        ))}
    </div>
  );
}

export default function AskPanel() {
  const t = useT();
  const messages = useAsk((s) => s.messages);
  const busy = useAsk((s) => s.busy);
  const error = useAsk((s) => s.error);
  const savedCount = useAsk((s) => s.lastSaved);
  const autoAnswered = useAsk((s) => s.lastAutoAnswered);
  const send = useAsk((s) => s.send);
  const check = useAsk((s) => s.check);
  const reset = useAsk((s) => s.reset);
  const activeQuestion = usePractice((s) => s.activeQuestion);
  const setActiveQuestion = usePractice((s) => s.setActiveQuestion);

  const [input, setInput] = useState('');
  const [checking, setChecking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the conversation pinned to the latest message — including on re-entry,
  // since the panel remounts each time it is opened.
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

  const runCheck = async () => {
    if (busy) return;
    setChecking(true);
    try {
      await check();
    } finally {
      setChecking(false);
    }
  };

  return (
    <Panel
      title={t('askCoach')}
      footer={
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => void runCheck()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            {checking ? <SpinnerIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
            {checking ? t('checking') : t('check')}
          </button>
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
              {busy && !checking ? <SpinnerIcon className="h-4 w-4" /> : t('send')}
            </button>
          </div>
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
      <p className="mb-3 text-xs text-slate-500">{t('coachHint')}</p>

      {activeQuestion ? (
        <div className="mb-3 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              {t('activeQuestion')}
            </span>
            <button
              type="button"
              onClick={() => setActiveQuestion(null)}
              className="text-xs font-semibold text-amber-700 underline"
            >
              {t('close')}
            </button>
          </div>
          <div className="max-h-24 overflow-y-auto whitespace-pre-wrap text-sm text-amber-900">{activeQuestion}</div>
        </div>
      ) : null}

      <div className="space-y-3">
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
                <>
                  {m.check ? <CheckVerdict meta={m.check} t={t} /> : null}
                  <Markdown text={m.content} />
                </>
              )}
            </div>
          </div>
        ))}
        {busy ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <SpinnerIcon className="h-4 w-4" /> {checking ? t('checking') : t('loading')}
          </div>
        ) : null}
        {!busy && autoAnswered ? (
          <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
            ✓ {t('autoAnswered')}
          </div>
        ) : null}
        {!busy && savedCount > 0 ? (
          <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
            ★ {t('savedKeyPoints', { n: savedCount })}
          </div>
        ) : null}
        {error ? <ErrorNote>{errorMessage(error, t)}</ErrorNote> : null}
        <div ref={bottomRef} />
      </div>
    </Panel>
  );
}
