/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme, AppLanguage, AppSettings } from '../types';
import { StorageService } from '../services/storage';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  t: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Real local dictionary mapping English to Urdu
const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    // Brand
    'app.name': 'Mailix',
    'app.tagline': 'Fast, Secure, Privacy-focused Temporary Email',
    'app.by': 'by Zyvo',
    
    // Screens/Common
    'common.welcome': 'Welcome to Mailix',
    'common.loading': 'Loading...',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    'common.delete': 'Delete',
    'common.share': 'Share',
    'common.refresh': 'Refresh',
    'common.settings': 'Settings',
    'common.about': 'About',
    'common.back': 'Back',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.retry': 'Retry',
    'common.search': 'Search emails...',
    'common.status.online': 'Online',
    'common.status.offline': 'Offline Mode',
    'common.no_subject': '(No Subject)',
    'common.seconds_short': 's',

    // Onboarding Screen
    'onboard.title': 'Secure Disposable Emails',
    'onboard.desc': 'Protect your personal inbox from spam, trackers, and advertising lists with our fast temporary email service.',
    'onboard.optimized': 'Optimized for Pakistan',
    'onboard.optimized_desc': 'Lightweight asset compression and localized nodes ensure lightning-fast operations even on slow 3G/4G networks.',
    'onboard.cta': 'Get Temporary Email',

    // Home Screen
    'home.your_address': 'Your Temporary Email Address',
    'home.generate_new': 'Generate New Email',
    'home.domains': 'Active Domains',
    'home.active_domains_count': 'domains active',
    'home.copy_address': 'Copy Address',
    'home.auto_refresh': 'Auto-refreshing in',
    'home.manual_refresh': 'Refresh Inbox',
    'home.recent_emails': 'Recent Emails',
    'home.view_all': 'View All',
    'home.empty_title': 'Your Inbox is Empty',
    'home.empty_desc': 'Waiting for incoming emails... This page will update automatically when a message arrives.',
    'home.empty_subdesc': 'Tip: You can use this email for newsletter registrations, coupons, or forum activations.',
    'home.custom_username_placeholder': 'Enter custom username (optional)',

    // Inbox Screen
    'inbox.title': 'Temporary Inbox',
    'inbox.search_placeholder': 'Search sender, subject or text...',
    'inbox.unread_badge': 'Unread',
    'inbox.no_emails': 'No emails found matching your search.',
    'inbox.total': 'Total',

    // Detail Screen
    'detail.sender': 'Sender',
    'detail.to': 'To',
    'detail.subject': 'Subject',
    'detail.date': 'Received At',
    'detail.plain_text': 'Plain Text',
    'detail.html': 'Rich HTML',
    'detail.safe_links': 'Links are opened in a sandboxed, tracking-free reader',
    'detail.attachments': 'Attachments',
    'detail.size': 'Size',
    'detail.delete_confirm': 'Are you sure you want to delete this email? This action is permanent.',
    'detail.deleted_success': 'Email deleted successfully',
    'detail.ai_summary': 'AI Email Summary',
    'detail.ai_summarize': 'Summarize with AI',
    'detail.ai_summarizing': 'Gemini is summarizing this email...',
    'detail.ai_regenerate': 'Regenerate',
    'detail.ai_summary_desc': 'Generate a fast, high-quality, 3-5 bullet point AI summary of this email securely powered by Google Gemini.',
    'detail.ai_view_summary': 'View Summary',
    'detail.ai_hide_summary': 'Hide Summary',
    'detail.ai_generating': 'Generating...',

    // Settings Screen
    'settings.title': 'Settings & Preferences',
    'settings.general': 'General Settings',
    'settings.theme': 'Visual Theme',
    'settings.theme.light': 'Light Theme',
    'settings.theme.dark': 'Dark Theme',
    'settings.theme.system': 'System Adaptive',
    'settings.language': 'Language',
    'settings.language.en': 'English (Global)',
    'settings.language.ur': 'Urdu (اردو)',
    'settings.refresh_interval': 'Inbox Sync Interval',
    'settings.refresh.disabled': 'Manual Refresh Only',
    'settings.refresh.15s': 'Every 15 Seconds',
    'settings.refresh.30s': 'Every 30 Seconds',
    'settings.refresh.60s': 'Every 1 Minute',
    'settings.notifications': 'Push Notifications',
    'settings.notifications_desc': 'Notify me instantly when a temporary email arrives',
    'settings.cache': 'Cache & Data Management',
    'settings.clear_cache': 'Clear Inbox Cache',
    'settings.clear_cache_desc': 'Removes stored messages and history from this device',
    'settings.cache_cleared': 'All cache and accounts history have been cleared.',
    'settings.about_section': 'About & Support',
    'settings.version': 'App Version',
    'settings.support': 'Contact Zyvo Support',
    'settings.rate': 'Rate Mailix on Play Store',
    'settings.share': 'Share Mailix with Friends',
    'settings.privacy': 'Privacy Policy',
    'settings.terms': 'Terms of Service',
    'settings.licenses': 'Open-source Licenses',

    // About Screen
    'about.title': 'About Mailix',
    'about.p1': 'Mailix is a premium, state-of-the-art temporary email application designed by Zyvo to provide secure, disposable, and privacy-first inboxes.',
    'about.p2': 'Our mission is simple: to keep your digital identity secure, shield your primary inbox from spam, and ensure you remain in control of your personal data.',
    'about.p3': 'Engineered to be extremely fast and light, Mailix operates seamlessly on modern Android devices and is highly optimized for networks in Pakistan and developing economies.',
    'about.footer': '© 2026 Zyvo Private Ltd. All rights reserved.',

    // Errors & Network Screens
    'error.title': 'Connection Error',
    'error.desc': 'Unable to connect to the temporary mail servers. Please verify your internet connection and try again.',
    'error.rate_limit': 'Too Many Requests',
    'error.rate_limit_desc': 'We are experiencing high traffic. Please wait a few seconds before trying to generate or fetch again.',
    'error.not_found': 'Email Not Found',
    'error.not_found_desc': 'The selected email has expired or was removed from the servers.',
    'error.button_retry': 'Re-establish Connection',
    'offline.title': 'Offline Mode',
    'offline.desc': 'Your device is currently disconnected. You are viewing cached messages. Reconnect to sync and receive new emails.',
  },
  ur: {
    // Brand
    'app.name': 'میلیکس (Mailix)',
    'app.tagline': 'تیز، محفوظ، اور رازداری پر مبنی عارضی ای میل سروس',
    'app.by': 'زیوو (Zyvo) کی طرف سے',

    // Screens/Common
    'common.welcome': 'میلیکس میں خوش آمدید',
    'common.loading': 'لوڈ ہو رہا ہے...',
    'common.copy': 'کاپی کریں',
    'common.copied': 'کاپی ہو گیا!',
    'common.delete': 'حذف کریں',
    'common.share': 'شیئر کریں',
    'common.refresh': 'تازہ کریں',
    'common.settings': 'ترتیبات',
    'common.about': 'ایپ کے بارے میں',
    'common.back': 'واپس',
    'common.cancel': 'منسوخ کریں',
    'common.confirm': 'تصدیق کریں',
    'common.save': 'محفوظ کریں',
    'common.retry': 'دوبارہ کوشش کریں',
    'common.search': 'ای میلز تلاش کریں...',
    'common.status.online': 'آن لائن',
    'common.status.offline': 'آف لائن وضع',
    'common.no_subject': '(کوئی موضوع نہیں)',
    'common.seconds_short': 'سیکنڈ',

    // Onboarding Screen
    'onboard.title': 'محفوظ اور عارضی ای میلز',
    'onboard.desc': 'ہماری تیز ترین عارضی ای میل سروس کے ذریعے اپنے ذاتی ان باکس کو سپیم، ٹریکرز اور اشتہارات سے محفوظ بنائیں۔',
    'onboard.optimized': 'پاکستان کے لیے بہترین کارکردگی',
    'onboard.optimized_desc': 'ہمارا ہلکا پھلکا ڈیزائن اور تیز رفتار نیٹ ورک نوڈس سست رفتار 3G/4G انٹرنیٹ پر بھی بجلی کی رفتار سے کام کو یقینی بناتے ہیں۔',
    'onboard.cta': 'عارضی ای میل حاصل کریں',

    // Home Screen
    'home.your_address': 'آپ کا عارضی ای میل پتہ',
    'home.generate_new': 'نیا ای میل تیار کریں',
    'home.domains': 'فعال ڈومینز',
    'home.active_domains_count': 'ڈومینز فعال ہیں',
    'home.copy_address': 'پتہ کاپی کریں',
    'home.auto_refresh': 'خودکار اپڈیٹ سیکنڈز میں:',
    'home.manual_refresh': 'ان باکس چیک کریں',
    'home.recent_emails': 'حالیہ ای میلز',
    'home.view_all': 'تمام دیکھیں',
    'home.empty_title': 'ان باکس خالی ہے',
    'home.empty_desc': 'نئی آنے والی ای میلز کا انتظار ہے... نیا پیغام موصول ہونے پر یہ صفحہ خود بخود اپ ڈیٹ ہو جائے گا۔',
    'home.empty_subdesc': 'مشورہ: آپ اس ای میل کو نیوز لیٹر رجسٹریشن، کوپن حاصل کرنے، یا مختلف فورمز پر اکاؤنٹ بنانے کے لیے استعمال کر سکتے ہیں۔',
    'home.custom_username_placeholder': 'اپنی مرضی کا نام درج کریں (اختیاری)',

    // Inbox Screen
    'inbox.title': 'عارضی ان باکس',
    'inbox.search_placeholder': 'بھیجنے والے یا موضوع سے تلاش کریں...',
    'inbox.unread_badge': 'غیر پڑھا ہوا',
    'inbox.no_emails': 'سرچ کے مطابق کوئی ای میل موصول نہیں ہوئی۔',
    'inbox.total': 'کل',

    // Detail Screen
    'detail.sender': 'بھیجنے والا',
    'detail.to': 'بنام',
    'detail.subject': 'موضوع',
    'detail.date': 'موصول ہونے کا وقت',
    'detail.plain_text': 'سادہ ٹیکسٹ',
    'detail.html': 'ڈیزائن شدہ ای میل (HTML)',
    'detail.safe_links': 'تمام لنکس کو رازداری کے ساتھ ایک محفوظ ریڈر میں کھولا جاتا ہے',
    'detail.attachments': 'منسلک فائلیں',
    'detail.size': 'سائز',
    'detail.delete_confirm': 'کیا آپ واقعی یہ ای میل حذف کرنا چاہتے ہیں؟ یہ عمل مستقل ہوگا۔',
    'detail.deleted_success': 'ای میل کامیابی کے ساتھ حذف کر دی گئی ہے',
    'detail.ai_summary': 'اے آئی ای میل خلاصہ',
    'detail.ai_summarize': 'اے آئی سے خلاصہ کریں',
    'detail.ai_summarizing': 'جیمنی اس ای میل کا خلاصہ کر رہا ہے...',
    'detail.ai_regenerate': 'دوبارہ تیار کریں',
    'detail.ai_summary_desc': 'گوگل جیمنی کے ذریعے محفوظ طریقے سے اس ای میل کا ایک تیز، اعلیٰ معیار، 3-5 بلٹ پوائنٹس والا خلاصہ حاصل کریں۔',
    'detail.ai_view_summary': 'خلاصہ دیکھیں',
    'detail.ai_hide_summary': 'خلاصہ چھپائیں',
    'detail.ai_generating': 'خلاصہ تیار ہو رہا ہے...',

    // Settings Screen
    'settings.title': 'ترتیبات اور ترجیحات',
    'settings.general': 'عمومی ترتیبات',
    'settings.theme': 'ظاہری تھیم',
    'settings.theme.light': 'روشن تھیم (Light)',
    'settings.theme.dark': 'تاریک تھیم (Dark)',
    'settings.theme.system': 'سسٹم کے مطابق',
    'settings.language': 'زبان (Language)',
    'settings.language.en': 'English (انگریزی)',
    'settings.language.ur': 'Urdu (اردو)',
    'settings.refresh_interval': 'خودکار ان باکس ریفریش',
    'settings.refresh.disabled': 'صرف دستی ریفریش',
    'settings.refresh.15s': 'ہر 15 سیکنڈ میں',
    'settings.refresh.30s': 'ہر 30 سیکنڈ میں',
    'settings.refresh.60s': 'ہر 1 منٹ میں',
    'settings.notifications': 'پش نوٹیفکیشنز',
    'settings.notifications_desc': 'نیا ای میل آنے پر مجھے فوری مطلع کریں',
    'settings.cache': 'کیشے اور ڈیٹا کنٹرول',
    'settings.clear_cache': 'ان باکس کیشے صاف کریں',
    'settings.clear_cache_desc': 'اس ڈیوائس سے محفوظ کردہ پیغامات اور تاریخ کو حذف کریں',
    'settings.cache_cleared': 'تمام محفوظ کردہ ڈیٹا اور ای میل ہسٹری صاف کر دی گئی ہے۔',
    'settings.about_section': 'معلومات اور مدد',
    'settings.version': 'ایپ ورژن',
    'settings.support': 'زیوو کسٹمر سپورٹ',
    'settings.rate': 'پلے اسٹور پر ریٹنگ دیں',
    'settings.share': 'دوستوں کے ساتھ شیئر کریں',
    'settings.privacy': 'رازداری کی پالیسی',
    'settings.terms': 'شرائط و ضوابط',
    'settings.licenses': 'اوپن سورس لائسنسز',

    // About Screen
    'about.title': 'میلیکس کے بارے میں',
    'about.p1': 'میلیکس (Mailix) ایک اعلیٰ ترین اور جدید عارضی ای میل ایپلی کیشن ہے جسے زیوو (Zyvo) نے صارفین کو محفوظ، عارضی اور انتہائی رازدارانہ ان باکسز فراہم کرنے کے لیے ڈیزائن کیا ہے۔',
    'about.p2': 'ہمارا مشن بالکل واضح ہے: آپ کی ڈیجیٹل شناخت کو محفوظ رکھنا، آپ کے اصل ان باکس کو سپیم اور غیر ضروری اشتہارات سے بچانا، اور آپ کی ذاتی معلومات پر آپ کا مکمل کنٹرول یقینی بنانا۔',
    'about.p3': 'میلیکس کو خاص طور پر انتہائی تیز اور ہلکا بنایا گیا ہے تاکہ یہ بجٹ اینڈرائیڈ فونز اور پاکستان کے سست انٹرنیٹ کنکشنز (3G/4G) پر بھی بغیر کسی رکاوٹ کے بہترین کام کر سکے۔',
    'about.footer': '© 2026 زیوو پرائیویٹ لمیٹڈ۔ جملہ حقوق محفوظ ہیں۔',

    // Errors & Network Screens
    'error.title': 'کنکشن کا مسئلہ',
    'error.desc': 'عارضی ای میل سرور سے رابطہ قائم نہیں ہو سکا۔ براہ کرم اپنے انٹرنیٹ کنکشن کی تصدیق کریں اور دوبارہ کوشش کریں۔',
    'error.rate_limit': 'بہت زیادہ درخواستیں',
    'error.rate_limit_desc': 'سرور پر ٹریفک زیادہ ہے۔ ای میل دوبارہ بنانے یا حاصل کرنے سے پہلے چند سیکنڈ انتظار فرمائیں۔',
    'error.not_found': 'ای میل نہیں ملی',
    'error.not_found_desc': 'منتخب کردہ ای میل اب سرور پر موجود نہیں ہے یا اس کی معیاد ختم ہو چکی ہے۔',
    'error.button_retry': 'رابطہ دوبارہ قائم کریں',
    'offline.title': 'آف لائن وضع',
    'offline.desc': 'آپ کا ڈیوائس فی الحال انٹرنیٹ سے منسلک نہیں ہے۔ آپ صرف پہلے سے لوڈ شدہ ای میلز دیکھ سکتے ہیں۔ نیا مواد حاصل کرنے کے لیے دوبارہ جڑیں۔',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  useEffect(() => {
    // Persist settings whenever they change
    StorageService.saveSettings(settings);

    // Apply Tailwind Dark Mode CSS class
    const root = window.document.documentElement;
    const applyTheme = () => {
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else if (settings.theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    // Listen for system theme changes if set to system
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const setTheme = (theme: AppTheme) => updateSettings({ theme });
  const setLanguage = (language: AppLanguage) => updateSettings({ language });

  // Translation helper function
  const t = (key: string): string => {
    const lang = settings.language;
    return translations[lang][key] || translations['en'][key] || key;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: settings.theme,
        setTheme,
        language: settings.language,
        setLanguage,
        settings,
        updateSettings,
        t,
      }}
    >
      <div 
        className={settings.language === 'ur' ? 'font-sans rtl text-right' : 'font-sans ltr text-left'}
        dir={settings.language === 'ur' ? 'rtl' : 'ltr'}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
