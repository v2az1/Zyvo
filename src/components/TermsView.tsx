/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scale, ShieldCheck, Mail, AlertTriangle } from 'lucide-react';
import { useAppTheme } from './ThemeContext';

interface DocumentProps {
  onBack: () => void;
}

export const TermsView: React.FC<DocumentProps> = ({ onBack }) => {
  const { t } = useAppTheme();

  return (
    <div id="mailix-terms-screen" className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-xl mx-auto w-full">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('settings.terms')}
          </h1>
          <p className="text-xs text-slate-400 font-mono">Effective date: July 12, 2026</p>
        </div>

        {/* Intro */}
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            By installing or accessing Mailix (developed and hosted by Zyvo Private Ltd), you agree to be bound by these Terms of Service. Please read them carefully.
          </p>
        </div>

        {/* Section Blocks */}
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center">
              <Mail className="w-4 h-4 mr-1.5 text-blue-500 shrink-0 rtl:ml-1.5 rtl:mr-0" />
              <span>1. Temporary Nature of Service</span>
            </h3>
            <p className="leading-relaxed text-slate-500 dark:text-slate-400">
              Temporary email accounts are volatile and are not meant to be used for critical registrations, financial services, medical accounts, or recovery emails. Emails are stored on a best-effort basis and can be removed or deactivated without notice.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1.5 text-yellow-500 shrink-0 rtl:ml-1.5 rtl:mr-0" />
              <span>2. Acceptable Use Policy</span>
            </h3>
            <p className="leading-relaxed text-slate-500 dark:text-slate-400">
              Users are strictly forbidden from utilizing Mailix for spam operations, fraudulent sign-ups, illegal distributions, harassing other entities, or executing distributed denial-of-service (DDoS) campaigns.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center">
              <Scale className="w-4 h-4 mr-1.5 text-red-500 shrink-0 rtl:ml-1.5 rtl:mr-0" />
              <span>3. Limitation of Liability</span>
            </h3>
            <p className="leading-relaxed text-slate-500 dark:text-slate-400">
              Zyvo and Mailix operate "as-is" without any warranties of uninterrupted operation or zero data-loss occurrences. We are not liable for any account blockages or downstream registration issues arising from the use of disposable domains.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-950 pt-4 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Authorized under Zyvo Legal Guidelines. For inquiries: legal@zyvo.pk
          </p>
        </div>
      </div>
    </div>
  );
};
