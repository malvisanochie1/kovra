import { Redirect } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Container } from '@/components/ui/primitives';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { linkFingerprint, unlinkFingerprint } from '@/features/account/fingerprint';
import { FingerprintMark, type ScanState } from '@/features/account/FingerprintMark';
import { useBiometricSupport } from '@/features/account/useBiometricSupport';
import { useTrayPlacement } from '@/features/bag/useTrayPlacement';
import { ApiError } from '@/lib/api';
import { useSession } from '@/store/session';
import { colors } from '@/theme/colors';
import { rise } from '@/theme/entering';

type Action = 'link' | 'relink' | 'unlink';

const rules = [
  'Your password is needed to turn fingerprint sign-in on, update it or turn it off.',
  'Signing in with a fingerprint always needs your username or email too.',
  'If a new fingerprint is added to this phone, Kovra turns fingerprint sign-in off until you set it up again.',
];

export default function Security() {
  useTrayPlacement('hidden');
  const { profile, token, fingerprint } = useSession();
  const support = useBiometricSupport();
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState<Action | null>(null);
  const [scan, setScan] = useState<ScanState>('idle');
  const [message, setMessage] = useState<{ text: string; tone: 'error' | 'success' } | null>(null);

  if (!profile) return <Redirect href="/auth" />;

  const linkedHere = fingerprint?.username === profile.username;
  const linkedToOther = fingerprint && !linkedHere;
  const session = { user: profile, token };

  const run = async (action: Action) => {
    if (!password) {
      setMessage({ text: 'Enter your password to continue', tone: 'error' });
      return;
    }
    setPending(action);
    setMessage(null);
    setScan(action === 'unlink' ? 'idle' : 'scanning');
    try {
      if (action === 'unlink') await unlinkFingerprint(session, password);
      else await linkFingerprint(session, password);
      setScan(action === 'unlink' ? 'idle' : 'success');
      setMessage({
        text:
          action === 'unlink'
            ? 'Fingerprint sign-in is off for this phone.'
            : action === 'relink'
              ? 'Fingerprint updated.'
              : 'Fingerprint sign-in is on.',
        tone: 'success',
      });
      setPassword('');
    } catch (error) {
      setScan('error');
      setMessage({ text: error instanceof ApiError ? error.message : 'Something went wrong. Please try again.', tone: 'error' });
    } finally {
      setPending(null);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-ink">
      <ScreenHeader title="Security" fallbackHref="/me" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
        <Container narrow className="gap-7">
          <Animated.View entering={rise(0)} className="items-center gap-4 rounded-[28px] border border-edge bg-ink-2 px-6 py-8">
            <FingerprintMark state={linkedHere && scan === 'idle' ? 'success' : scan} size={120} />
            <View className="items-center gap-1">
              <Text className="font-sora-semibold text-lg text-snow">Fingerprint sign-in</Text>
              <Text className="text-center font-sora text-sm text-mist">
                {linkedHere ? `On for @${profile.username} on this phone` : 'Off on this phone'}
              </Text>
            </View>
          </Animated.View>

          {support && !support.available ? (
            <View className="flex-row gap-3 rounded-2xl border border-edge bg-ink-2 p-4">
              <Icon name="info" size={18} color={colors.mist} />
              <Text className="flex-1 font-sora text-sm leading-6 text-mist">{support.reason}</Text>
            </View>
          ) : (
            <Animated.View entering={rise(1)} className="gap-5">
              {linkedToOther && (
                <Text className="font-sora text-sm leading-6 text-mist">
                  This phone’s fingerprint is linked to @{fingerprint.username}. Turning it on here will move it to your account.
                </Text>
              )}
              <Field
                label="Your password"
                icon="lock"
                placeholder="Required for any change"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoComplete="current-password"
              />
              {message && (
                <Animated.Text
                  entering={FadeInDown.duration(220)}
                  className={`font-sora text-sm ${message.tone === 'error' ? 'text-danger' : 'text-success'}`}
                >
                  {message.text}
                </Animated.Text>
              )}
              {linkedHere ? (
                <View className="gap-3">
                  <Button label="Update fingerprint" icon="fingerprint" loading={pending === 'relink'} onPress={() => run('relink')} />
                  <Button label="Turn off" variant="glass" loading={pending === 'unlink'} onPress={() => run('unlink')} />
                </View>
              ) : (
                <Button
                  label="Turn on fingerprint sign-in"
                  icon="fingerprint"
                  shine
                  loading={pending === 'link'}
                  onPress={() => run('link')}
                />
              )}
            </Animated.View>
          )}

          <View className="gap-3 rounded-[22px] border border-edge bg-ink-2 p-5">
            {rules.map((rule) => (
              <View key={rule} className="flex-row gap-3">
                <Icon name="shield" size={16} color={colors.gold} />
                <Text className="flex-1 font-sora text-[13px] leading-5 text-mist">{rule}</Text>
              </View>
            ))}
          </View>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
