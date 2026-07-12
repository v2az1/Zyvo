/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider, useAppTheme } from './components/ThemeContext';
import { SplashView } from './components/SplashView';
import { WelcomeView } from './components/WelcomeView';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { InboxView } from './components/InboxView';
import { SettingsView } from './components/SettingsView';
import { EmailDetailView } from './components/EmailDetailView';
import { MailAccount, Domain, MailMessage } from './types';
import { StorageService } from './services/storage';
import { MailixApiService } from './services/api';
import { NotificationService } from './services/notifications';
import { CheckCircle2, Sparkles } from 'lucide-react';

function MailixAppContent() {
  const { settings, t } = useAppTheme();

  // Screen/View lifecycle states
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboard, setShowOnboard] = useState(() => {
    // Show welcome onboarding if no temporary account is found on device
    return StorageService.getCurrentAccount() === null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentAccount, setCurrentAccount] = useState<MailAccount | null>(() => {
    return StorageService.getCurrentAccount();
  });

  const [activeMessage, setActiveMessage] = useState<MailMessage | null>(null);

  // Data states
  const [domains, setDomains] = useState<Domain[]>([]);
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sync timers
  const [countdown, setCountdown] = useState(settings.autoRefreshInterval);
  const previousMessagesRef = useRef<MailMessage[]>([]);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  // 1. Fetch domains on startup
  const fetchDomains = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const activeDomains = await MailixApiService.getDomains();
      setDomains(activeDomains);
    } catch (e) {
      console.error('Failed to pre-fetch email domains', e);
    }
  }, []);

  // 2. Refresh Messages list
  const refreshInbox = useCallback(async (isSilent = true) => {
    if (!currentAccount) return;
    if (!navigator.onLine) {
      // Offline fallback: load cached
      const cached = StorageService.getCachedEmails(currentAccount.id);
      setMessages(cached);
      return;
    }

    if (!isSilent) {
      setRefreshing(true);
    }

    try {
      // Authenticate login to update stale JWT if password is cached
      const fetched = await MailixApiService.getMessages(currentAccount);
      setMessages(fetched);

      // Check for incoming new emails to trigger push notifications
      const prevMsgList = previousMessagesRef.current;
      if (prevMsgList.length > 0 && fetched.length > prevMsgList.length) {
        // Find brand new emails
        const newEmails = fetched.filter((m) => !prevMsgList.some((old) => old.id === m.id));
        newEmails.forEach((email) => {
          if (settings.notificationsEnabled) {
            NotificationService.sendNotification(
              `${t('app.name')} - ${email.sender?.name || email.sender?.address || 'Unknown'}`,
              email.subject || t('common.no_subject'),
              email.id
            );
          }
        });
      }
      previousMessagesRef.current = fetched;
    } catch (e) {
      console.error('Failed to sync temporary inbox', e);
    } finally {
      if (!isSilent) {
        setRefreshing(false);
      }
    }
  }, [currentAccount, settings.notificationsEnabled, t]);

  // Initial boots
  useEffect(() => {
    fetchDomains();
    
    // Auto request permission on first onboarding clearance
    if (settings.notificationsEnabled) {
      NotificationService.requestPermission();
    }
  }, [fetchDomains, settings.notificationsEnabled]);

  // 3. Trigger inbox refresh whenever current account alters
  useEffect(() => {
    if (currentAccount) {
      // Reset caches
      previousMessagesRef.current = StorageService.getCachedEmails(currentAccount.id);
      setMessages(previousMessagesRef.current);
      
      // Fetch fresh
      refreshInbox(false);
    } else {
      setMessages([]);
      previousMessagesRef.current = [];
    }
  }, [currentAccount, refreshInbox]);

  // 4. Auto Refresh Countdown Engine
  useEffect(() => {
    if (!currentAccount || settings.autoRefreshInterval === 0 || !navigator.onLine) {
      return;
    }

    setCountdown(settings.autoRefreshInterval);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger refresh
          refreshInbox(true);
          return settings.autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentAccount, settings.autoRefreshInterval, refreshInbox]);

  // Account Generator Core Callback
  const handleGenerateAccount = async (customUsername?: string, domain?: string) => {
    setLoading(true);
    try {
      const newAcc = await MailixApiService.createAccount(customUsername, domain);
      setCurrentAccount(newAcc);
      setActiveTab('home');
      setActiveMessage(null);
    } catch (e) {
      console.error('Account creation process aborted', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = (acc: MailAccount) => {
    setCurrentAccount(acc);
    StorageService.saveCurrentAccount(acc); // Puts back as current
    setActiveMessage(null);
  };

  const handleDeleteHistoryAccount = (address: string) => {
    StorageService.removeAccountFromHistory(address);
    // If we just deleted our current active address, select the next available one
    if (currentAccount?.address.toLowerCase() === address.toLowerCase()) {
      const remaining = StorageService.getAccountHistory();
      if (remaining.length > 0) {
        handleSwitchAccount(remaining[0]);
      } else {
        setCurrentAccount(null);
        StorageService.saveCurrentAccount(null);
        setShowOnboard(true);
      }
    } else {
      // Just re-render settings/state mapping
      handleSwitchAccount(currentAccount!);
    }
  };

  const handleStartApp = () => {
    setShowOnboard(false);
    // Auto-generate initial random temporary address immediately if none is current
    if (!currentAccount) {
      handleGenerateAccount();
    }
  };

  // --- RENDERS ---

  if (showSplash) {
    return <SplashView onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboard) {
    return <WelcomeView onStart={handleStartApp} />;
  }

  return (
    <div id="mailix-android-shell" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative max-w-2xl mx-auto shadow-2xl overflow-hidden">
      
      {/* 1. SCENE VIEWS AND TAB SWITCHER */}
      <div className="flex-1 overflow-y-auto pb-16">
        {activeMessage ? (
          <EmailDetailView
            account={currentAccount!}
            messageSummary={activeMessage}
            onBack={() => setActiveMessage(null)}
            onDeleted={() => {
              setActiveMessage(null);
              refreshInbox(false);
            }}
            onShowToast={showToast}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                account={currentAccount}
                domains={domains}
                messages={messages}
                loading={loading}
                refreshing={refreshing}
                countdown={countdown}
                onRefresh={() => refreshInbox(false)}
                onGenerateAccount={handleGenerateAccount}
                onSwitchAccount={handleSwitchAccount}
                onDeleteHistoryAccount={handleDeleteHistoryAccount}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'inbox' && (
              <InboxView
                account={currentAccount}
                messages={messages}
                loading={refreshing}
                onRefresh={() => refreshInbox(false)}
                onSelectMessage={(msg) => setActiveMessage(msg)}
                onDeleteMessage={async (id) => {
                  if (currentAccount) {
                    await MailixApiService.deleteMessage(currentAccount, id);
                    refreshInbox(true);
                  }
                }}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'settings' && <SettingsView />}
          </>
        )}
      </div>

      {/* 2. BOTTOM NAVBAR - Persistent on main dashboards, hides in deep reading panels */}
      {!activeMessage && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setActiveMessage(null);
          }}
          unreadCount={messages.filter((m) => !m.seen).length}
        />
      )}

      {/* 3. TOAST NOTIFICATION CONTAINER */}
      {toast && (
        <div className={`absolute ${activeMessage ? 'bottom-8' : 'bottom-24'} left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white dark:bg-white/95 dark:text-slate-950 px-5 py-3 rounded-full shadow-xl flex items-center space-x-2.5 rtl:space-x-reverse text-xs font-bold animate-fade-in whitespace-nowrap border border-slate-800/80 dark:border-slate-100/80 backdrop-blur-md`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          ) : (
            <Sparkles className="w-4.5 h-4.5 text-blue-500 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MailixAppContent />
    </ThemeProvider>
  );
}
