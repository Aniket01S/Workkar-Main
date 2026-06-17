import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkkar } from '../context/WorkkarContext';
import DashboardCard from '../components/DashboardCard';

export default function SupremeAdminDashboard() {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [viewingList, setViewingList] = useState(null); // 'clients', 'workers', or null
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [selectedListItem, setSelectedListItem] = useState(null);
  const {
    workers,
    dbUsers,
    pendingApprovals,
    assignments,
    auditLogs,
    analytics,
    approveWorker,
    rejectWorker,
    suspendUser,
    restoreUser,
    promoteUser,
    demoteUser,
    banUser,
    deleteUser,
    fetchDbUsers,
    fetchAuditLogs,
    fetchAnalytics,
    addNotification
  } = useWorkkar();

  const [activeTab, setActiveTab] = useState('roles'); // roles, moderation, logs

  useEffect(() => {
    fetchDbUsers();
    fetchAuditLogs();
    fetchAnalytics();
  }, []);

  // Stats calculation
  const totalRevenue = analytics ? `$${analytics.revenue.toLocaleString()}` : "$24,500";
  const jobRequests = analytics ? analytics.jobRequests.toString() : "1,284";
  const activeWorkersCount = workers.filter(w => w.availability !== 'Offline').length;
  
  // Total user counts from database
  const customerCount = dbUsers.filter(u => u.role === 'customer').length;
  const workerCount = dbUsers.filter(u => u.role === 'worker').length;
  const adminCount = dbUsers.filter(u => u.role === 'admin').length;

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Welcome & Supreme Role Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">local_police</span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-extrabold leading-none">
              Supreme Command
            </h2>
          </div>
          <p className="font-body-md text-sm text-on-surface-variant mt-1.5">
            Full hierarchy overview, platform analytics, role modifications, and system-wide audit logging.
          </p>
        </div>
      </div>

      {/* Analytics Bento Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
        <DashboardCard
          icon="shield_person"
          title="Platform Admins"
          value={adminCount}
          trend="Role Promoted"
          trendType="neutral"
          footerLabel="Active Coordinators"
          largeIcon="shield_person"
        />
        <DashboardCard
          icon="group"
          title="Registered Clients"
          value={customerCount}
          trend="Customers"
          trendType="neutral"
          footerLabel="Platform buyers"
          footerLinkText="View Directory"
          footerLinkAction={() => {
            setViewingList('clients');
            setListSearchTerm('');
            setSelectedListItem(null);
          }}
          largeIcon="group"
        />
        <DashboardCard
          icon="engineering"
          title="Verified Workers"
          value={workerCount}
          trend="Professionals"
          trendType="neutral"
          footerLabel="Active Providers"
          footerLinkText="View Directory"
          footerLinkAction={() => {
            setViewingList('workers');
            setListSearchTerm('');
            setSelectedListItem(null);
          }}
          largeIcon="engineering"
        />
        <DashboardCard
          icon="pending_actions"
          iconBg="bg-error-container text-on-error-container"
          title="Pending Queue"
          value={pendingApprovals.length}
          trend={pendingApprovals.length > 0 ? "Action Required" : "Cleared"}
          trendType={pendingApprovals.length > 0 ? "negative" : "neutral"}
          footerLabel="Pending registrations"
          largeIcon="pending_actions"
        />
      </div>

      {/* Verification Board & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Worker Verification Queue (Same as Admin Dashboard) */}
        <div className="lg:col-span-2">
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow-base overflow-hidden flex flex-col h-full">
            <div className="p-stack-md border-b border-outline-variant/30 flex justify-between items-center bg-surface/50">
              <h3 className="font-title-md text-sm text-on-surface font-bold uppercase tracking-wider">
                Worker Verification Queue
              </h3>
            </div>
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant/20 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="p-3">Worker Name</th>
                    <th className="p-3">Trade/Skill</th>
                    <th className="p-3">Submission</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-xs">
                  {pendingApprovals.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl text-outline mb-2 block fill text-emerald-600">
                          check_circle
                        </span>
                        <p className="font-bold">Queue Empty</p>
                        <p className="text-xs text-outline mt-0.5">All registered workers verified.</p>
                      </td>
                    </tr>
                  ) : (
                    pendingApprovals.map((worker) => (
                      <tr key={worker.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="p-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-extrabold text-xs">
                            {worker.avatarInitials}
                          </div>
                          <span className="font-bold text-on-surface">{worker.name}</span>
                        </td>
                        <td className="p-3 text-on-surface-variant">{worker.skill}</td>
                        <td className="p-3 text-on-surface-variant">{worker.time}</td>
                        <td className="p-3 text-right flex justify-end gap-1.5">
                          <button 
                            onClick={() => setSelectedWorker(worker)}
                            className="text-primary hover:bg-primary-container hover:text-on-primary-container dark:text-blue-400 dark:hover:bg-blue-950/50 p-1.5 rounded-full transition-colors flex items-center justify-center cursor-pointer" 
                            title="Review Profile Details & Documents"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button 
                            onClick={() => approveWorker(worker.id)}
                            className="text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 p-1.5 rounded-full transition-colors flex items-center justify-center" 
                            title="Approve Worker"
                          >
                            <span className="material-symbols-outlined text-[18px] fill">check_circle</span>
                          </button>
                          <button 
                            onClick={() => rejectWorker(worker.id)}
                            className="text-error hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 p-1.5 rounded-full transition-colors flex items-center justify-center" 
                            title="Reject & Delete Registration"
                          >
                            <span className="material-symbols-outlined text-[18px] fill">cancel</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Platform dispatches widget */}
        <div className="lg:col-span-1">
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow-base overflow-hidden flex flex-col h-full justify-between">
            <div>
              <div className="p-stack-md border-b border-outline-variant/30 bg-surface/50">
                <h3 className="font-title-md text-sm text-on-surface font-bold uppercase tracking-wider">
                  Active Dispatches
                </h3>
              </div>
              <div className="p-4 flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
                {assignments.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-6">No active dispatches.</p>
                ) : (
                  assignments.map((job) => (
                    <div key={job.id} className="flex items-start gap-3 p-3 bg-surface rounded-xl border border-outline-variant/10">
                      <div className="p-2 bg-surface-container rounded-lg text-primary shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">{job.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-on-surface truncate">{job.title}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">Assigned to: {job.worker}</p>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-primary-container text-on-primary-container">
                        {job.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-3 border-t border-outline-variant/30 text-center bg-surface/30">
              <span className="text-[10px] text-on-surface-variant font-medium">Platform dispatcher running</span>
            </div>
          </section>
        </div>

      </div>

      {/* Custom Tabs Selector for Supreme Actions */}
      <div className="border-b border-outline-variant/30 pb-3 flex gap-4 mt-6">
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-2 text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
            activeTab === 'roles' ? 'border-primary text-primary font-black' : 'border-transparent text-on-surface-variant'
          }`}
        >
          Role Management
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-2 text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
            activeTab === 'moderation' ? 'border-primary text-primary font-black' : 'border-transparent text-on-surface-variant'
          }`}
        >
          Bans & User Management
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2 text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
            activeTab === 'logs' ? 'border-primary text-primary font-black' : 'border-transparent text-on-surface-variant'
          }`}
        >
          System Audit Logs
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-2">
        {activeTab === 'roles' && (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow-base overflow-hidden"
          >
            <div className="p-4 bg-surface/50 border-b border-outline-variant/20 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface">Promotions & Demotions</h3>
                <p className="text-[10px] text-on-surface-variant">Only Customers can be promoted to Admin. Admins can be demoted back to Customer.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant/20 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="p-3">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-right">Role Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {dbUsers.filter(u => u.role === 'customer' || u.role === 'admin').map((u) => (
                    <tr key={u._id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="p-3 font-bold text-on-surface">{u.name}</td>
                      <td className="p-3 text-on-surface-variant">{u.email}</td>
                      <td className="p-3">
                        <span className={`font-semibold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded ${
                          u.role === 'admin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {u.role === 'customer' ? (
                          <button
                            onClick={() => promoteUser(u._id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase px-3 py-1 rounded transition-colors"
                          >
                            Promote to Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => demoteUser(u._id)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] uppercase px-3 py-1 rounded transition-colors"
                          >
                            Demote to Client
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}

        {activeTab === 'moderation' && (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow-base overflow-hidden"
          >
            <div className="p-4 bg-surface/50 border-b border-outline-variant/20">
              <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface">Ban & Account Management</h3>
              <p className="text-[10px] text-on-surface-variant">Suspend, Ban, or permanently remove accounts. Restore accounts to reactivate access.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant/20 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="p-3">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {dbUsers.filter(u => u.role !== 'supreme-admin').map((u) => {
                    let badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80';
                    if (u.status === 'suspended') badgeColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80';
                    if (u.status === 'banned') badgeColor = 'bg-red-100 text-red-800 dark:bg-red-950/80';
                    if (u.status === 'pending') badgeColor = 'bg-sky-100 text-sky-800 dark:bg-sky-950/80';

                    return (
                      <tr key={u._id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="p-3 font-bold text-on-surface">{u.name}</td>
                        <td className="p-3 text-on-surface-variant">{u.email}</td>
                        <td className="p-3">
                          <span className="font-semibold uppercase text-[9px] bg-surface-container px-2 py-0.5 rounded">{u.role}</span>
                        </td>
                        <td className="p-3">
                          <span className={`font-bold uppercase text-[8px] px-1.5 py-0.5 rounded tracking-wide ${badgeColor}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          {u.role === 'worker' && (
                            <button
                              type="button"
                              onClick={() => {
                                const initials = u.textAvatar || (u.name || 'WK').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                                setSelectedWorker({
                                  id: u._id,
                                  name: u.name,
                                  skill: u.skill || u.profession || 'Technician',
                                  email: u.email,
                                  mobile: u.mobile || u.phone || 'N/A',
                                  age: u.age || 'N/A',
                                  gender: u.gender || 'N/A',
                                  profession: u.skill || u.profession,
                                  profilePhoto: u.profilePhoto || u.avatar,
                                  aadhaarCard: u.aadhaarCard || u.verificationDocument,
                                  panCard: u.panCard,
                                  formattedAddress: u.formattedAddress || u.address || 'N/A',
                                  avatarInitials: initials
                                });
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase px-3 py-1 rounded transition-colors active:scale-95 mr-2 cursor-pointer inline-block"
                            >
                              View Profile
                            </button>
                          )}
                          {u.status === 'active' || u.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => suspendUser(u._id)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded"
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => banUser(u._id)}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded"
                              >
                                Ban
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => restoreUser(u._id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded"
                            >
                              Restore Active
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}

        {activeTab === 'logs' && (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow-base overflow-hidden"
          >
            <div className="p-4 bg-surface/50 border-b border-outline-variant/20">
              <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface">System Audit Trails</h3>
              <p className="text-[10px] text-on-surface-variant">Immutable logs recording actions of all administrators.</p>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto space-y-3">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-6">No audit records logged yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log._id} className="p-3 bg-surface rounded-xl border border-outline-variant/10 text-xs flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-on-surface">
                        {log.adminName} <span className="text-primary font-semibold">({log.action})</span>
                      </p>
                      <p className="text-on-surface-variant text-[11px] mt-1 bg-surface-container px-2 py-1 rounded mt-1">{log.details}</p>
                    </div>
                    <span className="text-[9px] text-outline whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.section>
        )}
      </div>

      {/* Verification Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shrink-0">
                  {selectedWorker.profilePhoto ? (
                    <img
                      src={selectedWorker.profilePhoto.startsWith('http') ? selectedWorker.profilePhoto : `http://localhost:5000${selectedWorker.profilePhoto}`}
                      alt={selectedWorker.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-extrabold text-lg text-primary bg-blue-50 dark:bg-slate-800">
                      {selectedWorker.avatarInitials}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {selectedWorker.name}
                  </h3>
                  <span className="inline-block text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-slate-800/80 text-blue-700 dark:text-blue-400 px-2.5 py-1.5 rounded-full mt-1.5">
                    {selectedWorker.skill}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedWorker(null)}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Email Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-205 block text-sm mt-0.5 select-all">{selectedWorker.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Mobile Number</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-205 block text-sm mt-0.5 select-all">{selectedWorker.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Age / Gender</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-205 block text-sm mt-0.5">
                    {selectedWorker.age ? `${selectedWorker.age} years` : 'Not specified'} / {selectedWorker.gender || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Profession Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-205 block text-sm mt-0.5">{selectedWorker.profession || selectedWorker.skill}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Verified Location Coordinates</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-205 block text-sm mt-0.5">{selectedWorker.formattedAddress}</span>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 space-y-4">
                <h4 className="font-bold text-xs uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Uploaded Identity Credentials
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Aadhaar Card Box */}
                  <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-slate-700 dark:text-slate-350 text-sm">Aadhaar Card</h5>
                      <p className="text-[10px] text-slate-400 mt-1">Worker's primary identification document scan.</p>
                    </div>
                    {selectedWorker.aadhaarCard ? (
                      <a
                        href={`http://localhost:5000${selectedWorker.aadhaarCard}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl text-center shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        Open Aadhaar
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-red-500 dark:text-red-400 mt-4 block">No Document Uploaded</span>
                    )}
                  </div>

                  {/* PAN Card Box */}
                  <div className="border border-slate-150 dark:border-slate-800 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-slate-700 dark:text-slate-350 text-sm">PAN Card</h5>
                      <p className="text-[10px] text-slate-400 mt-1">Tax identification and business compliance scan.</p>
                    </div>
                    {selectedWorker.panCard ? (
                      <a
                        href={`http://localhost:5000${selectedWorker.panCard}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl text-center shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        Open PAN Card
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-red-500 dark:text-red-400 mt-4 block">No Document Uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="py-2.5 px-4 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  rejectWorker(selectedWorker.id);
                  setSelectedWorker(null);
                }}
                className="py-2.5 px-4 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-650 dark:text-red-400 border border-red-500/25 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] fill">cancel</span>
                Reject & Delete
              </button>

              <button
                type="button"
                onClick={() => {
                  approveWorker(selectedWorker.id);
                  setSelectedWorker(null);
                }}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] fill">check_circle</span>
                Approve Partner
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* List Viewer Modal */}
      {viewingList && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[80vh]"
          >
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    {viewingList === 'clients' ? 'group' : 'engineering'}
                  </span>
                  {viewingList === 'clients' ? 'Registered Clients Directory' : 'Verified Workers Directory'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {viewingList === 'clients' ? 'Browse all registered client accounts on the platform.' : 'Browse and manage verified service providers.'}
                </p>
              </div>
              <button
                onClick={() => setViewingList(null)}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Split Screen Panel */}
            <div className="flex flex-1 overflow-hidden">
              
              {/* Left Column: Search & List (Width: 2/5) */}
              <div className="w-2/5 border-r border-slate-100 dark:border-slate-800/80 flex flex-col h-full bg-slate-50/30 dark:bg-slate-950/10">
                {/* Search Box */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                      <span className="material-symbols-outlined text-[18px]">search</span>
                    </div>
                    <input
                      type="text"
                      placeholder={viewingList === 'clients' ? "Search clients by name or email..." : "Search workers by name, email, or skill..."}
                      value={listSearchTerm}
                      onChange={(e) => setListSearchTerm(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 text-xs text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {(() => {
                    const items = dbUsers.filter(u => {
                      if (viewingList === 'clients') {
                        return u.role === 'customer';
                      } else {
                        // Verified workers only (exclude pending/unapproved ones)
                        return u.role === 'worker' && u.status !== 'pending' && u.status !== 'rejected';
                      }
                    }).filter(u => {
                      const search = listSearchTerm.toLowerCase();
                      const nameMatch = (u.name || '').toLowerCase().includes(search);
                      const emailMatch = (u.email || '').toLowerCase().includes(search);
                      const skillMatch = viewingList === 'workers' ? (u.skill || u.profession || '').toLowerCase().includes(search) : false;
                      return nameMatch || emailMatch || skillMatch;
                    });

                    if (items.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-400 text-xs">
                          <span className="material-symbols-outlined text-3xl mb-1 block">search_off</span>
                          No directory records found.
                        </div>
                      );
                    }

                    return items.map(item => {
                      const isSelected = selectedListItem && selectedListItem._id === item._id;
                      const initials = item.textAvatar || (item.name || 'WK').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

                      return (
                        <div
                          key={item._id}
                          onClick={() => setSelectedListItem(item)}
                          className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer text-left flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-primary/5 dark:bg-blue-500/10 border-primary/40 dark:border-blue-500/40 shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                              viewingList === 'clients' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'bg-blue-50 text-primary dark:bg-blue-950/40 dark:text-blue-300'
                            }`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.email}</p>
                            </div>
                          </div>
                          
                          {viewingList === 'workers' && (
                            <span className="text-[9px] font-bold bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant truncate max-w-[80px]">
                              {item.skill || item.profession}
                            </span>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Right Column: Full Profile Detail Card (Width: 3/5) */}
              <div className="w-3/5 overflow-y-auto p-6 flex flex-col h-full bg-white dark:bg-slate-900">
                {selectedListItem ? (
                  <div className="space-y-6">
                    
                    {/* Header profile block */}
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shrink-0">
                        {selectedListItem.profilePhoto || selectedListItem.avatar ? (
                          <img
                            src={
                              (selectedListItem.profilePhoto || selectedListItem.avatar).startsWith('http')
                                ? (selectedListItem.profilePhoto || selectedListItem.avatar)
                                : `http://localhost:5000${selectedListItem.profilePhoto || selectedListItem.avatar}`
                            }
                            alt={selectedListItem.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-extrabold text-xl text-primary bg-blue-50 dark:bg-slate-800">
                            {selectedListItem.textAvatar || (selectedListItem.name || 'WK').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-left">
                        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{selectedListItem.name}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                            {selectedListItem.role}
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            selectedListItem.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                              : selectedListItem.status === 'suspended'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                          }`}>
                            {selectedListItem.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Fields Grid */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-left">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Email Address</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5 select-all">{selectedListItem.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Mobile Number</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5 select-all">{selectedListItem.mobile || selectedListItem.phone || 'N/A'}</span>
                      </div>
                      
                      {viewingList === 'workers' && (
                        <>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Age / Gender</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                              {selectedListItem.age ? `${selectedListItem.age} years` : 'Not specified'} / {selectedListItem.gender || 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Profession Category</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                              {selectedListItem.profession || selectedListItem.skill || 'Technician'}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="col-span-2">
                        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Location Address</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">{selectedListItem.formattedAddress || selectedListItem.address || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Document Scans (Workers only) */}
                    {viewingList === 'workers' && (
                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5 space-y-4">
                        <h5 className="font-bold text-xs uppercase text-slate-400 dark:text-slate-500 tracking-wider text-left">
                          Identity Documents Scans
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-between">
                            <span className="font-bold text-slate-700 dark:text-slate-350 text-xs text-left block">Aadhaar Card</span>
                            {selectedListItem.aadhaarCard || selectedListItem.verificationDocument ? (
                              <a
                                href={
                                  (selectedListItem.aadhaarCard || selectedListItem.verificationDocument).startsWith('http')
                                    ? (selectedListItem.aadhaarCard || selectedListItem.verificationDocument)
                                    : `http://localhost:5000${selectedListItem.aadhaarCard || selectedListItem.verificationDocument}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg text-center shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                Open Aadhaar
                              </a>
                            ) : (
                              <span className="text-[10px] font-semibold text-red-500 mt-3 block text-left">No Document Scan</span>
                            )}
                          </div>
                          
                          <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-between">
                            <span className="font-bold text-slate-700 dark:text-slate-350 text-xs text-left block">PAN Card</span>
                            {selectedListItem.panCard ? (
                              <a
                                href={
                                  selectedListItem.panCard.startsWith('http')
                                    ? selectedListItem.panCard
                                    : `http://localhost:5000${selectedListItem.panCard}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg text-center shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                Open PAN Card
                              </a>
                            ) : (
                              <span className="text-[10px] font-semibold text-red-500 mt-3 block text-left">No Document Scan</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Moderation Controls inside Directory */}
                    <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5 flex justify-end gap-2">
                      {selectedListItem.status === 'active' ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await suspendUser(selectedListItem._id);
                            // Refresh local selected state
                            setSelectedListItem(prev => ({ ...prev, status: 'suspended' }));
                          }}
                          className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Suspend Account
                        </button>
                      ) : selectedListItem.status === 'suspended' ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await restoreUser(selectedListItem._id);
                            setSelectedListItem(prev => ({ ...prev, status: 'active' }));
                          }}
                          className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Restore Account
                        </button>
                      ) : null}
                      
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to permanently delete the profile of ${selectedListItem.name}?`)) {
                            await deleteUser(selectedListItem._id);
                            setSelectedListItem(null);
                          }
                        }}
                        className="py-2 px-4 border border-red-500/30 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Delete Profile
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-2 text-slate-300 dark:text-slate-700">account_circle</span>
                    <p className="text-xs font-medium">Select an account from the left directory list to view full profile details and document records.</p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
