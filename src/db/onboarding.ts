import Storage from 'expo-sqlite/kv-store';
import { Setup } from '../features/onboarding/model';
const key = 'dueish.onboarding.v1';
export async function loadSetup(): Promise<Setup | null> {
  const value = await Storage.getItem(key);
  return value ? JSON.parse(value) as Setup : null;
}
export async function saveSetup(setup: Setup) { await Storage.setItem(key, JSON.stringify(setup)); }
