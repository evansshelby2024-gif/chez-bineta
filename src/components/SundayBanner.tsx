import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export const SundayBanner: React.FC = () => {
  const { setIsSundayModalOpen, themeMode } = useApp();
  const isLight = themeMode === 'light-orange';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={`relative overflow-hidden rounded-3xl p-5 md:p-6 shadow-lg border transition-all ${
        isLight
          ? 'bg-gradient-to-r from-orange-500/15 via-amber-50 to-orange-50 border-orange-200 text-zinc-900'
          : 'bg-gradient-to-r from-amber-950/80 via-[#261c14] to-[#1e1914] border-orange-600/40 text-white'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
              🟠 DIMANCHE — SUR RÉSERVATION
            </span>
          </div>
          <h3 className={`font-heading text-lg sm:text-xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            Vous souhaitez commander chez Chez Bineta dimanche ?
          </h3>
          <p className={`text-xs sm:text-sm max-w-xl ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
            Réservez votre commande à l’avance pour garantir la préparation soignée de vos délices préférés.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setIsSundayModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all shrink-0 whitespace-nowrap cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-white" />
          <span>RÉSERVER POUR DIMANCHE</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};
