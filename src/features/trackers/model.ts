export type Tracker = {
  id: string; name: string; createdAt: string; lastCompletedAt: string | null;
  intervalDays: number; dueDate: string; history: string[];
};
export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return dateKey(date) === value ? date : null;
}
export function addDays(date: Date, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return dateKey(next);
}
export function daysUntil(dueDate: string, now = new Date()): number {
  const due = parseDate(dueDate)!;
  // Compare civil dates rather than elapsed hours across daylight saving changes.
  return Math.round((Date.UTC(due.getFullYear(), due.getMonth(), due.getDate()) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}
export function dueLabel(item: Tracker, now = new Date()): string {
  const days = daysUntil(item.dueDate, now);
  if (days < 0) return `${-days} ${days === -1 ? 'day' : 'days'} overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}
export function formatDate(value: string): string {
  return parseDate(value)?.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) ?? value;
}
export function createTracker(name: string, now = new Date()): Tracker {
  return { id: `${now.getTime()}-${Math.random().toString(36).slice(2, 11)}`, name: name.trim(), createdAt: now.toISOString(), lastCompletedAt: null, intervalDays: 7, dueDate: addDays(now, 7), history: [] };
}
export function markDone(item: Tracker, now = new Date()): Tracker {
  return { ...item, lastCompletedAt: now.toISOString(), dueDate: addDays(now, item.intervalDays), history: [now.toISOString(), ...item.history] };
}
