import { Link } from 'wouter';
import MovementLink from '@/components/MovementLink';
import { Button } from '@/components/ui/button';
import { AUTO_HREF, type SectionView } from '@/lib/home-editorial';

/** Primary call to action: automatic membership link by default, or a Founder-chosen internal destination. */
export default function EditorialCta({ ed, className, testId, buttonSize }: { ed?: SectionView; className?: string; testId?: string; buttonSize?: 'xl' }) {
  const href = ed ? ed.href('primaryHref') : AUTO_HREF;
  if (href === AUTO_HREF) return <MovementLink buttonSize={buttonSize} className={className} data-testid={testId} />;
  const label = ed!.t('primaryLabel');
  if (!label.trim()) return null;
  return <Link href={href} className={className} data-testid={testId}>{buttonSize ? <Button size={buttonSize}>{label}</Button> : label}</Link>;
}
