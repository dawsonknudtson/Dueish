import { Setup } from './model';
export async function configureReminder(days: number): Promise<Setup['notificationStatus']> {
  return days === 0 ? 'off' : 'unavailable';
}
