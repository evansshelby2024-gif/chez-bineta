import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export const NotificationToast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
                toast.type === 'success'
                  ? 'bg-zinc-900/95 border-emerald-500/50 text-white'
                  : toast.type === 'warning'
                  ? 'bg-zinc-900/95 border-orange-500/50 text-white'
                  : toast.type === 'error'
                  ? 'bg-zinc-900/95 border-red-500/50 text-white'
                  : 'bg-zinc-900/95 border-zinc-700 text-white'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-orange-400" />}
              </div>

              <p className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</p>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
