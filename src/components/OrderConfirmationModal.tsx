import React from 'react';
import { CheckCircle2, MessageSquare, Phone, MapPin, ArrowRight, X, Truck, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { formatFCFA, buildWhatsAppOrderLink, BINETA_PHONE_DISPLAY, BINETA_ADDRESS } from '../utils/formatters';

export const OrderConfirmationModal: React.FC = () => {
  const { activeConfirmedOrder, setActiveConfirmedOrder, setActiveTab, setTrackedOrderId, themeMode } = useApp();

  if (!activeConfirmedOrder) return null;

  const order = activeConfirmedOrder;
  const isDelivery = order.mode === 'livraison';
  const isLight = themeMode === 'light-orange';

  const handleTrackOrder = () => {
    setTrackedOrderId(order.id);
    setActiveConfirmedOrder(null);
    setActiveTab('tracking');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveConfirmedOrder(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className={`relative w-full max-w-md rounded-[32px] p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] text-center overflow-y-auto max-h-[92vh] z-10 border ios-glass-modal ${
            isLight ? 'bg-white/85 border-white/70 text-zinc-900 shadow-orange-500/10' : 'bg-[#181512]/85 border-white/15 text-white'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={() => setActiveConfirmedOrder(null)}
            className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
              isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.15, stiffness: 300, damping: 20 }}
            className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 mx-auto flex items-center justify-center border-2 border-emerald-500/40 mb-3 shadow-lg shadow-emerald-500/10"
          >
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </motion.div>

          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            ✅ COMMANDE CONFIRMÉE
          </span>

          <h2 className={`font-heading text-xl md:text-2xl font-black mt-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            Merci d'avoir commandé chez Chez Bineta !
          </h2>

          {/* Order Ticket Details */}
          <div
            className={`mt-5 p-4 rounded-2xl border text-left space-y-2.5 text-xs ${
              isLight ? 'bg-orange-50/50 border-orange-200 text-zinc-800' : 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-orange-100' : 'border-zinc-800'}`}>
              <span className="font-semibold text-zinc-500">Numéro de Commande :</span>
              <span className="font-heading text-sm font-black text-orange-600 dark:text-orange-400 tabular-nums">
                {order.id}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-500">💰 Total :</span>
              <span className="font-black tabular-nums">{formatFCFA(order.total)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-500">Mode :</span>
              <span className="font-bold flex items-center gap-1">
                {isDelivery ? (
                  <>
                    <Truck className="w-3.5 h-3.5 text-orange-500" />
                    <span>Livraison à domicile</span>
                  </>
                ) : (
                  <>
                    <Store className="w-3.5 h-3.5 text-orange-500" />
                    <span>Retrait sur place ({order.pickupTime})</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-500">💵 Paiement :</span>
              <span className="font-bold text-orange-600 dark:text-orange-300">
                {isDelivery ? 'Espèces à la livraison' : 'Espèces au retrait'}
              </span>
            </div>

            <div className={`pt-2 border-t text-zinc-500 space-y-1 ${isLight ? 'border-orange-100' : 'border-zinc-800'}`}>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                <span>{BINETA_PHONE_DISPLAY}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>{BINETA_ADDRESS}</span>
              </p>
            </div>
          </div>

          {/* WhatsApp Direct Action Prompt */}
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            Pour accélérer le traitement de votre commande, vous pouvez l'envoyer directement sur le WhatsApp de Bineta :
          </div>

          {/* Actions */}
          <div className="mt-4 space-y-2.5">
            <motion.a
              whileTap={{ scale: 0.98 }}
              href={buildWhatsAppOrderLink(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>TRANSMETTRE SUR WHATSAPP À BINETA</span>
            </motion.a>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleTrackOrder}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>SUIVRE L'ÉVOLUTION DE MA COMMANDE</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
