import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeroSurface from '@/components/HeroSurface';
import GoldThread from '@/components/GoldThread';
import SectionHeading from '@/components/SectionHeading';
import GeometricAccent from '@/components/GeometricAccent';
import PhotoSlot from '@/components/PhotoSlot';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SECTORS, getSectorBySlug, type Sector } from '@/lib/sectors-data';
import Reveal from '@/components/Reveal';

/* ── Constants ────────────────────────────────────────────────────────────── */

// Inner ring: first 7 sectors
const INNER_SECTORS = SECTORS.slice(0, 7);
// Outer ring: remaining 8 sectors
const OUTER_SECTORS = SECTORS.slice(7, 15);

const SVG_W = 580;
const SVG_H = 490;
const CX = 290;
const CY = 245;
const INNER_R = 108;
const OUTER_R = 188;
const NODE_R = 9;
const NODE_R_ACTIVE = 12;
const HIT_R = 20;
const LABEL_INNER_R = INNER_R + 38;
const LABEL_OUTER_R = OUTER_R + 38;

/* ── SVG helpers ──────────────────────────────────────────────────────────── */

/** Convert polar (angle in degrees, 0 = top / 12-o'clock) to Cartesian. */
function polar(r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

/** Unit vector from center toward a point. */
function unitVec(x: number, y: number) {
  const dx = x - CX;
  const dy = y - CY;
  const d = Math.sqrt(dx * dx + dy * dy);
  return { nx: dx / d, ny: dy / d };
}

/** SVG text-anchor based on x direction. */
function textAnchor(nx: number): 'start' | 'middle' | 'end' {
  if (nx > 0.32) return 'start';
  if (nx < -0.32) return 'end';
  return 'middle';
}

/** SVG dominant-baseline based on y direction. */
function dominantBaseline(
  ny: number,
): 'hanging' | 'middle' | 'auto' {
  if (ny > 0.32) return 'hanging';
  if (ny < -0.32) return 'auto';
  return 'middle';
}

/** Split long sector names onto two lines. */
function splitLabel(name: string): string[] {
  if (name.length <= 10) return [name];
  const words = name.split(' ');
  if (words.length === 2) return words;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

interface NodeData {
  sector: Sector;
  /** Node circle center */
  x: number;
  y: number;
  /** Label anchor point (further from center) */
  lx: number;
  ly: number;
  nx: number;
  ny: number;
}

function buildNodes(
  sectors: Sector[],
  ringR: number,
  labelR: number,
  startAngle: number,
): NodeData[] {
  return sectors.map((sector, i) => {
    const angle = startAngle + (i / sectors.length) * 360;
    const { x, y } = polar(ringR, angle);
    const { nx, ny } = unitVec(x, y);
    return { sector, x, y, lx: CX + labelR * nx, ly: CY + labelR * ny, nx, ny };
  });
}

const innerNodes = buildNodes(INNER_SECTORS, INNER_R, LABEL_INNER_R, 0);
const outerNodes = buildNodes(OUTER_SECTORS, OUTER_R, LABEL_OUTER_R, 22.5);
const allNodes = [...innerNodes, ...outerNodes];

/* ── SectorPanelContent — shared between constellation and accordion ──────── */

function SectorPanelContent({ sector }: { sector: Sector }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Name */}
      <div>
        <h3
          className="text-display-md text-gold-400 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {sector.name.toUpperCase()}
        </h3>
        <p className="mt-2 text-sm text-ivory-300 italic leading-relaxed">
          {sector.descriptor}
        </p>
      </div>

      {/* What it contributes */}
      <div>
        <span className="text-eyebrow text-gold-500 block mb-2">
          WHAT IT CONTRIBUTES
        </span>
        <p className="text-ivory-200 text-sm leading-relaxed">
          {sector.contributes}
        </p>
      </div>

      {/* Who belongs */}
      <div>
        <span className="text-eyebrow text-gold-500 block mb-2">
          WHO BELONGS HERE
        </span>
        <ul className="flex flex-col gap-1" aria-label={`Who belongs in ${sector.name}`}>
          {sector.whoBelongs.map((who) => (
            <li key={who} className="flex items-center gap-2 text-ivory-200 text-sm">
              <span
                aria-hidden="true"
                className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: 'hsl(39 52% 54%)' }}
              />
              {who}
            </li>
          ))}
        </ul>
      </div>

      {/* Related programs */}
      <div>
        <span className="text-eyebrow text-gold-500 block mb-2">
          RELATED PROGRAMS
        </span>
        <div className="flex flex-wrap gap-2">
          {sector.relatedPrograms.map((prog) => (
            <Badge key={prog} variant="gold" className="text-xs font-semibold">
              {prog}
            </Badge>
          ))}
        </div>
      </div>

      {/* Coming soon chip */}
      <div className="pt-2">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-widest uppercase"
          style={{
            borderRadius: '2px',
            border: '1px solid hsl(188 46% 30%)',
            color: 'hsl(188 46% 60%)',
            backgroundColor: 'hsl(188 66% 16% / 0.5)',
          }}
        >
          <span
            aria-hidden="true"
            className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: 'hsl(188 46% 50%)' }}
          />
          SECTOR PAGE COMING SOON
        </span>
      </div>
    </div>
  );
}

