import { useCallback, useEffect, useRef, useState } from 'react';
import { loadTrackers, saveTrackers } from '../../db/trackers';
import { createTracker, Tracker } from './model';

export function useTrackers(selected: string[]) {
  const [items, setItems] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const current = useRef<Tracker[]>([]);
  const lock = useRef(false);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const saved = await loadTrackers();
      const next = saved ?? [...new Set(selected)].map(name => createTracker(name));
      if (saved === null) await saveTrackers(next);
      current.current = next; setItems(next);
    } catch { setError('Your reminders couldn’t be loaded. Please try again.'); }
    finally { setLoading(false); }
  }, [selected]);
  useEffect(() => { void load(); }, [load]);
  const update = async (item: Tracker) => {
    if (lock.current || loading) return false;
    lock.current = true; setBusy(true); setError('');
    try {
      const exists = current.current.some(value => value.id === item.id);
      const next = exists ? current.current.map(value => value.id === item.id ? item : value) : [...current.current, item];
      await saveTrackers(next);
      current.current = next; setItems(next);
      return true;
    } catch { setError('Your changes couldn’t be saved. Please try again.'); return false; }
    finally { lock.current = false; setBusy(false); }
  };
  return { items, loading, busy, error, load, update };
}
