import { Link } from 'wouter';
import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

const asset = (name: string) => `${import.meta.env.BASE_URL}api/documentary/media/${name}`;

type Desk = { no: string; kicker: string; title: string; body: string; href: string; cta: string; testid: string };

const DESKS: Desk[] = [
  { no: '01', kicker: 'MEDIA & MAGAZINE', title: 'In the press.', body: 'Coverage of the Movement by newspapers, magazines and broadcasters is collected on the News page, with each article credited to its publication.', href: '/news', cta: 'Read the coverage on News', testid: 'media' },
  { no: '03', kicker: 'HUMANITARIAN', title: 'Goma, with UNHCR.', body: 'According to the Founder, the Movement’s humanitarian action in Goma was carried out in collaboration with UNHCR, the UN Refugee Agency.', href: '/impact', cta: 'See the humanitarian work', testid: 'humanitarian' },
  { no: '04', kicker: 'DIPLOMATIC', title: 'Named official meetings.', body: 'Embassies, consulates and private offices the Movement has worked with. Each relationship is presented as it took place, not as a government endorsement.', href: '#history-diplomatic', cta: 'See diplomatic partners', testid: 'diplomatic' },
  { no: '05', kicker: 'BUSINESS', title: 'Enterprise and the creative economy.', body: 'Rawbank, private groups and international brands that have partnered with the Movement are presented above.', href: '#history-banking', cta: 'See the business partners', testid: 'business' },
  { no: '06', kicker: 'BILATERAL RELATIONS', title: 'Africa, the UAE and beyond.', body: 'The Movement works between African nations, the United Arab Emirates and international institutions, connecting cultural programmes across borders.', href: '/join#institutional-inquiry', cta: 'Propose an exchange', testid: 'bilateral' },
];

function DeskLink({ href, children, testid }: { href: string; children: string; testid: string }) {
  const cls = 'mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-lagoon-700 underline underline-offset-4 hover:text-gold-700';
  return href.startsWith('#')
    ? <a href={href} className={cls} data-testid={`link-desk-${testid}`}><span>{children}</span><ArrowUpRight className="h-3.5 w-3.5" /></a>
    : <Link href={href} className={cls} data-testid={`link-desk-${testid}`}><span>{children}</span><ArrowUpRight className="h-3.5 w-3.5" /></Link>;
}

