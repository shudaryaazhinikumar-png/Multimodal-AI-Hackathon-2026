import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

let toastCallback: ((toast: Omit<ToastData, 'id'>) => void) | null = null;

export function toast(type: ToastType, message: string) {
  if (toastCallback) toastCallback({ type, message });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    toastCallback = (t) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 4000);
    };
    return () => { toastCallback = null; };
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: <CheckCircle2 size={18} className="text-sage" />,
    error: <AlertCircle size={18} className="text-danger" />,
    info: <Info size={18} className="text-primary" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-3 shadow-lg animate-slide-in-right min-w-[300px] max-w-[400px]"
        >
          {icons[t.type]}
          <p className="flex-1 text-sm text-text-primary">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-text-secondary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
