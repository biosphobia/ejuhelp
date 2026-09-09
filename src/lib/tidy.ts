import { create } from 'zustand';
import { tidyPage, EmptyBoardError, type TidyBlock, type TidyRegion } from './api';
import { useBoard, newId, type TextBlock, type Stroke, type Page } from './board';
import { useUI } from './ui';
import { useProfile, profileTexts } from './profile';
import { exportPageImage } from '../whiteboard/export';
import { wrapText, HAND_FONT } from '../whiteboard/render';

/** Relative sizes of the block kinds; the base size is fitted per region. */
const STYLE: Record<TidyBlock['kind'], { scale: number; color: TextBlock['color']; style?: TextBlock['style']; prefix?: string; indent: number; gap: number }> = {
  h1: { scale: 1.5, color: 'black', style: 'h', indent: 0, gap: 0.6 },
  h2: { scale: 1.2, color: 'black', style: 'h', indent: 0, gap: 0.4 },
  p: { scale: 1, color: 'black', indent: 0, gap: 0.35 },
  bullet: { scale: 1, color: 'black', prefix: '• ', indent: 1, gap: 0.2 },
  formula: { scale: 1.1, color: 'blue', indent: 1.5, gap: 0.4 },
  added: { scale: 0.9, color: 'green', prefix: '＋ ', indent: 1, gap: 0.2 },
  fix: { scale: 0.9, color: 'red', prefix: '✎ ', indent: 1, gap: 0.2 },
};
const MIN_SIZE = 14;
const MAX_SIZE = 30;

/** Lay the blocks out inside a box, choosing the largest base font size (≤ MAX)
 *  at which everything fits; below MIN the text simply overflows downward. */
function layoutRegion(ctx: CanvasRenderingContext2D, blocks: TidyBlock[], box: { x: number; y: number; w: number; h: number }): TextBlock[] {
  const build = (base: number) => {
    let y = box.y;
    const out: TextBlock[] = [];
    for (const b of blocks) {
      const st = STYLE[b.kind] ?? STYLE.p;
      const size = Math.round(base * st.scale);
      const x = box.x + st.indent * base;
      const w = Math.max(base * 4, box.w - st.indent * base);
      const text = (st.prefix ?? '') + b.text;
      ctx.font = `${st.style === 'h' ? 600 : 400} ${size}px ${HAND_FONT}`;
      const lines = wrapText(ctx, text, w).length;
      out.push({ id: newId(), x, y, w, size, color: st.color, text, style: st.style });
      y += lines * size * 1.45 + st.gap * base;
    }
    return { out, height: y - box.y };
  };
  for (let base = MAX_SIZE; base >= MIN_SIZE; base -= 2) {
    const r = build(base);
    if (r.height <= box.h) return r.out;
  }
  return build(MIN_SIZE).out;
}

/** Copy the strokes that sit (mostly) inside a box, with fresh ids. */
function strokesInside(page: Page, box: { x: number; y: number; w: number; h: number }): Stroke[] {
  const inside = (x: number, y: number) => x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
  const out: Stroke[] = [];
  for (const s of page.strokes) {
    if (!s.points.length) continue;
    let n = 0;
    for (const p of s.points) if (inside(p.x, p.y)) n++;
    if (n / s.points.length >= 0.5) out.push({ ...s, id: newId(), points: s.points.map((p) => ({ ...p })) });
  }
  return out;
}

interface TidyState {
  busy: boolean;
  error: unknown | null;
  /** Coach's remark about the last tidy (what changed / could not be read). */
  note: string | null;
  run: () => Promise<void>;
  dismiss: () => void;
}

/** Turn the current page into a clean version on a new page right after it: the
 *  student's drawings are copied as they are, handwriting becomes fitted text in
 *  the same places, and the original page is never touched. */
export const useTidy = create<TidyState>((set, get) => ({
  busy: false,
  error: null,
  note: null,
  dismiss: () => set({ note: null, error: null }),
  run: async () => {
    if (get().busy) return;
    const board = useBoard.getState();
    const page = board.getCurrentPage();
    const img = exportPageImage(page);
    if (!img) {
      set({ error: new EmptyBoardError() });
      return;
    }
    set({ busy: true, error: null, note: null });
    try {
      const { subject, lang } = useUI.getState();
      const res = await tidyPage({ subject, lang, imageDataUrl: img.dataUrl, hint: page.title, profile: profileTexts() });
      if (res.observations?.length) useProfile.getState().add(res.observations);

      const ctx = document.createElement('canvas').getContext('2d')!;
      const toWorld = (r: TidyRegion) => ({
        x: img.box.x + (r.box[0] / 100) * img.box.w,
        y: img.box.y + (r.box[1] / 100) * img.box.h,
        w: Math.max(40, (r.box[2] / 100) * img.box.w),
        h: Math.max(20, (r.box[3] / 100) * img.box.h),
      });
      const texts: TextBlock[] = [];
      const strokes: Stroke[] = [];
      const textBoxes: { x: number; y: number; w: number; h: number }[] = [];
      for (const r of res.regions) {
        const box = toWorld(r);
        if (r.kind === 'keep') strokes.push(...strokesInside(page, box));
        else if (r.blocks?.length) {
          textBoxes.push(box);
          texts.push(...layoutRegion(ctx, r.blocks, box));
        }
      }
      // Anything the coach did not call text is the student's own drawing: keep it,
      // even if it forgot to mark a "keep" box for it.
      const kept = new Set(strokes.map((s) => s.points[0] && `${s.points[0].x},${s.points[0].y},${s.points.length}`));
      for (const s of page.strokes) {
        if (!s.points.length) continue;
        const key = `${s.points[0].x},${s.points[0].y},${s.points.length}`;
        if (kept.has(key)) continue;
        const inText = textBoxes.some((b) => {
          let n = 0;
          for (const p of s.points) if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) n++;
          return n / s.points.length >= 0.5;
        });
        if (!inText) strokes.push({ ...s, id: newId(), points: s.points.map((p) => ({ ...p })) });
      }
      const title = res.title ? `✨ ${res.title}` : `✨ ${page.title || ''}`.trim();
      board.addTextPage(page.id, title, texts, strokes);
      set({ note: res.note || '' });
    } catch (e) {
      set({ error: e });
    } finally {
      set({ busy: false });
    }
  },
}));
