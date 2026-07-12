/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppTheme } from './ThemeContext';

interface SplashProps {
  onFinish: () => void;
}

export const SplashView: React.FC<SplashProps> = ({ onFinish }) => {
  const { t } = useAppTheme();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate a smooth, modern fluid progress loader
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 400); // Wait a split second at 100% before transitioning
          return 100;
        }
        // Organic speed fluctuation to simulate dynamic network pinging
        const increment = prev < 30 ? 4 : prev < 70 ? 2 : prev < 90 ? 1.5 : 0.8;
        return Math.min(prev + increment, 100);
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div 
      id="mailix-splash-screen"
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-between py-16 px-6 select-none"
    >
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        {/* Animated Brand Logo Icon Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-20 h-20 rounded-3xl bg-blue-600 dark:bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 dark:shadow-blue-500/10 relative"
        >
          <Mail className="w-10 h-10 text-white" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            className="absolute -right-2 -top-2 bg-yellow-400 dark:bg-yellow-500 text-slate-950 p-1 rounded-full shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </motion.div>
        </motion.div>

        {/* Brand Typography */}
        <div className="text-center space-y-1.5">
          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            {t('app.name')}
          </motion.h1>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 0.7 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[250px] mx-auto leading-relaxed"
          >
            {t('app.tagline')}
          </motion.p>
        </div>
      </div>

      {/* Loading bar and Pakistani optimizations signature */}
      <div className="w-full max-w-xs space-y-4 flex flex-col items-center">
        {/* Progress Bar container */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Footer Subtext */}
        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          <span>{t('app.by')}</span>
        </div>
      </div>
    </div>
  );
};
