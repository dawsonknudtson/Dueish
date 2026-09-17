import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { AppState, NativeModules, Platform } from 'react-native';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { ENTITLEMENT_ID, PlanId, plans } from './config';
import { SimulationSheet } from './SimulationSheet';

type SDK = typeof import('react-native-purchases').default;
type State = {
  loading: boolean; busy: boolean; isPro: boolean; error: string; simulated: boolean; resetSimulation?: () => void;
  packages: Partial<Record<PlanId, { product: { priceString: string } }>>;
  refresh: () => Promise<void>; purchase: (id: PlanId) => Promise<void>; restore: () => Promise<void>;
};
const Context = createContext<State | null>(null);
export function PurchasesProvider({ children }: { children: ReactNode }) {
  // Never allow a bundled environment variable to unlock a production build.
  if (__DEV__ && process.env.EXPO_PUBLIC_SIMULATE_PURCHASES === 'true') {
    return <SimulatedPurchasesProvider>{children}</SimulatedPurchasesProvider>;
  }
  return <NativePurchasesProvider>{children}</NativePurchasesProvider>;
}

function SimulatedPurchasesProvider({ children }: { children: ReactNode }) {
  const [isPro, setPro] = useState(false);
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState('');
  const packages = Object.fromEntries(plans.map(plan => [plan.id, { product: { priceString: plan.price } }]));
  return <Context.Provider value={{
    simulated: true, loading: false, busy: pending !== null, isPro, error, packages,
    refresh: async () => setError(''),
    purchase: async id => { setError(''); setPending(current => current ?? id); },
    restore: async () => setError(isPro ? '' : 'No simulated purchase in this session. Choose a plan to test a purchase.'),
    resetSimulation: () => { setPro(false); setError(''); setPending(null); },
  }}>
    {children}
    <SimulationSheet planId={pending} onCancel={() => setPending(null)} onConfirm={() => { setPending(null); setPro(true); }} />
  </Context.Provider>;
}

function NativePurchasesProvider({ children }: { children: ReactNode }) {
  const sdk = useRef<SDK | null>(null);
  const lock = useRef(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [isPro, setPro] = useState(false);
  const [error, setError] = useState('');
  const [packages, setPackages] = useState<Partial<Record<PlanId, PurchasesPackage>>>({});
  const accept = useCallback((info: CustomerInfo) => {
    const active = !!info.entitlements.active[ENTITLEMENT_ID];
    setPro(active);
    return active;
  }, []);
  const refresh = useCallback(async () => {
    if (lock.current) return;
    lock.current = true; setLoading(true); setError('');
    try {
      if (Platform.OS !== 'ios') {
        setError('Purchases are available in the Dueish iOS app.'); return;
      }
      // Match RevenueCat's own native-module detection. Expo environment labels
      // must not prevent a development client with RNPurchases from initializing.
      if (!NativeModules.RNPurchases) {
        setError(__DEV__
          ? 'This app does not include native purchases. Open the installed Dueish app instead of Expo Go, or rebuild with npm run ios.'
          : 'Purchases are unavailable in this version of the app. Please update Dueish.');
        return;
      }
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
      if (!apiKey || (!__DEV__ && apiKey.startsWith('test_'))) {
        setError('Purchases aren’t available yet. Please try again later.'); return;
      }
      if (!sdk.current) {
        const Purchases: SDK = require('react-native-purchases').default;
        if (!await Purchases.isConfigured()) Purchases.configure({ apiKey });
        sdk.current = Purchases;
      }
      accept(await sdk.current.getCustomerInfo());
      try {
        const current = (await sdk.current.getOfferings()).current;
        setPackages({ monthly: current?.monthly ?? undefined, annual: current?.annual ?? undefined, lifetime: current?.lifetime ?? undefined });
        if (!current?.monthly || !current?.annual || !current?.lifetime) setError('Some plans are unavailable right now. Please try again.');
      } catch {
        setPackages({}); setError('Plans couldn’t be loaded. Please try again.');
      }
    } catch { setPro(false); setPackages({}); setError('We couldn’t connect to the store. Check your connection and try again.'); }
    finally { lock.current = false; setLoading(false); }
  }, [accept]);

  useEffect(() => {
    void refresh();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); });
    return () => subscription.remove();
  }, [refresh]);
  useEffect(() => {
    const current = sdk.current;
    if (!current) return;
    current.addCustomerInfoUpdateListener(accept);
    return () => { current.removeCustomerInfoUpdateListener(accept); };
  }, [loading, accept]);

  const transact = async (id?: PlanId) => {
    if (lock.current || !sdk.current) return;
    if (id && !packages[id]) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const info = id ? (await sdk.current.purchasePackage(packages[id]!)).customerInfo : await sdk.current.restorePurchases();
      if (!accept(info)) setError(id ? 'Your purchase is still being confirmed. Try restoring purchases in a moment.' : 'No active Dueish purchase was found for this Apple account.');
    } catch (e) {
      if (!(typeof e === 'object' && e !== null && 'userCancelled' in e && e.userCancelled)) setError('The store couldn’t complete that request. Please try again.');
    } finally { lock.current = false; setBusy(false); }
  };
  return <Context.Provider value={{ simulated: false, loading, busy, isPro, error, packages, refresh, purchase: id => transact(id), restore: () => transact() }}>{children}</Context.Provider>;
}
export function usePurchases() {
  const value = useContext(Context);
  if (!value) throw new Error('usePurchases requires PurchasesProvider');
  return value;
}
