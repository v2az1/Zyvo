/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mail, Copy, RefreshCw, Sparkles, ChevronRight, History, 
  Trash2, Globe, ArrowRight, CheckCircle2, Lock, HelpCircle 
} from 'lucide-react';
import { useAppTheme } from './ThemeContext';
import { MailAccount, Domain, MailMessage } from '../types';
import { StorageService } from '../services/storage';
import { AdMobBanner, AdMobRewarded } from './AdMobMock';

interface HomeViewProps {
  account: MailAccount | null;
  domains: Domain[];
  messages: MailMessage[];
  loading: boolean;
  refreshing: boolean;
  countdown: number;
  onRefresh: () => Promise<void>;
  onGenerateAccount: (customUsername?: string, domain?: string) => Promise<void>;
  onSwitchAccount: (account: MailAccount) => void;
  onDeleteHistoryAccount: (address: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  account,
  domains,
  messages,
  loading,
  refreshing,
  countdown,
  onRefresh,
  onGenerateAccount,
  onSwitchAccount,
  onDeleteHistoryAccount,
  onShowToast,
}) => {
  const { t, language } = useAppTheme();

  // Local component states
  const [copied, setCopied] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [showCreator, setShowCreator] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Rewarded Ad triggers for Username Customization
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Loading spinner state for dynamic generation
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const accountHistory = StorageService.getAccountHistory();

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.address);
    setCopied(true);
    if (onShowToast) {
      onShowToast(t('common.copied') || 'Email address copied!', 'success');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerGenerate = async (useCustom = false) => {
    setGenerating(true);
    setGenError('');
    try {
      const username = useCustom && isUnlocked ? customUsername : undefined;
      const dom = selectedDomain || undefined;
      await onGenerateAccount(username, dom);
      setCustomUsername('');
      setIsUnlocked(false); // Reset unlock state after successful use
      setShowCreator(false);
    } catch (e: any) {
      setGenError(e.message || 'Failed to generate temporary account.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div id="mailix-home-cockpit" className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24 text-slate-950 dark:text-white">
      {/* Upper Brand Bar */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-10 px-8 py-5 flex items-center justify-between h-20">
        <div className="flex items-center space-x-3 gap-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-blue-200/50 dark:shadow-none">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('app.name')}
            </h1>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 dark:text-slate-500 leading-none mt-0.5">
              {t('app.by')}
            </span>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* History Toggle Button */}
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              setShowCreator(false);
            }}
            className={`p-2.5 rounded-full transition-all relative ${
              showHistory 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Account History"
          >
            <History className="w-5 h-5" />
            {accountHistory.length > 1 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-black text-[8px] rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {accountHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-5">
        
        {/* NETWORK STATUS BANNER FOR OFFLINE HANDLING */}
        {!navigator.onLine && (
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-3.5 rounded-2xl text-xs flex items-center space-x-2.5 rtl:space-x-reverse shadow-sm">
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-ping" />
            <p className="font-semibold">{t('offline.desc')}</p>
          </div>
        )}

        {/* 1. PRIMARY TEMP ADDRESS BLOCK */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-8 shadow-sm space-y-6 relative overflow-hidden">
          {/* subtle background mesh */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent pointer-events-none" />

          {account ? (
            <div className="space-y-6 relative z-10 text-left rtl:text-right">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-3 py-1.5 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 text-[11px] font-bold rounded-full uppercase tracking-wider">
                    Active Now
                  </span>
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-4">
                    {t('home.your_address')}
                  </h2>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
              </div>

              {/* Main Address Output Card */}
              <div 
                onClick={handleCopy}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between cursor-pointer group active:scale-99 transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/50 hover:border-blue-200/50 dark:hover:border-blue-900/50"
              >
                <div className="truncate mr-3 rtl:mr-0 rtl:ml-3 text-left rtl:text-right flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse mb-1">
                    <p className="text-xl font-bold text-slate-800 dark:text-white truncate font-mono tracking-tight leading-none">
                      {account.address.split('@')[0]}
                    </p>
                    <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors shrink-0" />
                  </div>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate font-sans">
                    @{account.address.split('@')[1]}
                  </p>
                </div>
                <button
                  className={`p-2 rounded-lg border transition-all shrink-0 ${
                    copied 
                      ? 'bg-green-100 dark:bg-green-950/30 text-green-600 border-green-200' 
                      : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 group-hover:text-blue-600 group-hover:border-blue-200 dark:group-hover:border-blue-900 shadow-sm'
                  }`}
                  aria-label="Copy Email"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              {copied && (
                <p className="text-xs text-green-500 font-bold text-center flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('common.copied')}</span>
                </p>
              )}

              {/* Expiration text & auto-refresh */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  This address is strictly private, secure and encrypted.
                </p>
                {countdown > 0 && navigator.onLine && (
                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono shrink-0">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>{t('home.auto_refresh')} {countdown}{t('common.seconds_short')}</span>
                  </div>
                )}
              </div>

              {/* Actions row: Manual refresh and creators */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <button
                  onClick={onRefresh}
                  disabled={refreshing || !navigator.onLine}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-3xl py-4 px-4 font-semibold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-xs"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{t('home.manual_refresh')}</span>
                </button>

                <button
                  onClick={() => {
                    setShowCreator(!showCreator);
                    setShowHistory(false);
                  }}
                  className="bg-[#2563EB] text-white rounded-3xl py-4 px-4 font-semibold flex items-center justify-center gap-3 shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all text-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t('home.generate_new')}</span>
                </button>
              </div>
            </div>
          ) : (
            // Placeholder when no account is active
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="font-extrabold text-slate-800 dark:text-white">Create Temporary Address</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Start instantly with a random secure address to hide your online identity.
                </p>
              </div>
              <button
                onClick={() => triggerGenerate(false)}
                disabled={generating || !navigator.onLine}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors shadow"
              >
                {generating ? t('common.loading') : t('onboard.cta')}
              </button>
            </div>
          )}
        </div>

        {/* 2. DYNAMIC GENERATION TOOLBOX CONTAINER */}
        {showCreator && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-blue-500 shrink-0 rtl:ml-2 rtl:mr-0" />
                <span>Customize Temporary Address</span>
              </h3>
              <button 
                onClick={() => setShowCreator(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                {t('common.cancel')}
              </button>
            </div>

            {/* Custom domain select list */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0 rtl:ml-1.5 rtl:mr-0" />
                <span>Select Domain Base</span>
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Random System Domain --</option>
                {domains.filter(d => d.isActive !== false).map((dom) => (
                  <option key={dom.id} value={dom.domain}>
                    @{dom.domain}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom username logic with AdMob Rewarded block */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Custom Username part</span>
                {!isUnlocked && (
                  <span className="text-[10px] text-yellow-500 font-extrabold flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> Premium Feature
                  </span>
                )}
              </label>
              
              {!isUnlocked ? (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-center space-y-2">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Watch a quick 10-second sponsor ad from Zyvo to unlock the custom username field for free!
                  </p>
                  <button
                    onClick={() => setIsAdOpen(true)}
                    className="inline-flex items-center space-x-1.5 rtl:space-x-reverse bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-[10px] font-black px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Watch Sponsor Ad & Unlock</span>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('home.custom_username_placeholder')}
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 pr-12 rtl:pr-3 rtl:pl-12"
                  />
                  <span className="absolute right-3 top-3.5 rtl:right-auto rtl:left-3 text-green-500 flex items-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                </div>
              )}
            </div>

            {genError && (
              <p className="text-[11px] text-red-500 font-semibold">{genError}</p>
            )}

            {/* CTA action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => triggerGenerate(false)}
                disabled={generating || !navigator.onLine}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-4 rounded-3xl text-xs transition-colors"
              >
                Generate Random
              </button>
              <button
                onClick={() => triggerGenerate(true)}
                disabled={generating || !navigator.onLine || (isUnlocked && !customUsername)}
                className={`flex-1 font-bold py-3.5 px-4 rounded-3xl text-xs transition-colors shadow-lg ${
                  isUnlocked && customUsername
                    ? 'bg-[#2563EB] text-white hover:bg-blue-700'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {generating ? t('common.loading') : 'Generate Customized'}
              </button>
            </div>
          </div>
        )}

        {/* 3. HISTORY MANAGER OVERLAY PANES */}
        {showHistory && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center">
                <History className="w-4 h-4 mr-2 text-[#2563EB] shrink-0 rtl:ml-2 rtl:mr-0" />
                <span>Switch Temporary Account</span>
              </h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                {t('common.cancel')}
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {accountHistory.map((histAcc) => (
                <div 
                  key={histAcc.id}
                  className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                    account?.address.toLowerCase() === histAcc.address.toLowerCase()
                      ? 'bg-blue-50/70 dark:bg-blue-900/10 border-blue-200'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSwitchAccount(histAcc);
                      setShowHistory(false);
                    }}
                    className="flex-1 text-left rtl:text-right truncate mr-2 rtl:mr-0 rtl:ml-2 font-mono text-xs text-slate-700 dark:text-slate-300"
                  >
                    <p className="font-bold truncate">{histAcc.address}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                      Created: {histAcc.createdAt ? new Date(histAcc.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </button>

                  <button
                    onClick={() => onDeleteHistoryAccount(histAcc.address)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 transition-all"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {accountHistory.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4">No previously saved email history.</p>
              )}
            </div>
          </div>
        )}

        {/* 4. INBOX SNAPSHOT PANEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('home.recent_emails')}
            </h3>
            {messages.length > 0 && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold">{messages.filter(m => !m.seen).length} Unread</span>
              </div>
            )}
          </div>

          {/* Quick email display list */}
          <div className="space-y-2">
            {messages.slice(0, 3).map((msg) => (
              <div 
                key={msg.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  !msg.seen 
                    ? 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 font-bold' 
                    : 'bg-slate-50/50 dark:bg-slate-950 border-slate-100 dark:border-slate-900 font-normal'
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-xs text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {msg.sender?.name || msg.sender?.address || 'Unknown'}
                  </p>
                  <p className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-xs text-slate-900 dark:text-slate-100 truncate mt-1">
                  {msg.subject || t('common.no_subject')}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                  {msg.intro}
                </p>
              </div>
            ))}

            {/* Empty state visual when no emails have arrived */}
            {messages.length === 0 && (
              <div className="text-center py-6 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 mx-auto animate-pulse">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('home.empty_title')}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs mx-auto">
                    {t('home.empty_desc')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* REUSABLE INTEGRATED BANNER AD */}
        <AdMobBanner />

        {/* 5. QUICK INFO CARD */}
        <div className="bg-slate-900 dark:bg-slate-900/60 border-none rounded-[32px] p-6 text-white flex items-start gap-4 shadow-lg shadow-slate-900/10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            <Globe className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight text-white mb-1">
              How to use temporary mail
            </h4>
            <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
              {t('home.empty_subdesc')} Since domains change periodically to remain secure, remember to copy and store your account credentials if you wish to restore it within its active window.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL AD REWARD CONTROLLER */}
      <AdMobRewarded
        isOpen={isAdOpen}
        onClose={() => setIsAdOpen(false)}
        onRewardEarned={() => {
          setIsUnlocked(true);
          alert('Reward unlocked! You can now register a custom username for your temporary email account.');
        }}
      />
    </div>
  );
};
