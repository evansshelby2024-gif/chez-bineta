import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Phone, ShieldCheck, Sun, Moon, User as UserIcon, Database, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BINETA_PHONE_DISPLAY, BINETA_PHONE_CLEAN } from '../utils/formatters';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cartCount,
    themeMode,
    toggleThemeMode,
    storeStatus,
    switchToSellerRole,
    reopenWelcome,
    supabaseUser,
    supabaseProfile,
    setIsSupabaseAuthModalOpen,
    logoutSupabase,
  } = useApp();

  const isLight = themeMode === 'light-orange';

  const handleLogoClick = () => {
    reopenWelcome();
  };

  return (
    <>
      {/* Top subtle notification bar */}
      <div
        className={`text-[11px] px-4 py-1 border-b transition-colors ${
          isLight
            ? 'bg-orange-50/50 border-orange-100 text-orange-900'
            : 'bg-[#141210]/60 border-zinc-800/60 text-zinc-400'
        }`}
      >
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">
              Restaurant Chez Bineta • Saint-Louis
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <PWAInstallButton className="hidden sm:inline-flex" />

            {supabaseUser ? (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <UserIcon className="w-3 h-3" />
                <span className="truncate max-w-[120px]">
                  {supabaseProfile?.fullName || supabaseUser.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={logoutSupabase}
                  className="text-zinc-400 hover:text-red-500 ml-1 p-0.5"
                  title="Déconnexion Supabase"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSupabaseAuthModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 cursor-pointer"
                title="Connexion ou Inscription avec Supabase Auth"
              >
                <Database className="w-3 h-3 text-emerald-500" />
                <span>Compte Supabase</span>
              </button>
            )}

            <button
              onClick={switchToSellerRole}
              className={`flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors ${
                isLight ? 'text-orange-700 hover:text-orange-900' : 'text-orange-400 hover:text-orange-300'
              }`}
              title="Accès gérante (Caisse & Cuisine)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              <span>Accès Gérante 🔒</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating iOS 26 Liquid Glass Navbar */}
      <header className="sticky top-2 sm:top-3 z-30 px-3 sm:px-4 max-w-4xl mx-auto w-full transition-all">
        <div
          className={`rounded-full ios-glass-nav border px-3.5 sm:px-5 py-2 flex items-center justify-between gap-3 transition-colors ${
            isLight
              ? 'bg-white/75 border-white/80 shadow-[0_12px_40px_rgba(255,107,0,0.06)]'
              : 'bg-[#151311]/75 border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
          }`}
        >
          {/* Brand Wordmark & Emblem */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            title="Bienvenue Chez Bineta"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-md shrink-0 border border-white/40 ring-2 ring-orange-500/20 group-hover:scale-105 transition-transform">
              <img
                src="/images/chez_bineta_modern_logo.jpg"
                alt="Chez Bineta"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-heading text-base font-black tracking-tight leading-none ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                CHEZ <span className="text-orange-500">BINETA</span>
              </span>
              <div className="flex items-center gap-1 text-[10px] mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    storeStatus === 'open'
                      ? 'bg-emerald-500 animate-pulse'
                      : storeStatus === 'closed'
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                  }`}
                />
                <span className={`font-semibold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {storeStatus === 'open' && 'Ouvert'}
                  {storeStatus === 'closed' && 'Fermé'}
                  {storeStatus === 'reservation_only' && 'Réservation'}
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Frosted Segment Navigation */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-black/5 dark:bg-white/5 border border-white/10 text-xs font-semibold">
            {[
              { id: 'welcome', label: '👋 Bienvenue', action: handleLogoClick },
              { id: 'menu', label: 'Le Menu', action: () => setActiveTab('menu') },
              { id: 'tracking', label: 'Suivi', action: () => setActiveTab('tracking') },
              { id: 'reviews', label: 'Avis ⭐', action: () => setActiveTab('reviews') },
              { id: 'more', label: 'Contact', action: () => setActiveTab('more') },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={tab.action}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/30'
                      : isLight
                      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions: Theme, Call, Cart */}
          <div className="flex items-center gap-2">
            {/* Frosted Theme Switch Button */}
            <button
              type="button"
              onClick={toggleThemeMode}
              title={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90 cursor-pointer ${
                isLight
                  ? 'bg-white/80 border-orange-100 text-orange-600 hover:bg-orange-50 shadow-xs'
                  : 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10'
              }`}
            >
              {isLight ? <Sun className="w-4 h-4 fill-orange-400" /> : <Moon className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Direct Call Button */}
            <a
              href={`tel:${BINETA_PHONE_CLEAN}`}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isLight
                  ? 'bg-white/80 border-orange-100 text-zinc-700 hover:text-orange-600'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              <span className="tabular-nums">{BINETA_PHONE_DISPLAY}</span>
            </a>

            {/* Floating iOS Cart Trigger with glow badge */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveTab('cart')}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg shadow-orange-500/25 border border-white/30 cursor-pointer"
              aria-label="Voir le panier"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.4]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </header>
    </>
  );
};
