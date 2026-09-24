import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useLibrary();

  return (
    <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[100] flex flex-col gap-2 w-[calc(100vw-3rem)] max-w-[270px] sm:max-w-xs pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-center justify-between p-2 px-2.5 rounded-xl border shadow-xl backdrop-blur-xl ${
                toast.type === 'error'
                  ? 'bg-rose-950/98 border-rose-500/50 text-rose-100'
                  : toast.type === 'info'
                  ? 'bg-[#1C140D]/98 border-amber-500/40 text-amber-200'
                  : 'bg-[#18110B]/98 border-amber-500/60 text-stone-100 shadow-[0_4px_16px_rgba(245,158,11,0.25)]'
              }`}
            >
              <div className="flex items-center gap-1.5 pr-1 min-w-0">
                {toast.type === 'error' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : toast.type === 'info' ? (
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span className="text-[11px] font-semibold leading-tight line-clamp-2">{toast.message}</span>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-stone-400 hover:text-stone-100 p-0.5 rounded-md transition-colors shrink-0 cursor-pointer ml-1"
                aria-label="Yopish"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
