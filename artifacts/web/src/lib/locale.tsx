import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { socialProfileCopy } from './locales/social-profile-copy';
import { documentaryPartnersCopy } from './locales/documentary-partners-copy';
import { magazineCopy } from './locales/magazine-copy';
import { partnersCopy } from './locales/partners-copy';
import { EDITORIAL_MEDIA_COPY } from './editorial-media-copy';
import { useBrowserLocation } from 'wouter/use-browser-location';
import { getSitePage, type SitePageDocument } from '@workspace/api-client-react';
import { sitePageForPath } from '@workspace/shared';
import { stripBase } from './clerk';
import { copyEligible, makeTemplateTranslations, normalizeCopy } from './site-page-copy';

export const LANGUAGES = [
  { code: 'en', label: 'English', tag: 'EN' },
  { code: 'fr', label: 'Français', tag: 'FR' },
  { code: 'ar', label: 'العربية', tag: 'AR' },
  { code: 'es', label: 'Español', tag: 'ES' },
  { code: 'pt', label: 'Português', tag: 'PT' },
  { code: 'sw', label: 'Kiswahili', tag: 'SW' },
  { code: 'zh', label: '简体中文', tag: '中文' },
] as const;
export type Language = typeof LANGUAGES[number]['code'];
type Dictionary = Record<string, string>;
type TextRecord = { source: string; last: string };
const loaders = import.meta.glob<Dictionary>('./locales/*.json', { import: 'default' });
const expansionLoaders = import.meta.glob<Dictionary>('./locales/editorial/*.json', { import: 'default' });
const Context = createContext<{ language: Language; setLanguage: (value: Language) => void; loading: boolean; dictionary: Dictionary }>({
  language: 'en', setLanguage: () => {}, loading: false, dictionary: {},
});
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const isLanguage = (value: string | null): value is Language => LANGUAGES.some(language => language.code === value);
function initialLanguage(): Language {
  if (new URLSearchParams(window.location.search).get('copy-preview') === '1') return 'en';
  try {
    const stored = localStorage.getItem('tomi-language');
    if (isLanguage(stored)) return stored;
  } catch { /* Selection still works without persistent browser storage. */ }
  const browser = navigator.language.split('-')[0];
  return isLanguage(browser) ? browser : 'en';
}

