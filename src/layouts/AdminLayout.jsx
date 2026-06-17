import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import { NotificationToastList } from '../components/Modals';
import PageTransition from '../components/PageTransition';
import { useWorkkar } from '../context/WorkkarContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const { user, logout } = useWorkkar();
  const location = useLocation();

  const sidebarLinks = user?.role === 'supreme-admin'
    ? [
        { name: 'Dashboard', path: '/supreme-admin/dashboard', icon: 'admin_panel_settings', fill: true },
        { name: 'Client Website', path: '/', icon: 'storefront' }
      ]
    : [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard', fill: true },
        { name: 'Client Website', path: '/', icon: 'storefront' }
      ];

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-body-md antialiased">
      <div className="flex-grow grid grid-cols-1 md:grid-cols-[280px_1fr]">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col bg-surface-container-lowest border-r border-outline-variant/20 sticky top-0 h-screen z-10">
          <div className="p-stack-md flex items-center justify-between border-b border-outline-variant/20">
            <Link to="/" className="font-headline-md text-headline-md font-bold tracking-tight text-primary flex items-center gap-2">
              <span className="material-symbols-outlined fill text-primary">engineering</span>
              WORKKAR
              <span className="text-[9px] font-bold tracking-widest text-[#9d4300] bg-orange-100 px-1.5 py-0.5 rounded uppercase">Ops</span>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto py-stack-md px-stack-sm flex flex-col gap-unit">
            {sidebarLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg font-medium text-xs uppercase tracking-wider transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: link.fill ? "'FILL' 1" : undefined }}>
                  {link.icon}
                </span>
                {link.name}
              </NavLink>
            ))}
            
            <Link
              to="/"
              className="flex items-center gap-3 p-3 rounded-lg font-medium text-xs uppercase tracking-wider text-on-surface-variant hover:bg-surface-container hover:text-primary mt-auto"
            >
              <span className="material-symbols-outlined text-[20px]">exit_to_app</span>
              Client Site
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-col min-h-screen">
          {/* Top App Bar for Mobile & General Header */}
          <header className="bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20 shadow-sm px-margin-mobile md:px-margin-desktop py-4 flex justify-between items-center">
            <div className="flex items-center gap-stack-md">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-on-surface p-1 hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h1 className="font-headline-md text-headline-md font-semibold md:hidden">WORKKAR Admin</h1>
              <h1 className="font-headline-md text-headline-md font-bold hidden md:block text-on-surface text-xl">Overview</h1>
            </div>
            
            <div className="flex items-center gap-stack-md">
              <div className="hidden md:flex relative border border-outline-variant/50 rounded-lg w-64 items-center px-3 py-1.5 bg-surface">
                <span className="material-symbols-outlined text-outline text-[18px] mr-2">search</span>
                <input 
                  className="bg-transparent border-none outline-none text-xs w-full placeholder:text-outline-variant text-on-surface focus:ring-0 p-0" 
                  placeholder="Search workers, jobs..." 
                  type="text"
                />
              </div>
              
              <button className="relative p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse"></span>
              </button>
              
              {/* User Profile / Logout Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowPortalMenu(!showPortalMenu)}
                  className="flex items-center gap-2 bg-surface-container-low dark:bg-surface-container-high hover:bg-surface-container-high dark:hover:bg-surface-container border border-outline-variant/30 px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface"
                >
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[10px]">
                    {user?.textAvatar || (user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'AD')}
                  </div>
                  <span className="truncate max-w-[100px] hidden sm:inline">{user?.name ? user.name.split(' ')[0] : 'Admin'}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
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
                        <div className="px-4 py-2 border-b border-outline-variant/20 mb-1 text-left">
                          <p className="text-xs font-bold text-on-surface truncate">{user?.name}</p>
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
                          <span className="material-symbols-outlined text-[18px]">storefront</span>
                          Client Website
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setShowPortalMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface dark:text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">dashboard</span>
                            Admin Dashboard
                          </Link>
                        )}
                        {user?.role === 'supreme-admin' && (
                          <Link
                            to="/supreme-admin/dashboard"
                            onClick={() => setShowPortalMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface dark:text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">local_police</span>
                            Supreme Command
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setShowPortalMenu(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-error hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-outline-variant/10 mt-1.5 pt-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          Log Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <>
              <div className="fixed inset-0 bg-[#0b1c30]/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-2xl z-50 p-6 flex flex-col md:hidden">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined fill">engineering</span>
                    WORKKAR Admin
                  </span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface p-1 hover:bg-surface-container rounded-full">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="flex flex-col gap-2">
                  {sidebarLinks.map(link => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-lg font-medium text-xs uppercase tracking-wider transition-colors ${
                          isActive
                            ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                        }`
                      }
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: link.fill ? "'FILL' 1" : undefined }}>
                        {link.icon}
                      </span>
                      {link.name}
                    </NavLink>
                  ))}
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg font-medium text-xs uppercase tracking-wider text-on-surface-variant hover:bg-surface-container mt-8"
                  >
                    <span className="material-symbols-outlined text-[20px]">exit_to_app</span>
                    Client Site
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Main child viewport */}
          <div className="flex-1 flex flex-col p-4 md:p-8 max-w-container-max mx-auto w-full">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </div>
          
          <Footer />
        </div>
      </div>
      <NotificationToastList />
    </div>
  );
}
