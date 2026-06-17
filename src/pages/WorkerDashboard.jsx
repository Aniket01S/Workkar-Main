import React from 'react';
import { motion } from 'framer-motion';
import { useWorkkar } from '../context/WorkkarContext';
import DashboardCard from '../components/DashboardCard';
import { JobPerformanceChart } from '../components/Charts';

export default function WorkerDashboard() {
  const {
    user,
    earningsTrend,
    toggleWorkerAvailability
  } = useWorkkar();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Verification Pending State
  if (user.status === 'pending') {
    return (
      <div className="bg-background min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full p-8 bg-surface-container-lowest/80 dark:bg-surface-container-low/60 backdrop-blur-xl border border-yellow-500/30 rounded-3xl shadow-2xl text-center space-y-6"
        >
          <div className="flex justify-center text-yellow-500">
            <span className="material-symbols-outlined text-6xl animate-pulse">pending_actions</span>
          </div>
          <h2 className="font-display-lg text-headline-lg font-extrabold text-on-surface">
            Verification Pending Approval
          </h2>
          <p className="font-body-md text-on-surface-variant text-sm max-w-md mx-auto leading-relaxed">
            Your worker companion application is under review by the platform coordinator. 
            Worker-specific tools and dispatches will unlock once approved.
          </p>

          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 text-left max-w-lg mx-auto space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary">Onboarding Metadata</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-on-surface-variant">Name</p>
                <p className="font-semibold text-on-surface">{user.name}</p>
              </div>
              <div>
                <p className="text-on-surface-variant">Trade Skill</p>
                <p className="font-semibold text-on-surface">{user.skill} ({user.experience} yrs exp)</p>
              </div>
              <div className="col-span-2">
                <p className="text-on-surface-variant">Uploaded Document</p>
                <p className="font-mono text-[11px] text-primary truncate bg-surface-container px-2.5 py-1 rounded-lg mt-0.5 select-all">
                  {user.verificationDocument || 'No document attached'}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant animate-pulse">
            Checking status in real-time...
          </p>
        </motion.div>
      </div>
    );
  }

  // 2. Suspended state
  if (user.status === 'suspended') {
    return (
      <div className="bg-background min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 bg-surface-container-lowest/80 dark:bg-surface-container-low/60 backdrop-blur-xl border border-error/30 rounded-3xl shadow-2xl text-center space-y-5"
        >
          <div className="flex justify-center text-error">
            <span className="material-symbols-outlined text-6xl">gpp_bad</span>
          </div>
          <h2 className="font-display-lg text-headline-lg font-extrabold text-error">
            Account Suspended
          </h2>
          <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
            Your trade account has been temporarily suspended by an operations coordinator. 
            If you believe this is an error, please reach out to operations support.
          </p>
        </motion.div>
      </div>
    );
  }

  // 3. Active approved worker state
  return (
    <div className="bg-background min-h-screen py-8">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md border-b border-outline-variant/30 pb-stack-md">
          <div>
            <h1 className="font-display-lg text-3xl md:text-display-lg text-on-surface font-extrabold tracking-tight">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Professional {user.skill} Companion Hub
            </p>
          </div>
          
          {/* Availability Status controls */}
          <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant/40 px-5 py-2.5 rounded-2xl shadow-sm">
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-outline-variant">Dispatch Status</p>
              <p className="font-bold text-xs text-on-surface">{user.availability}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer scale-95 rounded-full focus-within:ring-2 focus-within:ring-primary">
              <input
                type="checkbox"
                checked={user.availability === 'Available'}
                disabled={user.availability === 'On Job'}
                onChange={() => toggleWorkerAvailability(user._id)}
                className="sr-only peer"
              />
              <div className={`w-9 h-5 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-primary ${
                user.availability === 'On Job' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-400 dark:hover:bg-slate-600'
              }`}></div>
            </label>
          </div>
        </div>

        {/* Bento stats grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <DashboardCard
            icon="payments"
            title="Wallet Balance"
            value={`$${user.wallet?.balance?.toFixed(2) || '0.00'}`}
            trend="Available"
            trendType="positive"
            footerLabel="Ready for withdrawal"
            largeIcon="payments"
          />
          <DashboardCard
            icon="event"
            title="Weekly Earnings"
            value={`$${user.wallet?.weekly?.toFixed(2) || '0.00'}`}
            trend="This week"
            trendType="neutral"
            footerLabel="Updated live"
            largeIcon="event"
          />
          <DashboardCard
            icon="work_outline"
            title="Job Earnings"
            value={`$${user.wallet?.jobEarnings?.toFixed(2) || '0.00'}`}
            trend="Base rates"
            trendType="neutral"
            footerLabel="Contract totals"
            largeIcon="work_outline"
          />
          <DashboardCard
            icon="monetization_on"
            title="Tips Received"
            value={`$${user.wallet?.tips?.toFixed(2) || '0.00'}`}
            trend="Customer tips"
            trendType="positive"
            footerLabel="100% goes to you"
            largeIcon="monetization_on"
          />
        </section>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          
          {/* Earnings Performance Chart (Span 2) */}
          <div className="lg:col-span-2">
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow-base p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                <h2 className="font-headline-md text-lg font-bold text-on-surface">Weekly Performance Trend</h2>
              </div>
              <div className="h-64 w-full relative">
                <JobPerformanceChart data={earningsTrend} />
              </div>
            </section>
          </div>

          {/* Profile Information & Details (Span 1) */}
          <div className="lg:col-span-1">
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow-base p-6 space-y-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="font-headline-md text-lg font-bold text-on-surface border-b border-outline-variant/20 pb-3 mb-4">
                  Profile Details
                </h2>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-on-surface-variant font-bold">Verification Document</label>
                    <div className="bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/20 flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                      <span className="font-mono text-on-surface truncate select-all">{user.verificationDocument}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-on-surface-variant font-bold">Bio Description</label>
                    <p className="text-on-surface mt-1 leading-relaxed bg-surface-container px-3 py-3 rounded-xl border border-outline-variant/20">
                      {user.description || 'No description added yet.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container px-4 py-4 rounded-xl border border-outline-variant/20 mt-4">
                <h4 className="font-bold text-xs text-primary mb-1">Active Job Companion</h4>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  Go to <a href="/worker/active-job" className="text-primary hover:underline font-bold">Applications & Active Job</a> to view navigation route coordinates and complete job steps.
                </p>
              </div>
            </section>
          </div>

        </div>

      </div>
    </div>
  );
}
