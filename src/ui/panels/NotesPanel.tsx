import { useEffect, useState } from 'react';
import Panel, { SubjectChips } from '../Panel';
import Markdown from '../Markdown';
import { Label, PrimaryButton, ErrorNote, errorMessage } from '../atoms';
import { fetchTopics, makeNotes } from '../../lib/api';
import { useUI } from '../../lib/ui';
import { useT } from '../../i18n';

export default function NotesPanel() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const lang = useUI((s) => s.lang);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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

  const run = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await makeNotes({ subject, lang, topic: topic || undefined });
      setText(res.text);
    } catch (e) {
      setErr(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title={t('notesTitle')}
      footer={
        <PrimaryButton onClick={() => void run()} busy={busy}>
          {t('makeNotes')}
        </PrimaryButton>
      }
    >
      <SubjectChips />
      <p className="mb-3 text-xs text-slate-500">{t('notesHint')}</p>

      <Label>{t('topic')}</Label>
      <select
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
      >
        <option value="">{t('anyTopic')}</option>
        {topics.map((tp) => (
          <option key={tp.id} value={tp.id}>
            {tp.name}
          </option>
        ))}
      </select>

      {err ? <ErrorNote>{err}</ErrorNote> : null}
      {text ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <Markdown text={text} />
        </div>
      ) : null}
    </Panel>
  );
}
