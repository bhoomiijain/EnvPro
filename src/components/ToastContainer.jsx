import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnvironments } from '../context/EnvironmentContext';

const kindClass = {
  success: 'toast-success',
  error: 'toast-error',
  info: 'toast-info',
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useEnvironments();

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast-item ${kindClass[toast.kind] || 'toast-info'}`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16 }}
          >
            <span>{toast.message}</span>
            <button onClick={() => dismissToast(toast.id)} className="toast-close">x</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
