import React from 'react';
import { Flame, ArrowRight, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatSimpleFCFA } from '../utils/formatters';

export const PopularSection: React.FC = () => {
  const { products, addToCart, setActiveTab, themeMode } = useApp();

  const isLight = themeMode === 'light-orange';
  const popularProducts = products.filter((p) => p.isPopular);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-orange-500/10 text-orange-500">
            <Flame className="w-5 h-5 fill-orange-500" />
          </div>
          <div>
            <h2
              className={`font-heading text-lg sm:text-xl font-black uppercase tracking-wide ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}
            >
              🔥 LES PLUS COMMANDÉS
            </h2>
            <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Les favoris incontournables de nos clients
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('menu')}
          className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
        >
          <span>Voir tout le menu</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {popularProducts.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
            whileHover={{ y: -3 }}
            className={`flex flex-col justify-between p-3.5 rounded-2xl border transition-all shadow-sm group backdrop-blur-xl ${
              isLight
                ? 'bg-white/75 border-white/80 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10'
                : 'bg-[#181512]/75 border-white/10 hover:border-orange-500/40 hover:shadow-lg'
            }`}
          >
            <div className="aspect-square w-full rounded-xl overflow-hidden mb-2.5 bg-zinc-900 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-black text-orange-400 tabular-nums">
                {formatSimpleFCFA(product.price)}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{product.icon}</span>
                <h3
                  className={`font-heading text-xs sm:text-sm font-bold truncate ${
                    isLight ? 'text-zinc-900' : 'text-white'
                  }`}
                >
                  {product.shortName}
                </h3>
              </div>
              <p className={`text-[11px] font-semibold mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {formatFCFA(product.price)}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (product.options && product.options.length > 0) {
                  addToCart(product, 1, product.options[0].name);
                } else {
                  addToCart(product, 1);
                }
              }}
              disabled={!product.available}
              className="mt-3 w-full py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white text-xs font-bold transition-all border border-orange-500/20 flex items-center justify-center gap-1 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Commander</span>
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
