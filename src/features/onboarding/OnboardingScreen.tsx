import { useRef, useState } from 'react';
import { ActivityIndicator, Animated, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from '../../components/Icon';
import { colors as c, fontFamily } from '../../constants/theme';
import { saveSetup } from '../../db/onboarding';
import { containsItem, initialSetup, ONBOARDING_VERSION, normalizeItem, Setup } from './model';
import { ForgetStep, ReminderStep, TrackStep } from './Steps';

const pages: { label: string; title: string; subtitle: string; icon: IconName }[] = [
  { label: 'A LITTLE LESS ON YOUR MIND', title: 'What do you constantly forget about?', subtitle: 'We all have those little things.\nWhat are yours?', icon: 'clock' },
  { label: 'MAKE ROOM FOR WHAT MATTERS', title: 'What would you like to keep track of?', subtitle: 'Pick from your list. We’ll help you\nkeep the little things in sight.', icon: 'list' },
  { label: 'FIND YOUR OWN RHYTHM', title: 'How often would you like Dueish to remind you?', subtitle: 'A gentle nudge, when you need it.\nChoose a rhythm that feels right.', icon: 'bell' },
];

export default function OnboardingScreen({ savedSetup, onComplete }: { savedSetup: Setup | null; onComplete: (setup: Setup) => void }) {
  const [setup, setSetup] = useState<Setup>(() => savedSetup ? { ...savedSetup, completed: false } : initialSetup);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const opacity = useRef(new Animated.Value(1)).current;
  const scroll = useRef<ScrollView>(null);


  const change = (patch: Partial<Setup>) => { setError(''); setSetup(current => ({ ...current, ...patch, completed: false })); };
  const go = (next: number) => { Keyboard.dismiss(); setError(''); setStep(next); scroll.current?.scrollTo({ y: 0, animated: false }); opacity.setValue(0); Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start(); };
  const add = (value: string) => {
    const item = normalizeItem(value);
    if (!item) return;
    if (containsItem(setup.items, item)) { setError('That’s already on your list.'); return; }
    change({ items: [...setup.items, item], selected: [...setup.selected, item] }); setInput('');
  };
  const advance = async () => {
    if (busy) return;
    let next = setup;
    if (step === 0 && input.trim()) {
      const item = normalizeItem(input);
      if (!containsItem(setup.items, item)) next = { ...setup, items: [...setup.items, item], selected: [...setup.selected, item] };
      setInput(''); setSetup(next);
    }
    setBusy(true); setError('');
    try {
      if (step < 2) { await saveSetup(next); go(step + 1); }
      else {
        const completed = { ...next, completed: true, completionVersion: ONBOARDING_VERSION };
        await saveSetup(completed);
        Keyboard.dismiss();
        onComplete(completed);
      }
    } catch { setError('We couldn’t save your choices. Please try again.'); }
    finally { setBusy(false); }
  };
  const disabled = busy || (step === 0 && !setup.items.length && !input.trim()) || (step === 1 && !setup.selected.length);
  const page = pages[step];

  return <SafeAreaView style={s.safe} edges={['top', 'bottom']}><KeyboardAvoidingView style={s.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={s.container}>
    <View style={s.header}><View style={s.brand}><View style={s.brandMark}><Icon name="check" size={19} color={c.blueDark} /></View><Text style={s.brandText}>dueish<Text style={{ color: '#71ACD9' }}>.</Text></Text></View><Text style={s.headerNote}>A little less to remember.</Text></View>
    <>
      <View style={s.progressRow}><Pressable accessibilityRole="button" accessibilityLabel="Previous step" disabled={step === 0 || busy} onPress={() => go(step - 1)} style={[s.back, step === 0 && { opacity: 0 }]}><Icon name="back" size={21} /></Pressable><View style={s.progress} accessibilityLabel={`Step ${step + 1} of 3`}>{pages.map((_, i) => <View key={i} style={[s.progressSegment, i <= step && { backgroundColor: '#9AC9F0' }]} />)}</View><Text style={s.stepCount}>0{step + 1}<Text style={{ color: '#A0ACB7' }}> / 03</Text></Text></View>
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}><Animated.View style={{ opacity }}>
        <View style={s.heroIcon}><Icon name={page.icon} size={31} color={c.blueDark} /><View style={s.spark} /></View>
        <Text style={s.eyebrow}>{page.label}</Text><Text accessibilityRole="header" style={[s.title, step === 2 && { fontSize: 33, lineHeight: 39 }]}>{page.title}</Text><Text style={s.subtitle}>{page.subtitle}</Text>
        {step === 0 && <ForgetStep setup={setup} input={input} setInput={setInput} add={add} remove={item => change({ items: setup.items.filter(value => value !== item), selected: setup.selected.filter(value => value !== item) })} />}
        {step === 1 && <TrackStep setup={setup} toggle={item => change({ selected: setup.selected.includes(item) ? setup.selected.filter(value => value !== item) : [...setup.selected, item] })} />}
        {step === 2 && <ReminderStep setup={setup} choose={frequency => change({ frequency })} />}
      </Animated.View></ScrollView>
      <View style={s.footer}>
        {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled }} disabled={disabled} onPress={advance} style={({ pressed }) => [s.cta, disabled && { opacity: 0.45 }, pressed && { backgroundColor: '#9BCBF1' }]}>{busy ? <ActivityIndicator color={c.ink} /> : <><Text style={s.ctaText}>{'Continue'}</Text><Icon name={'arrow'} size={20} /></>}</Pressable>
        <Text style={s.footerNote}>{step === 0 ? 'A lighter mind starts with a little list.' : step === 1 ? 'Your list. Your pace.' : 'You’re in control. Change this anytime.'}</Text>
      </View>
    </>
  </View></KeyboardAvoidingView></SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.white }, keyboard: { flex: 1 }, container: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 27, paddingTop: 15, paddingBottom: 24 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 8 }, brandMark: { width: 27, height: 29, borderRadius: 9, backgroundColor: '#DEEEFC', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-7deg' }] }, brandText: { fontFamily, fontSize: 25, letterSpacing: -1.1, fontWeight: '700', color: c.ink }, headerNote: { fontFamily, fontSize: 10, color: c.muted },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 21, marginBottom: 16, gap: 14 }, back: { width: 34, height: 38, justifyContent: 'center', alignItems: 'center' }, progress: { flex: 1, flexDirection: 'row', gap: 5 }, progressSegment: { flex: 1, height: 4, backgroundColor: '#EDF2F6', borderRadius: 3 }, stepCount: { fontFamily, fontSize: 10, fontWeight: '500', color: c.ink, marginLeft: 4, marginRight: 7 }, scroll: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 22 }, heroIcon: { width: 67, height: 67, borderRadius: 22, backgroundColor: c.pale, alignItems: 'center', justifyContent: 'center', marginBottom: 25 }, spark: { position: 'absolute', width: 10, height: 10, backgroundColor: '#B3D8F5', borderRadius: 3, top: 1, right: 1, transform: [{ rotate: '20deg' }] }, eyebrow: { fontFamily, fontSize: 9, letterSpacing: 1.7, fontWeight: '600', color: '#6686A0', marginBottom: 13 }, title: { fontFamily, fontSize: 36, lineHeight: 42, letterSpacing: -1.35, fontWeight: '600', color: c.ink, maxWidth: 370 }, subtitle: { fontFamily, fontSize: 15, lineHeight: 23, color: c.muted, marginTop: 15, marginBottom: 29 }, footer: { paddingHorizontal: 28, paddingTop: 12, paddingBottom: 13, borderTopWidth: 1, borderTopColor: '#F5F7FA', backgroundColor: c.white }, cta: { backgroundColor: c.blue, borderRadius: 17, minHeight: 57, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, padding: 15 }, ctaText: { fontFamily, fontSize: 15, fontWeight: '600', color: c.ink }, footerNote: { fontFamily, fontSize: 10, color: '#82909E', textAlign: 'center', marginTop: 13 }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center' }, error: { fontFamily, fontSize: 12, lineHeight: 18, color: c.error, marginBottom: 12 }, success: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 13 }, successText: { fontFamily, flex: 1, color: c.blueDark, fontSize: 12, lineHeight: 18 },
});
