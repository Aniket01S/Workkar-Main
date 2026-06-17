import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkkar } from '../context/WorkkarContext';

export default function WorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workers, bookWorker } = useWorkkar();

  // Find worker details
  const worker = workers.find(w => w.id === id);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingDesc, setBookingDesc] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  if (!worker) {
    return (
      <div className="py-20 text-center text-on-surface-variant bg-background min-h-screen">
        <span className="material-symbols-outlined text-4xl mb-2">error</span>
        <h2 className="font-bold text-lg">Worker Not Found</h2>
        <button onClick={() => navigate('/workers')} className="mt-4 text-primary hover:underline font-semibold text-xs">
          Back to Directory
        </button>
      </div>
    );
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    const success = await bookWorker(worker.id, {
      date: bookingDate,
      time: bookingTime,
      address: bookingAddress,
      description: bookingDesc
    });

    if (success) {
      setIsBooked(true);
      // Reset form
      setBookingDate('');
      setBookingTime('');
      setBookingAddress('');
      setBookingDesc('');
    }
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Worker Profile Details (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Breadcrumb / Back button */}
          <button 
            onClick={() => navigate('/workers')}
            className="flex items-center gap-1 text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-white transition-colors text-xs font-bold self-start active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 rounded px-2 py-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Directory
          </button>

          {/* Profile Card details */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow-base p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {worker.avatar ? (
                <img 
                  src={worker.avatar} 
                  alt={worker.name} 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-outline-variant/30 shadow"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold text-3xl border border-outline-variant/30 shadow">
                  {worker.textAvatar || worker.name.substring(0, 2)}
                </div>
              )}
              
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-headline-lg text-2xl md:text-headline-md text-on-surface font-extrabold leading-none">
                    {worker.name}
                  </h1>
                  {worker.verified && (
                    <span className="material-symbols-outlined text-green-600 text-[20px] fill" title="Verified Worker">
                      verified
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    worker.availability === 'Available' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/40' 
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 dark:border dark:border-orange-800/40'
                  }`}>
                    {worker.availability}
                  </span>
                </div>
                
                <p className="font-title-md text-title-md text-on-surface-variant font-medium">
                  {worker.skillTitle || `${worker.skill} Specialist`}
                </p>
                
                <div className="flex items-center gap-4 flex-wrap text-xs font-semibold text-on-surface-variant mt-2">
                  <span className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px] text-secondary-container fill">star</span>
                    {worker.rating ? worker.rating.toFixed(1) : 'New'} Rating
                  </span>
                  <span className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px] text-outline">work</span>
                    {worker.experience} Years Experience
                  </span>
                  <span className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-full text-primary font-bold">
                    ${worker.rate}/Hour Rate
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-outline-variant/20 pt-6 mt-6">
              <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-2">About {worker.name.split(' ')[0]}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {worker.description}
              </p>
            </div>
          </section>

          {/* Reviews List */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow-base p-6">
            <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-3">
              Customer Reviews ({worker.reviews.length})
            </h3>
            
            {worker.reviews.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-3xl text-outline mb-1 block">chat_bubble_outline</span>
                No reviews yet for this worker. Be the first to book and rate!
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {worker.reviews.map(rev => (
                  <div key={rev.id} className="p-4 bg-surface rounded-xl border border-outline-variant/10 flex flex-col gap-2">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="font-bold text-sm text-on-surface">{rev.user}</span>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <div className="flex text-secondary-container">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`material-symbols-outlined text-[12px] ${i < Math.floor(rev.rating) ? 'fill' : ''}`}>star</span>
                          ))}
                        </div>
                        <span>• {rev.date}</span>
                      </div>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Booking Side Form (4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 ambient-shadow-base p-6 sticky top-24">
            
            {isBooked ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8 flex flex-col items-center gap-4"
              >
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl fill">check_circle</span>
                </div>
                <h3 className="font-bold text-headline-sm text-on-surface">Booking Successful!</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-xs px-2 leading-relaxed">
                  Your booking request has been dispatched. {worker.name} has received a live alert notification on their app.
                </p>
                <div className="flex flex-col gap-2 w-full mt-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/95 transition-all font-bold text-sm shadow active:scale-95 cursor-pointer"
                  >
                    Track Request on Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/worker/dashboard')}
                    className="w-full py-2 border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container rounded-lg font-bold text-xs transition-colors cursor-pointer"
                  >
                    Open Worker Companion (Demo)
                  </button>
                  <button
                    onClick={() => setIsBooked(false)}
                    className="w-full py-2 border border-outline text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors text-xs cursor-pointer"
                  >
                    Book Again
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-4 border-b border-outline-variant/20 pb-3">
                  Book Service
                </h3>

                <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-xs text-on-surface-variant">Scheduled Date</label>
                    <input 
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      type="date" 
                      className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-xs text-on-surface-variant">Preferred Time</label>
                    <input 
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      type="time" 
                      className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-xs text-on-surface-variant">Service Address</label>
                    <input 
                      required
                      value={bookingAddress}
                      onChange={(e) => setBookingAddress(e.target.value)}
                      placeholder="e.g. 1428 Elm Street, Springfield"
                      type="text" 
                      className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-xs text-on-surface-variant">Task Description</label>
                    <textarea 
                      required
                      rows={3}
                      value={bookingDesc}
                      onChange={(e) => setBookingDesc(e.target.value)}
                      placeholder="Describe the job (e.g., install new living room shelves)..."
                      className="w-full bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={worker.availability === 'Offline'}
                    className={`w-full py-3 bg-primary text-on-primary rounded-lg transition-all font-bold text-xs text-center mt-2 shadow hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 border-none ${
                      worker.availability === 'Offline' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-primary/90'
                    }`}
                  >
                    {worker.availability === 'Offline' ? 'Worker Offline' : 'Confirm Instant Booking'}
                  </button>
                </form>
              </>
            )}

          </section>

        </div>

      </div>
    </div>
  );
}
