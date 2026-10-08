import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWorkkar } from '../context/WorkkarContext';

export default function WorkerCard({ worker }) {
  const { user } = useWorkkar();
  const { id, name, skill, skillTitle, experience, rating, rate, availability, verified } = worker;

  // Extract initials
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'WK';

  // Theme mapping based on skill for the gradient glow and avatar background
  const themeMap = {
    Electrician: { bg: 'bg-blue-600', text: 'text-blue-500', shadow: 'shadow-[0_0_15px_rgba(37,99,235,0.5)]', glow: 'bg-blue-600' },
    Plumber: { bg: 'bg-orange-500', text: 'text-orange-500', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]', glow: 'bg-orange-500' },
    Mason: { bg: 'bg-pink-500', text: 'text-pink-500', shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]', glow: 'bg-pink-500' },
    Painter: { bg: 'bg-purple-500', text: 'text-purple-500', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]', glow: 'bg-purple-500' },
    Carpenter: { bg: 'bg-amber-500', text: 'text-amber-500', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]', glow: 'bg-amber-500' },
    Cleaner: { bg: 'bg-teal-500', text: 'text-teal-500', shadow: 'shadow-[0_0_15px_rgba(20,184,166,0.5)]', glow: 'bg-teal-500' },
    Welder: { bg: 'bg-rose-500', text: 'text-rose-500', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]', glow: 'bg-rose-500' },
    Gardener: { bg: 'bg-green-500', text: 'text-green-500', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]', glow: 'bg-green-500' }
  };

  const theme = themeMap[skill] || { bg: 'bg-blue-600', text: 'text-blue-500', shadow: 'shadow-blue-500/50', glow: 'bg-blue-600' };

  let dotColor = 'bg-slate-400';
  if (availability === 'Available') dotColor = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]';
  if (availability === 'On Job') dotColor = 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative overflow-hidden bg-[#0B1120]/80 rounded-[28px] p-6 border border-white/5 transition-all duration-300 flex flex-col justify-between"
      style={{
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Background Gradient Glow top-left */}
      <div className={`absolute -top-10 -left-10 w-32 h-32 ${theme.glow} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-300`}></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl ${theme.bg} ${theme.shadow} flex items-center justify-center text-white font-extrabold text-xl overflow-hidden`}>
                {worker.avatar ? (
                  <img src={worker.avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {/* Online status indicator dot */}
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 ${dotColor} border-[3px] border-[#0B1120] rounded-full`}></span>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold flex items-center gap-1.5 leading-tight">
                {name}
                {verified && (
                  <span className="material-symbols-outlined notranslate text-green-500 text-[18px] fill">
                    verified
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">{skillTitle || `${skill} Specialist`}</p>
            </div>
          </div>

          <div className="bg-[#152042] border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <span className="material-symbols-outlined notranslate text-orange-500 text-[14px] fill">star</span>
            <span className="text-orange-500 text-xs font-bold">
              {rating ? rating.toFixed(1) : 'New'}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-white/10 my-5"></div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">
            {experience} yrs experience
          </span>
          <div className="flex items-end gap-1">
            <span className="text-2xl text-white font-extrabold leading-none">₹{rate}</span>
            <span className="text-sm text-slate-400 leading-none mb-0.5">/hr</span>
          </div>
        </div>

        {/* Link overlay */}
        {user?.role !== 'worker' && (
          <Link
            to={`/worker-details/${id}`}
            className="absolute inset-0 z-20 rounded-[28px]"
            aria-label={`View details for ${name}`}
          ></Link>
        )}
      </div>
    </motion.div>
  );
}
