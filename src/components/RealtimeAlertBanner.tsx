import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  Bell,
  ArrowRight,
  X,
  Volume2,
  Sparkles,
  CookingPot,
  Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/formatters';

export const RealtimeAlertBanner: React.FC = () => {
  const {
    latestRealtimeEvent,
    dismissRealtimeEvent,
    setActiveTab,
    setTrackedOrderId,
    acceptOrder,
    refuseOrder,
    themeMode,
    userRole,
  } = useApp();

  const isLight = themeMode === 'light-orange';

  // Auto-dismiss after 12 seconds
  useEffect(() => {
    if (!latestRealtimeEvent) return;
    const timer = setTimeout(() => {
      dismissRealtimeEvent();
    }, 12000);
    return () => clearTimeout(timer);
  }, [latestRealtimeEvent, dismissRealtimeEvent]);

  if (!latestRealtimeEvent) return null;

  // Strict role separation:
  // 1. Client must NEVER see seller's incoming order alerts!
  if (userRole === 'client' && latestRealtimeEvent.type === 'NEW_ORDER') {
    return null;
  }

  // 2. Seller does not need to see customer-facing order tracking cards
  if (
    userRole === 'seller' &&
    (latestRealtimeEvent.type === 'ORDER_ACCEPTED' ||
      latestRealtimeEvent.type === 'ORDER_REFUSED' ||
      latestRealtimeEvent.type === 'ORDER_STATUS_CHANGED')
  ) {
    return null;
  }

  return (
    <div className="fixed top-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={latestRealtimeEvent.timestamp}
          initial={{ opacity: 0, y: -30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="shadow-2xl rounded-3xl overflow-hidden ios-glass"
        >
          {/* 1. ORDER ACCEPTED EVENT */}
          {latestRealtimeEvent.type === 'ORDER_ACCEPTED' && (
            <div
              className={`p-4 sm:p-5 border-3 rounded-3xl ${
                isLight
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-emerald-700/20'
                  : 'bg-[#052312] border-emerald-400 text-emerald-50 shadow-emerald-500/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/40 ring-4 ring-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7 stroke-[3] animate-bounce" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-black text-[11px] uppercase tracking-wider">
                      🟢 COMMANDE ACCEPTÉE !
                    </span>
                    <button
                      onClick={dismissRealtimeEvent}
                      className="p-1 text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 dark:hover:text-white transition-colors cursor-pointer"
                      title="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-heading text-base sm:text-lg font-black mt-1 leading-snug">
                    Bineta prépare votre festin ! 👨‍🍳🔥
                  </h3>

                  <p className="text-xs font-semibold mt-1 opacity-90 leading-relaxed">
                    Votre commande <strong className="font-black underline">{latestRealtimeEvent.orderId}</strong> a été validée par la gérante. Cuisson et préparation en cours.
                  </p>

                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-emerald-600/20 dark:border-emerald-400/30">
                    <button
                      onClick={() => {
                        setTrackedOrderId(latestRealtimeEvent.orderId);
                        setActiveTab('tracking');
                        dismissRealtimeEvent();
                      }}
                      className="flex-1 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <span>Voir mon Suivi en Direct</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={dismissRealtimeEvent}
                      className="py-2 px-3 rounded-xl bg-white/70 dark:bg-emerald-950/80 hover:bg-white dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold text-xs border border-emerald-600/30 transition-colors cursor-pointer"
                    >
                      Compris
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ORDER REFUSED EVENT */}
          {latestRealtimeEvent.type === 'ORDER_REFUSED' && (
            <div
              className={`p-4 sm:p-5 border-3 rounded-3xl ${
                isLight
                  ? 'bg-rose-50 border-red-600 text-red-950 shadow-red-700/20'
                  : 'bg-[#2a0707] border-red-500 text-rose-50 shadow-red-500/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/40 ring-4 ring-red-500/20">
                  <XCircle className="w-7 h-7 stroke-[3]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-700 text-white font-black text-[11px] uppercase tracking-wider">
                      ❌ COMMANDE NON RETENUE
                    </span>
                    <button
                      onClick={dismissRealtimeEvent}
                      className="p-1 text-red-800 dark:text-red-200 hover:text-red-950 dark:hover:text-white transition-colors cursor-pointer"
                      title="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-heading text-base sm:text-lg font-black mt-1 leading-snug">
                    Commande {latestRealtimeEvent.orderId} refusée
                  </h3>

                  <div className="mt-1.5 p-2 rounded-xl bg-white dark:bg-black/40 border border-red-500/40 text-xs">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">
                      Motif communiqué par Bineta :
                    </span>
                    <strong className="text-red-600 dark:text-red-400 font-black">
                      {latestRealtimeEvent.reason || 'Rupture temporaire d’ingrédients'}
                    </strong>
                  </div>

                  <p className="text-[11px] font-medium mt-1.5 opacity-90">
                    💡 <strong>Rassurez-vous :</strong> Aucun argent n'a été débité (règlement en espèces prévu à la réception).
                  </p>

                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-red-600/20 dark:border-red-400/30">
                    <button
                      onClick={() => {
                        setTrackedOrderId(latestRealtimeEvent.orderId);
                        setActiveTab('tracking');
                        dismissRealtimeEvent();
                      }}
                      className="flex-1 py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition-all cursor-pointer"
                    >
                      <span>Consulter les options</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('menu');
                        dismissRealtimeEvent();
                      }}
                      className="py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Autre plat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. NEW ORDER EVENT (For Seller / Kitchen display) */}
          {latestRealtimeEvent.type === 'NEW_ORDER' && (
            <div
              className={`p-4 sm:p-5 border-3 rounded-3xl ${
                isLight
                  ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-amber-700/20'
                  : 'bg-[#291a05] border-amber-500 text-amber-50 shadow-amber-500/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/20">
                  <Bell className="w-7 h-7 stroke-[2.5] animate-wiggle" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-black text-[11px] uppercase tracking-wider">
                      🔔 NOUVELLE COMMANDE REÇUE
                    </span>
                    <button
                      onClick={dismissRealtimeEvent}
                      className="p-1 text-amber-800 dark:text-amber-200 hover:text-amber-950 dark:hover:text-white transition-colors cursor-pointer"
                      title="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-heading text-base sm:text-lg font-black mt-1 leading-snug">
                    {latestRealtimeEvent.order.id} — {latestRealtimeEvent.order.customerName}
                  </h3>

                  <p className="text-xs font-semibold mt-1 opacity-90">
                    Total : <strong>{formatFCFA(latestRealtimeEvent.order.total)}</strong> •{' '}
                    {latestRealtimeEvent.order.mode === 'livraison' ? '🚚 Livraison' : '🏪 Retrait'} (
                    {latestRealtimeEvent.order.items.length} article(s))
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-amber-600/20 dark:border-amber-400/30">
                    <button
                      onClick={() => {
                        acceptOrder(latestRealtimeEvent.order.id);
                        dismissRealtimeEvent();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                    >
                      ✓ Accepter
                    </button>
                    <button
                      onClick={() => {
                        refuseOrder(latestRealtimeEvent.order.id, "Rupture temporaire d'ingrédients");
                        dismissRealtimeEvent();
                      }}
                      className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                    >
                      ✕ Refuser
                    </button>
                    <button
                      onClick={() => {
                        dismissRealtimeEvent();
                      }}
                      className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-zinc-300 font-bold text-xs transition-all cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. OTHER STATUS UPDATE */}
          {latestRealtimeEvent.type === 'ORDER_STATUS_CHANGED' && (
            <div
              className={`p-4 border-2 rounded-3xl ${
                isLight
                  ? 'bg-blue-50 border-blue-500 text-blue-950'
                  : 'bg-[#081728] border-blue-400 text-blue-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {latestRealtimeEvent.status === 'ready' && '🔵'}
                    {latestRealtimeEvent.status === 'delivering' && '🚚'}
                    {latestRealtimeEvent.status === 'completed' && '✅'}
                  </span>
                  <span className="font-heading font-black text-sm">
                    Mise à jour Commande {latestRealtimeEvent.orderId}
                  </span>
                </div>
                <button
                  onClick={dismissRealtimeEvent}
                  className="p-1 opacity-70 hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs mt-1">
                {latestRealtimeEvent.status === 'ready' && 'Votre commande est prête !'}
                {latestRealtimeEvent.status === 'delivering' && 'Votre livreur est en route vers vous !'}
                {latestRealtimeEvent.status === 'completed' && 'Commande livrée / terminée. Bon appétit !'}
              </p>

              <button
                onClick={() => {
                  setTrackedOrderId(latestRealtimeEvent.orderId);
                  setActiveTab('tracking');
                  dismissRealtimeEvent();
                }}
                className="mt-2.5 text-xs font-bold underline cursor-pointer"
              >
                Ouvrir le suivi de commande →
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
