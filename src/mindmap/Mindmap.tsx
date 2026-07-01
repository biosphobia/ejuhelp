import { useUI } from '../lib/ui';
import { useProgress } from '../lib/userdata';
import { useStudyMap } from '../lib/studymap';
import { useT } from '../i18n';
import { CalendarIcon, ChevronLeft } from '../ui/icons';
import StudyCalendar from './StudyCalendar';

/** The Study Plan screen: a full-screen calendar with a daily, progressive EJU plan
 *  computed entirely on the client. Tapping a day's task opens its study sheet + practice
 *  (NodeDetail, rendered globally) or starts a mixed drill. The topic taxonomy is still
 *  loaded and used to build the plan and the node detail — only the standalone map view
 *  was removed. */
export default function Mindmap() {
  const t = useT();
  const setMode = useUI((s) => s.setMode);
  // Re-render on attempt / study-map changes (progress bar, weak-topic prioritization).
  useProgress((s) => s.rev);
  useStudyMap((s) => s.rev);

  return (
    <div className="pointer-events-auto absolute inset-0 flex flex-col bg-slate-950 text-slate-100">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <button type="button" onClick={() => setMode('board')} aria-label={t('backToBoard')} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <CalendarIcon className="h-5 w-5 text-indigo-300" />
        <h1 className="text-base font-bold">{t('studyPlan')}</h1>
      </div>

      {/* body */}
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <StudyCalendar />
      </div>
    </div>
  );
}
