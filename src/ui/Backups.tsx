import { useEffect, useRef, useState } from 'react';
import { Label } from './atoms';
import { useUI } from '../lib/ui';
import { useAuth } from '../lib/auth';
import { listBackups, backupNow, restoreBackup, exportBoardJson, importBoardJson, scanForLostPages, addPages, type BackupMeta, type ScanResult } from '../lib/persistence';
import { useBoard } from '../lib/board';
import { useT } from '../i18n';

const LOCALE: Record<string, string> = { en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', tr: 'tr-TR' };

/** Settings section: snapshots of the notebook (device + cloud), restore, export, import. */
export default function Backups() {
  const t = useT();
  const lang = useUI((s) => s.lang);
  const user = useAuth((s) => s.user);
  const [items, setItems] = useState<BackupMeta[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const refresh = () => setItems(listBackups());
  useEffect(refresh, [user]);
  const fmt = new Intl.DateTimeFormat(LOCALE[lang] ?? 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const run = async (key: string, fn: () => Promise<string>) => {
    setBusy(key);
    setMsg(null);
    try {
      setMsg(await fn());
    } catch (e) {
      setMsg(e instanceof Error && e.message === 'bad_backup_file' ? t('backupBadFile') : t('error'));
    } finally {
      setBusy(null);
      refresh();
    }
  };

  return (
    <div className="mb-6">
      <div className="mb-1 flex items-center justify-between">
        <Label>{t('backups')}</Label>
        <button type="button" disabled={busy !== null} onClick={() => void run('now', async () => { await backupNow(); return t('backupSaved'); })} className="text-xs font-semibold text-indigo-700 hover:underline disabled:opacity-40">
          {t('backupNow')}
        </button>
      </div>
      {items.length ? (
        <ul className="space-y-1">
          {items.map((b) => (
            <li key={b.id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-1.5 text-sm">
              <span className="min-w-0 flex-1">
                <span className="text-slate-800">{fmt.format(new Date(b.ts))}</span>
                <span className="ml-1.5 text-xs text-slate-400">
                  {b.where === 'cloud' ? '☁' : '📱'} · {t('pagesCount', { n: b.pages })} · {t(`reason_${b.reason}` as any) || b.reason}
                </span>
              </span>
              <button type="button" disabled={busy !== null} onClick={() => void run(b.id, async () => t('restoredMerged', { n: await restoreBackup(b.id, 'merge') }))} className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 disabled:opacity-40">
                {t('restoreMerge')}
              </button>
              <button type="button" disabled={busy !== null} onClick={() => void run(b.id, async () => { await restoreBackup(b.id, 'replace'); return t('restoredReplaced'); })} className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100 hover:bg-red-50 disabled:opacity-40">
                {t('restoreReplace')}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-2 text-sm text-slate-400">{t('noBackups')}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([exportBoardJson()], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `eju-notebook-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 5000);
          }}
          className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          {t('exportFile')}
        </button>
        <button type="button" onClick={() => file.current?.click()} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
          {t('importFile')}
        </button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            void run('import', async () => t('restoredMerged', { n: importBoardJson(await f.text()) }));
          }}
        />
      </div>
      {msg ? <p className="mt-2 px-2 text-xs text-emerald-700">{msg}</p> : null}

      {/* Recovery: search every place a page could survive */}
      <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-amber-900">{t('findLost')}</span>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void run('scan', async () => { const r = await scanForLostPages(); setScan(r); return t('scanned', { where: r.searched.join(', ') }); })}
            className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-40"
          >
            {t('scanNow')}
          </button>
        </div>
        {scan ? (
          <div className="mt-2 space-y-2 text-sm">
            {scan.missing.length ? (
              <div>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-amber-800">
                  <span>{t('foundMissing', { n: scan.missing.length })}</span>
                  <button type="button" onClick={() => void run('addall', async () => { const n = addPages(scan.missing.map((f) => f.page)); setScan(null); return t('restoredMerged', { n }); })} className="rounded-lg bg-white px-2 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100">
                    {t('addAll')}
                  </button>
                </div>
                <ul className="space-y-1">
                  {scan.missing.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-1.5 ring-1 ring-amber-100">
                      <span className="min-w-0 flex-1 truncate">
                        <span className="text-slate-800">{f.title || t('untitledPage')}</span>
                        <span className="ml-1.5 text-xs text-slate-400">{t(f.notebook as any) || f.notebook} · {t('strokesCount', { n: f.strokes })} · {f.source}</span>
                      </span>
                      <button type="button" onClick={() => void run(f.id, async () => { addPages([f.page]); setScan({ ...scan, missing: scan.missing.filter((x) => x.id !== f.id) }); return t('restoredMerged', { n: 1 }); })} className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                        {t('addOne')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-amber-900">{t('nothingMissing')}</p>
            )}
            {scan.elsewhere.length ? (
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-800">{t('inOtherNotebooks', { n: scan.elsewhere.length })}</div>
                <ul className="space-y-1">
                  {scan.elsewhere.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-1.5 ring-1 ring-amber-100">
                      <span className="min-w-0 flex-1 truncate">
                        <span className="text-slate-800">{f.title || t('untitledPage')}</span>
                        <span className="ml-1.5 text-xs text-slate-400">{t(f.notebook as any) || f.notebook} · {t('strokesCount', { n: f.strokes })}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const b = useBoard.getState();
                          const nb = b.notebooks.find((n) => n.id === f.notebook);
                          if (nb) useUI.getState().setSubject(nb.subject);
                          b.setNotebook(f.notebook);
                          b.goToPage(f.id);
                          useUI.getState().closePanel();
                        }}
                        className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                      >
                        {t('openNotes')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
