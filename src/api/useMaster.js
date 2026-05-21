import { useCallback, useEffect, useState } from 'react';
import { master as masterApi } from './endpoints';

/**
 * Shared access to centralised Master lookup data (categories, statuses, types…).
 *
 * One network request loads every active group; the result is cached at module
 * scope and shared across all components. `invalidateMaster()` (called by the
 * admin Master section after edits) refetches and pushes the new data to every
 * mounted consumer, so dropdowns stay in sync without a page reload.
 */

let cache = null;          // { [group]: [items] }
let inflight = null;
const subscribers = new Set();

function notify() {
  subscribers.forEach((fn) => fn(cache));
}

function fetchAll() {
  if (inflight) return inflight;
  inflight = masterApi
    .grouped()
    .then((data) => {
      cache = data || {};
      inflight = null;
      notify();
      return cache;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

export function invalidateMaster() {
  cache = null;
  return fetchAll();
}

export function useMaster() {
  const [data, setData] = useState(cache || {});
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let mounted = true;
    const sub = (d) => { if (mounted) setData(d || {}); };
    subscribers.add(sub);

    if (cache) {
      setData(cache);
      setLoading(false);
    } else {
      fetchAll()
        .then((d) => { if (mounted) { setData(d); setLoading(false); } })
        .catch(() => { if (mounted) setLoading(false); });
    }
    return () => { mounted = false; subscribers.delete(sub); };
  }, []);

  // [{ value, label }] for active items, ready to drop into a <select>.
  const options = useCallback(
    (group, { includeInactive = false } = {}) =>
      (data[group] || [])
        .filter((i) => includeInactive || i.active !== false)
        .map((i) => ({ value: i.slug, label: i.label })),
    [data]
  );

  const items = useCallback((group) => data[group] || [], [data]);

  const labelFor = useCallback(
    (group, value) => {
      const found = (data[group] || []).find((i) => i.slug === value);
      return found ? found.label : value;
    },
    [data]
  );

  const colorFor = useCallback(
    (group, value) => {
      const found = (data[group] || []).find((i) => i.slug === value);
      return found ? found.color : '';
    },
    [data]
  );

  const defaultValue = useCallback(
    (group) => {
      const list = data[group] || [];
      const def = list.find((i) => i.isDefault) || list[0];
      return def ? def.slug : '';
    },
    [data]
  );

  return { master: data, loading, options, items, labelFor, colorFor, defaultValue, refresh: invalidateMaster };
}
