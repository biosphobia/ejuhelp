// Read a picked/captured image File, downscale it, and return a compact JPEG data URL.
// Downscaling is important: raw phone photos are multi-MB, which would blow the board's
// localStorage/Firestore budget (and slow the canvas). We cap the longest side and
// re-encode as JPEG.

export interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

const MAX_SIDE = 1400; // longest side, in px
const QUALITY = 0.82;

export function loadImageFile(file: File, maxSide = MAX_SIDE): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('not-an-image'));
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('read-failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode-failed'));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        const ctx = cv.getContext('2d');
        if (!ctx) return reject(new Error('no-2d'));
        ctx.drawImage(img, 0, 0, w, h);
        // JPEG keeps photos small; PNG for anything with transparency would be huge.
        let dataUrl: string;
        try {
          dataUrl = cv.toDataURL('image/jpeg', QUALITY);
        } catch {
          dataUrl = cv.toDataURL();
        }
        resolve({ dataUrl, width: w, height: h });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
