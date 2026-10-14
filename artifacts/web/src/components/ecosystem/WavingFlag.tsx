import flagSrc from '@/assets/media/home/tomi-peace-flag.webp';

const STRIPS = 14;

/** Continuous wave built from vertical slices, each translated on a sine offset (transform-only). */
export default function WavingFlag({ className = '' }: { className?: string }) {
  return (
    <div className={`eco-flag ${className}`} role="img" aria-label="The One Movement peace flag, waving">
      <span className="eco-flag-pole" aria-hidden="true" />
      <div className="eco-flag-cloth" aria-hidden="true">
        {Array.from({ length: STRIPS }).map((_, i) => (
          <span
            key={i}
            className="eco-flag-strip"
            style={{
              backgroundImage: `url(${flagSrc})`,
              backgroundSize: `${STRIPS * 100}% 100%`,
              backgroundPosition: `${(i / (STRIPS - 1)) * 100}% 0`,
              animationDelay: `${-i * 0.16}s`,
              ['--amp' as string]: `${2 + i * 0.55}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
