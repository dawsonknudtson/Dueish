import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { colors as c, fontFamily } from '../../constants/theme';
import { containsItem, frequencies, Setup, suggestions } from './model';

export function ForgetStep({ setup, input, setInput, add, remove }: { setup: Setup; input: string; setInput: (value: string) => void; add: (value: string) => void; remove: (value: string) => void }) {
  return <>
    <View style={s.inputRow}>
      <TextInput accessibilityLabel="Something you forget" placeholder="Something I always forget…" placeholderTextColor="#8492A0" value={input} onChangeText={setInput} onSubmitEditing={() => add(input)} returnKeyType="done" maxLength={60} style={s.input} />
      <Pressable accessibilityRole="button" accessibilityLabel="Add item" disabled={!input.trim()} onPress={() => add(input)} style={({ pressed }) => [s.add, !input.trim() && { opacity: 0.4 }, pressed && { opacity: 0.6 }]}><Icon name="plus" /></Pressable>
    </View>
    {setup.items.length > 0 && <View style={s.entered}>{setup.items.map(item => <View key={item} style={s.enteredRow}><Icon name="check" size={18} color={c.blueDark} /><Text style={[s.itemText, { flex: 1 }]}>{item}</Text><Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item}`} onPress={() => remove(item)} style={s.remove}><Icon name="close" size={17} color={c.muted} /></Pressable></View>)}</View>}
    <Text style={s.label}>A FEW IDEAS TO GET YOU STARTED</Text>
    <View style={s.chips}>{suggestions.filter(item => !containsItem(setup.items, item)).map(item => <Pressable key={item} accessibilityRole="button" onPress={() => add(item)} style={({ pressed }) => [s.chip, pressed && { backgroundColor: c.pale }]}><Icon name="plus" size={15} color={c.muted} /><Text style={s.chipText}>{item}</Text></Pressable>)}</View>
    <View style={s.note}><View style={s.noteIcon}><Icon name="clock" size={20} color={c.blueDark} /></View><Text style={s.noteText}>The little things take up space.{'\n'}Let’s make a little room.</Text></View>
  </>;
}

export function TrackStep({ setup, toggle }: { setup: Setup; toggle: (item: string) => void }) {
  return <><View style={s.selectionHeader}><Text style={s.labelInline}>YOUR LITTLE THINGS</Text><Text style={s.count}>{setup.selected.length} selected</Text></View><View style={s.options}>{setup.items.map(item => {
    const checked = setup.selected.includes(item);
    return <Pressable key={item} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={item} onPress={() => toggle(item)} style={({ pressed }) => [s.option, checked && s.selected, pressed && { opacity: 0.7 }]}><View style={[s.smallIcon, checked && { backgroundColor: '#DEEEFC' }]}><Icon name="list" color={checked ? c.blueDark : c.muted} /></View><Text style={[s.itemText, { flex: 1 }]}>{item}</Text><View style={[s.checkbox, checked && s.checked]}>{checked && <Icon name="check" size={16} color={c.blueDark} />}</View></Pressable>;
  })}</View><Text style={s.hint}>Start with what matters to you. You can always add more later.</Text></>;
}

export function ReminderStep({ setup, choose }: { setup: Setup; choose: (days: number) => void }) {
  return <><View style={s.options}>{frequencies.map(option => {
    const checked = setup.frequency === option.days;
    return <Pressable key={option.days} accessibilityRole="radio" accessibilityState={{ checked }} accessibilityLabel={`${option.title}. ${option.detail}`} onPress={() => choose(option.days)} style={({ pressed }) => [s.option, s.frequency, checked && s.selected, pressed && { opacity: 0.7 }]}><View style={{ flex: 1 }}><View style={s.titleRow}><Text style={s.itemText}>{option.title}</Text>{'badge' in option && <Text style={s.badge}>{option.badge}</Text>}</View><Text style={s.detail}>{option.detail}</Text></View><View style={[s.radio, checked && { borderColor: c.blueDark }]}>{checked && <View style={s.dot} />}</View></Pressable>;
  })}</View><View style={s.privacy}><Icon name="bell" size={16} color={c.muted} /><Text style={s.privacyText}>Just a gentle check-in. Always on your terms.</Text></View></>;
}

const s = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#CFDEEB', borderRadius: 18, padding: 7, marginTop: 4 },
  input: { flex: 1, fontFamily, fontSize: 16, color: c.ink, paddingHorizontal: 12, paddingVertical: 13, minWidth: 0 },
  add: { width: 44, height: 44, borderRadius: 13, backgroundColor: c.blue, alignItems: 'center', justifyContent: 'center' },
  entered: { marginTop: 14, gap: 3 }, enteredRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 10 }, remove: { padding: 14 },
  label: { fontFamily, fontSize: 10, fontWeight: '600', letterSpacing: 1.5, color: c.muted, marginTop: 30, marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, chip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 12, borderWidth: 1, borderColor: c.border, borderRadius: 12 }, chipText: { fontFamily, fontSize: 13, color: '#586B7D' },
  note: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 32, padding: 18, backgroundColor: '#F6F9FC', borderRadius: 17 }, noteIcon: { width: 38, height: 38, backgroundColor: '#E9F3FC', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, noteText: { fontFamily, fontSize: 13, lineHeight: 21, color: c.muted, flex: 1 },
  selectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }, labelInline: { fontFamily, fontSize: 10, fontWeight: '600', letterSpacing: 1.5, color: c.muted }, count: { fontFamily, fontSize: 12, color: c.blueDark },
  options: { gap: 11 }, option: { flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1.5, borderColor: c.border, padding: 16, borderRadius: 18, minHeight: 77 }, selected: { borderColor: '#B3D6F3', backgroundColor: c.pale }, smallIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F6F8', alignItems: 'center', justifyContent: 'center' },
  itemText: { fontFamily, fontSize: 15, fontWeight: '500', color: c.ink, lineHeight: 21 }, checkbox: { width: 23, height: 23, borderRadius: 7, borderWidth: 1.5, borderColor: '#CED9E2', alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: c.blue, borderColor: c.blue }, hint: { fontFamily, fontSize: 13, lineHeight: 21, textAlign: 'center', color: c.muted, paddingHorizontal: 22, marginTop: 25 },
  frequency: { minHeight: 83, paddingHorizontal: 18 }, titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 9 }, badge: { fontFamily, color: c.blueDark, fontSize: 10, fontWeight: '500', paddingVertical: 3, paddingHorizontal: 7, backgroundColor: '#DAEBFA', borderRadius: 5 }, detail: { fontFamily, fontSize: 12, color: c.muted, marginTop: 5 }, radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#CBD6E0', alignItems: 'center', justifyContent: 'center' }, dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.blueDark }, privacy: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 24 }, privacyText: { fontFamily, fontSize: 11, color: c.muted, flexShrink: 1 },
});
