import { useState } from 'react';
import Panel from '../Panel';
import Markdown from '../Markdown';
import { PrimaryButton, ErrorNote, errorMessage } from '../atoms';
import { checkWork, type CheckResponse } from '../../lib/api';
import { useUI } from '../../lib/ui';
import { usePractice } from '../../lib/practice';
import { useBoard } from '../../lib/board';
import { useProgress } from '../../lib/userdata';
import { exportPagePng } from '../../whiteboard/export';
import { errorTagLabel } from '../../lib/labels';
import { useT } from '../../i18n';

export default function CheckPanel() {
  const t = useT();
  const subject = useUI((s) => s.subject);
  const lang = useUI((s) => s.lang);
  const activeQuestion = usePractice((s) => s.activeQuestion);
  const setActiveQuestion = usePractice((s) => s.setActiveQuestion);
  const addAttempt = useProgress((s) => s.addAttempt);

  const [result, setResult] = useState<CheckResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setErr(null);
    const page = useBoard.getState().getCurrentPage();
    const img = exportPagePng(page);
    if (!img) {
      setErr(t('emptyBoard'));
      return;
    }
    setBusy(true);
    try {
      const res = await checkWork({
        subject,
        lang,
        imageDataUrl: img,
        question: activeQuestion ?? undefined,
      });
      setResult(res);
      if (res.correct !== 'unknown') {
        addAttempt({
          subject,
          topic: res.topic || subject,
          correct: res.correct === 'yes',
          source: 'check',
          errorTags: res.errorTags,
        });
      }
    } catch (e) {
      setErr(errorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  const verdict =
    result?.correct === 'yes'
      ? { label: t('correctMark'), cls: 'bg-emerald-50 text-emerald-700 ring-emerald-100' }
      : result?.correct === 'no' || result?.correct === 'partial'
        ? { label: t('incorrectMark'), cls: 'bg-amber-50 text-amber-700 ring-amber-100' }
        : null;

  return (
    <Panel
      title={t('checkTitle')}
      footer={
        <PrimaryButton onClick={() => void run()} busy={busy}>
          {busy ? t('checking') : t('captureCheck')}
        </PrimaryButton>
      }
    >
      <p className="mb-3 text-xs text-slate-500">{t('checkHint')}</p>

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
          <div className="whitespace-pre-wrap text-sm text-amber-900">{activeQuestion}</div>
        </div>
      ) : (
        <p className="mb-3 text-xs italic text-slate-400">{t('noActiveQuestion')}</p>
      )}

      {err ? <ErrorNote>{err}</ErrorNote> : null}

      {result ? (
        <div className="mt-2 space-y-3">
          {verdict ? (
            <div className={`flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ring-1 ${verdict.cls}`}>
              <span>{verdict.label}</span>
              {result.errorTags
                .filter((tag) => tag !== 'none')
                .map((tag) => (
                  <span key={tag} className="rounded-full bg-white/70 px-2 py-0.5 text-xs">
                    {errorTagLabel(tag, t)}
                  </span>
                ))}
            </div>
          ) : null}
          <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <Markdown text={result.feedback} />
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
