import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWorkkar } from '../context/WorkkarContext';

// 1. Withdraw Funds Modal Component
export function WithdrawModal({ isOpen, onClose }) {
  const { wallet, withdrawFunds } = useWorkkar();
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'processing', 'success'

  const handleWithdraw = (e) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (withdrawAmount > wallet.balance) {
      alert("Insufficient wallet balance.");
      return;
    }

    setStatus('processing');
    
    // Simulate processing delay
    setTimeout(() => {
      const success = withdrawFunds(withdrawAmount);
      if (success) {
        setStatus('success');
      } else {
        setStatus('idle');
      }
    }, 2000);
  };

  const reset = () => {
    setAmount('');
    setAccount('');
    setStatus('idle');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Overlay backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={reset}
          className="absolute inset-0 bg-[#0b1c30]/75"
        />

        {/* Modal content canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xl max-w-md w-full overflow-hidden"
        >
          {status === 'idle' && (
            <>
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-4">
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined notranslate text-primary">account_balance_wallet</span>
                  Withdraw Funds
                </h3>
                <button onClick={reset} className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-full hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-455" aria-label="Close modal">
                  <span className="material-symbols-outlined notranslate">close</span>
                </button>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl mb-4 text-center border border-outline-variant/30">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Available Balance</span>
                <span className="font-display-lg text-display-lg text-primary font-bold">₹{wallet.balance.toFixed(2)}</span>
              </div>

              <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface-variant">Amount to Withdraw (₹)</label>
                  <input
                    required
                    type="number"
                    min="10"
                    step="0.01"
                    max={wallet.balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (Min ₹10.00)"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary dark:focus:ring-primary transition-colors text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-on-surface-variant">Destination Account (Bank/UPI)</label>
                  <input
                    required
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="e.g. Bank Account or routing address"
                    className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary dark:focus:ring-primary transition-colors text-sm"
                  />
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-outline-variant/30">
                  <button
                    type="button"
                    onClick={reset}
                    className="flex-1 py-3 border border-outline text-on-surface rounded-lg font-bold text-xs hover:bg-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 border-none"
                  >
                    Withdraw
                  </button>
                </div>
              </form>
            </>
          )}

          {status === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Processing Withdrawal</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
                Verifying bank credentials and processing your payout request...
              </p>
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-6 flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-650 dark:text-emerald-300 rounded-full flex items-center justify-center shadow-inner border border-emerald-500/20">
                <span className="material-symbols-outlined notranslate text-4xl fill">check_circle</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Withdrawal Complete!</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mb-4">
                We've routed **₹{parseFloat(amount).toFixed(2)}** to your registered payout account successfully.
              </p>
              <button
                onClick={reset}
                className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 border-none"
              >
                Done
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// 2. Service Detail Modal Component
export function ServiceModal({ service, isOpen, onClose }) {
  const { workers } = useWorkkar();
  
  // Filter workers that specialize in this skill category
  const activeWorkers = service ? workers.filter(w => w.skill.toLowerCase() === service.id.toLowerCase() && w.availability === 'Available') : [];

  // Specific role animations
  const getRoleAnimation = (roleId) => {
    switch (roleId) {
      case 'electrician':
        return (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          >
            <span className="material-symbols-outlined notranslate text-[200px] text-blue-500">bolt</span>
          </motion.div>
        );
      case 'plumber':
        return (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: [-10, 10, -10], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          >
            <span className="material-symbols-outlined notranslate text-[200px] text-orange-500">water_drop</span>
          </motion.div>
        );
      case 'painter':
        return (
          <motion.div
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-10"
          >
            <span className="material-symbols-outlined notranslate text-[200px] text-purple-500">format_paint</span>
          </motion.div>
        );
      case 'carpenter':
        return (
          <motion.div
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: [-20, 0, -20] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-10"
          >
            <span className="material-symbols-outlined notranslate text-[200px] text-amber-500">handyman</span>
          </motion.div>
        );
      case 'cleaner':
        return (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-10"
          >
            <span className="material-symbols-outlined notranslate text-[200px] text-teal-500">cleaning_services</span>
          </motion.div>
        );
      case 'mason':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          >
            <span className="material-symbols-outlined notranslate text-[200px] text-pink-500">architecture</span>
          </motion.div>
        );
      case 'welder':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          >
            <span className="material-symbols-outlined notranslate text-[200px] text-rose-500">hardware</span>
          </motion.div>
        );
      case 'gardener':
        return (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: [10, -10, 10], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          >
            <span className="material-symbols-outlined notranslate text-[200px] text-green-500">grass</span>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && service && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Overlay backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-[#0B1120] border border-white/10 rounded-[28px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-w-lg w-full overflow-hidden"
        >
          {getRoleAnimation(service.id.toLowerCase())}

          <div className="relative z-10">
            <div className="flex justify-between items-center border-b border-white/10 pb-5 mb-5">
              <h3 className="text-2xl text-white font-extrabold flex items-center gap-3">
                <span className={`material-symbols-outlined notranslate text-blue-500 text-3xl`}>{service.icon}</span>
                {service.name} Services
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors focus:outline-none" aria-label="Close modal">
                <span className="material-symbols-outlined notranslate">close</span>
              </button>
            </div>

            <div className="mb-8">
              <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-widest mb-2">Service Description</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Find verified, high-quality, and background-checked {service.name.toLowerCase()} professionals. Ready for immediate dispatch or appointment booking at standard hourly wage rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-widest mb-4">Available {service.name}s Nearby</h4>
              {activeWorkers.length === 0 ? (
                <div className="p-8 bg-[#0a0f1d]/50 border border-white/5 rounded-2xl text-center text-slate-400 text-sm">
                  <span className="material-symbols-outlined notranslate text-4xl text-slate-600 mb-3 block">person_search</span>
                  No {service.name.toLowerCase()}s are available at this moment. Check back soon!
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {activeWorkers.map(worker => (
                    <div key={worker.id} className="p-4 border border-white/5 rounded-2xl flex items-center justify-between bg-[#152042]/40 hover:bg-[#152042]/80 transition-all duration-200 group">
                      <div className="flex items-center gap-4">
                        {worker.avatar ? (
                          <img src={worker.avatar} alt={worker.name} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center font-bold text-sm text-blue-400">
                            {worker.textAvatar || worker.name.substring(0,2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-sm block text-white group-hover:text-blue-400 transition-colors">{worker.name}</span>
                          <span className="text-[11px] text-slate-400">{worker.experience} yrs exp • ⭐ {worker.rating}</span>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <span className="font-extrabold text-white text-sm">₹{worker.rate}/hr</span>
                        <Link
                          to={`/worker-details/${worker.id}`}
                          onClick={onClose}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-500 transition-all shadow-[0_0_10px_rgba(37,99,235,0.4)] active:scale-95"
                        >
                          Book
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}

// 3. Notification Toast List component
export function NotificationToastList() {
  const { notifications } = useWorkkar();

  return (
    <div id="toast-container" className="fixed top-24 right-6 z-[99999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => {
          let icon = 'info';
          let iconClass = 'text-primary';
          
          if (n.type === 'success') {
            icon = 'check_circle';
            iconClass = 'text-emerald-600';
          } else if (n.type === 'warning') {
            icon = 'warning';
            iconClass = 'text-secondary-container';
          } else if (n.type === 'error') {
            icon = 'error';
            iconClass = 'text-error';
          }

          return (
            <motion.div
              key={n.id}
              initial={{ transform: 'translateY(1rem) scale(0.95)', opacity: 0 }}
              animate={{ transform: 'translateY(0) scale(1)', opacity: 1 }}
              exit={{ transform: 'translateY(-1rem) scale(0.95)', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="glass-overlay ambient-shadow-base p-4 rounded-xl border border-outline-variant/30 flex items-center gap-3 w-full shadow-lg pointer-events-auto"
            >
              <span className={`material-symbols-outlined notranslate ${iconClass} shrink-0`}>{icon}</span>
              <div className="flex-grow text-xs font-semibold text-on-surface leading-tight">{n.message}</div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
