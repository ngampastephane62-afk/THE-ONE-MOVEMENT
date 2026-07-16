import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { navItems } from '@/lib/navigation';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout — ink navigation bar + ink footer with bilingual signature.
 *
 * Nav: deep ink-900 surface, Cinzel wordmark, gold active indicator,
 *      gold focus rings on all links, collapsible mobile menu.
 * Footer: ink-900 surface, organised columns, bilingual signature
 *         "WE ARE ONE / نحن واحد" — Arabic rendered with IBM Plex Sans Arabic.
 *
 * RTL safety: uses logical CSS properties (ps/pe via Tailwind start/end)
 * instead of hard-coded left/right wherever possible.
 */
export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Navigation Bar ─────────────────────────────────────────────────── */}
      <header
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
        className="sticky top-0 z-50 border-b"
        role="banner"
      >
        <div
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-0"
          style={{ borderColor: 'hsl(188 46% 20%)' }}
        >
          {/* Wordmark */}
          <Link
            href="/"
            className="shrink-0 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lagoon-900 rounded-sharp"
            aria-label="The One Movement International — Home"
          >
            <span
              className="text-sm font-semibold tracking-[0.18em] uppercase"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'hsl(38 57% 94%)',
                letterSpacing: '0.16em',
              }}
            >
              THE ONE MOVEMENT
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-0"
          >
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={[
                    'relative px-3.5 py-5 text-xs font-medium tracking-widest uppercase',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1',
                    'rounded-sharp',
                    isActive
                      ? 'text-gold-400'
                      : 'text-ivory-300 hover:text-ivory-100',
                  ].join(' ')}
                  style={{ letterSpacing: '0.08em' }}
                >
                  {item.label}
                  {/* Gold underline for active */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3.5 bottom-0 h-[2px] rounded-full"
                      style={{ backgroundColor: 'hsl(43 80% 73%)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className={[
              'lg:hidden p-2 rounded-sharp',
              'text-ivory-300 hover:text-ivory-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
              'transition-colors duration-150',
            ].join(' ')}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Mobile navigation"
            className="lg:hidden border-t"
            style={{
              backgroundColor: 'hsl(188 66% 16%)',
              borderColor: 'hsl(188 46% 20%)',
            }}
          >
            <div className="mx-auto max-w-7xl px-6 py-3 flex flex-col gap-0">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={[
                      'flex items-center px-0 py-3',
                      'text-sm font-medium tracking-wide border-b',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
                      'transition-colors duration-150',
                      isActive
                        ? 'text-gold-400 border-ink-600'
                        : 'text-ivory-300 hover:text-ivory-100 border-ink-700',
                    ].join(' ')}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
        className="border-t"
        role="contentinfo"
      >
        {/* Geometric accent strip between content and footer */}
        <div
          className="border-b"
          style={{ borderColor: 'hsl(29 28% 14%)' }}
        >
          {/* Thin gold thread */}
          <div
            className="h-px w-full"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, hsl(39 52% 54% / 0.4) 30%, hsl(43 80% 73% / 0.6) 50%, hsl(39 52% 54% / 0.4) 70%, transparent 100%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Column 1 — Identity */}
            <div className="lg:col-span-1">
              <p
                className="text-xs font-semibold tracking-[0.18em] uppercase mb-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'hsl(38 57% 94%)',
                }}
              >
                The One Movement International
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'hsl(36 20% 55%)' }}>
                A permanent global ecosystem connecting culture, business, diplomacy, education, tourism, media and humanitarian impact.
              </p>
            </div>

            {/* Column 2 — Explore */}
            <div>
              <p
                className="text-eyebrow mb-4"
                style={{ color: 'hsl(39 52% 54%)' }}
              >
                Explore
              </p>
              <ul className="flex flex-col gap-2.5">
                {['Our Vision', 'Ecosystem', 'Programs', 'Impact', 'Media'].map((label) => (
                  <li key={label}>
                    <Link
                      href={`/${label.toLowerCase().replace(/ /g, '-')}`}
                      className="text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-sharp"
                      style={{ color: 'hsl(36 20% 55%)' }}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.color = 'hsl(38 57% 94%)')
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.color = 'hsl(36 20% 55%)')
                      }
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Connect */}
            <div>
              <p
                className="text-eyebrow mb-4"
                style={{ color: 'hsl(39 52% 54%)' }}
              >
                Connect
              </p>
              <ul className="flex flex-col gap-2.5">
                {['Community', 'Opportunities', 'Partners', 'Join the Movement', 'Sign In'].map((label) => (
                  <li key={label}>
                    <Link
                      href={`/${label.toLowerCase().replace(/ /g, '-')}`}
                      className="text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-sharp"
                      style={{ color: 'hsl(36 20% 55%)' }}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.color = 'hsl(38 57% 94%)')
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.color = 'hsl(36 20% 55%)')
                      }
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Bilingual signature */}
            <div className="flex flex-col justify-between">
              <div>
                <p
                  className="text-eyebrow mb-4"
                  style={{ color: 'hsl(39 52% 54%)' }}
                >
                  Legal
                </p>
                <ul className="flex flex-col gap-2.5">
                  {[['Privacy Policy', '/privacy-policy'], ['Terms', '/terms']].map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-sharp"
                        style={{ color: 'hsl(36 20% 55%)' }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLElement).style.color = 'hsl(38 57% 94%)')
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLElement).style.color = 'hsl(36 20% 55%)')
                        }
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar: copyright + bilingual signature */}
          <div
            className="mt-10 pt-8 border-t flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: 'hsl(188 46% 20%)' }}
          >
            <p className="text-xs" style={{ color: 'hsl(36 20% 45%)' }}>
              &copy; {new Date().getFullYear()} The One Movement International. All rights reserved.
            </p>

            {/*
              Bilingual signature: English / Arabic
              Arabic text gets lang="ar" for correct shaping + IBM Plex Sans Arabic via font-arabic class.
              RTL is scoped to just the Arabic span — no page-level direction change.
            */}
            <p
              className="text-sm font-semibold tracking-wide"
              style={{ color: 'hsl(43 80% 73%)' }}
              aria-label="We Are One"
            >
              WE ARE ONE{' '}
              <span
                className="mx-2 opacity-40"
                aria-hidden="true"
              >
                /
              </span>
              <span
                lang="ar"
                className="font-arabic"
                dir="rtl"
                style={{ fontFamily: 'var(--font-arabic)' }}
              >
                نحن واحد
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
