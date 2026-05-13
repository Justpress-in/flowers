import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useCallback,
} from 'react';
import {
  products as productsApi,
  stores as storesApi,
  orders as ordersApi,
  events as eventsApi,
  banners as bannersApi,
} from '../api/endpoints';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const initialState = {
  products: [],
  stores: [],
  banners: [],
  orders: [],
  events: [],

  loading: {
    products: true,
    stores: true,
    banners: true,
    orders: false,
    events: true,
  },
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, [action.key]: action.value } };
    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: { ...state.loading, products: false } };
    case 'ADD_PRODUCT':
      return { ...state, products: [action.payload, ...state.products] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };

    case 'SET_STORES':
      return { ...state, stores: action.payload, loading: { ...state.loading, stores: false } };
    case 'ADD_STORE':
      return { ...state, stores: [...state.stores, action.payload] };
    case 'UPDATE_STORE':
      return {
        ...state,
        stores: state.stores.map((s) => (s.id === action.payload.id ? action.payload : s)),
      };
    case 'DELETE_STORE':
      return { ...state, stores: state.stores.filter((s) => s.id !== action.payload) };

    case 'SET_BANNERS':
      return { ...state, banners: action.payload, loading: { ...state.loading, banners: false } };

    case 'SET_ORDERS':
      return { ...state, orders: action.payload, loading: { ...state.loading, orders: false } };
    case 'PLACE_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id
            ? { ...o, status: action.payload.status, trackingUrl: action.payload.trackingUrl }
            : o
        ),
      };

    case 'SET_EVENTS':
      return { ...state, events: action.payload, loading: { ...state.loading, events: false } };
    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((ev) => (ev.id === action.payload.id ? action.payload : ev)),
      };
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter((ev) => ev.id !== action.payload) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isAuthenticated, bootstrapping } = useAuth();
  const loadedRef = useRef({ orders: false });
  const productsRef = useRef(state.products);
  const storesRef = useRef(state.stores);
  useEffect(() => { productsRef.current = state.products; }, [state.products]);
  useEffect(() => { storesRef.current = state.stores; }, [state.stores]);

  useEffect(() => {
    let cancelled = false;
    async function loadPublic() {
      try {
        const [products, stores, banners, events] = await Promise.all([
          productsApi.list(),
          storesApi.list(),
          bannersApi.list(),
          eventsApi.list(),
        ]);
        if (cancelled) return;
        dispatch({ type: 'SET_PRODUCTS', payload: products });
        dispatch({ type: 'SET_STORES', payload: stores });
        dispatch({ type: 'SET_BANNERS', payload: banners });
        dispatch({ type: 'SET_EVENTS', payload: events });
      } catch (err) {
        if (!cancelled) dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    }
    loadPublic();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (bootstrapping) return;
    let cancelled = false;
    async function loadOrders() {
      if (!isAuthenticated) {
        dispatch({ type: 'SET_ORDERS', payload: [] });
        loadedRef.current.orders = false;
        return;
      }
      if (loadedRef.current.orders) return;
      dispatch({ type: 'SET_LOADING', key: 'orders', value: true });
      try {
        const list = await ordersApi.listAll();
        if (cancelled) return;
        dispatch({ type: 'SET_ORDERS', payload: list });
        loadedRef.current.orders = true;
      } catch {
        if (!cancelled) dispatch({ type: 'SET_ORDERS', payload: [] });
      }
    }
    loadOrders();
    return () => { cancelled = true; };
  }, [isAuthenticated, bootstrapping]);

  const refetch = useCallback(async (key) => {
    switch (key) {
      case 'products': {
        const list = await productsApi.list();
        dispatch({ type: 'SET_PRODUCTS', payload: list });
        return list;
      }
      case 'stores': {
        const list = await storesApi.list();
        dispatch({ type: 'SET_STORES', payload: list });
        return list;
      }
      case 'events': {
        const list = await eventsApi.list();
        dispatch({ type: 'SET_EVENTS', payload: list });
        return list;
      }
      case 'orders': {
        const list = await ordersApi.listAll();
        dispatch({ type: 'SET_ORDERS', payload: list });
        return list;
      }
      case 'banners': {
        const list = await bannersApi.list();
        dispatch({ type: 'SET_BANNERS', payload: list });
        return list;
      }
      default:
        return null;
    }
  }, []);

  const actions = useMemo(
    () => ({
      // products
      async createProduct(payload) {
        const created = await productsApi.create(payload);
        dispatch({ type: 'ADD_PRODUCT', payload: created });
        return created;
      },
      async updateProduct(id, payload) {
        const updated = await productsApi.update(id, payload);
        dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
        return updated;
      },
      async deleteProduct(id) {
        await productsApi.remove(id);
        dispatch({ type: 'DELETE_PRODUCT', payload: id });
      },

      // stores
      async createStore(payload) {
        const created = await storesApi.create(payload);
        dispatch({ type: 'ADD_STORE', payload: created });
        return created;
      },
      async updateStore(id, payload) {
        const updated = await storesApi.update(id, payload);
        dispatch({ type: 'UPDATE_STORE', payload: updated });
        return updated;
      },
      async deleteStore(id) {
        await storesApi.remove(id);
        dispatch({ type: 'DELETE_STORE', payload: id });
      },

      // events
      async createEvent(payload) {
        const created = await eventsApi.create(payload);
        dispatch({ type: 'ADD_EVENT', payload: created });
        return created;
      },
      async updateEvent(id, payload) {
        const updated = await eventsApi.update(id, payload);
        dispatch({ type: 'UPDATE_EVENT', payload: updated });
        return updated;
      },
      async deleteEvent(id) {
        await eventsApi.remove(id);
        dispatch({ type: 'DELETE_EVENT', payload: id });
      },

      // orders
      async updateOrderStatus(id, payload) {
        const updated = await ordersApi.updateStatus(id, payload);
        dispatch({
          type: 'UPDATE_ORDER_STATUS',
          payload: { id: updated.id, status: updated.status, trackingUrl: updated.trackingUrl },
        });
        return updated;
      },

      refetch,
    }),
    [refetch]
  );

  return (
    <AppContext.Provider value={{ state, dispatch, actions, productsRef, storesRef }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