export default function PartnerEditorial() {
  useEffect(() => {
    const scrollToArticle = () => {
      const id = window.location.hash.slice(1);
      if (id === 'partner-editorial-heading' || id === 'ben-amadasun') {
        document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    };
    scrollToArticle();
    window.addEventListener('hashchange', scrollToArticle);
    return () => window.removeEventListener('hashchange', scrollToArticle);
  }, []);
  return (
    <section className="relative border-t border-sand-300 bg-ivory-100 py-section-lg" aria-labelledby="partner-editorial-heading" data-testid="section-partner-editorial">
      <div className="mx-auto max-w-7xl px-6">
        {/* Masthead */}
        <header className="border-y-4 border-double border-ink-900 py-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-ink-700">The Partners Edition · The One Movement International & Tropik</p>
          <h2 id="partner-editorial-heading" className="mt-3 scroll-mt-28 font-display text-[clamp(2.4rem,7vw,5.5rem)] uppercase leading-[0.9] text-ink-900">The Relationship Review</h2>
          <p className="mt-3 text-sm italic text-ink-700">African creativity, humanitarian action and institutional dialogue, filed by desk.</p>
        </header>

        {/* Lead story: CANAL+ */}
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <article className="lg:col-span-8 lg:border-r lg:border-sand-300 lg:pr-10" data-testid="article-canal-plus">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700">02 · Broadcaster</p>
            <div className="mt-4 flex flex-wrap items-center gap-6">
              <div className="bg-ink-900 px-5 py-4"><img src={asset('canal-logo.png')} alt="CANAL+ logo" className="h-8 w-auto sm:h-10" loading="lazy" data-testid="img-canal-logo" /></div>
              <h3 className="font-display text-3xl uppercase leading-tight text-ink-900 sm:text-4xl">On air with CANAL+.</h3>
            </div>
            <div className="mt-6 gap-8 text-[15px] leading-relaxed text-ink-800 sm:columns-2">
              <p className="first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-gold-700">A previous documentary about the Movement was broadcast via CANAL+, the international media and entertainment group active in production, broadcasting, distribution and streaming.</p>
              <p className="mt-4">That broadcast belongs to the Movement’s history. It is recorded here as a past programme, not as a future commission. The films of the collection, from Goma onwards, can be watched on the documentary page.</p>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-800">With MultiChoice, CANAL+ now spans DStv, GOtv and Showmax, and offers Netflix within its African subscriptions. The full broadcast file is on the documentary page.</p>
            <div className="mt-6 flex flex-wrap gap-x-8 border-t border-sand-300 pt-4">
              <a href={`${import.meta.env.BASE_URL}the-one-documentary#broadcast-distribution`} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-broadcast-distribution"><span>Read the broadcast file</span><ArrowUpRight className="h-3.5 w-3.5" /></a>
              <Link href="/the-one-documentary" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-documentary-collection"><span>Watch the documentary collection</span><ArrowUpRight className="h-3.5 w-3.5" /></Link>
              <Link href="/the-one-documentary#production-partner" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-production-partner"><span>Production partner: The Film Makers</span><ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </div>
          </article>

          <aside className="lg:col-span-4" data-testid="aside-production-partner">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700">Production partner</p>
            <h3 className="mt-3 font-display text-2xl text-ink-900">The Film Makers</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-800">Production partner for the documentary: The Film Makers, led by Qais Qandil.</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-800">An Abu Dhabi production company preparing the Founder’s new documentary production. Its full profile and filmography live on the documentary page.</p>
            <Link href="/the-one-documentary#production-partner" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-meet-producer">Meet the production partner</Link>
          </aside>
        </div>

        {/* Desks */}
        <div className="mt-14 grid border-t-2 border-ink-900 sm:grid-cols-2 lg:grid-cols-5">
          {DESKS.map((d) => (
            <article key={d.no} className="border-b border-sand-300 py-6 sm:px-5 sm:[&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0 lg:first:pl-0" data-testid={`desk-${d.testid}`}>
              <p className="font-display text-3xl text-gold-600">{d.no}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-700">{d.kicker}</p>
              <h3 className="mt-2 font-display text-xl leading-snug text-ink-900">{d.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-800">{d.body}</p>
              <DeskLink href={d.href} testid={d.testid}>{d.cta}</DeskLink>
            </article>
          ))}
        </div>

        {/* Industry profile: Ben Amadasun */}
        <article id="ben-amadasun" className="mt-16 grid scroll-mt-28 gap-0 overflow-hidden border border-ink-900 bg-ivory-50 lg:grid-cols-12" data-testid="profile-ben-amadasun">
          <figure className="relative bg-lagoon-900 lg:col-span-5">
            <img src={asset('ben-amadasun.webp')} alt="Ben Amadasun" className="aspect-[4/5] h-full w-full object-cover" loading="lazy" data-testid="img-ben-amadasun" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/90 to-transparent px-5 pb-4 pt-10 text-xs text-ivory-200">Photo: African Business · supplied by the Founder</figcaption>
          </figure>
          <div className="p-6 sm:p-10 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-4">
              <img src={asset('netflix-logo.svg')} alt="Netflix logo" className="h-8 w-auto sm:h-10" loading="lazy" data-testid="img-netflix-logo" />
              <span className="border border-ink-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-700" data-testid="label-industry-profile">Industry profile · no TOMI partnership announced</span>
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700">The screen industry · Africa</p>
            <h3 className="mt-2 font-display text-4xl uppercase leading-none text-ink-900 sm:text-5xl">Ben Amadasun</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-800">In an African Business interview published on 28 February 2023, Ben Amadasun was introduced as Netflix’s director of content for the Middle East and Africa. A Netflix release of 3 September 2024 named him VP Content, Middle East & Africa.</p>
            <blockquote className="my-6 border-l-4 border-gold-500 pl-5">
              <p className="font-display text-xl leading-snug text-ink-900 sm:text-2xl">“Shows made in Africa, by Africans, get watched around the world.”</p>
              <cite className="mt-2 block text-xs not-italic text-ink-700">Ben Amadasun · African Business, 28 February 2023</cite>
            </blockquote>
            <p className="text-[15px] leading-relaxed text-ink-800">In these sources he emphasises authentic African stories told by local talent, made for audiences at home and around the world. This profile provides industry context; no TOMI partnership, sponsorship or commission with Netflix is announced here.</p>
            <div className="mt-6 flex flex-col gap-1 border-t border-sand-300 pt-4 sm:flex-row sm:gap-8">
              <a href="https://african.business/2023/02/trade-investment/ben-amadasun-shows-made-in-africa-by-africans-get-watched-around-the-world" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-source-african-business"><span>African Business · 28 February 2023</span><ArrowUpRight className="h-3.5 w-3.5" /></a>
              <a href="https://about.netflix.com/news/netflix-showcases-upcoming-2024-films-and-series-from-south-africa" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-lagoon-700 underline underline-offset-4" data-testid="link-source-netflix"><span>Netflix · 3 September 2024</span><ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </article>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs italic leading-relaxed text-ink-700">Dates and programme details for each partnership will be added to partner profiles over time.</p>
      </div>
    </section>
  );
}
