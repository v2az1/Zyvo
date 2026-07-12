/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Mail, Globe, Users } from 'lucide-react';
import { useAppTheme } from './ThemeContext';

interface DocumentViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<DocumentViewProps> = ({ onBack }) => {
  const { t } = useAppTheme();

  return (
    <div id="mailix-about-screen" className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 max-w-xl mx-auto w-full">
        {/* Brand Logo Banner */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('about.title')}
            </h1>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-full uppercase mt-2 inline-block tracking-wider">
              Zyvo Enterprise Product
            </span>
          </div>
        </div>

        {/* Text descriptions */}
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>{t('about.p1')}</p>
          <p>{t('about.p2')}</p>
          <p>{t('about.p3')}</p>
        </div>

        {/* Operational Statistics Cards */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-center">
            <ShieldCheck className="w-5 h-5 text-green-500 mx-auto mb-1.5" />
            <h4 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Privacy Level</h4>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">100% Military</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-center">
            <Globe className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
            <h4 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Network Ping</h4>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">&lt; 150ms</p>
          </div>
        </div>

        {/* Open Source Licenses / Team credits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center">
            <Users className="w-4 h-4 mr-2 text-slate-500 shrink-0 rtl:ml-2 rtl:mr-0" />
            <span>Open Source Acknowledgement</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Mailix utilizes open-source resources, including the Mail.tm secure API cluster, React 19, Capacitor runtime bridges, Lucide icons, and Tailwind styling engines.
          </p>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 font-mono">
            License Ref: MIT, Apache-2.0, BSD-3-Clause
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 pt-6">
          {t('about.footer')}
        </p>
      </div>
    </div>
  );
};
