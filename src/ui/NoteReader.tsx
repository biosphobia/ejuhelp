import { useEffect, useMemo, useRef, useState } from 'react';
import Markdown, { Inline } from './Markdown';
import { CloseIcon, ChevronLeft, ChevronRight, AskIcon, GenerateIcon, CheckIcon, SpinnerIcon } from './icons';
import { useUI, type Subject } from '../lib/ui';
import { useReview, keyOf, statusOf, INTERVALS_DAYS } from '../lib/review';
import { useAsk } from '../lib/ask';
import { usePractice } from '../lib/practice';
import { useKeyPoints } from '../lib/userdata';
import { TREES, loadNotes, findSubtopic } from '../data/notes';
import type { Note, SubjectNotes } from '../data/notes/types';
import { useT } from '../i18n';

const LOCALE: Record<string, string> = { en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', tr: 'tr-TR' };

/** Full-screen reader for one subtopic's study note, with review + coach follow-ups. */
export default function NoteReader({
  subject,
  id,
  onNavigate,
  onClose,
}: {
  subject: Subject;
  id: string;
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const lang = useUI((s) => s.lang);
  const setSubject = useUI((s) => s.setSubject);
  const openPanel = useUI((s) => s.openPanel);
  const send = useAsk((s) => s.send);
  const setWantTopic = usePractice((s) => s.setWantTopic);
  const reviews = useReview((s) => s.reviews);
  const markReviewed = useReview((s) => s.markReviewed);
  const keyPoints = useKeyPoints((s) => s.items);
  const L: 'en' | 'ja' = lang === 'ja' ? 'ja' : 'en';

  const [data, setData] = useState<SubjectNotes | null | undefined>(undefined);
  const [own, setOwn] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    loadNotes(subject).then((n) => alive && setData(n));
    return () => {
      alive = false;
    };
  }, [subject]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [id]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const found = findSubtopic(subject, id);
  const note: Note | undefined = data?.notes[id];
  const flat = useMemo(() => TREES[subject].flatMap((tp) => tp.subtopics.map((s) => s.id)), [subject]);
  const idx = flat.indexOf(id);
  const prevId = idx > 0 ? flat[idx - 1] : null;
  const nextId = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  const entry = reviews[keyOf(subject, id)];
  const status = statusOf(entry);
  const fmt = (ms: number) => new Intl.DateTimeFormat(LOCALE[lang] ?? 'en-US', { month: 'short', day: 'numeric' }).format(new Date(ms));
  const nextGap = INTERVALS_DAYS[Math.min(entry?.count ?? 0, INTERVALS_DAYS.length - 1)];

  const title = found?.sub.name[L] ?? id;
  const crumb = found ? `${t(subject)} › ${found.topic.name[L]}` : t(subject);

  // The student's own saved key points that look related to this subtopic.
  const mine = useMemo(() => {
    if (!found) return [];
    const words = [found.sub.name.en, found.topic.name.en]
      .flatMap((s) => s.toLowerCase().split(/[^a-z0-9]+/))
      .filter((w) => w.length > 3);
    return keyPoints
      .filter((k) => k.subject === subject)
      .filter((k) => {
        if (k.topic === id) return true; // saved from a coach reply on exactly this note
        const hay = `${k.topic ?? ''} ${k.text}`.toLowerCase();
        return words.some((w) => hay.includes(w));
      })
      .slice(0, 8);
  }, [keyPoints, found, subject]);

  const notesContext = note ? `${title}\n\n${note.core[L]}\n\n${note.body[L]}` : title;

  const ask = (q: string) => {
    const text = q.trim();
    if (!text) return;
    setSubject(subject);
    onClose();
    openPanel('ask');
    void send(text, { notes: notesContext });
  };
  const practice = () => {
    setSubject(subject);
    setWantTopic(id);
    onClose();
    openPanel('generate');
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="selectable pointer-events-auto fixed inset-0 z-50 flex flex-col bg-white safe-pad-top">
      <header className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 sm:px-4">
        <button type="button" onClick={onClose} className="inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
          <ChevronLeft className="h-4 w-4" /> {t('plan')}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] text-slate-400">{crumb}</div>
          <h2 className="truncate text-base font-semibold text-slate-900">{title}</h2>
        </div>
        <button type="button" disabled={!prevId} onClick={() => prevId && onNavigate(prevId)} aria-label={t('prevTopic')} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30">
          <ChevronLeft />
        </button>
        <button type="button" disabled={!nextId} onClick={() => nextId && onNavigate(nextId)} aria-label={t('nextTopic')} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30">
          <ChevronRight />
        </button>
        <button type="button" aria-label={t('close')} onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
          <CloseIcon />
        </button>
      </header>

      <div ref={bodyRef} className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {/* Review status */}
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <span className={`h-2.5 w-2.5 rounded-full ${status === 'new' ? 'bg-slate-300' : status === 'due' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            <span className="min-w-0 flex-1 text-sm text-slate-700">
              {entry
                ? t('reviewedInfo', { n: entry.count, next: fmt(entry.due) })
                : t('statusNew')}
            </span>
            <button
              type="button"
              onClick={() => markReviewed(subject, id)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <CheckIcon className="h-4 w-4" /> {t('markReviewed')}
            </button>
            <span className="w-full text-[11px] text-slate-400 sm:w-auto">{t('nextIn', { d: nextGap })}</span>
          </div>

          {lang !== 'en' && lang !== 'ja' ? <p className="mb-3 text-xs text-slate-500">{t('ptContentLang')}</p> : null}

          {data === undefined ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
              <SpinnerIcon className="h-4 w-4" /> {t('loading')}
            </div>
          ) : !note ? (
            <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500 ring-1 ring-slate-100">{t('notesComingSoon')}</p>
          ) : (
            <>
              {/* Core idea */}
              <div className="mb-4 rounded-2xl bg-slate-900 p-4 text-white">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">{t('coreIdea')}</div>
                <div className="text-[15px] leading-relaxed">
                  <Inline text={note.core[L]} />
                </div>
              </div>

              <Markdown text={note.body[L]} />

              {/* Exam patterns */}
              <section className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-700">🎯 {t('howEjuAsks')}</div>
                <ul className="space-y-1.5 text-sm leading-relaxed text-slate-800">
                  {note.exam[L].map((x, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-indigo-400">•</span>
                      <span className="min-w-0 flex-1"><Inline text={x} /></span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Traps */}
              <section className="mt-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">⚠ {t('traps')}</div>
                <ul className="space-y-1.5 text-sm leading-relaxed text-slate-800">
                  {note.traps[L].map((x, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-500">•</span>
                      <span className="min-w-0 flex-1"><Inline text={x} /></span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {/* Own key points */}
          {mine.length ? (
            <section className="mt-3 rounded-2xl border border-slate-200 p-4">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">★ {t('yourKeyPoints')}</div>
              <ul className="space-y-1.5 text-sm text-slate-800">
                {mine.map((k) => (
                  <li key={k.id} className="flex gap-2">
                    <span className={`mt-0.5 shrink-0 rounded-md px-1.5 text-[10px] font-bold uppercase ${k.kind === 'formula' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-700'}`}>
                      {k.kind === 'formula' ? t('kindFormula') : t('kindFact')}
                    </span>
                    <span className="min-w-0 flex-1"><Inline text={k.text} /></span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Follow-ups */}
          <section className="mt-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <AskIcon className="h-4 w-4" /> {t('followUps')}
            </div>
            {note ? (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {note.followups[L].map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => ask(q)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-sm text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <textarea
                value={own}
                onChange={(e) => setOwn(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    ask(own);
                  }
                }}
                rows={2}
                placeholder={t('askOwn')}
                className="thin-scroll max-h-32 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
              <button
                type="button"
                onClick={() => ask(own)}
                disabled={!own.trim()}
                className="grid h-10 shrink-0 place-items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                {t('send')}
              </button>
            </div>
          </section>

          <button
            type="button"
            onClick={practice}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <GenerateIcon className="h-4 w-4" /> {t('practiceTopic')}
          </button>

          <div className="mt-6 flex justify-between">
            <button type="button" disabled={!prevId} onClick={() => prevId && onNavigate(prevId)} className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" /> {prevId ? findSubtopic(subject, prevId)?.sub.name[L] : ''}
            </button>
            <button type="button" disabled={!nextId} onClick={() => nextId && onNavigate(nextId)} className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30">
              {nextId ? findSubtopic(subject, nextId)?.sub.name[L] : ''} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