/**
 * A text-node catalogue keeps the existing React page/component structure intact.
 * It never replaces elements, user inputs, URLs, user-generated paragraphs or
 * personal information marked data-no-translate. Dictionaries are local assets:
 * browsing text is never sent to an external translation service.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [location] = useBrowserLocation();
  const page = sitePageForPath(stripBase(location));
  const previewMode = useRef(new URLSearchParams(window.location.search).get('copy-preview') === '1').current;
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [publishedCopy, setPublishedCopy] = useState<SitePageDocument | null>(null);
  const [previewCopy, setPreviewCopy] = useState<SitePageDocument | null>(null);
  const [copyError, setCopyError] = useState(false);
  const [copyRetry, setCopyRetry] = useState(0);
  const [dictionary, setDictionary] = useState<Dictionary>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const records = useRef(new WeakMap<Text, TextRecord>());
  const attributes = useRef(new WeakMap<Element, Map<string, TextRecord>>());
  const loadedLanguage = useRef<Language>('en');
  useEffect(() => {
    if (!previewMode) {
      try { localStorage.setItem('tomi-language', language); } catch { /* Private browsing. */ }
    }
    let active = true;
    setError(false);
    if (language === 'en') {
      loadedLanguage.current = 'en'; setDictionary({}); setLoading(false);
    } else {
      setLoading(true);
      const load = loaders[`./locales/${language}.json`];
      if (!load) { setError(true); setLoading(false); return; }
      const extras = Object.entries(expansionLoaders).filter(([path]) => new RegExp(`/editorial/${language}(?:-\\d+)?\\.json$`).test(path)).map(([, loader]) => loader());
      Promise.all([load(), Promise.all(extras).then(parts => Object.assign({}, ...parts) as Dictionary)]).then(([value, expansion]) => {
        if (active) { loadedLanguage.current = language; setDictionary({ ...value, ...socialProfileCopy[language], ...documentaryPartnersCopy[language], ...magazineCopy[language], ...partnersCopy[language], ...EDITORIAL_MEDIA_COPY[language], ...expansion }); setLoading(false); }
      }).catch(() => { if (active) { setError(true); setLoading(false); } });
    }
    return () => { active = false; };
  }, [language]);
  useEffect(() => {
    const handle = (event: StorageEvent) => { if (!previewMode && event.key === 'tomi-language' && isLanguage(event.newValue)) setLanguage(event.newValue); };
    window.addEventListener('storage', handle);
    return () => window.removeEventListener('storage', handle);
  }, []);
  useEffect(() => {
    let active = true;
    setPublishedCopy(null); setPreviewCopy(null);
    setCopyError(false);
    if (page) getSitePage(page.key).then(doc => { if (active) setPublishedCopy(doc); }).catch(() => {
      if (active) setCopyError(true);
    });
    return () => { active = false; };
  }, [page?.key, copyRetry]);
  useEffect(() => {
    if (!previewMode || !page || window.parent === window) return;
    const handle = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.pageKey !== page.key) return;
      if (event.data.type === 'tomi:preview-copy' && Array.isArray(event.data.copies)) {
        const copies = event.data.copies as SitePageDocument['copies'];
        if (copies.length <= 7 && copies.every(c => isLanguage(c.language) && Array.isArray(c.entries)
          && c.entries.length <= 1000 && c.entries.every(e => typeof e.source === 'string' && typeof e.value === 'string' && e.source.length <= 6000 && e.value.length <= 6000))) {
          setPreviewCopy({ pageKey: page.key, updatedAt: null, status: 'draft', copies });
          if (isLanguage(event.data.language)) setLanguage(event.data.language);
        }
        return;
      }
      if (event.data.type !== 'tomi:capture-copy') return;
      const sources = new Set<string>();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const source = normalizeCopy(records.current.get(node)?.source ?? node.data);
        if (copyEligible(node.parentElement, source)) sources.add(source);
      }
      window.parent.postMessage({ type: 'tomi:page-copy', pageKey: page.key,
        path: stripBase(window.location.pathname), sources: [...sources].slice(0, 1000) }, window.location.origin);
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, [previewMode, page?.key]);
  useEffect(() => {
    const current = loadedLanguage.current;
    document.documentElement.lang = current === 'zh' ? 'zh-Hans' : current;
    document.documentElement.dir = current === 'ar' ? 'rtl' : 'ltr';
    const folded = new Map(Object.entries(dictionary).map(([key, value]) => [key.toLowerCase(), value]));
    const templates = makeTemplateTranslations(dictionary);
    const documentCopy = previewCopy ?? publishedCopy;
    const translatedCopy = new Map(documentCopy?.copies.find(c => c.language === current)?.entries.map(e => [e.source, e.value]) ?? []);
    const englishCopy = new Map(documentCopy?.copies.find(c => c.language === 'en')?.entries.map(e => [e.source, e.value]) ?? []);
    const translate = (source: string, element?: Element | null) => {
      const key = normalize(source);
      const editable = copyEligible(element ?? null, key);
      const authored = editable ? translatedCopy.get(key) : undefined;
      const base = editable ? englishCopy.get(key) ?? key : key;
      let result = authored ?? dictionary[base] ?? folded.get(base.toLowerCase());
      if (result === undefined) {
        for (const template of templates) {
          const match = template.expression.exec(base);
          if (match) {
            result = template.value.replace(/\{(\d+)\}/g, (token, position) => {
              const index = template.positions.indexOf(position);
              return index >= 0 ? match[index + 1] : token;
            });
            break;
          }
        }
      }
      return (source.match(/^\s*/)?.[0] ?? '') + (result ?? base) + (source.match(/\s*$/)?.[0] ?? '');
    };
    const excluded = (element: Element | null) => !element || !!element.closest('script,style,textarea,input,pre,code,[translate="no"],[data-no-translate]');
    const updateText = (node: Text) => {
      if (excluded(node.parentElement) || (!normalize(node.data) && !records.current.has(node))) return;
      let record = records.current.get(node);
      if (!record) { record = { source: node.data, last: node.data }; records.current.set(node, record); }
      else if (node.data !== record.last) record.source = node.data;
      const next = translate(record.source, node.parentElement);
      record.last = next;
      if (node.data !== next) node.data = next;
    };
    const updateAttributes = (element: Element) => {
      if (element.closest('[translate="no"],[data-no-translate]')) return;
      let saved = attributes.current.get(element);
      if (!saved) { saved = new Map(); attributes.current.set(element, saved); }
      for (const key of ['placeholder', 'title', 'aria-label', 'alt', ...(element.tagName === 'META' ? ['content'] : [])]) {
        const value = element.getAttribute(key);
        if (!value) continue;
        let record = saved.get(key);
        if (!record) { record = { source: value, last: value }; saved.set(key, record); }
        else if (value !== record.last) record.source = value;
        const next = translate(record.source, element);
        record.last = next;
        if (value !== next) element.setAttribute(key, next);
      }
    };
    const walk = (root: Node) => {
      if (!root.isConnected) return;
      if (root.nodeType === Node.TEXT_NODE) return updateText(root as Text);
      if (!(root instanceof Element)) return;
      updateAttributes(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) updateText(walker.currentNode as Text);
      root.querySelectorAll('[placeholder],[title],[aria-label],[alt],meta[content]').forEach(updateAttributes);
    };
    const roots = new Set<Node>();
    let frame = 0;
    const observer = new MutationObserver(changes => {
      for (const change of changes) {
        roots.add(change.type === 'childList' ? change.target : change.target);
      }
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        const targets = [...roots]; roots.clear();
        targets.forEach(walk);
      });
    });
    walk(document.documentElement);
    observer.observe(document.documentElement, {
      subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label', 'alt', 'content'],
    });
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [dictionary, publishedCopy, previewCopy, page?.key]);
  return (
    <Context.Provider value={{ language, setLanguage, loading, dictionary }}>
      {children}
      {copyError && page && <div role="alert" className="fixed bottom-24 left-4 right-4 z-[90] rounded border border-gold-500 bg-ivory-50 p-3 text-sm text-ink-900">
        Page updates could not be loaded. <button type="button" className="underline" onClick={() => setCopyRetry(n => n + 1)}>Retry</button>
      </div>}
      {error && <div translate="no" role="alert" className="fixed bottom-4 left-4 right-4 z-[100] rounded border border-gold-500 bg-ivory-50 p-3 text-sm text-ink-900">The selected language could not be loaded. <button type="button" className="underline" onClick={() => setLanguage('en')}>Return to English</button></div>}
    </Context.Provider>
  );
}
export const useLocale = () => useContext(Context);
export function LanguageSwitcher() {
  const { language, setLanguage, loading } = useContext(Context);
  return (
    <label translate="no" className="shrink-0 text-xs text-ivory-100" title="Choose your language">
      <span className="sr-only">Choose your language</span>
      <select
        value={language} onChange={event => setLanguage(event.target.value as Language)}
        aria-label="Choose your language" aria-busy={loading}
        className="w-[4.25rem] rounded-sm border border-gold-500/40 bg-lagoon-900 px-1 py-2 text-xs text-ivory-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        data-testid="select-language"
      >
        {LANGUAGES.map(item => <option key={item.code} value={item.code}>{item.tag} · {item.label}</option>)}
      </select>
    </label>
  );
}
