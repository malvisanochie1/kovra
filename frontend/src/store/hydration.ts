import { useEffect, useState } from 'react';
import { useCart } from './cart';
import { useHistory } from './history';
import { useSession } from './session';
import { useVault } from './vault';

const persisted = [useSession, useCart, useVault, useHistory];

const allHydrated = () => persisted.every((store) => store.persist.hasHydrated());

/** True once every persisted store has been restored from disk. */
export function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(allHydrated);

  useEffect(() => {
    if (hydrated) return;
    const update = () => allHydrated() && setHydrated(true);
    const unsubscribers = persisted.map((store) => store.persist.onFinishHydration(update));
    update();
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [hydrated]);

  return hydrated;
}
