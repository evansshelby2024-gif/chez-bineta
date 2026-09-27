import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquarePlus, CheckCircle, ThumbsUp, Sparkles, Filter, Utensils } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CustomerReviews: React.FC = () => {
  const { reviews, setIsReviewModalOpen, themeMode } = useApp();
  const isLight = themeMode === 'light-orange';

  const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | 'recent'>('all');

  // Stats calculation
  const { avgRating, totalReviews, ratingCounts } = useMemo(() => {
    if (reviews.length === 0) {
      return { avgRating: 5.0, totalReviews: 0, ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      sum += r.rating;
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating as keyof typeof counts] = (counts[r.rating as keyof typeof counts] || 0) + 1;
      }
    });
    return {
      avgRating: (sum / reviews.length).toFixed(1),
      totalReviews: reviews.length,
      ratingCounts: counts,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (selectedFilter === '5') return reviews.filter((r) => r.rating === 5);
    if (selectedFilter === '4') return reviews.filter((r) => r.rating === 4);
    if (selectedFilter === 'recent') {
      return [...reviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return reviews;
  }, [reviews, selectedFilter]);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Récemment';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card with Rating Summary */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-sm transition-colors ${
          isLight
            ? 'bg-white border-orange-100 shadow-orange-500/5'
            : 'bg-[#1a1714] border-zinc-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Big Score Block */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
              <span className="font-heading text-3xl font-black leading-none">{avgRating}</span>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-2.5 h-2.5 fill-white text-white" />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-heading text-2xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  Avis de nos Clients
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  98% de satisfaction
                </span>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Basé sur {totalReviews} avis authentiques de dégustateurs à Saint-Louis
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsReviewModalOpen(true)}
            className="self-start md:self-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 cursor-pointer transition-all"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>DONNER MON AVIS</span>
          </motion.button>
        </div>

        {/* Rating Bars Distribution */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800/80">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="font-bold flex items-center gap-1 w-8 text-zinc-500 dark:text-zinc-400">
                  {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-semibold text-zinc-400 text-[10px] w-7 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-orange-500 text-white'
                : isLight
                ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Tous les avis ({reviews.length})
          </button>
          <button
            onClick={() => setSelectedFilter('5')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              selectedFilter === '5'
                ? 'bg-orange-500 text-white'
                : isLight
                ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <span>5 étoiles ⭐</span>
          </button>
          <button
            onClick={() => setSelectedFilter('4')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              selectedFilter === '4'
                ? 'bg-orange-500 text-white'
                : isLight
                ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <span>4 étoiles</span>
          </button>
        </div>

        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Écrire un avis</span>
        </button>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-colors ${
                isLight
                  ? 'bg-white border-orange-100/80 shadow-sm shadow-orange-500/5'
                  : 'bg-[#1a1714] border-zinc-800/80'
              }`}
            >
              <div className="space-y-2.5">
                {/* Reviewer Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className={`font-heading text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                          {review.authorName}
                        </h4>
                        {review.verifiedBuyer && (
                          <span
                            title="Client vérifié Chez Bineta"
                            className="text-emerald-500 flex items-center"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300 dark:text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Dish Tag */}
                {review.dishOrdered && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-semibold border border-orange-500/20">
                    <Utensils className="w-3 h-3" />
                    <span>Plat : {review.dishOrdered}</span>
                  </div>
                )}

                {/* Comment Text */}
                <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  "{review.comment}"
                </p>
              </div>

              {/* Bottom Helpful Footnote */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="text-emerald-500 font-medium">Recommandé à 100%</span>
                <span className="flex items-center gap-1 text-[10px]">
                  <ThumbsUp className="w-3 h-3 text-zinc-400" />
                  <span>Avis certifié</span>
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredReviews.length === 0 && (
        <div className="p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 text-zinc-400 text-xs">
          Aucun avis ne correspond à ce filtre pour le moment.
        </div>
      )}
    </div>
  );
};
