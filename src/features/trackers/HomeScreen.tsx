import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { colors as c, fontFamily } from '../../constants/theme';
import { loadSetup, saveSetup } from '../../db/onboarding';
import { Setup } from '../onboarding/model';
import { configureReminder } from '../onboarding/reminders';
import { usePurchases } from '../purchases/PurchasesProvider';
import { daysUntil, dueLabel, formatDate, Tracker } from './model';
import { TrackerDetails } from './TrackerDetails';
import { useTrackers } from './useTrackers';

export default function HomeScreen({ setup }: { setup: Setup }) {
  const { simulated, resetSimulation } = usePurchases();
  const { items, loading, busy, error, load, update } = useTrackers(setup.selected);
  const [selected, setSelected] = useState<Tracker | null | undefined>(undefined);
  const [now, setNow] = useState(new Date());
  const [notificationNote, setNotificationNote] = useState('');
  const [notificationAttempt, setNotificationAttempt] = useState(0);
  const [notificationFailed, setNotificationFailed] = useState(false);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const timer = setInterval(tick, 60000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') tick(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  useEffect(() => {
    if (simulated) return;
    let active = true;
    setNotificationFailed(false);
    (async () => {
      const saved = await loadSetup();
      const status = saved?.remindersConfigured ? saved.notificationStatus : await configureReminder(setup.frequency);
      await saveSetup({ ...setup, notificationStatus: status, remindersConfigured: true });
      if (active) setNotificationNote(status === 'denied' ? 'Notifications are off. You can allow them in your device settings.' : '');
    })().catch(() => { if (active) { setNotificationNote('Your list is ready, but notifications couldn’t be set up.'); setNotificationFailed(true); } });
    return () => { active = false; };
  }, [setup, simulated, notificationAttempt]);
  const sorted = [...items].sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.name.localeCompare(b.name));
  const due = sorted.filter(item => daysUntil(item.dueDate, now) <= 0);
  const upcoming = sorted.filter(item => daysUntil(item.dueDate, now) > 0);
  function rows(list: Tracker[]) {
    return list.map(item => {
      const urgent = daysUntil(item.dueDate, now) <= 0;
      return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.name}, ${dueLabel(item, now)}. Open reminder`} onPress={() => setSelected(item)} style={({ pressed }) => [s.row, pressed && { backgroundColor: c.pale }]}>
        <View style={[s.rowIcon, urgent && { backgroundColor: '#DEEEFC' }]}><Icon name="list" size={23} color={c.blueDark} /></View>
        <View style={{ flex: 1 }}><Text style={s.itemName}>{item.name}</Text><Text style={s.itemMeta}>Every {item.intervalDays} {item.intervalDays === 1 ? 'day' : 'days'} · {formatDate(item.dueDate)}</Text><Text style={[s.due, urgent && { color: c.blueDark, fontWeight: '600' }]}>{dueLabel(item, now)}</Text></View><Icon name="arrow" size={18} color={c.muted} />
      </Pressable>;
    });
  }
  return <SafeAreaView style={s.safe}><View style={s.container}>
    <View style={s.header}><Text style={s.brand}>dueish<Text style={{ color: '#71ACD9' }}>.</Text></Text><Pressable accessibilityRole="button" accessibilityLabel="Add reminder" disabled={loading || !!error} onPress={() => setSelected(null)} style={s.add}><Icon name="plus" /></Pressable></View>
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.eyebrow}>{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text>
      <Text accessibilityRole="header" style={s.title}>A little less{ '\n' }on your mind.</Text><Text style={s.subtitle}>Your little things, all in one place.</Text>
      {simulated && <View style={s.simulation}><Text style={s.simulationText}>Purchase simulation · No charges</Text><Pressable accessibilityRole="button" onPress={resetSimulation} style={s.simulationAction}><Text style={s.simulationText}>Test another plan</Text></Pressable></View>}
      {loading ? <ActivityIndicator color={c.blueDark} style={{ marginVertical: 40 }} accessibilityLabel="Loading reminders" /> : error ? <View style={s.empty}><Text accessibilityRole="alert" style={s.error}>{error}</Text><Pressable accessibilityRole="button" onPress={load} style={s.retry}><Text style={s.retryText}>Try again</Text></Pressable></View> : <>
        <View style={s.summary}><View style={s.summaryIcon}><Icon name={due.length ? 'clock' : 'check'} size={29} color={c.blueDark} /></View><View style={{ flex: 1 }}><Text style={s.summaryTitle}>{due.length ? `${due.length} ${due.length === 1 ? 'thing needs' : 'things need'} a little attention` : 'A little breathing room.'}</Text><Text style={s.summaryBody}>{due.length ? 'Whenever you’re ready, take it one at a time.' : upcoming.length ? `Next up: ${formatDate(upcoming[0].dueDate)}` : 'Add something you’d like to remember.'}</Text></View></View>
        {items.length === 0 ? <View style={s.empty}><Text style={s.sectionTitle}>What would you like to remember?</Text><Text style={s.subtitle}>Start with one little thing.</Text><Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={s.retry}><Text style={s.retryText}>Add your first reminder</Text></Pressable></View> : <>
          {due.length > 0 && <><View style={s.section}><Text style={s.sectionTitle}>Due now</Text><Text style={s.count}>{due.length}</Text></View>{rows(due)}</>}
          {upcoming.length > 0 && <><View style={s.section}><Text style={s.sectionTitle}>Coming up</Text><Text style={s.count}>{upcoming.length}</Text></View>{rows(upcoming)}</>}
          <Text style={s.hint}>New reminders start weekly. Tap any item to change its schedule or mark it done.</Text>
        </>}
      </>}
      {!!notificationNote && <Text style={s.hint}>{notificationNote}</Text>}
      {notificationFailed && <Pressable accessibilityRole="button" onPress={() => setNotificationAttempt(value => value + 1)} style={s.retry}><Text style={s.retryText}>Retry notifications</Text></Pressable>}
    </ScrollView>
    <View style={s.footer}><Icon name="bell" size={16} color={c.muted} /><Text style={s.footerText}>{simulated ? 'Preview mode · Notifications are not sent' : setup.frequency ? `Your check-in: every ${setup.frequency} ${setup.frequency === 1 ? 'day' : 'days'}` : 'At your own pace. Notifications are off.'}</Text></View>
    {selected !== undefined && <TrackerDetails item={selected} busy={busy} saveError={error} onSave={update} onClose={() => { setSelected(undefined); setNow(new Date()); }} />}
  </View></SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.white }, container: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' }, header: { paddingHorizontal: 28, paddingTop: 12, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, brand: { fontFamily, fontSize: 29, letterSpacing: -1.2, fontWeight: '700', color: c.ink }, add: { width: 44, height: 44, borderRadius: 14, backgroundColor: c.pale, alignItems: 'center', justifyContent: 'center' }, content: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 28 }, eyebrow: { fontFamily, fontSize: 10, fontWeight: '600', letterSpacing: 1.4, color: '#6686A0', marginBottom: 16 }, title: { fontFamily, fontSize: 37, lineHeight: 43, letterSpacing: -1.3, fontWeight: '600', color: c.ink }, subtitle: { fontFamily, color: c.muted, fontSize: 14, lineHeight: 22, marginTop: 13 }, summary: { backgroundColor: c.pale, borderRadius: 22, padding: 20, flexDirection: 'row', gap: 16, alignItems: 'center', marginTop: 28, marginBottom: 12 }, summaryIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#DEEEFC', alignItems: 'center', justifyContent: 'center' }, summaryTitle: { fontFamily, fontSize: 16, fontWeight: '600', lineHeight: 22, color: c.ink }, summaryBody: { fontFamily, fontSize: 12, lineHeight: 18, color: c.muted, marginTop: 5 }, section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 27, marginBottom: 13 }, sectionTitle: { fontFamily, fontSize: 18, fontWeight: '600', color: c.ink }, count: { fontFamily, fontSize: 12, color: c.muted }, row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 1, borderColor: c.border, borderRadius: 18, marginBottom: 11 }, rowIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#F3F7FB', justifyContent: 'center', alignItems: 'center' }, itemName: { fontFamily, fontSize: 16, fontWeight: '500', color: c.ink, lineHeight: 22 }, itemMeta: { fontFamily, fontSize: 10, color: c.muted, marginTop: 5, lineHeight: 16 }, due: { fontFamily, fontSize: 12, color: c.muted, marginTop: 7 }, hint: { fontFamily, fontSize: 12, lineHeight: 20, color: c.muted, marginTop: 17, textAlign: 'center' }, footer: { padding: 17, flexDirection: 'row', justifyContent: 'center', gap: 9, borderTopWidth: 1, borderTopColor: c.border }, footerText: { fontFamily, fontSize: 11, color: c.muted, flexShrink: 1 }, empty: { paddingVertical: 32 }, error: { fontFamily, fontSize: 14, color: c.error, lineHeight: 21 }, retry: { paddingVertical: 17, minHeight: 44 }, retryText: { fontFamily, color: c.blueDark, fontSize: 14, fontWeight: '500' }, simulation: { marginTop: 18, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 12, paddingTop: 12 }, simulationText: { fontFamily, color: c.blueDark, fontSize: 11 }, simulationAction: { paddingVertical: 13, minHeight: 44 },
});
