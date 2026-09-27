import React, { useState, useMemo } from 'react';
import { Search, Utensils, AlertTriangle, Calendar, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { ProductCategory, Product } from '../types';

interface CategoryInfo {
  id: ProductCategory;
  label: string;
  icon: string;
  tagline: string;
  priceNote: string;
}

const CATEGORIES_INFO: CategoryInfo[] = [
  {
    id: 'tacos',
    label: 'Mini Tacos',
    icon: '🌮',
    tagline: 'Pliés & grillés à la perfection, garniture fondante et sauce secrète Chez Bineta',
    priceNote: '350 FCFA',
  },
  {
    id: 'pizza',
    label: 'Mini Pizza',
    icon: '🍕',
    tagline: 'Pâte artisanale croustillante, sauce tomate maison et mozzarella fondante',
    priceNote: '350 FCFA',
  },
  {
    id: 'fataya',
    label: 'Fataya',
    icon: '🥟',
    tagline: 'Le grand classique sénégalais ! Chaussons dorés et croustillants avec sauce piquante',
    priceNote: '50 FCFA',
  },
  {
    id: 'nems',
    label: 'Nems',
    icon: '🍤',
    tagline: 'Rouleaux impériaux ultra croustillants, farce parfumée et sauce aigre-douce',
    priceNote: '200 FCFA',
  },
  {
    id: 'poutine',
    label: 'Poutine Gourmande',
    icon: '🍲',
    tagline: 'Frites croustillantes, sauce onctueuse et fromage fondu — Choix Crevettes ou Viande',
    priceNote: '3 000 FCFA',
  },
];

export const MenuSection: React.FC = () => {
  const { products, themeMode, storeStatus, storeClosureMessage, setIsSundayModalOpen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isLight = themeMode === 'light-orange';

  // Filtered list based on search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [products, searchQuery]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    CATEGORIES_INFO.forEach((cat) => map.set(cat.id, []));

    filteredProducts.forEach((p) => {
      if (!map.has(p.category)) {
        map.set(p.category, []);
      }
      map.get(p.category)!.push(p);
    });

    return map;
  }, [filteredProducts]);

  // Determine which categories to render
  const categoriesToDisplay = useMemo(() => {
    if (selectedCategory === 'all') {
      return CATEGORIES_INFO.filter((cat) => (productsByCategory.get(cat.id)?.length || 0) > 0);
    }
    return CATEGORIES_INFO.filter(
      (cat) => cat.id === selectedCategory && (productsByCategory.get(cat.id)?.length || 0) > 0
    );
  }, [selectedCategory, productsByCategory]);

  return (
    <div className="space-y-8">
      {/* Top Header & Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-orange-500">
                Menu & Spécialités
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 font-bold border border-orange-500/20">
                Saint-Louis
              </span>
            </div>
            <h2
              className={`font-heading text-2xl sm:text-3xl font-black tracking-tight mt-1 ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}
            >
              Notre Carte Gourmande
            </h2>
            <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Préparé minute avec des ingrédients frais • Retrait sur place ou livraison à domicile
            </p>
          </div>

          {/* Search Input with Clear Button (iOS Liquid Glass) */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher tacos, pizza, poutine..."
              className={`w-full pl-10 pr-9 py-2.5 rounded-full text-xs placeholder-zinc-400 focus:outline-none transition-all border backdrop-blur-xl ${
                isLight
                  ? 'bg-white/80 border-white/60 text-zinc-900 focus:border-orange-500 shadow-sm shadow-orange-500/5'
                  : 'bg-white/5 border-white/10 text-white focus:border-orange-500'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 🔴 Store Closed Notice Banner if Closed */}
        {storeStatus === 'closed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl border flex items-start gap-3 shadow-md ${
              isLight
                ? 'bg-red-50/90 border-red-200 text-red-900'
                : 'bg-red-950/40 border-red-800/60 text-red-200'
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="block font-heading text-sm font-black text-red-600 dark:text-red-400">
                🔴 Le restaurant est actuellement fermé
              </strong>
              <p className="leading-relaxed">
                {storeClosureMessage || 'Les commandes sont temporairement suspendues. Vous pouvez consulter notre carte ci-dessous !'}
              </p>
            </div>
          </motion.div>
        )}

        {/* 🟠 Sunday Reservation Notice Banner if Reservation Mode */}
        {storeStatus === 'reservation_only' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${
              isLight
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
            }`}
          >
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <strong className="block font-heading text-sm font-black text-amber-600 dark:text-amber-400">
                  🟠 Dimanche — Commandes sur réservation
                </strong>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Réservez vos plats à l’avance pour garantir la préparation de votre festin.
                </p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSundayModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow shrink-0 cursor-pointer self-start sm:self-auto"
            >
              Réserver pour dimanche
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Category Pills Navigation (iOS 26 Transparent Frosted Glass Dock) */}
      <div className="sticky top-[68px] z-20 -mx-2 px-2 py-2 transition-all">
        <div
          className={`flex items-center gap-1.5 p-1.5 rounded-full backdrop-blur-3xl border shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-x-auto scrollbar-none transition-colors ${
            isLight
              ? 'bg-white/75 border-white/80 shadow-orange-500/5'
              : 'bg-[#151311]/75 border-white/10 shadow-black/30'
          }`}
        >
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 border border-white/30'
                : isLight
                ? 'text-zinc-700 hover:text-orange-600 hover:bg-black/5'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🍽️</span>
            <span>Tout le Menu</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              selectedCategory === 'all' ? 'bg-black/20 text-white' : 'bg-orange-500/10 text-orange-600'
            }`}>
              {filteredProducts.length}
            </span>
          </motion.button>

          {CATEGORIES_INFO.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = productsByCategory.get(cat.id)?.length || 0;

            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 border border-white/30'
                    : isLight
                    ? 'text-zinc-700 hover:text-orange-600 hover:bg-black/5'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-black/20 text-white' : 'bg-orange-500/10 text-orange-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Product Sections Grouped by Category */}
      {categoriesToDisplay.length > 0 ? (
        <div className="space-y-12">
          {categoriesToDisplay.map((catInfo, catIdx) => {
            const catProducts = productsByCategory.get(catInfo.id) || [];
            if (catProducts.length === 0) return null;

            return (
              <motion.section
                key={catInfo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: catIdx * 0.05 }}
                className="space-y-4"
              >
                {/* Category Section Header Banner */}
                <div
                  className={`p-4 sm:p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isLight
                      ? 'bg-gradient-to-r from-orange-50/80 via-white to-orange-50/40 border-orange-100'
                      : 'bg-gradient-to-r from-[#1f1b17] via-[#1a1714] to-[#161412] border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 border ${
                        isLight ? 'bg-white border-orange-200 shadow-orange-500/5' : 'bg-zinc-900 border-zinc-700'
                      }`}
                    >
                      {catInfo.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-heading text-lg sm:text-xl font-black ${
                            isLight ? 'text-zinc-900' : 'text-white'
                          }`}
                        >
                          {catInfo.label}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 border border-orange-500/20">
                          {catProducts.length} {catProducts.length > 1 ? 'options' : 'produit'}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 line-clamp-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {catInfo.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Highlighted Category Price Badge */}
                  <div className="self-start sm:self-auto flex items-center gap-2">
                    <span className="text-[11px] font-bold text-zinc-400">Prix :</span>
                    <span className="font-heading font-black text-sm sm:text-base px-3 py-1 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 tabular-nums">
                      {catInfo.priceNote}
                    </span>
                  </div>
                </div>

                {/* Grid of Product Cards for this Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catProducts.map((product, pIdx) => (
                    <ProductCard key={product.id} product={product} index={pIdx} />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center py-16 rounded-3xl border p-8 ${
            isLight ? 'bg-white border-orange-100' : 'bg-[#1c1916] border-zinc-800'
          }`}
        >
          <Utensils className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className={`font-heading text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            Aucun délice trouvé pour "{searchQuery}"
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Vérifiez l'orthographe ou réinitialisez la recherche pour afficher toute la carte.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </motion.div>
      )}
    </div>
  );
};
