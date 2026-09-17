import React from 'react';
import { SimulationSheet } from '../src/features/purchases/SimulationSheet';
import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';
import { act, create } from 'react-test-renderer';
import { PurchasesProvider, usePurchases } from '../src/features/purchases/PurchasesProvider';
import EntryScreen from '../app/index';
import { loadSetup } from '../src/db/onboarding';
import Purchases from 'react-native-purchases';

global.IS_REACT_ACT_ENVIRONMENT = true;
let mockState;
let mockComplete;
let mockCustomerListener;
const completedSetup = { completed: true, completionVersion: 1, items: ['Sheets'], selected: ['Sheets'], frequency: 7 };
const inactive = { entitlements: { active: {} } };
const active = { entitlements: { active: { dueish_pro: { isActive: true } } } };
const offering = { current: { monthly: { identifier: 'monthly' }, annual: { identifier: 'annual' }, lifetime: { identifier: 'lifetime' } } };

jest.mock('../src/features/purchases/SimulationSheet', () => ({ SimulationSheet: jest.fn(() => null) }));
jest.mock('expo-constants', () => ({ __esModule: true, default: { executionEnvironment: 'standalone' }, ExecutionEnvironment: { StoreClient: 'storeClient' } }));
jest.mock('react-native-purchases', () => ({ __esModule: true, default: {
  isConfigured: jest.fn(), configure: jest.fn(), getCustomerInfo: jest.fn(), getOfferings: jest.fn(), purchasePackage: jest.fn(), restorePurchases: jest.fn(),
  addCustomerInfoUpdateListener: jest.fn(fn => { mockCustomerListener = fn; }), removeCustomerInfoUpdateListener: jest.fn(),
} }));
jest.mock('../src/db/onboarding', () => ({ loadSetup: jest.fn() }));
jest.mock('../src/features/onboarding/OnboardingScreen', () => ({ __esModule: true, default: props => { mockComplete = props.onComplete; return 'onboarding'; } }));
jest.mock('../src/features/purchases/PaywallScreen', () => ({ __esModule: true, default: () => 'paywall' }));
jest.mock('../src/features/trackers/HomeScreen', () => ({ __esModule: true, default: () => 'home' }));
function Probe() { mockState = usePurchases(); return <EntryScreen />; }
let tree;
async function mount() { await act(async () => { tree = create(<PurchasesProvider><Probe /></PurchasesProvider>); }); }
beforeEach(() => {
  delete process.env.EXPO_PUBLIC_SIMULATE_PURCHASES;
  NativeModules.RNPurchases = {};
  Constants.executionEnvironment = 'standalone';
  jest.clearAllMocks(); process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = 'appl_unit_test';
  Purchases.isConfigured.mockResolvedValue(false); Purchases.getCustomerInfo.mockResolvedValue(inactive); Purchases.getOfferings.mockResolvedValue(offering);
  Purchases.purchasePackage.mockResolvedValue({ customerInfo: active }); Purchases.restorePurchases.mockResolvedValue(active);
  loadSetup.mockResolvedValue(completedSetup);
});
afterEach(async () => { if (tree) await act(async () => tree.unmount()); });
test('saved onboarding cannot bypass the paywall on relaunch', async () => { await mount(); expect(tree.toJSON()).toBe('paywall'); expect(mockState.isPro).toBe(false); });
test('finishing onboarding immediately presents the paywall', async () => { loadSetup.mockResolvedValue(null); await mount(); expect(tree.toJSON()).toBe('onboarding'); await act(async () => mockComplete(completedSetup)); expect(tree.toJSON()).toBe('paywall'); });
test.each(['monthly', 'annual', 'lifetime'])('purchases the selected %s package and unlocks with entitlement', async id => { await mount(); await act(async () => mockState.purchase(id)); expect(Purchases.purchasePackage).toHaveBeenCalledWith(offering.current[id]); expect(tree.toJSON()).toBe('home'); });
test('canceling purchase stays locked without an error', async () => { Purchases.purchasePackage.mockRejectedValue({ userCancelled: true }); await mount(); await act(async () => mockState.purchase('annual')); expect(tree.toJSON()).toBe('paywall'); expect(mockState.error).toBe(''); });
test('a transaction without the entitlement does not unlock', async () => { Purchases.purchasePackage.mockResolvedValue({ customerInfo: inactive }); await mount(); await act(async () => mockState.purchase('annual')); expect(tree.toJSON()).toBe('paywall'); expect(mockState.error).toContain('confirmed'); });
test('restoring an active purchase unlocks, then revoked entitlement locks again', async () => { await mount(); await act(async () => mockState.restore()); expect(tree.toJSON()).toBe('home'); await act(async () => mockCustomerListener(inactive)); expect(tree.toJSON()).toBe('paywall'); });
test('restore without a purchase stays locked', async () => { Purchases.restorePurchases.mockResolvedValue(inactive); await mount(); await act(async () => mockState.restore()); expect(tree.toJSON()).toBe('paywall'); expect(mockState.error).toContain('No active'); });
test('missing API key never configures or unlocks', async () => { delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY; await mount(); expect(Purchases.configure).not.toHaveBeenCalled(); expect(tree.toJSON()).toBe('paywall'); });
test('missing products cannot initiate a purchase', async () => { Purchases.getOfferings.mockResolvedValue({ current: null }); await mount(); await act(async () => mockState.purchase('annual')); expect(Purchases.purchasePackage).not.toHaveBeenCalled(); expect(tree.toJSON()).toBe('paywall'); });
test('offering failure does not remove an existing paid entitlement', async () => { Purchases.getCustomerInfo.mockResolvedValue(active); Purchases.getOfferings.mockRejectedValue(new Error('offline')); await mount(); expect(tree.toJSON()).toBe('home'); });

