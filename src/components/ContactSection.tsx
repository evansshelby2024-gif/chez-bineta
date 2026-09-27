import React, { useState } from 'react';
import { Phone, MapPin, MessageSquare, Clock, ShieldCheck, Navigation, Share2, Check, Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { BINETA_PHONE_DISPLAY, BINETA_PHONE_CLEAN, BINETA_ADDRESS } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export const ContactSection: React.FC = () => {
  const { setActiveTab, themeMode, showToast, switchToSellerRole, reopenWelcome, reviews } = useApp();
  const isLight = themeMode === 'light-orange';
  const [copied, setCopied] = useState(false);

  const handleShareApp = async () => {
    const shareData = {
      title: 'Chez Bineta — Saint-Louis',
      text: 'Découvrez Chez Bineta à Saint-Louis ! Mini Tacos, Mini Pizza, Fataya, Nems & Poutine. Commandez en ligne avec retrait ou livraison 😋 :',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("Merci d'avoir partagé Chez Bineta !", 'success');
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          await fallbackCopy();
        }
      }
    } else {
      await fallbackCopy();
    }
  };

  const fallbackCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        showToast('Lien de l’application copié dans le presse-papier !', 'success');
      } else {
        window.prompt('Copiez ce lien :', window.location.href);
      }
    } catch {
      window.prompt('Copiez ce lien :', window.location.href);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div>
        <span className="text-xs font-black uppercase tracking-wider text-orange-500">
          Nous trouver & Nous joindre
        </span>
        <h2 className={`font-heading text-2xl sm:text-3xl font-black tracking-tight mt-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
          Chez Bineta à Saint-Louis
        </h2>
        <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Votre adresse gourmande de référence pour vos délices faits maison.
        </p>
      </div>

      {/* Main Info Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
          isLight ? 'bg-white border-orange-100 shadow-orange-500/5' : 'bg-[#1c1916] border-orange-950/40'
        }`}
      >
        {/* Restaurant Header */}
        <div className={`flex items-center gap-4 pb-5 border-b ${isLight ? 'border-zinc-100' : 'border-zinc-800'}`}>
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-orange-300 shadow-md shrink-0 bg-orange-50">
            <img
              src="/images/chez_bineta_modern_logo.jpg"
              alt="Chez Bineta Moderne"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className={`font-heading text-xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              CHEZ <span className="text-orange-500">BINETA</span>
            </h3>
            <p className="text-xs text-orange-600 dark:text-orange-300 font-bold">Vos envies, nos délices 😋</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Fast-Food & Traiteur Artisanal Saint-Louis</p>
          </div>
        </div>

        {/* Contact coordinates */}
        <div className="space-y-4">
          <div
            className={`flex items-start gap-3 p-3.5 rounded-2xl border ${
              isLight ? 'bg-orange-50/50 border-orange-100' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <strong className={`block text-xs font-bold mb-0.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Adresse Physique
              </strong>
              <p className={`text-xs ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>📍 {BINETA_ADDRESS}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Saint-Louis, Sénégal</p>
            </div>
          </div>

          <div
            className={`flex items-start gap-3 p-3.5 rounded-2xl border ${
              isLight ? 'bg-orange-50/50 border-orange-100' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <Phone className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className={`block text-xs font-bold mb-0.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Ligne Directe & WhatsApp
              </strong>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-mono font-black">{BINETA_PHONE_DISPLAY}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Disponible pour appels et messages WhatsApp</p>
            </div>
          </div>

          <div
            className={`flex items-start gap-3 p-3.5 rounded-2xl border ${
              isLight ? 'bg-orange-50/50 border-orange-100' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <strong className={`block text-xs font-bold mb-0.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Horaires de Service
              </strong>
              <p className={`text-xs ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                🟢 <strong>Lundi → Samedi :</strong> Horaires normaux (midi et soir)
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-300 font-semibold mt-0.5">
                🟠 <strong>Dimanche :</strong> SUR RÉSERVATION UNIQUEMENT
              </p>
            </div>
          </div>
        </div>

        {/* Big Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <motion.a
            whileTap={{ scale: 0.98 }}
            href={`tel:${BINETA_PHONE_CLEAN}`}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm tracking-wide shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <Phone className="w-5 h-5 stroke-[2.5]" />
            <span>APPELER CHEZ BINETA ({BINETA_PHONE_DISPLAY})</span>
          </motion.a>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <motion.a
              whileTap={{ scale: 0.98 }}
              href={`https://wa.me/${BINETA_PHONE_CLEAN}?text=${encodeURIComponent("Bonjour Bineta, je vous contacte depuis votre application web Chez Bineta !")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>ÉCRIRE SUR WHATSAPP</span>
            </motion.a>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleShareApp}
              className={`py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                isLight
                  ? 'bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20'
                  : 'bg-zinc-800 text-orange-400 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>LIEN COPIÉ !</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 stroke-[2.5]" />
                  <span>PARTAGER L'APPLICATION</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Directions info */}
        <div
          className={`p-4 rounded-2xl border text-xs space-y-1 ${
            isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}
        >
          <div className={`flex items-center gap-1.5 font-bold mb-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            <Navigation className="w-4 h-4 text-orange-500" />
            <span>Comment nous trouver facilement ?</span>
          </div>
          <p className="text-zinc-500 leading-relaxed">
            Nous sommes situés à Ngallel, juste du côté de la DSCOS. Pour les livraisons, nos livreurs desservent Ngallel, Bango, Sor, Santhiaba, Khor et tout Saint-Louis.
          </p>
        </div>

        {/* Customer Reviews card link */}
        <div
          onClick={() => setActiveTab('reviews')}
          className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
            isLight
              ? 'bg-orange-50/60 border-orange-200/80 hover:bg-orange-100/70 text-orange-950'
              : 'bg-zinc-900 border-zinc-800 hover:border-orange-500/50 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-heading font-black text-xs sm:text-sm block">
                Avis & Témoignages Clients ({reviews.length})
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Consultez les retours ou partagez votre expérience ⭐
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-orange-500">Voir →</span>
        </div>

        {/* Welcome screen reopen and Admin entry point */}
        <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${isLight ? 'border-zinc-100' : 'border-zinc-800/80'}`}>
          <button
            onClick={reopenWelcome}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-orange-500 font-semibold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Revoir la page d'ouverture</span>
          </button>

          <button
            onClick={switchToSellerRole}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
              isLight
                ? 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                : 'bg-zinc-800 hover:bg-zinc-700 text-orange-400 border-zinc-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span>Espace Gérante (Caisse & Cuisine) 🔒</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
