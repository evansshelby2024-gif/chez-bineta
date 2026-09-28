import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, X, CheckCircle, ArrowRight, Share2, PlusSquare, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';

interface PWAInstallBannerProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ forceOpen = false, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isDismissed, install, dismissPrompt } = usePWAInstall();
  const { themeMode, showToast, userRole } = useApp();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const isLight = themeMode === 'light-orange';

  // Do not show automatically if already running standalone or seller mode
  const shouldShowAuto = !isInstalled && !isDismissed && userRole === 'client';
  const isOpen = forceOpen || shouldShowAuto;

  if (!isOpen || isInstalled) return null;

  const handleClose = () => {
    dismissPrompt();
    if (onClose) onClose();
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (isInstallable) {
      setIsInstalling(true);
      try {
        const success = await install();
        if (success) {
          showToast("Application Chez Bineta installée sur votre téléphone ! 🎉", "success");
          handleClose();
        }
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Fallback for browsers that require standard menu add
      setShowIOSGuide(true);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 pointer-events-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal / Bottom Sheet Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-6 overflow-hidden z-10 ${
            isLight
              ? 'bg-white/95 border-orange-200 text-zinc-900 shadow-orange-500/15'
              : 'bg-[#181614]/95 border-orange-500/30 text-white shadow-black/60'
          }`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {!showIOSGuide ? (
            <div className="space-y-4">
              {/* Icon & App Title */}
              <div className="flex items-center gap-3.5 pr-8">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-lg shadow-orange-500/25 shrink-0 bg-orange-600">
                  <img
                    src="/pwa-192x192.png"
                    alt="Chez Bineta App"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-500">
                      Application Officielle
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      ✓ Sans Play Store
                    </span>
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-black leading-tight">
                    Installer Chez Bineta
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Saint-Louis • Ngallel
                  </p>
                </div>
              </div>

              {/* Benefits list */}
              <div
                className={`p-3.5 rounded-2xl text-xs space-y-2 border ${
                  isLight
                    ? 'bg-orange-50/70 border-orange-200/80 text-orange-950'
                    : 'bg-orange-950/20 border-orange-500/30 text-orange-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Directement dans vos applications :</strong> Accessible sur votre écran d'accueil avec son icône comme une application mobile native.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Instantané & Léger :</strong> Aucun téléchargement lourd sur le Play Store ni encombrement de mémoire sur votre téléphone.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Suivi & Notifications :</strong> Suivez vos commandes en direct avec alertes dès que Bineta prépare votre plat.
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isInstalling}
                  onClick={handleInstallClick}
                  className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>{isInstalling ? 'Installation...' : 'Installer sur mon téléphone'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className={`w-full sm:w-auto py-3 px-4 rounded-2xl font-bold text-xs transition-colors cursor-pointer text-center ${
                    isLight
                      ? 'text-zinc-600 hover:bg-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  Continuer dans le navigateur
                </button>
              </div>
            </div>
          ) : (
            /* Guide pas-à-pas pour iPhone / iPad / Navigateurs standards */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-500 border border-orange-500/40 flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black">
                    Installer sur votre écran d'accueil
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Installation express en 3 secondes :
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    Appuyez sur le bouton <strong>Partager</strong> <Share2 className="inline w-3.5 h-3.5 mx-1 text-orange-500" /> dans la barre de votre navigateur (en bas sur Safari iOS ou en haut à droite sur Chrome).
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    Faites défiler le menu et appuyez sur <strong className="text-orange-500">« Sur l'écran d'accueil »</strong> <PlusSquare className="inline w-3.5 h-3.5 mx-1 text-orange-500" />.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    Touchez <strong>« Ajouter »</strong> en haut à droite : l'icône Chez Bineta sera immédiatement ajoutée à vos applications !
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs cursor-pointer shadow-md shadow-orange-500/20 transition-all text-center"
              >
                C'est compris, merci !
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
