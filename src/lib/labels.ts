import type { StringKey, TFunc } from '../i18n';

const ERROR_TAG_KEY: Record<string, StringKey> = {
  units: 'tagUnits',
  sign: 'tagSign',
  arithmetic: 'tagArithmetic',
  algebra: 'tagAlgebra',
  concept: 'tagConcept',
  formula: 'tagFormula',
  misread: 'tagMisread',
  incomplete: 'tagIncomplete',
};

export function errorTagLabel(tag: string, t: TFunc): string {
  const key = ERROR_TAG_KEY[tag];
  return key ? t(key) : tag;
}