test('a new install starts onboarding even with an existing paid entitlement', async () => {
  loadSetup.mockResolvedValue(null);
  Purchases.getCustomerInfo.mockResolvedValue(active);
  await mount();
  expect(tree.toJSON()).toBe('onboarding');
});
test('legacy completion flags reopen onboarding', async () => {
  loadSetup.mockResolvedValue({ ...completedSetup, completionVersion: undefined });
  await mount();
  expect(tree.toJSON()).toBe('onboarding');
});
test('incomplete answers cannot send a first-time user to payment', async () => {
  loadSetup.mockResolvedValue({ ...completedSetup, selected: [] });
  await mount();
  expect(tree.toJSON()).toBe('onboarding');
});

test('a native development client can purchase even with a storeClient environment label', async () => {
  Constants.executionEnvironment = 'storeClient';
  await mount();
  expect(Purchases.configure).toHaveBeenCalled();
  expect(mockState.packages.annual).toEqual(offering.current.annual);
  await act(async () => mockState.purchase('annual'));
  expect(tree.toJSON()).toBe('home');
});
test('missing native purchases stays locked and explains how to open the correct build', async () => {
  delete NativeModules.RNPurchases;
  await mount();
  expect(Purchases.configure).not.toHaveBeenCalled();
  expect(mockState.error).toContain('Open the installed Dueish app');
  expect(tree.toJSON()).toBe('paywall');
});
test('web does not initialize native iOS purchases', async () => {
  const originalOS = Platform.OS;
  Platform.OS = 'web';
  try {
    await mount();
    expect(Purchases.configure).not.toHaveBeenCalled();
    expect(tree.toJSON()).toBe('paywall');
  } finally { Platform.OS = originalOS; }
});

test.each(['monthly', 'annual', 'lifetime'])('simulates %s without Apple, RevenueCat, or a native module', async id => {
  process.env.EXPO_PUBLIC_SIMULATE_PURCHASES = 'true';
  delete NativeModules.RNPurchases;
  delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  await mount();
  expect(mockState.simulated).toBe(true);
  await act(async () => mockState.purchase(id));
  expect(mockState.isPro).toBe(false);
  expect(tree.root.findByType(SimulationSheet).props.planId).toBe(id);
  await act(async () => tree.root.findByType(SimulationSheet).props.onConfirm());
  expect(mockState.isPro).toBe(true);
  expect(tree.toJSON()).toBe('home');
  expect(Purchases.configure).not.toHaveBeenCalled();
  expect(Purchases.purchasePackage).not.toHaveBeenCalled();
  await act(async () => mockState.resetSimulation());
  expect(mockState.isPro).toBe(false);
});
test('canceling a simulated purchase keeps the paywall locked', async () => {
  process.env.EXPO_PUBLIC_SIMULATE_PURCHASES = 'true';
  await mount();
  await act(async () => mockState.purchase('annual'));
  await act(async () => tree.root.findByType(SimulationSheet).props.onCancel());
  expect(mockState.isPro).toBe(false);
  expect(mockState.busy).toBe(false);
});
test('simulation never enables in a production build, even if the flag is set', async () => {
  process.env.EXPO_PUBLIC_SIMULATE_PURCHASES = 'true';
  const previous = global.__DEV__;
  global.__DEV__ = false;
  try {
    await mount();
    expect(mockState.simulated).toBe(false);
    expect(mockState.isPro).toBe(false);
    expect(Purchases.configure).toHaveBeenCalled();
  } finally { global.__DEV__ = previous; }
});
