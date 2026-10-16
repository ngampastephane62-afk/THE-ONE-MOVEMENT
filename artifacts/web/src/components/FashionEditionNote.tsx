import { cn } from '@/lib/utils';

export default function FashionEditionNote({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn('tomi-edition-note grid grid-cols-2 gap-5', dark && 'tomi-edition-note-dark')}
      aria-label="Fashion Week editions"
    >
      <div>
        <span className="tomi-edition-number">05</span>
        <p className="mt-2 text-xs uppercase tracking-[0.14em]">Completed editions</p>
        <p className="mt-2 text-xs leading-relaxed opacity-75">Bukavu · Goma · Kinshasa</p>
      </div>
      <div>
        <span className="tomi-edition-number">06</span>
        <p className="mt-2 text-xs uppercase tracking-[0.14em]">Sixth edition · Dubai</p>
        <p className="mt-2 text-xs leading-relaxed opacity-75"><time dateTime="2026-12-22">22 December 2026</time> · first Dubai edition</p>
      </div>
    </div>
  );
}
