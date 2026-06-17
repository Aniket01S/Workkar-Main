import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkkar } from '../context/WorkkarContext';
import { motion } from 'framer-motion';

export default function Login() {
  const { login, loginWithGoogle, register, user, addNotification } = useWorkkar();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'worker' ? 'worker' : 'customer';
  const redirect = searchParams.get('redirect') || '/';

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('customer'); // Locked to customer, workers use partner portal
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [skill, setSkill] = useState('Electrician');
  const [rate, setRate] = useState('');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [verificationDocument, setVerificationDocument] = useState(''); // Simulated file upload

  useEffect(() => {
    if (user) {
      if (user.role === 'worker') {
        navigate('/worker/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'supreme-admin') {
        navigate('/supreme-admin/dashboard');
      } else {
        navigate(redirect);
      }
    }
  }, [user, navigate, redirect]);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';

  useEffect(() => {
    const hasRealClientId = googleClientId && !googleClientId.includes('your-google-client-id');
    if (!hasRealClientId || !isLogin || role !== 'customer') return;

    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            setLoading(true);
            try {
              const success = await loginWithGoogle(response.credential);
              if (success) {
                addNotification('Welcome to Workkar via Google!', 'success');
              }
            } catch (err) {
              addNotification(err.message || 'Google authentication failed', 'error');
            } finally {
              setLoading(false);
            }
          }
        });
        const btnDiv = document.getElementById('google-signin-div');
        if (btnDiv) {
          window.google.accounts.id.renderButton(
            btnDiv,
            { theme: 'outline', size: 'large', width: '100%' }
          );
        }
      }
    };

    if (window.google) {
      const timer = setTimeout(initGoogle, 100);
      return () => clearTimeout(timer);
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(initGoogle, 100);
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [googleClientId, isLogin, role]);

  const handleMockGoogleLogin = async () => {
    try {
      setLoading(true);
      const mockEmail = 'mockgoogle@workkar.com';
      const mockName = 'Mock Google User';
      const mockToken = `mock-google-token|${mockEmail}|${mockName}`;
      
      const success = await loginWithGoogle(mockToken);
      if (success) {
        addNotification('Logged in with Mock Google Account!', 'success');
      }
    } catch (error) {
      addNotification(error.message || 'Mock Google login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) {
          addNotification('Welcome back to Workkar!', 'success');
        }
      } else {
        const formData = {
          name,
          email,
          password,
          role,
          address,
          phone,
          skill,
          rate,
          experience,
          description,
          verificationDocument,
        };
        const success = await register(formData);
        if (success) {
          if (role === 'worker') {
            addNotification('Registration successful! Profile and documents sent for coordinator verification.', 'success');
            setIsLogin(true);
          } else {
            addNotification('Registration successful! Welcome to Workkar.', 'success');
          }
        }
      }
    } catch (error) {
      addNotification(error.message || 'Authentication failed. Please check your inputs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const skillsList = ['Electrician', 'Plumber', 'Mason', 'Painter', 'Carpenter', 'Cleaner', 'Welder', 'Gardener'];

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-surface-container-lowest via-surface-container-low to-surface-container-high transition-colors duration-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 p-8 bg-surface-container-lowest/80 dark:bg-surface-container-low/60 backdrop-blur-xl border border-outline-variant/30 rounded-3xl shadow-2xl"
      >
        <div>
          <div className="flex justify-center text-primary">
            <span className="material-symbols-outlined text-5xl fill">engineering</span>
          </div>
          <h2 className="mt-4 text-center font-headline-md text-headline-md font-extrabold tracking-tight text-on-surface">
            {isLogin ? 'Sign in to WORKKAR' : 'Create your Account'}
          </h2>
          <p className="mt-2 text-center text-body-md text-on-surface-variant">
            {isLogin ? "Welcome back! Enter details to log in." : "Join our platform and get started today."}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface/50 dark:bg-surface-container-low/50 text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 transition-all text-sm"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface/50 dark:bg-surface-container-low/50 text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface/50 dark:bg-surface-container-low/50 text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            {/* Custom fields based on role & register status */}
            {!isLogin && role === 'customer' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="address">
                    Service Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface/50 dark:bg-surface-container-low/50 text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 transition-all text-sm"
                    placeholder="123 Main St, Springfield"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface/50 dark:bg-surface-container-low/50 text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 transition-all text-sm"
                    placeholder="555-0199"
                  />
                </div>
              </>
            )}

            {!isLogin && role === 'worker' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="skill">
                    Professional Skill
                  </label>
                  <select
                    id="skill"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface/50 dark:bg-surface-container-low/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 transition-all text-sm"
                  >
                    {skillsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="rate">
                    Hourly Rate ($)
                  </label>
                  <input
                    id="rate"
                    type="number"
                    required
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface/50 dark:bg-surface-container-low/50 text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 transition-all text-sm"
                    placeholder="25"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="experience">
                    Experience (Years)
                  </label>
                  <input
                    id="experience"
                    type="number"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface/50 dark:bg-surface-container-low/50 text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 transition-all text-sm"
                    placeholder="5"
                  />
                </div>
                
                {/* Verification Documents Upload Input */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="verification">
                    Verification Document
                  </label>
                  <input
                    id="verification"
                    type="text"
                    required
                    value={verificationDocument}
                    onChange={(e) => setVerificationDocument(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface/50 dark:bg-surface-container-low/50 text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 transition-all text-sm"
                    placeholder="e.g. License ID number, certificate URL"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="description">
                    Professional Bio
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface/50 dark:bg-surface-container-low/50 text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 transition-all text-sm h-20 resize-none"
                    placeholder="Explain your expertise and background..."
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-2xl text-on-primary bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-blue-400 dark:focus:ring-offset-slate-900 shadow-lg hover:shadow-xl active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Sign In' : 'Register'
              )}
            </button>
          </div>
        </form>

        {isLogin && role === 'customer' && (
          <div className="mt-6">
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-outline-variant/30 w-full"></div>
              <span className="absolute bg-surface-container-lowest dark:bg-surface-container-low px-3 text-xs text-on-surface-variant font-medium">
                Or continue with
              </span>
            </div>
            
            {googleClientId && !googleClientId.includes('your-google-client-id') ? (
              <div id="google-signin-div" className="w-full flex justify-center"></div>
            ) : (
              <button
                type="button"
                onClick={handleMockGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant/50 rounded-2xl text-sm font-semibold text-on-surface bg-surface hover:bg-surface-container-low focus:outline-none transition-all active:scale-98 shadow-sm cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google (Demo)
              </button>
            )}
          </div>
        )}

        <div className="text-center mt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-semibold text-primary hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
          {isLogin && (
            <p className="text-[11px] text-on-surface-variant mt-2 border-t border-outline-variant/10 pt-3">
              Admins & Supreme Admins must log in using the Client form.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
