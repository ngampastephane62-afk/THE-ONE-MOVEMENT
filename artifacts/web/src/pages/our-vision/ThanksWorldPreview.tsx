import { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { COUNTRIES, COUNTRY_DATA_SOURCE, GRATITUDE_THEMES, countryLabel, searchCountries, type Country } from './country-data';

function getLocale() {
  if (typeof document !== 'undefined' && document.documentElement.lang) return document.documentElement.lang;
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
  return 'en';
}

function Flag({ country, label }: { country: Country; label: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="grid h-16 w-24 place-items-center border border-gold-500/40 bg-lagoon-900 text-center text-[10px] uppercase tracking-widest text-gold-300" data-testid="text-flag-fallback">
        {country.code}<br />flag unavailable
      </div>
    );
  }
  return (
    <img
      key={country.code}
      src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`}
      alt={`Flag of ${label}`}
      onError={() => setFailed(true)}
      className="h-16 w-24 border border-gold-500/30 object-contain"
      loading="lazy"
      data-testid="img-country-flag"
    />
  );
}

export default function ThanksWorldPreview() {
  const locale = getLocale();
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [theme, setTheme] = useState('');
  const results = useMemo(() => (query.trim() ? searchCountries(query, locale) : COUNTRIES), [query, locale]);
  const country = COUNTRIES.find((c) => c.code === code);
  const options = country && !results.some((c) => c.code === country.code) ? [country, ...results] : results;
  const label = country ? countryLabel(country, locale) : '';

  return (
    <div className="border border-gold-500/30 bg-lagoon-900/60 p-5 sm:p-8" data-testid="panel-thanks-world-preview">
      <p className="inline-flex items-center gap-2 border border-gold-500/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300" data-testid="status-preview-only">
        <Lock className="h-3.5 w-3.5" aria-hidden /> Preview only — contributions are not yet open
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="tv-country-search" className="text-eyebrow text-gold-400">Search a country</label>
          <input
            id="tv-country-search"
            type="search"
            value={query}
            maxLength={100}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a country name"
            className="mt-2 w-full min-h-[48px] border border-gold-500/30 bg-lagoon-900 px-3 text-ivory-100 placeholder:text-ivory-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            data-testid="input-country-search"
          />
          <label htmlFor="tv-country-select" className="mt-4 block text-eyebrow text-gold-400">Select a country</label>
          <select
            id="tv-country-select"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-2 w-full min-h-[48px] border border-gold-500/30 bg-lagoon-900 px-3 text-ivory-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            data-testid="select-country"
          >
            <option value="">{results.length ? `Choose from ${results.length} results` : 'No results'}</option>
            {options.map((c) => <option key={c.code} value={c.code}>{countryLabel(c, locale)}</option>)}
          </select>
          <p role="status" aria-live="polite" className="sr-only">{query.trim() ? `${results.length} matching countries or territories` : ''}</p>
          {results.length === 0 && <p role="status" className="mt-2 text-sm text-ivory-300" data-testid="text-country-no-results">No country or territory matches “{query}”. Try another spelling.</p>}

          <fieldset className="mt-6">
            <legend className="text-eyebrow text-gold-400">Gratitude theme</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {GRATITUDE_THEMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={theme === t}
                  onClick={() => setTheme(theme === t ? '' : t)}
                  className={`min-h-[44px] border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${theme === t ? 'border-gold-400 bg-gold-500/15 text-gold-200' : 'border-gold-500/25 text-ivory-200 hover:border-gold-500/60'}`}
                  data-testid={`button-theme-${t.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="border border-gold-500/20 p-5" aria-live="polite" data-testid="card-country-preview">
          {country ? (
            <>
              <Flag key={country.code} country={country} label={label} />
              <h4 className="mt-4 font-display text-3xl text-ivory-100" data-testid="text-country-name">{label}</h4>
              <dl className="mt-4 space-y-2 text-sm text-ivory-300">
                <div><dt className="inline text-gold-400">Region: </dt><dd className="inline" data-testid="text-country-region">{country.subregion || country.region}</dd></div>
                <div><dt className="inline text-gold-400">Continent / geographic grouping: </dt><dd className="inline" data-testid="text-country-continent">{country.continents.join(', ')}</dd></div>
                <div><dt className="inline text-gold-400">Theme: </dt><dd className="inline" data-testid="text-country-theme">{theme || 'Not selected'}</dd></div>
              </dl>
            </>
          ) : (
            <div className="grid h-full min-h-[180px] place-items-center text-center text-sm text-ivory-300">
              <p>Select a country or territory to preview how a gratitude story could be framed. No personal or nationality information is requested.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-gold-500/20 pt-5 text-sm leading-relaxed text-ivory-300">
        <p><strong className="text-ivory-100">Story submission is not yet available.</strong> The future contribution experience is proposed to include: selected country, gratitude theme, message or story, optional approved image, publication consent and privacy preferences. Contributions will require validation and moderation and will never be published automatically.</p>
        <p className="mt-3 text-xs opacity-80" data-testid="text-country-source">Countries and territories, regions and geographic groupings come from a local snapshot ({COUNTRY_DATA_SOURCE.snapshotDate}) of <a href={COUNTRY_DATA_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline decoration-gold-500/60 hover:text-gold-200">{COUNTRY_DATA_SOURCE.name}</a>, licensed under <a href={COUNTRY_DATA_SOURCE.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-gold-500/60 hover:text-gold-200">{COUNTRY_DATA_SOURCE.license}</a>. Groupings follow that source, are not an official UN M49 classification, and do not represent political endorsements. Browsing requires no nationality disclosure.</p>
      </div>
    </div>
  );
}
