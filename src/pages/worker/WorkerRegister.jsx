import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import { registerWorkerApi } from '../../services/workerApi';
import { useWorkkar } from '../../context/WorkkarContext';

export default function WorkerRegister() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const navigate = useNavigate();
  const { setWorkerToken } = useWorkkar();

  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!mobile) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobile)) {
      errors.mobile = 'Mobile number must be exactly 10 digits';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    if (!validate()) return;

    setLoading(true);

    try {
      const data = await registerWorkerApi(email, mobile, password, confirmPassword);
      
      // Store token
      localStorage.setItem('worker_token', data.token);
      setWorkerToken(data.token);

      // Redirect to next onboarding step (Permissions)
      navigate('/worker/permissions');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else {
        setGeneralError(
          err.response?.data?.message || 'Registration failed. Please try again.'
        );
      }
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
          <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-extrabold text-2xl tracking-tight mb-4">
            W
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Register as a Partner
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Join WORKKAR network and get nearby service requests
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
          <form className="space-y-5" onSubmit={handleSubmit}>
            {generalError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl p-4"
              >
                {generalError}
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    fieldErrors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500 dark:focus:ring-blue-400'
                  } bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm text-slate-900 dark:text-white transition-all`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-semibold">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Mobile Number
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    fieldErrors.mobile
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500 dark:focus:ring-blue-400'
                  } bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm text-slate-900 dark:text-white transition-all`}
                />
              </div>
              {fieldErrors.mobile && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-semibold">
                  {fieldErrors.mobile}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border ${
                    fieldErrors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500 dark:focus:ring-blue-400'
                  } bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm text-slate-900 dark:text-white transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-semibold">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border ${
                    fieldErrors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500 dark:focus:ring-blue-400'
                  } bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm text-slate-900 dark:text-white transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-semibold">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Register
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
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/worker/login"
                className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full"
              >
                Sign In Instead
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
