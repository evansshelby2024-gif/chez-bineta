import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Mail, Lock, User, Phone, X, ArrowRight, Database, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SupabaseAuthModal: React.FC = () => {
  const {
    isSupabaseAuthModalOpen,
    setIsSupabaseAuthModalOpen,
    loginWithSupabaseEmail,
    signUpWithSupabase,
    supabaseStatus,
    themeMode,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<'client' | 'seller'>('client');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLight = themeMode === 'light-orange';

  if (!isSupabaseAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithSupabaseEmail(email, password);
      } else {
        await signUpWithSupabase(email, password, fullName || 'Client', phoneNumber, selectedRole);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSupabaseAuthModalOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-md rounded-[32px] border shadow-2xl p-6 sm:p-7 overflow-hidden z-10 ${
            isLight
              ? 'bg-white/95 border-emerald-500/30 text-zinc-900 shadow-emerald-500/10'
              : 'bg-[#181614]/95 border-emerald-500/30 text-white'
          }`}
        >
          {/* Close button */}
          <button
            onClick={() => setIsSupabaseAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
              <Database className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500">
                  Supabase Auth & RLS
                </span>
                <span className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Sécurisé
                </span>
              </div>
              <h2 className="font-heading text-lg sm:text-xl font-black">
                {mode === 'login' ? 'Connexion Utilisateur' : 'Créer un Compte'}
              </h2>
            </div>
          </div>

          {/* RLS Info Card */}
          <div
            className={`p-3 rounded-2xl mb-4 text-xs flex items-start gap-2.5 border ${
              isLight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Protection Row Level Security (RLS) :</strong> Vos données et commandes sont hermétiquement isolées au niveau du moteur PostgreSQL de Supabase.
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Se Connecter
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Créer un Compte
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Aminata Diallo"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border font-medium ${
                        isLight
                          ? 'bg-white border-zinc-200 text-zinc-900 focus:border-emerald-500'
                          : 'bg-zinc-900 border-zinc-700 text-white focus:border-emerald-500'
                      } focus:outline-none`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Numéro de téléphone (WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+221 77 123 45 67"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border font-medium ${
                        isLight
                          ? 'bg-white border-zinc-200 text-zinc-900 focus:border-emerald-500'
                          : 'bg-zinc-900 border-zinc-700 text-white focus:border-emerald-500'
                      } focus:outline-none`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Rôle du compte
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('client')}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedRole === 'client'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      🛍️ Client
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('seller')}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedRole === 'seller'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      🧑‍🍳 Gérante / Caisse
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border font-medium ${
                    isLight
                      ? 'bg-white border-zinc-200 text-zinc-900 focus:border-emerald-500'
                      : 'bg-zinc-900 border-zinc-700 text-white focus:border-emerald-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border font-medium ${
                    isLight
                      ? 'bg-white border-zinc-200 text-zinc-900 focus:border-emerald-500'
                      : 'bg-zinc-900 border-zinc-700 text-white focus:border-emerald-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <span>{isSubmitting ? 'Traitement en cours...' : mode === 'login' ? 'Se Connecter' : 'Créer Mon Compte'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {!supabaseStatus.isConfigured && (
            <p className="mt-4 text-[10px] text-amber-500 text-center">
              ℹ️ Pour utiliser Supabase Auth en direct, configurez vos clés Supabase dans l'onglet Espace Gérante.
            </p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
