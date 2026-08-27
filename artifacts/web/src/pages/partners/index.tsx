import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getVisiblePartnersByCategory,
  type PartnerCategorySlug,
} from '@/lib/partners-data';
import { PARTNER_CATEGORY_SLUGS } from '@workspace/shared/taxonomy';

/* ── Category display metadata ─────────────────────────────────────────────── */

const CATEGORY_META: Record<
  PartnerCategorySlug,
  { label: string; description: string }
> = {
  sponsors: {
    label: 'Sponsors',
    description:
      "Organizations investing in the Movement's programs, initiatives and reach.",
  },
  partners: {
    label: 'Partners',
    description:
      'Strategic collaborators building programs, opportunities and impact alongside us.',
  },
  institutions: {
    label: 'Institutions',
    description:
      "Established organizations aligning with the Movement's mission through recognized cooperation.",
  },
  companies: {
    label: 'Companies',
    description:
      'Businesses joining the ecosystem to connect, collaborate and grow.',
  },
  ngos: {
    label: 'NGOs',
    description:
      'Civil-society organizations working with the Movement on humanitarian and community outcomes.',
  },
  universities: {
    label: 'Universities',
    description:
      'Academic institutions engaging with the Movement through research, students and cultural exchange.',
  },
  governments: {
    label: 'Governments',
    description:
      'Public bodies and diplomatic missions working alongside the Movement.',
  },
  ambassadors: {
    label: 'Ambassadors',
    description:
      "Individuals associated with the Movement's values in their region or field; any representative status requires confirmation.",
  },
  'strategic-supporters': {
    label: 'Strategic Supporters',
    description:
      "Media, cultural and community organizations amplifying the Movement's voice.",
  },
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function Partners() {
  return (
    <div>
      <Helmet>
        <title>OUR PARTNERS — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta
          name="description"
          content="The institutions, organizations and individuals building The One Movement International — a global ecosystem of partnership, purpose and impact."
        />
        <meta property="og:title" content="OUR PARTNERS — THE ONE MOVEMENT INTERNATIONAL" />
        <meta
          property="og:description"
          content="The institutions, organizations and individuals building The One Movement International — a global ecosystem of partnership, purpose and impact."
        />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href="/partners" />
      </Helmet>

      {/* ─────────────────────────────────────────────────────────────────────
          1. HERO — HeroSurface lagoon radiant, restrained
          ───────────────────────────────────────────────────────────────────── */}
      <HeroSurface glowOrigin="bottom-center" minHeight="70vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <p className="text-eyebrow text-gold-400 mb-6 animate-fade-in">
            OUR PARTNERS &amp; ALLIES
          </p>
          <h1
            className="text-display-xl text-ivory-100 uppercase animate-fade-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            WHO WE STAND WITH.
          </h1>
          <GoldThread className="mt-8" length="200px" node />
          <p
            className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-2xl animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            The One Movement International grows through the institutions,
            organizations and individuals who choose to build with us.
          </p>
        </div>
      </HeroSurface>

      {/* ─────────────────────────────────────────────────────────────────────
          2. WHAT PARTNERSHIP MEANS — ivory, asymmetric
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(60 9% 97%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="PARTNERSHIP IN THE MOVEMENT"
              heading="MORE THAN A LOGO. A COMMITMENT TO CONNECTION."
              surface="light"
              thread
            />
            <p className="mt-8 text-lagoon-800 text-lg leading-relaxed">
              Partnership within The One Movement International is a working
              relationship — not a promotional badge. Our partners contribute
              expertise, reach, resources or presence to the Movement&apos;s
              developing ecosystem across culture, business, diplomacy and impact.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          3. THE CATEGORIES — lagoon-900 dark band
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 8%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="OUR ECOSYSTEM PARTNERS"
            heading="NINE PATHS INTO THE MOVEMENT."
            surface="dark"
            thread
          />

          {/* Nine category sections */}
          <div className="mt-16 space-y-16">
            {(PARTNER_CATEGORY_SLUGS as readonly PartnerCategorySlug[]).map((slug) => {
              const meta = CATEGORY_META[slug];
              const entities = getVisiblePartnersByCategory(slug);

              return (
                <div key={slug}>
                  {/* Category heading */}
                  <h3
                    className="text-2xl text-ivory-100 uppercase tracking-wider mb-3"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {meta.label}
                  </h3>
                  <p className="text-ivory-400 text-base leading-relaxed max-w-2xl">
                    {meta.description}
                  </p>

                  {/* Partner cards — only when authorized entities exist */}
                  {entities.length > 0 && (
                    <ul
                      className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      aria-label={`${meta.label} partners`}
                    >
                      {entities.map((entity) => (
                        <li key={entity.slug}>
                          <Link
                            href={`/partners/${entity.slug}`}
                            className={cn(
                              'block rounded-sm border border-gold-500/20 bg-lagoon-800/40',
                              'p-6 transition-colors hover:border-gold-500/40 hover:bg-lagoon-800/60',
                              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
                            )}
                          >
                            <p
                              className="text-base font-semibold text-ivory-100 uppercase tracking-wide"
                              style={{ fontFamily: 'var(--font-display)' }}
                            >
                              {entity.name}
                            </p>
                            <p className="mt-1 text-sm text-ivory-400">
                              {entity.country}
                            </p>
                            {entity.role && (
                              <p className="mt-2 text-sm text-ivory-300 leading-relaxed">
                                {entity.role}
                              </p>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* When empty: no placeholder, no silhouette — description stands alone */}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4. AUTHORIZATION STATEMENT — ivory, short
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(60 9% 97%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="OUR DISPLAY POLICY"
              heading="EVERY NAME HERE IS INTENTIONAL."
              surface="light"
              thread
            />
            <p className="mt-8 text-lagoon-800 text-lg leading-relaxed">
              Every organization and individual listed on this page has provided
              written authorization to appear here. We do not display logos,
              names or endorsements without documented consent.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          5. INSTITUTIONAL PATHWAY — lagoon-900
          Anchor: /join#institutional-inquiry (confirmed present at join page
          line 405: id="institutional-inquiry")
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 8%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="BECOME A PARTNER"
            heading="PARTNERSHIP BEGINS WITH A CONVERSATION."
            surface="dark"
            thread
          />
          <p className="mt-8 text-ivory-300 text-lg leading-relaxed max-w-2xl">
            Embassies, governments, international organizations, universities,
            NGOs, sponsors, partners and media organizations join the Movement
            through direct dialogue with our team. Every collaboration begins
            with a conversation — never a form filled in isolation.
          </p>
          <div className="mt-10">
            <Link
              href="/join#institutional-inquiry"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 focus-visible:outline-offset-2',
              )}
            >
              BEGIN THE CONVERSATION
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          6. CLOSING SIGNATURE — bilingual
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-16 flex items-center justify-center"
        style={{ backgroundColor: 'hsl(187 67% 8%)' }}
        aria-label="Closing signature"
      >
        <p className="text-xs text-ivory-400 tracking-[0.3em] uppercase select-none">
          WE ARE ONE —{' '}
          <span lang="ar" dir="rtl" className="font-normal not-italic">
            نحن واحد
          </span>
        </p>
      </section>
    </div>
  );
}
