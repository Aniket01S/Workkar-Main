import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Count-up hook for statistic animation
export function CountUp({ end, duration = 0.8 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Strip commas for parsing
    const cleanEnd = typeof end === 'string' ? end.replace(/,/g, '') : end;
    const endNum = parseFloat(cleanEnd);
    
    if (isNaN(endNum)) {
      setCount(end); // Not a number, return string directly
      return;
    }

    let start = 0;
    const step = Math.max(Math.ceil(endNum / 30), 1);
    const intervalTime = Math.max(Math.floor((duration * 1000) / (endNum / step)), 15);

    const timer = setInterval(() => {
      start += step;
      if (start >= endNum) {
        clearInterval(timer);
        setCount(end); // Set to exact final value
      } else {
        setCount(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
}

export default function DashboardCard({
  icon,
  iconBg = 'bg-surface-container-high text-primary',
  title,
  value,
  trend,
  trendType = 'positive', // 'positive' (green), 'neutral' (gray), 'negative' (red)
  footerLabel,
  footerLinkText,
  footerLinkAction,
  largeIcon
}) {
  let trendBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/50';
  let trendIcon = 'trending_up';

  if (trendType === 'negative') {
    trendBg = 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 dark:border dark:border-rose-800/50';
    trendIcon = 'trending_down';
  } else if (trendType === 'neutral') {
    trendBg = 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30 dark:bg-surface-container-high dark:text-on-surface-variant';
    trendIcon = 'trending_flat';
  }

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0px 8px 24px rgba(0,0,0,0.06)' }}
      className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant/30 ambient-shadow-base flex flex-col justify-between h-full relative overflow-hidden group transition-all duration-300"
    >
      {/* Decorative background icon */}
      {largeIcon && (
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
          <span className="material-symbols-outlined text-5xl select-none">{largeIcon}</span>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
          <h3 className="font-title-md text-title-md text-on-surface font-semibold">{title}</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display-lg text-display-lg text-on-surface font-bold">
            {value.toString().startsWith('$') ? (
              <>
                $
                <CountUp end={value.toString().substring(1)} />
              </>
            ) : (
              <CountUp end={value} />
            )}
          </span>
          {trend && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${trendBg}`}>
              {trendType !== 'neutral' && <span className="material-symbols-outlined text-[14px]">{trendIcon}</span>}
              {trend}
            </span>
          )}
        </div>
      </div>

      {(footerLabel || footerLinkText) && (
        <div className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between items-center text-on-surface-variant text-xs">
          <span>{footerLabel}</span>
          {footerLinkText && (
            <button
              onClick={footerLinkAction}
              className="font-semibold text-primary hover:underline flex items-center gap-0.5 active:scale-95 transition-transform"
            >
              {footerLinkText}
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
