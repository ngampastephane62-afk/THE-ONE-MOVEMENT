import { useEffect, useRef, useState } from 'react';
import './world-map.css';

/**
 * Founder-supplied world artwork (Task 24 addendum). Overlay hubs are authored in each image's own
 * pixel space and rendered with the same `slice` fit as the image, so nodes stay on the lit cities.
 */
const ART = {
  earth: {
    src: '/images/vision/founder-world-earth.webp', w: 1024, h: 1024,
    hubs: [[160, 680], [300, 895], [350, 665], [415, 515], [455, 400], [540, 720], [455, 905], [610, 655], [780, 615], [885, 795], [950, 840], [720, 875]],
    routes: [[0, 3], [3, 4], [3, 7], [2, 5], [5, 6], [5, 9], [7, 8], [8, 9], [1, 6], [9, 10], [6, 11], [11, 9]],
  },
  gold: {
    src: '/images/vision/founder-world-gold.webp', w: 1000, h: 667,
    hubs: [[196, 305], [280, 295], [437, 338], [495, 322], [600, 298], [718, 290], [680, 355], [340, 470], [285, 520], [548, 478], [815, 480]],
    routes: [[1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [2, 9], [1, 7], [7, 9], [6, 10], [0, 1], [8, 7], [5, 10]],
  },
} satisfies Record<string, { src: string; w: number; h: number; hubs: number[][]; routes: number[][] }>;

/** Pauses motion when the element is offscreen OR the tab is hidden. */
export function useMotionPause<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [off, setOff] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState === 'hidden');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    const el = ref.current;
    let io: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => setOff(!e.isIntersecting));
      io.observe(el);
    }
    return () => { document.removeEventListener('visibilitychange', onVis); io?.disconnect(); };
  }, []);
  return { ref, paused: off || hidden };
}

/**
 * Decorative Founder world artwork + gold connection overlay. Render inside a `.tl-decor` layer only.
 * `sequence` plays 0–2s emerge, 2–4s connections + horizontal shift; otherwise it renders settled.
 */
export default function WorldMap({ art = 'earth', sequence = false, ring = false, className = '' }: { art?: keyof typeof ART; sequence?: boolean; ring?: boolean; className?: string }) {
  const a: { src: string; w: number; h: number; hubs: number[][]; routes: number[][] } = ART[art];
  return (
    <div className={`wm wm-${art} ${sequence ? 'wm-seq' : ''} ${className}`} aria-hidden>
      {ring && <div className="wm-ring" />}
      <div className="wm-pan">
        <div className="wm-art">
          <img src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}${a.src}`} alt="" width={a.w} height={a.h} decoding="async" fetchPriority={sequence ? 'high' : 'auto'} className="wm-img" />
          <svg viewBox={`0 0 ${a.w} ${a.h}`} preserveAspectRatio="xMidYMid slice" className="wm-svg" focusable="false">
            <g>
              {a.routes.map(([i, j], k) => {
                const [px, py] = a.hubs[i], [qx, qy] = a.hubs[j];
                const mx = (px + qx) / 2, my = (py + qy) / 2 - Math.abs(qx - px) * 0.25;
                return <path key={k} className="wm-route" style={{ ['--i' as string]: k }} d={`M${px} ${py} Q${mx} ${my} ${qx} ${qy}`} pathLength={1} />;
              })}
            </g>
            <g>{a.hubs.map(([x, y], i) => <circle key={i} className="wm-hub" style={{ ['--i' as string]: i }} cx={x} cy={y} r={art === 'earth' ? 3 : 2.4} />)}</g>
          </svg>
        </div>
      </div>
    </div>
  );
}
