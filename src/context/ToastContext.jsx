import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = useCallback(({
    title = "Confirm Action",
    message = "Are you sure you want to perform this action?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel
  }) => {
    setConfirmModal({
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        setConfirmModal(null);
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setConfirmModal(null);
        if (onCancel) onCancel();
      }
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
                toast.type === "error"
                  ? "bg-error/95 text-white border-error/40"
                  : toast.type === "warning"
                  ? "bg-amber-500/95 text-white border-amber-400"
                  : toast.type === "info"
                  ? "bg-blue-600/95 text-white border-blue-400"
                  : "bg-primary text-white border-primary/40"
              }`}
            >
              <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">
                {toast.type === "error"
                  ? "error"
                  : toast.type === "warning"
                  ? "warning"
                  : toast.type === "info"
                  ? "info"
                  : "check_circle"}
              </span>
              <div className="flex-1 text-xs font-semibold leading-snug">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/80 hover:text-white shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface text-on-surface p-6 rounded-2xl max-w-md w-full shadow-2xl border border-outline-variant/30 space-y-4"
            >
              <h3 className="text-headline-sm font-bold text-on-surface">{confirmModal.title}</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{confirmModal.message}</p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={confirmModal.onCancel}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container transition-colors cursor-pointer text-xs"
                >
                  {confirmModal.cancelText}
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container transition-colors shadow-md cursor-pointer text-xs"
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
