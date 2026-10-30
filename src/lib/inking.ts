// Whether the pen (or a drawing finger) is on the board right now. Background work
// that would take the main thread for a while (saving the notebook) waits until the
// stroke is finished, so it never makes the ink stutter mid-stroke.
let down = false;
let since = 0;

export function setInking(on: boolean) {
  if (on === down) return;
  down = on;
  since = on ? Date.now() : 0;
}

/** True while a stroke is being written; `for` says for how long (ms). */
export function inking(): { on: boolean; for: number } {
  return { on: down, for: down ? Date.now() - since : 0 };
}
