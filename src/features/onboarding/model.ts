export const suggestions = ['Changing sheets', 'Watering plants', 'Replacing my toothbrush', 'Changing the air filter', 'Car maintenance'];
export const frequencies = [
  { days: 1, title: 'Every day', detail: 'A little daily check-in' },
  { days: 3, title: 'Every few days', detail: 'A gentle nudge every 3 days' },
  { days: 7, title: 'Once a week', detail: 'A little less often', badge: 'Popular' },
  { days: 0, title: 'Only when I open the app', detail: 'No notifications. No pressure.' },
] as const;
export type Setup = { items: string[]; selected: string[]; frequency: number; completed: boolean; notificationStatus: 'off' | 'enabled' | 'denied' | 'unavailable' };
export const initialSetup: Setup = { items: [], selected: [], frequency: 7, completed: false, notificationStatus: 'off' };
export function normalizeItem(value: string) { return value.trim().replace(/\s+/g, ' '); }
export function containsItem(items: string[], item: string) { return items.some(value => value.toLocaleLowerCase() === item.toLocaleLowerCase()); }
