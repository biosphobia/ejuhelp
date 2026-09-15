import { attachSync } from './userdata';
import { useAsk } from './ask';
import { useGenerated } from './generated';
import { useReview } from './review';
import { useProfile } from './profile';
import { useApiStore } from './apiStore';
import { useUI } from './ui';
import { initLive } from './live';

let started = false;

/**
 * Persist the Ask Coach conversation, the generated practice questions, the
 * review plan, the handwriting profile, the AI keys and the app settings.
 * Everything is written to localStorage and (when signed in) Firestore, so a
 * second device signed into the same account picks it all up.
 *
 * Lives apart from initUserData() because ask.ts already imports userdata.ts;
 * registering here avoids a circular import.
 */
export function initSync() {
  if (started) return;
  started = true;
  // An answer whose request was interrupted (device slept, app was closed) is
  // picked up as soon as the app is running again, and whenever it comes back.
  const resumeAll = () => {
    if (document.visibilityState === 'hidden') return;
    void useAsk.getState().resume();
    void useGenerated.getState().resume();
  };
  setTimeout(resumeAll, 800);
  initLive();
  document.addEventListener('visibilitychange', resumeAll);
  window.addEventListener('online', resumeAll);
  attachSync(
    useAsk,
    'eju-chat',
    'chat',
    (s) => ({ messages: s.messages, pending: s.pending }),
    (s, data) => {
      s.load(data?.messages ?? [], data?.pending);
      // A question asked on another device: pick up its answer here too.
      if (data?.pending) setTimeout(() => void useAsk.getState().resume(), 0);
    },
    0
  );
  attachSync(
    useReview,
    'eju-review',
    'review',
    (s) => ({ reviews: s.reviews, examDate: s.examDate, planSubjects: s.planSubjects, planV: 2 }),
    (s, data) => s.load(data ?? {}),
    0
  );
  attachSync(
    useProfile,
    'eju-profile',
    'profile',
    (s) => ({ habits: s.habits, hand: s.hand, matchHand: s.matchHand }),
    (s, data) => s.load(data?.habits ?? [], data?.hand ?? null, data?.matchHand),
    0
  );
  attachSync(
    useGenerated,
    'eju-generated',
    'generated',
    (s) => ({ sets: s.sets, pending: s.pending }),
    (s, data) => {
      s.load(data?.sets ?? {}, data?.pending);
      if (data?.pending) setTimeout(() => void useGenerated.getState().resume(), 0);
    },
    0
  );
  // API keys + chosen model, and the app settings, follow the account so a new
  // device is ready to use after signing in.
  attachSync(
    useApiStore,
    'eju-api-sync',
    'api',
    (s) => ({ activeModel: s.activeModel, claudeKey: s.claudeKey, gptKey: s.gptKey, geminiKey: s.geminiKey }),
    (s, data) => s.load(data),
    500,
    // A key entered on either device is kept: an empty field never wipes a
    // saved key, and the newer side decides which model is active.
    (local, cloud, localIsNewer) => {
      const lead = localIsNewer ? local : cloud;
      const other = localIsNewer ? cloud : local;
      const key = (k: string) => (typeof lead?.[k] === 'string' && lead[k]) || (typeof other?.[k] === 'string' ? other[k] : '');
      return { activeModel: lead?.activeModel ?? other?.activeModel, claudeKey: key('claudeKey'), gptKey: key('gptKey'), geminiKey: key('geminiKey') };
    }
  );
  attachSync(
    useUI,
    'eju-settings-sync',
    'settings',
    (s) => ({ lang: s.lang, fingerDraw: s.fingerDraw }),
    (s, data) => s.loadSettings(data),
    500
  );
}
