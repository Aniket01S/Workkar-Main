import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Briefcase, FileText, Send } from 'lucide-react';
import ProgressStepper from '../../components/worker/ProgressStepper';
import UploadCard from '../../components/worker/UploadCard';
import { updateWorkerProfileApi } from '../../services/workerApi';

export default function WorkerProfileSetup({ worker, refetchWorker }) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [profession, setProfession] = useState('Electrician');
  const [experience, setExperience] = useState('0');
  const [rate, setRate] = useState('20');
  const [description, setDescription] = useState('');

  // Location Onboarding State
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationStatus, setLocationStatus] = useState('prompt'); // 'prompt', 'requesting', 'granted', 'denied'
  const [locationError, setLocationError] = useState('');

  // Files & Previews
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');

  const [aadhaarCard, setAadhaarCard] = useState(null);
  const [aadhaarCardPreview, setAadhaarCardPreview] = useState('');

  const [panCard, setPanCard] = useState(null);
  const [panCardPreview, setPanCardPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const navigate = useNavigate();

  // Populate existing data if available (e.g. if editing or re-submitting rejected profile)
  useEffect(() => {
    if (worker) {
      setFullName(worker.fullName || '');
      setAge(worker.age ? String(worker.age) : '');
      setGender(worker.gender || 'Male');
      setProfession(worker.profession || 'Electrician');
      setExperience(worker.experience !== undefined ? String(worker.experience) : '0');
      setRate(worker.rate !== undefined ? String(worker.rate) : '20');
      setDescription(worker.description || '');

      if (worker.profilePhoto) setProfilePhotoPreview(worker.profilePhoto);
      if (worker.aadhaarCard) setAadhaarCardPreview(worker.aadhaarCard);
      if (worker.panCard) setPanCardPreview(worker.panCard);

      if (worker.latitude && worker.longitude) {
        setLatitude(worker.latitude);
        setLongitude(worker.longitude);
        setLocationStatus('granted');
      }
    }
  }, [worker]);

  // Request location on mount
  useEffect(() => {
    if (!latitude || !longitude) {
      requestLocation();
    }
  }, []);

  const requestLocation = () => {
    setLocationStatus('requesting');
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Using simulated location.');
      setLatitude(40.7128);
      setLongitude(-74.0060);
      setLocationStatus('granted');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationStatus('granted');
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError('Could not retrieve location. Using simulated location for development.');
        setLatitude(40.7128);
        setLongitude(-74.0060);
        setLocationStatus('granted');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validate = () => {
    const errs = {};
    if (!fullName || !fullName.trim()) errs.fullName = 'Full name is required';
    if (!age) {
      errs.age = 'Age is required';
    } else {
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 18) {
        errs.age = 'You must be 18 years or older';
      }
    }
    if (!profession) errs.profession = 'Please select your profession';

    if (!experience) {
      errs.experience = 'Experience is required';
    } else {
      const parsedExp = parseInt(experience, 10);
      if (isNaN(parsedExp) || parsedExp < 0) {
        errs.experience = 'Experience must be 0 or more years';
      }
    }

    const expYearsVal = parseInt(experience, 10) || 0;
    let minRateVal = 10, maxRateVal = 20;
    if (expYearsVal >= 10) {
      minRateVal = 40; maxRateVal = 120;
    } else if (expYearsVal >= 5) {
      minRateVal = 25; maxRateVal = 60;
    } else if (expYearsVal >= 2) {
      minRateVal = 15; maxRateVal = 35;
    }

    if (!rate) {
      errs.rate = 'Hourly rate is required';
    } else {
      const parsedRate = parseFloat(rate);
      if (isNaN(parsedRate) || parsedRate < minRateVal || parsedRate > maxRateVal) {
        errs.rate = `Hourly rate must be between $${minRateVal} and $${maxRateVal} based on your experience`;
      }
    }

    if (!description || !description.trim()) {
      errs.description = 'Please provide a short description about yourself';
    }

    if (locationStatus !== 'granted' || latitude === null || longitude === null) {
      errs.location = 'Location access is required to register as a partner';
    }

    if (!profilePhoto && !profilePhotoPreview) {
      errs.profilePhoto = 'Profile photo is required';
    }
    if (!aadhaarCard && !aadhaarCardPreview) {
      errs.aadhaarCard = 'Aadhaar card scan is required';
    }
    if (!panCard && !panCardPreview) {
      errs.panCard = 'PAN card scan is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = (file, setFile, setPreview) => {
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});

    if (!validate()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('age', age);
    formData.append('gender', gender);
    formData.append('profession', profession);
    formData.append('experience', experience);
    formData.append('rate', rate);
    formData.append('description', description);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);

    if (profilePhoto) formData.append('profilePhoto', profilePhoto);
    if (aadhaarCard) formData.append('aadhaarCard', aadhaarCard);
    if (panCard) formData.append('panCard', panCard);

    try {
      await updateWorkerProfileApi(formData);
      if (refetchWorker) await refetchWorker();
      navigate('/worker/verification-pending');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setSubmitError(
          err.response?.data?.message || 'Failed to submit profile. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const professionsList = [
    'Electrician',
    'Plumber',
    'Mason',
    'Carpenter',
    'Painter',
    'Welder',
    'Cleaner',
    'Gardener',
    'Construction Worker',
    'Technician',
    'Other',
  ];

  const expYears = parseInt(experience, 10) || 0;
  let minRate = 10, maxRate = 20;
  if (expYears >= 10) {
    minRate = 40; maxRate = 120;
  } else if (expYears >= 5) {
    minRate = 25; maxRate = 60;
  } else if (expYears >= 2) {
    minRate = 15; maxRate = 35;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Providing accurate details helps us verify your credentials and list you for jobs.
          </p>
        </div>

        {/* Stepper */}
        <ProgressStepper currentStep={3} />

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl p-4"
            >
              {submitError}
            </motion.div>
          )}

          {/* Core Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section 1: Personal Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800">
                <User className="text-blue-600 dark:text-blue-400" size={20} />
                <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                  Personal Information
                </h2>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full legal name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`mt-1.5 block w-full px-4 py-3 border ${
                    errors.fullName ? 'border-red-300' : 'border-slate-200 dark:border-slate-800'
                  } bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-slate-900 dark:text-white transition-all`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Age */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="Min 18"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={`mt-1.5 block w-full px-4 py-3 border ${
                      errors.age ? 'border-red-300' : 'border-slate-200 dark:border-slate-800'
                    } bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-slate-900 dark:text-white transition-all`}
                  />
                  {errors.age && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.age}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1.5 block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-slate-900 dark:text-white transition-all cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Readonly Account Details */}
              <div className="pt-2 grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Registered Email</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">
                    {worker?.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Registered Mobile</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {worker?.mobile}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Profession & Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800 mb-4">
                  <Briefcase className="text-blue-600 dark:text-blue-400" size={20} />
                  <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    Professional Details
                  </h2>
                </div>

                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Select Core Skill
                </label>
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="mt-1.5 block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-slate-900 dark:text-white transition-all cursor-pointer"
                >
                  {professionsList.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
                {errors.profession && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.profession}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Experience */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className={`mt-1.5 block w-full px-4 py-3 border ${
                      errors.experience ? 'border-red-300' : 'border-slate-200 dark:border-slate-800'
                    } bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-slate-900 dark:text-white transition-all`}
                  />
                  {errors.experience && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.experience}</p>
                  )}
                </div>

                {/* Hourly Rate */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Hourly Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className={`mt-1.5 block w-full px-4 py-3 border ${
                      errors.rate ? 'border-red-300' : 'border-slate-200 dark:border-slate-800'
                    } bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-slate-900 dark:text-white transition-all`}
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 block">
                    Allowed Range: ${minRate} - ${maxRate}/hr based on your experience
                  </span>
                  {errors.rate && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.rate}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  About You (Description)
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe your skills, tools you use, services you offer..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`mt-1.5 block w-full px-4 py-3 border ${
                    errors.description ? 'border-red-300' : 'border-slate-200 dark:border-slate-800'
                  } bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-slate-900 dark:text-white transition-all resize-none`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Location Access */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">my_location</span>
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                Location Verification
              </h2>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We require access to your live location to match you with nearby service requests.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Location Status</span>
                {locationStatus === 'granted' ? (
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Location Verified ({latitude?.toFixed(4)}, {longitude?.toFixed(4)})
                  </span>
                ) : locationStatus === 'requesting' ? (
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Requesting location access...
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    Permission Denied
                  </span>
                )}
                {locationError && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium italic mt-1">{locationError}</p>
                )}
              </div>

              {locationStatus !== 'granted' && (
                <button
                  type="button"
                  onClick={requestLocation}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Grant Location Access
                </button>
              )}
            </div>
            {errors.location && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{errors.location}</p>
            )}
          </div>

          {/* Section 3: Upload Documents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800 mb-6">
              <FileText className="text-blue-600 dark:text-blue-400" size={20} />
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                Verification Documents & Photo
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Profile Photo */}
              <div className="flex flex-col">
                <UploadCard
                  title="Profile Photo"
                  description="Recent front face photo. Must be clear and circular."
                  accept="image/*"
                  file={profilePhoto}
                  previewUrl={profilePhotoPreview}
                  isCircular={true}
                  onChange={(file) => handleFileChange(file, setProfilePhoto, setProfilePhotoPreview)}
                  onRemove={() => {
                    setProfilePhoto(null);
                    setProfilePhotoPreview('');
                  }}
                />
                {errors.profilePhoto && (
                  <p className="mt-2 text-center text-xs text-red-500 font-semibold">{errors.profilePhoto}</p>
                )}
              </div>

              {/* Aadhaar Card */}
              <div className="flex flex-col">
                <UploadCard
                  title="Aadhaar Card"
                  description="Front scan copy. PDF or Image under 5MB."
                  accept="image/*,application/pdf"
                  file={aadhaarCard}
                  previewUrl={aadhaarCardPreview}
                  onChange={(file) => handleFileChange(file, setAadhaarCard, setAadhaarCardPreview)}
                  onRemove={() => {
                    setAadhaarCard(null);
                    setAadhaarCardPreview('');
                  }}
                />
                {errors.aadhaarCard && (
                  <p className="mt-2 text-center text-xs text-red-500 font-semibold">{errors.aadhaarCard}</p>
                )}
              </div>

              {/* PAN Card */}
              <div className="flex flex-col">
                <UploadCard
                  title="PAN Card"
                  description="Scan copy. PDF or Image under 5MB."
                  accept="image/*,application/pdf"
                  file={panCard}
                  previewUrl={panCardPreview}
                  onChange={(file) => handleFileChange(file, setPanCard, setPanCardPreview)}
                  onRemove={() => {
                    setPanCard(null);
                    setPanCardPreview('');
                  }}
                />
                {errors.panCard && (
                  <p className="mt-2 text-center text-xs text-red-500 font-semibold">{errors.panCard}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="py-4 px-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting documents...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Profile for Verification
                </>
              )}
            </motion.button>
          </div>

        </form>
      </div>
    </div>
  );
}
