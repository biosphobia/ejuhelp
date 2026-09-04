import { useEffect, useRef, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import Markdown, { Inline } from '../Markdown';
import { ErrorNote, errorMessage } from '../atoms';
import { SpinnerIcon, CheckIcon, TrashIcon } from '../icons';
import { useAsk, type CheckMeta } from '../../lib/ask';
import { usePractice } from '../../lib/practice';
import { errorTagLabel } from '../../lib/labels';
import type { AskSummary } from '../../lib/api';
import { useT, type TFunc } from '../../i18n';

function CheckVerdict({ meta, t }: { meta: CheckMeta; t: TFunc }) {
  if (meta.correct === 'unknown') return null; // nothing definitive to show
  const tone =
    meta.correct === 'yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
  const label = meta.correct === 'yes' ? t('correctMark') : t('incorrectMark');
  const tags = meta.errorTags.filter((tag) => tag !== 'none');
  return (
    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>
      {tags.map((tag) => (
        <span key={tag} className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
          {errorTagLabel(tag, t)}
        </span>
      ))}
    </div>
  );
}

/** The structured takeaway under a coach reply: the one idea, what to memorise,
 *  the traps, and tappable follow-up questions. This replaces the old prose
 *  "Exam essentials" block so the same things are always in the same place. */
function Takeaway({ s, t, onAsk, disabled }: { s: AskSummary; t: TFunc; onAsk: (q: string) => void; disabled: boolean }) {
  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-indigo-100 bg-white">
      <div className="bg-indigo-50/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
        ★ {t('takeaway')}
      </div>
      <div className="space-y-2.5 px-3 py-2.5 text-sm">
        {s.keyIdea ? (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('keyIdeaLabel')}</div>
            <div className="font-medium leading-relaxed text-slate-900">
              <Inline text={s.keyIdea} />
            </div>
          </div>
        ) : null}
        {s.formulas.length ? (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('rememberLabel')}</div>
            <ul className="mt-0.5 space-y-1">
              {s.formulas.map((f, i) => (
                <li key={i} className="flex gap-2 leading-relaxed">
                  <span className="text-indigo-400">•</span>
                  <span className="min-w-0 flex-1">
                    <Inline text={f} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {s.traps.length ? (
          <div className="rounded-xl bg-amber-50/80 px-2.5 py-1.5 ring-1 ring-amber-100">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">⚠ {t('trapLabel')}</div>
            <ul className="mt-0.5 space-y-1">
              {s.traps.map((f, i) => (
                <li key={i} className="flex gap-2 leading-relaxed text-slate-800">
                  <span className="text-amber-500">•</span>
                  <span className="min-w-0 flex-1">
                    <Inline text={f} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {s.nextQuestions.length ? (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('nextQuestions')}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {s.nextQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => onAsk(q)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-left text-[13px] text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
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
  const [attach, setAttach] = useState(false);
  const [wide, setWide] = useState(() => {
    try {
      return localStorage.getItem('eju-ask-wide') === '1';
    } catch {
      return false;
    }
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('eju-ask-wide', wide ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [wide]);

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
    setAttach(false);
    void send(text, attach ? { attachPage: true } : undefined);
  };
  const sendWithPage = (text: string) => {
    if (busy) return;
    setAttach(false);
    void send(text, { attachPage: true });
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

  const lastAssistant = [...messages].reverse().findIndex((m) => m.role === 'assistant');
  const lastAssistantIdx = lastAssistant >= 0 ? messages.length - 1 - lastAssistant : -1;

  return (
    <Panel
      title={t('askCoach')}
      wide={wide}
      headerExtra={
        <button
          type="button"
          onClick={() => setWide((w) => !w)}
          title={wide ? t('narrowView') : t('wideView')}
          aria-label={wide ? t('narrowView') : t('wideView')}
          className="hidden h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 sm:grid"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {wide ? (
              <>
                <path d="M9 4v16M15 4v16" />
                <path d="M3 12h4M17 12h4" />
              </>
            ) : (
              <>
                <path d="M4 4v16M20 4v16" />
                <path d="M8 12h8M8 12l3-3M8 12l3 3M16 12l-3-3M16 12l-3 3" />
              </>
            )}
          </svg>
        </button>
      }
      footer={
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void runCheck()}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
            >
              {checking ? <SpinnerIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
              {checking ? t('checking') : t('check')}
            </button>
            <button
              type="button"
              onClick={() => setAttach((v) => !v)}
              disabled={busy}
              aria-pressed={attach}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-40 ${
                attach ? 'border-indigo-300 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              📎 {t('attachPage')}
            </button>
          </div>
          {attach ? (
            <div className="rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-800 ring-1 ring-indigo-100">
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => sendWithPage(t('tidyNotesPrompt'))} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-indigo-800 ring-1 ring-indigo-200 hover:bg-indigo-100">
                  ✨ {t('tidyNotes')}
                </button>
                <button type="button" onClick={() => sendWithPage(t('explainPagePrompt'))} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-indigo-800 ring-1 ring-indigo-200 hover:bg-indigo-100">
                  💡 {t('explainPage')}
                </button>
              </div>
            </div>
          ) : null}
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
            title={t('clearChatHint')}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-600"
          >
            <TrashIcon className="h-3.5 w-3.5" /> {t('clearChat')}
          </button>
        ) : null}
      </div>

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
          <div className="max-h-24 overflow-y-auto text-sm text-amber-900">
            <Markdown text={activeQuestion} />
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`rounded-2xl px-3 py-2 ${
                m.role === 'user'
                  ? 'max-w-[92%] bg-slate-900 text-white'
                  : 'w-full bg-slate-50 text-slate-800 ring-1 ring-slate-100'
              }`}
            >
              {m.role === 'user' ? (
                <span className="whitespace-pre-wrap text-sm">
                  {m.attached ? <span className="mr-1 rounded-md bg-white/15 px-1.5 py-0.5 text-[11px]">📎 {t('attachPage')}</span> : null}
                  {m.content}
                </span>
              ) : (
                <>
                  {m.check ? <CheckVerdict meta={m.check} t={t} /> : null}
                  <Markdown text={m.content} />
                  {m.summary ? (
                    <Takeaway s={m.summary} t={t} disabled={busy} onAsk={(q) => void send(q)} />
                  ) : null}
                  {i === lastAssistantIdx && !busy && savedCount > 0 ? (
                    <div className="mt-2 text-xs font-medium text-emerald-700">★ {t('savedKeyPoints', { n: savedCount })}</div>
                  ) : null}
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
        {error ? <ErrorNote>{errorMessage(error, t)}</ErrorNote> : null}
        <div ref={bottomRef} />
      </div>
    </Panel>
  );
}
