/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Palette, Globe, RefreshCw, Bell, Trash2, ShieldCheck, 
  ChevronRight, ArrowLeft, Star, Share2, HelpCircle, FileText, Info
} from 'lucide-react';
import { useAppTheme } from './ThemeContext';
import { StorageService } from '../services/storage';
import { AboutView } from './AboutView';
import { PrivacyView } from './PrivacyView';
import { TermsView } from './TermsView';

interface SettingsViewProps {
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const { 
    theme, setTheme, language, setLanguage, settings, updateSettings, t 
  } = useAppTheme();

  // Navigation within settings
  const [activeSubscreen, setActiveSubscreen] = useState<'none' | 'about' | 'privacy' | 'terms'>('none');
  const [cacheClearedMsg, setCacheClearedMsg] = useState(false);

  const handleClearCache = () => {
    if (window.confirm(t('detail.delete_confirm'))) {
      StorageService.clearAllCache();
      setCacheClearedMsg(true);
      if (onShowToast) {
        onShowToast(t('settings.cache_cleared') || 'Cache cleared!', 'success');
      }
      setTimeout(() => setCacheClearedMsg(false), 4000);
    }
  };

  const handleRateApp = () => {
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=pk.zyvo.mailix';
    navigator.clipboard.writeText(playStoreUrl);
    if (onShowToast) {
      onShowToast('Google Play Link copied! Directing to Play Store...', 'info');
    }
    setTimeout(() => {
      window.open(playStoreUrl, '_blank');
    }, 1200);
  };

  const handleShareApp = () => {
    const shareUrl = 'https://play.google.com/store/apps/details?id=pk.zyvo.mailix';
    if (navigator.share) {
      navigator.share({
        title: 'Mailix Temporary Email',
        text: 'Protect your inbox from spam! Generate clean temporary emails instantly with Mailix by Zyvo.',
        url: shareUrl,
      }).catch((err) => {
        if (err.name !== 'AbortError' && !err.message?.includes('canceled')) {
          console.error('Error sharing app:', err);
        }
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      if (onShowToast) {
        onShowToast('Share link copied to clipboard!', 'success');
      }
    }
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@zyvo.pk?subject=Mailix%20Android%20Support%20Request';
  };

  if (activeSubscreen === 'about') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-20 flex items-center px-8 h-20">
          <button onClick={() => setActiveSubscreen('none')} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300 mr-3 rtl:mr-0 rtl:ml-3">
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <span className="font-bold text-slate-900 dark:text-white text-lg">
            {t('common.about')}
          </span>
        </div>
        <AboutView onBack={() => setActiveSubscreen('none')} />
      </div>
    );
  }

  if (activeSubscreen === 'privacy') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-20 flex items-center px-8 h-20">
          <button onClick={() => setActiveSubscreen('none')} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300 mr-3 rtl:mr-0 rtl:ml-3">
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <span className="font-bold text-slate-900 dark:text-white text-lg">
            {t('settings.privacy')}
          </span>
        </div>
        <PrivacyView onBack={() => setActiveSubscreen('none')} />
      </div>
    );
  }

  if (activeSubscreen === 'terms') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-20 flex items-center px-8 h-20">
          <button onClick={() => setActiveSubscreen('none')} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300 mr-3 rtl:mr-0 rtl:ml-3">
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <span className="font-bold text-slate-900 dark:text-white text-lg">
            {t('settings.terms')}
          </span>
        </div>
        <TermsView onBack={() => setActiveSubscreen('none')} />
      </div>
    );
  }

  return (
    <div id="mailix-settings-dashboard" className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24 text-slate-900 dark:text-white">
      {/* Settings Screen Header */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-10 px-8 py-5 flex items-center justify-between h-20">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('settings.title')}
        </h2>
        <span className="text-[10px] bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Zyvo Pro
        </span>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-6">
        {/* SECTION 1: GENERAL CONFIGS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-8 shadow-sm space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('settings.general')}
          </h3>

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center">
              <Palette className="w-4 h-4 mr-2 text-slate-400 shrink-0 rtl:ml-2 rtl:mr-0" />
              <span>{t('settings.theme')}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((tMode) => (
                <button
                  key={tMode}
                  onClick={() => setTheme(tMode)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    theme === tMode
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t(`settings.theme.${tMode}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-slate-400 shrink-0 rtl:ml-2 rtl:mr-0" />
              <span>{t('settings.language')}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['en', 'ur'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`py-2 px-4 text-xs font-bold rounded-xl border transition-all ${
                    language === lang
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t(`settings.language.${lang}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Refresh Interval */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center">
              <RefreshCw className="w-4 h-4 mr-2 text-slate-400 shrink-0 rtl:ml-2 rtl:mr-0" />
              <span>{t('settings.refresh_interval')}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 15, label: t('settings.refresh.15s') },
                { val: 30, label: t('settings.refresh.30s') },
                { val: 60, label: t('settings.refresh.60s') },
                { val: 0, label: t('settings.refresh.disabled') },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => updateSettings({ autoRefreshInterval: item.val })}
                  className={`py-2 px-3 text-[11px] font-bold rounded-xl border transition-all ${
                    settings.autoRefreshInterval === item.val
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-start space-x-3 rtl:space-x-reverse pr-2">
              <Bell className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {t('settings.notifications')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('settings.notifications_desc')}
                </p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                settings.notificationsEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow ${
                  settings.notificationsEnabled 
                    ? language === 'ur' ? 'left-0.5' : 'right-0.5'
                    : language === 'ur' ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* SECTION 2: STORAGE / CACHE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-8 shadow-sm space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('settings.cache')}
          </h3>

          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {t('settings.clear_cache')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {t('settings.clear_cache_desc')}
              </p>
            </div>
            <button
              onClick={handleClearCache}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/45 text-red-600 dark:text-red-400 transition-colors shrink-0"
              aria-label="Clear Storage"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {cacheClearedMsg && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 text-xs font-semibold rounded-xl">
              {t('settings.cache_cleared')}
            </div>
          )}
        </div>

        {/* SECTION 3: APP INFO & ABOUT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-6 shadow-sm space-y-1 overflow-hidden">
          <button
            onClick={() => setActiveSubscreen('about')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors text-left rtl:text-right"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Info className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('common.about')}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 rtl:rotate-180" />
          </button>

          <button
            onClick={() => setActiveSubscreen('privacy')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors text-left rtl:text-right"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <FileText className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('settings.privacy')}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 rtl:rotate-180" />
          </button>

          <button
            onClick={() => setActiveSubscreen('terms')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors text-left rtl:text-right"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('settings.terms')}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 rtl:rotate-180" />
          </button>

          <button
            onClick={handleRateApp}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors text-left rtl:text-right"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Star className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('settings.rate')}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 rtl:rotate-180" />
          </button>

          <button
            onClick={handleShareApp}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors text-left rtl:text-right"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Share2 className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('settings.share')}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 rtl:rotate-180" />
          </button>

          <button
            onClick={handleContactSupport}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors text-left rtl:text-right"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('settings.support')}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 rtl:rotate-180" />
          </button>
        </div>

        {/* Version Display and ad banner mapping */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            {t('settings.version')}: 2.4.0-pk (Zyvo Release Build)
          </p>
          <p className="text-[9px] text-slate-400 dark:text-slate-600">
            AdMob Framework configured (Dev Mode placeholders enabled)
          </p>
        </div>
      </div>
    </div>
  );
};
