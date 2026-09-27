import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Heart, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BINETA_PHONE_DISPLAY, BINETA_PHONE_CLEAN, BINETA_ADDRESS } from '../utils/formatters';

export const Footer: React.FC = () => {
  const { activeTab, setActiveTab, themeMode, showToast, switchToSellerRole, reopenWelcome } = useApp();
  const isLight = themeMode === 'light-orange';
  const [copied, setCopied] = useState(false);

  // App share information
  const shareTitle = 'Chez Bineta — Saint-Louis';
  const shareText =
    'Découvrez Chez Bineta à Saint-Louis ! Mini Tacos, Mini Pizza, Fataya, Nems & Poutine 😋. Commandez vite en ligne avec retrait ou livraison :';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://chezbineta.sn';

  const handleShare = async () => {
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    };

    // Check if Web Share API is supported
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Some browsers support navigator.canShare
        if (navigator.canShare && !navigator.canShare(shareData)) {
          await fallbackCopy();
          return;
        }
        await navigator.share(shareData);
        showToast("Merci d'avoir partagé Chez Bineta !", 'success');
      } catch (err: unknown) {
        // User aborted the share dialog or dismissed it
        if ((err as Error)?.name === 'AbortError') {
          return;
        }
        // Fallback to clipboard if sharing failed
        await fallbackCopy();
      }
    } else {
      // Fallback for browsers without Web Share API
      await fallbackCopy();
    }
  };

  const fallbackCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        showToast('Lien de l’application copié ! Partagez-le avec vos proches 📲', 'success');
      } else {
        window.prompt('Copiez ce lien pour partager Chez Bineta :', shareUrl);
      }
    } catch {
      window.prompt('Copiez ce lien pour partager Chez Bineta :', shareUrl);
    }
  };

  // Direct WhatsApp share url
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`
  )}`;

  return (
    <footer
      className={`border-t py-8 px-4 text-xs transition-colors duration-300 pb-28 md:pb-8 ${
        isLight
          ? 'bg-white border-orange-100 text-zinc-600'
          : 'bg-[#151311] border-[#29241f] text-zinc-400'
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Footer Row: Brand & Share Action */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-orange-500/10">
          {/* Brand info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`font-heading text-lg font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                CHEZ <span className="text-orange-500">BINETA</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-orange-500/15 text-orange-600 border border-orange-500/20">
                Saint-Louis
              </span>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
              Vos envies, nos délices 😋
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-[11px] text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                {BINETA_ADDRESS}
              </span>
              <span>•</span>
              <a
                href={`tel:${BINETA_PHONE_CLEAN}`}
                className="flex items-center gap-1 hover:text-orange-500 transition-colors font-medium"
              >
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                {BINETA_PHONE_DISPLAY}
              </a>
            </div>
          </div>

          {/* Share Block with Web Share API Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Primary Web Share Button */}
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleShare}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                isLight
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600'
                  : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-950/40 hover:brightness-110'
              }`}
              title="Partager le lien de l'application Chez Bineta"
              aria-label="Partager le lien de l'application"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Lien copié !</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Partager l'application</span>
                </>
              )}
            </motion.button>

            {/* Direct WhatsApp Share button */}
            <motion.a
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-semibold text-xs border transition-all cursor-pointer ${
                isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/50'
              }`}
              title="Partager directement sur WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </motion.a>

            {/* Copy Link fallback quick button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={fallbackCopy}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isLight
                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
              }`}
              title="Copier le lien"
              aria-label="Copier le lien"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Secondary Links & Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-orange-500 transition-colors cursor-pointer ${activeTab === 'home' ? 'font-bold text-orange-500' : ''}`}
            >
              Accueil
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`hover:text-orange-500 transition-colors cursor-pointer ${activeTab === 'menu' ? 'font-bold text-orange-500' : ''}`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`hover:text-orange-500 transition-colors cursor-pointer ${activeTab === 'cart' ? 'font-bold text-orange-500' : ''}`}
            >
              Panier
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`hover:text-orange-500 transition-colors cursor-pointer ${activeTab === 'tracking' ? 'font-bold text-orange-500' : ''}`}
            >
              Suivi de commande
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`hover:text-orange-500 transition-colors cursor-pointer ${activeTab === 'reviews' ? 'font-bold text-orange-500' : ''}`}
            >
              Avis Clients ⭐
            </button>
            <button
              onClick={() => setActiveTab('more')}
              className={`hover:text-orange-500 transition-colors cursor-pointer ${activeTab === 'more' ? 'font-bold text-orange-500' : ''}`}
            >
              Contact & Accès
            </button>
            <button
              onClick={reopenWelcome}
              className="text-zinc-500 hover:text-orange-500 transition-colors cursor-pointer"
              title="Revoir la page d'ouverture"
            >
              👋 Page Bienvenue
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={switchToSellerRole}
              className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 hover:underline font-bold cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Espace Gérante (Caisse) 🔒</span>
            </button>
          </div>
        </div>

        {/* Bottom Credits & Service Note */}
        <div className="text-center text-[10px] text-zinc-500/80 pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-orange-500/5">
          <p>© {new Date().getFullYear()} Chez Bineta — Saint-Louis, Sénégal. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Fait avec <Heart className="w-3 h-3 text-red-500 fill-red-500" /> pour les gourmands de Saint-Louis
          </p>
        </div>
      </div>
    </footer>
  );
};
