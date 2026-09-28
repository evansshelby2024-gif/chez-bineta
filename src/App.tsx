/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HeroSection } from './components/HeroSection';
import { SundayBanner } from './components/SundayBanner';
import { PopularSection } from './components/PopularSection';
import { MenuSection } from './components/MenuSection';
import { CartView } from './components/CartView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { ContactSection } from './components/ContactSection';
import { AdminDashboard } from './components/AdminDashboard';
import { SellerHeader } from './components/SellerHeader';
import { RoleSwitchModal } from './components/RoleSwitchModal';
import { SupabaseAuthModal } from './components/SupabaseAuthModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Footer } from './components/Footer';
import { SundayModal } from './components/SundayModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { NotificationToast } from './components/NotificationToast';
import { RealtimeAlertBanner } from './components/RealtimeAlertBanner';
import { CustomerReviews } from './components/CustomerReviews';
import { ReviewModal } from './components/ReviewModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Phone, MapPin, ArrowRight, Star, Sparkles, MessageSquareHeart } from 'lucide-react';
import { BINETA_PHONE_DISPLAY, BINETA_PHONE_CLEAN, BINETA_ADDRESS } from './utils/formatters';

const AppContent: React.FC = () => {
  const {
    userRole,
    activeTab,
    setActiveTab,
    themeMode,
    orders,
    customerOrderIds,
    setTrackedOrderId,
    hasSeenWelcome,
    reviews,
    setIsReviewModalOpen,
  } = useApp();

  const isLight = themeMode === 'light-orange';

  // Check if this customer has an active order to show real-time live banner
  const activeCustomerOrder = useMemo(() => {
    if (!customerOrderIds || customerOrderIds.length === 0) return null;
    const latestId = customerOrderIds[0];
    const order = orders.find((o) => o.id === latestId);
    if (!order) return null;
    // Show banner if active
    if (order.status !== 'completed') {
      return order;
    }
    return null;
  }, [orders, customerOrderIds]);

  // ==========================================
  // 1. DEDICATED SELLER / KITCHEN INTERFACE
  // ==========================================
  if (userRole === 'seller') {
    return (
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${
          isLight
            ? 'bg-[#F8F6F4] text-zinc-900 selection:bg-amber-500 selection:text-white'
            : 'bg-[#121110] text-[#FDFBF7] selection:bg-amber-500 selection:text-black'
        }`}
      >
        {/* Real-time Order Alert Banner for seller only */}
        <RealtimeAlertBanner />

        {/* Toast Notifications */}
        <NotificationToast />

        {/* Dedicated Seller / Kitchen Header */}
        <SellerHeader />

        {/* Seller Main Dashboard */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-6">
          <AdminDashboard />
        </main>

        {/* Role Switcher Modal */}
        <RoleSwitchModal />
      </div>
    );
  }

  // ==========================================
  // 2. DEDICATED CLIENT RESTAURANT INTERFACE
  // ==========================================
  return (
    <div
      className={`min-h-screen relative flex flex-col transition-colors duration-300 ${
        isLight
          ? 'bg-[#F9F7F5] text-zinc-900 selection:bg-orange-500 selection:text-white'
          : 'bg-[#100F0D] text-[#FDFBF7] selection:bg-orange-500 selection:text-black'
      }`}
    >
      {/* Ambient iOS background glow mesh for glass refraction */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-orange-400/15 to-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-gradient-to-bl from-amber-400/15 to-orange-600/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-orange-500/10 to-transparent blur-3xl" />
      </div>

      {/* Real-time Order Alert Banner for customer only */}
      <RealtimeAlertBanner />

      {/* Toast Notifications */}
      <NotificationToast />

      {/* Main Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 pb-32 md:pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <HeroSection />
              <SundayBanner />
              <PopularSection />

              {/* Teaser Menu Section */}
              <section className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className={`font-heading text-xl font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      Toutes nos Délices du Moment
                    </h2>
                    <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Mini Tacos, Mini Pizza, Fataya, Nems et Poutine
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Consulter le menu complet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <MenuSection />
              </section>

              {/* Customer Reviews Highlight Section */}
              <section className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className={`font-heading text-xl font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        Avis de nos Clients
                      </h2>
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>4.9 / 5</span>
                      </span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Ce que les dégustateurs disent de Chez Bineta
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Donner mon avis</span>
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Tous les avis ({reviews.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reviews.slice(0, 2).map((rev) => (
                    <div
                      key={rev.id}
                      onClick={() => setActiveTab('reviews')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isLight
                          ? 'bg-white border-orange-100 hover:border-orange-300 shadow-xs'
                          : 'bg-[#1c1916] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 text-white font-bold text-[11px] flex items-center justify-center">
                            {rev.authorName.charAt(0).toUpperCase()}
                          </div>
                          <span className={`font-heading text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                            {rev.authorName}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className={`text-xs line-clamp-2 italic ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Contact footer snippet */}
              <div
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isLight
                    ? 'bg-white border-orange-100 shadow-sm'
                    : 'bg-[#1c1916] border-zinc-800'
                }`}
              >
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500 block">
                    Service Client & Commandes
                  </span>
                  <p className={`text-sm font-bold flex items-center justify-center sm:justify-start gap-1.5 ${isLight ? 'text-zinc-800' : 'text-white'}`}>
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>{BINETA_ADDRESS}</span>
                  </p>
                </div>

                <motion.a
                  whileTap={{ scale: 0.95 }}
                  href={`tel:${BINETA_PHONE_CLEAN}`}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Appeler : {BINETA_PHONE_DISPLAY}</span>
                </motion.a>
              </div>
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <MenuSection />
            </motion.div>
          )}

          {activeTab === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <CartView />
            </motion.div>
          )}

          {activeTab === 'tracking' && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <OrderTrackingView />
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <CustomerReviews />
            </motion.div>
          )}

          {activeTab === 'more' && (
            <motion.div
              key="more"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ContactSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Application Footer with Web Share API */}
      <Footer />

      {/* Welcome / Splash Screen for clients upon first opening */}
      <AnimatePresence>
        {!hasSeenWelcome && userRole === 'client' && (
          <WelcomeScreen />
        )}
      </AnimatePresence>

      {/* Floating Active Order Live Pill if customer has a pending/accepted order */}
      <AnimatePresence>
        {activeCustomerOrder && activeTab !== 'tracking' && (
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            onClick={() => {
              setTrackedOrderId(activeCustomerOrder.id);
              setActiveTab('tracking');
            }}
            className={`fixed bottom-20 md:bottom-6 left-4 right-4 max-w-md mx-auto z-35 p-3.5 rounded-full shadow-2xl flex items-center justify-between gap-3 cursor-pointer border ios-glass transition-all ${
              activeCustomerOrder.status === 'cancelled'
                ? 'bg-red-950/85 border-red-500/80 text-white shadow-red-500/25 ring-2 ring-red-500/30'
                : activeCustomerOrder.status === 'preparing'
                ? 'bg-emerald-950/85 border-emerald-400/80 text-white shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                : 'bg-zinc-950/85 border-orange-500/80 text-white shadow-orange-500/25 ring-2 ring-orange-500/30'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  activeCustomerOrder.status === 'cancelled'
                    ? 'bg-red-500 ring-2 ring-red-300'
                    : activeCustomerOrder.status === 'preparing'
                    ? 'bg-emerald-400 animate-pulse ring-2 ring-emerald-200'
                    : 'bg-amber-400 animate-ping'
                }`}
              />
              <div className="truncate">
                <span className="text-xs font-black block truncate">
                  {activeCustomerOrder.id} :{' '}
                  {activeCustomerOrder.status === 'received' && '🟠 Reçue, en attente de confirmation'}
                  {activeCustomerOrder.status === 'preparing' && '🟢 Validée ! En préparation'}
                  {activeCustomerOrder.status === 'ready' && '🔵 Prête pour retrait/départ'}
                  {activeCustomerOrder.status === 'delivering' && '🟣 En cours de livraison'}
                  {activeCustomerOrder.status === 'cancelled' && '❌ Refusée par le restaurant'}
                </span>
                <span className="text-[10px] text-zinc-300 block font-medium">
                  {activeCustomerOrder.status === 'preparing' ? 'La cuisine prépare votre commande • Suivre' : 'Touchez pour voir le statut en direct'}
                </span>
              </div>
            </div>
            <span className={`text-xs font-black px-3 py-1.5 rounded-xl shrink-0 shadow-sm ${
              activeCustomerOrder.status === 'cancelled'
                ? 'bg-red-600 text-white'
                : activeCustomerOrder.status === 'preparing'
                ? 'bg-emerald-500 text-black'
                : 'bg-orange-500 text-white'
            }`}>
              Suivre →
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Modals with animated backdrop & scale transitions */}
      <SundayModal />
      <CheckoutModal />
      <OrderConfirmationModal />
      <ReviewModal />

      {/* Role Switcher Modal */}
      <RoleSwitchModal />

      {/* Supabase Auth Modal with RLS */}
      <SupabaseAuthModal />

      {/* PWA Install Banner Prompt (Installe directement sans passer par Play Store) */}
      <PWAInstallBanner />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
