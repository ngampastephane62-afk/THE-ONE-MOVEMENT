import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { socialProfileCopy } from './locales/social-profile-copy';
import { documentaryPartnersCopy } from './locales/documentary-partners-copy';
import { magazineCopy } from './locales/magazine-copy';
import { partnersCopy } from './locales/partners-copy';
import { EDITORIAL_MEDIA_COPY } from './editorial-media-copy';

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
const Context = createContext<{ language: Language; setLanguage: (value: Language) => void; loading: boolean }>({
  language: 'en', setLanguage: () => {}, loading: false,
});
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const isLanguage = (value: string | null): value is Language => LANGUAGES.some(language => language.code === value);
function initialLanguage(): Language {
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
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [dictionary, setDictionary] = useState<Dictionary>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const records = useRef(new WeakMap<Text, TextRecord>());
  const attributes = useRef(new WeakMap<Element, Map<string, TextRecord>>());
  const loadedLanguage = useRef<Language>('en');
  useEffect(() => {
    try { localStorage.setItem('tomi-language', language); } catch { /* Private browsing. */ }
    let active = true;
    setError(false);
    if (language === 'en') {
      loadedLanguage.current = 'en'; setDictionary({}); setLoading(false);
    } else {
      setLoading(true);
      const load = loaders[`./locales/${language}.json`];
      if (!load) { setError(true); setLoading(false); return; }
      load().then(value => {
        if (active) { loadedLanguage.current = language; setDictionary({ ...value, ...socialProfileCopy[language], ...documentaryPartnersCopy[language], ...magazineCopy[language], ...partnersCopy[language], ...EDITORIAL_MEDIA_COPY[language] }); setLoading(false); }
      }).catch(() => { if (active) { setError(true); setLoading(false); } });
    }
    return () => { active = false; };
  }, [language]);
  useEffect(() => {
    const handle = (event: StorageEvent) => { if (event.key === 'tomi-language' && isLanguage(event.newValue)) setLanguage(event.newValue); };
    window.addEventListener('storage', handle);
    return () => window.removeEventListener('storage', handle);
  }, []);
  useEffect(() => {
    const current = loadedLanguage.current;
    document.documentElement.lang = current === 'zh' ? 'zh-Hans' : current;
    document.documentElement.dir = current === 'ar' ? 'rtl' : 'ltr';
    const folded = new Map(Object.entries(dictionary).map(([key, value]) => [key.toLowerCase(), value]));
    const translate = (source: string) => {
      const key = normalize(source);
      const result = dictionary[key] ?? folded.get(key.toLowerCase());
      return result ? (source.match(/^\s*/)?.[0] ?? '') + result + (source.match(/\s*$/)?.[0] ?? '') : source;
    };
    const excluded = (element: Element | null) => !element || !!element.closest('script,style,textarea,input,pre,code,[translate="no"],[data-no-translate]');
    const updateText = (node: Text) => {
      if (excluded(node.parentElement) || !normalize(node.data)) return;
      let record = records.current.get(node);
      if (!record) { record = { source: node.data, last: node.data }; records.current.set(node, record); }
      else if (node.data !== record.last) record.source = node.data;
      const next = translate(record.source);
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
        const next = translate(record.source);
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
  }, [dictionary]);
  return (
    <Context.Provider value={{ language, setLanguage, loading }}>
      {children}
      {error && <div translate="no" role="alert" className="fixed bottom-4 left-4 right-4 z-[100] rounded border border-gold-500 bg-ivory-50 p-3 text-sm text-ink-900">The selected language could not be loaded. <button type="button" className="underline" onClick={() => setLanguage('en')}>Return to English</button></div>}
    </Context.Provider>
  );
}
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
