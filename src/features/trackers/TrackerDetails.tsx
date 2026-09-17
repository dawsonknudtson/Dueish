import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as c, fontFamily } from '../../constants/theme';
import { Icon } from '../../components/Icon';
import { createTracker, dateKey, dueLabel, formatDate, markDone, parseDate, Tracker } from './model';

export function TrackerDetails({ item, busy, saveError, onSave, onClose }: {
  item: Tracker | null; busy: boolean; saveError: string;
  onSave: (item: Tracker) => Promise<boolean>; onClose: () => void;
}) {
  const [draft] = useState(() => item ?? createTracker(''));
  const [name, setName] = useState(draft.name);
  const [interval, setInterval] = useState(String(draft.intervalDays));
  const [dueDate, setDueDate] = useState(draft.dueDate);
  const [error, setError] = useState('');
  async function submit(done: boolean) {
    if (busy) return;
    const cleaned = name.trim().replace(/\s+/g, ' ');
    if (!cleaned) { setError('Give your reminder a name.'); return; }
    const days = Number(interval);
    if (!Number.isInteger(days) || days < 1 || days > 3650) { setError('Choose a repeat interval between 1 and 3650 days.'); return; }
    if (!done && !parseDate(dueDate)) { setError('Use a valid date in YYYY-MM-DD format.'); return; }
    const edited = { ...draft, name: cleaned, intervalDays: days, dueDate };
    setError('');
    if (await onSave(done ? markDone(edited) : edited)) onClose();
  }
  return <Modal visible animationType="slide" onRequestClose={() => { if (!busy) onClose(); }}><SafeAreaView style={s.safe}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={s.container}>
      <View style={s.top}><Text style={s.eyebrow}>{item ? 'YOUR REMINDER' : 'SOMETHING TO REMEMBER'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close reminder" disabled={busy} onPress={onClose} style={s.close}><Icon name="close" /></Pressable></View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.scroll}>
        <View style={s.icon}><Icon name="list" size={30} color={c.blueDark} /></View>
        <Text accessibilityRole="header" style={s.title}>{item ? item.name : 'One less thing\nto remember.'}</Text>
        {item && <Text style={s.status}>{dueLabel(item)} · {formatDate(item.dueDate)}</Text>}
        <Text style={s.label}>NAME</Text><TextInput accessibilityLabel="Reminder name" value={name} onChangeText={setName} maxLength={60} style={s.input} placeholder="Water the plants" placeholderTextColor={c.muted} />
        <Text style={s.label}>REPEAT EVERY (DAYS)</Text><TextInput accessibilityLabel="Repeat interval in days" value={interval} onChangeText={setInterval} keyboardType="number-pad" maxLength={4} style={s.input} />
        <Text style={s.label}>NEXT DUE DATE</Text><TextInput accessibilityLabel="Next due date, YYYY-MM-DD" value={dueDate} onChangeText={setDueDate} maxLength={10} autoCorrect={false} autoCapitalize="none" placeholder="YYYY-MM-DD" style={s.input} />
        <Text style={s.note}>Marking this done starts the next interval from today.</Text>
        {item && <><Text style={s.label}>LAST COMPLETED</Text><Text style={s.body}>{item.lastCompletedAt ? formatDate(dateKey(new Date(item.lastCompletedAt))) : 'Not marked done yet'}</Text>
          {item.history.length > 0 && <><Text style={s.label}>RECENT COMPLETIONS</Text>{item.history.slice(0, 5).map((value, i) => <Text key={`${value}-${i}`} style={s.history}>{formatDate(dateKey(new Date(value)))}</Text>)}</>}
        </>}
      </ScrollView>
      <View style={s.footer}>{!!(error || saveError) && <Text accessibilityRole="alert" style={s.error}>{error || saveError}</Text>}
        {item && <Pressable accessibilityRole="button" disabled={busy} onPress={() => submit(true)} style={[s.button, busy && { opacity: 0.5 }]}>{busy ? <ActivityIndicator color={c.ink} /> : <><Icon name="check" size={20} /><Text style={s.buttonText}>Mark done today</Text></>}</Pressable>}
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => submit(false)} style={[item ? s.secondary : s.button, busy && { opacity: 0.5 }]}><Text style={s.buttonText}>{item ? 'Save changes' : 'Add reminder'}</Text></Pressable>
      </View>
    </View></KeyboardAvoidingView>
  </SafeAreaView></Modal>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.white }, container: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 28, paddingRight: 14, paddingTop: 8 }, close: { padding: 16 }, eyebrow: { fontFamily, fontSize: 10, letterSpacing: 1.6, color: c.muted, fontWeight: '600' }, scroll: { padding: 28, paddingTop: 12 }, icon: { width: 65, height: 65, borderRadius: 21, backgroundColor: c.pale, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }, title: { fontFamily, fontSize: 32, lineHeight: 39, fontWeight: '600', letterSpacing: -1, color: c.ink }, status: { fontFamily, color: c.blueDark, fontSize: 14, marginTop: 12 }, label: { fontFamily, fontSize: 10, letterSpacing: 1.3, fontWeight: '600', color: c.muted, marginTop: 25, marginBottom: 10 }, input: { fontFamily, fontSize: 16, color: c.ink, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 16 }, note: { fontFamily, color: c.muted, fontSize: 12, lineHeight: 19, marginTop: 14 }, body: { fontFamily, fontSize: 15, color: c.ink }, history: { fontFamily, fontSize: 13, color: c.muted, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border }, footer: { paddingHorizontal: 28, paddingTop: 12, paddingBottom: 10, borderTopWidth: 1, borderTopColor: c.border }, button: { backgroundColor: c.blue, borderRadius: 16, padding: 17, minHeight: 55, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }, buttonText: { fontFamily, fontSize: 15, fontWeight: '600', color: c.ink }, secondary: { padding: 17, alignItems: 'center', minHeight: 50 }, error: { fontFamily, fontSize: 13, color: c.error, marginBottom: 12 },
});
