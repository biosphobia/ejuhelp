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

  return (
    <Panel title={t('plan')}>
      {/* Countdown */}
      <div className="mb-3 rounded-2xl bg-slate-900 p-4 text-white">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">{t('examDay')}</div>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div>
            <div className="text-4xl font-bold leading-none">{days >= 0 ? days : 0}</div>
            <div className="mt-1 text-sm text-slate-200">{days >= 0 ? t('daysLeft') : t('examPassed')}</div>
          </div>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            aria-label={t('examDay')}
            className="rounded-lg bg-white/10 px-2 py-1 text-sm text-white outline-none ring-1 ring-white/20 focus:ring-white/60 [color-scheme:dark]"
          />
        </div>
        <div className="mt-3 text-sm">
          {due.length ? (
            <span className="rounded-full bg-amber-400/20 px-2.5 py-1 font-medium text-amber-200">⏰ {t('dueCount', { n: due.length })}</span>
          ) : (
            <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 font-medium text-emerald-200">✓ {t('nothingDue')}</span>
          )}
        </div>
      </div>

      {/* Month grid */}
      <div className="mb-3 rounded-2xl border border-slate-200 p-3">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" aria-label="previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-lg p-1 hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-semibold text-slate-800">{monthLabel}</div>
          <button type="button" aria-label="next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-lg p-1 hover:bg-slate-100">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
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
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs ${
                    isExam ? 'bg-red-600 font-bold text-white' : isToday ? 'bg-slate-900 font-bold text-white' : 'text-slate-700'
                  }`}
                  title={isExam ? t('examDay') : undefined}
                >
                  {d}
                </div>
                <div className="flex h-1.5 gap-0.5">
                  {reviewed ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> : null}
                  {nDue && ts >= startOfDay(now) ? <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-600" /> {t('examDay')}</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {t('legendReviewed')}</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> {t('legendDue')}</span>
        </div>
      </div>

      {/* Due list */}
      {due.length ? (
        <div className="mb-3">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('dueForReview')}</div>
          <div className="space-y-1">
            {due.slice(0, 8).map((d) => {
              const f = findSubtopic(d.subject, d.id)!;
              return (
                <button
                  key={`${d.subject}:${d.id}`}
                  type="button"
                  onClick={() => setReading(d)}
                  className="flex w-full items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-left text-sm ring-1 ring-amber-100 hover:bg-amber-100"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <span className="min-w-0 flex-1 truncate text-slate-800">{f.sub.name[nameLang]}</span>
                  <span className="shrink-0 text-[11px] text-slate-400">{t(d.subject)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Topic tree */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('topicTree')}</div>
        {total ? (
          <div className="text-[11px] text-slate-400">
            {doneCount}/{total}
          </div>
        ) : null}
      </div>
      <SubjectChips />
      <p className="mb-2 text-xs text-slate-500">{t('planHint')}</p>
      {tree.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500 ring-1 ring-slate-100">{t('notesComingSoon')}</p>
      ) : (
        <div className="space-y-2">
          {tree.map((tp) => {
            const isOpen = open[tp.id] ?? true;
            const tpDone = tp.subtopics.filter((s) => reviews[keyOf(subject, s.id)]).length;
            return (
              <div key={tp.id} className="rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => toggle(tp.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left"
                >
                  <ChevronRight className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-90' : ''}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">{tp.name[nameLang]}</span>
                  <span className="text-[11px] text-slate-400">
                    {tpDone}/{tp.subtopics.length}
                  </span>
                </button>
                {isOpen ? (
                  <div className="border-t border-slate-100 py-1">
                    {tp.subtopics.map((s) => {
                      const st = statusOf(reviews[keyOf(subject, s.id)], now);
                      const hasNote = Boolean(notes?.notes[s.id]);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setReading({ subject, id: s.id })}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-slate-50"
                        >
                          <span className={`ml-5 h-2 w-2 shrink-0 rounded-full ${DOT[st]}`} aria-label={t(st === 'new' ? 'statusNew' : st === 'due' ? 'statusDue' : 'statusOk')} />
                          <span className={`min-w-0 flex-1 truncate ${hasNote || !notes ? 'text-slate-800' : 'text-slate-400'}`}>{s.name[nameLang]}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
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
