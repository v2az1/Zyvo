/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, Settings, ShieldCheck, MailWarning } from 'lucide-react';
import { useAppTheme } from './ThemeContext';

export type ActiveTab = 'home' | 'inbox' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, unreadCount }) => {
  const { t } = useAppTheme();

  return (
    <nav 
      id="mailix-bottom-navigation"
      className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 pb-safe shadow-lg fixed bottom-0 left-0 right-0 z-30 select-none"
    >
      <div className="max-w-xl mx-auto flex justify-around items-center h-20 px-4">
        {/* TAB 1: HOME (TEMPORARY EMAIL CONTROLS) */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex flex-col items-center justify-center w-20 h-full relative group"
          aria-label="Home Screen"
        >
          <div className="relative flex flex-col items-center">
            {/* Active Pill Highlight Indicator */}
            <div 
              className={`absolute -inset-x-4 -inset-y-1.5 rounded-full transition-all duration-300 ${
                activeTab === 'home' 
                  ? 'bg-blue-50 dark:bg-blue-950/40 scale-100 opacity-100' 
                  : 'scale-75 opacity-0'
              }`}
            />
            <Mail 
              className={`w-5 h-5 z-10 transition-all duration-300 ${
                activeTab === 'home' 
                  ? 'text-blue-600 dark:text-blue-400 scale-110' 
                  : 'text-slate-400 dark:text-slate-500'
              }`} 
            />
          </div>
          <span 
            className={`text-[10px] font-bold mt-1.5 z-10 transition-colors duration-300 ${
              activeTab === 'home' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Email
          </span>
        </button>

        {/* TAB 2: INBOX */}
        <button
          onClick={() => setActiveTab('inbox')}
          className="flex flex-col items-center justify-center w-20 h-full relative group"
          aria-label="Inbox View"
        >
          <div className="relative flex flex-col items-center">
            <div 
              className={`absolute -inset-x-4 -inset-y-1.5 rounded-full transition-all duration-300 ${
                activeTab === 'inbox' 
                  ? 'bg-blue-50 dark:bg-blue-950/40 scale-100 opacity-100' 
                  : 'scale-75 opacity-0'
              }`}
            />
            <div className="relative z-10">
              <MailWarning 
                className={`w-5 h-5 transition-all duration-300 ${
                  activeTab === 'inbox' 
                    ? 'text-blue-600 dark:text-blue-400 scale-110' 
                    : 'text-slate-400 dark:text-slate-500'
                }`} 
              />
              {/* Unread Message Count Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-black text-[9px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center border border-white dark:border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          <span 
            className={`text-[10px] font-bold mt-1.5 z-10 transition-colors duration-300 ${
              activeTab === 'inbox' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('inbox.unread_badge')}
          </span>
        </button>

        {/* TAB 3: SETTINGS */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex flex-col items-center justify-center w-20 h-full relative group"
          aria-label="Settings Screen"
        >
          <div className="relative flex flex-col items-center">
            <div 
              className={`absolute -inset-x-4 -inset-y-1.5 rounded-full transition-all duration-300 ${
                activeTab === 'settings' 
                  ? 'bg-blue-50 dark:bg-blue-950/40 scale-100 opacity-100' 
                  : 'scale-75 opacity-0'
              }`}
            />
            <Settings 
              className={`w-5 h-5 z-10 transition-all duration-300 ${
                activeTab === 'settings' 
                  ? 'text-blue-600 dark:text-blue-400 scale-110' 
                  : 'text-slate-400 dark:text-slate-500'
              }`} 
            />
          </div>
          <span 
            className={`text-[10px] font-bold mt-1.5 z-10 transition-colors duration-300 ${
              activeTab === 'settings' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('common.settings')}
          </span>
        </button>
      </div>
    </nav>
  );
};
