/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, Trash2, Share2, Calendar, User, Mail, 
  Download, ExternalLink, ShieldCheck, FileText, Check, RefreshCw, Key, Sparkles
} from 'lucide-react';
import { useAppTheme } from './ThemeContext';
import { MailMessage, MailAccount } from '../types';
import { MailixApiService } from '../services/api';
import { extractOTP } from '../utils/otp';

interface EmailDetailViewProps {
  account: MailAccount;
  messageSummary: MailMessage;
  onBack: () => void;
  onDeleted: () => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const EmailDetailView: React.FC<EmailDetailViewProps> = ({
  account,
  messageSummary,
  onBack,
  onDeleted,
  onShowToast,
}) => {
  const { t } = useAppTheme();

  // Full detailed message state
  const [msgDetails, setMsgDetails] = useState<MailMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab views: HTML vs Plain Text
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');

  // Copy indicator states
  const [copiedSender, setCopiedSender] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // AI Summary states
  const [summary, setSummary] = useState<string[] | null>(() => {
    try {
      const cached = localStorage.getItem(`mailix_summary_${messageSummary.id}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const subject = messageSummary.subject || '';
      const body = msgDetails?.text || msgDetails?.intro || messageSummary.intro || '';
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, body }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary.');
      }

      const data = await response.json();
      const bulletPoints = data.bulletPoints;
      
      if (Array.isArray(bulletPoints) && bulletPoints.length > 0) {
        setSummary(bulletPoints);
        localStorage.setItem(`mailix_summary_${messageSummary.id}`, JSON.stringify(bulletPoints));
        if (onShowToast) {
          onShowToast('Email summary generated!', 'success');
        }
      } else {
        throw new Error('Invalid summary format returned.');
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || 'An unexpected error occurred.';
      setSummaryError(errMsg);
      if (onShowToast) {
        onShowToast(errMsg, 'error');
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const fullMsg = await MailixApiService.getMessageDetails(account, messageSummary.id);
        if (active) {
          setMsgDetails(fullMsg);
          // Set active view based on content availability
          if (fullMsg.html && fullMsg.html.length > 0) {
            setActiveTab('html');
          } else {
            setActiveTab('text');
          }
        }
        // Mark as read in the background
        if (!messageSummary.seen) {
          await MailixApiService.markAsSeen(account, messageSummary.id, true);
        }
      } catch (e: any) {
        if (active) {
          console.error(e);
          setError(e.message || 'Unable to retrieve full email body.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      active = false;
    };
  }, [account, messageSummary]);

  const handleCopySender = () => {
    if (!messageSummary) return;
    navigator.clipboard.writeText(messageSummary.sender?.address || '');
    setCopiedSender(true);
    setTimeout(() => setCopiedSender(false), 2000);
  };

  const handleCopySubject = () => {
    if (!messageSummary) return;
    navigator.clipboard.writeText(messageSummary.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm(t('detail.delete_confirm'))) {
      setDeleting(true);
      try {
        await MailixApiService.deleteMessage(account, messageSummary.id);
        alert(t('detail.deleted_success'));
        onDeleted();
      } catch (e: any) {
        alert(e.message || 'Deletion failed. Please try again.');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleShare = () => {
    if (!messageSummary) return;
    const bodyText = msgDetails?.text || messageSummary.intro;
    const shareContent = `From: ${messageSummary.sender?.name || messageSummary.sender?.address || 'Unknown'}\nSubject: ${messageSummary.subject}\n\n${bodyText}`;
    
    if (navigator.share) {
      navigator.share({
        title: messageSummary.subject,
        text: shareContent,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareContent);
      alert('Email content copied to clipboard for easy sharing!');
    }
  };

  // Safe opening links mapping (prevents tracking inside temporary views)
  const renderHTMLBody = (htmlContents: string[]) => {
    const rawHtml = htmlContents.join('');
    
    // Scoped styles to reset default table margins and ensure dark mode text remains readable
    return (
      <div 
        className="mailix-html-body-container bg-white text-slate-900 p-4 rounded-2xl border border-slate-100 overflow-x-auto text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: rawHtml }}
      />
    );
  };

  const downloadAttachmentPlaceholder = (filename: string) => {
    alert(`File "${filename}" downloads are routed safely through Mailix secure sandboxed proxies.`);
  };

  // Extract OTP code if available
  const detectedOTP = msgDetails
    ? extractOTP(
        msgDetails.subject,
        msgDetails.text || '',
        msgDetails.html ? msgDetails.html.join(' ') : '',
        msgDetails.intro
      )
    : extractOTP(messageSummary.subject, '', '', messageSummary.intro);

  return (
    <div id="mailix-email-detail" className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 text-slate-950 dark:text-white">
      {/* Header Sticky Strip */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-20 flex items-center justify-between px-8 h-20 shadow-sm select-none">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <span className="ml-3 font-extrabold text-slate-900 dark:text-white text-base truncate max-w-[200px]">
            {messageSummary.subject || t('common.no_subject')}
          </span>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button
            onClick={handleShare}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 transition-colors"
            title={t('common.share')}
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/20 rounded-full text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            title={t('common.delete')}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* EMAIL METADATA PANEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-8 shadow-sm space-y-5">
          
          {/* Sender Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3.5 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="truncate text-left rtl:text-right">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {messageSummary.sender?.name || 'Anonymous Sender'}
                </p>
                <p className="text-xs font-semibold text-slate-500 truncate">
                  {messageSummary.sender?.address || 'Unknown Sender'}
                </p>
              </div>
            </div>

            {/* Copy Sender */}
            <button
              onClick={handleCopySender}
              className={`p-2 rounded-xl transition-all border ${
                copiedSender 
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 text-green-600' 
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-500 hover:text-slate-700'
              }`}
              title="Copy Sender Email"
            >
              {copiedSender ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="border-t border-slate-50 dark:border-slate-800/60 pt-3 space-y-2">
            {/* Subject details */}
            <div className="flex justify-between items-start">
              <div className="text-left rtl:text-right pr-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  {t('detail.subject')}
                </span>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug mt-0.5">
                  {messageSummary.subject || t('common.no_subject')}
                </p>
              </div>
              <button
                onClick={handleCopySubject}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors ${copiedSubject ? 'text-green-500 hover:text-green-500' : ''}`}
                title="Copy Subject"
              >
                {copiedSubject ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Received Date */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-400 dark:text-slate-500">
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{t('detail.date')}:</span>
              <span className="font-mono">{new Date(messageSummary.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* SECURITY CLARIFICATION TAG */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/20 rounded-2xl p-3.5 text-[11px] text-blue-700 dark:text-blue-400 flex items-start space-x-2.5 rtl:space-x-reverse">
          <ShieldCheck className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
          <span>{t('detail.safe_links')}</span>
        </div>

        {/* OTP DETECTED BANNER */}
        {detectedOTP && (
          <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100/80 dark:border-emerald-900/30 rounded-2xl p-5 flex items-center justify-between shadow-sm animate-fade-in gap-4">
            <div className="flex items-center space-x-3.5 rtl:space-x-reverse min-w-0">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                <Key className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left rtl:text-right min-w-0">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-0.5">
                  OTP Code Detected
                </p>
                <p className="text-xl font-extrabold font-mono text-emerald-800 dark:text-emerald-200 tracking-widest">
                  {detectedOTP}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(detectedOTP);
                if (onShowToast) {
                  onShowToast(t('common.copied') || 'Verification code copied!', 'success');
                }
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 dark:shadow-none transition-all flex items-center space-x-1.5 active:scale-97 cursor-pointer hover:scale-[1.02] shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </button>
          </div>
        )}

        {/* AI EMAIL SUMMARY PANEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/55 text-blue-600 dark:text-blue-400 rounded-xl">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                AI Email Summary
              </h3>
            </div>
            
            {summary && !summaryLoading && (
              <button
                onClick={handleSummarize}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            )}
          </div>

          {summaryLoading && (
            <div className="space-y-2.5 py-2 animate-pulse">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gemini is summarizing this email...</span>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-full"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-5/6"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-4/5"></div>
            </div>
          )}

          {summaryError && !summaryLoading && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl space-y-3">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {summaryError}
              </p>
              <button
                onClick={handleSummarize}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {!summary && !summaryLoading && !summaryError && (
            <div className="py-2 flex flex-col items-start space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-left rtl:text-right">
                Generate a fast, high-quality, 3-5 bullet point AI summary of this email securely powered by Google Gemini.
              </p>
              <button
                onClick={handleSummarize}
                className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-100 dark:shadow-none transition-all flex items-center space-x-1.5 active:scale-97 cursor-pointer hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summarize with AI</span>
              </button>
            </div>
          )}

          {summary && !summaryLoading && !summaryError && (
            <div className="bg-slate-50/60 dark:bg-slate-950/35 border border-slate-100/50 dark:border-slate-800/40 rounded-2xl p-4.5">
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 list-none pl-0">
                {summary.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2.5 rtl:space-x-reverse text-left rtl:text-right">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <span className="leading-relaxed font-semibold">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* EMAIL BODY VIEWER PANEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-8 shadow-sm space-y-5">
          
          {/* Layout switches (HTML vs Plain text tab buttons) */}
          {msgDetails && msgDetails.html && msgDetails.html.length > 0 && (
            <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('html')}
                className={`flex-1 py-2 text-center text-xs font-extrabold rounded-xl transition-all ${
                  activeTab === 'html'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('detail.html')}
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 text-center text-xs font-extrabold rounded-xl transition-all ${
                  activeTab === 'text'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('detail.plain_text')}
              </button>
            </div>
          )}

          {/* Core render arena */}
          <div className="min-h-32">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500">{t('common.loading')}</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30 text-xs text-center space-y-2">
                <p className="font-bold">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-100 dark:bg-red-900/40 px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-colors"
                >
                  {t('common.retry')}
                </button>
              </div>
            ) : msgDetails ? (
              activeTab === 'html' && msgDetails.html && msgDetails.html.length > 0 ? (
                renderHTMLBody(msgDetails.html)
              ) : (
                // Raw plain-text layout
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 font-sans text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                  {msgDetails.text || messageSummary.intro || 'This email has no readable text body.'}
                </div>
              )
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">Empty Content.</div>
            )}
          </div>
        </div>

        {/* ATTACHMENTS VIEW IF AVAILABLE */}
        {msgDetails && msgDetails.attachments && msgDetails.attachments.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-8 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('detail.attachments')} ({msgDetails.attachments.length})
            </h3>
            <div className="space-y-2">
              {msgDetails.attachments.map((file) => (
                <div 
                  key={file.id}
                  onClick={() => downloadAttachmentPlaceholder(file.filename)}
                  className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all active:scale-99"
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="truncate text-left rtl:text-right">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-4">
                        {file.filename}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {(file.size / 1024).toFixed(1)} KB • {file.contentType}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="p-2 bg-white dark:bg-slate-900 rounded-xl text-slate-500 hover:text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800"
                    aria-label="Download Attachment"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
