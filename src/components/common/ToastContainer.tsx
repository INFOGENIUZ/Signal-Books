import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useLibrary();

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {toasts.map(toast => {
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${
                toast.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                  : toast.type === 'info'
                  ? 'bg-[#1C140D]/95 border-amber-500/40 text-amber-200'
                  : 'bg-[#18110B]/95 border-amber-500/50 text-stone-100 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
              }`}
            >
              <div className="flex items-center gap-3 pr-2">
                {toast.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                ) : toast.type === 'info' ? (
                  <Info className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <span className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</span>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-stone-400 hover:text-stone-100 p-1 rounded-lg transition-colors"
                aria-label="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
