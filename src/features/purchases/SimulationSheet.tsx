import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors as c, fontFamily } from '../../constants/theme';
import { plans, PlanId } from './config';

export function SimulationSheet({ planId, onCancel, onConfirm }: {
  planId: PlanId | null; onCancel: () => void; onConfirm: () => void;
}) {
  const plan = plans.find(value => value.id === planId);
  return <Modal visible={!!plan} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={s.backdrop}><View style={s.card} accessibilityViewIsModal>
      <Text accessibilityRole="header" style={s.title}>Simulate a purchase</Text>
      <Text style={s.plan}>{plan?.title} · {plan?.price}{plan?.id === 'lifetime' ? ' one time' : ` / ${plan?.period}`}</Text>
      <Text style={s.body}>This is a local development preview. No Apple account is needed, no payment will be taken, and no subscription will be created.</Text>
      <Pressable accessibilityRole="button" onPress={onConfirm} style={s.button}><Text style={s.buttonText}>Confirm simulated purchase</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={onCancel} style={s.cancel}><Text style={s.buttonText}>Cancel</Text></Pressable>
    </View></View>
  </Modal>;
}
const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#172C4366', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400, backgroundColor: c.white, borderRadius: 24, padding: 24 },
  title: { fontFamily, color: c.ink, fontSize: 24, fontWeight: '600' },
  plan: { fontFamily, color: c.blueDark, fontSize: 17, marginTop: 16 },
  body: { fontFamily, color: c.muted, fontSize: 14, lineHeight: 22, marginVertical: 20 },
  button: { backgroundColor: c.blue, borderRadius: 14, padding: 16, alignItems: 'center' },
  buttonText: { fontFamily, color: c.ink, fontSize: 14, fontWeight: '600' },
  cancel: { minHeight: 48, padding: 16, alignItems: 'center' },
});
