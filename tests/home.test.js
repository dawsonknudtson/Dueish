import React from 'react';
import { act, create } from 'react-test-renderer';
import HomeScreen from '../src/features/trackers/HomeScreen';
import { TrackerDetails } from '../src/features/trackers/TrackerDetails';
import { useTrackers } from '../src/features/trackers/useTrackers';
import { createTracker } from '../src/features/trackers/model';

jest.mock('../src/features/trackers/useTrackers', () => ({ useTrackers: jest.fn() }));
jest.mock('../src/features/trackers/TrackerDetails', () => ({ TrackerDetails: jest.fn(() => null) }));
jest.mock('../src/features/purchases/PurchasesProvider', () => ({ usePurchases: () => ({ simulated: true }) }));
jest.mock('../src/features/onboarding/reminders', () => ({ configureReminder: jest.fn() }));
jest.mock('../src/db/onboarding', () => ({ loadSetup: jest.fn(), saveSetup: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: require('react-native').View }));
global.IS_REACT_ACT_ENVIRONMENT = true;
let tree;
const item = createTracker('Watering plants');
const update = jest.fn();
beforeEach(() => { jest.clearAllMocks(); useTrackers.mockReturnValue({ items: [item], loading: false, busy: false, error: '', load: jest.fn(), update }); });
afterEach(async () => { if (tree) await act(async () => tree.unmount()); });
test('tapping a saved reminder opens that item without marking it done', async () => {
  await act(async () => { tree = create(<HomeScreen setup={{ selected: ['Watering plants'] }} />); });
  const row = tree.root.findAll(node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel?.startsWith('Watering plants,'))[0];
  await act(async () => row.props.onPress());
  expect(tree.root.findByType(TrackerDetails).props.item).toEqual(item);
  expect(update).not.toHaveBeenCalled();
});
test('add opens a new reminder editor', async () => {
  await act(async () => { tree = create(<HomeScreen setup={{ selected: [] }} />); });
  const add = tree.root.findAll(node => node.props.accessibilityLabel === 'Add reminder')[0];
  await act(async () => add.props.onPress());
  expect(tree.root.findByType(TrackerDetails).props.item).toBeNull();
});
