import { Redirect } from 'expo-router';
import { useSession } from '@/store/session';

/** The intro plays once, on first launch. After that the app opens straight into the store. */
export default function Index() {
  const onboarded = useSession((s) => s.onboarded);
  return <Redirect href={onboarded ? '/(tabs)' : '/intro'} />;
}
