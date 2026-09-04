import { create } from 'zustand';
import { tidyPage, EmptyBoardError, type TidyBlock } from './api';
import { useBoard, newId, type TextBlock } from './board';
import { useUI } from './ui';
import { exportPagePng } from '../whiteboard/export';

/** Layout of a tidied page: world units, a comfortable "A4-ish" column. */
const LEFT = 80;
const TOP = 80;
const WIDTH = 900;
const STYLE: Record<TidyBlock['kind'], { size: number; color: TextBlock['color']; style?: TextBlock['style']; prefix?: string; indent?: number; gap: number }> = {
  h1: { size: 40, color: 'black', style: 'h', gap: 22 },
  h2: { size: 30, color: 'black', style: 'h', gap: 14 },
  p: { size: 24, color: 'black', gap: 10 },
  bullet: { size: 24, color: 'black', prefix: '• ', indent: 24, gap: 6 },
  formula: { size: 27, color: 'blue', indent: 36, gap: 12 },
  added: { size: 22, color: 'green', prefix: '＋ ', indent: 24, gap: 6 },
  fix: { size: 22, color: 'red', prefix: '✎ ', indent: 24, gap: 6 },
};

interface TidyState {
  busy: boolean;
  error: unknown | null;
  /** Coach's remark about the last tidy (what changed / could not be read). */
  note: string | null;
  run: () => Promise<void>;
  dismiss: () => void;
}

/** Turn the current page's handwriting into a clean, handwriting-style text page
 *  inserted right after it. */
export const useTidy = create<TidyState>((set, get) => ({
  busy: false,
  error: null,
  note: null,
  dismiss: () => set({ note: null, error: null }),
  run: async () => {
    if (get().busy) return;
    const board = useBoard.getState();
    const page = board.getCurrentPage();
    const png = exportPagePng(page);
    if (!png) {
      set({ error: new EmptyBoardError() });
      return;
    }
    set({ busy: true, error: null, note: null });
    try {
      const { subject, lang } = useUI.getState();
      const res = await tidyPage({ subject, lang, imageDataUrl: png, hint: page.title });
      // Lay the blocks out top to bottom. Heights are estimated from wrapped line
      // counts using an offscreen canvas so blocks never overlap.
      const m = document.createElement('canvas').getContext('2d')!;
      const { wrapText, HAND_FONT } = await import('../whiteboard/render');
      let y = TOP;
      const texts: TextBlock[] = [];
      for (const b of res.blocks) {
        const st = STYLE[b.kind] ?? STYLE.p;
        const x = LEFT + (st.indent ?? 0);
        const w = WIDTH - (st.indent ?? 0);
        const text = (st.prefix ?? '') + b.text;
        m.font = `${st.style === 'h' ? 600 : 400} ${st.size}px ${HAND_FONT}`;
        const lines = wrapText(m, text, w).length;
        texts.push({ id: newId(), x, y, w, size: st.size, color: st.color, text, style: st.style });
        y += lines * st.size * 1.45 + st.gap;
      }
      const title = res.title ? `✨ ${res.title}` : `✨ ${page.title || ''}`.trim();
      board.addTextPage(page.id, title, texts);
      set({ note: res.note || '' });
    } catch (e) {
      set({ error: e });
    } finally {
      set({ busy: false });
    }
  },
}));
