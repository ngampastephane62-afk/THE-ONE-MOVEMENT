import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { navItems } from '@/lib/navigation';

/**
 * Items shown in the desktop header nav bar.
 * JOIN THE MOVEMENT is rendered as a separated CTA button.
 * Sign In, Home, Community, Opportunities visible in mobile menu + footer.
 */
const HEADER_NAV_SLUGS = ['/our-vision', '/ecosystem', '/programs', '/impact', '/media', '/partners'];

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

  const headerNavItems = navItems.filter((item) => HEADER_NAV_SLUGS.includes(item.path));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Navigation Bar ─────────────────────────────────────────────────── */}
      <header
        style={{ backgroundColor: 'hsl(187 67% 12%)', borderColor: 'hsl(188 46% 20%)' }}
        className="sticky top-0 z-50 border-b"
        role="banner"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          {/* Wordmark */}
          <Link
            href="/"
            className="shrink-0 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 rounded-sharp"
            aria-label="The One Movement International — Home"
          >
            <span
              className="text-sm font-semibold uppercase"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'hsl(38 57% 94%)',
                letterSpacing: '0.16em',
              }}
            >
              THE ONE MOVEMENT
            </span>
          </Link>

          {/* Desktop nav links — core pages only; JOIN THE MOVEMENT is the primary CTA */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-0"
          >
            {headerNavItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={[
                    'relative px-4 py-5 text-xs font-medium uppercase',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1',
                    'rounded-sharp',
                    isActive
                      ? 'text-gold-400'
                      : 'text-ivory-300 hover:text-ivory-100',
                  ].join(' ')}
                  style={{ letterSpacing: '0.1em' }}
                >
                  {item.label}
                  {/* Gold underline — active state */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-4 bottom-0 h-[2px]"
                      style={{ backgroundColor: 'hsl(43 80% 73%)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: JOIN THE MOVEMENT primary CTA + hamburger */}
          <div className="flex items-center gap-3">
            {/* Desktop CTA — separated as primary action */}
            <Link
              href="/join"
              className={[
                'hidden lg:inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase rounded-sharp',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2',
                location === '/join' ? 'opacity-90' : '',
              ].join(' ')}
              style={{
                backgroundColor: 'hsl(39 52% 54%)',
                color: 'hsl(30 37% 7%)',
                letterSpacing: '0.1em',
              }}
            >
              Join the Movement
            </Link>

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
        </div>

        {/* Mobile menu panel — all nav items + CTA */}
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
            <div className="mx-auto max-w-7xl px-6 py-3 flex flex-col">
              {navItems.filter((item) => item.path !== '/join').map((item) => {
                const isActive = location === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={[
                      'flex items-center px-0 py-3.5',
                      'text-sm font-medium tracking-wide border-b',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
                      'transition-colors duration-150',
                      isActive
                        ? 'text-gold-400'
                        : 'text-ivory-300 hover:text-ivory-100',
                    ].join(' ')}
                    style={{ borderColor: 'hsl(188 46% 22%)' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {/* Mobile JOIN CTA */}
              <div className="pt-4 pb-2">
                <Link
                  href="/join"
                  className="flex items-center justify-center px-5 py-3 text-sm font-semibold uppercase rounded-sharp focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                  style={{
                    backgroundColor: 'hsl(39 52% 54%)',
                    color: 'hsl(30 37% 7%)',
                    letterSpacing: '0.1em',
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  Join the Movement
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        role="contentinfo"
        className="border-t"
        style={{ backgroundColor: 'hsl(187 67% 12%)', borderColor: 'hsl(188 46% 20%)' }}
      >
        {/* Gold thread separator */}
        <div
          className="h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, hsl(39 52% 54% / 0.35) 25%, hsl(43 80% 73% / 0.55) 50%, hsl(39 52% 54% / 0.35) 75%, transparent 100%)',
          }}
        />

        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Column 1 — Identity */}
            <div className="lg:col-span-1">
              <p
                className="text-sm font-semibold uppercase mb-4"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'hsl(38 57% 94%)',
                  letterSpacing: '0.14em',
                }}
              >
                The One Movement International
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(36 20% 55%)' }}>
                A permanent global ecosystem connecting culture, business, diplomacy, education, tourism, media and humanitarian impact.
              </p>
            </div>

            {/* Column 2 — Explore */}
            <div>
              <p
                className="text-eyebrow mb-5"
                style={{ color: 'hsl(39 52% 54%)' }}
              >
                Explore
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  ['Our Vision', '/our-vision'],
                  ['Ecosystem', '/ecosystem'],
                  ['Programs', '/programs'],
                  ['Impact', '/impact'],
                  ['Media', '/media'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm leading-snug transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-sharp"
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
                className="text-eyebrow mb-5"
                style={{ color: 'hsl(39 52% 54%)' }}
              >
                Connect
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  ['Community', '/community'],
                  ['Opportunities', '/opportunities'],
                  ['Partners', '/partners'],
                  ['Join the Movement', '/join'],
                  ['Sign In', '/sign-in'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm leading-snug transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-sharp"
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

            {/* Column 4 — Legal + Bilingual Signature */}
            <div className="flex flex-col gap-8">
              <div>
                <p
                  className="text-eyebrow mb-5"
                  style={{ color: 'hsl(39 52% 54%)' }}
                >
                  Legal
                </p>
                <ul className="flex flex-col gap-3">
                  {[['Privacy Policy', '/privacy-policy'], ['Terms', '/terms']].map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-sm leading-snug transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-sharp"
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

              {/* Bilingual signature in column 4 */}
              <div>
                <p
                  className="text-sm font-semibold tracking-wide"
                  style={{ color: 'hsl(43 80% 73%)' }}
                  aria-label="We Are One"
                >
                  WE ARE ONE
                </p>
                <p
                  lang="ar"
                  dir="rtl"
                  className="font-arabic mt-1 text-sm"
                  style={{
                    fontFamily: 'var(--font-arabic)',
                    color: 'hsl(43 80% 73% / 0.75)',
                  }}
                >
                  نحن واحد
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar: copyright */}
          <div
            className="mt-12 pt-8 border-t flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: 'hsl(188 46% 20%)' }}
          >
            <p className="text-xs" style={{ color: 'hsl(36 20% 40%)' }}>
              &copy; {new Date().getFullYear()} The One Movement International. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'hsl(36 20% 35%)' }}>
              One World. One Purpose. One Movement.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
