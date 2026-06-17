import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { NotificationToastList } from '../components/Modals';
import PageTransition from '../components/PageTransition';

export default function ClientLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
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
