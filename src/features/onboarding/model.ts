export const suggestions = ['Changing sheets', 'Watering plants', 'Replacing my toothbrush', 'Changing the air filter', 'Car maintenance'];
export const frequencies = [
  { days: 1, title: 'Every day', detail: 'A little daily check-in' },
  { days: 3, title: 'Every few days', detail: 'A gentle nudge every 3 days' },
  { days: 7, title: 'Once a week', detail: 'A little less often', badge: 'Popular' },
  { days: 0, title: 'Only when I open the app', detail: 'No notifications. No pressure.' },
] as const;
export type Setup = { items: string[]; selected: string[]; frequency: number; completed: boolean; completionVersion?: number; remindersConfigured?: boolean; notificationStatus: 'off' | 'enabled' | 'denied' | 'unavailable' };
export const initialSetup: Setup = { items: [], selected: [], frequency: 7, completed: false, notificationStatus: 'off' };
export function normalizeItem(value: string) { return value.trim().replace(/\s+/g, ' '); }
export function containsItem(items: string[], item: string) { return items.some(value => value.toLocaleLowerCase() === item.toLocaleLowerCase()); }

// Older builds used `completed` for a different endpoint. Preserve their answers
// as a draft, but require the current three-question flow before the paywall.
export const ONBOARDING_VERSION = 1;
export function hasCompletedOnboarding(setup: Setup | null): boolean {
  return setup?.completed === true && setup.completionVersion === ONBOARDING_VERSION
    && Array.isArray(setup.items) && setup.items.length > 0
    && Array.isArray(setup.selected) && setup.selected.length > 0
    && setup.selected.every(item => setup.items.includes(item))
    && frequencies.some(option => option.days === setup.frequency);
}
