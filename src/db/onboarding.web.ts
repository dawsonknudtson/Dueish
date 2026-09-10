import { Setup } from '../features/onboarding/model';
const key = 'dueish.onboarding.v1';
export async function loadSetup(): Promise<Setup | null> {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) as Setup : null;
}
export async function saveSetup(setup: Setup) { localStorage.setItem(key, JSON.stringify(setup)); }
