// Tiny imperative bridge so UI buttons (toolbar) can talk to the canvas
// without forcing React re-renders of the drawing surface.
export const boardEvents = new EventTarget();
export const resetView = () => boardEvents.dispatchEvent(new Event('reset'));
/** Clear the whiteboard's current selection (e.g. after its strokes were replaced). */
export const clearBoardSelection = () => boardEvents.dispatchEvent(new Event('deselect'));
