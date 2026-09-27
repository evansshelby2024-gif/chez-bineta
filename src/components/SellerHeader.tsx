import React from 'react';
import {
  ChefHat,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  LogOut,
  ShoppingBag,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SellerHeader: React.FC = () => {
  const {
    switchToClientRole,
    logoutAdmin,
    soundEnabled,
    setSoundEnabled,
    playTestSound,
    requestNotificationPermission,
    themeMode,
    toggleThemeMode,
    orders,
  } = useApp();

  const isLight = themeMode === 'light-orange';
  const pendingCount = orders.filter((o) => o.status === 'received').length;

  const openClientInNewTab = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.origin);
      url.searchParams.set('role', 'client');
      window.open(url.toString(), '_blank');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-amber-950 text-white border-amber-800 shadow-md'
          : 'bg-[#141210] text-white border-zinc-800 shadow-lg'
      }`}
    >
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-4 py-1.5 text-white text-[11px] font-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="w-4 h-4 shrink-0" />
          <span>ESPACE PRIVÉ VENDEUR & CUISINE — CHEZ BINETA</span>
          <span className="hidden sm:inline opacity-80 font-normal">
            • Interface exclusive gérante (aucun message client)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black animate-pulse flex items-center gap-1">
              <span>{pendingCount} en attente !</span>
            </span>
          )}
          <button
            onClick={openClientInNewTab}
            className="hover:underline flex items-center gap-1 font-bold cursor-pointer"
            title="Ouvrir la vue client dans un nouvel onglet"
          >
            <span>Tester côté client ↗</span>
          </button>
        </div>
      </div>

      {/* Main Seller Navigation bar */}
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & live indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black text-xl shadow-md shrink-0">
            🍳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-base sm:text-lg font-black tracking-tight leading-tight">
                Terminal Caisse & Cuisine
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>En direct</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-300">
              Réception des commandes en temps réel & gestion des services
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
            title="Activer ou couper la sonnette cuisine"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sonnette ON' : 'Sonnette OFF'}</span>
          </button>

          {/* Test chime */}
          <button
            type="button"
            onClick={() => playTestSound('new_order')}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 font-bold transition-colors cursor-pointer"
            title="Tester le carillon de commande"
          >
            🔔 <span className="hidden sm:inline">Test son</span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleThemeMode}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 cursor-pointer"
            title="Basculer le thème"
          >
            {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Switch to Client View button */}
          <button
            onClick={switchToClientRole}
            className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition-all cursor-pointer"
            title="Quitter l'espace gérante et basculer sur l'interface client"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Vue Client</span>
          </button>

          {/* Lock / Logout */}
          <button
            onClick={logoutAdmin}
            className="px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/40 font-bold flex items-center gap-1 cursor-pointer"
            title="Verrouiller la caisse"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Verrouiller</span>
          </button>
        </div>
      </div>
    </header>
  );
};
