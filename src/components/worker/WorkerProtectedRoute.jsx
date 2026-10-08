import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getWorkerMeApi } from '../../services/workerApi';

export default function WorkerProtectedRoute({ children }) {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('worker_token') || localStorage.getItem('workkar_token');
  const location = useLocation();

  useEffect(() => {
    const fetchWorker = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getWorkerMeApi();
        setWorker(data);
      } catch (err) {
        console.error('Failed to fetch worker profile:', err);
        localStorage.removeItem('worker_token');
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="mt-4 text-slate-500 font-medium text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!token || !worker) {
    return <Navigate to="/worker/login" state={{ from: location }} replace />;
  }

  // Handle suspended/banned states first: send directly to dashboard where the suspension screen is rendered
  if (worker.status === 'suspended' || worker.status === 'banned') {
    if (location.pathname !== '/worker/dashboard') {
      return <Navigate to="/worker/dashboard" replace />;
    }
    return React.cloneElement(children, { worker, refetchWorker: async () => {
      try {
        const data = await getWorkerMeApi();
        setWorker(data);
      } catch (err) {
        console.error(err);
      }
    }});
  }

  const isLegacy = worker.role === 'worker' && worker.profileCompleted === undefined;

  const profileCompleted = isLegacy ? true : worker.profileCompleted;
  const verificationStatus = isLegacy ? 'approved' : worker.verificationStatus;
  const permissionsGranted = isLegacy ? true : (worker.locationPermission && worker.notificationPermission);

  // Onboarding Routing Flow:
  // 1. If permissions not granted, go to /worker/permissions
  if (!permissionsGranted) {
    if (location.pathname !== '/worker/permissions') {
      return <Navigate to="/worker/permissions" replace />;
    }
  }
  // 2. If profile is not completed, go to /worker/profile-setup
  else if (!profileCompleted) {
    if (location.pathname !== '/worker/profile-setup') {
      return <Navigate to="/worker/profile-setup" replace />;
    }
  }
  // 3. If profile is complete but status is pending, go to /worker/verification-pending
  else if (verificationStatus === 'pending') {
    if (location.pathname !== '/worker/verification-pending') {
      return <Navigate to="/worker/verification-pending" replace />;
    }
  }
  // 4. If verification status is approved, prevent access to onboarding steps and let them access dashboard
  else if (verificationStatus === 'approved') {
    const onboardingPaths = [
      '/worker/permissions',
      '/worker/profile-setup',
      '/worker/verification-pending'
    ];
    if (onboardingPaths.includes(location.pathname)) {
      return <Navigate to="/worker/dashboard" replace />;
    }
  }
  // 5. If verification status is rejected, go to /worker/profile-setup to correct and resubmit
  else if (verificationStatus === 'rejected') {
    if (location.pathname !== '/worker/profile-setup') {
      return <Navigate to="/worker/profile-setup" replace />;
    }
  }

  // Otherwise, pass worker details to the child component via a prop or standard children render
  return React.cloneElement(children, { worker, refetchWorker: async () => {
    try {
      const data = await getWorkerMeApi();
      setWorker(data);
    } catch (err) {
      console.error(err);
    }
  }});
}
