import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

interface World {
  label: string;
  text: string;
  href: string;
  cta: string;
}

const WORLDS: World[] = [
  { label: 'Business', text: 'Entrepreneurs, founders and companies meeting across borders.', href: '/ecosystem#business', cta: 'Business in the ecosystem' },
  { label: 'Culture', text: 'Identity, heritage and creative exchange between peoples.', href: '/ecosystem#art', cta: 'Culture in the ecosystem' },
  { label: 'Fashion', text: 'Where the Movement began: fashion carrying a message of peace.', href: '/ecosystem#fashion', cta: 'Fashion in the ecosystem' },
  { label: 'Music', text: 'Artists and sound as a shared language.', href: '/ecosystem#music', cta: 'Music in the ecosystem' },
  { label: 'Film', text: 'Storytellers and screen culture giving the Movement a voice.', href: '/ecosystem#film', cta: 'Film in the ecosystem' },
  { label: 'Art', text: 'Visual and performing artists building common stages.', href: '/ecosystem#art', cta: 'Art in the ecosystem' },
  { label: 'Dance', text: 'Movement of the body as dialogue and celebration.', href: '/ecosystem#dance', cta: 'Dance in the ecosystem' },
  { label: 'Programs', text: 'The official programs where the Movement meets in person.', href: '/programs', cta: 'View the programs' },
  { label: 'Institutions', text: 'Diplomatic and public bodies engaged in dialogue and cooperation.', href: '/ecosystem#diplomacy', cta: 'Institutions in the ecosystem' },
  { label: 'Opportunities', text: 'Pathways to participate, begun with an expression of interest.', href: '/join', cta: 'Express your interest' },
  { label: 'Media', text: 'Stories, press pathways and international media reach.', href: '/ecosystem#media', cta: 'Media in the ecosystem' },
  { label: 'Community', text: 'NGOs, civil society and people working for positive impact.', href: '/ecosystem#ngos', cta: 'Community in the ecosystem' },
  { label: 'Technology / AI', text: 'Innovation shaping how the Movement may connect in future.', href: '/ecosystem#technology', cta: 'Technology in the ecosystem' },
];

export default function TomiConstellation() {
  const [active, setActive] = useState(2);
  const world = WORLDS[active];
  const pts = WORLDS.map((_, i) => {
    const a = ((i / WORLDS.length) * 360 - 90) * (Math.PI / 180);
    return { x: 50 + 39 * Math.cos(a), y: 50 + 39 * Math.sin(a) };
  });

  return (
    <div className="tomi-const grid gap-8 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-7">
        <div className="tomi-const-stage" role="group" aria-label="TOMI constellation of thirteen worlds">
          <svg viewBox="0 0 100 100" className="tomi-const-svg" aria-hidden="true" focusable="false">
            <circle cx="50" cy="50" r="39" className="tomi-const-ring" />
            <circle cx="50" cy="50" r="24" className="tomi-const-ring tomi-const-ring-inner" />
            {pts.map((p, i) => (
              <line key={i} x1="50" y1="50" x2={p.x} y2={p.y} className={i === active ? 'tomi-const-spoke is-active' : 'tomi-const-spoke'} />
            ))}
          </svg>
          <div className="tomi-const-core" aria-hidden="true"><span>TOMI</span></div>
          {pts.map((p, i) => (
            <button
              key={WORLDS[i].label}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => setActive(i)}
              className={i === active ? 'tomi-const-node is-active' : 'tomi-const-node'}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span className="tomi-const-dot" />
              <span className="tomi-const-label">{WORLDS[i].label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="tomi-const-panel" aria-live="polite" data-testid="panel-constellation-world">
          <p className="text-eyebrow text-gold-400">WORLD {String(active + 1).padStart(2, '0')} OF 13</p>
          <h3 className="mt-3 text-display-md text-ivory-100" style={{ fontFamily: 'var(--font-display)' }}>
            {world.label.toUpperCase()}
          </h3>
          <p className="mt-4 leading-relaxed text-ivory-200">{world.text}</p>
          <Link
            href={world.href}
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400 hover:text-ivory-100"
            data-testid="link-constellation-world"
          >
            {world.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="tomi-const-chips mt-5" role="group" aria-label="Choose a world">
          {WORLDS.map((w, i) => (
            <button
              key={w.label}
              type="button"
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              data-testid={`button-world-${i}`}
              className={i === active ? 'is-active' : undefined}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
