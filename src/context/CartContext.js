import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { cart as cartApi } from '../api/endpoints';
import { useUserAuth } from './UserAuthContext';
import { useApp } from './AppContext';

const CartContext = createContext(null);

const GUEST_KEY = 'bn_guest_cart';

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function writeGuestCart(items) {
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(items)); } catch {}
}
function clearGuestCart() {
  try { localStorage.removeItem(GUEST_KEY); } catch {}
}

function sameVariant(a, b) {
  return (
    a.productId === b.productId &&
    a.storeId === b.storeId &&
    (a.color || '') === (b.color || '') &&
    (a.size || '') === (b.size || '') &&
    (a.customDescription || '') === (b.customDescription || '')
  );
}

// Build a hydrated view of a guest cart by joining against products/stores
function buildGuestView(items, products, stores) {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const out = items.map((it, idx) => {
    const product = productMap.get(it.productId);
    const store = storeMap.get(it.storeId);
    const inv = product?.storeInventory?.find((s) => s.storeId === it.storeId);
    const unitPrice = inv?.price || 0;
    const available = inv?.stock ?? 0;
    return {
      id: it._id || `guest-${idx}`,
      productId: it.productId,
      productName: product?.name || 'Unavailable',
      productImage: product?.image || '',
      storeId: it.storeId,
      storeName: store?.name || it.storeId,
      quantity: it.quantity,
      color: it.color || '',
      size: it.size || '',
      customDescription: it.customDescription || '',
      unitPrice,
      lineTotal: unitPrice * it.quantity,
      available,
      inStock: available >= it.quantity,
      addedAt: it.addedAt || new Date().toISOString(),
    };
  });
  const subtotal = out.reduce((s, i) => s + i.lineTotal, 0);
  const count = out.reduce((s, i) => s + i.quantity, 0);
  return { items: out, subtotal, count };
}

export function CartProvider({ children }) {
  const { isAuthenticated, bootstrapping } = useUserAuth();
  const { productsRef, storesRef } = useApp();
  const [serverCart, setServerCart] = useState({ items: [], subtotal: 0, count: 0 });
  const [guestItems, setGuestItems] = useState(() => readGuestCart());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const guestItemsRef = useRef(guestItems);
  useEffect(() => { guestItemsRef.current = guestItems; }, [guestItems]);

  // Load server cart on login, merging any guest items first
  useEffect(() => {
    if (bootstrapping) return;
    let cancelled = false;

    async function syncToServer() {
      setLoading(true);
      setError(null);
      try {
        const pendingGuest = guestItemsRef.current;
        if (pendingGuest.length > 0) {
          const view = await cartApi.merge(
            pendingGuest.map((g) => ({
              productId: g.productId,
              storeId: g.storeId,
              quantity: g.quantity,
              color: g.color || '',
              size: g.size || '',
              customDescription: g.customDescription || '',
            }))
          );
          if (cancelled) return;
          setServerCart(view);
          clearGuestCart();
          setGuestItems([]);
        } else {
          const view = await cartApi.get();
          if (cancelled) return;
          setServerCart(view);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (isAuthenticated) {
      syncToServer();
    } else {
      setServerCart({ items: [], subtotal: 0, count: 0 });
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [isAuthenticated, bootstrapping]);

  // Persist guest cart whenever it changes
  useEffect(() => {
    if (!isAuthenticated) writeGuestCart(guestItems);
  }, [guestItems, isAuthenticated]);

  // Build a unified view
  const view = useMemo(() => {
    if (isAuthenticated) return serverCart;
    const products = productsRef?.current || [];
    const stores = storesRef?.current || [];
    return buildGuestView(guestItems, products, stores);
  }, [isAuthenticated, serverCart, guestItems, productsRef, storesRef]);

  const addItem = useCallback(
    async (item) => {
      setError(null);
      const payload = {
        productId: item.productId,
        storeId: item.storeId,
        quantity: Math.max(1, Number(item.quantity) || 1),
        color: item.color || '',
        size: item.size || '',
        customDescription: item.customDescription || '',
      };
      if (isAuthenticated) {
        const v = await cartApi.addItem(payload);
        setServerCart(v);
        return v;
      }
      setGuestItems((prev) => {
        const existing = prev.find((p) => sameVariant(p, payload));
        if (existing) {
          return prev.map((p) =>
            sameVariant(p, payload)
              ? { ...p, quantity: Math.min(99, p.quantity + payload.quantity) }
              : p
          );
        }
        return [...prev, { ...payload, addedAt: new Date().toISOString() }];
      });
      return null;
    },
    [isAuthenticated]
  );

  const updateItem = useCallback(
    async (id, patch) => {
      setError(null);
      if (isAuthenticated) {
        const v = await cartApi.updateItem(id, patch);
        setServerCart(v);
        return v;
      }
      setGuestItems((prev) =>
        prev.map((p, idx) => {
          const itemId = p._id || `guest-${idx}`;
          if (itemId !== id) return p;
          return {
            ...p,
            quantity: patch.quantity !== undefined ? Math.max(1, Number(patch.quantity)) : p.quantity,
            color: patch.color !== undefined ? patch.color : p.color,
            size: patch.size !== undefined ? patch.size : p.size,
            customDescription:
              patch.customDescription !== undefined ? patch.customDescription : p.customDescription,
          };
        })
      );
      return null;
    },
    [isAuthenticated]
  );

  const removeItem = useCallback(
    async (id) => {
      setError(null);
      if (isAuthenticated) {
        const v = await cartApi.removeItem(id);
        setServerCart(v);
        return v;
      }
      setGuestItems((prev) => prev.filter((_p, idx) => `guest-${idx}` !== id && _p._id !== id));
      return null;
    },
    [isAuthenticated]
  );

  const clearCart = useCallback(async () => {
    setError(null);
    if (isAuthenticated) {
      const v = await cartApi.clear();
      setServerCart(v);
      return v;
    }
    setGuestItems([]);
    return null;
  }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    const v = await cartApi.get();
    setServerCart(v);
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        items: view.items,
        subtotal: view.subtotal,
        count: view.count,
        loading,
        error,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
