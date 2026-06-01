import { useEffect, useMemo, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import { Label, PrimaryButton, ErrorNote, errorMessage } from '../atoms';
import { fetchTopics, generateKeyPoints } from '../../lib/api';
import { useUI } from '../../lib/ui';
import { useKeyPoints } from '../../lib/userdata';
import { useT } from '../../i18n';

export default function NotesPanel() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const lang = useUI((s) => s.lang);
  const items = useKeyPoints((s) => s.items);
  const addMany = useKeyPoints((s) => s.addMany);
  const remove = useKeyPoints((s) => s.remove);

  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [added, setAdded] = useState<number | null>(null);

  const mine = useMemo(
    () => items.filter((i) => i.subject === subject).sort((a, b) => b.ts - a.ts),
    [items, subject]
  );

  useEffect(() => {
    let alive = true;
    setTopic('');
    fetchTopics({ subject, lang })
      .then((r) => alive && setTopics(r.topics))
      .catch(() => alive && setTopics([]));
    return () => {
      alive = false;
    };
  }, [subject, lang]);

  const generate = async () => {
    setBusy(true);
    setErr(null);
    setAdded(null);
    try {
      const res = await generateKeyPoints({ subject, lang, topic: topic || undefined });
      setAdded(addMany(subject, res.keyPoints));
    } catch (e) {
      setErr(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  const clearSubject = () => mine.forEach((i) => remove(i.id));

  return (
    <Panel
      title={t('notesTitle')}
      footer={
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="">{t('wholeSubject')}</option>
              {topics.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {tp.name}
                </option>
              ))}
            </select>
          </div>
          <PrimaryButton onClick={() => void generate()} busy={busy}>
            {topic ? t('addForTopic') : t('addKeyFormulas')}
          </PrimaryButton>
        </div>
      }
    >
      <SubjectChips />
      <p className="mb-3 text-xs text-slate-500">{t('keyPointsHint')}</p>

      {err ? <ErrorNote>{err}</ErrorNote> : null}
      {added !== null ? (
        <div className="mb-3 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
          ★ {t('savedKeyPoints', { n: added })}
        </div>
      ) : null}

      {mine.length === 0 ? (
        <p className="text-sm italic text-slate-400">{t('noKeyPoints')}</p>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <Label>{t('notesTitle')} ({mine.length})</Label>
            <button
              type="button"
              onClick={clearSubject}
              className="text-xs font-semibold text-slate-400 hover:text-red-600"
            >
              {t('clearAll')}
            </button>
          </div>
          <ul className="space-y-2">
            {mine.map((kp) => (
              <li
                key={kp.id}
                className="group flex items-start gap-2 rounded-xl border border-slate-200 p-2.5"
              >
                <span
                  className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    kp.kind === 'formula'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {kp.kind === 'formula' ? t('kindFormula') : t('kindFact')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="break-words text-sm text-slate-800">{kp.text}</div>
                  {kp.topic ? <div className="mt-0.5 text-xs text-slate-400">{kp.topic}</div> : null}
                </div>
                <button
                  type="button"
                  aria-label="remove"
                  onClick={() => remove(kp.id)}
                  className="shrink-0 rounded-md px-1.5 text-slate-300 hover:text-red-500"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}
