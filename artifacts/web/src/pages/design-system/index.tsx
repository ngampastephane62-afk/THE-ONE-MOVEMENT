import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import GoldThread from '@/components/GoldThread';
import HeroSurface from '@/components/HeroSurface';
import GeometricAccent from '@/components/GeometricAccent';
import SectionHeading from '@/components/SectionHeading';
import StatBlock from '@/components/StatBlock';
import PhotoSlot from '@/components/PhotoSlot';
import PhotoMosaic from '@/components/PhotoMosaic';

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function GallerySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-section-sm border-b border-sand-100">
      <h2
        className="text-display-md mb-8 text-ink-900"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-eyebrow text-gold-600 mb-2">{children}</p>
  );
}

function Swatch({
  hex,
  label,
  note,
  dark,
}: {
  hex: string;
  label: string;
  note?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-16 w-full rounded-sharp border border-sand-200"
        style={{ backgroundColor: hex }}
        title={hex}
      />
      <p className="text-xs font-medium text-ink-800">{label}</p>
      <p className="font-mono text-xs text-sand-400">{hex}</p>
      {note && <p className="text-xs text-sand-300">{note}</p>}
    </div>
  );
}

/* ── Main gallery ────────────────────────────────────────────────────────────── */

export default function DesignSystem() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Helmet>
        <title>Internal Design System — THE ONE MOVEMENT INTERNATIONAL</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="bg-ivory-50 min-h-screen">
      {/* Page header */}
      <div className="py-section-md px-6" style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
        <div className="mx-auto max-w-6xl">
          <p className="text-eyebrow text-gold-400 mb-4">Internal Reference</p>
          <h1
            className="text-display-lg text-ivory-100"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            LAGOON & GOLD
            <br />
            Design System
          </h1>
          <GoldThread className="mt-6" length="300px" node />
          <p className="mt-6 text-ivory-200 max-w-xl leading-relaxed">
            Token and component reference for The One Movement International.
            Every token, variant, and motif is documented here for design review
            before Stage 2 begins.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              '#palette',
              '#typography',
              '#components',
              '#motifs',
              '#spacing',
              '#motion',
              '#hero-demo',
            ].map((anchor) => (
              <a
                key={anchor}
                href={anchor}
                className="text-eyebrow text-gold-400 hover:text-gold-300 transition-colors"
              >
                {anchor.replace('#', '')} ↓
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        {/* ── 1. COLOR PALETTE ─────────────────────────────────────────── */}
        <GallerySection id="palette" title="Color Palette">
          {/* Lagoon family */}
          <div className="mb-10">
            <Label>LAGOON — primary dark surfaces (V2)</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              <Swatch hex="#0A2E33" label="lagoon-900" note="Nav, footer, hero base" />
              <Swatch hex="#0E3D44" label="lagoon-800" note="Secondary dark surface" />
              <Swatch hex="#114E58" label="lagoon-700" />
              <Swatch hex="#0D5F6E" label="lagoon-600" note="AA body text on ivory ≈ 8.8:1 ✓" />
              <Swatch hex="#157A8C" label="lagoon-500" note="Rich teal accent" />
              <Swatch hex="#2BA3B8" label="lagoon-400" note="Electric bright — display only" />
            </div>
          </div>

          {/* Ink family */}
          <div className="mb-10">
            <Label>INK — body text on light surfaces (retained)</Label>
            <div className="grid grid-cols-5 gap-3">
              <Swatch hex="#090603" label="ink-950" />
              <Swatch hex="#16100A" label="ink-900" note="Body text on ivory ≥ 12:1 ✓" />
              <Swatch hex="#1A120B" label="ink-800" />
              <Swatch hex="#221508" label="ink-700" />
              <Swatch hex="#2C1E0D" label="ink-600" />
            </div>
          </div>

          {/* Gold family */}
          <div className="mb-10">
            <Label>GOLD — brand identity, CTAs, accents</Label>
            <div className="grid grid-cols-4 gap-3">
              <Swatch
                hex="#F0CE83"
                label="gold-400 (bright)"
                note="Living highlight. Use on ink surfaces or large display only."
              />
              <Swatch
                hex="#C9A24B"
                label="gold-500 (core)"
                note="Buttons, active states, eyebrow at display size."
              />
              <Swatch hex="#A07B2B" label="gold-600" note="Accessible on ivory-100 at body size" />
              <Swatch hex="#7A5E1A" label="gold-700" note="Darkened, decorative" />
            </div>
          </div>

          {/* Ivory family */}
          <div className="mb-10">
            <Label>IVORY — warm reading surfaces</Label>
            <div className="grid grid-cols-4 gap-3">
              <Swatch hex="#FDFAF5" label="ivory-50" note="Card default" />
              <Swatch hex="#F7F1E5" label="ivory-100" note="Page background" />
              <Swatch hex="#EDE3CD" label="ivory-200" note="Secondary fills" />
              <Swatch hex="#DDD0B4" label="ivory-300" />
            </div>
          </div>

          {/* Sand family */}
          <div className="mb-10">
            <Label>SAND — muted mid-tone, secondary surfaces</Label>
            <div className="grid grid-cols-4 gap-3">
              <Swatch hex="#E8DECC" label="sand-100" />
              <Swatch hex="#D4C5A8" label="sand-200" note="Borders" />
              <Swatch hex="#B8A78A" label="sand-300" note="Muted text" />
              <Swatch hex="#9A8B72" label="sand-400" note="Secondary text" />
            </div>
          </div>

          {/* Coral */}
          <div className="mb-10">
            <Label>CORAL — warm amber-coral. SMALL-DOSE only (tags, stat accents). Never large areas.</Label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <Swatch hex="#E27D4F" label="coral-500" note="Tags, energy highlights. ~2.4:1 on ivory — display only." />
              <Swatch hex="#C45E30" label="coral-600" note="Darker — use for accessible text if needed." />
            </div>
          </div>

          {/* Crimson + Reserved */}
          <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <Label>CRIMSON — error states, MINIMAL USE</Label>
              <div className="grid grid-cols-2 gap-3">
                <Swatch hex="#7A2E2E" label="crimson-700" note="Error states, rare accent tags" />
                <Swatch hex="#5E2020" label="crimson-800" />
              </div>
            </div>
            <div>
              <Label>RESERVED — program-fashionweek. Harmonized to lagoon-500 (V2).</Label>
              <div className="grid grid-cols-1 gap-3">
                <Swatch hex="#157A8C" label="program-fashionweek" note="Now matches lagoon-500. Zero use in base components." />
              </div>
            </div>
          </div>

          {/* Contrast annotation table */}
          <div className="rounded-sharp border border-sand-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand-100 text-ink-900">
                  <th className="text-start px-4 py-3 font-semibold">Pairing</th>
                  <th className="text-start px-4 py-3 font-semibold">Ratio</th>
                  <th className="text-start px-4 py-3 font-semibold">AA Body</th>
                  <th className="text-start px-4 py-3 font-semibold">AA Large</th>
                  <th className="text-start px-4 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {[
                  ['ink-900 on ivory-100',     '≥ 12:1',  '✓ PASS', '✓ PASS', 'Primary body text — always safe'],
                  ['ivory-100 on lagoon-900',  '≥ 14:1',  '✓ PASS', '✓ PASS', 'Body on dark hero / nav / footer'],
                  ['ivory-100 on lagoon-800',  '≥ 12:1',  '✓ PASS', '✓ PASS', 'Body on secondary dark surfaces'],
                  ['ivory-100 on ink-900',     '≥ 12:1',  '✓ PASS', '✓ PASS', 'Body on ink (retained)'],
                  ['ink-900 on gold-500',      '≈ 4.8:1', '✓ PASS', '✓ PASS', 'Button labels on gold buttons'],
                  ['gold-400 on lagoon-900',   '≈ 8.5:1', '✓ PASS', '✓ PASS', 'Bright gold on teal dark'],
                  ['lagoon-600 on ivory-100',  '≈ 8.8:1', '✓ PASS', '✓ PASS', 'AA teal body text on light bg'],
                  ['lagoon-500 on ivory-100',  '≈ 6.6:1', '✓ PASS', '✓ PASS', 'Teal display text on light'],
                  ['crimson-700 on ivory-100', '≈ 5.1:1', '✓ PASS', '✓ PASS', 'Error text on light bg'],
                  ['gold-600 on ivory-100',    '≈ 4.6:1', '✓ PASS', '✓ PASS', 'Eyebrow gold on light bg'],
                  ['lagoon-400 on ivory-100',  '≈ 4.1:1', '✗ FAIL', '✓ PASS', 'Large text only. Never body.'],
                  ['gold-500 on ivory-100',    '≈ 2.8:1', '✗ FAIL', '✓ PASS', 'Display / eyebrow only. Never body.'],
                  ['coral-500 on ivory-100',   '≈ 2.4:1', '✗ FAIL', '✗ FAIL', 'Tags only. Never text.'],
                  ['gold-400 on ivory-100',    '< 2:1',   '✗ FAIL', '✗ FAIL', 'BANNED — never on light surface'],
                ].map(([pair, ratio, body, large, notes]) => (
                  <tr
                    key={pair}
                    className={
                      body === '✗ FAIL'
                        ? 'bg-crimson-700/5 text-ink-800'
                        : 'text-ink-800 even:bg-ivory-50'
                    }
                  >
                    <td className="px-4 py-2.5 font-mono text-xs">{pair}</td>
                    <td className="px-4 py-2.5 text-xs">{ratio}</td>
                    <td className={`px-4 py-2.5 text-xs font-semibold ${body === '✓ PASS' ? 'text-gold-600' : 'text-crimson-700'}`}>{body}</td>
                    <td className={`px-4 py-2.5 text-xs font-semibold ${large === '✓ PASS' ? 'text-gold-600' : 'text-crimson-700'}`}>{large}</td>
                    <td className="px-4 py-2.5 text-xs text-sand-400">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GallerySection>

        {/* ── 2. TYPOGRAPHY ────────────────────────────────────────────── */}
        <GallerySection id="typography" title="Typography">
          <Tabs defaultValue="english">
            <TabsList className="mb-8">
              <TabsTrigger value="english">English</TabsTrigger>
              <TabsTrigger value="arabic">Arabic (نموذج)</TabsTrigger>
            </TabsList>

            <TabsContent value="english">
              <div className="space-y-10">
                {/* Display scale */}
                <div>
                  <Label>Display — Cinzel (display face)</Label>
                  <div className="space-y-6 bg-ink-900 rounded-sharp p-8">
                    <div>
                      <p className="text-eyebrow text-gold-400 mb-2">display-xl — clamp(3.5rem, 8vw, 7rem)</p>
                      <p className="text-display-xl text-ivory-100">ONE WORLD.</p>
                    </div>
                    <div>
                      <p className="text-eyebrow text-gold-400 mb-2">display-lg — clamp(2.5rem, 5vw, 4.5rem)</p>
                      <p className="text-display-lg text-ivory-100">ONE PURPOSE.</p>
                    </div>
                    <div>
                      <p className="text-eyebrow text-gold-400 mb-2">display-md — clamp(1.75rem, 3.5vw, 2.75rem)</p>
                      <p className="text-display-md text-ivory-100">ONE MOVEMENT.</p>
                    </div>
                  </div>
                </div>

                {/* Body scale */}
                <div>
                  <Label>Body — IBM Plex Sans</Label>
                  <div className="space-y-5 bg-ivory-50 rounded-sharp p-6 border border-sand-200">
                    <div className="flex items-baseline gap-6">
                      <span className="font-mono text-xs text-sand-400 w-20 shrink-0">h1 / 2rem</span>
                      <h1 className="text-2xl font-semibold leading-tight tracking-tight text-ink-900">Connecting the World's Creative Leaders</h1>
                    </div>
                    <div className="flex items-baseline gap-6">
                      <span className="font-mono text-xs text-sand-400 w-20 shrink-0">h2 / 1.5rem</span>
                      <h2 className="text-xl font-semibold leading-snug text-ink-900">Global Ecosystem Programs</h2>
                    </div>
                    <div className="flex items-baseline gap-6">
                      <span className="font-mono text-xs text-sand-400 w-20 shrink-0">h3 / 1.25rem</span>
                      <h3 className="text-lg font-semibold leading-snug text-ink-900">Cultural Diplomacy</h3>
                    </div>
                    <div className="flex items-baseline gap-6">
                      <span className="font-mono text-xs text-sand-400 w-20 shrink-0">h4 / 1rem</span>
                      <h4 className="text-base font-semibold tracking-wide uppercase text-ink-900">Program Category</h4>
                    </div>
                    <div className="flex items-baseline gap-6">
                      <span className="font-mono text-xs text-sand-400 w-20 shrink-0">body-lg</span>
                      <p className="text-lg leading-relaxed text-ink-800">The One Movement brings together creative leaders, diplomats, and innovators from across the world into a single living ecosystem.</p>
                    </div>
                    <div className="flex items-baseline gap-6">
                      <span className="font-mono text-xs text-sand-400 w-20 shrink-0">body</span>
                      <p className="text-base leading-relaxed text-ink-800">A permanent institution — not an event, not a campaign — built to sustain cultural and humanitarian collaboration for generations.</p>
                    </div>
                    <div className="flex items-baseline gap-6">
                      <span className="font-mono text-xs text-sand-400 w-20 shrink-0">small</span>
                      <p className="text-sm leading-relaxed text-sand-400">Supporting copy, captions, and metadata text. Never used for critical information.</p>
                    </div>
                    <div className="flex items-baseline gap-6">
                      <span className="font-mono text-xs text-sand-400 w-20 shrink-0">caption</span>
                      <p className="text-xs leading-relaxed text-sand-400">Timestamps, image credits, legal fine print.</p>
                    </div>
                    <div className="flex items-baseline gap-6">
                      <span className="font-mono text-xs text-sand-400 w-20 shrink-0">eyebrow</span>
                      <p className="text-eyebrow text-gold-600">Global Initiative · Culture · Business</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="arabic">
              <div className="space-y-8">
                <p className="text-sm text-sand-400">
                  IBM Plex Sans Arabic renders correctly at every type scale. These samples confirm correct shaping and RTL flow.
                </p>
                <div className="space-y-6 bg-ink-900 rounded-sharp p-8">
                  {[
                    { label: 'display-xl', size: 'text-display-xl', text: 'عالم واحد' },
                    { label: 'display-lg', size: 'text-display-lg', text: 'هدف واحد' },
                    { label: 'display-md', size: 'text-display-md', text: 'حركة واحدة' },
                  ].map(({ label, size, text }) => (
                    <div key={label}>
                      <p className="text-eyebrow text-gold-400 mb-2">{label}</p>
                      <p
                        lang="ar"
                        dir="rtl"
                        className={`${size} text-ivory-100 font-arabic`}
                        style={{ fontFamily: 'var(--font-arabic)' }}
                      >
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="bg-ivory-50 rounded-sharp p-6 border border-sand-200 space-y-4">
                  {[
                    { label: 'h1', cls: 'text-2xl font-semibold', text: 'التحرك العالمي الواحد' },
                    { label: 'body-lg', cls: 'text-lg leading-relaxed', text: 'نحن نؤمن بأن الثقافة والأعمال والدبلوماسية يمكن أن تعمل معًا من أجل مستقبل أفضل للجميع.' },
                    { label: 'body', cls: 'text-base leading-relaxed', text: 'منصة دائمة لربط القادة المبدعين والمبتكرين والدبلوماسيين من جميع أنحاء العالم.' },
                    { label: 'eyebrow', cls: 'text-eyebrow text-gold-600', text: 'مبادرة عالمية · ثقافة · أعمال' },
                  ].map(({ label, cls, text }) => (
                    <div key={label} className="flex items-start gap-4">
                      <span className="font-mono text-xs text-sand-400 shrink-0 w-20 pt-0.5">{label}</span>
                      <p
                        lang="ar"
                        dir="rtl"
                        className={`${cls} text-ink-800 font-arabic text-end`}
                        style={{ fontFamily: 'var(--font-arabic)' }}
                      >
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </GallerySection>

        {/* ── 3. COMPONENTS ────────────────────────────────────────────── */}
        <GallerySection id="components" title="Components">
          {/* Buttons */}
          <div className="mb-12">
            <Label>Button — variants</Label>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Button variant="default">Primary (Gold)</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="gold-outline">Gold Outline</Button>
              <Button variant="link">Link</Button>
            </div>
            <Label>Button — sizes</Label>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Button size="xl">Extra Large</Button>
              <Button size="lg">Large</Button>
              <Button size="default">Default</Button>
              <Button size="sm">Small</Button>
            </div>
            <Label>Button — loading & disabled</Label>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Button
                loading={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 2000);
                }}
              >
                {loading ? 'Loading…' : 'Click to load'}
              </Button>
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>Outline Disabled</Button>
            </div>
            <Label>Button — on dark surface</Label>
            <div className="flex flex-wrap items-center gap-3 bg-ink-900 p-6 rounded-sharp">
              <Button variant="default">Primary</Button>
              <Button variant="gold-outline">Gold Outline</Button>
              <Button variant="ghost" className="text-ivory-200">Ghost</Button>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-12">
            <Label>Badge — variants</Label>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="gold">Gold</Badge>
              <Badge variant="verified">✓ Verified</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="crimson">Featured</Badge>
            </div>
            <Label>Badge — on dark surface</Label>
            <div className="flex flex-wrap items-center gap-3 bg-ink-900 p-4 rounded-sharp">
              <Badge variant="gold">Gold</Badge>
              <Badge variant="verified">✓ Verified</Badge>
              <Badge variant="outline" className="border-ivory-300 text-ivory-200">Outline</Badge>
              <Badge variant="crimson">Limited</Badge>
            </div>
          </div>

          {/* Cards */}
          <div className="mb-12">
            <Label>Card — variants</Label>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>Ivory Default Card</CardTitle>
                  <CardDescription>Warm ivory surface with sharp radius and sand border.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-sand-400">Light reading surface for content-rich layouts.</p>
                </CardContent>
              </Card>

              <Card variant="dark">
                <CardHeader>
                  <CardTitle className="text-ivory-100">Dark Cinematic Card</CardTitle>
                  <CardDescription className="text-ivory-300">Deep ink surface for feature cards on light pages.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="gold">Featured</Badge>
                </CardContent>
              </Card>

              <Card variant="program">
                <CardHeader>
                  <CardTitle>Program Card</CardTitle>
                  <CardDescription>GoldThread accent inset at top. Used for programme listings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="verified">✓ Verified</Badge>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Alerts */}
          <div className="mb-12">
            <Label>Alert — semantic variants</Label>
            <div className="space-y-3">
              <Alert variant="default">
                <AlertTitle>Default / Info</AlertTitle>
                <AlertDescription>This is a neutral informational message for general notices.</AlertDescription>
              </Alert>
              <Alert variant="info">
                <AlertTitle>Info with Gold Accent</AlertTitle>
                <AlertDescription>Highlights an action or update the user should notice.</AlertDescription>
              </Alert>
              <Alert variant="success">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Your application has been submitted successfully.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Please review the information below before continuing.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong. Please try again or contact support.</AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-12">
            <Label>Tabs — gold active indicator</Label>
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Overview</TabsTrigger>
                <TabsTrigger value="tab2">Programs</TabsTrigger>
                <TabsTrigger value="tab3">Impact</TabsTrigger>
                <TabsTrigger value="tab4" disabled>Locked</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <Card variant="default">
                  <CardContent className="pt-6">
                    <p className="text-sm text-sand-400">Overview tab content. Note the gold underline on the active tab.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tab2">
                <Card variant="default">
                  <CardContent className="pt-6">
                    <p className="text-sm text-sand-400">Programs tab content.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tab3">
                <Card variant="default">
                  <CardContent className="pt-6">
                    <p className="text-sm text-sand-400">Impact tab content.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Skeleton */}
          <div className="mb-12">
            <Label>Skeleton — gold shimmer loading placeholder</Label>
            <div className="space-y-3 max-w-sm">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        </GallerySection>

        {/* ── 4. SIGNATURE MOTIFS ──────────────────────────────────────── */}
        <GallerySection id="motifs" title="Signature Motifs">
          {/* GoldThread */}
          <div className="mb-12">
            <Label>GoldThread — horizontal</Label>
            <div className="space-y-6 p-6 bg-ink-900 rounded-sharp">
              <div>
                <p className="text-eyebrow text-gold-400 mb-3">Without node</p>
                <GoldThread length="100%" />
              </div>
              <div>
                <p className="text-eyebrow text-gold-400 mb-3">With node (brand connection symbol)</p>
                <GoldThread length="100%" node />
              </div>
            </div>
            <div className="mt-4 space-y-4 p-6 bg-ivory-50 rounded-sharp border border-sand-200">
              <Label>GoldThread — on light surface</Label>
              <GoldThread length="100%" node />
            </div>
            <Label>GoldThread — vertical</Label>
            <div className="flex gap-12 p-6 bg-ink-900 rounded-sharp mt-4 h-32">
              <GoldThread direction="vertical" length="100%" />
              <GoldThread direction="vertical" length="100%" node />
            </div>
          </div>

          {/* HeroSurface preview */}
          <div className="mb-12">
            <Label>HeroSurface (Radiant Surface) — gold glow rising from below</Label>
            <HeroSurface minHeight="280px" className="rounded-sharp px-8">
              <div className="py-8 max-w-xl">
                <p className="text-eyebrow text-gold-400 mb-3">Sample</p>
                <p className="text-display-md text-ivory-100">The radiant glow rises from below, giving cinematic depth without imagery.</p>
                <GoldThread className="mt-4" length="180px" node />
              </div>
            </HeroSurface>
          </div>

          {/* GeometricAccent */}
          <div className="mb-12">
            <Label>GeometricAccent — two variants (V2 promotion: now an active brand element)</Label>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-sand-400 mb-1">gold-on-lagoon — for lagoon dark surfaces</p>
                <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
                  <GeometricAccent variant="gold-on-lagoon" height={28} />
                </div>
              </div>
              <div>
                <p className="text-xs text-sand-400 mb-1">lagoon-on-ivory — for light ivory surfaces</p>
                <div style={{ backgroundColor: 'hsl(38 57% 94%)' }}>
                  <GeometricAccent variant="lagoon-on-ivory" height={28} />
                </div>
              </div>
            </div>
            <p className="text-xs text-sand-400 mt-3">
              Use as section dividers. Maximum one per section boundary.
            </p>
          </div>

          {/* SectionHeading */}
          <div className="mb-12">
            <Label>SectionHeading — eyebrow + display heading + optional GoldThread</Label>
            <div className="space-y-10">
              <SectionHeading
                eyebrow="Global Programs"
                heading="Where Culture Meets Purpose"
                subheading="From fashion to diplomacy, every program within the ecosystem shares a single intent: to make the world more connected."
                thread
                size="lg"
                surface="light"
              />
              <div className="bg-ink-900 rounded-sharp p-8">
                <SectionHeading
                  eyebrow="Impact"
                  heading="Numbers That Move"
                  thread
                  size="lg"
                  surface="dark"
                />
              </div>
              <SectionHeading
                heading="Ecosystem"
                align="center"
                thread
                size="md"
                surface="light"
              />
            </div>
          </div>

          {/* StatBlock */}
          <div className="mb-12">
            <Label>StatBlock — oversized display number + label</Label>
            <div className="grid grid-cols-3 gap-8 bg-ink-900 rounded-sharp p-10">
              <StatBlock value="190+" label="Countries Represented" surface="dark" />
              <StatBlock value="12" label="Ecosystem Programs" surface="dark" />
              <StatBlock value="1M+" label="Community Members" surface="dark" />
            </div>
            <div className="grid grid-cols-3 gap-8 bg-ivory-50 rounded-sharp p-10 border border-sand-200 mt-4">
              <StatBlock value="190+" label="Countries Represented" surface="light" />
              <StatBlock value="12" label="Ecosystem Programs" surface="light" />
              <StatBlock value="1M+" label="Community Members" surface="light" />
            </div>
          </div>

          {/* Duotone utility */}
          <div className="mb-12">
            <Label>Duotone — .img-duotone (lagoon-tinted V2, hover reveals full color)</Label>
            <div className="flex gap-4 items-center">
              <div
                className="img-duotone rounded-sharp overflow-hidden"
                style={{ width: 160, height: 100 }}
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: 'hsl(189 62% 45%)' }}
                >
                  <span className="text-xs text-ivory-100">Hover to reveal</span>
                </div>
              </div>
              <p className="text-sm text-sand-400 max-w-xs">
                V2: lagoon-tinted via <code className="font-mono text-xs bg-sand-100 px-1 py-0.5 rounded">hue-rotate(155deg)</code>. Apply to any img or wrapper. Hover to reveal full color.
              </p>
            </div>
          </div>

          {/* PhotoSlot */}
          <div className="mb-12">
            <Label>PhotoSlot — graceful image fallback (brand-photos/ folder)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-sand-400 mb-2">With duotone (file missing → lagoon fallback)</p>
                <PhotoSlot filename="photo-missing.jpg" alt="" className="w-full aspect-square" duotone />
              </div>
              <div>
                <p className="text-xs text-sand-400 mb-2">Sharp variant (default)</p>
                <PhotoSlot filename="photo-missing-2.jpg" alt="" className="w-full aspect-[4/3]" variant="sharp" />
              </div>
              <div>
                <p className="text-xs text-sand-400 mb-2">Rounded variant</p>
                <PhotoSlot filename="photo-missing-3.jpg" alt="" className="w-full aspect-[4/3]" variant="rounded" />
              </div>
            </div>
            <p className="text-xs text-sand-400 mt-3">
              Missing files always render an elegant lagoon-800 surface with geometric accent — the page never looks broken.
            </p>
          </div>

          {/* PhotoMosaic */}
          <div className="mb-12">
            <Label>PhotoMosaic — asymmetric editorial grid (all fallbacks shown)</Label>
            <div className="max-w-xl">
              <PhotoMosaic filenames={['photo-a.jpg', 'photo-b.jpg', 'photo-c.jpg', 'photo-d.jpg', 'photo-e.jpg']} />
            </div>
            <p className="text-xs text-sand-400 mt-3">
              One large feature + secondary column of squares. Each missing file renders a lagoon fallback.
            </p>
          </div>
        </GallerySection>

        {/* ── 5. SPACING ───────────────────────────────────────────────── */}
        <GallerySection id="spacing" title="Spacing — Section Rhythm">
          <p className="text-sm text-sand-400 mb-6">
            Vertical rhythm tokens. Generous spacing is luxury. Apply via <code className="font-mono text-xs bg-sand-100 px-1 rounded">py-section-*</code> utilities.
          </p>
          <div className="space-y-4">
            {[
              { token: '--section-sm', value: '3rem / 48px', cls: 'py-section-sm', label: 'section-sm' },
              { token: '--section-md', value: '5rem / 80px', cls: 'py-section-md', label: 'section-md' },
              { token: '--section-lg', value: '8rem / 128px', cls: 'py-section-lg', label: 'section-lg' },
              { token: '--section-xl', value: '12rem / 192px', cls: 'py-section-xl', label: 'section-xl' },
            ].map(({ token, value, label }) => (
              <div key={token} className="flex items-center gap-6">
                <div className="w-32 shrink-0">
                  <p className="font-mono text-xs text-sand-400">{label}</p>
                  <p className="text-xs text-sand-300">{value}</p>
                </div>
                <div className="flex-1 bg-ivory-200 rounded-sharp flex items-center justify-center"
                  style={{ height: value.split(' / ')[1].replace('px', '') + 'px', maxHeight: '96px' }}
                >
                  <span className="text-xs text-sand-400 font-mono">{value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Label>Radius personalities</Label>
            <div className="flex gap-6 items-start">
              <div className="flex flex-col gap-2 items-center">
                <div className="h-16 w-32 bg-sand-200 rounded-none border border-sand-300" />
                <p className="text-xs font-mono text-sand-400">radius-none / 0px</p>
                <p className="text-xs text-sand-300">structural</p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="h-16 w-32 bg-sand-200 rounded-sharp border border-sand-300" />
                <p className="text-xs font-mono text-sand-400">radius-sharp / 2px</p>
                <p className="text-xs text-sand-300">institutional</p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="h-16 w-32 bg-sand-200 rounded-md border border-sand-300" />
                <p className="text-xs font-mono text-sand-400">radius-md / 4px</p>
                <p className="text-xs text-sand-300">interactive</p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="h-16 w-32 bg-sand-200 rounded-lg border border-sand-300" />
                <p className="text-xs font-mono text-sand-400">radius-lg / 6px</p>
                <p className="text-xs text-sand-300">soft/interactive</p>
              </div>
            </div>
          </div>
        </GallerySection>

        {/* ── 6. MOTION ────────────────────────────────────────────────── */}
        <GallerySection id="motion" title="Motion">
          <p className="text-sm text-sand-400 mb-6">
            All entrance animations are CSS-only and disabled under{' '}
            <code className="font-mono text-xs bg-sand-100 px-1 rounded">prefers-reduced-motion: reduce</code>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label>animate-fade-up (0.5s cubic-bezier entrance)</Label>
              <button
                className="w-full"
                onClick={(e) => {
                  const el = e.currentTarget.nextElementSibling as HTMLElement;
                  if (el) {
                    el.classList.remove('animate-fade-up');
                    void el.offsetWidth; // force reflow
                    el.classList.add('animate-fade-up');
                  }
                }}
              >
                <div className="text-xs text-gold-600 mb-2 cursor-pointer hover:underline">
                  ↺ Replay
                </div>
              </button>
              <Card variant="default" className="animate-fade-up">
                <CardContent className="pt-6">
                  <p className="text-sm text-sand-400">This card entered with fade-up.</p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Label>animate-fade-in (0.4s ease-out)</Label>
              <div className="text-xs text-gold-600 mb-2 cursor-pointer hover:underline" role="button" tabIndex={0}
                onClick={(e) => {
                  const el = (e.currentTarget as HTMLElement).nextElementSibling as HTMLElement;
                  if (el) {
                    el.classList.remove('animate-fade-in');
                    void el.offsetWidth;
                    el.classList.add('animate-fade-in');
                  }
                }}
              >↺ Replay</div>
              <Card variant="default" className="animate-fade-in">
                <CardContent className="pt-6">
                  <p className="text-sm text-sand-400">This card entered with fade-in.</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-6">
            <Label>GoldThread shimmer (triggers on scroll-into-view)</Label>
            <div className="bg-ink-900 p-6 rounded-sharp">
              <GoldThread length="100%" node />
              <p className="text-xs text-gold-400 mt-3">
                The shimmer activates via IntersectionObserver when the thread enters the viewport. Paused until visible.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-ivory-200 rounded-sharp border border-sand-200">
            <p className="text-sm text-sand-400">
              <strong className="text-ink-800">Reduced motion:</strong> If your system preference is set to reduce motion, all animations above are suppressed. Open System Preferences → Accessibility → Reduce Motion to test.
            </p>
          </div>
        </GallerySection>
      </div>

      {/* ── 7. HERO DEMO — full width ────────────────────────────────── */}
      <section id="hero-demo">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h2
            className="text-display-md text-ink-900 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Composed Hero Demo
          </h2>
          <p className="text-sm text-sand-400 mb-6">
            All motifs working together: HeroSurface + display-xl headline + eyebrow + GoldThread + Buttons + StatBlocks.
          </p>
        </div>

        <HeroSurface minHeight="90vh" className="px-6">
          <div className="mx-auto max-w-6xl py-section-lg">
            {/* Asymmetric layout: heading dominates left, content offset right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-end">
              {/* Left: oversized heading */}
              <div className="lg:col-span-7">
                <p className="text-eyebrow text-gold-400 mb-5">
                  ONE WORLD. ONE PURPOSE. ONE MOVEMENT.
                </p>
                <h1
                  className="text-display-xl text-ivory-100 animate-fade-up"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  THE ONE
                  <br />
                  <span style={{ color: 'hsl(43 80% 73%)' }}>MOVEMENT</span>
                  <br />
                  INTERNATIONAL
                </h1>
                <GoldThread className="mt-8" length="280px" node />
                <p className="mt-6 text-ivory-200 text-lg leading-relaxed max-w-lg animate-fade-in" style={{ animationDelay: '0.15s' }}>
                  A permanent global ecosystem connecting culture, business, diplomacy, education, tourism, media and humanitarian impact.
                </p>
                <div className="mt-8 flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.25s' }}>
                  <Button size="lg" variant="default">
                    Join the Movement
                  </Button>
                  <Button size="lg" variant="gold-outline">
                    Explore Ecosystem
                  </Button>
                </div>
              </div>

              {/* Right: stat blocks — scale contrast with small labels */}
              <div className="lg:col-span-5 lg:ps-8 flex flex-col gap-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="grid grid-cols-2 gap-8">
                  <StatBlock value="190+" label="Countries" surface="dark" />
                  <StatBlock value="12" label="Programs" surface="dark" />
                  <StatBlock value="1M+" label="Members" surface="dark" />
                  <StatBlock value="∞" label="Purpose" surface="dark" />
                </div>
                <div className="border-t border-ink-600 pt-6">
                  <p
                    lang="ar"
                    dir="rtl"
                    className="text-display-md font-arabic text-gold-400"
                    style={{ fontFamily: 'var(--font-arabic)' }}
                    aria-label="We Are One"
                  >
                    نحن واحد
                  </p>
                  <p className="text-xs text-ivory-300 mt-1">WE ARE ONE</p>
                </div>
              </div>
            </div>
          </div>
        </HeroSurface>

        {/* Geometric accent at boundary */}
        <div style={{ backgroundColor: 'hsl(187 67% 12%)' }}>
          <GeometricAccent variant="gold-on-lagoon" height={24} />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-xs text-sand-400">
            End of Design System Gallery · Palette V2 "Lagoon & Gold" Complete · Recommended checkpoint: "Lagoon Gold V2 Approved"
          </p>
        </div>
      </section>
      </div>
    </>
  );
}
