/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
}

export interface MailAccount {
  id: string;
  address: string;
  password?: string;
  token?: string;
  createdAt?: string;
}

export interface MailSender {
  address: string;
  name: string;
}

export interface MailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  transferEncoding: string;
  downloadUrl: string;
}

export interface MailMessage {
  id: string;
  accountId: string;
  msgid: string;
  sender: MailSender;
  to: MailSender[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted?: boolean;
  hasAttachments: boolean;
  attachments?: MailAttachment[];
  size: number;
  createdAt: string;
  html?: string[];
  text?: string;
}

export type AppTheme = 'light' | 'dark' | 'system';

export type AppLanguage = 'en' | 'ur';

export interface AppSettings {
  theme: AppTheme;
  language: AppLanguage;
  autoRefreshInterval: number; // in seconds, e.g. 15, 30, 60, 0 (disabled)
  notificationsEnabled: boolean;
}

export interface AdMobConfig {
  adMobEnabled: boolean;
  bannerAdId: string;
  interstitialAdId: string;
  rewardedAdId: string;
}
