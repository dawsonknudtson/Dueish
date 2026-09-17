import Storage from 'expo-sqlite/kv-store';
import { Tracker } from '../features/trackers/model';
const key = 'dueish.trackers.v1';
export async function loadTrackers(): Promise<Tracker[] | null> {
  const saved = await Storage.getItem(key);
  return saved === null ? null : JSON.parse(saved) as Tracker[];
}
export async function saveTrackers(items: Tracker[]) { await Storage.setItem(key, JSON.stringify(items)); }
