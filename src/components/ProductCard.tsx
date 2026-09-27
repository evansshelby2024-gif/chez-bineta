import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, AlertCircle, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart, themeMode, storeStatus, showToast } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string>(
    product.options && product.options.length > 0 ? product.options[0].name : ''
  );
  const [imgError, setImgError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [flyingBadge, setFlyingBadge] = useState<number | null>(null);

  const isLight = themeMode === 'light-orange';
  const isStoreClosed = storeStatus === 'closed';

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((q) => q + 1);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.available) return;

    if (isStoreClosed) {
      showToast('Le restaurant est actuellement fermé. Commandes en pause.', 'warning');
      return;
    }

    addToCart(product, quantity, selectedOption || undefined);

    // Trigger visual feedback animations
    setIsAdded(true);
    setFlyingBadge(quantity);

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);

    setTimeout(() => {
      setFlyingBadge(null);
    }, 900);

    setQuantity(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3), ease: 'easeOut' }}
      whileHover={{ y: -5 }}
      className={`group relative flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden backdrop-blur-xl ${
        isLight
          ? product.available
            ? 'bg-white/85 border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/15'
            : 'bg-zinc-50/70 border-zinc-200/60 opacity-75'
          : product.available
          ? 'bg-[#181512]/85 border-white/10 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-500/10'
          : 'bg-[#141210]/70 border-zinc-800/40 opacity-70'
      }`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[16/11] sm:aspect-[4/3] w-full overflow-hidden bg-zinc-950">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              product.available ? 'group-hover:scale-108' : 'grayscale contrast-75'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-orange-950/60 via-zinc-900 to-zinc-950 text-orange-400 p-4 text-center">
            <span className="text-4xl filter drop-shadow">{product.icon}</span>
            <span className="mt-2 text-xs font-bold text-zinc-300">{product.name}</span>
          </div>
        )}

        {/* Subtle Dark Vignette for Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges Row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Availability Badge */}
          {product.available ? (
            <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-black flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Disponible
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-red-950/85 backdrop-blur-md border border-red-500/40 text-red-200 text-[11px] font-black flex items-center gap-1.5 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              Indisponible
            </span>
          )}

          {/* Popular Tag */}
          {product.isPopular && product.available && (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-orange-500/30">
              <Sparkles className="w-3 h-3 fill-white" />
              Populaire
            </span>
          )}
        </div>

        {/* Floating Price Tag on Image Bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
          <div className="px-3 py-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-orange-500/30 shadow-lg text-white">
            <span className="text-[10px] uppercase font-bold text-orange-400 block tracking-wider leading-none mb-0.5">
              Prix
            </span>
            <span className="font-heading text-lg sm:text-xl font-black text-amber-300 tabular-nums leading-none">
              {formatFCFA(product.price)}
            </span>
          </div>

          <span className="text-2xl filter drop-shadow-md">
            {product.icon}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <div>
          <h3
            className={`font-heading text-lg sm:text-xl font-black transition-colors ${
              isLight ? 'text-zinc-900 group-hover:text-orange-600' : 'text-white group-hover:text-orange-400'
            }`}
          >
            {product.name}
          </h3>
          <p
            className={`mt-1.5 text-xs line-clamp-2 leading-relaxed ${
              isLight ? 'text-zinc-600' : 'text-zinc-400'
            }`}
          >
            {product.description}
          </p>
        </div>

        {/* Option Selection (ex: Poutine Crevettes vs Viande) */}
        {product.options && product.options.length > 0 && (
          <div className={`mt-3.5 pt-3.5 border-t ${isLight ? 'border-orange-100' : 'border-zinc-800'}`}>
            <span className="block text-[11px] font-black uppercase tracking-wider text-orange-500 mb-2">
              Choisir votre garniture :
            </span>
            <div className="grid grid-cols-2 gap-2">
              {product.options.map((opt) => {
                const isSelected = selectedOption === opt.name;
                const isShrimp = opt.name.toLowerCase().includes('crevette');

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOption(opt.name)}
                    disabled={!product.available}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-orange-500/10 border-orange-500 text-orange-950 ring-2 ring-orange-500/30 shadow-sm'
                          : 'bg-orange-500/20 border-orange-500 text-orange-200 ring-2 ring-orange-500/30'
                        : isLight
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-orange-200'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-sm">{isShrimp ? '🍤' : '🥩'}</span>
                    <span className="truncate">{opt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Actions Area */}
        <div className="mt-auto pt-4 space-y-3">
          {/* Quantity Stepper Row */}
          {product.available && (
            <div className="flex items-center justify-between gap-3">
              <span className={`text-xs font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Quantité :
              </span>

              <div
                className={`flex items-center rounded-2xl p-1 border shadow-inner ${
                  isLight ? 'bg-orange-50/80 border-orange-200/90' : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.82 }}
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  aria-label="Diminuer la quantité"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-25 disabled:pointer-events-none ${
                    isLight
                      ? 'text-zinc-700 hover:bg-white hover:text-orange-600 hover:shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                </motion.button>

                <div className="w-9 h-8 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={quantity}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`text-xs font-black tabular-nums ${isLight ? 'text-zinc-900' : 'text-white'}`}
                    >
                      {quantity}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.82 }}
                  onClick={handleIncrement}
                  aria-label="Augmenter la quantité"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isLight
                      ? 'text-zinc-700 hover:bg-white hover:text-orange-600 hover:shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </motion.button>
              </div>
            </div>
          )}

          {/* Add to Cart Button with Smooth Framer Motion State */}
          <div className="relative">
            {/* Flying badge animation */}
            <AnimatePresence>
              {flyingBadge !== null && (
                <motion.div
                  initial={{ y: 0, opacity: 1, scale: 0.8 }}
                  animate={{ y: -38, opacity: 0, scale: 1.25 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute -top-2 right-4 z-20 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-black shadow-lg pointer-events-none"
                >
                  +{flyingBadge}
                </motion.div>
              )}
            </AnimatePresence>

            {product.available ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={handleAdd}
                className={`relative w-full min-h-[46px] py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm tracking-wide uppercase shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer overflow-hidden ${
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 hover:shadow-orange-500/40'
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isAdded ? (
                    <motion.div
                      key="added"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                      className="flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Ajouté au panier !</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="add"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                      <span>AJOUTER AU PANIER</span>
                      <span className="text-orange-100 font-bold tabular-nums">
                        ({formatFCFA(product.price * quantity)})
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ) : (
              <div
                className={`w-full min-h-[46px] py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed ${
                  isLight
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-zinc-400" />
                <span>Temporairement indisponible</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
