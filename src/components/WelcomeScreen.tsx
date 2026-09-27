import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Heart, Sparkles, ChefHat } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { setHasSeenWelcome, setActiveTab, storeStatus, switchToSellerRole } = useApp();

  const handleEnterToProducts = () => {
    setHasSeenWelcome(true);
    setActiveTab('menu');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed inset-0 z-50 h-[100dvh] w-full overflow-hidden flex flex-col justify-between p-4 sm:p-7 select-none bg-[#0e0c0b]"
    >
      {/* iOS 26 Ambient Warm Light Orbs (No food/product photos) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-orange-500/25 via-amber-500/20 to-transparent blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-amber-600/15 blur-3xl" />
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-orange-600/15 blur-3xl" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0e0c0b]/50 to-[#0e0c0b]/90" />
      </div>

      {/* Top Header: Hospitality Location & Discrete Seller Access */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full ios-glass bg-white/10 border border-white/15 text-white/90 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span>Saint-Louis • Ngallel</span>
        </div>

        <button
          onClick={switchToSellerRole}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ios-glass bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 transition-all cursor-pointer active:scale-95"
          title="Accès gérante (Caisse & Cuisine)"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
          <span>Espace Gérante</span>
        </button>
      </div>

      {/* Centerpiece: The Logo & The Seller (Bineta) in an iOS 26 Frosted Glass Capsule */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto text-center px-1">
        <motion.div
          initial={{ y: 25, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          className="p-6 sm:p-8 rounded-[36px] ios-glass-modal bg-white/12 dark:bg-black/45 border border-white/25 shadow-[0_25px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/15 space-y-5"
        >
          {/* Logo & Seller Presentation Badge */}
          <div className="flex items-center justify-center -space-x-3 mb-1">
            {/* Logo Emblem */}
            <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden shadow-2xl border-2 border-white/50 ring-4 ring-orange-500/25 bg-black/50 group">
              <img
                src="/images/chez_bineta_modern_logo.jpg"
                alt="Logo Chez Bineta"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent pointer-events-none" />
            </div>

            {/* Seller / Vendeuse (Bineta) Portrait */}
            <div className="relative z-20 w-20 h-20 rounded-full overflow-hidden shadow-2xl border-2 border-amber-300/80 ring-4 ring-amber-500/30 bg-zinc-900 group">
              <img
                src="/images/bineta_chef_welcome.jpg"
                alt="Bineta - Gérante & Chef"
                className="w-full h-full object-cover object-top scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent h-6 pointer-events-none" />
            </div>
          </div>

          {/* Seller Hospitality Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ios-glass bg-amber-500/20 border border-amber-400/30 text-amber-200">
            <ChefHat className="w-3.5 h-3.5 text-amber-400" />
            <span>Bineta vous accueille avec le sourire</span>
          </div>

          {/* Title & Hospitality Message (Pure seller hospitality, zero products) */}
          <div className="space-y-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              Bienvenue Chez <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">Bineta</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-white/85 leading-relaxed max-w-xs mx-auto">
              « Dalal ak jàmm ! Je prépare pour vous mes délices faits maison à Saint-Louis. Commandez en 2 clics avec retrait ou livraison. »
            </p>
          </div>

          {/* Store Live Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold ios-glass bg-white/10 border border-white/15 text-white/90">
            <span
              className={`w-2 h-2 rounded-full ${
                storeStatus === 'open'
                  ? 'bg-emerald-400 animate-pulse'
                  : storeStatus === 'closed'
                  ? 'bg-red-400'
                  : 'bg-amber-400'
              }`}
            />
            <span>
              {storeStatus === 'open' && 'Ouvert en ce moment • Prise de commandes active'}
              {storeStatus === 'closed' && 'Actuellement en pause'}
              {storeStatus === 'reservation_only' && 'Sur réservation uniquement'}
            </span>
          </div>

          {/* iOS 26 Liquid Frosted Action Button -> Leads straight to Products display */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleEnterToProducts}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black text-sm sm:text-base tracking-wide shadow-[0_12px_35px_rgba(249,115,22,0.45)] border border-white/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <span>VOIR LES PRODUITS & COMMANDER</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Footer Note (No scroll needed) */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center text-[11px] text-white/60 tracking-wider flex items-center justify-center gap-1.5">
        <Heart className="w-3 h-3 text-red-400 fill-red-400" />
        <span>Fait maison avec amour à Saint-Louis</span>
      </div>
    </motion.div>
  );
};
