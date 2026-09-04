import { useEffect, useMemo, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import { ChevronLeft, ChevronRight } from '../icons';
import { useUI, type Subject } from '../../lib/ui';
import { useReview, keyOf, statusOf, daysUntil, startOfDay, type ReviewStatus } from '../../lib/review';
import { buildPlan, countOf, parseDate, type PlanItem } from '../../lib/plan';
import { TREES, loadNotes, findSubtopic } from '../../data/notes';
import type { SubjectNotes } from '../../data/notes/types';
import NoteReader from '../NoteReader';
import { usePractice } from '../../lib/practice';
import { useT } from '../../i18n';

const LOCALE: Record<string, string> = { en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', tr: 'tr-TR' };
const DAY = 86_400_000;
const PLAN_SUBJECTS: Subject[] = ['physics', 'chemistry', 'biology'];

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
  const planSubjects = useReview((s) => s.planSubjects);
  const togglePlanSubject = useReview((s) => s.togglePlanSubject);
  const nameLang = lang === 'ja' ? 'ja' : 'en';
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(LOCALE[lang] ?? 'en-US', o);

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [reading, setReading] = useState<{ subject: Subject; id: string } | null>(null);
  const [notes, setNotes] = useState<SubjectNotes | null>(null);
  const now = Date.now();
  const today = startOfDay(now);
  const [selected, setSelected] = useState<number>(today);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

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

  const days = daysUntil(examDate, now);
  const exam = parseDate(examDate);
  const plan = useMemo(() => buildPlan({ subjects: planSubjects, reviews, examDate, now }), [planSubjects, reviews, examDate, now]);

  // Days on which something was reviewed, for the calendar dots.
  const reviewedDays = useMemo(() => {
    const set = new Set<number>();
    for (const e of Object.values(reviews)) if (e.last) set.add(startOfDay(e.last));
    return set;
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
  const monthLabel = fmt({ year: 'numeric', month: 'long' }).format(month);
  const weekdays = useMemo(() => {
    const f = fmt({ weekday: 'narrow' });
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 8, 1 + i))); // 2024-09-01 is a Sunday
  }, [lang]);

  const selectedItems: PlanItem[] = plan.get(selected) ?? [];
  const selectedLabel = fmt({ weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(selected));
  const openItem = (it: PlanItem) => {
    if (it.kind === 'revision') {
      useUI.getState().setSubject(it.subject);
      useUI.getState().openPanel('exams');
      return;
    }
    setReading({ subject: it.subject, id: it.id });
  };

  return (
    <Panel title={t('plan')}>
      {/* Countdown */}
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white">
        <div className="text-3xl font-bold leading-none tabular-nums">{days >= 0 ? days : 0}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{days >= 0 ? t('daysLeft') : t('examPassed')}</div>
          <div className="text-[11px] text-slate-300">
            {t('examDay')} · {fmt({ month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(exam))}
          </div>
        </div>
        <label className="relative grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white" title={t('examDay')}>
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} aria-label={t('examDay')} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
      </div>

      {/* Which subjects the plan covers */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5 px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('planCovers')}</span>
        {PLAN_SUBJECTS.map((s) => {
          const on = planSubjects.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => togglePlanSubject(s)}
              aria-pressed={on}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 transition ${
                on ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {t(s)}
            </button>
          );
        })}
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
        <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
          {weekdays.map((w, i) => (
            <div key={i} className="font-semibold text-slate-400">
              {w}
            </div>
          ))}
          {grid.map((d, i) => {
            if (!d) return <div key={i} />;
            const ts = new Date(month.getFullYear(), month.getMonth(), d).getTime();
            const isToday = ts === today;
            const isExam = ts === exam;
            const isSel = ts === selected;
            const past = ts < today;
            const items = plan.get(ts);
            const nNew = countOf(items, 'new');
            const nRev = countOf(items, 'review');
            const revision = countOf(items, 'revision') > 0;
            const reviewed = reviewedDays.has(ts);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(ts)}
                aria-pressed={isSel}
                className={`flex h-12 flex-col items-center rounded-xl border pt-1 transition ${
                  isExam
                    ? 'border-red-600 bg-red-600 text-white'
                    : isSel
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : isToday
                        ? 'border-slate-400 bg-white'
                        : past
                          ? 'border-transparent bg-slate-50 text-slate-400'
                          : revision
                            ? 'border-rose-100 bg-rose-50 hover:border-rose-300'
                            : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <span className={`text-xs leading-none ${isToday && !isSel ? 'font-bold' : ''}`}>{d}</span>
                <span className="mt-1 flex items-center gap-0.5">
                  {reviewed ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> : null}
                  {nNew ? <span className={`rounded px-1 text-[9px] font-bold leading-4 ${isSel ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'}`}>{nNew}</span> : null}
                  {nRev ? <span className={`rounded px-1 text-[9px] font-bold leading-4 ${isSel ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>{nRev}</span> : null}
                  {revision && !nNew && !nRev ? <span className={`text-[9px] font-bold leading-4 ${isSel ? 'text-white' : 'text-rose-600'}`}>R</span> : null}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1"><span className="rounded bg-sky-100 px-1 font-bold text-sky-800">n</span> {t('kindNew')}</span>
          <span className="inline-flex items-center gap-1"><span className="rounded bg-amber-100 px-1 font-bold text-amber-800">n</span> {t('kindReview')}</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {t('legendReviewed')}</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-600" /> {t('examDay')}</span>
        </div>
      </div>

      {/* Selected day */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between px-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{selected === today ? t('todayPlan') : selectedLabel}</div>
          <div className="text-[11px] text-slate-400">
            {countOf(selectedItems, 'new')} {t('kindNew').toLowerCase()} · {countOf(selectedItems, 'review')} {t('kindReview').toLowerCase()}
          </div>
        </div>
        {selectedItems.length ? (
          <div className="space-y-1">
            {[...selectedItems]
              .sort((a, b) => ['revision', 'review', 'new'].indexOf(a.kind) - ['revision', 'review', 'new'].indexOf(b.kind))
              .map((it, i) => {
                if (it.kind === 'revision')
                  return (
                    <button key={`rv${i}`} type="button" onClick={() => openItem(it)} className="flex w-full items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-left text-sm hover:bg-rose-100">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-rose-400" />
                      <span className="min-w-0 flex-1 text-slate-800">{t('revisionDay')}</span>
                    </button>
                  );
                const f = findSubtopic(it.subject, it.id);
                if (!f) return null;
                const isNew = it.kind === 'new';
                return (
                  <button
                    key={`${it.kind}:${it.subject}:${it.id}`}
                    type="button"
                    onClick={() => openItem(it)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${isNew ? 'bg-sky-50 hover:bg-sky-100' : 'bg-amber-50 hover:bg-amber-100'}`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${isNew ? 'bg-sky-400' : 'bg-amber-400'}`} />
                    <span className="min-w-0 flex-1 truncate text-slate-800">{f.sub.name[nameLang]}</span>
                    <span className="shrink-0 text-[11px] text-slate-500">{t(it.subject)}</span>
                    <span className={`shrink-0 rounded px-1 text-[10px] font-semibold ${isNew ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>{isNew ? t('kindNew') : t('kindReview')}</span>
                  </button>
                );
              })}
          </div>
        ) : (
          <p className="px-1 text-sm text-slate-500">{t('nothingPlanned')}</p>
        )}
        <p className="mt-1.5 px-1 text-[11px] text-slate-400">{t('planHintShort')}</p>
      </div>

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
        <div className="space-y-2">
          {tree.map((tp) => {
            const isOpen = open[tp.id] ?? true;
            const tpDone = tp.subtopics.filter((s) => reviews[keyOf(subject, s.id)]).length;
            return (
              <div key={tp.id} className="rounded-2xl border border-slate-200">
                <button type="button" onClick={() => toggle(tp.id)} aria-expanded={isOpen} className="flex w-full items-center gap-2 px-3 py-2 text-left">
                  <ChevronRight className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-90' : ''}`} />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">{tp.name[nameLang]}</span>
                  <span className="text-[11px] tabular-nums text-slate-400">
                    {tpDone}/{tp.subtopics.length}
                  </span>
                </button>
                {isOpen ? (
                  <div className="border-t border-slate-100 py-1">
                    {tp.subtopics.map((s) => {
                      const st = statusOf(reviews[keyOf(subject, s.id)], now);
                      const hasNote = Boolean(notes?.notes[s.id]);
                      return (
                        <button key={s.id} type="button" onClick={() => setReading({ subject, id: s.id })} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-slate-50">
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
