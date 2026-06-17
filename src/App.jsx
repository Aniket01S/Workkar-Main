import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkkarProvider, useWorkkar } from './context/WorkkarContext';

// Layouts
import ClientLayout from './layouts/ClientLayout';
import WorkerLayout from './layouts/WorkerLayout';
import AdminLayout from './layouts/AdminLayout';

// Client Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Workers from './pages/Workers';
import WorkerDetails from './pages/WorkerDetails';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';

// Worker Pages
import WorkerDashboard from './pages/WorkerDashboard';
import ActiveJob from './pages/ActiveJob';
import WorkerEarnings from './pages/WorkerEarnings';

// Worker Onboarding
import WorkerProtectedRoute from './components/worker/WorkerProtectedRoute';
import getWorkerRoutes from './routes/workerRoutes';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import SupremeAdminDashboard from './pages/SupremeAdminDashboard';

// Route Guard Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, authLoading } = useWorkkar();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    const roleParam = allowedRoles ? allowedRoles[0] : 'customer';
    return <Navigate to={`/login?role=${roleParam}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'supreme-admin') return <Navigate to="/supreme-admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Client Portal Routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="workers" element={<Workers />} />
          <Route path="worker-details/:id" element={<WorkerDetails />} />
          <Route path="login" element={<Login />} />
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Worker Portal Routes */}
        <Route 
          path="/worker" 
          element={
            <WorkerProtectedRoute>
              <WorkerLayout />
            </WorkerProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/worker/dashboard" replace />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="active-job" element={<ActiveJob />} />
          <Route path="earnings" element={<WorkerEarnings />} />
        </Route>

        {/* Worker Auth & Onboarding Routes */}
        {getWorkerRoutes()}

        {/* Admin Coordinator Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Supreme Admin Routes */}
        <Route 
          path="/supreme-admin" 
          element={
            <ProtectedRoute allowedRoles={['supreme-admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/supreme-admin/dashboard" replace />} />
          <Route path="dashboard" element={<SupremeAdminDashboard />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}


