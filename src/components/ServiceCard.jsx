import React from 'react';
import { motion } from 'framer-motion';

export default function ServiceCard({ service, onClick }) {
  const { id, name, description, icon } = service;

  // Exact color mapping from the premium dark theme screenshot
  const themeMap = {
    electrician: { bg: 'bg-blue-500', text: 'text-blue-400', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]', hoverBorder: 'group-hover:border-blue-500/50' },
    plumber: { bg: 'bg-orange-500', text: 'text-orange-400', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]', hoverBorder: 'group-hover:border-orange-500/50' },
    mason: { bg: 'bg-pink-500', text: 'text-pink-400', shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]', hoverBorder: 'group-hover:border-pink-500/50' },
    painter: { bg: 'bg-purple-500', text: 'text-purple-400', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]', hoverBorder: 'group-hover:border-purple-500/50' },
    carpenter: { bg: 'bg-amber-500', text: 'text-amber-400', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]', hoverBorder: 'group-hover:border-amber-500/50' },
    cleaner: { bg: 'bg-teal-400', text: 'text-teal-300', shadow: 'shadow-[0_0_15px_rgba(45,212,191,0.5)]', hoverBorder: 'group-hover:border-teal-400/50' },
    welder: { bg: 'bg-rose-500', text: 'text-rose-400', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]', hoverBorder: 'group-hover:border-rose-500/50' },
    gardener: { bg: 'bg-green-500', text: 'text-green-400', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]', hoverBorder: 'group-hover:border-green-500/50' }
  };

  const theme = themeMap[id] || { bg: 'bg-blue-500', text: 'text-blue-400', shadow: 'shadow-blue-500/50', hoverBorder: 'group-hover:border-blue-500/50' };

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden bg-[#0B1120]/80 rounded-2xl p-6 border border-white/5 ${theme.hoverBorder} transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[160px]`}
      style={{
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Background Gradient Glow */}
      <div className={`absolute -top-10 -left-10 w-32 h-32 ${theme.bg} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-300`}></div>
      
      {/* Large Watermark Icon */}
      <span className={`absolute -right-4 -bottom-6 text-[100px] material-symbols-outlined notranslate ${theme.text} opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-300 transform group-hover:scale-110 group-hover:-rotate-6`} style={{ zIndex: 0 }}>
        {icon}
      </span>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-2xl ${theme.bg} ${theme.shadow} flex items-center justify-center text-white`}>
            <span className="material-symbols-outlined notranslate text-2xl">
              {icon}
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="font-display-lg text-xl text-white font-extrabold mb-1">
            {name}
          </h3>
          <p className="font-body-md text-sm text-slate-400 max-w-[85%]">
            {description}
          </p>
        </div>
      </div>

      {/* Arrow Button */}
      <div className="absolute right-4 bottom-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-black/20 group-hover:bg-white/10 transition-colors z-10">
        <span className="material-symbols-outlined notranslate text-white text-sm">
          arrow_forward
        </span>
      </div>
    </motion.div>
  );
}
