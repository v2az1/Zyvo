/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Zap, Globe, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppTheme } from './ThemeContext';

interface WelcomeProps {
  onStart: () => void;
}

export const WelcomeView: React.FC<WelcomeProps> = ({ onStart }) => {
  const { t, language, setLanguage } = useAppTheme();

  return (
    <div 
      id="mailix-onboarding-screen"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-6 overflow-y-auto"
    >
      {/* Upper Section: Language Toggle and Header Logo */}
      <div className="w-full flex justify-between items-center py-2 max-w-lg mx-auto">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-black">
            M
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-white">
            Mailix
          </span>
        </div>

        {/* Dynamic Regional Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
          className="flex items-center space-x-1.5 rtl:space-x-reverse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm active:scale-95 transition-all"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'اردو (Urdu)' : 'English'}</span>
        </button>
      </div>

      {/* Main Core Walkthrough */}
      <div className="my-auto max-w-md mx-auto w-full space-y-8 py-6">
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-extrabold text-[11px] px-3.5 py-1.5 rounded-full uppercase tracking-wider"
          >
            {t('common.welcome')}
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {t('onboard.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('onboard.desc')}
          </p>
        </div>

        {/* Key Feature List */}
        <div className="space-y-4">
          {/* Feature 1: Privacy */}
          <div className="flex items-start space-x-3 rtl:space-x-reverse bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Zero Personal Logs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                No sign-ups or telephone validations. Your identity stays completely hidden from third-party networks.
              </p>
            </div>
          </div>

          {/* Feature 2: Speed / Network optimized */}
          <div className="flex items-start space-x-3 rtl:space-x-reverse bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
            <div className="p-2 rounded-xl bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {t('onboard.optimized')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {t('onboard.optimized_desc')}
              </p>
            </div>
          </div>

          {/* Feature 3: Performance on budget devices */}
          <div className="flex items-start space-x-3 rtl:space-x-reverse bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Low RAM Usage
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Optimized state memory structures. Runs smoothly on budget processors and 2GB RAM phones.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Button & Footer details */}
      <div className="w-full max-w-md mx-auto space-y-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-500/15 text-sm transition-all flex items-center justify-center space-x-2"
        >
          <span>{t('onboard.cta')}</span>
        </motion.button>

        <div className="text-center text-[10px] text-slate-400 dark:text-slate-500">
          By continuing, you agree to Zyvo's Mailix Terms & Privacy Policy.
        </div>
      </div>
    </div>
  );
};
