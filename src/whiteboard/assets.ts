// Async raster assets drawn on the canvas — photos and rendered-LaTeX bitmaps. The render
// loop is synchronous, so when an asset isn't decoded yet we return null (the caller draws
// a placeholder) and request a repaint once it loads.

let repaint: () => void = () => {};
/** The whiteboard registers its invalidate() here so a late-loading asset triggers a redraw. */
export function setAssetRepaint(fn: () => void) {
  repaint = fn;
}
/** Ask the whiteboard to repaint (e.g. after the lazy math renderer finishes loading). */
export function requestRepaint() {
  repaint();
}

const cache = new Map<string, HTMLImageElement>();
const pending = new Set<string>();

/** Return a decoded image for `key`, or null while it loads. `srcFactory` builds the image
 *  source lazily the first time (so we don't rebuild a big SVG/data-URL every frame). */
export function getRasterImage(key: string, srcFactory?: () => string): HTMLImageElement | null {
  const hit = cache.get(key);
  if (hit) return hit;
  if (pending.has(key)) return null;
  pending.add(key);
  const img = new Image();
  img.onload = () => {
    pending.delete(key);
    if (img.naturalWidth > 0) {
      cache.set(key, img);
      repaint();
    }
  };
  img.onerror = () => pending.delete(key);
  try {
    img.src = srcFactory ? srcFactory() : key;
  } catch {
    pending.delete(key);
  }
  return null;
}
