import React, { createContext, useContext, useReducer } from 'react';
import { initialProducts, stores, banners } from '../data/products';

const AppContext = createContext();

const initialState = {
  products: initialProducts,
  stores,
  banners,
  orders: [],
  events: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };

    case 'ADD_STORE':
      return { ...state, stores: [...state.stores, action.payload] };
    case 'UPDATE_STORE':
      return { ...state, stores: state.stores.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_STORE':
      return { ...state, stores: state.stores.filter(s => s.id !== action.payload) };

    case 'PLACE_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.payload.id ? { ...o, status: action.payload.status, trackingUrl: action.payload.trackingUrl } : o
        ),
      };

    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return { ...state, events: state.events.map(ev => ev.id === action.payload.id ? action.payload : ev) };
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter(ev => ev.id !== action.payload) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
