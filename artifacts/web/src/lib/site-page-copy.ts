export const normalizeCopy = (s: string) => s.replace(/\s+/g, ' ').trim();
export function copyEligible(element: Element | null, source: string) {
  if (!element || !/\p{L}/u.test(source) || source.length > 6000) return false;
  if (element.closest('script,style,textarea,input,pre,code,form,header,nav,[translate="no"],[data-no-translate],[data-editorial-protected]')) return false;
  // Editorial copy cannot change payment amounts or turn a statistic into a
  // manually invented number. Payment and member systems remain authoritative.
  if (/(?:[$€£]|\b(?:USD|AED|EUR)\b)\s*\d|\d[\d,.]*\s*(?:USD|AED|EUR)\b/.test(source)) return false;
  return true;
}
export function makeTemplateTranslations(dictionary: Record<string, string>) {
  return Object.entries(dictionary).filter(([key]) => /\{\d+\}/.test(key)).map(([key, value]) => {
    const positions = [...key.matchAll(/\{(\d+)\}/g)].map(m => m[1]);
    const parts = key.split(/\{\d+\}/);
    const escaped = parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return { expression: new RegExp(`^${escaped.join('(.+?)')}$`, 'i'), value, positions };
  });
}
