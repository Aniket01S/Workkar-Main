import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWorkkar } from '../context/WorkkarContext';
import { WeeklyEarningsChart, DailyEarningsChart } from '../components/Charts';
import { WithdrawModal } from '../components/Modals';

export default function WorkerEarnings() {
  const { wallet, earningsTrend } = useWorkkar();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Stats Card data
  const weeklyTotal = wallet.weekly;
  const balanceTotal = wallet.balance;

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col gap-8">
        
        {/* Header */}
        <header className="border-b border-outline-variant/30 pb-4">
          <h1 className="font-display-lg text-3xl md:text-display-lg text-on-background font-extrabold tracking-tight">Earnings Overview</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Track your weekly performance and wallet balance.</p>
        </header>

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          
          {/* Left Column: Primary Metrics & Weekly chart (2 spans) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Total Earnings Hero Card */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow duration-300">
              <div>
                <p className="font-title-md text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">This Week's Earnings</p>
                <h2 className="font-display-lg text-4xl text-primary font-extrabold">${weeklyTotal.toFixed(2)}</h2>
                <div className="flex items-center gap-1 mt-2 text-secondary-container">
                  <span className="material-symbols-outlined text-[16px] fill">trending_up</span>
                  <span className="font-label-md text-xs font-bold">+12% vs last week</span>
                </div>
              </div>

              {/* Sub-item values list */}
              <div className="w-full md:w-auto grid grid-cols-3 gap-6 bg-surface-container-low p-4 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Jobs</p>
                  <p className="font-headline-md text-sm font-extrabold text-on-surface">${wallet.jobEarnings.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Incentives</p>
                  <p className="font-headline-md text-sm font-extrabold text-on-surface">${wallet.incentives.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Tips</p>
                  <p className="font-headline-md text-sm font-extrabold text-on-surface">${wallet.tips.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Daily Trend Chart Section */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                <h3 className="font-headline-md text-base font-bold text-on-surface">Daily Revenue Trend</h3>
                <select className="bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs font-medium text-on-surface py-2 pl-3 pr-8 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-all">
                  <option>Current Week</option>
                  <option>Last Week</option>
                </select>
              </div>
              <div className="h-64 w-full relative">
                <DailyEarningsChart data={earningsTrend} />
              </div>
            </div>

          </div>

          {/* Right Column: Wallet & Secondary Metrics (1 span) */}
          <div className="flex flex-col gap-8">
            
            {/* Wallet Balance Card */}
            <div className="bg-primary text-on-primary rounded-xl p-6 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg">
              {/* Decorative circle backdrop */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-title-md text-sm text-primary-fixed-dim font-bold uppercase tracking-wider">Wallet Balance</p>
                  <span className="material-symbols-outlined text-on-primary text-2xl">account_balance_wallet</span>
                </div>
                
                <h3 className="font-display-lg text-3xl font-extrabold mb-6">${balanceTotal.toFixed(2)}</h3>
                
                <button 
                  onClick={() => setIsWithdrawOpen(true)}
                  className="w-full bg-on-primary text-primary font-bold text-sm py-3 rounded-lg hover:bg-surface hover:shadow transition-colors duration-200 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary dark:focus-visible:ring-offset-blue-600 border-none shadow-sm"
                >
                  Withdraw Funds
                </button>
              </div>
            </div>

            {/* Performance Summary Bento details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-primary mb-1 fill">task_alt</span>
                <p className="font-display-lg text-lg text-on-surface font-extrabold">32</p>
                <p className="font-label-md text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">Jobs Done</p>
              </div>
              
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-secondary-container mb-1 fill">star</span>
                <p className="font-display-lg text-lg text-on-surface font-extrabold">4.9</p>
                <p className="font-label-md text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">Avg Rating</p>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-tertiary-container mb-1 fill">schedule</span>
                <p className="font-display-lg text-lg text-on-surface font-extrabold">45h</p>
                <p className="font-label-md text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">Online Hrs</p>
              </div>
              
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-primary mb-1 fill">payments</span>
                <p className="font-display-lg text-lg text-on-surface font-extrabold">$26</p>
                <p className="font-label-md text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">Avg/Job</p>
              </div>
            </div>

            {/* Acceptance Rate Progress Card */}
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-on-surface uppercase tracking-wider">Acceptance Rate</span>
                <span className="font-bold text-sm text-primary">94%</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden shadow-inner mt-1">
                <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
              <p className="font-label-md text-[10px] text-on-surface-variant leading-relaxed mt-1">
                Keep acceptance rate above 90% to receive top-tier incentives.
              </p>
            </div>

          </div>

        </div>

        {/* Weekly Stacked Earnings Recharts Chart */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow-base p-6 flex flex-col gap-4">
          <div className="border-b border-outline-variant/20 pb-3">
            <h3 className="font-headline-md text-base font-bold text-on-surface">Weekly Breakdown (Jobs vs Tips)</h3>
          </div>
          <div className="h-64 w-full relative">
            <WeeklyEarningsChart data={earningsTrend} />
          </div>
        </section>

      </div>

      {/* Withdraw Animated Modal component */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />
    </div>
  );
}
