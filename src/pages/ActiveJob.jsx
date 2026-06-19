import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkkar } from '../context/WorkkarContext';
import ChatBox from '../components/ChatBox';

export default function ActiveJob() {
  const {
    user,
    activeJob,
    jobsTimeline,
    incomingAlert,
    acceptJobOffer,
    declineJobOffer,
    startService,
    completeJob,
    toggleWorkerAvailability,
    addNotification
  } = useWorkkar();

  // Incoming offer timer countdown state
  const [countdown, setCountdown] = useState(105); // 1 minute 45 seconds

  useEffect(() => {
    let interval = null;
    if (incomingAlert) {
      setCountdown(105);
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            declineJobOffer(); // Auto decline on expire
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [incomingAlert]);

  const formatCountdown = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timeline UI renderer
  const renderTimeline = () => {
    return (
      <div className="relative pl-6 border-l-2 border-surface-variant flex flex-col gap-6 ml-2">
        {jobsTimeline.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < activeJob.step;
          const isActive = stepNum === activeJob.step;

          let iconStyle = "bg-surface border-2 border-outline";
          let iconContent = null;
          let labelStyle = "text-on-surface-variant opacity-50";

          if (isCompleted) {
            iconStyle = "bg-primary text-on-primary";
            iconContent = <span className="material-symbols-outlined text-[14px] fill">check</span>;
            labelStyle = "text-on-surface";
          } else if (isActive) {
            iconStyle = "bg-surface border-2 border-primary";
            iconContent = <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>;
            labelStyle = "text-primary font-bold";
          }

          return (
            <div key={step.step} className="relative">
              <div className={`absolute -left-[37px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-surface ${iconStyle}`}>
                {iconContent}
              </div>
              <h4 className={`font-title-md text-title-md ${labelStyle}`}>{step.label}</h4>
              <p className="font-body-md text-xs text-on-surface-variant">{isActive && activeJob.step === 2 ? 'Estimated arrival: 09:15 AM' : step.description}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* Render Alert view if booking offer is active */}
        <AnimatePresence mode="wait">
          {incomingAlert ? (
            <motion.div
              key="alert"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex justify-center items-center py-6"
            >
              <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header: Countdown & price */}
                <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/30">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-sm ${
                    countdown <= 30 
                      ? 'bg-error-container border-error text-error animate-pulse' 
                      : 'bg-error-container/20 border-error/20 text-error'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">timer</span>
                    <span>{formatCountdown(countdown)}</span>
                  </div>
                  
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Est. Earnings</span>
                    <span className="font-headline-lg text-headline-lg text-primary font-bold">${incomingAlert.total}</span>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-6 flex flex-col gap-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-lg bg-secondary-container/10 border border-secondary-container/20 flex items-center justify-center text-secondary-container shrink-0">
                      <span className="material-symbols-outlined">electrical_services</span>
                    </div>
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">{incomingAlert.skill}</h2>
                      <p className="font-body-md text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        Customer: {incomingAlert.customerName}
                      </p>
                    </div>
                  </div>

                  {/* Route Map */}
                  <div className="w-full h-[180px] rounded-xl border border-outline-variant/30 overflow-hidden relative shadow-sm">
                    <img
                      alt="Map Grid"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc0ocQNFJeJD-nNBm5OxVLiyZ8Oqqx97W9FUT-2LnpCphRtI9xWcVHdpysbXKEnmaGK3_x4QeqZ1wi25GDKGH0V_qvJqE6N9_7X46ZrvEdmvEJ7hbvMOTHLagkltJqH4_kSueVjr678d1bzsKjTEZzOsvDjVpkYDnuqKgArtPwG-mXYhs9VngwdyBdD6sig_llPnED6wOzfNjcCMq7NJrd9pp8CxXtLS5lZqQmLrCRK361nhf4afM9RaxymKhOm1XTFOIOJJ0NkXt4"
                    />
                  </div>

                  {/* Location Address */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                      <div>
                        <p className="font-title-md text-title-md text-on-surface font-semibold">Job Address</p>
                        <p className="font-body-md text-xs text-on-surface-variant">{incomingAlert.address}</p>
                      </div>
                    </div>
                    <span className="font-label-md text-xs bg-surface-container py-1 px-2.5 rounded border border-outline-variant/50 text-on-surface-variant shrink-0 font-bold">3.2 mi</span>
                  </div>

                  {/* Estimates Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface/80 p-3 rounded-lg border border-outline-variant/30 flex flex-col justify-center shadow-sm">
                      <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Travel Time</span>
                      <span className="font-title-md text-sm text-on-surface flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-[16px] text-primary">directions_car</span>
                        ~15 mins
                      </span>
                    </div>
                    <div className="bg-surface/80 p-3 rounded-lg border border-outline-variant/30 flex flex-col justify-center shadow-sm">
                      <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Est. Job Time</span>
                      <span className="font-title-md text-sm text-on-surface flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-[16px] text-primary">build</span>
                        1.5 hrs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-outline-variant/30 flex gap-3 bg-surface-container-low/40">
                  <button
                    onClick={declineJobOffer}
                    className="flex-1 py-3 border border-outline text-on-surface hover:bg-surface-container-low font-bold text-xs rounded-lg flex items-center justify-center gap-1 active:scale-98 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                    Decline
                  </button>
                  <button
                    onClick={acceptJobOffer}
                    className="flex-1 py-3 bg-primary text-on-primary font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow hover:bg-primary/90 active:scale-98 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 border-none"
                  >
                    <span className="material-symbols-outlined text-[18px] fill">check</span>
                    Accept Offer
                  </button>
                </div>
              </div>
            </motion.div>
          ) : activeJob ? (
            
            // Standard Active Job Dashboard view
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-gutter"
            >
              
              {/* Left Column: Route GPS Map & Info (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Header title */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-headline-lg text-2xl md:text-headline-md text-on-surface font-extrabold">
                      Active Job {activeJob.id}
                    </h1>
                    <p className="font-body-md text-sm text-on-surface-variant mt-0.5">{activeJob.skill}</p>
                  </div>
                  
                  <div className="bg-surface-container-high text-primary px-3 py-1 rounded-full font-label-md text-xs flex items-center gap-1.5 border border-primary/15 font-semibold">
                    <span className={`w-2 h-2 rounded-full bg-primary ${activeJob.step !== 4 ? 'animate-pulse' : ''}`}></span>
                    {activeJob.status}
                  </div>
                </div>

                {/* Map interface placeholder */}
                <div className="w-full h-[380px] bg-surface-container rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden relative">
                  <img
                    alt="Map Grid"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDFbGu0nTtYNT7O1EBV8pVoEhrjwhgtQYNboOsD8-qANqNIJy-156Ul1LpRDNyYHOeJjXr1xSfCtsIvxnWdW9eaVLPF-w4gbNx47VB67CGyB2cx8xPDapDkgmCSog3jtY_3755_h54-mRrfBcvdS3mbSV5Y7KzcWR9ihRnc9fGDZEiz1rYCDqzCFWwyu0RKtj4NBVTVyGB8fUm0AVudnV9NXmSpbRY8ZIS2sSUHZYRx0aF-6-49qZ4I6YT46cTHL37kqY7-B9C_YI4"
                  />
                  
                  {activeJob.step === 2 && (
                    <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md p-3 rounded-lg border border-outline-variant/20 shadow-md flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">directions_car</span>
                      </div>
                      <div>
                        <p className="font-title-md text-xs text-on-surface font-bold">12 mins away</p>
                        <p className="font-body-md text-[10px] text-on-surface-variant">3.4 miles remaining</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer card profile details */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      alt="Alex Mercer"
                      className="w-14 h-14 rounded-full object-cover border border-outline-variant/20 shadow-sm"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMLkQEkNAOqmwWe1yJclJp4Asb4IEHwH32A2gjyVYQYtyJWL-nBZvyK-uLD5f26R--aPYyj5zU4LGLNFu1rfHhH-7Mosw7EuAweDfvVUw4qaC4yXLMBE3H1uUWH_vrozhitHpWDJuuEr-kTQz43lokuX4g9SKJj3U64Mnirt5JL9HhgmjJ1dZfNLHq6sNlCBcuDG0AFUSpZJD5k2uv_HZR3VXT7EP2nJcIWENmATqTrZzr6qyW5L20nRU6h36LTi94tWeoTwQitImv"
                    />
                    <div>
                      <h2 className="font-title-md text-on-surface font-bold leading-tight">{activeJob.customerName}</h2>
                      <div className="flex items-center gap-0.5 text-on-surface-variant mt-1 text-xs">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <p className="font-body-md">{activeJob.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => addNotification(`Calling customer ${activeJob.customerName}...`, 'success')}
                      className="bg-surface-container-high hover:bg-surface-variant text-primary p-2.5 rounded-lg flex items-center justify-center transition-colors border border-outline-variant/10 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[20px]">call</span>
                    </button>
                  </div>
                </div>

                {/* Live Chat Box */}
                <ChatBox 
                  jobId={activeJob.id} 
                  currentUserId={user._id} 
                  title={`Chat with Client (${activeJob.customerName})`} 
                />

              </div>

              {/* Right Column: Tracking timeline & bill receipt (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Timeline Card */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-5 flex flex-col">
                  <h3 className="font-title-md text-on-surface font-bold border-b border-outline-variant/20 pb-3 mb-5 uppercase tracking-wider text-xs">
                    Job Timeline
                  </h3>
                  {renderTimeline()}
                </div>

                {/* Bill Card Details */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-5 flex flex-col gap-3">
                  <h3 className="font-title-md text-on-surface font-bold border-b border-outline-variant/20 pb-3 mb-2 uppercase tracking-wider text-xs">
                    Bill Details
                  </h3>
                  
                  <div className="flex justify-between items-center text-on-surface-variant font-body-md text-xs">
                    <span>Base Service Fee</span>
                    <span>${activeJob.base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-on-surface-variant font-body-md text-xs">
                    <span>Taxes & Fees</span>
                    <span>${activeJob.tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-outline-variant/20 pt-3 mt-2 flex justify-between items-center">
                    <span className="font-bold text-on-surface text-sm">Total Est. Earnings</span>
                    <span className="font-headline-md text-primary font-extrabold">${activeJob.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Progress Buttons actions */}
                <div className="flex flex-col gap-2">
                  {activeJob.step === 2 && (
                    <button
                      onClick={startService}
                      className="w-full bg-primary hover:bg-primary/90 text-on-primary py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 border-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                      Start Service
                    </button>
                  )}

                  {activeJob.step === 3 && (
                    <button
                      onClick={completeJob}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-on-primary py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 border-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">task_alt</span>
                      Complete Job
                    </button>
                  )}

                  {activeJob.step === 4 && (
                    <div className="w-full bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-center">
                      <div className="w-3.5 h-3.5 border-2 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                      Pending Client Approval
                    </div>
                  )}

                  {activeJob.step !== 4 && (
                    <button 
                      onClick={() => addNotification("Emergency contact triggered. Support coordinator notified.", "warning")}
                      className="w-full py-2.5 text-secondary hover:text-secondary/80 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200 font-bold text-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary dark:focus-visible:ring-orange-400 rounded-lg"
                    >
                      Can't reach customer?
                    </button>
                  )}
                </div>

              </div>

            </motion.div>
          ) : (
            // Active Dispatch Radar screen
            <motion.div
              key="radar"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex justify-center items-center py-12"
            >
              <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant/40 rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                {/* Decorative glowing background gradients */}
                <div className="absolute -top-16 -left-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col items-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-primary bg-primary-container/30 px-3 py-1 rounded-full uppercase">
                    Companion Terminal
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">
                    Active Dispatch Radar
                  </h2>
                </div>

                {/* Pulse Radar Animation */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {user?.availability === 'Available' ? (
                    <>
                      {/* Pulse rings */}
                      <motion.div
                        animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
                        className="absolute w-20 h-20 rounded-full border-2 border-primary/30"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                        transition={{ repeat: Infinity, duration: 3, delay: 1, ease: "easeOut" }}
                        className="absolute w-20 h-20 rounded-full border-2 border-primary/25"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                        transition={{ repeat: Infinity, duration: 3, delay: 2, ease: "easeOut" }}
                        className="absolute w-20 h-20 rounded-full border-2 border-primary/20"
                      />
                      {/* Radar sweep */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute w-44 h-44 rounded-full border border-dashed border-outline-variant/40 flex items-center justify-center"
                      >
                        <div className="absolute top-0 w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary"></div>
                      </motion.div>
                    </>
                  ) : (
                    <div className="absolute w-44 h-44 rounded-full border border-dashed border-outline-variant/40 flex items-center justify-center opacity-50" />
                  )}

                  {/* Core icon */}
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-350 z-10 ${
                    user?.availability === 'Available'
                      ? 'bg-primary text-on-primary ring-8 ring-primary/10 shadow-primary/20'
                      : 'bg-surface-container-high text-on-surface-variant ring-8 ring-surface-container-low'
                  }`}>
                    <span className={`material-symbols-outlined text-[36px] ${user?.availability === 'Available' ? 'animate-pulse' : ''}`}>
                      {user?.availability === 'Available' ? 'radar' : 'sensors_off'}
                    </span>
                  </div>
                </div>

                {/* Status description */}
                <div className="space-y-2 max-w-sm">
                  {user?.availability === 'Available' ? (
                    <>
                      <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        Radar Online
                      </h3>
                      <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                        Listening for dispatch signals. Keep this page open or stay active. When a client books you, a booking alert with a 1m 45s accept timer will slide in here automatically.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-sm text-on-surface-variant/70">
                        Radar Offline
                      </h3>
                      <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                        You are currently offline. Switch your status below to **Available** to start receiving real-time booking alerts from clients.
                      </p>
                    </>
                  )}
                </div>

                {/* Availability Toggle */}
                <div className="bg-surface-container-low border border-outline-variant/30 px-5 py-3 rounded-2xl shadow-sm w-full flex items-center justify-between text-left transition-colors duration-250">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Your Status</p>
                    <p className="font-extrabold text-xs text-on-surface mt-0.5">{user?.availability || 'Offline'}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer scale-95 rounded-full focus-within:ring-2 focus-within:ring-primary">
                    <input
                      type="checkbox"
                      checked={user?.availability === 'Available'}
                      disabled={user?.availability === 'On Job'}
                      onChange={() => toggleWorkerAvailability(user?._id)}
                      className="sr-only peer"
                    />
                    <div className={`w-9 h-5 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-primary ${
                      user?.availability === 'On Job' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-400 dark:hover:bg-slate-600'
                    }`}></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
