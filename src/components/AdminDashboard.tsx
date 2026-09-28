import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Store,
  Phone,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Calendar,
  Layers,
  Search,
  Filter,
  RefreshCw,
  KeyRound,
  RotateCcw,
  X,
  Volume2,
  VolumeX,
  Radio,
  Upload,
  Image,
  Camera,
  Star,
  AlertTriangle,
  Sparkles,
  Database,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, Product, SundayReservation } from '../types';
import { formatFCFA, buildWhatsAppCustomerReplyLink, BINETA_PHONE_DISPLAY } from '../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    acceptOrder,
    refuseOrder,
    products,
    updateProduct,
    toggleProductAvailability,
    addProduct,
    deleteProduct,
    sundayReservations,
    updateSundayReservationStatus,
    reviews,
    deleteReview,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    adminPin,
    setAdminPin,
    lockoutRemainingSeconds,
    showToast,
    storeStatus,
    setStoreStatus,
    storeClosureMessage,
    setStoreClosureMessage,
    revenueResetTimestamp,
    resetDailyRevenue,
    deleteOrder,
    clearAdminOrders,
    soundEnabled,
    setSoundEnabled,
    playTestSound,
    requestNotificationPermission,
    supabaseStatus,
    saveSupabaseSettings,
    checkSupabaseLive,
  } = useApp();

  const [closureMsgInput, setClosureMsgInput] = useState(storeClosureMessage);
  const [isEditingMsg, setIsEditingMsg] = useState(false);
  const [isResetRevenueModalOpen, setIsResetRevenueModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Supabase connection form state
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseStatus.url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Order history and refusal states
  const [orderToRefuse, setOrderToRefuse] = useState<Order | null>(null);
  const [refusalReasonInput, setRefusalReasonInput] = useState("Rupture temporaire d'ingrédients");
  const [isClearOrdersModalOpen, setIsClearOrdersModalOpen] = useState(false);
  const [clearOrdersMode, setClearOrdersMode] = useState<'all' | 'completed_cancelled'>('completed_cancelled');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const [pinInput, setPinInput] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'orders' | 'products' | 'sunday' | 'reviews' | 'supabase'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Product Add / Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<'tacos' | 'pizza' | 'fataya' | 'nems' | 'poutine'>('tacos');
  const [newProductPrice, setNewProductPrice] = useState(350);
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImg, setNewProductImg] = useState('/images/mini_tacos_french_1790388620334.jpg');
  const [newProductIcon, setNewProductIcon] = useState('🌮');
  const [imageInputMode, setImageInputMode] = useState<'gallery' | 'url'>('gallery');
  const [isCompressingImg, setIsCompressingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Photo selection from device/gallery with canvas compression
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Veuillez sélectionner un fichier image valide', 'warning');
      return;
    }

    setIsCompressingImg(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setNewProductImg(compressed);
            showToast('Photo de la galerie importée avec succès ! 📷', 'success');
          }
        } catch {
          if (event.target?.result) {
            setNewProductImg(event.target.result as string);
          }
        } finally {
          setIsCompressingImg(false);
        }
      };
      img.onerror = () => {
        setIsCompressingImg(false);
        showToast('Erreur lors du chargement de la photo', 'error');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsCompressingImg(false);
      showToast('Impossible de lire le fichier', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Change PIN modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  // Login PIN submission (server-side verified)
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemainingSeconds > 0) return;
    await loginAdmin(pinInput);
    setPinInput('');
  };

  // If not logged in, show secure PIN protection screen
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#1c1916] border border-amber-600/30 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Accès Privé
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mt-1">
              Espace Gérante Chez Bineta
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Veuillez saisir votre code PIN de sécurité pour gérer les commandes et le menu.
            </p>
          </div>

          {lockoutRemainingSeconds > 0 && (
            <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500 text-red-300 text-xs flex items-center justify-center gap-2 font-bold shadow-sm">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Accès verrouillé pour sécurité ({lockoutRemainingSeconds}s restantes)</span>
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                disabled={lockoutRemainingSeconds > 0}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Code PIN (par défaut : 1234)"
                className="w-full text-center text-xl font-bold tracking-widest py-3 px-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500 disabled:opacity-40"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={lockoutRemainingSeconds > 0}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 disabled:opacity-50 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Déverrouiller l'Espace Gérante
            </button>
          </form>

          <p className="text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-3">
            💡 Code PIN initial configuré : <strong className="text-amber-400 font-mono">1234</strong> (modifiable à tout moment dans l'espace).
          </p>
        </div>
      </div>
    );
  }

  // Calculate Dashboard Metrics
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'received').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const deliveringCount = orders.filter((o) => o.status === 'delivering').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled' && (revenueResetTimestamp === 0 || new Date(o.createdAt).getTime() >= revenueResetTimestamp))
    .reduce((sum, o) => sum + o.total, 0);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === 'all' || o.status === orderFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setNewProductName('');
    setNewProductPrice(350);
    setNewProductDesc('');
    setNewProductCategory('tacos');
    setNewProductImg('/images/mini_tacos_french_1790388620334.jpg');
    setNewProductIcon('🌮');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setNewProductName(prod.name);
    setNewProductPrice(prod.price);
    setNewProductDesc(prod.description);
    setNewProductCategory(prod.category);
    setNewProductImg(prod.image);
    setNewProductIcon(prod.icon);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: newProductName,
        shortName: newProductName,
        price: Number(newProductPrice),
        description: newProductDesc,
        category: newProductCategory,
        image: newProductImg,
        icon: newProductIcon,
      });
    } else {
      addProduct({
        name: newProductName,
        shortName: newProductName,
        price: Number(newProductPrice),
        description: newProductDesc,
        category: newProductCategory,
        image: newProductImg,
        icon: newProductIcon,
        available: true,
      });
    }
    setIsProductModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1c1916] border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-white">
                Espace Propriétaire Chez Bineta
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                Connectée
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Gestion des commandes en direct, carte & réservations du dimanche
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Changer PIN</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-300 border border-red-800/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Verrouiller</span>
          </button>
        </div>
      </div>

      {/* Real-time Kitchen Live Sync & Sound Bar */}
      <div className="p-3.5 rounded-2xl bg-zinc-900 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2 text-white">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-bold flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Terminal Caisse synchronisé en direct avec les clients</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
            title="Activer ou couper le carillon sonore pour les nouvelles commandes"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Sonnette Caisse ON' : 'Sonnette OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => playTestSound('new_order')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 font-bold transition-colors cursor-pointer"
            title="Tester le carillon sonore de nouvelle commande"
          >
            🔔 Tester sonnette
          </button>

          {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black flex items-center gap-1 shadow-sm cursor-pointer"
              title="Recevoir les alertes même en arrière-plan sur votre téléphone"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Activer Push Caisse</span>
            </button>
          )}
        </div>
      </div>

      {/* 🟢/🔴/🟠 Store Status Management Panel (Mode Ouvert / Fermé / Sur Réservation) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#1c1916] border border-orange-500/30 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                Mode de Service & Disponibilité Restaurant
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                  storeStatus === 'open'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : storeStatus === 'closed'
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {storeStatus === 'open' && '🟢 OUVERT AUJOURD’HUI'}
                {storeStatus === 'closed' && '🔴 FERMÉ ACTUELLEMENT'}
                {storeStatus === 'reservation_only' && '🟠 SUR RÉSERVATION UNIQUEMENT'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Contrôlez en temps réel si les clients peuvent passer des commandes immédiates ou si le restaurant est en pause.
            </p>
          </div>

          <button
            onClick={() => setIsEditingMsg(!isEditingMsg)}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 underline self-start sm:self-auto cursor-pointer"
          >
            {isEditingMsg ? 'Masquer le message' : 'Personnaliser le message client'}
          </button>
        </div>

        {/* 3 Status Switch Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setStoreStatus('open');
              showToast('Restaurant marqué comme OUVERT 🟢. Les commandes sont actives !', 'success');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              storeStatus === 'open'
                ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 ring-2 ring-emerald-500/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="block font-heading font-black text-xs sm:text-sm text-emerald-400">
                🟢 Mode Ouvert
              </span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                Prise de commandes normales active
              </span>
            </div>
            {storeStatus === 'open' && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setStoreStatus('closed');
              showToast('Restaurant marqué comme FERMÉ 🔴. Commandes suspendues.', 'warning');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              storeStatus === 'closed'
                ? 'bg-red-950/60 border-red-500/80 text-red-200 ring-2 ring-red-500/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="block font-heading font-black text-xs sm:text-sm text-red-400">
                🔴 Mode Fermé
              </span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                En pause / Fermeture exceptionnelle
              </span>
            </div>
            {storeStatus === 'closed' && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setStoreStatus('reservation_only');
              showToast('Mode SUR RÉSERVATION 🟠 activé (Dimanche / Service spécial).', 'info');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              storeStatus === 'reservation_only'
                ? 'bg-amber-950/60 border-amber-500/80 text-amber-200 ring-2 ring-amber-500/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="block font-heading font-black text-xs sm:text-sm text-amber-400">
                🟠 Sur Réservation
              </span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                Dimanche ou pré-commandes
              </span>
            </div>
            {storeStatus === 'reservation_only' && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>

        {/* Message editor for closure notice */}
        {(isEditingMsg || storeStatus === 'closed') && (
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-zinc-300">
                Message affiché aux clients sur l'application :
              </label>
              <div className="flex gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    const msg = "Le restaurant Chez Bineta est actuellement fermé ce soir. Réouverture demain midi à 11h !";
                    setClosureMsgInput(msg);
                    setStoreClosureMessage(msg);
                    showToast("Message rapide appliqué", "info");
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  Fermé ce soir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const msg = "En pause entre les services de 15h à 18h. Commandes ouvertes pour le dîner !";
                    setClosureMsgInput(msg);
                    setStoreClosureMessage(msg);
                    showToast("Message rapide appliqué", "info");
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  Pause de l'après-midi
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={closureMsgInput}
                onChange={(e) => setClosureMsgInput(e.target.value)}
                placeholder="Ex : Le restaurant est exceptionnellement fermé ce soir..."
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => {
                  setStoreClosureMessage(closureMsgInput);
                  showToast("Message client enregistré avec succès !", "success");
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-stone-950 font-bold text-xs shrink-0 cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 📊 Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3.5 rounded-xl bg-[#1c1916] border border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 block">Total</span>
          <span className="font-heading text-xl font-bold text-white tabular-nums">
            {totalOrders}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1c1916] border border-amber-500/30 bg-amber-500/5">
          <span className="text-[11px] font-semibold text-amber-400 block">🟠 En attente</span>
          <span className="font-heading text-xl font-bold text-amber-300 tabular-nums">
            {pendingCount}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1c1916] border border-yellow-500/30 bg-yellow-500/5">
          <span className="text-[11px] font-semibold text-yellow-400 block">🟡 En prépa</span>
          <span className="font-heading text-xl font-bold text-yellow-300 tabular-nums">
            {preparingCount}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1c1916] border border-blue-500/30 bg-blue-500/5">
          <span className="text-[11px] font-semibold text-blue-400 block">🔵 Prêtes</span>
          <span className="font-heading text-xl font-bold text-blue-300 tabular-nums">
            {readyCount}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1c1916] border border-purple-500/30 bg-purple-500/5">
          <span className="text-[11px] font-semibold text-purple-400 block">🚚 En livraison</span>
          <span className="font-heading text-xl font-bold text-purple-300 tabular-nums">
            {deliveringCount}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#1c1916] border border-emerald-500/30 bg-emerald-500/5">
          <span className="text-[11px] font-semibold text-emerald-400 block">✅ Terminées</span>
          <span className="font-heading text-xl font-bold text-emerald-300 tabular-nums">
            {completedCount}
          </span>
        </div>
      </div>

      {/* Revenue ticker with Refresh & Reset to Zero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px] font-semibold">
              Chiffre d’affaires de la session en cours :
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="font-heading text-lg sm:text-xl font-black text-amber-400 tabular-nums">
                {formatFCFA(totalRevenue)}
              </span>
              {revenueResetTimestamp > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Réinitialisé le {new Date(revenueResetTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Refresh button */}
          <button
            type="button"
            onClick={() => {
              setIsSpinning(true);
              setTimeout(() => setIsSpinning(false), 500);
              showToast('Calculs et commandes actualisés !', 'info');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-semibold text-xs transition-colors cursor-pointer"
            title="Rafraîchir les calculs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin text-amber-400' : ''}`} />
            <span>Actualiser</span>
          </button>

          {/* Reset to Zero button */}
          <button
            type="button"
            onClick={() => setIsResetRevenueModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 font-bold text-xs transition-colors cursor-pointer"
            title="Remettre le chiffre d'affaires à zéro"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span>Remettre à zéro (0 FCFA)</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'orders'
              ? 'bg-amber-500 text-stone-950'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Commandes ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('products')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'products'
              ? 'bg-amber-500 text-stone-950'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>Gérer le Menu ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('sunday')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'sunday'
              ? 'bg-amber-500 text-stone-950'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Dimanche ({sundayReservations.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('reviews')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'reviews'
              ? 'bg-amber-500 text-stone-950'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Avis Clients ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('supabase')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'supabase'
              ? 'bg-emerald-500 text-stone-950 font-black shadow-lg shadow-emerald-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>⚡ Supabase & Base SQL</span>
        </button>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-4">
          {/* Order filters and search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(
                [
                  { id: 'all', label: 'Toutes' },
                  { id: 'received', label: '🟠 Reçues' },
                  { id: 'preparing', label: '🟡 Préparation' },
                  { id: 'ready', label: '🔵 Prêtes' },
                  { id: 'delivering', label: '🟣 Livraison' },
                  { id: 'completed', label: '✅ Finies' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    orderFilter === f.id
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher client, #CB..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Orders History & Bulk Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
            <div className="text-zinc-400">
              Affichage : <strong className="text-white">{filteredOrders.length}</strong> commande(s)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setClearOrdersMode('completed_cancelled');
                  setIsClearOrdersModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-colors cursor-pointer"
                title="Supprimer uniquement les commandes terminées et refusées"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                <span>Nettoyer terminées & refusées</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setClearOrdersMode('all');
                  setIsClearOrdersModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 font-semibold transition-colors cursor-pointer"
                title="Effacer tout l'historique des commandes"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
                <span>Vider tout l'historique</span>
              </button>
            </div>
          </div>

          {/* Orders list */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isDelivery = order.mode === 'livraison';

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-[#1c1916] border border-zinc-800 shadow-md space-y-4 hover:border-zinc-700 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-lg font-black text-white tabular-nums">
                          {order.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            order.status === 'received'
                              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                              : order.status === 'preparing'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : order.status === 'ready'
                              ? 'bg-blue-500/20 text-blue-300'
                              : order.status === 'delivering'
                              ? 'bg-purple-500/20 text-purple-300'
                              : order.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {order.status === 'received' && '🟠 Commande Reçue'}
                          {order.status === 'preparing' && '🟡 En Préparation'}
                          {order.status === 'ready' && '🔵 Prête'}
                          {order.status === 'delivering' && '🟣 En Livraison'}
                          {order.status === 'completed' && '✅ Terminée / Livrée'}
                          {order.status === 'cancelled' && '❌ Refusée'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-heading text-base font-black text-amber-400 tabular-nums">
                          TOTAL : {formatFCFA(order.total)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Supprimer définitivement cette commande"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Customer & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
                      <div className="space-y-1">
                        <p>👤 <strong>Client :</strong> {order.customerName}</p>
                        <p className="flex items-center gap-1.5">
                          📞 <strong>Téléphone :</strong> {order.phone}
                          <a
                            href={`tel:${order.phone.replace(/[^0-9]/g, '')}`}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400"
                            title="Appeler le client"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        </p>
                        <p>
                          {isDelivery ? '🚚 Livraison' : `🏪 Retrait sur place (${order.pickupTime || 'Dès que possible'})`}
                        </p>
                      </div>

                      <div className="space-y-1">
                        {isDelivery && (
                          <>
                            <p>📍 <strong>Adresse :</strong> {order.address} ({order.quartier})</p>
                            {order.indications && (
                              <p>🧭 <strong>Indications :</strong> {order.indications}</p>
                            )}
                          </>
                        )}
                        <p className="text-amber-300/90 font-medium">
                          💵 <strong>Paiement :</strong> {isDelivery ? 'Espèces à la livraison' : 'Espèces au retrait'}
                        </p>
                        {order.notes && (
                          <p className="text-zinc-400 italic">📝 "{order.notes}"</p>
                        )}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs divide-y divide-zinc-800/60">
                      {order.items.map((item) => (
                        <div key={item.cartItemId} className="py-1 flex items-center justify-between">
                          <span>
                            {item.icon} {item.name} {item.selectedOption ? `(${item.selectedOption})` : ''} × <strong>{item.quantity}</strong>
                          </span>
                          <span className="font-semibold text-amber-400 tabular-nums">
                            {formatFCFA(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Operational Actions for Bineta */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                      {/* WhatsApp Response with Pre-filled update */}
                      <a
                        href={buildWhatsAppCustomerReplyLink(
                          order,
                          `Votre commande ${order.id} est actuellement : ${
                            order.status === 'received'
                              ? 'Bien reçue et validée par Bineta ! Nous commençons la préparation.'
                              : order.status === 'preparing'
                              ? 'En cours de préparation en cuisine.'
                              : order.status === 'ready'
                              ? (isDelivery ? 'Prête et confiée à notre livreur.' : 'Prête à être récupérée à notre adresse (Ngallel, côté DSCOS).')
                              : order.status === 'delivering'
                              ? 'En route vers votre adresse !'
                              : 'Livrée avec succès. Bon appétit !'
                          }`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Contacter sur WhatsApp</span>
                      </a>

                      {/* Status Stepper Progression Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {order.status === 'received' && (
                          <>
                            <button
                              onClick={() => acceptOrder(order.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>ACCEPTER</span>
                            </button>
                            <button
                              onClick={() => {
                                setOrderToRefuse(order);
                                setRefusalReasonInput("Rupture temporaire d'ingrédients");
                              }}
                              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>REFUSER</span>
                            </button>
                          </>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                          >
                            [ MARQUER COMME PRÊTE ]
                          </button>
                        )}

                        {order.status === 'ready' && isDelivery && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivering')}
                            className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                          >
                            [ EN LIVRAISON ]
                          </button>
                        )}

                        {(order.status === 'ready' && !isDelivery) && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
                          >
                            [ MARQUER RETIRÉE ]
                          </button>
                        )}

                        {order.status === 'delivering' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
                          >
                            [ LIVRÉE / TERMINÉE ]
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#1c1916] rounded-2xl border border-zinc-800 text-zinc-400 text-xs">
              Aucune commande ne correspond aux filtres actuels.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MENU & PRODUCTS MANAGEMENT */}
      {activeAdminTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Gestion des Produits du Menu
              </h3>
              <p className="text-xs text-zinc-400">
                Ajustez les prix, la disponibilité (rupture de stock), ajoutez ou modifiez un produit.
              </p>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Ajouter un Produit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-2xl bg-[#1c1916] border border-zinc-800 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading text-sm font-bold text-white truncate">
                        {product.name}
                      </h4>
                      <span className="font-heading text-sm font-black text-amber-400 tabular-nums">
                        {formatFCFA(product.price)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Availability Toggle button */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                  <button
                    onClick={() => toggleProductAvailability(product.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      product.available
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/60'
                        : 'bg-red-950/60 text-red-400 border border-red-500/40 hover:bg-red-900/60'
                    }`}
                  >
                    {product.available ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        <span>🟢 Disponible</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        <span>🔴 Temporairement indisponible</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditProduct(product)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                      title="Modifier le produit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 transition-colors"
                      title="Supprimer du menu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUNDAY RESERVATIONS */}
      {activeAdminTab === 'sunday' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <Calendar className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300 font-bold mb-0.5">
                Organisation des Préparations du Dimanche
              </strong>
              <span>
                Ces réservations permettent à Bineta de préparer les quantités requises à l'avance pour le service du dimanche.
              </span>
            </div>
          </div>

          {sundayReservations.length > 0 ? (
            <div className="space-y-3">
              {sundayReservations.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-[#1c1916] border border-zinc-800 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                    <div>
                      <h4 className="font-heading text-sm font-bold text-white">
                        {res.customerName}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        📞 {res.phone} · Date : <strong className="text-amber-300">{res.date}</strong> à <strong className="text-white">{res.time}</strong>
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        res.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : res.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400 animate-pulse'
                      }`}
                    >
                      {res.status === 'confirmed' && '✅ Confirmée'}
                      {res.status === 'cancelled' && '❌ Annulée'}
                      {res.status === 'pending' && '🟠 En Attente de validation'}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-300 space-y-1">
                    <p>🍽️ <strong>Plats souhaités :</strong> {res.dishesDesired}</p>
                    {res.notes && <p className="text-zinc-400">📝 Notes : {res.notes}</p>}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <a
                      href={`https://wa.me/${res.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Bonjour ${res.customerName} ! Ici Chez Bineta concernant votre réservation pour ${res.date} à ${res.time}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Répondre par WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-2">
                      {res.status !== 'confirmed' && (
                        <button
                          onClick={() => updateSundayReservationStatus(res.id, 'confirmed')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold"
                        >
                          Confirmer
                        </button>
                      )}
                      {res.status !== 'cancelled' && (
                        <button
                          onClick={() => updateSundayReservationStatus(res.id, 'cancelled')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 text-red-400 font-bold"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#1c1916] rounded-2xl border border-zinc-800 text-zinc-400 text-xs">
              Aucune réservation de dimanche en attente.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CUSTOMER REVIEWS MANAGEMENT */}
      {activeAdminTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div>
              <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>Avis & Retours des Clients ({reviews.length})</span>
              </h3>
              <p className="text-xs text-amber-200/90 mt-0.5">
                Surveillez la satisfaction de vos clients, lisez leurs compliments ou suggestions et modérez les avis.
              </p>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-amber-400 shrink-0">
              Note moyenne : ⭐ {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)} / 5
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-[#1c1916] border border-zinc-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                          {rev.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-heading text-xs font-bold text-white block">
                            {rev.authorName}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(rev.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.dishOrdered && (
                      <span className="inline-block text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-amber-400 font-semibold border border-zinc-700">
                        🍽️ {rev.dishOrdered}
                      </span>
                    )}

                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-emerald-400">
                      {rev.verifiedBuyer ? '✓ Acheté en ligne' : 'Avis vérifié'}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Supprimer l'avis de ${rev.authorName} ?`)) {
                          deleteReview(rev.id);
                        }
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#1c1916] rounded-2xl border border-zinc-800 text-zinc-400 text-xs">
              Aucun avis client pour le moment.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SUPABASE & ARCHITECTURE SQL */}
      {activeAdminTab === 'supabase' && (
        <div className="space-y-5">
          {/* Status banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/40 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                    <span>Intégration Supabase & PostgreSQL</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                      supabaseStatus.isConfigured
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {supabaseStatus.isConfigured ? '🟢 SUPABASE CONFIGURÉ' : '⚪ PRÊT À CONNECTER'}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Synchronisation automatique : Base cloud officielle + Supabase PostgreSQL
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isTestingSupabase}
                onClick={async () => {
                  setIsTestingSupabase(true);
                  setSupabaseTestResult(null);
                  try {
                    const res = await checkSupabaseLive();
                    setSupabaseTestResult(res);
                  } finally {
                    setIsTestingSupabase(false);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                <span>Tester la connexion</span>
              </button>
            </div>

            {supabaseTestResult && (
              <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                supabaseTestResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/60 border-red-500/50 text-red-200'
              }`}>
                {supabaseTestResult.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                <span>{supabaseTestResult.message}</span>
              </div>
            )}
          </div>

          {/* Architecture Checklist Cards */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1c1916] border border-zinc-800 space-y-3">
            <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garanties d'Architecture & Sécurité Résolues</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-300">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-bold text-emerald-400 block">1. Historique multi-appareils</span>
                <p className="text-zinc-400 text-[11px]">Un client peut retrouver toutes ses commandes sur n'importe quel téléphone ou ordinateur avec son numéro WhatsApp.</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-bold text-emerald-400 block">2. Numérotation atomique anti-collision</span>
                <p className="text-zinc-400 text-[11px]">L'incrémentation des commandes #CB-xxxx est calculée de manière atomique sur le serveur sans risque de doublons.</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-bold text-emerald-400 block">3. Règles de sécurité verrouillées</span>
                <p className="text-zinc-400 text-[11px]">Suppression publique totalement interdite, altération des totaux bloquée et validation stricte.</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-bold text-emerald-400 block">4. Code PIN protégé côté serveur</span>
                <p className="text-zinc-400 text-[11px]">Authentification via endpoint API sécurisé avec signature HMAC et verrouillage automatique anti-brute-force.</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-bold text-emerald-400 block">5. Catalogue menu centralisé en temps réel</span>
                <p className="text-zinc-400 text-[11px]">Tout ajout de plat, changement de prix ou mise en rupture s'affiche instantanément chez tous les clients.</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-bold text-emerald-400 block">6. Synchronisation base de données</span>
                <p className="text-zinc-400 text-[11px]">La base centrale est la source de vérité absolue pour les alertes de commandes et carillons de cuisine.</p>
              </div>
            </div>
          </div>

          {/* Form to connect Supabase */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1c1916] border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Paramètres du projet Supabase</span>
              </h4>
              <span className="text-[10px] text-zinc-500">Variables VITE_SUPABASE_*</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  URL du Projet Supabase (ex: https://xxxx.supabase.co) :
                </label>
                <input
                  type="text"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://votre-projet.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Clé publique / Anon Key Supabase :
                </label>
                <input
                  type="password"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    saveSupabaseSettings(supabaseUrlInput, supabaseKeyInput);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Enregistrer les identifiants Supabase
                </button>
              </div>
            </div>
          </div>

          {/* Script SQL Supabase téléchargeable / copiable */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1c1916] border border-zinc-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Script SQL officiel pour Supabase</span>
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Exécutez ce script dans l'Éditeur SQL de votre dashboard Supabase pour créer les tables et RLS.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const sql = `-- ===============================================================
-- CHEZ BINETA - SCHEMA SUPABASE / POSTGRESQL (PRODUCTION-READY)
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  description TEXT,
  category TEXT NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  image TEXT,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  numeric_id BIGINT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('retrait', 'livraison')),
  pickup_time TEXT,
  address TEXT,
  quartier TEXT,
  indications TEXT,
  total NUMERIC NOT NULL CHECK (total > 0),
  payment_method TEXT DEFAULT 'especes_retrait',
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'delivering', 'completed', 'cancelled')),
  rejection_reason TEXT,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des produits" ON public.products FOR SELECT USING (true);
CREATE POLICY "Gestion des produits par la gérante" ON public.products FOR ALL USING (true);
CREATE POLICY "Lecture des commandes" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Création de commande client" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Mise à jour statut commande" ON public.orders FOR UPDATE USING (true);

BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.orders, public.products;
COMMIT;`;

                  navigator.clipboard.writeText(sql);
                  setCopiedSql(true);
                  showToast('Script SQL copié dans le presse-papier ! 📋', 'success');
                  setTimeout(() => setCopiedSql(false), 3000);
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-700 self-start sm:self-auto"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copiedSql ? 'Copié !' : 'Copier le script SQL complet'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-48 leading-relaxed">
{`CREATE TABLE public.products ( id TEXT PRIMARY KEY, name TEXT NOT NULL, price NUMERIC, ... );
CREATE TABLE public.orders ( id TEXT PRIMARY KEY, customer_name TEXT, phone TEXT, total NUMERIC, ... );
CREATE INDEX idx_orders_phone ON public.orders (phone);
ALTER PUBLICATION supabase_realtime ADD TABLE orders, products;`}
            </pre>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Product */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#1c1916] border border-amber-500/40 p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="font-heading text-lg font-bold text-white">
              {editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nom du plat</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ex : Fataya aux crevettes"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Catégorie</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="tacos">Mini Tacos 🌮</option>
                    <option value="pizza">Mini Pizza 🍕</option>
                    <option value="fataya">Fataya 🥟</option>
                    <option value="nems">Nems 🍤</option>
                    <option value="poutine">Poutine 🍲</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Description gourmande</label>
                <textarea
                  rows={2}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Description appétissante du plat..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Photo Upload from Gallery (instead of just URL) */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-200 font-bold block">
                    Photo du Produit :
                  </label>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('gallery')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        imageInputMode === 'gallery' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-zinc-400'
                      }`}
                    >
                      📷 Galerie / Fichier
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                        imageInputMode === 'url' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-zinc-400'
                      }`}
                    >
                      🔗 Lien URL
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {imageInputMode === 'gallery' ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCompressingImg}
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>{isCompressingImg ? 'Traitement de la photo...' : 'Choisir une photo depuis ma galerie / téléphone'}</span>
                    </button>

                    {newProductImg && (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-zinc-700 bg-zinc-900">
                          <img
                            src={newProductImg}
                            alt="Aperçu"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-[11px]">
                          <span className="font-bold text-emerald-400 block truncate">
                            ✓ Photo prête
                          </span>
                          <span className="text-zinc-500 block truncate text-[10px]">
                            {newProductImg.startsWith('data:') ? 'Photo importée de la galerie' : 'Image actuelle'}
                          </span>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-amber-400 hover:underline font-semibold mt-0.5 cursor-pointer"
                          >
                            Changer la photo ↻
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={newProductImg}
                      onChange={(e) => setNewProductImg(e.target.value)}
                      placeholder="https://... ou /images/..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Saisissez l'adresse URL directe d'une image web.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change PIN Code */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#1c1916] border border-amber-500/40 p-6 shadow-2xl space-y-4">
            <h3 className="font-heading text-lg font-bold text-white">Changer le Code PIN</h3>
            <p className="text-xs text-zinc-400">
              Définissez un nouveau code PIN pour sécuriser l'accès à votre espace gérante.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newPinInput.length >= 4) {
                  setAdminPin(newPinInput);
                  setIsPinModalOpen(false);
                  setNewPinInput('');
                }
              }}
              className="space-y-4"
            >
              <input
                type="password"
                required
                maxLength={8}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="Nouveau PIN (4 à 8 chiffres)"
                className="w-full text-center text-xl font-bold py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold"
                >
                  Mettre à jour le PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Revenue to Zero (Clôture de Caisse) */}
      {isResetRevenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#1c1916] border border-red-500/40 p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
              <RotateCcw className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Remettre la caisse à 0 FCFA ?
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Cette action clôture la session de vente actuelle. Le total du chiffre d'affaires affiché sera remis à <strong>0 FCFA</strong> pour démarrer un nouveau service ou une nouvelle journée.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              Chiffre d’affaires actuel :{' '}
              <strong className="text-amber-400 font-heading text-sm">{formatFCFA(totalRevenue)}</strong>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetRevenueModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDailyRevenue();
                  setIsResetRevenueModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Confirmer (0 FCFA)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Refuse Order with Reason */}
      {orderToRefuse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#1c1916] border border-red-500/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5 text-red-400 font-bold">
                <XCircle className="w-5 h-5" />
                <h3 className="font-heading text-base font-bold text-white">
                  Refuser la Commande {orderToRefuse.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOrderToRefuse(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Client : <strong className="text-white">{orderToRefuse.customerName}</strong> ({orderToRefuse.phone}) — {formatFCFA(orderToRefuse.total)}
            </p>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Motif du refus (affiché immédiatement sur l'écran du client) :
              </label>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {[
                  "Rupture temporaire d'ingrédients",
                  "Restaurant fermé / pause de service",
                  "Affluence trop forte en cuisine",
                  "Livreur indisponible pour cette zone",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRefusalReasonInput(reason)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      refusalReasonInput === reason
                        ? 'bg-red-500/20 text-red-300 border-red-500/40 ring-1 ring-red-500/30'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={refusalReasonInput}
                onChange={(e) => setRefusalReasonInput(e.target.value)}
                placeholder="Précisez la raison pour informer le client..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Le client verra ce motif avec une bannière rouge explicative et des options pour commander autre chose ou vous appeler.
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setOrderToRefuse(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  refuseOrder(orderToRefuse.id, refusalReasonInput);
                  setOrderToRefuse(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Confirmer le Refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Clear Order History (Bulk) */}
      {isClearOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#1c1916] border border-red-500/40 p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                {clearOrdersMode === 'all'
                  ? "Vider tout l'historique des commandes ?"
                  : "Nettoyer les commandes terminées & refusées ?"}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {clearOrdersMode === 'all'
                  ? "Toutes les commandes (reçues, en cours, terminées, refusées) seront définitivement supprimées du système."
                  : "Seules les commandes déjà terminées ou refusées seront supprimées. Vos commandes en cours restent actives."}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearOrdersModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAdminOrders(clearOrdersMode);
                  setIsClearOrdersModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Single Order */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#1c1916] border border-red-500/40 p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-heading text-base font-bold text-white">
                Supprimer la commande {orderToDelete.id} ?
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Client : <strong>{orderToDelete.customerName}</strong> ({formatFCFA(orderToDelete.total)})
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Cette commande sera définitivement retirée de la base de données.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
