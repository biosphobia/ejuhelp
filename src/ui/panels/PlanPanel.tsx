import { useEffect, useMemo, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import { ChevronLeft, ChevronRight } from '../icons';
import { useUI, type Subject } from '../../lib/ui';
import { useReview, keyOf, statusOf, daysUntil, startOfDay, type ReviewStatus } from '../../lib/review';
import { TREES, loadNotes, findSubtopic } from '../../data/notes';
import type { SubjectNotes } from '../../data/notes/types';
import NoteReader from '../NoteReader';
import { usePractice } from '../../lib/practice';
import { useT } from '../../i18n';

const LOCALE: Record<string, string> = { en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', tr: 'tr-TR' };
const DAY = 86_400_000;

const DOT: Record<ReviewStatus, string> = {
  new: 'bg-slate-300',
  due: 'bg-amber-400',
  ok: 'bg-emerald-500',
};

export default function PlanPanel() {
  const t = useT();
  const lang = useUI((s) => s.lang);
  const subject = useUI((s) => s.subject);
  const reviews = useReview((s) => s.reviews);
  const examDate = useReview((s) => s.examDate);
  const setExamDate = useReview((s) => s.setExamDate);
  const nameLang = lang === 'ja' ? 'ja' : 'en';

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [reading, setReading] = useState<{ subject: Subject; id: string } | null>(null);
  const [notes, setNotes] = useState<SubjectNotes | null>(null);
  const [showCal, setShowCal] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // A question card asked to open a specific note.
  const wantNote = usePractice((s) => s.wantNote);
  useEffect(() => {
    if (!wantNote) return;
    setReading(wantNote);
    usePractice.getState().setWantNote(null);
  }, [wantNote]);

  useEffect(() => {
    let alive = true;
    setNotes(null);
    loadNotes(subject).then((n) => alive && setNotes(n));
    return () => {
      alive = false;
    };
  }, [subject]);

  const now = Date.now();
  const days = daysUntil(examDate, now);

  // Everything due (across subjects), for the calendar summary.
  const due = useMemo(() => {
    const out: { subject: Subject; id: string }[] = [];
    for (const [k, e] of Object.entries(reviews)) {
      if (e.due <= now) {
        const [s, id] = k.split(':') as [Subject, string];
        if (findSubtopic(s, id)) out.push({ subject: s, id });
      }
    }
    return out;
  }, [reviews, now]);

  // Days on which something was reviewed, for the calendar dots.
  const reviewedDays = useMemo(() => {
    const set = new Set<number>();
    for (const e of Object.values(reviews)) set.add(startOfDay(e.last));
    return set;
  }, [reviews]);
  const dueDays = useMemo(() => {
    const m = new Map<number, number>();
    for (const e of Object.values(reviews)) m.set(e.due, (m.get(e.due) ?? 0) + 1);
    return m;
  }, [reviews]);

  const tree = TREES[subject];
  const total = tree.reduce((n, tp) => n + tp.subtopics.length, 0);
  const doneCount = tree.reduce((n, tp) => n + tp.subtopics.filter((s) => reviews[keyOf(subject, s.id)]).length, 0);

  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !(o[id] ?? true) }));

  // Today's plan: the due reviews plus enough new topics (in tree order) to start
  // every topic of this subject with a week left for pure revision.
  const unstudied = useMemo(
    () => tree.flatMap((tp) => tp.subtopics.filter((s) => !reviews[keyOf(subject, s.id)]).map((s) => s.id)),
    [tree, reviews, subject]
  );
  const perDay = days > 7 ? Math.ceil(unstudied.length / (days - 7)) : unstudied.length;
  const todayNew = unstudied.slice(0, Math.min(Math.max(perDay, 1), 4));

  // ── Calendar grid ──
  const grid = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month]);
  const [ey, em, ed] = examDate.split('-').map(Number);
  const today = new Date();
  const monthLabel = new Intl.DateTimeFormat(LOCALE[lang] ?? 'en-US', { year: 'numeric', month: 'long' }).format(month);
  const weekdays = useMemo(() => {
    const f = new Intl.DateTimeFormat(LOCALE[lang] ?? 'en-US', { weekday: 'narrow' });
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 8, 1 + i))); // 2024-09-01 is a Sunday
  }, [lang]);

  const examLabel = new Intl.DateTimeFormat(LOCALE[lang] ?? 'en-US', { month: 'short', day: 'numeric' }).format(new Date(ey, em - 1, ed));

  return (
    <Panel title={t('plan')}>
      {/* Countdown strip */}
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white">
        <div className="text-3xl font-bold leading-none tabular-nums">{days >= 0 ? days : 0}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{days >= 0 ? t('daysLeft') : t('examPassed')}</div>
          <div className="text-[11px] text-slate-300">
            {t('examDay')} · {examLabel}
            {due.length ? <span className="ml-2 rounded-full bg-amber-400/20 px-1.5 py-0.5 font-medium text-amber-200">⏰ {due.length}</span> : null}
          </div>
        </div>
        <label className="relative grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white" title={t('examDay')}>
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} aria-label={t('examDay')} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
      </div>

      {/* Today */}
      {tree.length ? (
        <section className="mb-3">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('todayPlan')}</div>
            <div className="text-[11px] text-slate-400">{t(subject)}</div>
          </div>
          <div className="space-y-1">
            {due.slice(0, 6).map((d) => {
              const f = findSubtopic(d.subject, d.id)!;
              return (
                <button
                  key={`${d.subject}:${d.id}`}
                  type="button"
                  onClick={() => setReading(d)}
                  className="flex w-full items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-left text-sm hover:bg-amber-100"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <span className="min-w-0 flex-1 truncate text-slate-800">{f.sub.name[nameLang]}</span>
                  <span className="shrink-0 text-[11px] text-amber-700">{t('dueForReview')}</span>
                </button>
              );
            })}
            {unstudied.length
              ? todayNew.map((id) => {
                  const f = findSubtopic(subject, id)!;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setReading({ subject, id })}
                      className="flex w-full items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-left text-sm hover:bg-sky-100"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-sky-400" />
                      <span className="min-w-0 flex-1 truncate text-slate-800">{f.sub.name[nameLang]}</span>
                      <span className="shrink-0 text-[11px] text-sky-700">{t('newToday')}</span>
                    </button>
                  );
                })
              : null}
          </div>
          <p className="mt-1.5 px-1 text-[11px] text-slate-400">
            {unstudied.length ? (
              <>
                {t('topicsLeft', { n: unstudied.length, total })} {days > 7 ? t('paceHint', { s: t(subject), n: perDay }) : null}
              </>
            ) : (
              t('allStarted')
            )}
          </p>
        </section>
      ) : null}

      {/* Month grid (collapsed by default) */}
      <section className="mb-3 rounded-2xl border border-slate-100">
        <button
          type="button"
          onClick={() => setShowCal((v) => !v)}
          aria-expanded={showCal}
          className="flex w-full items-center gap-2 px-3 py-2 text-left"
        >
          <ChevronRight className={`h-4 w-4 shrink-0 text-slate-400 transition ${showCal ? 'rotate-90' : ''}`} />
          <span className="min-w-0 flex-1 text-sm font-medium text-slate-700">{t('calendar')}</span>
          <span className="text-[11px] text-slate-400">{monthLabel}</span>
        </button>
        {showCal ? (
          <div className="border-t border-slate-100 px-3 pb-3 pt-2">
            <div className="mb-1 flex items-center justify-between">
              <button type="button" aria-label="previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-sm font-semibold text-slate-800">{monthLabel}</div>
              <button type="button" aria-label="next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-0.5 text-center text-[11px]">
              {weekdays.map((w, i) => (
                <div key={i} className="font-semibold text-slate-400">
                  {w}
                </div>
              ))}
              {grid.map((d, i) => {
                if (!d) return <div key={i} />;
                const isToday = d === today.getDate() && month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear();
                const isExam = d === ed && month.getMonth() === em - 1 && month.getFullYear() === ey;
                const ts = new Date(month.getFullYear(), month.getMonth(), d).getTime();
                const reviewed = reviewedDays.has(ts);
                const nDue = dueDays.get(ts) ?? 0;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                        isExam ? 'bg-red-600 font-bold text-white' : isToday ? 'bg-slate-900 font-bold text-white' : 'text-slate-700'
                      }`}
                      title={isExam ? t('examDay') : undefined}
                    >
                      {d}
                    </div>
                    <div className="flex h-1.5 gap-0.5">
                      {reviewed ? <span className="h-1 w-1 rounded-full bg-emerald-500" /> : null}
                      {nDue && ts >= startOfDay(now) ? <span className="h-1 w-1 rounded-full bg-amber-400" /> : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-600" /> {t('examDay')}</span>
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t('legendReviewed')}</span>
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> {t('legendDue')}</span>
            </div>
          </div>
        ) : null}
      </section>

      {/* Topic tree */}
      <div className="mb-1.5 flex items-center justify-between px-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('topicTree')}</div>
        {total ? (
          <div className="text-[11px] text-slate-400">
            {doneCount}/{total}
          </div>
        ) : null}
      </div>
      <SubjectChips />
      {tree.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">{t('notesComingSoon')}</p>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
          {tree.map((tp) => {
            const isOpen = open[tp.id] ?? true;
            const tpDone = tp.subtopics.filter((s) => reviews[keyOf(subject, s.id)]).length;
            return (
              <div key={tp.id}>
                <button
                  type="button"
                  onClick={() => toggle(tp.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
                >
                  <ChevronRight className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-90' : ''}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">{tp.name[nameLang]}</span>
                  <span className="text-[11px] tabular-nums text-slate-400">
                    {tpDone}/{tp.subtopics.length}
                  </span>
                </button>
                {isOpen ? (
                  <div className="pb-1">
                    {tp.subtopics.map((s) => {
                      const st = statusOf(reviews[keyOf(subject, s.id)], now);
                      const hasNote = Boolean(notes?.notes[s.id]);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setReading({ subject, id: s.id })}
                          className="flex w-full items-center gap-2 py-1.5 pl-9 pr-3 text-left text-sm hover:bg-slate-50"
                        >
                          <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[st]}`} aria-label={t(st === 'new' ? 'statusNew' : st === 'due' ? 'statusDue' : 'statusOk')} />
                          <span className={`min-w-0 flex-1 truncate ${hasNote || !notes ? 'text-slate-700' : 'text-slate-400'}`}>{s.name[nameLang]}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {reading ? (
        <NoteReader
          subject={reading.subject}
          id={reading.id}
          onNavigate={(id) => setReading({ subject: reading.subject, id })}
          onClose={() => setReading(null)}
        />
      ) : null}
    </Panel>
  );
}
