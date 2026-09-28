import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Lock,
  X,
  CheckCircle2,
  ChefHat,
  ArrowRight,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RoleSwitchModal: React.FC = () => {
  const {
    userRole,
    setUserRole,
    isRoleModalOpen,
    setIsRoleModalOpen,
    isAdminLoggedIn,
    loginAdmin,
    themeMode,
    setIsSupabaseAuthModalOpen,
  } = useApp();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const isLight = themeMode === 'light-orange';

  if (!isRoleModalOpen) return null;

  const handleClose = () => {
    setIsRoleModalOpen(false);
    setPinInput('');
    setPinError(false);
  };

  const handleSelectClient = () => {
    setUserRole('client');
    handleClose();
  };

  const handleUnlockSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginAdmin(pinInput);
    if (success) {
      setUserRole('seller');
      handleClose();
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const openInNewTab = (role: 'client' | 'seller') => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.origin);
      url.searchParams.set('role', role);
      window.open(url.toString(), '_blank');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-lg rounded-[32px] border shadow-[0_25px_60px_rgba(0,0,0,0.35)] p-6 sm:p-7 overflow-hidden z-10 ios-glass-modal ${
            isLight
              ? 'bg-white/85 border-white/70 text-zinc-900 shadow-orange-500/10'
              : 'bg-[#181614]/85 border-white/15 text-white'
          }`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                Séparation des Espaces
              </span>
              <h2 className="font-heading text-lg sm:text-xl font-black">
                Choisir votre Interface
              </h2>
            </div>
          </div>

          {/* Explanation note */}
          <div className={`p-3.5 rounded-2xl mb-5 text-xs flex items-start gap-2.5 border ${
            isLight ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          }`}>
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Sécurité & Confidentialité garantie :</strong> Les interfaces Vendeur et Client sont strictement cloisonnées. Le client ne reçoit jamais les alertes internes, carillons de cuisine ou commandes de la gérante.
            </p>
          </div>

          <div className="space-y-4">
            {/* 1. Interface Client Option */}
            <div
              className={`p-4 rounded-2xl border-2 transition-all ${
                userRole === 'client'
                  ? 'border-orange-500 bg-orange-500/10'
                  : isLight
                  ? 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-black text-sm">
                        Interface Client
                      </h3>
                      {userRole === 'client' && (
                        <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-black text-[10px]">
                          Actuel
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Explorer les délices, passer commande et suivre son repas en direct.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={handleSelectClient}
                  className="flex-1 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Passer en Mode Client</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openInNewTab('client')}
                  className="py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
                  title="Ouvrir le client dans un autre onglet pour tester les deux en simultané"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>2ème onglet</span>
                </button>
              </div>
            </div>

            {/* 2. Interface Vendeur (Bineta) Option */}
            <div
              className={`p-4 rounded-2xl border-2 transition-all ${
                userRole === 'seller'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : isLight
                  ? 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-black text-sm">
                        Interface Vendeur / Caisse Cuisine
                      </h3>
                      {userRole === 'seller' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                          Actuel
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Réception des commandes en cuisine, carillon d’alerte, acceptation / refus, gestion des plats et caisse.
                    </p>
                  </div>
                </div>
              </div>

              {/* If already logged in, simple switch */}
              {isAdminLoggedIn ? (
                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      setUserRole('seller');
                      handleClose();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Accéder au Terminal Caisse</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openInNewTab('seller')}
                    className="py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
                    title="Ouvrir le terminal vendeur dans un autre onglet"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>2ème onglet</span>
                  </button>
                </div>
              ) : (
                /* PIN input requirement to access seller terminal */
                <form onSubmit={handleUnlockSeller} className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="password"
                        maxLength={8}
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setPinError(false);
                        }}
                        placeholder="Code PIN Gérante (par défaut: 1234)"
                        className={`w-full py-2 px-3 text-xs rounded-xl font-bold tracking-wider border ${
                          pinError
                            ? 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200'
                            : isLight
                            ? 'bg-white border-zinc-300 text-zinc-900 focus:border-emerald-500'
                            : 'bg-zinc-950 border-zinc-700 text-white focus:border-emerald-500'
                        } focus:outline-none`}
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20 cursor-pointer shrink-0"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Déverrouiller</span>
                    </button>
                  </div>
                  {pinError && (
                    <span className="text-[11px] font-bold text-red-500 block">
                      Code PIN invalide. Le code par défaut est 1234.
                    </span>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-400">
                      ⚡ Vérification sécurisée par RPC Supabase
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        setIsSupabaseAuthModalOpen(true);
                      }}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                    >
                      Ou connexion par Email Supabase →
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Multi-Tab Testing Tip */}
          <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>💡 Conseil : Testez en direct en ouvrant deux onglets côte à côte.</span>
            <button
              onClick={() => openInNewTab(userRole === 'client' ? 'seller' : 'client')}
              className="font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ouvrir l'autre rôle</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
