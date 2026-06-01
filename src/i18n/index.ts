import { strings, type StringKey } from './strings';
import { useUI } from '../lib/ui';

export type TFunc = (key: StringKey, vars?: Record<string, string | number>) => string;

export function useT(): TFunc {
  const lang = useUI((s) => s.lang);
  return (key, vars) => {
    const entry = strings[key];
    let out = (entry?.[lang] ?? entry?.en ?? String(key)) as string;
    if (vars) {
      for (const k of Object.keys(vars)) {
        out = out.replace(`{${k}}`, String(vars[k]));
      }
    }
    return out;
  };
}

export type { StringKey };
