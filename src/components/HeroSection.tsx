import React from 'react';
import { ArrowRight, Phone, MapPin, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BINETA_PHONE_DISPLAY, BINETA_PHONE_CLEAN, BINETA_ADDRESS } from '../utils/formatters';

export const HeroSection: React.FC = () => {
  const { setActiveTab, setIsSundayModalOpen, themeMode, storeStatus, storeClosureMessage } = useApp();

  const isLight = themeMode === 'light-orange';

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-3xl p-6 md:p-10 border transition-all duration-300 ${
        isLight
          ? 'bg-gradient-to-br from-orange-500/10 via-amber-50 to-white border-orange-200/80 shadow-xl shadow-orange-500/5'
          : 'bg-gradient-to-b from-[#241e18] via-[#1a1714] to-[#121110] border-orange-950/40 shadow-2xl shadow-black/40'
      }`}
    >
      {/* Background warm ambiance glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 text-center md:text-left">
          {/* Service Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs mb-5 backdrop-blur-sm shadow-sm ${
              isLight
                ? storeStatus === 'closed'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-white/80 border-orange-200 text-zinc-800'
                : storeStatus === 'closed'
                ? 'bg-red-950/60 border-red-800/60 text-red-200'
                : 'bg-zinc-900/80 border-zinc-700/60 text-zinc-200'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                storeStatus === 'open'
                  ? 'bg-emerald-500 animate-pulse'
                  : storeStatus === 'closed'
                  ? 'bg-red-500 animate-ping'
                  : 'bg-amber-500 animate-ping'
              }`}
            />
            <span className="font-bold">
              {storeStatus === 'open' && '🟢 Ouvert aujourd’hui'}
              {storeStatus === 'closed' && '🔴 Fermé actuellement'}
              {storeStatus === 'reservation_only' && '🟠 SUR RÉSERVATION'}
            </span>
            <span className="text-zinc-400">·</span>
            <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {storeStatus === 'closed' ? storeClosureMessage : 'Lundi → Samedi : horaires normaux'}
            </span>
          </div>

          <h1
            className={`font-heading text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight ${
              isLight ? 'text-zinc-900' : 'text-white'
            }`}
          >
            CHEZ{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              BINETA
            </span>
          </h1>

          <p
            className={`mt-2 text-lg sm:text-xl font-bold flex items-center justify-center md:justify-start gap-1.5 ${
              isLight ? 'text-orange-700' : 'text-orange-200/90'
            }`}
          >
            <span>Vos envies, nos délices</span>
            <span className="text-2xl" role="img" aria-label="delicious">
              😋
            </span>
          </p>

          {/* Specialities list */}
          <div
            className={`mt-4 py-2.5 px-4 rounded-2xl border backdrop-blur-sm inline-block ${
              isLight ? 'bg-white/70 border-orange-100 shadow-sm' : 'bg-black/30 border-white/5'
            }`}
          >
            <p
              className={`text-xs sm:text-sm font-semibold tracking-wide flex flex-wrap items-center justify-center md:justify-start gap-x-2.5 gap-y-1 ${
                isLight ? 'text-zinc-700' : 'text-zinc-300'
              }`}
            >
              <span>🌮 Mini Tacos</span>
              <span className="text-orange-400">•</span>
              <span>🍕 Mini Pizza</span>
              <span className="text-orange-400">•</span>
              <span>🥟 Fataya</span>
              <span className="text-orange-400">•</span>
              <span>🍤 Nems</span>
              <span className="text-orange-400">•</span>
              <span>🍲 Poutine</span>
            </p>
          </div>

          {/* Quick restaurant facts */}
          <div className="mt-5 space-y-1.5 text-xs text-zinc-500">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
              <span className={isLight ? 'text-zinc-700 font-medium' : 'text-zinc-300 font-medium'}>
                📍 {BINETA_ADDRESS}
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Phone className="w-4 h-4 text-orange-500 shrink-0" />
              <span className={isLight ? 'text-zinc-700 font-medium' : 'text-zinc-300 font-medium'}>
                📞 {BINETA_PHONE_DISPLAY}
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTab('menu')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <span>COMMANDER MAINTENANT</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSundayModalOpen(true)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-orange-50 text-orange-700 border-orange-200 shadow-sm'
                  : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-orange-300 border-orange-500/20'
              }`}
            >
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Réserver pour Dimanche</span>
            </motion.button>
          </div>
        </div>

        {/* Modern Brand Logo Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative shrink-0 w-44 h-44 sm:w-56 sm:h-56"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 opacity-20 blur-xl animate-pulse" />
          <div
            className={`relative w-full h-full rounded-3xl p-2.5 shadow-2xl transition-transform hover:scale-105 duration-300 border ${
              isLight
                ? 'bg-white border-orange-200/90 shadow-orange-500/10'
                : 'bg-[#1c1916] border-orange-500/40 shadow-black'
            }`}
          >
            <img
              src="/images/chez_bineta_modern_logo.jpg"
              alt="Chez Bineta Moderne"
              className="w-full h-full object-cover rounded-2xl shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
