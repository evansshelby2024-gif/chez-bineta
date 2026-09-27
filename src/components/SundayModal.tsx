import React, { useState } from 'react';
import { X, Calendar, MessageSquare, Check, Phone, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { buildWhatsAppSundayReservationLink } from '../utils/formatters';

export const SundayModal: React.FC = () => {
  const { isSundayModalOpen, setIsSundayModalOpen, createSundayReservation, themeMode } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('Prochain Dimanche');
  const [time, setTime] = useState('13h00');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [dishesDesired, setDishesDesired] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedReservation, setSubmittedReservation] = useState<any | null>(null);

  const isLight = themeMode === 'light-orange';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !dishesDesired) return;

    const res = createSundayReservation({
      customerName,
      phone,
      date,
      time,
      guestCount,
      dishesDesired,
      notes,
    });

    setSubmittedReservation(res);
  };

  const handleClose = () => {
    setIsSundayModalOpen(false);
    setSubmittedReservation(null);
  };

  return (
    <AnimatePresence>
      {isSundayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Card animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`relative w-full max-w-lg rounded-[32px] p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] overflow-y-auto max-h-[90vh] z-10 border ios-glass-modal ${
              isLight
                ? 'bg-white/85 border-white/70 text-zinc-900 shadow-orange-500/10'
                : 'bg-[#181512]/85 border-white/15 text-white'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
                isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {!submittedReservation ? (
              <div>
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Dimanche — Sur Réservation
                  </span>
                </div>

                <h3 className={`font-heading text-xl md:text-2xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  Réserver votre commande pour dimanche
                </h3>
                <p className={`mt-1 text-xs md:text-sm ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Anticipez vos envies ! Bineta prépare les commandes du dimanche exclusivement sur réservation préalable.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      Votre Nom complet *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex: Aminata Diallo"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-orange-500'
                            : 'bg-zinc-900 border-zinc-700 text-white focus:border-orange-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      Numéro de Téléphone (WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+221 77 123 45 67"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-orange-500'
                            : 'bg-zinc-900 border-zinc-700 text-white focus:border-orange-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                        Date souhaitée
                      </label>
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="Dimanche à venir"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-orange-500'
                            : 'bg-zinc-900 border-zinc-700 text-white focus:border-orange-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                        Heure souhaitée
                      </label>
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        placeholder="Ex: 13h30 ou 19h00"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-orange-500'
                            : 'bg-zinc-900 border-zinc-700 text-white focus:border-orange-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      Plats et quantités souhaités *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={dishesDesired}
                      onChange={(e) => setDishesDesired(e.target.value)}
                      placeholder="Ex : 10 Mini Tacos, 5 Mini Pizzas, 20 Fatayas et 1 Poutine crevettes"
                      className={`w-full p-3 rounded-xl border text-sm focus:outline-none transition-colors ${
                        isLight
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-orange-500'
                          : 'bg-zinc-900 border-zinc-700 text-white focus:border-orange-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      Précisions / Note (optionnel)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex : Retrait à 13h pile, sans piment..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        isLight
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-orange-500'
                          : 'bg-zinc-900 border-zinc-700 text-white focus:border-orange-500'
                      }`}
                    />
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>ENREGISTRER LA RÉSERVATION</span>
                  </motion.button>
                </form>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/40">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <h3 className={`font-heading text-xl font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  Demande de réservation enregistrée !
                </h3>
                <p className={`text-xs sm:text-sm ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                  Votre réservation pour <strong>{submittedReservation.date}</strong> à <strong>{submittedReservation.time}</strong> a bien été enregistrée dans le système Chez Bineta.
                </p>

                <div
                  className={`p-4 rounded-xl border text-left text-xs space-y-1.5 ${
                    isLight ? 'bg-orange-50/50 border-orange-200 text-zinc-800' : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <p>👤 <strong>Client :</strong> {submittedReservation.customerName}</p>
                  <p>📞 <strong>Téléphone :</strong> {submittedReservation.phone}</p>
                  <p>🍽️ <strong>Plats :</strong> {submittedReservation.dishesDesired}</p>
                </div>

                <p className="text-xs text-orange-600 dark:text-orange-300 font-semibold">
                  Envoyez immédiatement un message WhatsApp à Bineta pour finaliser et confirmer votre créneau :
                </p>

                <a
                  href={buildWhatsAppSundayReservationLink(submittedReservation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Transmettre sur WhatsApp à Bineta</span>
                </a>

                <button
                  onClick={handleClose}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  Fermer
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
