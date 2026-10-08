import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkkar } from '../context/WorkkarContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { incomingAlert, darkMode, toggleDarkMode, user, logout } = useWorkkar();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLanguageChange = (e) => {
    const langCode = e.target.value;
    const selectEl = document.querySelector('.goog-te-combo');
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event('change'));
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Workers', path: '/workers' },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 pt-4 pb-2 ${scrolled ? 'bg-background/95 backdrop-blur-xl border-b border-outline-variant/30 pt-2 pb-2 shadow-lg' : 'bg-transparent'}`}>
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-2 max-w-[1400px] mx-auto">
        {/* Brand logo */}
        <Link 
          to="/" 
          className="font-display-lg text-2xl text-white flex items-center gap-2 font-extrabold tracking-tight hover:opacity-95 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-[#fd761a] flex items-center justify-center shadow-[0_0_15px_rgba(253,118,26,0.5)]">
            <span className="text-white font-bold text-sm">w</span>
          </div>
          Workkar
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center bg-[#0d142b]/60 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/5">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `font-bold text-sm px-5 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Action controls / dropdown selector */}
        <div className="flex items-center gap-3">
          
          {/* Language Selector */}
          <select 
            className="hidden md:block bg-[#0d142b]/60 backdrop-blur-md text-white border border-white/5 rounded-full px-4 py-2.5 text-sm font-bold focus:outline-none cursor-pointer appearance-none pr-8 relative"
            onChange={handleLanguageChange}
            defaultValue="en"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.7rem top 50%',
              backgroundSize: '0.65rem auto'
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
            <option value="bn">বাংলা</option>
            <option value="te">తెలుగు</option>
            <option value="ta">தமிழ்</option>
            <option value="gu">ગુજરાતી</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="ml">മലയാളം</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
            <option value="ur">اردو</option>
          </select>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[#0d142b]/60 backdrop-blur-md text-white hover:bg-[#152042] border border-white/5 transition-all"
            aria-label="Toggle Dark Mode"
            title="Toggle Light/Dark Theme"
          >
            <span className="material-symbols-outlined notranslate text-[18px] font-bold">
              {darkMode ? 'light_mode' : 'contrast'}
            </span>
          </button>

          {/* User Auth Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowPortalMenu(!showPortalMenu)}
                className="hidden md:flex items-center gap-2 bg-surface-container-low dark:bg-surface-container-high hover:bg-surface-container-high dark:hover:bg-surface-container border border-outline-variant/30 px-3.5 py-2 rounded-full transition-all duration-200 active:scale-95 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface relative"
              >
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[10px]">
                  {user.textAvatar || (user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'WK')}
                </div>
                <span className="truncate max-w-[100px]">{user.name ? user.name.split(' ')[0] : 'Partner'}</span>
                <span className="material-symbols-outlined notranslate text-[16px]">arrow_drop_down</span>
                {user.notifications && user.notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
                  </span>
                )}
              </button>

              {incomingAlert && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                </span>
              )}

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
                        <p className="text-xs font-bold text-on-surface truncate">{user.name || 'Partner'}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
                        <span className="mt-1 inline-block text-[8px] font-bold tracking-wider bg-primary-container text-on-primary-container px-2 py-0.5 rounded uppercase">
                          {user.role}
                        </span>
                      </div>
                      
                      <Link
                        to="/"
                        onClick={() => setShowPortalMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface dark:text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined notranslate text-[18px]">storefront</span>
                        Client Website
                      </Link>

                      {['customer', 'admin', 'supreme-admin'].includes(user.role) && (
                        <Link
                          to="/dashboard"
                          onClick={() => setShowPortalMenu(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-on-surface dark:text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors border-b border-outline-variant/10 pb-2 mb-1"
                        >
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined notranslate text-[18px] text-primary">dashboard</span>
                            Customer Dashboard
                          </span>
                          {user.notifications && user.notifications.some(n => !n.read) && (
                            <span className="h-2 w-2 rounded-full bg-error animate-pulse"></span>
                          )}
                        </Link>
                      )}

                      {user.role === 'worker' && (
                        <Link
                          to="/worker/dashboard"
                          onClick={() => setShowPortalMenu(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-on-surface dark:text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined notranslate text-[18px] text-primary">engineering</span>
                            Worker Companion
                          </span>
                          {incomingAlert && (
                            <span className="bg-error-container text-on-error-container text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">New offer</span>
                          )}
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setShowPortalMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface dark:text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined notranslate text-[18px] text-secondary">admin_panel_settings</span>
                          Coordinator Panel
                        </Link>
                      )}

                      {user.role === 'supreme-admin' && (
                        <Link
                          to="/supreme-admin/dashboard"
                          onClick={() => setShowPortalMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface dark:text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined notranslate text-[18px] text-secondary">local_police</span>
                          Supreme Command
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setShowPortalMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-error hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-outline-variant/10 mt-1"
                      >
                        <span className="material-symbols-outlined notranslate text-[18px]">logout</span>
                        Log Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/worker/login"
                className="hidden md:flex items-center gap-1.5 font-bold text-sm tracking-wide bg-[#0d142b]/60 backdrop-blur-md text-white border border-white/5 hover:bg-[#152042] px-5 py-2.5 rounded-full transition-all duration-200"
              >
                Worker portal
              </Link>
              <Link
                to="/login"
                className="hidden md:flex items-center justify-center font-bold text-sm tracking-wide bg-blue-600 text-white hover:bg-blue-500 px-6 py-2.5 rounded-full transition-all duration-200 shadow-[0_0_15px_rgba(37,99,235,0.6)]"
              >
                Sign in
              </Link>
            </div>
          )}

          {user && user.role === 'worker' && (
            <Link
              to="/worker/dashboard"
              className="font-bold text-label-md bg-primary text-on-primary px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:bg-primary/95 transition-all duration-200 active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              Worker App
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-on-surface-variant p-2 hover:bg-surface-container rounded-full transition-colors"
          >
            <span className="material-symbols-outlined notranslate">{isOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-on-surface z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 h-full w-72 bg-surface-container-lowest shadow-2xl z-50 flex flex-col p-6 border-l border-outline-variant/20"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-headline-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined notranslate fill text-primary">engineering</span>
                  WORKKAR Menu
                </span>
                <button
                  onClick={toggleMenu}
                  className="text-on-surface-variant p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined notranslate">close</span>
                </button>
              </div>

              <nav className="flex flex-col gap-5 mb-8">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={toggleMenu}
                    className={({ isActive }) =>
                      `font-bold text-lg transition-colors py-1 ${
                        isActive ? 'text-primary' : 'text-on-surface-variant'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </nav>

              <div className="border-t border-outline-variant/30 pt-6 mt-auto flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="px-2 py-1 mb-2">
                      <p className="text-sm font-bold text-on-surface truncate">{user.name || 'Partner'}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/"
                      onClick={toggleMenu}
                      className="flex items-center gap-2 p-3 bg-surface-container-low hover:bg-surface-container rounded-xl text-sm font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined notranslate text-[20px]">storefront</span>
                      Client Website
                    </Link>

                    {['customer', 'admin', 'supreme-admin'].includes(user.role) && (
                      <Link
                        to="/dashboard"
                        onClick={toggleMenu}
                        className="flex items-center justify-between p-3 bg-surface-container-low hover:bg-surface-container rounded-xl text-sm font-semibold transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined notranslate text-[20px] text-primary">dashboard</span>
                          Customer Dashboard
                        </span>
                        {user.notifications && user.notifications.some(n => !n.read) && (
                          <span className="bg-error text-white text-[8px] font-bold px-1.5 py-0.5 rounded">New</span>
                        )}
                      </Link>
                    )}

                    {user.role === 'worker' && (
                      <Link
                        to="/worker/dashboard"
                        onClick={toggleMenu}
                        className="flex items-center justify-between p-3 bg-surface-container-low hover:bg-surface-container rounded-xl text-sm font-semibold transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined notranslate text-[20px] text-primary">engineering</span>
                          Worker Companion
                        </span>
                        {incomingAlert && (
                          <span className="bg-error text-white text-[8px] font-bold px-1.5 py-0.5 rounded">New</span>
                        )}
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={toggleMenu}
                        className="flex items-center gap-2 p-3 bg-surface-container-low hover:bg-surface-container rounded-xl text-sm font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined notranslate text-[20px] text-secondary">admin_panel_settings</span>
                        Coordinator Panel
                      </Link>
                    )}

                    {user.role === 'supreme-admin' && (
                      <Link
                        to="/supreme-admin/dashboard"
                        onClick={toggleMenu}
                        className="flex items-center gap-2 p-3 bg-surface-container-low hover:bg-surface-container rounded-xl text-sm font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined notranslate text-[20px] text-secondary">local_police</span>
                        Supreme Command
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        toggleMenu();
                        logout();
                      }}
                      className="w-full flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-error hover:bg-red-100 rounded-xl text-sm font-bold transition-colors mt-2"
                    >
                      <span className="material-symbols-outlined notranslate text-[20px]">logout</span>
                      Log Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/worker/login"
                      onClick={toggleMenu}
                      className="flex items-center justify-center gap-2 p-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-bold transition-colors"
                    >
                      Worker Portal
                    </Link>
                    <Link
                      to="/login"
                      onClick={toggleMenu}
                      className="flex items-center justify-center gap-2 p-3 bg-primary text-on-primary hover:bg-primary/90 rounded-xl text-sm font-bold transition-colors"
                    >
                      <span className="material-symbols-outlined notranslate text-[20px]">login</span>
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

