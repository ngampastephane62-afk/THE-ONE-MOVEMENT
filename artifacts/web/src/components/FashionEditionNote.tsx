import { cn } from '@/lib/utils';

export default function FashionEditionNote({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn('tomi-edition-note grid grid-cols-2 gap-5', dark && 'tomi-edition-note-dark')}
      aria-label="Fashion Week edition status"
    >
      <div>
        <span className="tomi-edition-number">05</span>
        <p className="mt-2 text-xs uppercase tracking-[0.14em]">Completed editions</p>
        <p className="mt-2 text-xs leading-relaxed opacity-75">Bukavu · Goma · Kinshasa</p>
      </div>
      <div>
        <span className="tomi-edition-number">06</span>
        <p className="mt-2 text-xs uppercase tracking-[0.14em]">Planned for November</p>
        <p className="mt-2 text-xs leading-relaxed opacity-75">Currently postponed</p>
      </div>
    </div>
  );
}