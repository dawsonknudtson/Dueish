import React from 'react';
import { act, create } from 'react-test-renderer';
import { addDays, createTracker, dateKey, daysUntil, dueLabel, markDone, parseDate } from '../src/features/trackers/model';
import { useTrackers } from '../src/features/trackers/useTrackers';
import { loadTrackers, saveTrackers } from '../src/db/trackers';

jest.mock('../src/db/trackers', () => ({ loadTrackers: jest.fn(), saveTrackers: jest.fn() }));
global.IS_REACT_ACT_ENVIRONMENT = true;
let state;
let tree;
const selected = ['Changing sheets', 'Watering plants'];
function Probe() { state = useTrackers(selected); return null; }
async function mount() { await act(async () => { tree = create(<Probe />); }); }
beforeEach(() => { jest.resetAllMocks(); loadTrackers.mockResolvedValue(null); saveTrackers.mockResolvedValue(undefined); });
afterEach(async () => { if (tree) await act(async () => tree.unmount()); });

test('creates exactly the selected onboarding items without inventing completion dates', async () => {
  await mount();
  expect(state.items.map(item => item.name)).toEqual(selected);
  expect(state.items.every(item => item.lastCompletedAt === null && item.history.length === 0)).toBe(true);
  expect(saveTrackers).toHaveBeenCalledTimes(1);
});
test('relaunch restores edited schedules instead of importing onboarding again', async () => {
  const existing = { ...createTracker('My renamed reminder'), intervalDays: 30, dueDate: '2026-10-16' };
  loadTrackers.mockResolvedValue([existing]);
  await mount();
  expect(state.items).toEqual([existing]);
  expect(saveTrackers).not.toHaveBeenCalled();
});
test('an existing empty list is not re-seeded', async () => {
  loadTrackers.mockResolvedValue([]);
  await mount();
  expect(state.items).toEqual([]);
  expect(saveTrackers).not.toHaveBeenCalled();
});
test('mark done saves history and moves next due date forward by the chosen interval', async () => {
  await mount();
  const now = new Date(2026, 8, 16, 12);
  const done = markDone({ ...state.items[0], intervalDays: 3 }, now);
  await act(async () => { expect(await state.update(done)).toBe(true); });
  expect(state.items[0].dueDate).toBe('2026-09-19');
  expect(state.items[0].history).toEqual([now.toISOString()]);
  expect(saveTrackers).toHaveBeenLastCalledWith(state.items);
});
test('failed saves retain the previous data and expose a retryable error', async () => {
  await mount();
  const original = state.items[0];
  saveTrackers.mockRejectedValueOnce(new Error('disk full'));
  await act(async () => { expect(await state.update({ ...original, name: 'Changed' })).toBe(false); });
  expect(state.items[0]).toEqual(original);
  expect(state.error).toContain('couldn’t be saved');
});
test('adding a custom item persists it alongside existing reminders', async () => {
  await mount();
  const added = createTracker('Air filter');
  await act(async () => { await state.update(added); });
  expect(state.items).toHaveLength(3);
  expect(saveTrackers).toHaveBeenLastCalledWith(expect.arrayContaining([added]));
});
test('due labels compare local calendar days regardless of time of day', () => {
  const now = new Date(2026, 8, 16, 23, 59);
  const item = createTracker('Sheets', now);
  expect(dueLabel({ ...item, dueDate: '2026-09-16' }, now)).toBe('Due today');
  expect(dueLabel({ ...item, dueDate: '2026-09-17' }, now)).toBe('Due tomorrow');
  expect(dueLabel({ ...item, dueDate: '2026-09-14' }, now)).toBe('2 days overdue');
});
test('calendar arithmetic crosses month and year boundaries', () => {
  expect(addDays(new Date(2026, 11, 29, 12), 7)).toBe('2027-01-05');
  expect(daysUntil('2026-03-09', new Date(2026, 2, 7, 12))).toBe(2);
  expect(dateKey(new Date(2026, 8, 16, 12))).toBe('2026-09-16');
});
test('invalid dates are rejected rather than silently rolling into another month', () => {
  expect(parseDate('2026-02-30')).toBeNull();
  expect(parseDate('2026-13-01')).toBeNull();
  expect(parseDate('2028-02-29')).not.toBeNull();
});
