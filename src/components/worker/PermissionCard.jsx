import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldAlert } from 'lucide-react';

export default function PermissionCard({
  title,
  description,
  icon: Icon,
  isGranted,
  onGrant,
  buttonText,
  loading = false,
}) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-white dark:bg-slate-800 rounded-2xl border p-6 shadow-sm transition-all flex flex-col justify-between ${
        isGranted
          ? 'border-emerald-500/30 dark:border-emerald-500/20 ring-1 ring-emerald-500/10'
          : 'border-slate-100 dark:border-slate-700/50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-xl transition-colors ${
            isGranted
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-blue-50 dark:bg-slate-700/50 text-blue-600 dark:text-blue-400'
          }`}
        >
          <Icon size={24} className={loading ? 'animate-spin' : ''} />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {title}
            <AnimatePresence>
              {isGranted && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                >
                  Granted
                </motion.span>
              )}
            </AnimatePresence>
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end w-full">
        {isGranted ? (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/15">
            <Check size={16} />
            Permission Active
          </div>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={onGrant}
            className="w-full sm:w-auto py-2.5 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Requesting...
              </>
            ) : (
              <>
                {buttonText}
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
