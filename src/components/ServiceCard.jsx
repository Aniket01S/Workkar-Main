import React from 'react';
import { motion } from 'framer-motion';

export default function ServiceCard({ service, onClick }) {
  const { name, description, icon, color, bg } = service;

  // Determine text-color and bg-color mappings
  let iconColor = 'text-primary';
  if (color === 'secondary') iconColor = 'text-secondary';
  if (color === 'tertiary') iconColor = 'text-tertiary';

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group bg-surface-container-lowest rounded-xl p-stack-md shadow-sm border border-outline-variant/20 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center cursor-pointer"
    >
      {/* Floating animated icon container */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          repeat: Infinity,
          duration: 2.5 + Math.random() * 1.5,
          ease: "easeInOut"
        }}
        className={`w-16 h-16 rounded-full ${bg || 'bg-primary-container'} flex items-center justify-center mb-stack-sm group-hover:scale-110 transition-transform duration-200`}
      >
        <span className={`material-symbols-outlined ${iconColor} text-3xl`} data-icon={icon}>
          {icon}
        </span>
      </motion.div>
      <h3 className="font-title-md text-title-md text-on-surface mb-1 font-bold group-hover:text-primary transition-colors">
        {name}
      </h3>
      <p className="font-label-md text-label-md text-on-surface-variant line-clamp-2">
        {description}
      </p>
    </motion.div>
  );
}
