import { attachSync } from './userdata';
import { useAsk } from './ask';
import { useGenerated } from './generated';
import { useReview } from './review';
import { useProfile } from './profile';

let started = false;

/**
 * Persist the Ask Coach conversation and the generated practice questions.
 * Both are written to localStorage and (when signed in) Firestore the moment
 * they change — no debounce — and stay until the user clears them.
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
  document.addEventListener('visibilitychange', resumeAll);
  window.addEventListener('online', resumeAll);
  attachSync(
    useAsk,
    'eju-chat',
    'chat',
    (s) => ({ messages: s.messages, pending: s.pending }),
    (s, data) => s.load(data?.messages ?? [], data?.pending ?? null),
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
    (s, data) => s.load(data?.sets ?? {}, data?.pending ?? null),
    0
  );
}
