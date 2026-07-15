import { useEffect, useRef, useState } from 'react';
import Panel from '../Panel';
import Markdown from '../Markdown';
import { ErrorNote, errorMessage } from '../atoms';
import { SpinnerIcon, CheckIcon, AskIcon, TrashIcon, NotesIcon } from '../icons';
import { useAsk, type CheckMeta } from '../../lib/ask';
import { usePractice } from '../../lib/practice';
import { errorTagLabel } from '../../lib/labels';
import { useT, type TFunc } from '../../i18n';
import { useUI } from '../../lib/ui';
import { useBoard } from '../../lib/board';
import { fetchNoteSummary } from '../../lib/api';
import { makeTextNote } from '../../whiteboard/textnote';

/** Strip Markdown/LaTeX to plain text — the fallback when summarization is unavailable. */
function toPlainNote(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\$\$?([^$]*?)\$\$?/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/_{1,2}([^_]*)_{1,2}/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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

export default function AskPanel() {
  const t = useT();
  const messages = useAsk((s) => s.messages);
  const busy = useAsk((s) => s.busy);
  const error = useAsk((s) => s.error);
  const savedCount = useAsk((s) => s.lastSaved);
  const autoAnswered = useAsk((s) => s.lastAutoAnswered);
  const send = useAsk((s) => s.send);
  const check = useAsk((s) => s.check);
  const explain = useAsk((s) => s.explain);
  const reset = useAsk((s) => s.reset);
  const activeQuestion = usePractice((s) => s.activeQuestion);
  const setActiveQuestion = usePractice((s) => s.setActiveQuestion);

  const subject = useUI((s) => s.subject);
  const lang = useUI((s) => s.lang);
  const closePanel = useUI((s) => s.closePanel);

  const [input, setInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [noteIdx, setNoteIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Summarize a coach reply into a short note and drop it on the whiteboard as a text
  // object (which the selection tool can then move / scale / rotate / duplicate / delete).
  const saveNote = async (i: number, content: string) => {
    if (noteIdx !== null) return;
    setNoteIdx(i);
    try {
      let noteText = '';
      try {
        const r = await fetchNoteSummary({ subject, lang, text: content });
        noteText = (r.text || '').trim();
      } catch {
        /* fall back to a plain-text version of the reply below */
      }
      if (!noteText) noteText = toPlainNote(content).slice(0, 400) || '…';
      // Drop it centered on the current view (screen center → world coords).
      const vp = useBoard.getState().getCurrentPage().viewport;
      const center = {
        x: (window.innerWidth / 2 - vp.x) / vp.scale,
        y: (window.innerHeight / 2 - vp.y) / vp.scale,
      };
      useBoard.getState().addStroke(makeTextNote(noteText, useBoard.getState().color, center));
      closePanel(); // reveal the board so the new note is visible
    } finally {
      setNoteIdx(null);
    }
  };

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

  // "Check my work" and "Explain" both fold in whatever the student typed in the
  // textbox (as a note that steers the answer) and clear it once it is consumed.
  const runBoard = async (kind: 'check' | 'explain') => {
    if (busy) return;
    const note = input.trim();
    const setFlag = kind === 'check' ? setChecking : setExplaining;
    setFlag(true);
    try {
      if (kind === 'check') await check(note);
      else await explain(note);
      // Keep the note if nothing was sent (e.g. an empty-board error) so it isn't lost.
      if (!useAsk.getState().error) setInput('');
    } finally {
      setFlag(false);
    }
  };

  return (
    <Panel
      title={t('askCoach')}
      footer={
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void runBoard('check')}
              disabled={busy}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold leading-tight text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
            >
              {checking ? <SpinnerIcon className="h-4 w-4 shrink-0" /> : <CheckIcon className="h-4 w-4 shrink-0" />}
              {checking ? t('checking') : t('check')}
            </button>
            <button
              type="button"
              onClick={() => void runBoard('explain')}
              disabled={busy}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold leading-tight text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
            >
              {explaining ? <SpinnerIcon className="h-4 w-4 shrink-0" /> : <AskIcon className="h-4 w-4 shrink-0" />}
              {explaining ? t('loading') : t('explainBoard')}
            </button>
          </div>
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
              {busy && !checking && !explaining ? <SpinnerIcon className="h-4 w-4" /> : t('send')}
            </button>
          </div>
        </div>
      }
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-xs text-slate-500">{t('coachHint')}</p>
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
              className={`min-w-0 max-w-[92%] rounded-2xl px-3 py-2 ${
                m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800 ring-1 ring-slate-100'
              }`}
            >
              {m.role === 'user' ? (
                <span className="whitespace-pre-wrap text-sm">{m.content}</span>
              ) : (
                <>
                  {m.check ? <CheckVerdict meta={m.check} t={t} /> : null}
                  <Markdown text={m.content} />
                  <div className="mt-1.5 flex">
                    <button
                      type="button"
                      onClick={() => void saveNote(i, m.content)}
                      disabled={noteIdx !== null}
                      title={t('saveAsNote')}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-800 disabled:opacity-40"
                    >
                      {noteIdx === i ? <SpinnerIcon className="h-3.5 w-3.5" /> : <NotesIcon className="h-3.5 w-3.5" />}
                      {t('saveAsNote')}
                    </button>
                  </div>
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
            ★ {t('savedToMindmap', { n: savedCount })}
          </div>
        ) : null}
        {error ? <ErrorNote>{errorMessage(error, t)}</ErrorNote> : null}
        <div ref={bottomRef} />
      </div>
    </Panel>
  );
}
