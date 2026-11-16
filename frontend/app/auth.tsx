import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Aurora } from '@/components/brand/Aurora';
import { LogoMark } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { OptionCard } from '@/components/ui/OptionCard';
import { Segmented } from '@/components/ui/Segmented';
import { linkFingerprint, signInWithFingerprint } from '@/features/account/fingerprint';
import { FingerprintMark, type ScanState } from '@/features/account/FingerprintMark';
import { useBiometricSupport } from '@/features/account/useBiometricSupport';
import { ApiError } from '@/lib/api';
import { isValidEmail, isValidPhone, normalisePhone, type Errors } from '@/lib/validation';
import { auth, type Session } from '@/services/auth';
import { useSession } from '@/store/session';
import { rise } from '@/theme/entering';

type Mode = 'join' | 'signin';
type FieldName = 'name' | 'username' | 'email' | 'phone' | 'identifier' | 'password' | 'form';

const USERNAME = /^[a-zA-Z0-9_.]{3,24}$/;
const messageOf = (error: unknown) => (error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');

export default function Auth() {
  const insets = useSafeAreaInsets();
  const { signIn, fingerprint } = useSession();
  const support = useBiometricSupport();
  const [mode, setMode] = useState<Mode>('join');
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', identifier: '', password: '' });
  const [wantsFingerprint, setWantsFingerprint] = useState(false);
  const [errors, setErrors] = useState<Errors<FieldName>>({});
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState<{ state: ScanState; message: string } | null>(null);

  const joining = mode === 'join';
  const canUseFingerprint = support?.available === true;

  const set = (key: Exclude<FieldName, 'form'>) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  const leave = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  const validate = () => {
    const next: Errors<FieldName> = {};
    if (joining) {
      if (form.name.trim().length < 2) next.name = 'Enter your full name';
      if (!USERNAME.test(form.username.trim())) next.username = 'Use 3–24 letters, numbers, dots or underscores';
      if (!isValidEmail(form.email)) next.email = 'Enter a valid email address';
      if (!isValidPhone(form.phone)) next.phone = 'Enter a valid Nigerian phone number';
      if (form.password.length < 8) next.password = 'Use at least 8 characters';
    } else {
      if (form.identifier.trim().length < 3) next.identifier = 'Enter your username or email';
      if (!form.password) next.password = 'Enter your password';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /** After joining, links the fingerprint while the scanner is shown. */
  const setUpFingerprint = async (session: Session) => {
    setScan({ state: 'scanning', message: 'Touch the fingerprint sensor to link it to your account' });
    try {
      await linkFingerprint(session, form.password);
      setScan({ state: 'success', message: 'Fingerprint sign-in is on' });
      setTimeout(leave, 900);
    } catch (error) {
      setScan({ state: 'error', message: `${messageOf(error)} You can turn it on later in Me → Security.` });
    }
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const session = joining
        ? await auth.register({
            name: form.name.trim(),
            username: form.username.trim(),
            email: form.email.trim(),
            phone: normalisePhone(form.phone),
            password: form.password,
          })
        : await auth.login(form.identifier, form.password);
      signIn(session);
      if (joining && wantsFingerprint && canUseFingerprint) await setUpFingerprint(session);
      else leave();
    } catch (error) {
      setErrors({ form: messageOf(error) });
    } finally {
      setBusy(false);
    }
  };

  const fingerprintSignIn = async () => {
    if (form.identifier.trim().length < 3) {
      setErrors({ identifier: 'Enter your username or email first' });
      return;
    }
    setScan({ state: 'scanning', message: 'Touch the fingerprint sensor' });
    try {
      signIn(await signInWithFingerprint(form.identifier));
      setScan({ state: 'success', message: 'Welcome back' });
      setTimeout(leave, 700);
    } catch (error) {
      setScan({ state: 'error', message: messageOf(error) });
    }
  };

  if (scan) {
    return (
      <View
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
        className="flex-1 items-center justify-center gap-8 bg-ink px-8"
      >
        <Aurora variant="page" />
        <Animated.View entering={FadeIn.duration(300)}>
          <FingerprintMark state={scan.state} size={150} />
        </Animated.View>
        <Text className="max-w-[340px] text-center font-sora-medium text-base leading-6 text-snow">{scan.message}</Text>
        {scan.state === 'error' && (
          <View className="w-full max-w-[340px] gap-3">
            {!joining && <Button label="Try again" icon="fingerprint" onPress={fingerprintSignIn} />}
            <Button label={joining ? 'Continue' : 'Use my password'} variant="ghost" onPress={() => (joining ? leave() : setScan(null))} />
          </View>
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-ink">
      <Aurora variant="page" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }}
        contentContainerClassName="grow justify-center px-6"
      >
        <View className="w-full max-w-[440px] gap-7 self-center">
          <Animated.View entering={rise(0)} className="gap-4">
            <LogoMark size={56} />
            <Text className="font-sora-bold text-[32px] leading-10 text-snow">{joining ? 'Join Kovra' : 'Welcome back'}</Text>
            <Text className="font-sora text-[15px] leading-6 text-mist">
              {joining ? 'Track orders, keep a Vault and check out in seconds.' : 'Sign in with your username or email.'}
            </Text>
          </Animated.View>

          <Animated.View entering={rise(1)}>
            <Segmented
              options={[
                { value: 'join', label: 'Create account' },
                { value: 'signin', label: 'Sign in' },
              ]}
              value={mode}
              onChange={(value) => {
                setMode(value);
                setErrors({});
              }}
            />
          </Animated.View>

          {joining ? (
            <Animated.View key="join" entering={FadeInDown.duration(320)} exiting={FadeOutUp.duration(160)} className="gap-5">
              <Field
                label="Full name"
                icon="user"
                placeholder="Ada Obi"
                value={form.name}
                onChangeText={set('name')}
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="Username"
                icon="tag"
                placeholder="ada.obi"
                autoCapitalize="none"
                autoCorrect={false}
                value={form.username}
                onChangeText={set('username')}
                error={errors.username}
                autoComplete="username"
              />
              <Field
                label="Email"
                icon="mail"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={set('email')}
                error={errors.email}
                autoComplete="email"
              />
              <Field
                label="Phone number"
                icon="phone"
                placeholder="0803 123 4567"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={set('phone')}
                error={errors.phone}
                autoComplete="tel"
              />
              <Field
                label="Password"
                icon="lock"
                placeholder="At least 8 characters"
                secureTextEntry
                value={form.password}
                onChangeText={set('password')}
                error={errors.password}
                autoComplete="new-password"
              />
              {canUseFingerprint && (
                <OptionCard
                  title="Turn on fingerprint sign-in"
                  detail="Sign in with your username or email and a touch. You can change this later."
                  selected={wantsFingerprint}
                  onPress={() => setWantsFingerprint((v) => !v)}
                />
              )}
            </Animated.View>
          ) : (
            <Animated.View key="signin" entering={FadeInDown.duration(320)} exiting={FadeOutUp.duration(160)} className="gap-5">
              <Field
                label="Username or email"
                icon="user"
                placeholder="ada.obi"
                autoCapitalize="none"
                autoCorrect={false}
                value={form.identifier}
                onChangeText={set('identifier')}
                error={errors.identifier}
                autoComplete="username"
              />
              <Field
                label="Password"
                icon="lock"
                placeholder="Your password"
                secureTextEntry
                value={form.password}
                onChangeText={set('password')}
                error={errors.password}
                autoComplete="current-password"
              />
            </Animated.View>
          )}

          {errors.form && (
            <Animated.Text entering={FadeInDown.duration(220)} className="font-sora text-sm text-danger">
              {errors.form}
            </Animated.Text>
          )}

          <View className="gap-3">
            <Button label={joining ? 'Create account' : 'Sign in'} shine loading={busy} onPress={submit} />
            {!joining && canUseFingerprint && fingerprint && (
              <Button label="Sign in with fingerprint" icon="fingerprint" variant="glass" onPress={fingerprintSignIn} />
            )}
            <Button label="Continue as guest" variant="ghost" onPress={leave} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
