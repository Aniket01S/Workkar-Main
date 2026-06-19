import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_SERVICES,
  INITIAL_EARNINGS_TREND,
} from '../data/mockData';

const WorkkarContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const WorkkarProvider = ({ children }) => {
  // Authentication states
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('workkar_token'));
  const [workerToken, setWorkerToken] = useState(() => localStorage.getItem('worker_token'));
  const [authLoading, setAuthLoading] = useState(true);

  // App data states
  const [dbWorkers, setDbWorkers] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Theme state (Dark Mode)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('workkar_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Services and Earnings (static)
  const services = INITIAL_SERVICES;
  const earningsTrend = INITIAL_EARNINGS_TREND;

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('workkar_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Toast notification helper
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Helper for auth headers
  const getAuthHeaders = () => {
    const isWorkerPath = window.location.pathname.startsWith('/worker');
    const activeToken = isWorkerPath && workerToken ? workerToken : token;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${activeToken}`
    };
  };

  // Fetch current user details on mount/token change
  useEffect(() => {
    const fetchMe = async () => {
      const isWorkerPath = window.location.pathname.startsWith('/worker');
      const activeToken = isWorkerPath && workerToken ? workerToken : token;
      const endpoint = isWorkerPath && workerToken ? `${API_URL}/auth/worker/me` : `${API_URL}/auth/me`;

      if (!activeToken) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const res = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token is invalid/expired
          if (isWorkerPath && workerToken) {
            localStorage.removeItem('worker_token');
            setWorkerToken(null);
            setUser(null);
            setAuthLoading(false);
          } else {
            logout();
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchMe();
  }, [token, workerToken, window.location.pathname]);

  // Background polling to sync activeJob status and user updates in real-time
  useEffect(() => {
    if (!user) return;

    const pollInterval = setInterval(async () => {
      const isWorkerPath = window.location.pathname.startsWith('/worker') || user.role === 'worker';
      const activeToken = isWorkerPath && workerToken ? workerToken : token;
      if (!activeToken) return;

      const endpoint = isWorkerPath ? `${API_URL}/auth/worker/me` : `${API_URL}/auth/me`;

      try {
        const res = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error background polling user profile:', err);
      }
    }, 4000); // Check every 4 seconds

    return () => clearInterval(pollInterval);
  }, [user?._id, token, workerToken, window.location.pathname]);

  // Fetch all workers and assignments on mount or user changes
  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${API_URL}/workers`);
      if (res.ok) {
        const workersData = await res.json();
        setDbWorkers(workersData);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
    }
  };

  const fetchAssignments = async () => {
    if (user && (user.role === 'admin' || user.role === 'supreme-admin')) {
      try {
        const res = await fetch(`${API_URL}/jobs/assignments`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const assignmentsData = await res.json();
          setAssignments(assignmentsData);
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
      }
    }
  };

  const fetchDbUsers = async () => {
    if (user && (user.role === 'admin' || user.role === 'supreme-admin')) {
      try {
        const res = await fetch(`${API_URL}/admin/users`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const usersData = await res.json();
          setDbUsers(usersData);
        }
      } catch (err) {
        console.error('Error fetching db users:', err);
      }
    }
  };

  const fetchAuditLogs = async () => {
    if (user && user.role === 'supreme-admin') {
      try {
        const res = await fetch(`${API_URL}/admin/logs`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const logsData = await res.json();
          setAuditLogs(logsData);
        }
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      }
    }
  };

  const fetchAnalytics = async () => {
    if (user && (user.role === 'admin' || user.role === 'supreme-admin')) {
      try {
        const res = await fetch(`${API_URL}/admin/analytics`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [user]);

  useEffect(() => {
    fetchAssignments();
    fetchDbUsers();
    fetchAnalytics();
    if (user && user.role === 'supreme-admin') {
      fetchAuditLogs();
    }
  }, [user, token]);

  // Computed state for workers
  // Client UI sees verified, active workers only
  const workers = dbWorkers.filter(w => w.verified && w.status === 'active').map(w => ({
    id: w._id,
    name: w.name,
    skill: w.skill,
    skillTitle: w.skillTitle || `Professional ${w.skill}`,
    experience: w.experience,
    rating: w.rating || 5.0,
    rate: w.rate,
    availability: w.availability,
    avatar: w.avatar || (w.profilePhoto ? (w.profilePhoto.startsWith('http') ? w.profilePhoto : `http://localhost:5000${w.profilePhoto}`) : null),
    textAvatar: w.textAvatar,
    verified: w.verified,
    status: w.status,
    reviews: w.reviews || [],
    description: w.description
  }));

  // Coordinator UI sees unverified/pending workers in the queue
  const pendingApprovals = dbWorkers.filter(w => !w.verified && w.status === 'pending').map(w => ({
    id: w.id || w._id,
    name: w.name || w.fullName || 'Partner',
    skill: w.skill || w.profession || 'Technician',
    time: new Date(w.createdAt).toLocaleDateString(),
    avatarInitials: w.textAvatar || (w.name || w.fullName || 'WK').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
    email: w.email,
    mobile: w.mobile,
    age: w.age,
    gender: w.gender,
    profilePhoto: w.profilePhoto,
    aadhaarCard: w.aadhaarCard,
    panCard: w.panCard,
    formattedAddress: w.formattedAddress || 'Not confirmed',
    experience: w.experience || 0,
    rate: w.rate || 20,
    description: w.description || ''
  }));

  // Computed state for active job & incoming alert
  const activeJob = user?.activeJob && user.activeJob.status !== 'Alert' ? user.activeJob : null;
  const incomingAlert = user?.activeJob && user.activeJob.status === 'Alert' ? user.activeJob : null;

  // Computed wallet
  const wallet = user?.wallet || {
    balance: 0.00,
    weekly: 0.00,
    jobEarnings: 0.00,
    incentives: 0.00,
    tips: 0.00
  };

  // Dynamic jobs timeline based on active job step
  const jobsTimeline = [
    { step: 1, label: "Job Accepted", description: activeJob ? "Today, 08:30 AM" : "Pending acceptance", completed: activeJob ? activeJob.step >= 1 : false },
    { step: 2, label: "Heading to Customer", description: activeJob && activeJob.step >= 2 ? "En Route" : "Estimated arrival: 15 mins", completed: activeJob ? activeJob.step >= 2 : false },
    { step: 3, label: "Start Service", description: activeJob && activeJob.step >= 3 ? "In Progress" : "Pending arrival", completed: activeJob ? activeJob.step >= 3 : false },
    { step: 4, label: "Job Completed", description: activeJob && activeJob.step >= 4 ? "Completed" : "Pending service completion", completed: activeJob ? activeJob.step >= 4 : false }
  ];

  // Auth Operations
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('workkar_token', data.token);
      setToken(data.token);
      return true;
    } catch (err) {
      addNotification(err.message, 'error');
      throw err;
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Google Sign-In failed');
      }

      localStorage.setItem('workkar_token', data.token);
      setToken(data.token);
      return true;
    } catch (err) {
      addNotification(err.message, 'error');
      throw err;
    }
  };


  const register = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (formData.role !== 'worker') {
        localStorage.setItem('workkar_token', data.token);
        setToken(data.token);
      }
      return true;
    } catch (err) {
      addNotification(err.message, 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('workkar_token');
    localStorage.removeItem('worker_token');
    setToken(null);
    setWorkerToken(null);
    setUser(null);
    setDbUsers([]);
    setAuditLogs([]);
    addNotification('Logged out successfully', 'success');
    window.location.href = '/';
  };

  // Client actions
  const bookWorker = async (workerId, details) => {
    if (!user) {
      addNotification('Please log in to book a worker', 'error');
      return false;
    }

    try {
      const targetWorker = dbWorkers.find(w => w._id === workerId);
      if (!targetWorker) return false;

      const rate = targetWorker.rate || 25;
      const res = await fetch(`${API_URL}/jobs/book`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          workerId,
          customerName: details.name || user.name,
          address: details.address || user.address,
          skill: targetWorker.skill,
          base: rate * 3,
          tax: 10,
          total: rate * 3 + 10
        })
      });

      const data = await res.json();
      if (res.ok) {
        addNotification(`Booking request sent successfully to ${targetWorker.name}!`, 'success');
        fetchWorkers();
        return true;
      } else {
        addNotification(data.message || 'Booking failed', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection error during booking', 'error');
      return false;
    }
  };

  // Worker companion operations
  const acceptJobOffer = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs/accept`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(prev => ({ ...prev, activeJob: updated.activeJob }));
        addNotification("Job offer accepted! Fetching routing GPS...", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const declineJobOffer = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs/decline`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setUser(prev => ({ ...prev, activeJob: undefined }));
        addNotification("Job offer declined.", "warning");
        fetchWorkers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startService = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs/start`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(prev => ({ ...prev, activeJob: updated.activeJob }));
        addNotification("Service started! Track timeline progress.", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completeJob = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs/complete`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(prev => ({ ...prev, activeJob: updated.activeJob }));
        addNotification("Job completed! Requested customer approval.", "success");
        fetchWorkers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const approveJobCompletion = async (jobId) => {
    try {
      const res = await fetch(`${API_URL}/jobs/approve-complete`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ jobId })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(data.message, "success");
        fetchUser();
        fetchWorkers();
        return true;
      } else {
        addNotification(data.message || "Failed to approve completion", "error");
        return false;
      }
    } catch (err) {
      console.error(err);
      addNotification("Error approving job completion", "error");
      return false;
    }
  };

  const getMessages = async (jobId) => {
    try {
      const res = await fetch(`${API_URL}/jobs/messages/${encodeURIComponent(jobId)}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error("Error fetching messages:", err);
      return [];
    }
  };

  const sendMessage = async (jobId, text) => {
    try {
      const res = await fetch(`${API_URL}/jobs/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ jobId, text })
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error("Error sending message:", err);
      return null;
    }
  };

  const withdrawFunds = async (amount) => {
    try {
      const res = await fetch(`${API_URL}/jobs/withdraw`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(prev => ({ ...prev, wallet: data.wallet }));
        addNotification(`Withdrawal of $${amount.toFixed(2)} processed successfully!`, "success");
        return true;
      } else {
        addNotification(data.message || "Withdrawal failed", "error");
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Admin / Supreme Admin: Worker Management
  const approveWorker = async (id) => {
    try {
      const res = await fetch(`${API_URL}/workers/${id}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        addNotification(data.message, 'success');
        fetchWorkers();
        fetchAssignments();
        fetchDbUsers();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const suspendWorker = async (id) => {
    try {
      const res = await fetch(`${API_URL}/workers/${id}/suspend`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        addNotification(data.message, 'success');
        fetchWorkers();
        fetchDbUsers();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const rejectWorker = async (id) => {
    try {
      const res = await fetch(`${API_URL}/workers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        addNotification(data.message, 'success');
        fetchWorkers();
        fetchAssignments();
        fetchDbUsers();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWorkerAvailability = async (workerId) => {
    if (user && user._id === workerId) {
      try {
        const res = await fetch(`${API_URL}/workers/availability`, {
          method: 'PUT',
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          setUser(prev => ({ ...prev, availability: data.availability }));
          addNotification(`Status updated to ${data.availability}.`, 'success');
          fetchWorkers();
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setDbWorkers(prev => prev.map(w => {
        if (w._id === workerId) {
          const nextAvail = w.availability === 'Available' ? 'Offline' : 'Available';
          addNotification(`${w.name} status updated to ${nextAvail}.`, 'success');
          return { ...w, availability: nextAvail };
        }
        return w;
      }));
    }
  };

  // Admin / Supreme Admin: User Management actions
  const suspendUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/suspend`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(data.message, 'success');
        fetchDbUsers();
        fetchWorkers();
        fetchAnalytics();
        if (user.role === 'supreme-admin') fetchAuditLogs();
      } else {
        addNotification(data.message, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const restoreUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/restore`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(data.message, 'success');
        fetchDbUsers();
        fetchWorkers();
        fetchAnalytics();
        if (user.role === 'supreme-admin') fetchAuditLogs();
      } else {
        addNotification(data.message, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const promoteUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/promote`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(data.message, 'success');
        fetchDbUsers();
        fetchAnalytics();
        fetchAuditLogs();
      } else {
        addNotification(data.message, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const demoteUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/demote`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(data.message, 'success');
        fetchDbUsers();
        fetchAnalytics();
        fetchAuditLogs();
      } else {
        addNotification(data.message, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const banUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/ban`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(data.message, 'success');
        fetchDbUsers();
        fetchWorkers();
        fetchAnalytics();
        fetchAuditLogs();
      } else {
        addNotification(data.message, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(data.message, 'success');
        fetchDbUsers();
        fetchWorkers();
        fetchAnalytics();
        fetchAuditLogs();
      } else {
        addNotification(data.message, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUser = async () => {
    const isWorkerPath = window.location.pathname.startsWith('/worker') || (user && user.role === 'worker');
    const activeToken = isWorkerPath && workerToken ? workerToken : token;
    if (!activeToken) return;
    const endpoint = isWorkerPath ? `${API_URL}/auth/worker/me` : `${API_URL}/auth/me`;
    try {
      const res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to refetch user:', err);
    }
  };

  const cancelBooking = async (jobId) => {
    try {
      const res = await fetch(`${API_URL}/jobs/cancel/${encodeURIComponent(jobId)}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(data.message, 'success');
        fetchUser();
        return true;
      } else {
        addNotification(data.message || 'Failed to cancel booking', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection error cancelling booking', 'error');
      return false;
    }
  };

  const submitReview = async (workerId, rating, comment) => {
    try {
      const res = await fetch(`${API_URL}/jobs/review/${workerId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(data.message, 'success');
        fetchUser();
        fetchWorkers();
        return true;
      } else {
        addNotification(data.message || 'Failed to submit review', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      addNotification('Connection error submitting review', 'error');
      return false;
    }
  };

  const markNotificationsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/notifications/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updatedNotifs = await res.json();
        setUser(prev => ({ ...prev, notifications: updatedNotifs }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleNotificationRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/auth/notifications/read/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updatedNotifs = await res.json();
        setUser(prev => ({ ...prev, notifications: updatedNotifs }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/notifications`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setUser(prev => ({ ...prev, notifications: [] }));
        addNotification('Notifications cleared', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <WorkkarContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      authLoading,
      services,
      workers,
      dbWorkers,
      dbUsers,
      auditLogs,
      analytics,
      jobsTimeline,
      earningsTrend,
      pendingApprovals,
      assignments,
      wallet,
      activeJob,
      notifications,
      incomingAlert,
      darkMode,
      toggleDarkMode,
      login,
      loginWithGoogle,
      register,
      logout,
      setToken,
      setWorkerToken,
      bookWorker,
      acceptJobOffer,
      declineJobOffer,
      startService,
      completeJob,
      withdrawFunds,
      approveWorker,
      suspendWorker,
      rejectWorker,
      toggleWorkerAvailability,
      suspendUser,
      restoreUser,
      promoteUser,
      demoteUser,
      banUser,
      deleteUser,
      fetchDbUsers,
      fetchAuditLogs,
      fetchAnalytics,
      addNotification,
      fetchUser,
      cancelBooking,
      submitReview,
      markNotificationsRead,
      markSingleNotificationRead,
      clearNotifications,
      approveJobCompletion,
      getMessages,
      sendMessage
    }}>
      {children}
    </WorkkarContext.Provider>
  );
};

export const useWorkkar = () => useContext(WorkkarContext);
export default WorkkarContext;
