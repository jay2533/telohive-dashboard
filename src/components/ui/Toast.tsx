'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Internal rendering ────────────────────────────────────────────────────────

const TYPE_STYLES: Record<ToastType, string> = {
  info: 'bg-gray-900 text-white',
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
};

const TYPE_ICONS: Record<ToastType, string> = {
  info: 'ℹ',
  success: '✓',
  error: '✕',
  warning: '⚠',
};

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-3rem)]"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium ${TYPE_STYLES[toast.type]}`}
        >
          <span
            className="shrink-0 mt-px text-base leading-none"
            aria-hidden="true"
          >
            {TYPE_ICONS[toast.type]}
          </span>
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 mt-px opacity-70 hover:opacity-100 transition-opacity leading-none"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
