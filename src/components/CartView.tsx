import React from 'react';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/formatters';

export const CartView: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, setActiveTab, setIsCheckoutModalOpen, themeMode } = useApp();

  const isLight = themeMode === 'light-orange';

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto py-16 px-4 text-center"
      >
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 border ${
            isLight ? 'bg-orange-50 border-orange-200 text-orange-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
          }`}
        >
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className={`font-heading text-2xl font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
          Votre panier est vide
        </h2>
        <p className={`mt-2 text-sm max-w-md mx-auto ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Découvrez nos Mini Tacos, Mini Pizzas, Fatayas croustillants, Nems et Poutines gourmandes !
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('menu')}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <span>DÉCOUVRIR LE MENU</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`font-heading text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            Mon Panier Gourmand
          </h2>
          <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {cart.length} référence{cart.length > 1 ? 's' : ''} sélectionnée{cart.length > 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Vider le panier</span>
        </button>
      </div>

      {/* Cart Items List with smooth animated enter & exit transitions */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {cart.map((item) => (
            <motion.div
              key={item.cartItemId}
              layout
              initial={{ opacity: 0, scale: 0.88, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.8,
                x: -60,
                transition: { duration: 0.22, ease: 'easeIn' }
              }}
              transition={{
                layout: { type: 'spring', stiffness: 500, damping: 35 },
                opacity: { duration: 0.2 },
                scale: { type: 'spring', stiffness: 450, damping: 28 },
                y: { type: 'spring', stiffness: 450, damping: 28 },
              }}
              className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-sm transition-colors ${
                isLight ? 'bg-white border-orange-100 shadow-orange-500/5 hover:border-orange-200' : 'bg-[#1c1916] border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 shadow-xs">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{item.icon}</span>
                  <h3 className={`font-heading text-sm sm:text-base font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    {item.name}
                  </h3>
                </div>

                {item.selectedOption && (
                  <p className="text-[11px] text-orange-500 font-semibold truncate mt-0.5">
                    {item.selectedOption}
                  </p>
                )}

                <p className={`text-xs mt-1 font-semibold tabular-nums ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {formatFCFA(item.price)} l’unité
                </p>
              </div>

              {/* Stepper & direct delete action */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                <div
                  className={`flex items-center rounded-xl p-1 border ${
                    isLight ? 'bg-orange-50/80 border-orange-200' : 'bg-zinc-900 border-zinc-700/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.cartItemId, -1)}
                    aria-label="Diminuer"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-all cursor-pointer ${
                      isLight ? 'text-zinc-700 hover:bg-white hover:text-orange-600' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <motion.span
                    key={item.quantity}
                    initial={{ scale: 1.3, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-8 text-center text-xs font-bold tabular-nums ${isLight ? 'text-zinc-900' : 'text-white'}`}
                  >
                    {item.quantity}
                  </motion.span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.cartItemId, 1)}
                    aria-label="Augmenter"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-all cursor-pointer ${
                      isLight ? 'text-zinc-700 hover:bg-white hover:text-orange-600' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[75px]">
                  <span className={`font-heading text-sm sm:text-base font-black tabular-nums block ${isLight ? 'text-orange-600' : 'text-orange-400'}`}>
                    {formatFCFA(item.price * item.quantity)}
                  </span>
                </div>

                {/* Direct delete button */}
                <button
                  type="button"
                  onClick={() => removeFromCart(item.cartItemId)}
                  title="Retirer cet article"
                  aria-label="Retirer cet article"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 active:scale-90 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cash Payment notice */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
          isLight ? 'bg-orange-50 border-orange-200 text-orange-950' : 'bg-orange-500/10 border-orange-500/20 text-orange-200'
        }`}
      >
        <Banknote className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold mb-0.5 text-orange-600 dark:text-orange-400">
            Paiement en espèces uniquement
          </strong>
          <span>
            Aucun paiement en ligne requis. Vous réglez directement en espèces au retrait sur place ou à la réception de votre livraison.
          </span>
        </div>
      </div>

      {/* Summary calculation card */}
      <div
        className={`p-5 rounded-2xl border space-y-3 ${
          isLight ? 'bg-white border-orange-100 shadow-sm' : 'bg-[#1c1916] border-zinc-800'
        }`}
      >
        <div className={`flex items-center justify-between text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
          <span>Sous-total articles :</span>
          <span className={`font-semibold tabular-nums ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{formatFCFA(cartTotal)}</span>
        </div>
        <div className={`flex items-center justify-between text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
          <span>Frais de paiement en ligne :</span>
          <span className="font-bold text-emerald-500">0 FCFA (Gratuit)</span>
        </div>
        <div className={`pt-3 border-t flex items-center justify-between ${isLight ? 'border-zinc-100' : 'border-zinc-800'}`}>
          <span className={`font-heading text-base font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>TOTAL À RÉGLER :</span>
          <span className={`font-heading text-2xl font-black tabular-nums ${isLight ? 'text-orange-600' : 'text-orange-400'}`}>
            {formatFCFA(cartTotal)}
          </span>
        </div>
      </div>

      {/* Checkout CTA */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsCheckoutModalOpen(true)}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <span>PASSER LA COMMANDE</span>
        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
      </motion.button>
    </div>
  );
};
