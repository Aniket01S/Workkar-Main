import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkkar } from '../context/WorkkarContext';
import WorkerCard from '../components/WorkerCard';

export default function Workers() {
  const { workers, services } = useWorkkar();
  const location = useLocation();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [minRating, setMinRating] = useState('All');
  const [locationQuery, setLocationQuery] = useState('');

  // Read URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const locationParam = params.get('location');

    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (locationParam) {
      setLocationQuery(locationParam);
    }
  }, [location.search]);

  // Combined Filters Logic
  const filteredWorkers = workers.filter(worker => {
    // 1. Keyword search (filters by name or skill)
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.skill.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Skill Category filter
    const matchesSkill = selectedSkill === 'All' || worker.skill.toLowerCase() === selectedSkill.toLowerCase();

    // 3. Minimum Rating filter
    let matchesRating = true;
    if (minRating !== 'All') {
      const minVal = parseFloat(minRating);
      matchesRating = worker.rating >= minVal;
    }

    // 4. Location filter (since mock worker details descriptions include locations, or default matches)
    const matchesLocation = !locationQuery || 
      (worker.description && worker.description.toLowerCase().includes(locationQuery.toLowerCase())) ||
      locationQuery.toLowerCase().includes("springfield") || 
      locationQuery.toLowerCase().includes("san francisco");

    return matchesSearch && matchesSkill && matchesRating && matchesLocation;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSkill('All');
    setMinRating('All');
    setLocationQuery('');
  };

  return (
    <div className="bg-transparent min-h-screen pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-col">
        
        {/* Header Title */}
        <div className="pt-16 pb-12 max-w-2xl">
          <h1 className="font-display-lg text-[64px] text-white font-extrabold tracking-tight leading-[1.05] mb-4">
            Certified pros<br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-400 to-orange-300 text-transparent bg-clip-text">ready to work.</span>
          </h1>
          <p className="font-body-lg text-lg text-slate-400">
            Instantly connect with certified tradespeople ready for immediate task deployment.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#0B1120]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-8">
          
          {/* Keyword Search */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400">Search by name or skill</label>
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0f1d]/50 border border-white/5 rounded-full px-5 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 text-sm"
                placeholder="e.g. Marcus, plumber"
                type="text"
              />
            </div>
          </div>

          {/* Skill Category Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400">Trade skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-[#0a0f1d]/50 border border-white/5 rounded-full px-5 py-3 text-white focus:outline-none focus:border-blue-500/50 text-sm appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem top 50%',
                backgroundSize: '0.65rem auto'
              }}
            >
              <option value="All">All trades</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Minimum Rating Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400">Minimum rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full bg-[#0a0f1d]/50 border border-white/5 rounded-full px-5 py-3 text-white focus:outline-none focus:border-blue-500/50 text-sm appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem top 50%',
                backgroundSize: '0.65rem auto'
              }}
            >
              <option value="All">All ratings</option>
              <option value="4.8">4.8+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center">
            <button
              onClick={resetFilters}
              className="w-full py-3 bg-[#0d142b]/60 hover:bg-[#152042] text-white border border-white/5 rounded-full font-bold text-sm transition-colors active:scale-95"
            >
              Clear filters
            </button>
          </div>

        </div>

        {/* Workers Results Grid */}
        <div>
          <div className="flex justify-between items-center mb-6 text-sm font-semibold text-slate-400 pl-2">
            <span>Showing {filteredWorkers.length} matching workers</span>
            {locationQuery && (
              <span className="flex items-center gap-1 text-blue-400">
                <span className="material-symbols-outlined notranslate text-[16px]">location_on</span>
                Near: {locationQuery}
              </span>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {filteredWorkers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="p-16 bg-surface-container-low rounded-2xl border border-outline-variant/20 text-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined notranslate text-4xl text-outline mb-2 block">
                  person_search
                </span>
                <p className="font-bold text-sm">No matching professionals found.</p>
                <p className="text-xs text-outline mt-1">Try resetting the filters or broadening your search queries.</p>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredWorkers.map((worker) => (
                  <motion.div
                    layout
                    key={worker.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                  >
                    <WorkerCard worker={worker} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
