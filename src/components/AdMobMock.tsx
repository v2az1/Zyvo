/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Trophy, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppTheme } from './ThemeContext';

// Standard Google AdMob developer keys / placeholder IDs
export const ADMOB_IDS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',       // Standard Google Banner Test ID
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712', // Standard Interstitial Test ID
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',     // Standard Rewarded Test ID
};

/**
 * 1. REUSABLE BANNER AD COMPONENT
 */
export const AdMobBanner: React.FC<{ placementId?: string }> = ({ placementId = ADMOB_IDS.BANNER }) => {
  const { t } = useAppTheme();
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="w-full py-1 px-4 my-2" id="admob-banner-container">
      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between shadow-sm relative overflow-hidden max-w-xl mx-auto">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Ad
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Zyvo Cloud Engine
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Host websites with 99.9% uptime. Native server clusters in Karachi & Islamabad.
            </p>
          </div>
        </div>
        <button
          onClick={() => setClosed(true)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          aria-label="Close Ad"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Invisible signature mapping placeholder ID to keep trace safe */}
        <span className="hidden" data-placement-id={placementId}></span>
      </div>
    </div>
  );
};

/**
 * 2. INTERSTITIAL FULL-SCREEN AD CONTROLLER (PROGRAMMATIC OR MODAL-BASED)
 */
interface InterstitialProps {
  isOpen: boolean;
  onClose: () => void;
  placementId?: string;
}

export const AdMobInterstitial: React.FC<InterstitialProps> = ({
  isOpen,
  onClose,
  placementId = ADMOB_IDS.INTERSTITIAL,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(5);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(5);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="admob-interstitial-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-between p-6 text-white text-center"
        >
          {/* Header */}
          <div className="w-full flex justify-between items-center max-w-md">
            <span className="bg-white/20 text-[10px] uppercase font-bold px-2 py-1 rounded">
              Sponsored Advertisement
            </span>
            {secondsRemaining > 0 ? (
              <span className="text-xs text-white/60">
                Close in {secondsRemaining}s
              </span>
            ) : (
              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/25 text-white p-1.5 rounded-full transition-colors flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Ad Creative Body */}
          <div className="flex flex-col items-center justify-center space-y-6 max-w-md px-4">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Mailix Premium</h2>
              <p className="text-sm text-slate-400 mt-2">
                Upgrade to support unlimited custom usernames, direct forward configurations, and ad-free browsing.
              </p>
            </div>
            <button
              onClick={() => {
                alert('Zyvo checkout flows are opening safely in an external window.');
                onClose();
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-2xl transition-all shadow-md active:scale-98"
            >
              Learn More
            </button>
          </div>

          {/* Footer details holding the placement tracking IDs */}
          <div className="text-[10px] text-slate-500 flex flex-col items-center">
            <span>Powered by Zyvo Ad Exchange Network</span>
            <span>Ref: {placementId}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 3. REWARDED AD DIALOG
 */
interface RewardedProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardEarned: () => void;
  placementId?: string;
}

export const AdMobRewarded: React.FC<RewardedProps> = ({
  isOpen,
  onClose,
  onRewardEarned,
  placementId = ADMOB_IDS.REWARDED,
}) => {
  const [countdown, setCountdown] = useState(10);
  const [adFinished, setAdFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      setAdFinished(false);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClaim = () => {
    onRewardEarned();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="admob-rewarded-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-6 text-white text-center"
        >
          {/* Header */}
          <div className="w-full flex justify-between items-center max-w-md">
            <span className="bg-yellow-500/20 text-yellow-400 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
              <Trophy className="w-3 h-3 inline mr-1" />
              <span>Watch to Earn Username Customization</span>
            </span>
            {!adFinished ? (
              <span className="text-xs text-white/50">
                Reward unlocks in {countdown}s
              </span>
            ) : (
              <span className="text-xs text-green-400 font-semibold">
                Ad completed!
              </span>
            )}
          </div>

          {/* Video Mock Arena */}
          <div className="flex-1 w-full max-w-md my-8 rounded-3xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 opacity-40"></div>
            
            <div className="z-10 flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 animate-pulse">
                <Trophy className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold">Zyvo Delivery & Courier Solutions</p>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Send packages anywhere in Pakistan with zero hassle. Track in real-time, cash-on-delivery ready for ecommerce partners.
              </p>
              <div className="w-full max-w-xs bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
                <div 
                  className="bg-yellow-500 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Call to action or Close */}
          <div className="w-full max-w-md space-y-4">
            {adFinished ? (
              <button
                onClick={handleClaim}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-3 px-6 rounded-2xl transition-all shadow-lg active:scale-98 flex items-center justify-center space-x-2"
              >
                <span>Claim Reward</span>
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl transition-all text-xs"
                >
                  Skip Reward
                </button>
                <div className="flex-1 text-[10px] text-slate-500 text-left flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1 text-slate-600 shrink-0" />
                  <span>Skipping will not unlock the custom name option.</span>
                </div>
              </div>
            )}
            <div className="text-[10px] text-slate-600 flex justify-between px-2">
              <span>Dev Node Ref: {placementId}</span>
              <span>Zyvo Ad Engine v2.0</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
