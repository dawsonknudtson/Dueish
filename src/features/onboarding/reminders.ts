import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Setup } from './model';

const identifier = 'dueish-onboarding-check-in';
export async function configureReminder(days: number): Promise<Setup['notificationStatus']> {
  if (days === 0) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    return 'off';
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('check-ins', { name: 'Gentle check-ins', importance: Notifications.AndroidImportance.DEFAULT });
  }
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && permission.canAskAgain) permission = await Notifications.requestPermissionsAsync();
  const allowed = permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!allowed) return 'denied';
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title: 'A little check-in from Dueish', body: 'Take a moment for the little things you wanted to remember.', sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: days * 86400, repeats: true, channelId: 'check-ins' },
  });
  return 'enabled';
}
