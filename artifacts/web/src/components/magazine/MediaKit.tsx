import { Link } from 'wouter';
import { Download } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { KIT, KIT_PDF_URL } from './editorial-data';

const Eyebrow = ({ n, children }: { n: string; children: string }) => (
  <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-600"><span className="font-display text-base text-ink-900">{n}</span><span className="h-px w-8 bg-gold-500" />{children}</p>
);
const Bullets = ({ items }: { items: string[] }) => (
  <ul className="mt-4 divide-y divide-ink-900/10 border-y border-ink-900/10">{items.map((i) => <li key={i} className="py-2.5 text-[15px] text-ink-800">{i}</li>)}</ul>
);

export function KitDownload({ compact }: { compact?: boolean }) {
  return (
    <a href={KIT_PDF_URL} download className={`inline-flex items-center gap-3 border border-ink-900 ${compact ? 'px-4 py-3' : 'px-6 py-4'} text-xs font-semibold uppercase tracking-[0.2em] text-ink-900 transition-colors hover:bg-ink-900 hover:text-ivory-50`} data-testid={compact ? 'link-kit-pdf-compact' : 'link-kit-pdf'}>
      <Download className="h-4 w-4" aria-hidden="true" />Download the media kit PDF · Free
    </a>
  );
}

export default function MediaKit() {
  return (
    <section id="media-kit" className="scroll-mt-24 border-t border-ink-900/15 bg-ivory-100" aria-labelledby="kit-heading" data-testid="section-media-kit">
      {/* 01 cover */}
      <div className="relative overflow-hidden border-b border-ink-900/15">
        <div className="pointer-events-none absolute -bottom-8 right-0 select-none font-display text-[30vw] leading-none text-gold-500/10" aria-hidden="true">2026</div>
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <Eyebrow n="01">Tropik Magazine · Media kit 2026</Eyebrow>
          <h2 id="kit-heading" className="mt-6 font-display text-[clamp(3.5rem,12vw,9rem)] leading-[0.85] text-ink-900">Be global.</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-800">The full 2026 media kit, readable here page by page. Published by Tropik Agency FZ LLC, Dubai. The PDF is free to download.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4"><KitDownload /><span className="text-xs text-ink-700">Free · no account needed</span></div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-20 px-6 py-16 md:space-y-28 md:py-24">
        {/* 02 platform */}
        <Reveal>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5"><Eyebrow n="02">The platform</Eyebrow><h3 className="mt-5 font-display text-4xl leading-[0.95] md:text-6xl">An international media platform with African roots</h3></div>
            <div className="space-y-4 text-[1.05rem] leading-relaxed text-ink-800 md:col-span-7">
              <p>Tropik Magazine is an international print and digital media platform dedicated to fashion, culture, business, lifestyle and emerging talent connecting African creativity with global audiences.</p>
              <p>With five successful editions produced, the magazine has established itself as a growing voice in the global creative industry, connecting talents, brands and audiences across continents.</p>
              <p>Our mission is to highlight stories, build visibility and create opportunities for individuals, brands and institutions through premium storytelling and international media exposure.</p>
            </div>
          </div>
          <p className="mt-12 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-700">At a glance</p>
          <dl className="mt-3 grid grid-cols-2 gap-px bg-ink-900/15 md:grid-cols-4">
            {KIT.stats.map((s) => <div key={s.l} className="bg-ivory-100 p-5"><dd className="font-display text-4xl text-lagoon-900 md:text-5xl" translate="no">{s.v}</dd><dt className="mt-1 text-xs uppercase tracking-[0.15em] text-ink-700">{s.l}</dt></div>)}
          </dl>
          <p className="mt-4 text-sm text-ink-800">Our content reaches a global audience of creatives, entrepreneurs, brands, institutions and industry professionals across print, digital, social and partner media. <em className="font-display">Storytelling with reach.</em></p>
          <p className="mt-2 text-xs text-ink-700" data-testid="text-kit-figures-note">Figures as stated by Tropik in its 2026 media kit; not independently audited audience measurements.</p>
        </Reveal>

        {/* 03 reach */}
        <Reveal>
          <Eyebrow n="03">Reach & distribution</Eyebrow>
          <div className="mt-6 grid gap-px bg-ink-900/15 sm:grid-cols-2 lg:grid-cols-4">
            {KIT.reach.map((r) => <div key={r.k} className="bg-ivory-50 p-5"><p className="font-display text-2xl text-ink-900">{r.k}</p><p className="mt-2 text-sm leading-relaxed text-ink-800">{r.v}</p></div>)}
          </div>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-700">Where the magazine is placed</p><Bullets items={KIT.placed} /></div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-700">Why placement matters</p>
              <p className="mt-4 leading-relaxed text-ink-800">A magazine left in a hotel suite, a lounge or a fashion show is read slowly, by an audience that chose to pick it up. That attention is different in kind from a scroll.</p>
              <p className="mt-3 leading-relaxed text-ink-800">Combined with digital publication and social amplification, each feature reaches its audience in both registers the considered one and the immediate one.</p>
              <p className="mt-5 font-display text-2xl text-lagoon-900">One feature. Four channels.</p>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-700">Print + Digital + Social + Partner Media</p>
            </div>
          </div>
        </Reveal>

        {/* 04 ecosystem */}
        <Reveal>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4"><Eyebrow n="04">Editorial ecosystem</Eyebrow><h3 className="mt-5 font-display text-4xl md:text-6xl">More than a magazine</h3><p className="mt-4 leading-relaxed text-ink-800">Tropik is not a single publication but a media ecosystem. A partnership can move through six channels, each reinforcing the others, according to the scope agreed.</p></div>
            <ol className="grid gap-px bg-ink-900/15 sm:grid-cols-2 md:col-span-8">
              {KIT.channels.map((c, i) => <li key={c.k} className="bg-ivory-100 p-5"><span className="font-display text-sm text-gold-600">0{i + 1}</span><p className="font-display text-2xl text-ink-900">{c.k}</p><p className="mt-1 text-sm leading-relaxed text-ink-800">{c.v}</p></li>)}
            </ol>
          </div>
          <p className="mt-10 max-w-3xl font-display text-3xl italic leading-snug text-ink-900 md:text-4xl">A story told once is an article. Told across six channels, it becomes a presence.</p>
        </Reveal>

        {/* 05 why */}
        <Reveal>
          <Eyebrow n="05">Why Tropik</Eyebrow>
          <h3 className="mt-5 font-display text-4xl md:text-6xl">Five reasons institutions and brands partner with us</h3>
          <ol className="mt-8 divide-y divide-ink-900/15 border-y border-ink-900/15">
            {KIT.reasons.map((r, i) => <li key={r.k} className="grid gap-2 py-5 md:grid-cols-12"><span className="font-display text-2xl text-gold-600 md:col-span-1">{['I', 'II', 'III', 'IV', 'V'][i]}</span><p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-900 md:col-span-4">{r.k}</p><p className="leading-relaxed text-ink-800 md:col-span-7">{r.v}</p></li>)}
          </ol>
          <p className="mt-6 max-w-2xl font-display text-2xl italic text-ink-800">Tropik Magazine is more than a publication. It is a media platform designed to elevate image, story and reach.</p>
        </Reveal>

        {/* scope note */}
        <div className="border-l-2 border-gold-500 bg-ivory-50 px-5 py-4 text-sm leading-relaxed text-ink-800" data-testid="text-partnership-scope-note">
          <strong className="font-semibold text-ink-900">About the partnerships below.</strong> These are the kit’s editorial partnerships, agreed directly with Tropik after a discussion. They are not reader-copy prices and cannot be bought on this site. The separate standalone inside-page proposal (USD 200) lives in the <Link href="/tropik-magazine/contribute" className="font-semibold text-lagoon-700 underline underline-offset-4">contributor space</Link>.
        </div>

        {/* 06 entry */}
        <Reveal>
          <Eyebrow n="06">Media partnership opportunities — I</Eyebrow>
          <div className="mt-6 grid gap-8 border border-ink-900/20 bg-ivory-50 p-6 md:grid-cols-12 md:p-10">
            <div className="md:col-span-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-600">Entry partnership</p>
              <h3 className="mt-2 font-display text-5xl">Digital Feature</h3>
              <p className="mt-3 font-display text-3xl text-lagoon-900" translate="no">USD 1,000</p>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-700">Included</p>
              <Bullets items={['Premium digital editorial feature', 'Publication through Tropik’s digital ecosystem', 'Social media visibility across Instagram and Facebook', 'International digital exposure', 'Professional editorial positioning']} />
            </div>
            <div className="space-y-5 md:col-span-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-700">Who it suits</p>
              <p className="leading-relaxed text-ink-800">Founders, professionals and organisations seeking a first international editorial presence, or testing the platform before a print partnership.</p>
              <p className="leading-relaxed text-ink-800">The feature remains published and searchable — an asset that continues working after the campaign ends.</p>
              <div className="flex gap-5 border-t border-ink-900/15 pt-5"><span className="font-display text-5xl text-gold-600">10</span><p className="text-sm leading-relaxed text-ink-800"><strong className="block text-[11px] uppercase tracking-[0.2em]">Printed copies included</strong>A print allocation is included with every partnership — copies of the edition for your own distribution to clients, delegations, guests or stakeholders. Presented as an included allocation, not as retail value. Final quantity, format and delivery conditions are subject to production confirmation.</p></div>
            </div>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-ink-700">Documented platform statistics apply. No readership figures beyond those published in this document are represented or implied.</p>
        </Reveal>

        {/* 07 premium */}
        <Reveal>
          <Eyebrow n="07">Media partnership opportunities — II</Eyebrow>
          <h3 className="mt-5 font-display text-4xl md:text-6xl">Premium editorial partnerships</h3>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-800">Print and digital, combined. Each partnership includes editorial production, publication across the ecosystem and a print allocation for your own distribution.</p>
          <div className="mt-8 grid gap-px bg-ink-900/15 md:grid-cols-3">
            {KIT.premium.map((p) => (
              <div key={p.k} className="flex flex-col bg-ivory-100 p-6" data-testid={`kit-tier-${p.alloc}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-600">{p.k}</p>
                <p className="mt-2 font-display text-4xl text-ink-900" translate="no">{p.price}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-ink-800">{p.items.map((i) => <li key={i}>— {i}</li>)}</ul>
                <p className="mt-6 border-t border-ink-900/15 pt-4"><span className="font-display text-3xl text-lagoon-900">{p.alloc}</span> <span className="text-[11px] uppercase tracking-[0.2em] text-ink-700">print allocation</span></p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-700">A note on what these are</p><p className="mt-2 leading-relaxed text-ink-800">These are editorial partnerships, not advertising placements. Each is produced with our editorial team: interview, narrative, photography direction and layout to the standard of the magazine itself. The page is designed to be read, not skipped.</p></div>
            <p className="self-end text-sm leading-relaxed text-ink-700">Final print quantity, format and delivery conditions are subject to production confirmation. Sponsored partnerships are clearly identified in accordance with applicable editorial and advertising standards.</p>
          </div>
        </Reveal>

        {/* 08 signature */}
        <Reveal>
          <div className="bg-lagoon-900 p-6 text-ivory-50 md:p-12">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400"><span className="font-display text-base text-ivory-50">08</span><span className="h-px w-8 bg-gold-500" />Institutional visibility</p>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-ivory-300">For governments, ministries, institutions and corporations</p>
            <h3 className="mt-2 font-display text-5xl md:text-7xl">Signature Partnership</h3>
            <p className="mt-4 max-w-2xl leading-relaxed text-ivory-200">For institutions seeking a stronger international editorial presence. A Signature Partnership is designed around the message, not around a page count — developed jointly, and scoped to the mandate being communicated.</p>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Customisable elements</p><ul className="mt-3 space-y-1.5 text-sm text-ivory-100">{KIT.signatureElements.map((i) => <li key={i}>— {i}</li>)}</ul></div>
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">What institutions communicate</p><ul className="mt-3 space-y-1.5 text-sm text-ivory-100">{KIT.institutionsCommunicate.map((i) => <li key={i}>— {i}</li>)}</ul></div>
            </div>
            <div className="mt-8 border-t border-ivory-50/15 pt-6"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Why editorial rather than advertising</p><p className="mt-2 max-w-3xl leading-relaxed text-ivory-200">An advertisement states a position. An editorial feature explains it — with context, with a named voice, and in a form an international reader, investor or counterpart will actually finish. For an institution communicating a mandate abroad, the second is the more useful instrument.</p></div>
            <p className="mt-6 text-sm text-ivory-300">Customised partnership proposals are available upon request. Scope, editorial treatment, print allocation and investment are defined together following an initial discussion. <em className="font-display text-ivory-100">Scoped to the mandate.</em></p>
          </div>
        </Reveal>

        {/* 09 cover */}
        <Reveal>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5"><Eyebrow n="09">Media partnership opportunities — III</Eyebrow><p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-600">Exterior cover</p><h3 className="mt-2 font-display text-5xl md:text-6xl">Cover Partnership</h3><p className="mt-3 font-display text-4xl text-lagoon-900" translate="no">USD 30,000</p><p className="mt-6 font-display text-2xl italic text-ink-800">One cover, one edition.</p></div>
            <div className="md:col-span-7">
              <p className="leading-relaxed text-ink-800">The most prominent placement the magazine offers. Reserved for a major brand, institution, organisation or special campaign, and treated as a bespoke editorial project rather than a purchased position.</p>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-700">Possible benefits</p>
              <Bullets items={KIT.coverBenefits} />
              <p className="mt-4 text-sm text-ink-800"><strong className="text-[11px] uppercase tracking-[0.2em]">Print allocation:</strong> custom, to be confirmed.</p>
              <p className="mt-4 border-l-2 border-gold-500 pl-4 text-sm leading-relaxed text-ink-700"><strong className="block text-[11px] uppercase tracking-[0.2em] text-ink-900">Editorial standards</strong>Cover placement and editorial content are distinct, and the final commercial agreement defines which applies. Sponsored partnerships are clearly identified in accordance with applicable editorial and advertising standards; no independent editorial endorsement is implied where content is sponsored.</p>
            </div>
          </div>
        </Reveal>

        {/* 10 contact */}
        <Reveal>
          <div className="border-t-2 border-ink-900 pt-10">
            <Eyebrow n="10">Partnership inquiries</Eyebrow>
            <h3 className="mt-5 font-display text-5xl md:text-7xl">Let’s create impact</h3>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-800">Tropik Magazine creates a bridge between African stories, global audiences, institutions, brands and opportunities.</p>
            <dl className="mt-10 grid gap-px bg-ink-900/15 sm:grid-cols-3" translate="no">
              <div className="bg-ivory-100 p-5"><dt className="text-[11px] uppercase tracking-[0.2em] text-ink-700">Published by</dt><dd className="mt-2 font-display text-xl">Tropik Agency FZ LLC</dd><dd className="text-sm text-ink-700">Dubai, United Arab Emirates</dd></div>
              <div className="bg-ivory-100 p-5"><dt className="text-[11px] uppercase tracking-[0.2em] text-ink-700">Online</dt><dd className="mt-2"><a href="https://tropikagency.com" target="_blank" rel="noreferrer" className="font-display text-xl text-lagoon-700 underline underline-offset-4" data-testid="link-kit-website">TropikAgency.com</a></dd></div>
              <div className="bg-ivory-100 p-5"><dt className="text-[11px] uppercase tracking-[0.2em] text-ink-700">Instagram</dt><dd className="mt-2"><a href="https://www.instagram.com/tropikagencecom" target="_blank" rel="noreferrer" className="font-display text-xl text-lagoon-700 underline underline-offset-4" data-testid="link-kit-instagram">@tropikagencecom</a></dd></div>
            </dl>
            <div className="mt-8"><KitDownload /></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
