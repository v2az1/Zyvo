/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios, { AxiosError } from 'axios';
import { Domain, MailAccount, MailMessage } from '../types';
import { StorageService } from './storage';

const API_BASE_URL = 'https://api.mail.tm';

// Create a configured Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Helper to generate a secure random password
const generateRandomPassword = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Helper to generate a random local username part (avoiding complex symbols)
const generateRandomUsername = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let username = '';
  for (let i = 0; i < 8; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return username;
};

// High-quality static fallback domains for offline use or api degradation
const FALLBACK_DOMAINS: Domain[] = [
  { id: 'fb1', domain: 'mail.tm', isActive: true, createdAt: new Date().toISOString() },
  { id: 'fb2', domain: 'secmail.pro', isActive: true, createdAt: new Date().toISOString() },
  { id: 'fb3', domain: 'muensterland.de', isActive: true, createdAt: new Date().toISOString() },
];

export const MailixApiService = {
  /**
   * Fetch available email domains
   */
  async getDomains(): Promise<Domain[]> {
    if (!navigator.onLine) {
      const cached = StorageService.getDomainsCache();
      if (cached && cached.length > 0) {
        return cached;
      }
      return FALLBACK_DOMAINS;
    }
    try {
      const response = await apiClient.get('/domains');
      const data = response.data;
      let domains: Domain[] = [];
      if (data && Array.isArray(data['hydra:member'])) {
        domains = data['hydra:member'] as Domain[];
      } else if (Array.isArray(data)) {
        domains = data as Domain[];
      }

      if (domains && domains.length > 0) {
        StorageService.saveDomainsCache(domains);
        return domains;
      }

      const cached = StorageService.getDomainsCache();
      if (cached && cached.length > 0) {
        return cached;
      }
      return FALLBACK_DOMAINS;
    } catch (error) {
      console.warn('Failed to fetch domains from Mail.tm api, using cache/fallback', error);
      const cached = StorageService.getDomainsCache();
      if (cached && cached.length > 0) {
        return cached;
      }
      return FALLBACK_DOMAINS;
    }
  },

  /**
   * Create a new temporary account on a selected domain
   */
  async createAccount(customUsername?: string, selectedDomain?: string): Promise<MailAccount> {
    if (!navigator.onLine) {
      throw new Error('OFFLINE');
    }

    // 1. Resolve domain candidates
    let domainsToTry: string[] = [];
    if (selectedDomain) {
      domainsToTry = [selectedDomain];
    } else {
      const domains = await this.getDomains();
      const activeDomains = domains.filter((d) => d.isActive !== false);
      if (activeDomains.length === 0) {
        throw new Error('No active email domains available. Please try again later.');
      }
      // Shuffle domains to distribute load and find a working domain on retry
      domainsToTry = activeDomains.map((d) => d.domain).sort(() => 0.5 - Math.random());
    }

    let lastError: any = null;

    // 2. Try candidates one by one to avoid registration 422 errors due to inactive or full domains
    for (const domainName of domainsToTry) {
      try {
        const username = customUsername ? customUsername.trim().toLowerCase() : generateRandomUsername();
        const address = `${username}@${domainName}`;
        const password = generateRandomPassword();

        // Register account
        const regResponse = await apiClient.post('/accounts', {
          address,
          password,
        });

        const accountData = regResponse.data;
        const accountId = accountData.id;

        // Authenticate to get JWT token
        const tokenResponse = await apiClient.post('/token', {
          address,
          password,
        });

        const tokenData = tokenResponse.data;
        const token = tokenData.token;

        const account: MailAccount = {
          id: accountId,
          address,
          password,
          token,
          createdAt: new Date().toISOString(),
        };

        // Store current account
        StorageService.saveCurrentAccount(account);

        return account;
      } catch (error) {
        console.warn(`Failed to create account on domain ${domainName}, retrying with next candidate if available...`, error);
        lastError = error;
      }
    }

    // If we tried all domains and failed, throw parsed api error
    this.handleApiError(lastError);
    throw lastError;
  },

  /**
   * Login with existing credentials to refresh credentials
   */
  async login(account: MailAccount): Promise<MailAccount> {
    if (!navigator.onLine) {
      return account; // Return as-is offline
    }
    if (!account.password) {
      throw new Error('Password required for authentication');
    }
    try {
      const response = await apiClient.post('/token', {
        address: account.address,
        password: account.password,
      });
      const token = response.data.token;
      const updatedAccount: MailAccount = {
        ...account,
        token,
      };
      StorageService.saveCurrentAccount(updatedAccount);
      return updatedAccount;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  },

  /**
   * Fetch messages for current account
   */
  async getMessages(account: MailAccount): Promise<MailMessage[]> {
    if (!account.token) {
      throw new Error('NOT_AUTHENTICATED');
    }

    // Check if offline, read from storage cache
    if (!navigator.onLine) {
      return StorageService.getCachedEmails(account.id);
    }

    try {
      const response = await apiClient.get('/messages', {
        headers: {
          Authorization: `Bearer ${account.token}`,
        },
      });

      const mapRawMessage = (raw: any): MailMessage => ({
        ...raw,
        sender: raw.sender || raw.from || { name: '', address: '' }
      });

      let messages: MailMessage[] = [];
      const data = response.data;
      if (data && Array.isArray(data['hydra:member'])) {
        messages = (data['hydra:member'] as any[]).map(mapRawMessage);
      } else if (Array.isArray(data)) {
        messages = (data as any[]).map(mapRawMessage);
      }

      // Cache messages locally
      StorageService.saveCachedEmails(account.id, messages);

      return messages;
    } catch (error: any) {
      // If token expired (401), try logging in again
      if (error.response && error.response.status === 401 && account.password) {
        try {
          const refreshedAccount = await this.login(account);
          return this.getMessages(refreshedAccount);
        } catch (loginError) {
          console.warn('Authentication failed on retry, returning cache', loginError);
          return StorageService.getCachedEmails(account.id);
        }
      }
      console.warn('Failed to sync temporary inbox, returning cache:', error);
      return StorageService.getCachedEmails(account.id);
    }
  },

  /**
   * Fetch full message content (HTML/plain-text / attachments)
   */
  async getMessageDetails(account: MailAccount, messageId: string): Promise<MailMessage> {
    if (!account.token) {
      throw new Error('NOT_AUTHENTICATED');
    }

    // If offline, check our cache
    if (!navigator.onLine) {
      const cached = StorageService.getCachedEmails(account.id);
      const match = cached.find((m) => m.id === messageId);
      if (match && (match.text || match.html)) {
        return match;
      }
      throw new Error('OFFLINE_CONTENT_UNAVAILABLE');
    }

    try {
      const response = await apiClient.get(`/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${account.token}`,
        },
      });

      const mapRawMessage = (raw: any): MailMessage => ({
        ...raw,
        sender: raw.sender || raw.from || { name: '', address: '' }
      });
      const messageDetails = mapRawMessage(response.data);

      // Update in our cache
      const cached = StorageService.getCachedEmails(account.id);
      const index = cached.findIndex((m) => m.id === messageId);
      if (index !== -1) {
        cached[index] = { ...cached[index], ...messageDetails };
        StorageService.saveCachedEmails(account.id, cached);
      }

      return messageDetails;
    } catch (error: any) {
      if (error.response && error.response.status === 401 && account.password) {
        try {
          const refreshedAccount = await this.login(account);
          return this.getMessageDetails(refreshedAccount, messageId);
        } catch (loginError) {
          throw new Error('AUTHENTICATION_FAILED');
        }
      }
      this.handleApiError(error);
      throw error;
    }
  },

  /**
   * Mark message as seen/read
   */
  async markAsSeen(account: MailAccount, messageId: string, seen: boolean = true): Promise<void> {
    if (!account.token) return;
    if (!navigator.onLine) return; // Do silently or cache update

    try {
      await apiClient.patch(
        `/messages/${messageId}`,
        { seen },
        {
          headers: {
            'Authorization': `Bearer ${account.token}`,
            'Content-Type': 'application/merge-patch+json',
          },
        }
      );

      // Update cache
      const cached = StorageService.getCachedEmails(account.id);
      const index = cached.findIndex((m) => m.id === messageId);
      if (index !== -1) {
        cached[index].seen = seen;
        StorageService.saveCachedEmails(account.id, cached);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401 && account.password) {
        try {
          const refreshedAccount = await this.login(account);
          await this.markAsSeen(refreshedAccount, messageId, seen);
        } catch (e) {
          console.error('Failed to mark read after login retry', e);
        }
      }
    }
  },

  /**
   * Delete message from temporary inbox
   */
  async deleteMessage(account: MailAccount, messageId: string): Promise<void> {
    if (!account.token) {
      throw new Error('NOT_AUTHENTICATED');
    }
    if (!navigator.onLine) {
      throw new Error('OFFLINE');
    }

    try {
      await apiClient.delete(`/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${account.token}`,
        },
      });

      // Remove from cached emails
      const cached = StorageService.getCachedEmails(account.id);
      const filtered = cached.filter((m) => m.id !== messageId);
      StorageService.saveCachedEmails(account.id, filtered);
    } catch (error: any) {
      if (error.response && error.response.status === 401 && account.password) {
        try {
          const refreshedAccount = await this.login(account);
          await this.deleteMessage(refreshedAccount, messageId);
          return;
        } catch (loginError) {
          throw new Error('AUTHENTICATION_FAILED');
        }
      }
      this.handleApiError(error);
      throw error;
    }
  },

  /**
   * Standard error handling
   */
  handleApiError(error: any): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      if (!navigator.onLine || axiosError.code === 'ERR_NETWORK') {
        throw new Error('OFFLINE');
      }
      if (axiosError.response) {
        const status = axiosError.response.status;
        const responseData = axiosError.response.data;

        let msg = '';
        if (responseData) {
          if (responseData.message) {
            msg = responseData.message;
          } else if (responseData['hydra:description']) {
            msg = responseData['hydra:description'];
          } else if (responseData.detail) {
            msg = responseData.detail;
          } else if (Array.isArray(responseData.violations) && responseData.violations.length > 0) {
            const firstViolation = responseData.violations[0];
            msg = `${firstViolation.propertyPath}: ${firstViolation.message}`;
          } else if (typeof responseData === 'string') {
            msg = responseData;
          }
        }

        if (status === 429) {
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
        if (status === 401) {
          throw new Error('AUTHENTICATION_FAILED');
        }
        if (status === 400 || status === 422) {
          throw new Error(msg || 'Invalid requests. Domain or credentials mismatch.');
        }
        throw new Error(msg || `Server returned error (${status})`);
      }
    }
    throw error;
  }
};
