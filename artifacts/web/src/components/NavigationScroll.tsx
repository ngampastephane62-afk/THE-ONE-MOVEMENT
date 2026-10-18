import { useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { createNavigationScroll } from '@/lib/navigation-scroll';

/** No markup, click interception, or changes to the navigation menus. */
export default function NavigationScroll() {
  const [scroll] = useState(() => createNavigationScroll(window));
  const navigation = useSyncExternalStore(scroll.subscribe, scroll.getSnapshot);

  useLayoutEffect(() => {
    scroll.afterCommit(navigation);
  }, [scroll, navigation]);

  return null;
}