/* ── SectorConstellation ──────────────────────────────────────────────────── */

function SectorConstellation() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [focusedSlug, setFocusedSlug] = useState<string | null>(null);

  const activeSector = activeSlug ? getSectorBySlug(activeSlug) : null;

  function handleActivate(slug: string) {
    setActiveSlug((prev) => (prev === slug ? null : slug));
  }

  function handleKeyDown(e: React.KeyboardEvent, slug: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate(slug);
    }
  }

  return (
    <div className="flex flex-col xl:flex-row items-start gap-6 xl:gap-10 w-full">
      {/* ── SVG Constellation ───────────────────────────────────── */}
      <div
        className="w-full xl:w-[520px] shrink-0"
        role="region"
        aria-label="Interactive sector constellation"
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          aria-label="The One Movement ecosystem constellation — 15 sectors on two rings"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Keyframe for active line shimmer — suppressed by prefers-reduced-motion */}
            <style>{`
              @keyframes lineShimmer {
                0%   { stroke-opacity: 0.55; }
                50%  { stroke-opacity: 1; }
                100% { stroke-opacity: 0.55; }
              }
              .constellation-active-spoke {
                animation: lineShimmer 2.2s ease-in-out infinite;
              }
              @media (prefers-reduced-motion: reduce) {
                .constellation-active-spoke { animation: none; }
              }
            `}</style>

            {/* Radial gold glow for center mark */}
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(43 80% 73%)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(43 80% 73%)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ── Ring outlines (decorative, aria-hidden) ────────────── */}
          <circle
            aria-hidden="true"
            cx={CX} cy={CY} r={INNER_R}
            fill="none"
            stroke="hsl(39 52% 54%)"
            strokeWidth="0.5"
            strokeOpacity="0.18"
            strokeDasharray="3 6"
          />
          <circle
            aria-hidden="true"
            cx={CX} cy={CY} r={OUTER_R}
            fill="none"
            stroke="hsl(39 52% 54%)"
            strokeWidth="0.5"
            strokeOpacity="0.14"
            strokeDasharray="3 8"
          />

          {/* ── Ring polygon connections (adjacent nodes) ──────────── */}
          {/* Inner ring */}
          {innerNodes.map((n, i) => {
            const next = innerNodes[(i + 1) % innerNodes.length];
            return (
              <line
                key={`inner-poly-${i}`}
                aria-hidden="true"
                x1={n.x} y1={n.y}
                x2={next.x} y2={next.y}
                stroke="hsl(39 52% 54%)"
                strokeWidth="0.6"
                strokeOpacity="0.2"
              />
            );
          })}
          {/* Outer ring */}
          {outerNodes.map((n, i) => {
            const next = outerNodes[(i + 1) % outerNodes.length];
            return (
              <line
                key={`outer-poly-${i}`}
                aria-hidden="true"
                x1={n.x} y1={n.y}
                x2={next.x} y2={next.y}
                stroke="hsl(39 52% 54%)"
                strokeWidth="0.6"
                strokeOpacity="0.15"
              />
            );
          })}

          {/* ── Spokes: center → each node ─────────────────────────── */}
          {allNodes.map(({ sector, x, y }) => {
            const isActive = activeSlug === sector.slug;
            return (
              <line
                key={`spoke-${sector.slug}`}
                aria-hidden="true"
                x1={CX} y1={CY}
                x2={x} y2={y}
                stroke="hsl(39 52% 54%)"
                strokeWidth={isActive ? 1.2 : 0.7}
                strokeOpacity={isActive ? 0.8 : 0.28}
                className={isActive ? 'constellation-active-spoke' : undefined}
              />
            );
          })}

          {/* ── Center mark ────────────────────────────────────────── */}
          <circle
            aria-hidden="true"
            cx={CX} cy={CY} r={34}
            fill="url(#centerGlow)"
          />
          <circle
            aria-hidden="true"
            cx={CX} cy={CY} r={26}
            fill="hsl(187 67% 10%)"
            stroke="hsl(39 52% 54%)"
            strokeWidth="1"
            strokeOpacity="0.6"
          />
          <text
            aria-hidden="true"
            x={CX} y={CY - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7"
            fontFamily="var(--font-display)"
            fill="hsl(43 80% 73%)"
            letterSpacing="1.5"
          >
            THE
          </text>
          <text
            aria-hidden="true"
            x={CX} y={CY + 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7"
            fontFamily="var(--font-display)"
            fill="hsl(43 80% 73%)"
            letterSpacing="1.5"
          >
            ONE
          </text>

          {/* ── Sector nodes ───────────────────────────────────────── */}
          {allNodes.map(({ sector, x, y, lx, ly, nx, ny }) => {
            const isActive = activeSlug === sector.slug;
            const isFocused = focusedSlug === sector.slug;
            const lines = splitLabel(sector.name);
            const anchor = textAnchor(nx);
            const baseline = dominantBaseline(ny);
            const lineH = 9.5;
            // For multi-line: offset so the block is centered on ly
            const totalH = lines.length * lineH;
            const startY = lines.length > 1 ? ly - totalH / 2 + lineH / 2 : ly;

            return (
              <g
                key={sector.slug}
                role="button"
                aria-label={sector.name}
                aria-pressed={isActive}
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                onClick={() => handleActivate(sector.slug)}
                onKeyDown={(e) => handleKeyDown(e, sector.slug)}
                onFocus={() => setFocusedSlug(sector.slug)}
                onBlur={() => setFocusedSlug(null)}
              >
                {/* Invisible hit area */}
                <circle cx={x} cy={y} r={HIT_R} fill="transparent" />

                {/* Focus ring */}
                {isFocused && (
                  <circle
                    cx={x} cy={y}
                    r={NODE_R_ACTIVE + 6}
                    fill="none"
                    stroke="hsl(43 80% 73%)"
                    strokeWidth="1.5"
                    strokeOpacity="0.85"
                  />
                )}

                {/* Active glow halo */}
                {isActive && (
                  <circle
                    cx={x} cy={y} r={18}
                    fill="hsl(39 52% 54% / 0.12)"
                  />
                )}

                {/* Visual node circle */}
                <circle
                  cx={x} cy={y}
                  r={isActive ? NODE_R_ACTIVE : NODE_R}
                  fill={isActive ? 'hsl(43 80% 73%)' : 'hsl(188 66% 16%)'}
                  stroke={isActive ? 'hsl(43 80% 73%)' : 'hsl(39 52% 54%)'}
                  strokeWidth={isActive ? 0 : 1.2}
                  strokeOpacity={isActive ? 0 : 0.7}
                />

                {/* Label */}
                {lines.map((line, li) => (
                  <text
                    key={li}
                    x={lx}
                    y={startY + li * lineH}
                    textAnchor={anchor}
                    dominantBaseline={
                      lines.length === 1 ? baseline : 'middle'
                    }
                    fontSize="9"
                    fontFamily="var(--font-display)"
                    fill={isActive ? 'hsl(43 80% 73%)' : 'hsl(38 57% 88%)'}
                    letterSpacing="0.8"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {line.toUpperCase()}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Sector Panel ─────────────────────────────────────────── */}
      <div
        className="flex-1 min-w-0"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Selected sector details"
      >
        {activeSector ? (
          <div
            className="rounded-[2px] p-6 xl:p-8"
            style={{ backgroundColor: 'hsl(188 66% 14%)' }}
          >
            <SectorPanelContent sector={activeSector} />
          </div>
        ) : (
          <div
            className="rounded-[2px] p-6 xl:p-8 flex flex-col gap-3"
            style={{
              backgroundColor: 'hsl(188 66% 14% / 0.5)',
              border: '1px dashed hsl(39 52% 54% / 0.3)',
            }}
          >
            <GoldThread length="48px" node />
            <p className="text-ivory-300 text-sm mt-3 leading-relaxed">
              Select a sector node to explore its role, who it connects
              and which programs it powers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── SectorAccordion (mobile / tablet) ───────────────────────────────────── */

function SectorAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {SECTORS.map((sector) => (
        <AccordionItem
          key={sector.slug}
          value={sector.slug}
          style={{ borderColor: 'hsl(188 46% 24%)' }}
        >
          <AccordionTrigger
            className="text-left hover:no-underline py-5 group"
            style={{ color: 'hsl(38 57% 88%)' }}
          >
            <span className="flex flex-col gap-0.5">
              <span
                className="text-sm font-semibold tracking-widest uppercase group-data-[state=open]:text-gold-400 transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {sector.name}
              </span>
              <span className="text-xs text-ivory-400 font-normal normal-case tracking-normal">
                {sector.descriptor}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <SectorPanelContent sector={sector} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/* ── Inline notice component (Section 8) ────────────────────────────────── */

function EcosystemNotice({ children }: { children: string }) {
  return (
    <p
      className="flex items-start gap-2.5 text-sm text-ivory-300 leading-relaxed"
      role="note"
    >
      <span
        aria-hidden="true"
        className="inline-block mt-1 w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: 'hsl(39 52% 54%)' }}
      />
      {children}
    </p>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function Ecosystem() {
  return (
    <div>
      <Helmet>
        <title>THE ECOSYSTEM — FIFTEEN SECTORS, ONE MOVEMENT</title>
        <meta name="description" content="Fifteen sectors shaping a developing global ecosystem across culture, business, diplomacy, innovation and humanitarian action." />
        <meta property="og:title" content="THE ECOSYSTEM — FIFTEEN SECTORS, ONE MOVEMENT" />
        <meta property="og:description" content="Fifteen sectors shaping a developing global ecosystem across culture, business, diplomacy, innovation and humanitarian action." />
        {/* FILLED AT DEPLOY WITH PRODUCTION DOMAIN */}
        <link rel="canonical" href="/ecosystem" />
      </Helmet>

      {/* ─────────────────────────────────────────────────────────────────────
          1. ECOSYSTEM HERO — HeroSurface, lagoon radiant, split layout
          ───────────────────────────────────────────────────────────────────── */}
      <HeroSurface glowOrigin="behind" minHeight="78vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left: text */}
            <div className="lg:col-span-6">
              <p className="text-eyebrow text-gold-400 mb-6 animate-fade-in">
                THE ECOSYSTEM
              </p>
              <h1
                className="text-display-xl text-ivory-100 animate-fade-up"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                FIFTEEN SECTORS.{' '}
                <span className="text-gold-400">
                  ONE CONNECTED GLOBAL ECOSYSTEM.
                </span>
              </h1>
              <GoldThread className="mt-7" length="220px" node />
              <p
                className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-xl animate-fade-in"
                style={{ animationDelay: '0.15s' }}
              >
                 The One Movement International brings fifteen sectors into one
                 developing framework. Public programs and enquiries are available
                 today; the connected digital workspace is future direction.
              </p>
            </div>

            {/* Right: visual placeholder */}
            <div
              className="lg:col-span-5 lg:col-start-8 animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="relative">
                <PhotoSlot
                  filename="ecosystem-network.jpg"
                  alt="Global network visual"
                  className="w-full aspect-[4/3]"
                />
                <p
                  className="mt-2 text-right text-[10px] tracking-widest uppercase"
                  style={{ color: 'hsl(188 46% 40%)' }}
                >
                  ECOSYSTEM VISUAL — GLOBAL NETWORK
                </p>
              </div>
            </div>
          </div>
        </div>
      </HeroSurface>

      {/* Transition: hero → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          2. WHAT THE ECOSYSTEM MEANS — ivory, asymmetric
          ───────────────────────────────────────────────────────────────────── */}
      <section id="programs" className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="ONE ENVIRONMENT, NOT A LIST OF INDUSTRIES"
                heading="WHERE EACH SECTOR MAKES THE OTHERS STRONGER"
                thread
                surface="light"
              />
            </div>

            <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-5">
              <p className="text-ink-900 leading-relaxed">
                The Movement is not a collection of unrelated industries. Its
                developing model brings culture, business, diplomacy, innovation,
                education and humanitarian action into the same conversation.
                Current programs provide the practical starting point.
              </p>
              <p className="text-sm text-sand-400 leading-relaxed border-l-2 pl-4"
                style={{ borderColor: 'hsl(39 52% 54% / 0.4)' }}
              >
                On our Vision page, these forces are described as pillars.
                Here, you can explore the fifteen sectors where the community
                lives and works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          3. INTERACTIVE SECTOR EXPLORER — lagoon-900 band
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <SectionHeading
              eyebrow="EXPLORE THE ECOSYSTEM"
              heading="SELECT A SECTOR TO SEE HOW IT CONNECTS"
              thread
              align="center"
              surface="dark"
            />
          </div>

          {/* Desktop: constellation */}
          <div className="hidden lg:block">
            <SectorConstellation />
          </div>

          {/* Mobile / tablet: accordion */}
          <div className="lg:hidden">
            <SectorAccordion />
          </div>
        </div>
      </section>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          4. SECTOR GRID FALLBACK — ivory
          ───────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="THE FIFTEEN SECTORS"
            heading="EVERY SECTOR AT A GLANCE"
            thread
            align="center"
            surface="light"
            className="mb-12"
          />

          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-label="All fifteen ecosystem sectors"
          >
            {SECTORS.map((sector) => (
              <li key={sector.slug}>
                <article
                  id={sector.slug}
                  className="h-full rounded-[2px] p-6 flex flex-col gap-3"
                  style={{
                    backgroundColor: 'hsl(38 57% 96%)',
                    border: '1px solid hsl(39 52% 54% / 0.18)',
                  }}
                >
                  <h3
                    className="text-sm font-semibold tracking-widest text-ink-900 uppercase"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {sector.name}
                  </h3>
                  <p className="text-xs text-gold-600 uppercase tracking-wider font-medium">
                    {sector.descriptor}
                  </p>
                  <p className="text-xs text-sand-400 mt-auto">
                    <span className="font-semibold text-ink-900">For: </span>
                    {sector.whoBelongs.slice(0, 3).join(', ')}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          5. HOW CONNECTIONS HAPPEN — ivory continues, five steps
          ───────────────────────────────────────────────────────────────────── */}
      <section id="opportunities" className="bg-ivory-100 pb-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div
              aria-hidden="true"
              style={{ borderTop: '1px solid hsl(39 52% 54% / 0.2)' }}
              className="mb-12"
            />
            <SectionHeading
              eyebrow="FROM INTEREST TO PARTICIPATION"
              heading="HOW TO BEGIN"
              surface="light"
              align="center"
              className="mb-12"
            />
          </Reveal>

          <ol
            className="grid grid-cols-1 sm:grid-cols-5 gap-6"
            aria-label="Steps from interest to participation"
          >
            {[
              { step: '01', label: 'EXPRESS INTEREST', body: 'Tell us who you are and what brings you here.' },
              { step: '02', label: 'SHARE YOUR DIRECTION', body: 'Describe your work, interests and what you are looking for.' },
              { step: '03', label: 'FOLLOW THE PROGRAMS', body: 'Explore current information and receive confirmed updates.' },
              { step: '04', label: 'RECEIVE CONFIRMED UPDATES', body: 'Future participation pathways will be communicated only after their terms are approved.' },
              { step: '05', label: 'TAKE PART', body: 'Respond when a relevant program or partnership opportunity is confirmed.' },
            ].map(({ step, label, body }, i) => (
              <li key={step} className="flex flex-col gap-3">
                <Reveal delay={i * 100}>
                  <span
                    className="text-display-md text-gold-500 mb-1 block"
                    style={{ fontFamily: 'var(--font-display)', lineHeight: 1 }}
                    aria-hidden="true"
                  >
                    {step}
                  </span>
                  <span className="text-xs font-semibold tracking-widest text-ink-900 uppercase">
                    {label}
                  </span>
                  <p className="text-sm text-sand-500 leading-relaxed">{body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          6. CROSS-SECTOR EXAMPLES — lagoon-900 band
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="WHAT CONNECTION CAN LOOK LIKE"
            heading="POSSIBILITIES, NOT PROMISES"
            surface="dark"
            align="center"
            className="mb-3"
          />
          <p className="text-center text-ivory-300 text-sm mb-10 max-w-xl mx-auto">
            Examples of the connections the ecosystem is built to make possible:
          </p>

          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            aria-label="Cross-sector connection examples"
          >
            {[
              'An entrepreneur meets an investor through an opportunity.',
              'An embassy supports a cultural exchange.',
              'A university connects students to a global program.',
              'An NGO meets a corporate impact partner.',
              'A filmmaker documents a humanitarian initiative.',
              'A designer connects with media and international buyers.',
            ].map((example) => (
              <li
                key={example}
                className="rounded-[2px] p-5"
                style={{
                  backgroundColor: 'hsl(188 66% 14%)',
                  border: '1px solid hsl(39 52% 54% / 0.18)',
                }}
              >
                <p className="text-ivory-200 text-sm leading-relaxed">
                  {example}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Transition: lagoon → ivory */}
      <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
        <GeometricAccent variant="lagoon-on-ivory" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          7. PROGRAMS AS THE HEARTBEAT — ivory
          ───────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 py-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-6">
              <SectionHeading
                eyebrow="MOMENTS OF CONNECTION"
                heading="PROGRAMS ARE ACTIVE. THE PLATFORM IS FUTURE."
                thread
                surface="light"
              />
            </div>

            <div className="lg:col-span-5 lg:col-start-8 flex flex-col gap-6">
              <p className="text-ink-900 leading-relaxed">
                Six official programs define the Movement&apos;s public work. The
                planned social network, collaboration workspace, AI Copilot and
                ASK TOMI are future platform direction and are not available yet.
              </p>
              <div>
                <Link href="/programs">
                  <Button variant="gold-outline" size="lg">
                    EXPLORE THE PROGRAMS
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          8. OPPORTUNITIES LAYER — ivory continues, GeometricAccent divider
          ───────────────────────────────────────────────────────────────────── */}
      <section className="bg-ivory-100 pb-section-lg">
        <div className="mx-auto max-w-7xl px-6">
          <GeometricAccent variant="lagoon-on-ivory" height={20} className="mb-12" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="FROM CONNECTION TO ACTION"
                heading="OPPORTUNITIES TURN MEETINGS INTO MOVEMENT"
                surface="light"
              />
            </div>
            <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-6">
              <p className="text-ink-900 leading-relaxed">
                 The planned Opportunities Hub is intended to bring future calls,
                 collaborations, applications, showcases and partnership openings
                 into one place.
              </p>
              <EcosystemNotice>
                The Opportunities Hub and member platform are not currently available.
                Details will be published only after launch plans are confirmed.
              </EcosystemNotice>
            </div>
          </div>
        </div>
      </section>

      {/* Transition: ivory → lagoon */}
      <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <GeometricAccent variant="gold-on-lagoon" height={20} />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          9. JOIN BY SECTOR — lagoon-900
          ───────────────────────────────────────────────────────────────────── */}
      <section
        className="py-section-lg"
        style={{ backgroundColor: 'hsl(187 67% 12%)' }}
      >
        <div className="mx-auto max-w-7xl px-6 text-center">
          <SectionHeading
            eyebrow="YOUR PLACE IN THE ECOSYSTEM"
            heading="EVERY SECTOR HAS A DOOR. ALL OF THEM LEAD IN."
            thread
            align="center"
            surface="dark"
            className="mb-6"
          />
          <p className="text-ivory-300 text-base leading-relaxed max-w-xl mx-auto mb-9">
            Whether you create, build, invest, teach, govern or serve — there
            is a place in the Movement for you.
          </p>
          <Link href="/join">
            <Button size="xl" variant="default">
              JOIN THE MOVEMENT
            </Button>
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          10. CLOSING INVITATION — HeroSurface
          ───────────────────────────────────────────────────────────────────── */}
      <HeroSurface glowOrigin="bottom-center" minHeight="40vh">
        <div className="mx-auto w-full max-w-7xl px-6 py-section-lg text-center">
          <h2
            className="text-display-lg text-ivory-100"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ONE WORLD. ONE PURPOSE. ONE MOVEMENT.
          </h2>
          <GoldThread className="mt-6 mx-auto" length="120px" node />
          <div className="mt-8">
            <p
              lang="ar"
              dir="rtl"
              className="text-display-md font-arabic text-gold-400"
              style={{ fontFamily: 'var(--font-arabic)' }}
              aria-label="We Are One"
            >
              نحن واحد
            </p>
            <p className="text-xs text-ivory-300 mt-2 tracking-widest uppercase">
              WE ARE ONE
            </p>
          </div>
        </div>
      </HeroSurface>
    </div>
  );
}
