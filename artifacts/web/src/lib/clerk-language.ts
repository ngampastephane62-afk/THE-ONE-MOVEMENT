import { enUS, frFR, arSA, esES, ptBR, zhCN } from '@clerk/localizations';
import { clerkLocalization } from './clerk';
import type { Language } from './locale';

const packs = { en: enUS, fr: frFR, ar: arSA, es: esES, pt: ptBR, zh: zhCN, sw: enUS };
function translatedResource<T>(value: T, dictionary: Record<string, string>): T {
  if (typeof value === 'string') return (dictionary[value] ?? value) as T;
  if (Array.isArray(value)) return value.map(v => translatedResource(v, dictionary)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, v]) =>
    [key, key === 'locale' ? 'sw-KE' : translatedResource(v, dictionary)])) as T;
  return value;
}
export function localizedClerk(language: Language, dictionary: Record<string, string>) {
  const base = language === 'sw' ? translatedResource(enUS, dictionary) : packs[language];
  const t = (source: string) => language === 'en' ? source : dictionary[source] ?? source;
  return {
    ...base,
    unstable__errors: { ...base.unstable__errors, form_identifier_not_found: t(clerkLocalization.unstable__errors.form_identifier_not_found) },
    signIn: { ...base.signIn, start: { ...base.signIn?.start, title: t(clerkLocalization.signIn.start.title), subtitle: t(clerkLocalization.signIn.start.subtitle) } },
    signUp: { ...base.signUp, start: { ...base.signUp?.start, title: t(clerkLocalization.signUp.start.title), subtitle: t(clerkLocalization.signUp.start.subtitle) } },
  };
}
