"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { loadCartItems, serializeCartItems } from "@/lib/cart";
import { roundTo } from "@/lib/utils";
import type { CartItem } from "@/types";

const STORAGE_KEY = "prismarq-cart-v1";

type CartToast = {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isReady: boolean;
  upsertItem: (item: CartItem, existingItemId?: string | null) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getItem: (itemId: string) => CartItem | undefined;
  notify: (toast: Omit<CartToast, "id">) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function CartToastRegion({
  toasts,
  onDismiss,
}: {
  toasts: CartToast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-4 top-20 z-[70] flex flex-col gap-3 sm:right-5 sm:left-auto sm:top-24 sm:max-w-[360px]"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto overflow-hidden rounded-[24px] border border-black/10 bg-white/96 p-4 shadow-[0_24px_60px_rgba(15,15,15,0.16)] backdrop-blur"
        >
          <div className="mb-3 h-1 rounded-full bg-[linear-gradient(90deg,#00B5FF_0%,#FF2EBF_55%,#FFD300_100%)]" />
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{toast.title}</p>
              <p className="mt-1 text-sm leading-6 text-black/62">{toast.description}</p>
              {toast.actionHref && toast.actionLabel ? (
                <Link href={toast.actionHref} className="mt-3 inline-flex text-sm font-semibold text-ink underline-offset-4 hover:underline">
                  {toast.actionLabel}
                </Link>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-black/58 transition hover:bg-black/[0.06]"
              aria-label="Fechar notificação"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [toasts, setToasts] = useState<CartToast[]>([]);
  const toastTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setItems(loadCartItems(raw));
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, serializeCartItems(items));
  }, [items, isReady]);

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  function dismissToast(id: string) {
    const timer = toastTimersRef.current[id];
    if (timer) {
      clearTimeout(timer);
      delete toastTimersRef.current[id];
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function notify(input: Omit<CartToast, "id">) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast: CartToast = { id, ...input };

    setToasts((current) => [...current, toast].slice(-3));
    toastTimersRef.current[id] = setTimeout(() => {
      dismissToast(id);
    }, 4200);
  }

  const subtotal = roundTo(items.reduce((total, item) => total + item.totalPrice, 0));

  const value: CartContextValue = {
    items,
    itemCount: items.length,
    subtotal,
    isReady,
    upsertItem(item, existingItemId) {
      setItems((current) => {
        const now = new Date().toISOString();
        const currentItem = existingItemId ? current.find((entry) => entry.id === existingItemId) : undefined;

        if (!existingItemId) {
          return [...current, item];
        }

        const nextItem = currentItem
          ? {
              ...item,
              id: currentItem.id,
              createdAt: currentItem.createdAt,
              updatedAt: now,
            }
          : {
              ...item,
              id: existingItemId,
              updatedAt: now,
            };

        const index = current.findIndex((entry) => entry.id === existingItemId);

        if (index < 0) {
          return [...current, nextItem];
        }

        return current.map((entry) => (entry.id === existingItemId ? nextItem : entry));
      });

      notify({
        title: existingItemId ? "Carrinho atualizado" : "Produto adicionado ao carrinho",
        description: `${item.productName} ficou salvo com a configuração atual.`,
        actionHref: "/cart",
        actionLabel: "Ver carrinho",
      });
    },
    removeItem(itemId) {
      const item = items.find((entry) => entry.id === itemId);
      setItems((current) => current.filter((entry) => entry.id !== itemId));

      if (item) {
        notify({
          title: "Item removido",
          description: `${item.productName} saiu do carrinho.`,
          actionHref: "/products",
          actionLabel: "Continuar comprando",
        });
      }
    },
    clearCart() {
      if (items.length > 0) {
        notify({
          title: "Carrinho limpo",
          description: "Os itens foram removidos. Você pode montar novos pedidos a qualquer momento.",
          actionHref: "/products",
          actionLabel: "Ver produtos",
        });
      }

      setItems([]);
    },
    getItem(itemId) {
      return items.find((entry) => entry.id === itemId);
    },
    notify,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartToastRegion toasts={toasts} onDismiss={dismissToast} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider.");
  }

  return context;
}
