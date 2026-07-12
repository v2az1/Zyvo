/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, RefreshCw, Mail, Calendar, ChevronRight, Filter, 
  Trash2, MailOpen, Inbox, ShieldAlert, Copy, Key, Sparkles
} from 'lucide-react';
import { useAppTheme } from './ThemeContext';
import { MailMessage, MailAccount } from '../types';
import { AdMobBanner } from './AdMobMock';
import { extractOTP } from '../utils/otp';
import { MailixApiService } from '../services/api';

interface InboxViewProps {
  account: MailAccount | null;
  messages: MailMessage[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onSelectMessage: (message: MailMessage) => void;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  account,
  messages,
  loading,
  onRefresh,
  onSelectMessage,
  onDeleteMessage,
  onShowToast,
}) => {
  const { t } = useAppTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);

  // AI Summary states for inline list summarization
  const [summaries, setSummaries] = useState<Record<string, string[]>>(() => {
    const cached: Record<string, string[]> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mailix_summary_')) {
          const msgId = key.replace('mailix_summary_', '');
          const val = localStorage.getItem(key);
          if (val) {
            cached[msgId] = JSON.parse(val);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return cached;
  });
  const [expandedSummaries, setExpandedSummaries] = useState<Record<string, boolean>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  const [summaryErrors, setSummaryErrors] = useState<Record<string, string | null>>({});

  const handleSummarize = async (e: React.MouseEvent, msg: MailMessage) => {
    e.stopPropagation();
    const msgId = msg.id;
    
    // Toggle collapse/expand if already summarized
    if (summaries[msgId]) {
      setExpandedSummaries(prev => ({
        ...prev,
        [msgId]: !prev[msgId]
      }));
      return;
    }

    setLoadingSummaries(prev => ({ ...prev, [msgId]: true }));
    setSummaryErrors(prev => ({ ...prev, [msgId]: null }));
    
    try {
      const subject = msg.subject || '';
      let fullBody = msg.intro || '';
      
      if (navigator.onLine && account) {
        try {
          const fullMsg = await MailixApiService.getMessageDetails(account, msg.id);
          fullBody = fullMsg.text || fullMsg.intro || msg.intro || '';
        } catch (err) {
          console.warn('Failed to fetch full message body, falling back to intro', err);
        }
      }

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, body: fullBody }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary.');
      }

      const data = await response.json();
      const bulletPoints = data.bulletPoints;
      
      if (Array.isArray(bulletPoints) && bulletPoints.length > 0) {
        localStorage.setItem(`mailix_summary_${msgId}`, JSON.stringify(bulletPoints));
        setSummaries(prev => ({ ...prev, [msgId]: bulletPoints }));
        setExpandedSummaries(prev => ({ ...prev, [msgId]: true }));
        if (onShowToast) {
          onShowToast('Summary generated!', 'success');
        }
      } else {
        throw new Error('Invalid summary format returned.');
      }
    } catch (err: any) {
      console.error(err);
      setSummaryErrors(prev => ({ ...prev, [msgId]: err.message || 'Summarization failed.' }));
      if (onShowToast) {
        onShowToast(err.message || 'Summarization failed.', 'error');
      }
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [msgId]: false }));
    }
  };

  // Search filter implementation
  const filteredMessages = messages.filter((msg) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (msg.sender?.name || '').toLowerCase().includes(query) ||
      (msg.sender?.address || '').toLowerCase().includes(query) ||
      (msg.subject || '').toLowerCase().includes(query) ||
      (msg.intro || '').toLowerCase().includes(query);

    if (filterUnread) {
      return matchesSearch && !msg.seen;
    }
    return matchesSearch;
  });

  // Render Skeleton Loading rows
  const renderSkeletons = () => {
    return Array.from({ length: 4 }).map((_, idx) => (
      <div 
        key={`skeleton-${idx}`} 
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-3 shadow-sm animate-pulse"
      >
        <div className="flex justify-between items-center">
          <div className="w-24 bg-slate-200 dark:bg-slate-800 h-3.5 rounded-full" />
          <div className="w-12 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full" />
        </div>
        <div className="w-3/4 bg-slate-200 dark:bg-slate-800 h-4 rounded-full" />
        <div className="w-5/6 bg-slate-200 dark:bg-slate-800 h-3 rounded-full" />
      </div>
    ));
  };

  return (
    <div id="mailix-inbox-dashboard" className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24 text-slate-950 dark:text-white">
      {/* Search & Header Section */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-10 px-8 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('inbox.title')}
          </h2>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Filter Toggle */}
            <button
              onClick={() => setFilterUnread(!filterUnread)}
              className={`p-2.5 rounded-full transition-all border ${
                filterUnread 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 text-blue-600 dark:text-blue-400 font-bold text-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 border-none text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Show Unread Only"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading || !navigator.onLine}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Emails"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Real Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 rtl:right-3.5 rtl:left-auto" />
          <input
            type="text"
            placeholder={t('inbox.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-2.5 pl-10 pr-4 rtl:pr-10 rtl:pl-4 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all font-medium"
          />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        
        {/* Ad Banner placement - not interrupting reader */}
        <AdMobBanner />

        {/* Main email loop list */}
        <div className="space-y-3">
          {loading ? (
            renderSkeletons()
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-[32px] shadow-sm hover:border-blue-100 dark:hover:border-blue-900/50 transition-all cursor-pointer relative overflow-hidden group select-none active:scale-99"
              >
                {/* Visual Unread dot indicator inside container */}
                {!msg.seen && (
                  <div className="absolute right-6 top-6 rtl:left-6 rtl:right-auto w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
                )}

                <div className="flex items-start gap-4">
                  {/* Sender Initial Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${
                    !msg.seen 
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {(msg.sender?.name || msg.sender?.address || '?').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm truncate pr-6 rtl:pl-6 rtl:pr-0 ${!msg.seen ? 'font-extrabold text-slate-900 dark:text-white' : 'font-semibold text-slate-600 dark:text-slate-400'}`}>
                        {msg.sender?.name || msg.sender?.address || 'Unknown'}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium shrink-0">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className={`text-xs mt-1 truncate ${!msg.seen ? 'font-bold text-slate-800 dark:text-slate-200' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                      {msg.subject || t('common.no_subject')}
                    </h4>

                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {msg.intro}
                    </p>

                    {/* OTP Detected inside Inbox item */}
                    {(() => {
                      const itemOTP = extractOTP(msg.subject, msg.intro, '', msg.intro);
                      if (!itemOTP) return null;
                      return (
                        <div className="mt-2.5 flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30">
                          <span className="flex items-center space-x-1.5 rtl:space-x-reverse text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Key className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>OTP: <span className="font-mono tracking-wider font-extrabold">{itemOTP}</span></span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(itemOTP);
                              if (onShowToast) {
                                onShowToast(`OTP Code ${itemOTP} copied!`, 'success');
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold shadow-sm flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* Inline AI Summary Content */}
                    {expandedSummaries[msg.id] && summaries[msg.id] && (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="mt-3 p-3 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/40 dark:border-blue-900/30 rounded-2xl animate-fade-in"
                      >
                        <div className="flex items-center space-x-1.5 rtl:space-x-reverse mb-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          <span>AI EMAIL SUMMARY</span>
                        </div>
                        <ul className="space-y-1.5 text-[10px] text-slate-600 dark:text-slate-300 list-none pl-0">
                          {summaries[msg.id].map((point, index) => (
                            <li key={index} className="flex items-start space-x-1.5 rtl:space-x-reverse text-left rtl:text-right">
                              <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                              <span className="leading-relaxed font-semibold">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {summaryErrors[msg.id] && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 p-2.5 bg-red-50/50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30 rounded-xl flex items-center justify-between gap-2 animate-fade-in"
                      >
                        <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 text-left truncate flex-1">
                          {summaryErrors[msg.id]}
                        </span>
                        <button
                          onClick={(e) => handleSummarize(e, msg)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-bold shrink-0 flex items-center space-x-1 cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Retry</span>
                        </button>
                      </div>
                    )}

                    {/* Sub row showing size and date */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-50 dark:border-slate-800/40 text-[10px] text-slate-400 font-medium">
                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse font-mono">
                        <Calendar className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                        <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* AI Summarize Button */}
                      <button
                        onClick={(e) => handleSummarize(e, msg)}
                        disabled={loadingSummaries[msg.id]}
                        className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border flex items-center space-x-1 transition-all hover:scale-[1.03] active:scale-97 cursor-pointer z-10 ${
                          loadingSummaries[msg.id]
                            ? 'bg-slate-100 border-slate-200 text-slate-400 animate-pulse'
                            : summaries[msg.id]
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-extrabold'
                            : 'bg-slate-50 dark:bg-slate-850 hover:bg-blue-50 dark:hover:bg-blue-950 border-slate-150 dark:border-slate-800 hover:border-blue-150 text-slate-600 dark:text-slate-400 hover:text-blue-600'
                        }`}
                        title="AI Summarize"
                      >
                        <Sparkles className={`w-3 h-3 ${loadingSummaries[msg.id] ? 'animate-spin text-blue-500' : 'text-blue-500 dark:text-blue-400'}`} />
                        <span>{loadingSummaries[msg.id] ? 'Generating...' : summaries[msg.id] ? (expandedSummaries[msg.id] ? 'Hide Summary' : 'View Summary') : 'Summarize'}</span>
                      </button>

                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                        <span>{(msg.size / 1024).toFixed(1)} KB</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Empty search results state */}
          {!loading && filteredMessages.length === 0 && searchQuery && (
            <div className="text-center py-10 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t('inbox.no_emails')}
              </p>
            </div>
          )}

          {/* Empty state visual when inbox has literally no mail */}
          {!loading && messages.length === 0 && !searchQuery && (
            <div className="text-center py-14 px-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800/80 space-y-4">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 text-slate-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Inbox className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {t('home.empty_title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {t('home.empty_desc')}
                </p>
              </div>
              <button
                onClick={onRefresh}
                className="bg-[#2563EB] text-white rounded-3xl py-4 px-8 font-semibold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all text-xs"
              >
                {t('common.refresh')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
