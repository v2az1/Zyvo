/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, MailAccount, MailMessage } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'mailix_settings',
  CURRENT_ACCOUNT: 'mailix_current_account',
  ACCOUNT_HISTORY: 'mailix_account_history',
  EMAIL_CACHE_PREFIX: 'mailix_cache_emails_',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  autoRefreshInterval: 15, // Default 15 seconds
  notificationsEnabled: true,
};

// Safe access to localStorage with mock fallback
const getStorage = (): Storage => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  // Mock in-memory storage for environments where localStorage is blocked/unavailable
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const key in store) delete store[key]; },
    key: (index: number) => Object.keys(store)[index] || null,
    length: Object.keys(store).length,
  };
};

const storage = getStorage();

export const StorageService = {
  // --- Settings ---
  getSettings(): AppSettings {
    try {
      const data = storage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error loading settings', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      storage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },

  // --- Current Temporary Account ---
  getCurrentAccount(): MailAccount | null {
    try {
      const data = storage.getItem(STORAGE_KEYS.CURRENT_ACCOUNT);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading current account', e);
    }
    return null;
  },

  saveCurrentAccount(account: MailAccount | null): void {
    try {
      if (account) {
        storage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT, JSON.stringify(account));
        // Also save to history list
        this.addAccountToHistory(account);
      } else {
        storage.removeItem(STORAGE_KEYS.CURRENT_ACCOUNT);
      }
    } catch (e) {
      console.error('Error saving current account', e);
    }
  },

  // --- Account History (Switching between previously created addresses) ---
  getAccountHistory(): MailAccount[] {
    try {
      const data = storage.getItem(STORAGE_KEYS.ACCOUNT_HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading account history', e);
    }
    return [];
  },

  addAccountToHistory(account: MailAccount): void {
    try {
      const history = this.getAccountHistory();
      // Remove duplicate if already exists
      const filtered = history.filter((acc) => acc.address.toLowerCase() !== account.address.toLowerCase());
      // Insert at the front (most recent)
      filtered.unshift(account);
      // Keep last 15 accounts to prevent storage bloat
      const trimmed = filtered.slice(0, 15);
      storage.setItem(STORAGE_KEYS.ACCOUNT_HISTORY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Error adding account to history', e);
    }
  },

  removeAccountFromHistory(address: string): void {
    try {
      const history = this.getAccountHistory();
      const filtered = history.filter((acc) => acc.address.toLowerCase() !== address.toLowerCase());
      storage.setItem(STORAGE_KEYS.ACCOUNT_HISTORY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Error removing account from history', e);
    }
  },

  // --- Caching Emails (Offline/Slow Network Performance) ---
  getCachedEmails(accountId: string): MailMessage[] {
    try {
      const data = storage.getItem(`${STORAGE_KEYS.EMAIL_CACHE_PREFIX}${accountId}`);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map((raw: any) => ({
            ...raw,
            sender: raw.sender || raw.from || { name: '', address: '' }
          }));
        }
        return [];
      }
    } catch (e) {
      console.error('Error loading email cache', e);
    }
    return [];
  },

  saveCachedEmails(accountId: string, emails: MailMessage[]): void {
    try {
      storage.setItem(`${STORAGE_KEYS.EMAIL_CACHE_PREFIX}${accountId}`, JSON.stringify(emails));
    } catch (e) {
      console.error('Error saving email cache', e);
    }
  },

  // --- Caching Domains ---
  getDomainsCache(): any[] {
    try {
      const data = storage.getItem('mailix_domains_cache');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading domains cache', e);
    }
    return [];
  },

  saveDomainsCache(domains: any[]): void {
    try {
      storage.setItem('mailix_domains_cache', JSON.stringify(domains));
    } catch (e) {
      console.error('Error saving domains cache', e);
    }
  },

  clearAllCache(): void {
    try {
      // Find all keys starting with email cache prefix and remove them
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.EMAIL_CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => storage.removeItem(key));
      storage.removeItem('mailix_domains_cache');
    } catch (e) {
      console.error('Error clearing email caches', e);
    }
  }
};
