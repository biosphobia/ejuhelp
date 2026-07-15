import {
  INK_HEX,
  PEN_SIZES,
  useBoard,
  type InkColor,
  type ShapeKind,
} from '../lib/board';
import { useUI } from '../lib/ui';
import { useT } from '../i18n';
import {
  PenIcon,
  EraserIcon,
  UndoIcon,
  HandIcon,
  SelectIcon,
  ShapesIcon,
  TriangleIcon,
  SquareIcon,
  CircleIcon,
} from './icons';
import type { StringKey } from '../i18n';

const COLORS: InkColor[] = ['black', 'red', 'blue', 'green'];
const SHAPES: { kind: ShapeKind; Icon: typeof TriangleIcon; label: StringKey }[] = [
  { kind: 'square', Icon: SquareIcon, label: 'shapeSquare' },
  { kind: 'triangle', Icon: TriangleIcon, label: 'shapeTriangle' },
  { kind: 'circle', Icon: CircleIcon, label: 'shapeCircle' },
];

function IconBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-xl transition ${
        active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function Toolbar() {
  const t = useT();
  const tool = useBoard((s) => s.tool);
  const color = useBoard((s) => s.color);
  const size = useBoard((s) => s.size);
  const shape = useBoard((s) => s.shape);
  const setTool = useBoard((s) => s.setTool);
  const setColor = useBoard((s) => s.setColor);
  const setSize = useBoard((s) => s.setSize);
  const setShape = useBoard((s) => s.setShape);
  const undoLast = useBoard((s) => s.undoLast);
  const fingerDraw = useUI((s) => s.fingerDraw);
  const setFingerDraw = useUI((s) => s.setFingerDraw);

  return (
    <div className="pointer-events-auto absolute left-3 top-3 flex max-w-[92vw] flex-wrap items-center gap-1 rounded-2xl bg-white/90 p-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur safe-pad-top">
      <IconBtn active={tool === 'pen'} onClick={() => setTool('pen')} title={t('pen')}>
        <PenIcon />
      </IconBtn>
      <IconBtn active={tool === 'eraser'} onClick={() => setTool('eraser')} title={t('eraser')}>
        <EraserIcon />
      </IconBtn>
      <IconBtn active={tool === 'select'} onClick={() => setTool('select')} title={t('select')}>
        <SelectIcon />
      </IconBtn>
      <IconBtn active={tool === 'shapes'} onClick={() => setTool('shapes')} title={t('shapes')}>
        <ShapesIcon />
      </IconBtn>

      {tool === 'shapes' && (
        <>
          <span className="mx-1 h-7 w-px bg-slate-200" />
          {SHAPES.map(({ kind, Icon, label }) => (
            <IconBtn
              key={kind}
              active={shape === kind}
              onClick={() => setShape(kind)}
              title={t(label)}
            >
              <Icon />
            </IconBtn>
          ))}
        </>
      )}

      <span className="mx-1 h-7 w-px bg-slate-200" />

      {COLORS.map((c) => {
        const isActive = (tool === 'pen' || tool === 'shapes') && color === c;
        return (
          <button
            key={c}
            type="button"
            title={c}
            aria-label={c}
            onClick={() => setColor(c)}
            className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100"
          >
            <span
              className={`block rounded-full ${isActive ? 'h-7 w-7 ring-2 ring-offset-2 ring-slate-900' : 'h-5 w-5'}`}
              style={{ backgroundColor: INK_HEX[c] }}
            />
          </button>
        );
      })}

      <span className="mx-1 h-7 w-px bg-slate-200" />

      {PEN_SIZES.map((s) => (
        <button
          key={s}
          type="button"
          title={`${s}px`}
          aria-label={`size ${s}`}
          onClick={() => setSize(s)}
          className={`grid h-10 w-10 place-items-center rounded-xl transition ${
            size === s ? 'bg-slate-100' : 'hover:bg-slate-100'
          }`}
        >
          <span
            className="block rounded-full bg-slate-800"
            style={{ width: Math.max(4, s + 2), height: Math.max(4, s + 2) }}
          />
        </button>
      ))}

      <span className="mx-1 h-7 w-px bg-slate-200" />

      <IconBtn onClick={undoLast} title={t('undo')}>
        <UndoIcon />
      </IconBtn>

      <span className="mx-1 h-7 w-px bg-slate-200" />

      <IconBtn
        active={fingerDraw}
        onClick={() => setFingerDraw(!fingerDraw)}
        title={fingerDraw ? t('fingerDraw') : t('pencilOnly')}
      >
        <HandIcon />
      </IconBtn>
    </div>
  );
}
