import type { AnchorHTMLAttributes } from 'react';
import { useAuth } from '@clerk/react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> & {
  buttonSize?: 'lg' | 'xl';
  'data-testid'?: string;
};

/** Membership exists once authenticated; opportunity enquiries remain separate. */
export default function MovementLink({ buttonSize, ...props }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const label = !isLoaded ? 'Member access' : isSignedIn ? 'My Space' : 'Join the Movement';
  return (
    <Link {...props} href={isSignedIn ? '/member' : '/join'}>
      {buttonSize ? <Button size={buttonSize}>{label}</Button> : label}
    </Link>
  );
}
