import { useEffect, useMemo, useState } from 'react';
import { useUI, type Subject } from '../lib/ui';
import { useStudyMap, attemptsForNode, nodeStat, LEVEL_COLOR, type NodeStat } from '../lib/studymap';
import { useGenerated } from '../lib/generated';
import { learnerProfileLines } from '../lib/profile';
import { learnerSnapshotLines } from '../lib/userdata';
import { askClaude, type ChatMessage } from '../lib/api';
import Markdown from '../ui/Markdown';
import { CloseIcon, SpinnerIcon, ResetIcon } from '../ui/icons';

type Tab = 'summary' | 'history' | 'read' | 'ask';

const LEVEL_LABEL: Record<string, string> = { none: 'Not started', weak: 'Weak', improving: 'Improving', strong: 'Strong' };

/** The detail view for one Mindmap node (a topic or subtopic): an EJU study sheet, the
 *  student's own solved-question history, the coach's strength/weakness read, and a
 *  topic-scoped chat — plus a jump to practice this topic. */
export default function NodeDetail({
  subject,
  nodeId,
  label,
  isTopic,
  subIds,
  onClose,
}: {
  subject: Subject;
  nodeId: string;
  label: string;
  isTopic: boolean;
  subIds: string[];
  onClose: () => void;
}) {
  const lang = useUI((s) => s.lang);
  const setMode = useUI((s) => s.setMode);
  const openPanel = useUI((s) => s.openPanel);
  const setSubject = useUI((s) => s.setSubject);
  const setSelected = useGenerated((s) => s.setSelected);

  const studySheet = useStudyMap((s) => s.studySheet);
  const masteryRead = useStudyMap((s) => s.masteryRead);
  const sheet = useStudyMap((s) => s.sheets[`${subject}:${nodeId}`]);
  const read = useStudyMap((s) => s.reads[`${subject}:${nodeId}`]);
  const sheetBusy = useStudyMap((s) => s.busy[`sheet:${subject}:${nodeId}`]);
  const readBusy = useStudyMap((s) => s.busy[`read:${subject}:${nodeId}`]);

  const [tab, setTab] = useState<Tab>('summary');
  const history = useMemo(() => attemptsForNode(subject, nodeId).slice().reverse(), [subject, nodeId]);
  const stat = nodeStat(subject, nodeId);

  useEffect(() => {
    void studySheet(subject, nodeId);
    void masteryRead(subject, nodeId);
  }, [subject, nodeId, studySheet, masteryRead]);

  const practice = () => {
    setSubject(subject);
    setSelected(subject, isTopic ? (subIds.length ? subIds : [nodeId]) : [nodeId]);
    setMode('board');
    openPanel('generate');
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'summary', label: 'Study sheet' },
    { id: 'history', label: `Your work${history.length ? ` (${history.length})` : ''}` },
    { id: 'read', label: "Coach's read" },
    { id: 'ask', label: 'Ask coach' },
  ];

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-stretch justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-slate-900 text-slate-100 shadow-2xl ring-1 ring-white/10 sm:max-h-[90vh] sm:rounded-2xl">
        {/* header */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${LEVEL_COLOR[stat.level]}`}>
            {LEVEL_LABEL[stat.level]}
            {stat.total ? ` · ${stat.correct}/${stat.total}` : ''}
          </span>
          <h2 className="min-w-0 flex-1 truncate text-base font-bold">{label}</h2>
          <button type="button" onClick={onClose} aria-label="close" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-white/10 px-2 py-2 text-sm">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              type="button"
              onClick={() => setTab(tb.id)}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${tab === tb.id ? 'bg-white/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {/* body */}
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {tab === 'summary' && (
            <Section busy={!!sheetBusy && !sheet?.text} onRefresh={() => void studySheet(subject, nodeId, true)} refreshing={!!sheetBusy}>
              {sheet?.text ? (
                <Markdown text={sheet.text} className="prose-invert text-sm leading-relaxed" />
              ) : !sheetBusy ? (
                <Empty>Loading the study sheet…</Empty>
              ) : null}
            </Section>
          )}

          {tab === 'history' &&
            (history.length ? (
              <div className="space-y-3">
                {history.map((a) => (
                  <div key={a.id} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${a.correct ? 'bg-emerald-500/25 text-emerald-200' : 'bg-rose-500/25 text-rose-200'}`}>
                        {a.correct ? 'Correct' : 'Wrong'}
                      </span>
                      {a.errorTags?.length ? <span className="text-[11px] text-slate-400">{a.errorTags.join(', ')}</span> : null}
                      <span className="ml-auto text-[11px] text-slate-500">{new Date(a.ts).toLocaleDateString()}</span>
                    </div>
                    {a.prompt ? <Markdown text={a.prompt} className="text-xs leading-relaxed text-slate-200" /> : null}
                    {a.reasoning ? (
                      <p className="mt-1 border-l-2 border-white/15 pl-2 text-xs italic leading-relaxed text-slate-400">{a.reasoning}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <Empty>No solved questions on this topic yet. Solve some on the whiteboard and they'll appear here.</Empty>
            ))}

          {tab === 'read' && (
            <Section busy={!!readBusy && !read?.text} onRefresh={() => void masteryRead(subject, nodeId, true)} refreshing={!!readBusy}>
              {read?.text ? (
                <Markdown text={read.text} className="prose-invert text-sm leading-relaxed" />
              ) : (
                <Empty>Not enough data yet — solve a few questions on this topic and the coach will read your strengths and weak points here.</Empty>
              )}
            </Section>
          )}

          {tab === 'ask' && <AskTab subject={subject} label={label} context={sheet?.text} read={read?.text} stat={stat} />}
        </div>

        {/* footer */}
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={practice}
            className="w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-400"
          >
            Practice this topic →
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ children, busy, onRefresh, refreshing }: { children: React.ReactNode; busy: boolean; onRefresh: () => void; refreshing: boolean }) {
  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button type="button" onClick={onRefresh} disabled={refreshing} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-400 hover:bg-white/5 hover:text-slate-200 disabled:opacity-50">
          {refreshing ? <SpinnerIcon className="h-3 w-3" /> : <ResetIcon className="h-3 w-3" />} Refresh
        </button>
      </div>
      {busy ? (
        <div className="grid place-items-center py-10 text-slate-400">
          <SpinnerIcon className="h-5 w-5" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm italic text-slate-500">{children}</p>;
}

function AskTab({ subject, label, context, read, stat }: { subject: Subject; label: string; context?: string; read?: string; stat: NodeStat }) {
  const lang = useUI((s) => s.lang);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const lvl =
        stat.total > 0 ? `On THIS topic the student is "${stat.level}" (${stat.correct}/${stat.total} correct) — tune your depth to that.` : '';
      const ctx =
        `The student is studying the EJU ${subject} topic "${label}". ${lvl}` +
        (read ? `\n\nThe coach's read of this student on this topic:\n${read.slice(0, 800)}` : '') +
        (context ? `\n\nStudy sheet for reference:\n${context.slice(0, 1800)}` : '');
      const profile = [...learnerProfileLines(), ...learnerSnapshotLines(subject)];
      const res = await askClaude({ subject, lang, messages: next, context: ctx, profile });
      setMessages([...next, { role: 'assistant', content: res.text }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Sorry — something went wrong. Please try again.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[40vh] flex-col">
      <div className="flex-1 space-y-3">
        {messages.length === 0 ? (
          <Empty>Ask the coach anything about {label} — for a concept, a worked example, or how the EJU tests it.</Empty>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
              <div className={`inline-block max-w-[90%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-100'}`}>
                <Markdown text={m.content} className="prose-invert" />
              </div>
            </div>
          ))
        )}
        {busy ? <SpinnerIcon className="h-4 w-4 text-slate-400" /> : null}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={`Ask about ${label}…`}
          className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-white/10 focus:ring-indigo-400"
        />
        <button type="button" onClick={() => void send()} disabled={busy || !input.trim()} className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  );
}
