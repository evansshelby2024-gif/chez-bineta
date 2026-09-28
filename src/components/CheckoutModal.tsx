import React, { useState, useEffect } from 'react';
import { X, Store, Truck, Banknote, User, Phone, Clock, Navigation, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { OrderMode } from '../types';
import { formatFCFA } from '../utils/formatters';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    cartTotal,
    placeOrder,
    setActiveTab,
    themeMode,
    storeStatus,
    storeClosureMessage,
    showToast,
    savedCustomerInfo,
    saveCustomerInfo,
  } = useApp();

  const [mode, setMode] = useState<OrderMode>('livraison');
  const [customerName, setCustomerName] = useState(savedCustomerInfo?.customerName || '');
  const [phone, setPhone] = useState(savedCustomerInfo?.phone || '');
  const [pickupTime, setPickupTime] = useState('Dès que possible (~20 min)');
  const [address, setAddress] = useState(savedCustomerInfo?.address || '');
  const [quartier, setQuartier] = useState(savedCustomerInfo?.quartier || 'Ngallel');
  const [indications, setIndications] = useState(savedCustomerInfo?.indications || '');
  const [notes, setNotes] = useState('');

  // Whenever modal opens or savedCustomerInfo changes, ensure fields are filled
  useEffect(() => {
    if (isCheckoutModalOpen && savedCustomerInfo) {
      if (!customerName && savedCustomerInfo.customerName) setCustomerName(savedCustomerInfo.customerName);
      if (!phone && savedCustomerInfo.phone) setPhone(savedCustomerInfo.phone);
      if (!address && savedCustomerInfo.address) setAddress(savedCustomerInfo.address);
      if (savedCustomerInfo.quartier) setQuartier(savedCustomerInfo.quartier);
      if (!indications && savedCustomerInfo.indications) setIndications(savedCustomerInfo.indications);
    }
  }, [isCheckoutModalOpen, savedCustomerInfo]);

  // Auto-save typed details to savedCustomerInfo when user types, so leaving modal preserves everything
  const handleNameChange = (val: string) => {
    setCustomerName(val);
    saveCustomerInfo({ customerName: val, phone, address, quartier, indications });
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    saveCustomerInfo({ customerName, phone: val, address, quartier, indications });
  };

  const handleAddressChange = (val: string) => {
    setAddress(val);
    saveCustomerInfo({ customerName, phone, address: val, quartier, indications });
  };

  const handleQuartierChange = (val: string) => {
    setQuartier(val);
    saveCustomerInfo({ customerName, phone, address, quartier: val, indications });
  };

  const handleIndicationsChange = (val: string) => {
    setIndications(val);
    saveCustomerInfo({ customerName, phone, address, quartier, indications: val });
  };

  const isLight = themeMode === 'light-orange';
  const isStoreClosed = storeStatus === 'closed';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStoreClosed) {
      showToast('Le restaurant est actuellement fermé. Impossible de passer commande.', 'error');
      return;
    }
    if (!customerName || !phone) return;

    if (mode === 'livraison' && !address) {
      return;
    }

    setIsSubmitting(true);
    try {
      await placeOrder({
        customerName,
        phone,
        mode,
        pickupTime: mode === 'retrait' ? pickupTime : undefined,
        address: mode === 'livraison' ? address : undefined,
        quartier: mode === 'livraison' ? quartier : undefined,
        indications: mode === 'livraison' ? indications : undefined,
        notes: notes || undefined,
      });

      setIsCheckoutModalOpen(false);
      setActiveTab('tracking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCheckoutModalOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`relative w-full max-w-lg rounded-[32px] p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] overflow-y-auto max-h-[92vh] z-10 border ios-glass-modal ${
              isLight
                ? 'bg-white/85 border-white/70 text-zinc-900 shadow-orange-500/10'
                : 'bg-[#181512]/85 border-white/15 text-white'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
                isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                Étape Finale
              </span>
              <h2 className={`font-heading text-xl md:text-2xl font-black mt-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Mode de Réception & Coordonnées
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Choisissez comment récupérer votre délicieuse commande.
              </p>

              {isStoreClosed && (
                <div className="mt-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
                  <strong>🔴 Restaurant actuellement fermé :</strong>{' '}
                  <span>{storeClosureMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Mode Selector (Retrait vs Livraison) */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setMode('retrait')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      mode === 'retrait'
                        ? 'bg-orange-500/15 border-orange-500 text-orange-600 dark:text-orange-300 ring-2 ring-orange-500/30 font-bold'
                        : isLight
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-orange-200'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Store className="w-6 h-6 mb-1 text-orange-500" />
                    <span className="text-xs font-bold">🏪 Retrait sur place</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Chez Chez Bineta</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setMode('livraison')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      mode === 'livraison'
                        ? 'bg-orange-500/15 border-orange-500 text-orange-600 dark:text-orange-300 ring-2 ring-orange-500/30 font-bold'
                        : isLight
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-orange-200'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Truck className="w-6 h-6 mb-1 text-orange-500" />
                    <span className="text-xs font-bold">🚚 Livraison à domicile</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Partout à Saint-Louis</span>
                  </motion.button>
                </div>

                {/* Customer Common Info */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      Nom & Prénom *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Ex: Moussa Diop"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-orange-500'
                            : 'bg-zinc-900 border-zinc-700 text-white focus:border-orange-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      Numéro de Téléphone (avec WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="+221 77 412 88 90"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-orange-500'
                            : 'bg-zinc-900 border-zinc-700 text-white focus:border-orange-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Mode Specific Inputs */}
                {mode === 'retrait' ? (
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isLight ? 'bg-orange-50/50 border-orange-200 text-zinc-800' : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-orange-500 font-bold">
                      <Store className="w-4 h-4" />
                      <span>Détails du Retrait chez Chez Bineta</span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      📍 Adresse : Saint-Louis, Ngallel, côté DSCOS
                    </p>
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                        Heure souhaitée de retrait
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                        <input
                          type="text"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          placeholder="Ex: 19h30 ou Dès que possible"
                          className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                            isLight
                              ? 'bg-white border-zinc-300 text-zinc-900 focus:border-orange-500'
                              : 'bg-zinc-950 border-zinc-700 text-white focus:border-orange-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isLight ? 'bg-orange-50/50 border-orange-200 text-zinc-800' : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-orange-500 font-bold">
                      <Truck className="w-4 h-4" />
                      <span>Adresse de Livraison</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                          Quartier *
                        </label>
                        <input
                          type="text"
                          required
                          value={quartier}
                          onChange={(e) => handleQuartierChange(e.target.value)}
                          placeholder="Ex : Ngallel, Bango, Santhiaba..."
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                            isLight
                              ? 'bg-white border-zinc-300 text-zinc-900 focus:border-orange-500'
                              : 'bg-zinc-950 border-zinc-700 text-white focus:border-orange-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                          Rue / Maison *
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => handleAddressChange(e.target.value)}
                          placeholder="Ex : Rue 14, villa 240"
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                            isLight
                              ? 'bg-white border-zinc-300 text-zinc-900 focus:border-orange-500'
                              : 'bg-zinc-950 border-zinc-700 text-white focus:border-orange-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                        Repères & Indications pour trouver facilement
                      </label>
                      <div className="relative">
                        <Navigation className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                        <input
                          type="text"
                          value={indications}
                          onChange={(e) => handleIndicationsChange(e.target.value)}
                          placeholder="« À côté de la pharmacie, deuxième maison après la boutique »"
                          className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                            isLight
                              ? 'bg-white border-zinc-300 text-zinc-900 focus:border-orange-500'
                              : 'bg-zinc-950 border-zinc-700 text-white focus:border-orange-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                    Remarque ou préférence (optionnel)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Sauce piment bien à part, bien chaud..."
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-orange-500'
                        : 'bg-zinc-900 border-zinc-700 text-white focus:border-orange-500'
                    }`}
                  />
                </div>

                {/* Cash payment clear box */}
                <div
                  className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                    isLight ? 'bg-orange-50 border-orange-200 text-orange-950' : 'bg-orange-950/40 border-orange-500/30 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-orange-600 dark:text-orange-400">
                    <Banknote className="w-4 h-4" />
                    <span>Paiement en espèces uniquement</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {mode === 'livraison'
                      ? '💵 Vous paierez en espèces au livreur à la réception de votre commande. Vous ne payez rien en ligne.'
                      : '💵 Vous paierez en espèces au comptoir de Chez Bineta lors du retrait de votre commande.'}
                  </p>
                </div>

                {/* Order Total recap */}
                <div
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-sm ${
                    isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <span className={`font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Total à payer en espèces :
                  </span>
                  <span className={`font-heading text-lg font-black tabular-nums ${isLight ? 'text-orange-600' : 'text-orange-400'}`}>
                    {formatFCFA(cartTotal)}
                  </span>
                </div>

                {/* Submit */}
                <motion.button
                  whileTap={!isStoreClosed ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={isStoreClosed}
                  className={`w-full py-4 rounded-xl font-black text-sm uppercase shadow-xl flex items-center justify-center gap-2 transition-all ${
                    isStoreClosed
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20 cursor-pointer'
                  }`}
                >
                  <span>
                    {isStoreClosed ? 'RESTAURANT FERMÉ (COMMANDES SUSPENDUES)' : 'CONFIRMER MA COMMANDE'}
                  </span>
                  {!isStoreClosed && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
