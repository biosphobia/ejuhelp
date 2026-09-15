# ejuhelp — rules for every change

## Nothing the student wrote may ever be lost

Handwritten notes are the most valuable thing in this app. Two data-loss
incidents came from sync changes that looked fine locally. So:

1. **Run `npm run verify` before every commit** (typecheck, sync safety tests,
   production build). Never push if it fails. `npm run build` (what the host
   runs to deploy) also runs the sync tests first, so a deploy with a failing
   scenario does not go live.
2. **Any change that touches `src/lib/persistence.ts`, `src/lib/userdata.ts`,
   `src/lib/sync.ts`, `src/lib/live.ts`, `src/lib/board.ts` or `src/lib/chunk.ts`
   must add or extend a scenario in `tests/sync/run.mjs`** that shows the exact
   situation it changes (two devices, offline, stale copy, old build format,
   reload, restore). The scenarios end with an invariant: every stroke drawn
   and not erased by the user must still exist on a device, in the account,
   in a snapshot or in the journal. Keep that invariant.
3. **Rules the sync code must keep**:
   - A page copy without a reliable change time, or older than ours, never
     takes ink away. Without reliable times the copy with more ink wins.
   - A device never writes to the account before it has merged with the
     account copy (`mergedUid` gate in persistence.ts).
   - Every automatic change that removes ink or a page (merge, other device,
     restore, import, delete, clear) goes through `guardInk`/`journal` first.
   - Restores never consult timestamps: "replace" is exact, "merge" keeps the
     fuller copy per page.
   - Firestore listener callbacks are wrapped in try/catch: an exception inside
     one kills the Firestore client for the whole page.
   - "Last changed" on a device moves only on real changes (ink, pages added,
     removed or reordered), never on opening the app or turning a page.
4. **Cloud documents must not contain `undefined` values or nested arrays**
   (Firestore rejects them silently from the user's point of view). The fake
   Firestore in the tests rejects them too.

## Working agreement with the owner

- Push every commit to `main` as well as the working branch.
- Do not remove features without asking. No filler text in the UI.
- Biology content is skipped for now; physics, chemistry and math are the focus.
