import React, { useState, useEffect } from 'react';
import { motion, animate, useMotionValue, useReducedMotion } from 'framer-motion';
import { useWorkkar } from '../context/WorkkarContext';
import { WeeklyEarningsChart, DailyEarningsChart } from '../components/Charts';
import { WithdrawModal } from '../components/Modals';

/* ---------- Helpers ---------- */

// Number jo 0 se count-up hota hai
function CountUp({ value = 0, prefix = '', decimals = 0, duration = 1.2 }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) return setDisplay(value);
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    const unsub = mv.on('change', (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, reduce, duration, mv]);

  return (
    <>
      {prefix}
      {Number(display).toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </>
  );
}

// Ek hi orchestrated entrance: parent stagger, children rise
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 18 } },
};

const card =
  'bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm';

/* ---------- Page ---------- */

export default function WorkerEarnings() {
  const { user, wallet, earningsTrend } = useWorkkar();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [period, setPeriod] = useState('current');

  const jobsDone = user?.jobsCompleted || 0;
  const rating = user?.rating || 0;
  const onlineHours = jobsDone * 2; // Approximate online hours based on jobs
  const avgPerJob = (jobsDone > 0 && wallet?.jobEarnings) ? (wallet.jobEarnings / jobsDone) : (user?.rate || 0);

  const stats = [
    { icon: 'task_alt', color: 'text-primary', value: jobsDone, suffix: '', label: 'Jobs done' },
    { icon: 'star', color: 'text-secondary-container', value: rating, decimals: 1, label: 'Avg rating' },
    { icon: 'schedule', color: 'text-tertiary-container', value: onlineHours, suffix: 'h', label: 'Online hours' },
    { icon: 'payments', color: 'text-primary', value: avgPerJob, prefix: '₹', label: 'Avg per job' },
  ];

  const breakdown = [
    { label: 'Jobs', value: wallet.jobEarnings, dot: 'bg-primary' },
    { label: 'Incentives', value: wallet.incentives, dot: 'bg-secondary-container' },
    { label: 'Tips', value: wallet.tips, dot: 'bg-tertiary-container' },
  ];

  return (
    <div className="bg-background min-h-screen py-8 relative overflow-hidden">
      {/* Soft ambient glow behind the page */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/10 blur-3xl"
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col gap-8"
      >
        {/* Header */}
        <motion.header variants={rise} className="border-b border-outline-variant/30 pb-4">
          <h1 className="font-display-lg text-3xl md:text-display-lg text-on-background font-extrabold tracking-tight">
            Earnings Overview
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Track your weekly performance and wallet balance.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* LEFT */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Hero earnings card */}
            <motion.div
              variants={rise}
              whileHover={{ y: -3 }}
              className={`${card} p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden`}
            >
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-secondary-container"
              />
              <div className="pl-2">
                <p className="text-xs text-on-surface-variant mb-1 font-semibold">This week's earnings</p>
                <h2 className="font-display-lg text-5xl text-primary font-extrabold tabular-nums">
                  <CountUp value={wallet.weekly} prefix="₹" decimals={2} />
                </h2>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full bg-secondary-container/15 text-secondary-container"
                >
                  <span className="material-symbols-outlined notranslate text-[16px] fill">trending_up</span>
                  <span className="text-xs font-bold">+12% vs last week</span>
                </motion.div>
              </div>

              {/* Breakdown */}
              <div className="w-full md:w-auto grid grid-cols-3 gap-5 bg-surface-container-low p-4 rounded-xl">
                {breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${b.dot}`} />
                      <p className="text-[11px] font-semibold text-on-surface-variant">{b.label}</p>
                    </div>
                    <p className="text-sm font-extrabold text-on-surface tabular-nums">
                      <CountUp value={b.value} prefix="₹" decimals={2} />
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Daily trend */}
            <motion.div variants={rise} className={`${card} p-6 flex flex-col gap-4`}>
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                <h3 className="text-base font-bold text-on-surface">Daily revenue trend</h3>

                {/* Animated segmented toggle */}
                <div className="relative flex bg-surface-container-low rounded-lg p-1">
                  {[
                    { id: 'current', label: 'This week' },
                    { id: 'last', label: 'Last week' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setPeriod(t.id)}
                      className={`relative z-10 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${period === t.id ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                      {period === t.id && (
                        <motion.span
                          layoutId="period-pill"
                          className="absolute inset-0 bg-primary rounded-md -z-10"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 w-full relative">
                {/* key = chart re-animate hota hai jab period badle */}
                <motion.div
                  key={period}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="h-full w-full"
                >
                  <DailyEarningsChart data={earningsTrend} />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-8">
            {/* Wallet card, is page ka hero moment */}
            <motion.div
              variants={rise}
              className="relative overflow-hidden rounded-2xl p-6 text-on-primary shadow-lg bg-gradient-to-br from-primary via-primary to-secondary-container"
            >
              {/* Shimmer sweep */}
              <motion.div
                aria-hidden
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                initial={{ left: '-40%' }}
                animate={{ left: '140%' }}
                transition={{ duration: 2.2, delay: 0.8, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
              />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-primary-fixed-dim font-bold">Wallet balance</p>
                  <motion.span
                    className="material-symbols-outlined notranslate text-2xl"
                    animate={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 1.2, delay: 1, repeat: Infinity, repeatDelay: 6 }}
                  >
                    account_balance_wallet
                  </motion.span>
                </div>

                <h3 className="font-display-lg text-4xl font-extrabold mb-6 tabular-nums">
                  <CountUp value={wallet.balance} prefix="₹" decimals={2} />
                </h3>

                <motion.button
                  onClick={() => setIsWithdrawOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full bg-on-primary text-primary font-bold text-sm py-3 rounded-xl shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  Withdraw funds
                </motion.button>
              </div>
            </motion.div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  variants={rise}
                  whileHover={{ y: -4, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`${card} p-4 flex flex-col items-center text-center cursor-default`}
                >
                  <span className={`material-symbols-outlined notranslate mb-1 fill ${s.color}`}>{s.icon}</span>
                  <p className="font-display-lg text-xl text-on-surface font-extrabold tabular-nums">
                    <CountUp value={s.value} prefix={s.prefix} decimals={s.decimals || 0} />
                    {s.suffix}
                  </p>
                  <p className="text-[11px] font-semibold text-on-surface-variant mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Acceptance rate */}
            <motion.div variants={rise} className={`${card} p-5 flex flex-col gap-2`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-on-surface">Acceptance rate</span>
                <span className="font-bold text-sm text-primary tabular-nums">
                  <CountUp value={jobsDone > 0 ? 100 : 0} />%
                </span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden mt-1">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary-container"
                  initial={{ width: 0 }}
                  animate={{ width: jobsDone > 0 ? '100%' : '0%' }}
                  transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1">
                Keep it above 90% to get top-tier incentives.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Weekly breakdown, scroll pe reveal hota hai */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`${card} p-6 flex flex-col gap-4`}
        >
          <div className="border-b border-outline-variant/20 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface">Weekly breakdown</h3>
            <p className="text-xs text-on-surface-variant">Jobs vs tips</p>
          </div>
          <div className="h-64 w-full relative">
            <WeeklyEarningsChart data={earningsTrend} />
          </div>
        </motion.section>
      </motion.div>

      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
    </div>
  );
}