import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, UserCheck } from 'lucide-react';
import { loginWorkerApi } from '../../services/workerApi';
import { useWorkkar } from '../../context/WorkkarContext';

export default function WorkerLogin() {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { setWorkerToken } = useWorkkar();

  // Load Remember Me data
  useEffect(() => {
    const savedEmailOrMobile = localStorage.getItem('worker_remembered_email');
    if (savedEmailOrMobile) {
      setEmailOrMobile(savedEmailOrMobile);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginWorkerApi(emailOrMobile, password);

      // Save token in localStorage
      localStorage.setItem('worker_token', data.token);
      setWorkerToken(data.token);

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('worker_remembered_email', emailOrMobile);
      } else {
        localStorage.removeItem('worker_remembered_email');
      }

      // Successful login redirect
      navigate('/worker/permissions');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center"
        >
          {/* Logo Icon */}
          <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-extrabold text-2xl tracking-tight mb-4">
            W
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            WORKKAR <span className="text-orange-500 font-medium">Partner</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Sign in to start matching with jobs in your area
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl shadow-slate-100 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-800"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl p-4"
              >
                {error}
              </motion.div>
            )}

            {/* Email / Mobile */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Email Address or Mobile Number
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="name@example.com or 9876543210"
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span
                  onClick={() => alert("Please contact Workkar admin support to reset your partner password.")}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 cursor-pointer"
                >
                  Forgot password?
                </span>
              </div>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm text-slate-900 dark:text-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Remember Me
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-blue-500/10"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <UserCheck size={18} />
                    Sign In
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-semibold">
                  New to Workkar?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/worker/register"
                className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full"
              >
                Create Partner Account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
