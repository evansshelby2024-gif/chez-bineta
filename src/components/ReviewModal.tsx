import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Sparkles, Send, CheckCircle2, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReviewModal: React.FC = () => {
  const { isReviewModalOpen, setIsReviewModalOpen, addReview, themeMode, products } = useApp();

  const isLight = themeMode === 'light-orange';

  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [dishOrdered, setDishOrdered] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isReviewModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    const success = await addReview({
      authorName: authorName.trim(),
      rating,
      dishOrdered: dishOrdered.trim() || undefined,
      comment: comment.trim(),
      verifiedBuyer: true,
    });
    setIsSubmitting(false);

    if (success) {
      setAuthorName('');
      setComment('');
      setDishOrdered('');
      setRating(5);
      setIsReviewModalOpen(false);
    }
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5:
        return 'Exceptionnel ! 🌟 Le régal absolu';
      case 4:
        return 'Très bon ! 😊 Nous avons adoré';
      case 3:
        return 'Correct / Bon 👍';
      case 2:
        return 'Moyen, peut mieux faire 😐';
      case 1:
        return 'Décevant 😞';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full max-w-lg rounded-[32px] border shadow-[0_25px_60px_rgba(0,0,0,0.35)] p-6 sm:p-7 overflow-hidden my-auto ios-glass-modal ${
            isLight
              ? 'bg-white/85 border-white/70 text-zinc-900 shadow-orange-500/10'
              : 'bg-[#181512]/85 border-white/15 text-white'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsReviewModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
              <Star className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-black">Donnez votre avis</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Partagez votre expérience gourmande chez Chez Bineta
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating Selector */}
            <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-zinc-900/80 border border-orange-100 dark:border-zinc-800 text-center space-y-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Note globale :
              </label>

              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeVal = hoverRating ?? rating;
                  const isFilled = star <= activeVal;

                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 filter drop-shadow'
                            : 'text-zinc-300 dark:text-zinc-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-black text-orange-600 dark:text-orange-400 min-h-[1.25rem]">
                {getRatingLabel(hoverRating ?? rating)}
              </div>
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-xs font-bold mb-1">
                Votre prénom ou nom <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={60}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex : Mame Diarra, Cheikh T., Fatou..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    : 'bg-zinc-900 border-zinc-700 text-white'
                }`}
              />
            </div>

            {/* Dish Ordered */}
            <div>
              <label className="block text-xs font-bold mb-1">
                Plat dégusté (Optionnel)
              </label>
              <select
                value={dishOrdered}
                onChange={(e) => setDishOrdered(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    : 'bg-zinc-900 border-zinc-700 text-white'
                }`}
              >
                <option value="">Sélectionnez un plat...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.icon} {p.name}
                  </option>
                ))}
                <option value="Mini Tacos & Pizzas">🌮🍕 Menu Duo Tacos & Pizza</option>
                <option value="Fatayas & Nems">🥟🍤 Fatayas croustillants & Nems</option>
                <option value="Autre délice">✨ Autre spécialité</option>
              </select>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold mb-1">
                Votre commentaire <span className="text-orange-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                maxLength={1000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Parlez-nous du goût, de la rapidité, de l'accueil de Bineta, de la livraison..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    : 'bg-zinc-900 border-zinc-700 text-white'
                }`}
              />
            </div>

            {/* Verified buyer assurance badge */}
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Avis certifié et visible instantanément par toute la communauté.</span>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                  isLight ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !authorName.trim() || !comment.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-orange-500/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Publication...' : 'Publier mon avis'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
