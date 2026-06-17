import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Bell, ArrowRight, Map, Check } from 'lucide-react';
import ProgressStepper from '../../components/worker/ProgressStepper';
import PermissionCard from '../../components/worker/PermissionCard';
import { updatePermissionsApi } from '../../services/workerApi';

export default function WorkerPermissions({ worker, refetchWorker }) {
  const [locPermission, setLocPermission] = useState(false);
  const [notifPermission, setNotifPermission] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState('');
  
  const [locLoading, setLocLoading] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmedLocation, setConfirmedLocation] = useState(false);

  const navigate = useNavigate();

  // Populate from existing worker data on load
  useEffect(() => {
    if (worker) {
      setLocPermission(worker.locationPermission || false);
      setNotifPermission(worker.notificationPermission || false);
      if (worker.latitude && worker.longitude) {
        setCoordinates({ lat: worker.latitude, lng: worker.longitude });
        setAddress(worker.formattedAddress || '');
        setConfirmedLocation(true);
      }
    }
  }, [worker]);

  const handleAllowLocation = () => {
    setLocLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Using simulated location for testing.');
      setCoordinates({ lat: 40.7128, lng: -74.0060 });
      setLocPermission(true);
      setLocLoading(false);
      setConfirmedLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setLocPermission(true);
        setLocLoading(false);
        setConfirmedLocation(false); // require they confirm new location
      },
      (error) => {
        console.error('Geolocation permission error:', error);
        alert('Could not retrieve location. Using simulated location for testing.');
        setCoordinates({ lat: 40.7128, lng: -74.0060 }); // Default NYC coordinates
        setLocPermission(true);
        setLocLoading(false);
        setConfirmedLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAllowNotifications = () => {
    setNotifLoading(true);
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications. Proceeding in simulated mode.');
      setNotifPermission(true); // Treat as granted for unsupported
      setNotifLoading(false);
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        setNotifPermission(true);
      } else {
        alert('Notification permission was denied. Proceeding in simulated mode.');
        setNotifPermission(true);
      }
      setNotifLoading(false);
    }).catch((err) => {
      console.error(err);
      setNotifPermission(true);
      setNotifLoading(false);
    });
  };

  const handleConfirmLocation = async () => {
    if (!coordinates) return;
    setSaving(true);
    try {
      // API call to save location and reverse geocode on backend
      const res = await updatePermissionsApi({
        locationPermission: true,
        notificationPermission: notifPermission,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });

      if (res.formattedAddress) {
        setAddress(res.formattedAddress);
      }
      setConfirmedLocation(true);
      if (refetchWorker) await refetchWorker();
    } catch (err) {
      console.error('Error saving location permissions:', err);
      alert('Failed to save location coordinates on server.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    // If permissions are granted, double check status
    setSaving(true);
    try {
      await updatePermissionsApi({
        locationPermission: true,
        notificationPermission: true,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });

      if (refetchWorker) await refetchWorker();
      navigate('/worker/profile-setup');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleBypassPermissions = async () => {
    setSaving(true);
    try {
      const mockCoords = { lat: 40.7128, lng: -74.0060 };
      await updatePermissionsApi({
        locationPermission: true,
        notificationPermission: true,
        latitude: mockCoords.lat,
        longitude: mockCoords.lng,
      });

      if (refetchWorker) await refetchWorker();
      navigate('/worker/profile-setup');
    } catch (err) {
      console.error('Bypass error:', err);
      navigate('/worker/profile-setup');
    } finally {
      setSaving(false);
    }
  };

  const canContinue = locPermission && notifPermission && confirmedLocation;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            WORKKAR Partner Onboarding
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Let's configure permissions to get you set up for job matching
          </p>
        </div>

        {/* Stepper */}
        <ProgressStepper currentStep={2} />

        {/* Bypass / Development Mode Skip Option */}
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={handleBypassPermissions}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-900/50 cursor-pointer"
          >
            <span>Simulate & Auto-Grant All Permissions (Dev Mode)</span>
          </button>
        </div>

        {/* Permissions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <PermissionCard
            title="Location Access"
            description="Allows WORKKAR to find jobs near you, track your routes, and matching you with nearby clients."
            icon={MapPin}
            isGranted={locPermission}
            onGrant={handleAllowLocation}
            buttonText="Allow Location"
            loading={locLoading}
          />

          <PermissionCard
            title="Instant Notifications"
            description="Allows instant notifications for booking requests, real-time status updates, and payout alerts."
            icon={Bell}
            isGranted={notifPermission}
            onGrant={handleAllowNotifications}
            buttonText="Allow Notifications"
            loading={notifLoading}
          />
        </div>

        {/* Map Preview Section */}
        <AnimatePresence>
          {locPermission && coordinates && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 mt-6 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4">
                <Map className="text-blue-600 dark:text-blue-400" size={20} />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">
                  Verify Detected Location
                </h3>
              </div>

              {/* Map Renderer with Fallback */}
              <div className="relative bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden mb-4 min-h-[240px] flex items-center justify-center border border-slate-200/50 dark:border-slate-800 w-full">
                <iframe
                  title="Google Maps Location Preview"
                  width="100%"
                  height="240"
                  frameBorder="0"
                  style={{ border: 0, borderRadius: '16px' }}
                  src={`https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>

              {/* Address details */}
              {address && (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl mb-4 border border-slate-100 dark:border-slate-800 text-sm">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Detected Address:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold">{address}</p>
                </div>
              )}

              <div className="flex justify-end">
                {confirmedLocation ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 py-2.5 px-5 rounded-xl border border-emerald-500/20">
                    <Check size={16} />
                    Location Confirmed
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleConfirmLocation}
                    className="py-2.5 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      'Confirm Location'
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button bar */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            disabled={!canContinue || saving}
            onClick={handleContinue}
            className={`py-3.5 px-8 text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              canContinue
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
            }`}
          >
            Continue to Profile Setup
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
