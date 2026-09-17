import { useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { colors as c, fontFamily } from '../../constants/theme';
import { plans, PlanId } from './config';
import { usePurchases } from './PurchasesProvider';

export default function PaywallScreen() {
  const { simulated, packages, loading, busy, error, purchase, restore, refresh } = usePurchases();
  const [selected, setSelected] = useState<PlanId>('annual');
  const [privacy, setPrivacy] = useState(false);
  const [linkError, setLinkError] = useState('');
  const plan = plans.find(value => value.id === selected)!;
  const price = packages[selected]?.product.priceString ?? plan.price;
  const disabled = loading || busy || !packages[selected];
  const openTerms = async () => {
    try { await Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'); }
    catch { setLinkError('Terms couldn’t be opened. Please try again.'); }
  };
  return <SafeAreaView style={s.safe}><View style={s.container}>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.brand}><Text style={s.wordmark}>dueish<Text style={{ color: '#71ACD9' }}>.</Text></Text><Text style={s.pro}>PRO</Text></View>
      {simulated && <Text style={[s.disclosure, { marginTop: 0, marginBottom: 18, color: c.blueDark }]}>DEVELOPMENT SIMULATION · No charges</Text>}
      <View style={s.hero}><Icon name="clock" size={35} color={c.blueDark} /></View>
      <Text style={s.eyebrow}>A LITTLE LESS ON YOUR MIND</Text>
      <Text accessibilityRole="header" style={s.title}>Make room for{ '\n' }everything else.</Text>
      <Text style={s.subtitle}>A place for the little things.{ '\n' }Choose your way to Dueish.</Text>
      <View style={s.promise}><Icon name="check" size={18} color={c.blueDark} /><Text style={s.promiseText}>One plan. Full access to Dueish.</Text></View>
      <View style={s.options}>{plans.map(option => {
        const checked = option.id === selected;
        return <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ checked, disabled: busy }} disabled={busy} accessibilityLabel={`${option.title}, ${packages[option.id]?.product.priceString ?? option.price} per ${option.period}`} onPress={() => setSelected(option.id)} style={[s.option, checked && s.selected]}>
          <View style={[s.radio, checked && { borderColor: c.blueDark }]}>{checked && <View style={s.dot} />}</View>
          <View style={{ flex: 1 }}><View style={s.planHeader}><Text style={s.planTitle}>{option.title}</Text>{option.id === 'annual' && <Text style={s.badge}>Popular</Text>}</View><Text style={s.detail}>{option.detail}</Text></View>
          <View style={s.priceBlock}><Text style={s.price}>{packages[option.id]?.product.priceString ?? option.price}</Text><Text style={s.period}>{option.id === 'lifetime' ? 'one time' : `/ ${option.period}`}</Text></View>
        </Pressable>;
      })}</View>
      <Text style={s.disclosure}>{selected === 'lifetime' ? `${price} charged once for lifetime access. No subscription or recurring payment.` : `${price} billed every ${plan.period}. Automatically renews unless canceled at least 24 hours before renewal. Manage or cancel in your Apple account settings.`}</Text>
    </ScrollView>
    <View style={s.footer}>
      {!!(error || linkError) && <Text accessibilityRole="alert" style={s.error}>{error || linkError}</Text>}
      {!!error && <Pressable accessibilityRole="button" disabled={loading || busy} onPress={refresh} style={s.link}><Text style={s.linkText}>Try again</Text></Pressable>}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={() => purchase(selected)} style={[s.cta, disabled && { opacity: 0.45 }]}>{loading || busy ? <ActivityIndicator color={c.ink} /> : <><Text style={s.ctaText}>{selected === 'lifetime' ? 'Unlock Dueish forever' : 'Continue with ' + plan.title.toLowerCase()}</Text><Icon name="arrow" size={20} /></>}</Pressable>
      <View style={s.links}><Pressable accessibilityRole="button" disabled={busy || loading} onPress={restore} style={s.link}><Text style={s.linkText}>Restore purchases</Text></Pressable><Pressable accessibilityRole="link" onPress={openTerms} style={s.link}><Text style={s.linkText}>Terms</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setPrivacy(true)} style={s.link}><Text style={s.linkText}>Privacy</Text></Pressable></View>
    </View>
    <Modal visible={privacy} animationType="slide" onRequestClose={() => setPrivacy(false)}><SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}><Text style={s.title}>Your privacy.</Text><Text style={s.subtitle}>Your lists and reminder preferences are stored on your device. Dueish does not send the contents of your lists to RevenueCat.{ '\n\n' }Apple processes purchases. RevenueCat processes purchase history, subscription status, and an anonymous app user identifier to provide and restore your access. No Dueish account is required.{ '\n\n' }Removing the app removes its local data. Purchase records are managed by Apple and RevenueCat under their privacy policies.</Text><Pressable accessibilityRole="button" onPress={() => setPrivacy(false)} style={s.cta}><Text style={s.ctaText}>Done</Text></Pressable></ScrollView></SafeAreaView></Modal>
  </View></SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.white }, container: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' }, content: { padding: 28 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 }, wordmark: { fontFamily, fontSize: 26, fontWeight: '700', letterSpacing: -1, color: c.ink }, pro: { fontFamily, fontSize: 10, letterSpacing: 1.5, color: c.blueDark, backgroundColor: c.pale, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6 }, hero: { width: 76, height: 76, borderRadius: 25, backgroundColor: c.pale, alignItems: 'center', justifyContent: 'center', marginBottom: 25 }, eyebrow: { fontFamily, fontSize: 9, letterSpacing: 1.7, fontWeight: '600', color: '#6686A0', marginBottom: 13 }, title: { fontFamily, fontSize: 36, lineHeight: 42, letterSpacing: -1.35, fontWeight: '600', color: c.ink }, subtitle: { fontFamily, fontSize: 15, lineHeight: 24, color: c.muted, marginTop: 16 }, promise: { flexDirection: 'row', alignItems: 'center', gap: 9, marginVertical: 25 }, promiseText: { fontFamily, fontSize: 13, color: c.blueDark }, options: { gap: 12 }, option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 1.5, borderColor: c.border, borderRadius: 18, minHeight: 90 }, selected: { borderColor: '#B3D6F3', backgroundColor: c.pale }, radio: { width: 21, height: 21, borderRadius: 11, borderWidth: 1.5, borderColor: '#CBD6E0', justifyContent: 'center', alignItems: 'center' }, dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: c.blueDark }, planHeader: { gap: 5 }, planTitle: { fontFamily, fontSize: 16, fontWeight: '600', color: c.ink }, badge: { fontFamily, fontSize: 9, color: c.blueDark }, detail: { fontFamily, fontSize: 11, lineHeight: 16, color: c.muted, marginTop: 5 }, priceBlock: { alignItems: 'flex-end', maxWidth: '38%' }, price: { fontFamily, fontSize: 20, fontWeight: '600', letterSpacing: -0.5, color: c.ink }, period: { fontFamily, fontSize: 11, color: c.muted, marginTop: 4 }, disclosure: { fontFamily, fontSize: 11, lineHeight: 18, color: c.muted, marginTop: 22 }, footer: { borderTopWidth: 1, borderTopColor: '#F5F7FA', paddingHorizontal: 28, paddingTop: 12 }, cta: { backgroundColor: c.blue, borderRadius: 17, minHeight: 57, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 15 }, ctaText: { fontFamily, fontSize: 15, color: c.ink, fontWeight: '600' }, links: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }, link: { paddingHorizontal: 10, paddingVertical: 16, minHeight: 44 }, linkText: { fontFamily, fontSize: 11, color: c.muted }, error: { fontFamily, color: c.error, fontSize: 12, lineHeight: 18, marginBottom: 8 },
});
