import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), 3600);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="ss-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`ss-toast ss-toast-${t.type}`} onClick={() => dismiss(t.id)}>
            <span className="ss-toast-icon">{t.type === "error" ? "!" : t.type === "info" ? "i" : "\u2713"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
      <style>
        {`
          .ss-toast-stack { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 10px; z-index: 1000; }
          .ss-toast { display: flex; align-items: center; gap: 10px; background: var(--st-forest-card, rgba(255,255,255,0.08)); border: 1px solid var(--st-border, rgba(255,255,255,0.14)); color: var(--st-cream, #F2F3FC); backdrop-filter: blur(20px) saturate(140%); -webkit-backdrop-filter: blur(20px) saturate(140%); box-shadow: 0 10px 34px rgba(6,8,30,0.45); padding: 12px 18px; border-radius: 14px; font-size: 13px; font-weight: 500; cursor: pointer; animation: ss-toast-in 0.25s ease; max-width: 320px; }
          @keyframes ss-toast-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .ss-toast-icon { width: 20px; height: 20px; flex-shrink: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; }
          .ss-toast-success .ss-toast-icon { background: linear-gradient(135deg, #7C6CF6, #22D3EE); }
          .ss-toast-error .ss-toast-icon { background: #F87171; }
          .ss-toast-info .ss-toast-icon { background: #A78BFA; }
          @media (max-width: 600px) { .ss-toast-stack { left: 16px; right: 16px; bottom: 16px; } .ss-toast { max-width: none; } }
        `}
      </style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
