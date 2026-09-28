import React, { useState, useMemo } from 'react';
import {
  Package,
  CheckCircle2,
  Phone,
  MessageSquare,
  AlertCircle,
  Clock,
  Truck,
  Store,
  Check,
  Sparkles,
  ArrowRight,
  Trash2,
  X,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  XCircle,
  History,
  RotateCcw,
  Volume2,
  VolumeX,
  Bell,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { OrderStatus, Order } from '../types';
import {
  formatFCFA,
  buildWhatsAppOrderLink,
  BINETA_PHONE_DISPLAY,
  BINETA_PHONE_CLEAN,
  BINETA_ADDRESS
} from '../utils/formatters';

export const OrderTrackingView: React.FC = () => {
  const {
    orders,
    trackedOrderId,
    setTrackedOrderId,
    setActiveTab,
    themeMode,
    customerOrderIds,
    removeCustomerOrder,
    clearCustomerHistory,
    showToast,
    soundEnabled,
    setSoundEnabled,
    playTestSound,
    requestNotificationPermission,
    lookupCustomerOrdersByPhone,
    claimOrderByNumber,
  } = useApp();

  const [searchInput, setSearchInput] = useState('');
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [isDeletingOrderId, setIsDeletingOrderId] = useState<string | null>(null);

  const isLight = themeMode === 'light-orange';

  // Find the most appropriate order for this customer device
  const currentOrder: Order | null = useMemo(() => {
    if (trackedOrderId) {
      const found = orders.find((o) => o.id === trackedOrderId);
      if (found) return found;
    }
    // Check customer's device order history
    if (customerOrderIds && customerOrderIds.length > 0) {
      for (const id of customerOrderIds) {
        const found = orders.find((o) => o.id === id);
        if (found) return found;
      }
    }
    return null;
  }, [orders, trackedOrderId, customerOrderIds]);

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    setIsSearchingDb(true);
    try {
      // If looks like phone number
      const digitsOnly = query.replace(/[^0-9]/g, '');
      if (digitsOnly.length >= 6 && !query.startsWith('#') && !query.toUpperCase().startsWith('CB-')) {
        const found = await lookupCustomerOrdersByPhone(query);
        if (found.length > 0) {
          setTrackedOrderId(found[0].id);
          setSearchInput('');
          return;
        }
      }

      // Try claim by Order ID
      const claimed = await claimOrderByNumber(query);
      if (claimed) {
        setSearchInput('');
      }
    } finally {
      setIsSearchingDb(false);
    }
  };

  // Filter orders relevant to this user
  const clientVisibleOrders = useMemo(() => {
    if (customerOrderIds && customerOrderIds.length > 0) {
      const foundList = orders.filter((o) => customerOrderIds.includes(o.id));
      if (currentOrder && !foundList.some((o) => o.id === currentOrder.id)) {
        foundList.unshift(currentOrder);
      }
      return foundList;
    }
    return currentOrder ? [currentOrder] : [];
  }, [orders, customerOrderIds, currentOrder]);

  if (!currentOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-8 rounded-3xl border text-center space-y-5 shadow-lg ${
            isLight ? 'bg-white border-orange-100 shadow-orange-500/5' : 'bg-[#1c1916] border-zinc-800'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto ${
              isLight ? 'bg-orange-50 border-orange-200 text-orange-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <Package className="w-8 h-8" />
          </div>

          <div>
            <h2 className={`font-heading text-xl sm:text-2xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              Aucune commande active à afficher
            </h2>
            <p className={`text-xs mt-1.5 max-w-sm mx-auto leading-relaxed ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Vous n'avez pas encore passé de commande sur cet appareil, ou l'historique a été réinitialisé.
            </p>
          </div>

          {/* Search by ID form */}
          <div className="pt-2 max-w-xs mx-auto">
            <span className="block text-[11px] font-bold text-zinc-400 mb-2">
              Retrouver une commande avec son numéro :
            </span>
            <form onSubmit={handleSearchOrder} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ex: #CB-1043 ou tél"
                className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-zinc-50 border-orange-200 text-zinc-900 focus:border-orange-500'
                    : 'bg-zinc-900 border-zinc-700 text-white focus:border-orange-500'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors cursor-pointer shrink-0"
              >
                Suivre
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
            <button
              onClick={() => setActiveTab('menu')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs sm:text-sm hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Découvrir la Carte & Commander</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const isDelivery = currentOrder.mode === 'livraison';

  const deliverySteps: { key: OrderStatus; label: string; icon: string }[] = [
    { key: 'received', label: 'Commande reçue', icon: '🟢' },
    { key: 'preparing', label: 'En préparation (Acceptée)', icon: '🟡' },
    { key: 'ready', label: 'Commande prête', icon: '🔵' },
    { key: 'delivering', label: 'En livraison', icon: '🟣' },
    { key: 'completed', label: 'Commande livrée', icon: '✅' },
  ];

  const pickupSteps: { key: OrderStatus; label: string; icon: string }[] = [
    { key: 'received', label: 'Commande reçue', icon: '🟢' },
    { key: 'preparing', label: 'En préparation (Acceptée)', icon: '🟡' },
    { key: 'ready', label: 'Prête à récupérer', icon: '🔵' },
    { key: 'completed', label: 'Retirée', icon: '✅' },
  ];

  const steps = isDelivery ? deliverySteps : pickupSteps;

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return steps.findIndex((s) => s.key === status);
  };

  const currentStepIndex = getStepIndex(currentOrder.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header & Order Search / History Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-orange-500">
              Suivi en temps réel
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h2 className={`font-heading text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            Statut de votre Commande
          </h2>
        </div>

        {/* Quick order search */}
        <form onSubmit={handleSearchOrder} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="#CB-1042 ou tél"
            className={`px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors w-38 sm:w-44 ${
              isLight
                ? 'bg-white border-orange-200 text-zinc-900 focus:border-orange-500'
                : 'bg-zinc-900 border-zinc-700 text-white focus:border-orange-500'
            }`}
          />
          <button
            type="submit"
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
              isLight
                ? 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                : 'bg-zinc-800 hover:bg-zinc-700 text-orange-400 border-zinc-700'
            }`}
          >
            Chercher
          </button>
        </form>
      </motion.div>

      {/* Real-time Connection & Notification Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          isLight
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
            : 'bg-emerald-950/50 border-emerald-700/70 text-emerald-100 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-bold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Liaison directe vendeur ⇄ client active (temps réel)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
            }`}
            title="Activer ou couper les notifications sonores"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Alerte sonore ON' : 'Alerte sonore OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => playTestSound('accepted')}
            className={`px-2.5 py-1.5 rounded-xl border font-bold transition-colors cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border-emerald-800'
            }`}
            title="Tester le carillon sonore de validation"
          >
            🔔 Tester son
          </button>

          {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="px-2.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              title="Autoriser les notifications système pour être alerté en direct"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Activer Push</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Orders selector pills & Clear history button */}
      {clientVisibleOrders.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-zinc-500/5 border border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none max-w-full">
            <span className={`text-[11px] font-bold whitespace-nowrap flex items-center gap-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              <History className="w-3.5 h-3.5 text-orange-500" />
              <span>Vos commandes :</span>
            </span>

            {clientVisibleOrders.map((o) => {
              const isSelected = o.id === currentOrder.id;
              const isDone = o.status === 'completed';
              const isCancelled = o.status === 'cancelled';
              const isPrep = o.status === 'preparing';
              const isRec = o.status === 'received';

              return (
                <div
                  key={o.id}
                  className={`inline-flex items-center rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? isCancelled
                        ? 'bg-red-600 text-white border-red-500 ring-2 ring-red-500/40 shadow-md'
                        : isPrep
                        ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-500/40 shadow-md'
                        : 'bg-orange-500 text-white border-orange-400 ring-2 ring-orange-500/40 shadow-md'
                      : isCancelled
                      ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 hover:border-red-500'
                      : isPrep
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:border-emerald-500'
                      : isLight
                      ? 'bg-white text-zinc-700 border-zinc-200 hover:border-orange-300'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setTrackedOrderId(o.id)}
                    className="px-2.5 py-1.5 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{o.id}</span>
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10">
                      {isCancelled && '✕ Refusée'}
                      {isPrep && '✓ Acceptée'}
                      {isDone && '✓ Livrée'}
                      {isRec && '⏳ Reçue'}
                    </span>
                  </button>

                  {/* Remove single order from history */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustomerOrder(o.id);
                    }}
                    title="Retirer cette commande de l'historique"
                    className={`px-1.5 py-1.5 rounded-r-xl transition-colors cursor-pointer ${
                      isSelected
                        ? 'hover:bg-black/20 text-white/80 hover:text-white'
                        : 'hover:bg-red-500/10 text-zinc-400 hover:text-red-500'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Effacer tout l'historique */}
          <button
            type="button"
            onClick={() => setIsClearHistoryModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer shrink-0 ml-auto"
            title="Effacer l'historique des commandes sur cet appareil"
          >
            <Trash2 className="w-3 h-3" />
            <span>Effacer l'historique</span>
          </button>
        </div>
      )}

      {/* Main Tracking Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`p-5 sm:p-7 rounded-3xl border shadow-xl space-y-6 ${
          isLight ? 'bg-white border-orange-100 shadow-orange-500/5' : 'bg-[#1c1916] border-orange-950/40'
        }`}
      >
        {/* Order header details */}
        <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${isLight ? 'border-zinc-100' : 'border-zinc-800'}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-heading text-xl sm:text-2xl font-black tabular-nums ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                {currentOrder.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold">
                {isDelivery ? '🚚 Livraison à domicile' : '🏪 Retrait sur place'}
              </span>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Client : <strong className={isLight ? 'text-zinc-800' : 'text-zinc-200'}>{currentOrder.customerName}</strong> ({currentOrder.phone})
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-zinc-400 uppercase font-semibold block">Total Commande</span>
            <span className={`font-heading text-lg sm:text-2xl font-black tabular-nums ${isLight ? 'text-orange-600' : 'text-orange-400'}`}>
              {formatFCFA(currentOrder.total)}
            </span>
          </div>
        </div>

        {/* 🌟 1. EXPLICIT VISUAL FEEDBACK: COMMANDE ACCEPTÉE (PREPARING) - HIGH CONTRAST */}
        {currentOrder.status === 'preparing' && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`p-5 sm:p-6 rounded-3xl border-3 space-y-4 shadow-xl ${
              isLight
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-emerald-700/15'
                : 'bg-[#062d18] border-emerald-400 text-emerald-50 shadow-emerald-500/25'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600 dark:bg-emerald-400 text-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/40 ring-4 ring-emerald-500/30">
                <CheckCircle2 className="w-9 h-9 stroke-[3.5] animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-700 dark:bg-emerald-400 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                    <span>COMMANDE ACCEPTÉE & VALIDÉE</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/20 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Validée par Bineta</span>
                  </span>
                </div>

                <h3 className="font-heading text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-50 mt-1 leading-snug">
                  En préparation en cuisine 👨‍🍳🔥
                </h3>

                <p className="text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-100 mt-1 leading-relaxed">
                  Excellente nouvelle ! La gérante Bineta a bien accepté votre commande. Vos délices sont en cours de cuisson et d'assemblage avec les ingrédients les plus frais de Saint-Louis.
                </p>
              </div>
            </div>

            {/* Estimated prep time box */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/95 border-2 border-emerald-500 dark:border-emerald-400 text-xs font-bold text-emerald-950 dark:text-emerald-100 flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-emerald-950 dark:text-emerald-100">
                  Délai estimé : <strong>15 à 25 minutes</strong> selon l'affluence en cuisine
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[11px] font-black">
                ⚡ Mis à jour en direct
              </span>
            </div>
          </motion.div>
        )}

        {/* 🌟 2. EXPLICIT VISUAL FEEDBACK: COMMANDE REFUSÉE (CANCELLED) - HIGH CONTRAST */}
        {currentOrder.status === 'cancelled' && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`p-5 sm:p-6 rounded-3xl border-3 space-y-4 shadow-xl ${
              isLight
                ? 'bg-rose-50 border-red-600 text-red-950 shadow-red-700/15'
                : 'bg-[#300a0a] border-red-500 text-rose-50 shadow-red-500/25'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-600 dark:bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/40 ring-4 ring-red-500/30">
                <XCircle className="w-9 h-9 stroke-[3]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-red-700 dark:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5 stroke-[3.5]" />
                    <span>COMMANDE NON RETENUE / REFUSÉE</span>
                  </span>
                </div>

                <h3 className="font-heading text-xl sm:text-2xl font-black text-red-950 dark:text-rose-50 mt-1 leading-snug">
                  Commande refusée par le restaurant
                </h3>

                {/* Explicit refusal reason box */}
                <div className="mt-2 p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border-2 border-red-600 dark:border-red-500 text-xs shadow-xs">
                  <div className="flex items-center gap-1.5 text-red-900 dark:text-red-300 font-bold uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    <span>Motif communiqué par la gérante Bineta :</span>
                  </div>
                  <strong className="text-red-700 dark:text-red-300 font-black text-base sm:text-lg block mt-0.5">
                    {currentOrder.rejectionReason || 'Rupture temporaire d’ingrédients ou restaurant complet'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Financial Safety Reassurance Box */}
            <div className="p-4 rounded-2xl bg-emerald-950 text-white dark:bg-emerald-950 dark:text-emerald-50 border-2 border-emerald-500/60 text-xs space-y-1 shadow-sm">
              <div className="flex items-center gap-2 font-black text-emerald-300 text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>GARANTIE ZÉRO FCFA DÉBITÉ</span>
              </div>
              <p className="text-emerald-100/90 leading-relaxed font-medium">
                Aucun paiement n'a été prélevé sur votre compte : le règlement Chez Bineta s'effectue exclusivement en espèces lors de la réception ou au comptoir. Vous pouvez choisir une autre recette ou joindre directement la gérante.
              </p>
            </div>

            {/* Quick Action buttons upon refusal */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={`tel:${BINETA_PHONE_CLEAN}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Appeler Bineta</span>
              </a>

              <a
                href={buildWhatsAppOrderLink(currentOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => setActiveTab('menu')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
              >
                <span>Commander un autre délice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => removeCustomerOrder(currentOrder.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer ml-auto"
                title="Retirer cette commande refusée de mon écran"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Retirer</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* 🌟 3. EN ATTENTE DE CONFIRMATION (RECEIVED) */}
        {currentOrder.status === 'received' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 dark:text-amber-100 space-y-2.5"
          >
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-amber-500 animate-ping shrink-0" />
              <div>
                <strong className="block font-heading text-base font-black text-amber-600 dark:text-amber-400">
                  🟠 COMMANDE REÇUE — EN ATTENTE D'ACCEPTATION
                </strong>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                  Votre commande est bien parvenue sur le terminal de la gérante Bineta. Elle va valider la commande d'un instant à l'autre.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-amber-500/20 pt-2 flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
              <span>Cette page se met à jour en direct dès que la gérante accepte ou refuse.</span>
            </p>
          </motion.div>
        )}

        {/* 🌟 4. COMMANDE PRÊTE (READY) */}
        {currentOrder.status === 'ready' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 rounded-2xl bg-blue-500/10 border-2 border-blue-500/50 text-blue-950 dark:text-blue-100 space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <strong className="block font-heading text-base font-black text-blue-600 dark:text-blue-400">
                  🔵 COMMANDE CHAUDE & PRÊTE ! ✨
                </strong>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                  {isDelivery
                    ? 'Vos plats sont chauds et emballés. Le livreur prend le relais pour acheminer votre commande.'
                    : 'Vos délices vous attendent au comptoir Chez Bineta à Ngallel (côté DSCOS).'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🌟 5. EN LIVRAISON (DELIVERING) */}
        {currentOrder.status === 'delivering' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 rounded-2xl bg-purple-500/10 border-2 border-purple-500/50 text-purple-950 dark:text-purple-100 space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Truck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <strong className="block font-heading text-base font-black text-purple-600 dark:text-purple-400">
                  🟣 COMMANDE EN COURS DE LIVRAISON 🚚
                </strong>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                  Le livreur est en route vers : <strong>{currentOrder.address || currentOrder.quartier}</strong>. Merci de préparer l'appoint en espèces (<strong>{formatFCFA(currentOrder.total)}</strong>).
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🌟 6. COMMANDE TERMINÉE (COMPLETED) */}
        {currentOrder.status === 'completed' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-950 dark:text-emerald-100 space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <strong className="block font-heading text-base font-black text-emerald-600 dark:text-emerald-400">
                  ✅ COMMANDE RETIRÉE / LIVRÉE ! BON APPÉTIT 😋
                </strong>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                  Merci pour votre confiance chez Chez Bineta. Nous espérons que vous vous régalez !
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step-by-step Visual Tracker */}
        <div className="py-2">
          {currentOrder.status === 'cancelled' ? (
            <div className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 ${
              isLight ? 'bg-red-50/80 border-red-500 text-red-950' : 'bg-red-950/40 border-red-500 text-red-100'
            }`}>
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 ring-4 ring-red-500/30 shadow-md">
                <XCircle className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="flex-1">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                  STATUT FINAL : COMMANDE NON RETENUE
                </span>
                <h4 className="font-heading font-black text-base text-red-700 dark:text-red-300 mt-1">
                  Commande refusée par Chez Bineta
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                  Motif : <strong>{currentOrder.rejectionReason || 'Non spécifié'}</strong> (Aucun débit bancaire).
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className={`absolute left-4 top-4 bottom-4 w-0.5 ${isLight ? 'bg-orange-100' : 'bg-zinc-800'}`} />

              <div className="space-y-6">
                {steps.map((step, idx) => {
                  const isPast = currentStepIndex > idx;
                  const isCurrent = currentStepIndex === idx;
                  const isPrepStep = step.key === 'preparing';

                  return (
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.08 }}
                      className="relative flex items-start gap-4"
                    >
                      {/* Node Icon */}
                      <div
                        className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow ${
                          isCurrent
                            ? isPrepStep
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30 scale-110'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white ring-4 ring-orange-500/20 scale-110'
                            : isPast
                            ? 'bg-emerald-500 text-white'
                            : isLight
                            ? 'bg-zinc-100 border border-zinc-200 text-zinc-400'
                            : 'bg-zinc-900 border border-zinc-700 text-zinc-500'
                        }`}
                      >
                        {isPast ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : isCurrent && isPrepStep ? (
                          <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                        ) : (
                          step.icon
                        )}
                      </div>

                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-heading font-black text-sm ${
                              isCurrent
                                ? isPrepStep
                                  ? 'text-emerald-700 dark:text-emerald-300 text-base'
                                  : isLight
                                  ? 'text-orange-600'
                                  : 'text-orange-400'
                                : isPast
                                ? isLight
                                  ? 'text-zinc-800 font-bold'
                                  : 'text-zinc-200 font-bold'
                                : isLight
                                ? 'text-zinc-400 font-medium'
                                : 'text-zinc-500 font-medium'
                            }`}
                          >
                            {isPrepStep ? 'Acceptée & En Préparation' : step.label}
                          </h4>
                          {isCurrent && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isPrepStep
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-orange-500/10 text-orange-600 animate-pulse'
                              }`}
                            >
                              {isPrepStep ? '✓ Validée' : 'En cours'}
                            </span>
                          )}
                        </div>

                        <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          {step.key === 'received' && 'Commande reçue par Chez Bineta'}
                          {step.key === 'preparing' && 'Validée par la gérante et en cours de préparation en cuisine'}
                          {step.key === 'ready' &&
                            (isDelivery ? 'Emballée et prête pour le livreur' : 'Prête à être récupérée sur place')}
                          {step.key === 'delivering' && 'Le livreur est en route vers votre adresse'}
                          {step.key === 'completed' &&
                            (isDelivery ? 'Commande livrée à destination' : 'Commande retirée au comptoir')}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Items Breakdown */}
        <div className={`pt-4 border-t ${isLight ? 'border-zinc-100' : 'border-zinc-800'}`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
            Détail des délices commandés :
          </h4>
          <div className="space-y-2">
            {currentOrder.items.map((item) => (
              <div
                key={item.cartItemId}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
                  isLight ? 'bg-zinc-50/70 border-zinc-200/80' : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <strong className={isLight ? 'text-zinc-900' : 'text-white'}>{item.name}</strong>
                    {item.selectedOption && (
                      <span className="text-[11px] text-orange-500 block">
                        Garniture : {item.selectedOption}
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-400 block">
                      {formatFCFA(item.price)} × {item.quantity}
                    </span>
                  </div>
                </div>
                <span className={`font-heading font-black tabular-nums ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {formatFCFA(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery / Pickup address info */}
        <div
          className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
            isLight ? 'bg-orange-50/50 border-orange-100' : 'bg-zinc-900 border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-orange-600 dark:text-orange-400">
            {isDelivery ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
            <span>{isDelivery ? 'Informations de livraison' : 'Point de retrait'}</span>
          </div>

          {isDelivery ? (
            <div className="text-zinc-600 dark:text-zinc-300 space-y-0.5">
              <p>📍 Quartier : <strong>{currentOrder.quartier}</strong></p>
              <p>🏠 Adresse : {currentOrder.address}</p>
              {currentOrder.indications && (
                <p className="text-zinc-500 italic">« {currentOrder.indications} »</p>
              )}
            </div>
          ) : (
            <div className="text-zinc-600 dark:text-zinc-300 space-y-0.5">
              <p>📍 Adresse : <strong>{BINETA_ADDRESS}</strong></p>
              {currentOrder.pickupTime && (
                <p>⏰ Heure souhaitée : <strong>{currentOrder.pickupTime}</strong></p>
              )}
            </div>
          )}

          <p className="text-[11px] text-zinc-400 pt-1">
            💵 Mode de règlement :{' '}
            <strong>
              {currentOrder.paymentMethod === 'especes_livraison'
                ? 'Espèces à la livraison'
                : 'Espèces au retrait'}
            </strong>
          </p>
        </div>

        {/* WhatsApp & Contact Help Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={buildWhatsAppOrderLink(currentOrder)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Écrire à Bineta sur WhatsApp</span>
          </a>

          <a
            href={`tel:${BINETA_PHONE_CLEAN}`}
            className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              isLight
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Appeler {BINETA_PHONE_DISPLAY}</span>
          </a>
        </div>

        {/* Bottom utility: Remove this single order */}
        <div className="flex justify-end pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={() => removeCustomerOrder(currentOrder.id)}
            className="text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Retirer cette commande de mon historique local</span>
          </button>
        </div>
      </motion.div>

      {/* Confirmation Modal to Clear Full Order History on Device */}
      <AnimatePresence>
        {isClearHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl space-y-4 text-center ${
                isLight ? 'bg-white border-zinc-200' : 'bg-[#1c1916] border-zinc-800 text-white'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 mx-auto flex items-center justify-center">
                <Trash2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold">
                  Effacer tout l'historique ?
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Cette action supprime la liste des commandes enregistrées sur cet appareil. Vos futures commandes apparaîtront normalement.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClearHistoryModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearCustomerHistory();
                    setIsClearHistoryModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Effacer tout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
