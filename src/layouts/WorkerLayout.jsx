import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import { NotificationToastList, WithdrawModal } from '../components/Modals';
import { useWorkkar } from '../context/WorkkarContext';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Wrench, ChevronDown, ExternalLink, LogOut } from 'lucide-react';

export default function WorkerLayout() {
  const { incomingAlert, darkMode, toggleDarkMode, user, logout } = useWorkkar();
  const location = useLocation();
  const [showPortalMenu, setShowPortalMenu] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'WK';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Area */}
      <header className="bg-surface-container-lowest/90 dark:bg-surface-container-lowest/95 backdrop-blur-md sticky top-0 w-full z-50 border-b border-outline-variant/30 shadow-sm transition-colors duration-250">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          {/* Brand */}
          <Link to="/" className="font-headline-md text-headline-md font-extrabold tracking-tight text-primary dark:text-primary-fixed-dim flex items-center gap-2 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 rounded-lg p-1">
            <Wrench className="text-primary w-5 h-5" />
            WORKKAR
            <span className="text-[10px] font-bold tracking-widest text-secondary-container bg-secondary-fixed/50 px-2 py-0.5 rounded uppercase">Worker</span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-on-surface-variant dark:text-on-surface-variant font-semibold hover:text-primary dark:hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 rounded px-2 py-1"
            >
              Home
            </Link>
            <NavLink 
              to="/worker/dashboard" 
              className={({ isActive }) => 
                `font-semibold transition-all duration-200 border-b-2 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 rounded px-2 py-1 ${
                  isActive 
                    ? 'text-primary dark:text-white border-primary dark:border-white font-bold' 
                    : 'text-on-surface-variant dark:text-on-surface-variant border-transparent hover:text-primary dark:hover:text-white'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/worker/active-job" 
              className={({ isActive }) => 
                `font-semibold transition-all duration-200 border-b-2 pb-1 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 rounded px-2 py-1 ${
                  isActive 
                    ? 'text-primary dark:text-white border-primary dark:border-white font-bold' 
                    : 'text-on-surface-variant dark:text-on-surface-variant border-transparent hover:text-primary dark:hover:text-white'
                }`
              }
            >
              Applications
              {incomingAlert && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
                </span>
              )}
            </NavLink>
            <NavLink 
              to="/worker/earnings" 
              className={({ isActive }) => 
                `font-semibold transition-all duration-200 border-b-2 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 rounded px-2 py-1 ${
                  isActive 
                    ? 'text-primary dark:text-white border-primary dark:border-white font-bold' 
                    : 'text-on-surface-variant dark:text-on-surface-variant border-transparent hover:text-primary dark:hover:text-white'
                }`
              }
            >
              Earnings
            </NavLink>
          </nav>

          {/* Actions & Theme Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant hover:text-primary dark:text-on-surface-variant dark:hover:text-white border border-outline-variant/30 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400"
              aria-label="Toggle Dark Mode"
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Profile / Portal Selector */}
            <div className="relative">
              <button
                onClick={() => setShowPortalMenu(!showPortalMenu)}
                className="flex items-center gap-2 bg-surface-container-low dark:bg-surface-container-high hover:bg-surface-container-high dark:hover:bg-surface-container border border-outline-variant/30 px-3.5 py-2 rounded-full transition-all duration-200 active:scale-95 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface"
              >
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[10px]">
                  {user?.textAvatar || getInitials(user?.name)}
                </div>
                <span className="truncate max-w-[100px]">{user?.name ? user.name.split(' ')[0] : 'Partner'}</span>
                <ChevronDown size={16} />
              </button>

              <AnimatePresence>
                {showPortalMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowPortalMenu(false)}></div>
                    <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 10 }}
                       className="absolute right-0 mt-2 w-56 bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-xl z-20 py-2"
                    >
                      <div className="px-4 py-2 border-b border-outline-variant/20 mb-1">
                        <p className="text-xs font-bold text-on-surface truncate">{user?.name || 'Partner'}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
                        <span className="mt-1 inline-block text-[8px] font-bold tracking-wider bg-primary-container text-on-primary-container px-2 py-0.5 rounded uppercase">
                          {user?.role}
                        </span>
                      </div>
                      <Link
                        to="/"
                        onClick={() => setShowPortalMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface dark:text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                      >
                        <ExternalLink size={14} />
                        Client Website
                      </Link>
                      <Link
                        to="/worker/dashboard"
                        onClick={() => setShowPortalMenu(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-on-surface dark:text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Wrench size={14} className="text-primary" />
                          Worker Operations
                        </span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowPortalMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-error hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-outline-variant/10 mt-1"
                      >
                        <LogOut size={14} />
                        Log Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-outline-variant/20 bg-surface dark:bg-surface-container-lowest flex justify-around py-3 font-semibold text-xs tracking-wider transition-colors duration-250">
          <Link to="/" className="text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-white px-2 py-1">Home</Link>
          <NavLink 
            to="/worker/dashboard" 
            className={({ isActive }) => isActive ? 'text-primary dark:text-white font-bold border-b-2 border-primary dark:border-white px-2 py-1' : 'text-on-surface-variant dark:text-on-surface-variant px-2 py-1'}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/worker/active-job" 
            className={({ isActive }) => `flex items-center gap-1 px-2 py-1 ${isActive ? 'text-primary dark:text-white font-bold border-b-2 border-primary dark:border-white' : 'text-on-surface-variant dark:text-on-surface-variant'}`}
          >
            Applications
            {incomingAlert && <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>}
          </NavLink>
          <NavLink 
            to="/worker/earnings" 
            className={({ isActive }) => isActive ? 'text-primary dark:text-white font-bold border-b-2 border-primary dark:border-white px-2 py-1' : 'text-on-surface-variant dark:text-on-surface-variant px-2 py-1'}
          >
            Earnings
          </NavLink>
        </div>
      </header>

      {/* Main Content Layout Container */}
      <main className="flex-grow">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>

      <Footer />
      <NotificationToastList />
    </div>
  );
}

