/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, EyeOff, Lock, Server } from 'lucide-react';
import { useAppTheme } from './ThemeContext';

interface DocumentProps {
  onBack: () => void;
}

export const PrivacyView: React.FC<DocumentProps> = ({ onBack }) => {
  const { t } = useAppTheme();

  return (
    <div id="mailix-privacy-screen" className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-xl mx-auto w-full">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('settings.privacy')}
          </h1>
          <p className="text-xs text-slate-400 font-mono">Effective date: July 12, 2026</p>
        </div>

        {/* Introduction */}
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            At Mailix (by Zyvo Private Ltd), user privacy is our ultimate guiding principle. We believe that your digital footprints are yours alone to own, which is why Mailix is built from the ground up to guarantee total anonymity.
          </p>
        </div>

        {/* Pillars of Privacy */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3.5 rtl:space-x-reverse">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/30 text-blue-600 shrink-0">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Anonymity-First Architecture</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                We do not collect names, phone numbers, or hardware IDs. Your temporary email accounts are associated solely with cryptographic tokens stored directly in your local device cache.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 rtl:space-x-reverse">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/30 text-blue-600 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Secure Transit</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                All network interactions with the Mail.tm backends are encrypted using TLS 1.3. Your emails are kept in transient memory and deleted permanently either on your command or automatically when the accounts expire.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 rtl:space-x-reverse">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/30 text-blue-600 shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Third-Party Disclosures & Ads</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                We use Google AdMob to deliver lightweight advertising content. No personal tracking vectors or primary email addresses are shared with the ad exchange network. All ad interactions comply with international privacy regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-950 pt-4 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Have questions about your data? Contact Zyvo support at privacy@zyvo.pk
          </p>
        </div>
      </div>
    </div>
  );
};
