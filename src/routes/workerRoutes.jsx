import React from 'react';
import { Route } from 'react-router-dom';
import WorkerLogin from '../pages/worker/WorkerLogin';
import WorkerRegister from '../pages/worker/WorkerRegister';
import WorkerPermissions from '../pages/worker/WorkerPermissions';
import WorkerProfileSetup from '../pages/worker/WorkerProfileSetup';
import WorkerVerificationPending from '../pages/worker/WorkerVerificationPending';
import WorkerProtectedRoute from '../components/worker/WorkerProtectedRoute';

export const getWorkerRoutes = () => {
  return (
    <>
      <Route path="/worker/login" element={<WorkerLogin />} />
      <Route path="/worker/register" element={<WorkerRegister />} />
      
      <Route
        path="/worker/permissions"
        element={
          <WorkerProtectedRoute>
            <WorkerPermissions />
          </WorkerProtectedRoute>
        }
      />
      
      <Route
        path="/worker/profile-setup"
        element={
          <WorkerProtectedRoute>
            <WorkerProfileSetup />
          </WorkerProtectedRoute>
        }
      />
      
      <Route
        path="/worker/verification-pending"
        element={
          <WorkerProtectedRoute>
            <WorkerVerificationPending />
          </WorkerProtectedRoute>
        }
      />
    </>
  );
};

export default getWorkerRoutes;
