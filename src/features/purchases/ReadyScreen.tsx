import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { colors as c, fontFamily } from '../../constants/theme';
import { loadSetup, saveSetup } from '../../db/onboarding';
import { Setup } from '../onboarding/model';
import { configureReminder } from '../onboarding/reminders';

export default function ReadyScreen({ setup }: { setup: Setup }) {
  const [message, setMessage] = useState('Saving your reminder preference…');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setFailed(false);
    (async () => {
      const saved = await loadSetup();
      const notificationStatus = saved?.remindersConfigured ? saved.notificationStatus : await configureReminder(setup.frequency);
      await saveSetup({ ...setup, notificationStatus, remindersConfigured: true });
      if (active) setMessage(notificationStatus === 'enabled' ? 'Your gentle reminders are on.' : notificationStatus === 'denied' ? 'Notifications are off. You can allow them in your device settings.' : 'Your choices are saved.');
    })().catch(() => { if (active) { setMessage('Your access is active. We couldn’t save your reminder preference.'); setFailed(true); } });
    return () => { active = false; };
  }, [setup, attempt]);
  return <SafeAreaView style={s.safe}><View style={s.content}><View style={s.icon}><Icon name="check" size={34} color={c.blueDark} /></View><Text style={s.title}>A little more{ '\n' }peace of mind.</Text><Text style={s.body}>Dueish Pro is active. Your list is ready.</Text><Text style={s.note}>{message}</Text>{failed && <Pressable accessibilityRole="button" onPress={() => setAttempt(value => value + 1)} style={{ padding: 18 }}><Text style={s.body}>Retry reminders</Text></Pressable>}</View></SafeAreaView>;
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: c.white }, content: { flex: 1, justifyContent: 'center', width: '100%', maxWidth: 480, alignSelf: 'center', padding: 28 }, icon: { width: 76, height: 76, borderRadius: 25, backgroundColor: c.pale, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }, title: { fontFamily, fontSize: 36, lineHeight: 42, fontWeight: '600', letterSpacing: -1.3, color: c.ink }, body: { fontFamily, fontSize: 16, lineHeight: 24, color: c.blueDark, marginTop: 18 }, note: { fontFamily, fontSize: 13, lineHeight: 21, color: c.muted, marginTop: 12 } });
