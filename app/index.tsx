import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { loadSetup } from '../src/db/onboarding';
import OnboardingScreen from '../src/features/onboarding/OnboardingScreen';
import { hasCompletedOnboarding, Setup } from '../src/features/onboarding/model';
import PaywallScreen from '../src/features/purchases/PaywallScreen';
import { usePurchases } from '../src/features/purchases/PurchasesProvider';
import ReadyScreen from '../src/features/purchases/ReadyScreen';
import { colors, fontFamily } from '../src/constants/theme';

export default function EntryScreen() {
  const [setup, setSetup] = useState<Setup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const purchases = usePurchases();
  async function load() {
    setLoading(true); setError(false);
    try { setSetup(await loadSetup()); } catch { setError(true); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  const onboardingComplete = hasCompletedOnboarding(setup);
  if (loading || (onboardingComplete && purchases.loading && !purchases.isPro)) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.white }}><ActivityIndicator color={colors.blueDark} /></View>;
  if (error) return <View style={{ flex: 1, justifyContent: 'center', padding: 28 }}><Text style={{ fontFamily, color: colors.ink }}>Your saved choices couldn’t be loaded.</Text><Pressable onPress={load} accessibilityRole="button" style={{ paddingVertical: 20 }}><Text style={{ color: colors.blueDark }}>Try again</Text></Pressable></View>;
  if (!onboardingComplete || !setup) return <OnboardingScreen savedSetup={setup} onComplete={setSetup} />;
  // No local paid flag: only RevenueCat's entitlement grants access.
  if (!purchases.isPro) return <PaywallScreen />;
  return <ReadyScreen setup={setup} />;
}
