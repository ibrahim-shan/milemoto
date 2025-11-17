'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { CartItem, type AddCartItemInput } from '@/features/cart/types';

type CartContextValue = {
  items: CartItem[];
  addItem: (input: AddCartItemInput) => void;
  removeItem: (id: string) => void;
  setItemQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'mm_cart_items';

function normalizeQty(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 1;
  const n = Math.floor(value);
  return Math.max(1, Math.min(999, n));
}

function loadInitialItems(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((it): it is CartItem => {
      return (
        typeof it === 'object' &&
        it !== null &&
        typeof it.id === 'string' &&
        typeof it.slug === 'string' &&
        typeof it.title === 'string' &&
        typeof it.imageSrc === 'string' &&
        typeof it.priceMinor === 'number' &&
        typeof it.qty === 'number' &&
        Number.isFinite(it.qty)
      );
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>(() => loadInitialItems());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => {
      setItems(loadInitialItems());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const addItem = useCallback((input: AddCartItemInput) => {
    const qty = normalizeQty(input.qty ?? 1);
    setItems(prev => {
      const id = input.slug;
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item =>
          item.id === id ? { ...item, qty: normalizeQty(item.qty + qty) } : item,
        );
      }
      const next: CartItem = {
        id,
        slug: input.slug,
        title: input.title,
        imageSrc: input.imageSrc,
        priceMinor: input.priceMinor,
        qty,
      };
      return [...prev, next];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const setItemQty = useCallback((id: string, qty: number) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, qty: normalizeQty(qty) } : item)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      setItemQty,
      clear,
    }),
    [items, addItem, removeItem, setItemQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
