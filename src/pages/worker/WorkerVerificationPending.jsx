import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';
import ProgressStepper from '../../components/worker/ProgressStepper';
import { useWorkkar } from '../../context/WorkkarContext';

export default function WorkerVerificationPending({ worker }) {
  const navigate = useNavigate();
  const { logout } = useWorkkar();

  const handleLogout = () => {
    logout();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        
        {/* Stepper */}
        <ProgressStepper currentStep={4} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-100 dark:shadow-none mt-10 text-center space-y-6"
        >
          {/* Status Icon */}
          <div className="relative mx-auto w-20 h-20 bg-blue-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Clock size={40} className="animate-spin-slow" />
            <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full p-1.5 border-4 border-white dark:border-slate-900">
              <ShieldAlert size={14} />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Verification in Progress
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
              Your profile has been submitted successfully and is waiting for admin verification.
            </p>
          </div>

          {/* Guidelines / Details Box */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-6 text-left text-sm space-y-4 max-w-lg mx-auto">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-orange-500" />
              What happens next?
            </h3>
            
            <ul className="space-y-3 text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Our administrators will verify your uploaded Aadhaar and PAN documents against your registration profile.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Once approved, your account verification status will change to <strong className="text-emerald-600 dark:text-emerald-400">APPROVED</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Only after approval will you start receiving nearby job matching requests on your Partner Dashboard.</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 max-w-md mx-auto">
            <button
              onClick={handleRefresh}
              className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer text-sm"
            >
              Check Review Status
            </button>

            <button
              onClick={handleLogout}
              className="py-3 px-6 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
