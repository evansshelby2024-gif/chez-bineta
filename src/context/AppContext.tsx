import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem, Order, OrderStatus, SundayReservation, ThemeMode, StoreStatus, UserRole, CustomerReview } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_ORDERS, INITIAL_SUNDAY_RESERVATIONS } from '../data/initialOrders';
import { soundEffects } from '../utils/soundEffects';
import { realtimeHub, RealtimeMessage } from '../utils/realtimeNotifications';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  getDocs,
  getDocFromServer,
  runTransaction,
} from 'firebase/firestore';
import {
  getSupabaseCredentials,
  configureSupabase,
  testSupabaseConnection,
  syncOrderToSupabase,
  syncProductToSupabase,
  fetchSupabaseOrders,
  subscribeToSupabaseOrders,
  verifyAdminPinRPC,
  updateAdminPinRPC,
  signInWithSupabaseEmail,
  signUpWithSupabaseEmail,
  signOutSupabaseAuth,
  fetchUserProfile,
  getSupabaseClient,
  UserProfile,
} from '../supabase';
import type { User } from '@supabase/supabase-js';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // Role & Interface separation (Client vs Seller)
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isRoleModalOpen: boolean;
  setIsRoleModalOpen: (open: boolean) => void;
  switchToSellerRole: () => void;
  switchToClientRole: () => void;

  // Supabase Auth & Profile with RLS
  supabaseUser: User | null;
  supabaseProfile: UserProfile | null;
  isSupabaseAuthModalOpen: boolean;
  setIsSupabaseAuthModalOpen: (open: boolean) => void;
  loginWithSupabaseEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithSupabase: (email: string, pass: string, name: string, phone: string, role?: 'client' | 'seller') => Promise<boolean>;
  logoutSupabase: () => Promise<void>;

  // Welcome Screen
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (seen: boolean) => void;
  reopenWelcome: () => void;

  products: Product[];
  cart: CartItem[];
  orders: Order[];
  sundayReservations: SundayReservation[];

  // Customer Reviews
  reviews: CustomerReview[];
  addReview: (review: Omit<CustomerReview, 'id' | 'createdAt'>) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<void>;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;

  activeTab: 'home' | 'menu' | 'cart' | 'tracking' | 'reviews' | 'more' | 'admin';
  setActiveTab: (tab: 'home' | 'menu' | 'cart' | 'tracking' | 'reviews' | 'more' | 'admin') => void;
  trackedOrderId: string | null;
  setTrackedOrderId: (id: string | null) => void;
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isAdminLoggedIn: boolean;
  adminPin: string;
  lockoutRemainingSeconds: number;
  isSundayModalOpen: boolean;
  setIsSundayModalOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  activeConfirmedOrder: Order | null;
  setActiveConfirmedOrder: (order: Order | null) => void;
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Real-time notifications & sound
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playTestSound: (type?: 'accepted' | 'refused' | 'new_order') => void;
  latestRealtimeEvent: RealtimeMessage | null;
  dismissRealtimeEvent: () => void;
  requestNotificationPermission: () => Promise<boolean>;

  // Cart operations
  addToCart: (product: Product, quantity: number, selectedOption?: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Order operations
  placeOrder: (orderData: {
    customerName: string;
    phone: string;
    mode: 'retrait' | 'livraison';
    pickupTime?: string;
    address?: string;
    quartier?: string;
    indications?: string;
    notes?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, rejectionReason?: string) => void;
  acceptOrder: (orderId: string) => void;
  refuseOrder: (orderId: string, reason?: string) => void;

  // Customer multi-device order lookup
  lookupCustomerOrdersByPhone: (phone: string) => Promise<Order[]>;
  claimOrderByNumber: (orderId: string) => Promise<boolean>;

  // Sunday Reservations
  createSundayReservation: (data: {
    customerName: string;
    phone: string;
    date: string;
    time: string;
    guestCount?: number;
    dishesDesired: string;
    notes?: string;
  }) => SundayReservation;
  updateSundayReservationStatus: (resId: string, status: 'confirmed' | 'cancelled') => void;

  // Product Management (Admin)
  updateProduct: (product: Product) => void;
  toggleProductAvailability: (productId: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;

  // Admin Auth
  loginAdmin: (pin: string) => Promise<boolean>;
  logoutAdmin: () => void;
  setAdminPin: (newPin: string) => void;

  // Store Open / Closed Status
  storeStatus: StoreStatus;
  setStoreStatus: (status: StoreStatus) => void;
  storeClosureMessage: string;
  setStoreClosureMessage: (message: string) => void;

  // Customer device persistence
  customerOrderIds: string[];
  removeCustomerOrder: (orderId: string) => void;
  clearCustomerHistory: () => void;
  savedCustomerInfo: {
    customerName: string;
    phone: string;
    address?: string;
    quartier?: string;
    indications?: string;
  };
  saveCustomerInfo: (info: {
    customerName: string;
    phone: string;
    address?: string;
    quartier?: string;
    indications?: string;
  }) => void;

  // Manager Orders & Revenue Reset
  deleteOrder: (orderId: string) => void;
  clearAdminOrders: (mode: 'all' | 'completed_cancelled') => void;
  revenueResetTimestamp: number;
  resetDailyRevenue: () => void;

  // Supabase Configuration & Status
  supabaseStatus: { isConfigured: boolean; url: string };
  saveSupabaseSettings: (url: string, key: string) => void;
  checkSupabaseLive: () => Promise<{ success: boolean; message: string }>;
}

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    authorName: 'Mame Diarra S.',
    phone: '+221 77 ••• •• 42',
    rating: 5,
    dishOrdered: 'Mini Tacos & Fatayas',
    comment: 'Les mini tacos et fatayas étaient super chauds et bien croustillants ! Livraison très rapide à Ngallel. Bineta est très aimable.',
    createdAt: '2026-09-24T18:30:00.000Z',
    verifiedBuyer: true,
  },
  {
    id: 'rev-2',
    authorName: 'Cheikh Tidiane B.',
    phone: '+221 78 ••• •• 19',
    rating: 5,
    dishOrdered: 'Poutine Poulet Braisé',
    comment: 'La poutine au poulet braisé est incroyable ! Sauce savoureuse et portions généreuses. Un vrai régal à Saint-Louis.',
    createdAt: '2026-09-25T13:15:00.000Z',
    verifiedBuyer: true,
  },
  {
    id: 'rev-3',
    authorName: 'Aïssatou F.',
    phone: '+221 70 ••• •• 88',
    rating: 5,
    dishOrdered: 'Nems & Mini Pizza',
    comment: 'Commande passée en 2 clics et suivie en direct sur le site. Les nems sont croustillants avec la bonne sauce piquante.',
    createdAt: '2026-09-26T20:10:00.000Z',
    verifiedBuyer: true,
  },
  {
    id: 'rev-4',
    authorName: 'Omar D.',
    phone: '+221 76 ••• •• 33',
    rating: 4,
    dishOrdered: 'Mini Pizza Duo',
    comment: 'Pâte fine et très bon fromage. Le suivi de commande en temps réel est vraiment pratique.',
    createdAt: '2026-09-27T11:00:00.000Z',
    verifiedBuyer: true,
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'chez_bineta_products_v2',
  CART: 'chez_bineta_cart_v2',
  ORDERS: 'chez_bineta_orders_v2',
  SUNDAY_RES: 'chez_bineta_sunday_res_v2',
  ADMIN_PIN: 'chez_bineta_admin_pin',
  ADMIN_AUTH: 'chez_bineta_admin_auth',
  LAST_ORDER_ID: 'chez_bineta_last_order_num',
  THEME_MODE: 'chez_bineta_theme_mode',
  STORE_STATUS: 'chez_bineta_store_status_v2',
  STORE_CLOSURE_MSG: 'chez_bineta_store_closure_msg_v2',
  CUSTOMER_ORDER_IDS: 'chez_bineta_my_order_ids_v2',
  SAVED_CUSTOMER_INFO: 'chez_bineta_saved_customer_info_v2',
  TRACKED_ORDER_ID: 'chez_bineta_tracked_order_id_v2',
  REVENUE_RESET_TS: 'chez_bineta_revenue_reset_ts_v2',
  USER_ROLE: 'chez_bineta_user_role_v3',
  REVIEWS: 'chez_bineta_reviews_v1',
  WELCOME_SEEN: 'chez_bineta_welcome_seen_v1',
  PIN_FAILED_ATTEMPTS: 'chez_bineta_pin_failed_attempts_v1',
  PIN_LOCKOUT_UNTIL: 'chez_bineta_pin_lockout_until_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Role: 'client' (Customer view) vs 'seller' (Kitchen/Caisse view)
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role');
        if (roleParam === 'seller' || roleParam === 'client') {
          return roleParam;
        }
      } catch {}
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
      if (saved === 'seller' || saved === 'client') return saved;
    } catch {}
    return 'client';
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.set('role', role);
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
  };

  const switchToSellerRole = () => {
    if (isAdminLoggedIn) {
      setUserRole('seller');
      showToast('Passage en Interface Vendeur / Caisse 🧑‍🍳', 'info');
    } else {
      setIsRoleModalOpen(true);
    }
  };

  const switchToClientRole = () => {
    setUserRole('client');
    setActiveTab('home');
    showToast('Passage en Interface Client 🛍️', 'info');
  };

  // Theme state: defaults to 'light-orange' (Mode blanche orange vibrant) as requested by user!
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
      return (saved === 'warm-dark' || saved === 'light-orange') ? saved : 'light-orange';
    } catch {
      return 'light-orange';
    }
  });

  const toggleThemeMode = () => {
    setThemeModeState((prev) => (prev === 'light-orange' ? 'warm-dark' : 'light-orange'));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode);
    if (themeMode === 'light-orange') {
      document.documentElement.classList.add('theme-light-orange');
      document.documentElement.classList.remove('theme-warm-dark');
    } else {
      document.documentElement.classList.add('theme-warm-dark');
      document.documentElement.classList.remove('theme-light-orange');
    }
  }, [themeMode]);

  // Load persistent states
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [sundayReservations, setSundayReservations] = useState<SundayReservation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUNDAY_RES);
      return saved ? JSON.parse(saved) : INITIAL_SUNDAY_RESERVATIONS;
    } catch {
      return INITIAL_SUNDAY_RESERVATIONS;
    }
  });

  const [adminPin, setAdminPinState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '1234';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  });

  // Lockout remaining seconds for rate-limited PIN security
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  useEffect(() => {
    const checkLockout = () => {
      try {
        const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEYS.PIN_LOCKOUT_UNTIL) || '0', 10);
        if (lockoutUntil > Date.now()) {
          setLockoutRemainingSeconds(Math.ceil((lockoutUntil - Date.now()) / 1000));
        } else {
          setLockoutRemainingSeconds(0);
        }
      } catch {
        setLockoutRemainingSeconds(0);
      }
    };
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'cart' | 'tracking' | 'reviews' | 'more' | 'admin'>('home');

  // Customer Reviews state
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Welcome Splash Screen state - starts at false so every visitor arrives on the welcoming screen
  const [hasSeenWelcome, setHasSeenWelcomeState] = useState<boolean>(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.WELCOME_SEEN);
    } catch {}
    return false;
  });

  const setHasSeenWelcome = (seen: boolean) => {
    setHasSeenWelcomeState(seen);
  };

  const reopenWelcome = () => {
    setHasSeenWelcomeState(false);
  };

  // Customer device order history & saved profile
  const [customerOrderIds, setCustomerOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedCustomerInfo, setSavedCustomerInfo] = useState<{
    customerName: string;
    phone: string;
    address?: string;
    quartier?: string;
    indications?: string;
  }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_CUSTOMER_INFO);
      return saved
        ? JSON.parse(saved)
        : { customerName: '', phone: '', address: '', quartier: 'Ngallel', indications: '' };
    } catch {
      return { customerName: '', phone: '', address: '', quartier: 'Ngallel', indications: '' };
    }
  });

  const saveCustomerInfo = (info: {
    customerName: string;
    phone: string;
    address?: string;
    quartier?: string;
    indications?: string;
  }) => {
    setSavedCustomerInfo(info);
    localStorage.setItem(STORAGE_KEYS.SAVED_CUSTOMER_INFO, JSON.stringify(info));
  };

  const [revenueResetTimestamp, setRevenueResetTimestamp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVENUE_RESET_TS);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const resetDailyRevenue = () => {
    const now = Date.now();
    setRevenueResetTimestamp(now);
    localStorage.setItem(STORAGE_KEYS.REVENUE_RESET_TS, String(now));
    showToast('Caisse réinitialisée à 0 FCFA pour le nouveau service ! 🔄', 'success');
  };

  const [trackedOrderId, setTrackedOrderIdState] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRACKED_ORDER_ID);
      if (saved) return saved;
      const myOrdersRaw = localStorage.getItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS);
      if (myOrdersRaw) {
        const myOrders = JSON.parse(myOrdersRaw);
        if (Array.isArray(myOrders) && myOrders.length > 0) return myOrders[0];
      }
    } catch {}
    return null;
  });

  const setTrackedOrderId = (id: string | null) => {
    setTrackedOrderIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEYS.TRACKED_ORDER_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TRACKED_ORDER_ID);
    }
  };

  // Customer order history actions
  const removeCustomerOrder = (orderId: string) => {
    setCustomerOrderIds((prev) => {
      const updated = prev.filter((id) => id !== orderId);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS, JSON.stringify(updated));
      return updated;
    });

    if (trackedOrderId === orderId) {
      const remaining = customerOrderIds.filter((id) => id !== orderId);
      const nextId = remaining.length > 0 ? remaining[0] : null;
      setTrackedOrderId(nextId);
    }
    showToast(`Commande ${orderId} retirée de votre historique`, 'info');
  };

  const clearCustomerHistory = () => {
    setCustomerOrderIds([]);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS);
    setTrackedOrderId(null);
    showToast('Historique des commandes effacé sur cet appareil 🗑️', 'info');
  };

  // Manager order purge actions
  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setCustomerOrderIds((prev) => {
      const updated = prev.filter((id) => id !== orderId);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS, JSON.stringify(updated));
      return updated;
    });
    if (trackedOrderId === orderId) {
      setTrackedOrderId(null);
    }
    try {
      deleteDoc(doc(db, 'orders', orderId)).catch(() => {});
    } catch {}
    showToast(`Commande ${orderId} supprimée définitivement`, 'info');
  };

  const clearAdminOrders = (mode: 'all' | 'completed_cancelled') => {
    if (mode === 'all') {
      setOrders([]);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      setCustomerOrderIds([]);
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS);
      setTrackedOrderId(null);
      showToast('Toutes les commandes ont été effacées avec succès !', 'success');
    } else {
      setOrders((prev) => prev.filter((o) => o.status !== 'completed' && o.status !== 'cancelled'));
      showToast('Commandes terminées et refusées purgées de l’historique', 'info');
    }
  };

  // Store service status (Ouvert, Fermé, Sur Réservation)
  const [storeStatus, setStoreStatusState] = useState<StoreStatus>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORE_STATUS);
      if (saved === 'open' || saved === 'closed' || saved === 'reservation_only') {
        return saved as StoreStatus;
      }
      return new Date().getDay() === 0 ? 'reservation_only' : 'open';
    } catch {
      return 'open';
    }
  });

  const [storeClosureMessage, setStoreClosureMessageState] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(STORAGE_KEYS.STORE_CLOSURE_MSG) ||
        'Le restaurant Chez Bineta est actuellement fermé. Réouverture très prochainement !'
      );
    } catch {
      return 'Le restaurant Chez Bineta est actuellement fermé.';
    }
  });

  const setStoreStatus = (status: StoreStatus) => {
    setStoreStatusState(status);
    localStorage.setItem(STORAGE_KEYS.STORE_STATUS, status);
    try {
      setDoc(doc(db, 'storeStatus', 'config'), {
        status,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    } catch {}
  };

  const setStoreClosureMessage = (msg: string) => {
    setStoreClosureMessageState(msg);
    localStorage.setItem(STORAGE_KEYS.STORE_CLOSURE_MSG, msg);
    try {
      setDoc(doc(db, 'storeStatus', 'config'), {
        storeClosureMessage: msg,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    } catch {}
  };

  const [isSundayModalOpen, setIsSundayModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [activeConfirmedOrder, setActiveConfirmedOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sound and real-time alerts
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    return soundEffects.isEnabled();
  });

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundEffects.setEnabled(enabled);
    showToast(
      enabled ? 'Notifications sonores activées 🔔' : 'Notifications sonores coupées 🔕',
      'info'
    );
  };

  const playTestSound = (type: 'accepted' | 'refused' | 'new_order' = 'accepted') => {
    if (type === 'accepted') soundEffects.playOrderAccepted();
    else if (type === 'refused') soundEffects.playOrderRefused();
    else soundEffects.playNewOrder();
  };

  const [latestRealtimeEvent, setLatestRealtimeEvent] = useState<RealtimeMessage | null>(null);
  const dismissRealtimeEvent = () => setLatestRealtimeEvent(null);

  const requestNotificationPermission = async (): Promise<boolean> => {
    const granted = await realtimeHub.requestNotificationPermission();
    if (granted) {
      showToast('Notifications de commande en direct activées ! 🔔', 'success');
      realtimeHub.showSystemNotification('Chez Bineta', {
        body: 'Alertes en temps réel connectées avec succès !',
      });
    } else {
      showToast('Notifications du navigateur désactivées ou non autorisées', 'warning');
    }
    return granted;
  };

  // Keep live refs for realtime listener
  const userRoleRef = useRef(userRole);
  useEffect(() => {
    userRoleRef.current = userRole;
  }, [userRole]);

  const customerOrderIdsRef = useRef(customerOrderIds);
  useEffect(() => {
    customerOrderIdsRef.current = customerOrderIds;
  }, [customerOrderIds]);

  const trackedOrderIdRef = useRef(trackedOrderId);
  useEffect(() => {
    trackedOrderIdRef.current = trackedOrderId;
  }, [trackedOrderId]);

  // Cross-tab and real-time subscription with strict role filtering
  useEffect(() => {
    const unsubscribe = realtimeHub.subscribe((msg) => {
      if (msg.type === 'NEW_ORDER') {
        // 1. Data synchronization across tabs
        setOrders((prev) => {
          if (prev.some((o) => o.id === msg.order.id)) return prev;
          return [msg.order, ...prev];
        });

        // 2. Notification isolation:
        // ONLY the seller in 'seller' mode receives kitchen alerts and new order chimes!
        // The customer must NEVER see or hear manager messages!
        if (userRoleRef.current === 'seller') {
          soundEffects.playNewOrder();
          setLatestRealtimeEvent(msg);
          showToast(`🔔 NOUVELLE COMMANDE EN CUISINE : ${msg.order.id} (${msg.order.customerName})`, 'warning');
          realtimeHub.showSystemNotification(`Nouvelle commande Chez Bineta : ${msg.order.id}`, {
            body: `${msg.order.customerName} - Total: ${msg.order.total} FCFA`,
          });
        }
      } else if (msg.type === 'ORDER_ACCEPTED') {
        setOrders((prev) =>
          prev.map((o) => (o.id === msg.orderId ? { ...o, status: 'preparing' } : o))
        );

        // ONLY client in 'client' mode receives order accepted notification for their own order!
        if (userRoleRef.current === 'client') {
          const isMyOrder = customerOrderIdsRef.current.includes(msg.orderId) || trackedOrderIdRef.current === msg.orderId;
          if (isMyOrder) {
            soundEffects.playOrderAccepted();
            setLatestRealtimeEvent(msg);
            showToast(`🟢 Votre commande ${msg.orderId} a été ACCEPTÉE par Bineta !`, 'success');
            realtimeHub.showSystemNotification(`Commande ${msg.orderId} ACCEPTÉE !`, {
              body: 'En cours de préparation en cuisine chez Chez Bineta 👨‍🍳',
            });
          }
        }
      } else if (msg.type === 'ORDER_REFUSED') {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === msg.orderId
              ? { ...o, status: 'cancelled', rejectionReason: msg.reason }
              : o
          )
        );

        // ONLY client in 'client' mode receives order refused notification for their own order!
        if (userRoleRef.current === 'client') {
          const isMyOrder = customerOrderIdsRef.current.includes(msg.orderId) || trackedOrderIdRef.current === msg.orderId;
          if (isMyOrder) {
            soundEffects.playOrderRefused();
            setLatestRealtimeEvent(msg);
            showToast(`❌ Commande ${msg.orderId} non retenue : ${msg.reason || 'Non spécifié'}`, 'error');
            realtimeHub.showSystemNotification(`Information commande ${msg.orderId}`, {
              body: `Commande refusée : ${msg.reason || 'Non spécifié'}`,
            });
          }
        }
      } else if (msg.type === 'ORDER_STATUS_CHANGED') {
        setOrders((prev) =>
          prev.map((o) => (o.id === msg.orderId ? { ...o, status: msg.status } : o))
        );

        // ONLY client in 'client' mode receives status changed notification for their own order!
        if (userRoleRef.current === 'client') {
          const isMyOrder = customerOrderIdsRef.current.includes(msg.orderId) || trackedOrderIdRef.current === msg.orderId;
          if (isMyOrder) {
            soundEffects.playStatusChange();
            setLatestRealtimeEvent(msg);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Supabase Configuration & Authentication State
  const [supabaseStatus, setSupabaseStatus] = useState(() => getSupabaseCredentials());
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [supabaseProfile, setSupabaseProfile] = useState<UserProfile | null>(null);
  const [isSupabaseAuthModalOpen, setIsSupabaseAuthModalOpen] = useState(false);

  // Listen to Supabase Auth State Changes with RLS
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    client.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setSupabaseUser(data.user);
        fetchUserProfile(data.user.id).then((p) => {
          setSupabaseProfile(p);
          if (p?.role === 'admin' || p?.role === 'seller') {
            setIsAdminLoggedIn(true);
            setUserRole('seller');
          }
        });
      }
    });

    const { data: authListener } = client.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null;
      setSupabaseUser(user);
      if (user) {
        const p = await fetchUserProfile(user.id);
        setSupabaseProfile(p);
        if (p?.role === 'admin' || p?.role === 'seller') {
          setIsAdminLoggedIn(true);
          setUserRole('seller');
        }
      } else {
        setSupabaseProfile(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabaseStatus]);

  const loginWithSupabaseEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      const data = await signInWithSupabaseEmail(email, pass);
      if (data?.user) {
        setSupabaseUser(data.user);
        const p = await fetchUserProfile(data.user.id);
        setSupabaseProfile(p);
        if (p?.role === 'admin' || p?.role === 'seller') {
          setIsAdminLoggedIn(true);
          setUserRole('seller');
          showToast(`Bienvenue gérante (${p.fullName || data.user.email}) ! 🧑‍🍳`, 'success');
        } else {
          showToast(`Connexion réussie : ${p?.fullName || data.user.email}`, 'success');
        }
        setIsSupabaseAuthModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Identifiants incorrects', 'error');
      return false;
    }
  };

  const signUpWithSupabase = async (
    email: string,
    pass: string,
    name: string,
    phone: string,
    role: 'client' | 'seller' = 'client'
  ): Promise<boolean> => {
    try {
      const data = await signUpWithSupabaseEmail(email, pass, name, phone, role);
      if (data?.user) {
        showToast('Compte créé avec succès !', 'success');
        setIsSupabaseAuthModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création du compte', 'error');
      return false;
    }
  };

  const logoutSupabase = async () => {
    await signOutSupabaseAuth();
    setSupabaseUser(null);
    setSupabaseProfile(null);
    setIsAdminLoggedIn(false);
    setUserRole('client');
    showToast('Déconnexion de la session Supabase effectuée', 'info');
  };

  const saveSupabaseSettings = (url: string, key: string) => {
    configureSupabase(url, key);
    setSupabaseStatus(getSupabaseCredentials());
    showToast('Paramètres Supabase sauvegardés avec succès !', 'success');
  };

  const checkSupabaseLive = async () => {
    return await testSupabaseConnection();
  };

  // Real-time Central Database sync for Products / Menu
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Product[] = [];
          snapshot.forEach((snap) => {
            loaded.push(snap.data() as Product);
          });
          setProducts(loaded);
        } else {
          // Central database empty on first run: auto-seed with official menu
          INITIAL_PRODUCTS.forEach((prod) => {
            setDoc(doc(db, 'products', prod.id), prod).catch(() => {});
          });
          setProducts(INITIAL_PRODUCTS);
        }
      }, (err) => {
        console.warn('[Firestore] Products listener warning:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('[Firestore] Products setup error:', e);
    }
  }, []);

  // Flag to avoid ringing kitchen sounds on initial orders load
  const isOrdersInitialLoad = useRef(true);

  // Real-time Central Database sync for orders across ALL devices (Customers & Manager Phones)
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
        if (!snapshot.empty) {
          const loadedOrders: Order[] = [];
          snapshot.forEach((docSnap) => {
            loadedOrders.push(docSnap.data() as Order);
          });
          // Sort newest first
          loadedOrders.sort((a, b) => (b.numericId || 0) - (a.numericId || 0));
          setOrders(loadedOrders);

          // Handle LIVE events coming from other devices (skip initial fetch)
          if (!isOrdersInitialLoad.current) {
            snapshot.docChanges().forEach((change) => {
              const order = change.doc.data() as Order;

              if (change.type === 'added') {
                // A customer has just placed an order on their phone!
                // Trigger kitchen sound, vibration and alert if user is in seller mode or admin
                if (userRoleRef.current === 'seller' || isAdminLoggedIn) {
                  soundEffects.playNewOrder();
                  try {
                    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 400]);
                  } catch {}
                  setLatestRealtimeEvent({
                    type: 'NEW_ORDER',
                    order,
                    sender: 'customer',
                    timestamp: Date.now(),
                  });
                  showToast(`🔔 NOUVELLE COMMANDE REÇUE : ${order.id} (${order.customerName} - ${order.total} FCFA)`, 'warning');
                  realtimeHub.showSystemNotification(`🔔 Nouvelle commande Chez Bineta : ${order.id}`, {
                    body: `${order.customerName} • Total : ${order.total} FCFA • Mode : ${order.mode === 'livraison' ? 'Livraison' : 'Retrait'}`,
                  });
                }
              } else if (change.type === 'modified') {
                // Bineta updated the order status -> notify the customer's phone!
                if (userRoleRef.current === 'client') {
                  const isMyOrder = customerOrderIdsRef.current.includes(order.id) || trackedOrderIdRef.current === order.id;
                  if (isMyOrder) {
                    try {
                      if ('vibrate' in navigator) navigator.vibrate([150, 80, 150]);
                    } catch {}

                    if (order.status === 'preparing') {
                      soundEffects.playOrderAccepted();
                      showToast(`🟢 Votre commande ${order.id} a été ACCEPTÉE par Bineta !`, 'success');
                      realtimeHub.showSystemNotification(`Commande ${order.id} ACCEPTÉE !`, {
                        body: 'En cours de préparation en cuisine chez Chez Bineta 👨‍🍳',
                      });
                    } else if (order.status === 'cancelled') {
                      soundEffects.playOrderRefused();
                      showToast(`❌ Commande ${order.id} non retenue : ${order.rejectionReason || 'Non disponible'}`, 'error');
                      realtimeHub.showSystemNotification(`Information commande ${order.id}`, {
                        body: `Commande non retenue : ${order.rejectionReason || 'Non disponible'}`,
                      });
                    } else if (order.status === 'ready') {
                      soundEffects.playStatusChange();
                      showToast(`🔵 Votre commande ${order.id} est PRÊTE !`, 'info');
                    } else if (order.status === 'delivering') {
                      soundEffects.playStatusChange();
                      showToast(`🚚 Votre commande ${order.id} est en cours de livraison !`, 'info');
                    }
                  }
                }
              }
            });
          } else {
            isOrdersInitialLoad.current = false;
          }
        } else {
          isOrdersInitialLoad.current = false;
        }
      }, (err) => {
        console.warn('[Firestore] Orders listener warning:', err);
      });

      // Load existing orders from Supabase on startup/refresh
      const adminToken = sessionStorage.getItem('chez_bineta_admin_token');
      if (adminToken) {
        fetch('/api/admin/orders', {
          headers: { Authorization: `Bearer ${adminToken}` },
        })
          .then((res) => res.ok ? res.json() : { data: [] })
          .then(({ data }) => {
            const loadedOrders: Order[] = (data || []).map((row: any) => ({
              id: row.id,
              numericId: row.numeric_id,
              customerName: row.customer_name,
              phone: row.phone,
              mode: row.mode,
              pickupTime: row.pickup_time,
              address: row.address,
              quartier: row.quartier,
              indications: row.indications,
              total: Number(row.total),
              paymentMethod: row.payment_method,
              status: row.status,
              notes: row.notes,
              items: row.items || [],
              createdAt: row.created_at,
            }));
            if (loadedOrders.length > 0) setOrders(loadedOrders);
          })
          .catch(() => {});
      } else {
        fetchSupabaseOrders().then(({ data, error }) => {
          if (error) return;
          const loadedOrders: Order[] = (data || []).map((row: any) => ({
            id: row.id,
            numericId: row.numeric_id,
            customerName: row.customer_name,
            phone: row.phone,
            mode: row.mode,
            pickupTime: row.pickup_time,
            address: row.address,
            quartier: row.quartier,
            indications: row.indications,
            total: Number(row.total),
            paymentMethod: row.payment_method,
            status: row.status,
            notes: row.notes,
            items: row.items || [],
            createdAt: row.created_at,
          }));
          if (loadedOrders.length > 0) setOrders(loadedOrders);
        });
      }

      // Also listen to Supabase Realtime if connected
      const unsubSupabase = subscribeToSupabaseOrders((payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const row = payload.new;
          const newOrder: Order = {
            id: row.id,
            numericId: row.numeric_id,
            customerName: row.customer_name,
            phone: row.phone,
            mode: row.mode,
            pickupTime: row.pickup_time,
            address: row.address,
            quartier: row.quartier,
            indications: row.indications,
            total: Number(row.total),
            paymentMethod: row.payment_method,
            status: row.status,
            notes: row.notes,
            items: row.items || [],
            createdAt: row.created_at,
          };

          setOrders((prev) => [
            newOrder,
            ...prev.filter((o) => o.id !== newOrder.id)
          ]);

          if (userRoleRef.current === 'seller' || isAdminLoggedIn) {
            soundEffects.playNewOrder();
            showToast(`⚡ Nouvelle commande : ${newOrder.id}`, 'warning');
            setLatestRealtimeEvent({
              type: 'NEW_ORDER',
              order: newOrder,
              sender: 'customer',
              timestamp: Date.now(),
            });
          }
        }

        if (payload.eventType === 'UPDATE' && payload.new) {
          const row = payload.new;
          setOrders((prev) =>
            prev.map((o) =>
              o.id === row.id
                ? { ...o, status: row.status }
                : o
            )
          );
        }
      });

      return () => {
        unsub();
        unsubSupabase();
      };
    } catch (err) {
      console.warn('[Firestore] Orders setup error:', err);
    }
  }, [isAdminLoggedIn]);

  // Real-time Firestore sync for store opening / closing status
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'storeStatus', 'config'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status && (data.status === 'open' || data.status === 'closed' || data.status === 'reservation_only')) {
            setStoreStatusState(data.status);
          }
          if (data.storeClosureMessage) {
            setStoreClosureMessageState(data.storeClosureMessage);
          }
        }
      }, (err) => {
        console.warn('[Firestore] StoreStatus listener warning:', err);
      });
      return () => unsub();
    } catch (err) {
      console.warn('[Firestore] StoreStatus setup error:', err);
    }
  }, []);

  // Real-time Firestore sync for Sunday reservations
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'sundayReservations'), (snapshot) => {
        if (!snapshot.empty) {
          const loadedRes: SundayReservation[] = [];
          snapshot.forEach((docSnap) => {
            loadedRes.push(docSnap.data() as SundayReservation);
          });
          setSundayReservations(loadedRes);
        }
      }, (err) => {
        console.warn('[Firestore] Sunday reservations listener warning:', err);
      });
      return () => unsub();
    } catch (err) {
      console.warn('[Firestore] Sunday reservations setup error:', err);
    }
  }, []);

  // Real-time Firestore sync for Customer Reviews
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'reviews'), (snapshot) => {
        if (!snapshot.empty) {
          const loadedReviews: CustomerReview[] = [];
          snapshot.forEach((docSnap) => {
            loadedReviews.push(docSnap.data() as CustomerReview);
          });
          loadedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setReviews(loadedReviews);
        }
      }, (err) => {
        console.warn('[Firestore] Reviews listener warning:', err);
      });
      return () => unsub();
    } catch (err) {
      console.warn('[Firestore] Reviews setup error:', err);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUNDAY_RES, JSON.stringify(sundayReservations));
  }, [sundayReservations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, adminPin);
  }, [adminPin]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  // Toast notifier
  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const addToCart = (product: Product, quantity: number, selectedOption?: string) => {
    if (!product.available) {
      showToast(`${product.name} est temporairement indisponible`, 'warning');
      return;
    }

    const cartItemId = selectedOption ? `${product.id}-${selectedOption}` : product.id;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            cartItemId,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            selectedOption,
            image: product.image,
            icon: product.icon,
          },
        ];
      }
    });

    const optLabel = selectedOption ? ` (${selectedOption.split('—')[0].trim()})` : '';
    showToast(`Ajouté au panier : ${quantity}× ${product.name}${optLabel}`, 'success');
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast('Article retiré du panier', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Orders with atomic collision-proof ID generation & dual persistence
  const generateUniqueOrderId = async (): Promise<{ id: string; numericId: number }> => {
    // 1. Try server-side atomic sequential counter
    try {
      const res = await fetch('/api/orders/next-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orderId) {
          return { id: data.orderId, numericId: data.numericId };
        }
      }
    } catch {}

    // 2. Try Firestore atomic transaction
    try {
      const counterRef = doc(db, 'counters', 'orderSequence');
      const nextNum = await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(counterRef);
        const current = snap.exists() ? (snap.data().current || 1042) : 1042;
        const inc = current + 1;
        transaction.set(counterRef, { current: inc }, { merge: true });
        return inc;
      });
      return { id: `#CB-${nextNum}`, numericId: nextNum };
    } catch {}

    // 3. Collision-proof entropy fallback (timestamp + 2 random digits)
    const suffix = `${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    const num = parseInt(suffix, 10);
    return { id: `#CB-${suffix}`, numericId: num };
  };

  const placeOrder = async (orderData: {
    customerName: string;
    phone: string;
    mode: 'retrait' | 'livraison';
    pickupTime?: string;
    address?: string;
    quartier?: string;
    indications?: string;
    notes?: string;
  }): Promise<Order> => {
    const { id: generatedId, numericId } = await generateUniqueOrderId();

    const newOrder: Order = {
      id: generatedId,
      numericId,
      customerName: orderData.customerName,
      phone: orderData.phone,
      mode: orderData.mode,
      pickupTime: orderData.pickupTime,
      address: orderData.address,
      quartier: orderData.quartier,
      indications: orderData.indications,
      items: [...cart],
      total: cartTotal,
      paymentMethod:
        orderData.mode === 'livraison' ? 'especes_livraison' : 'especes_retrait',
      status: 'received',
      createdAt: new Date().toISOString(),
      notes: orderData.notes,
    };

    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    setTrackedOrderId(newOrder.id);

    // Save to customer order IDs
    setCustomerOrderIds((prev) => {
      const updated = [newOrder.id, ...prev.filter((id) => id !== newOrder.id)];
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS, JSON.stringify(updated));
      return updated;
    });

    // Save customer info for autofill
    saveCustomerInfo({
      customerName: orderData.customerName,
      phone: orderData.phone,
      address: orderData.address,
      quartier: orderData.quartier,
      indications: orderData.indications,
    });

    clearCart();
    setActiveConfirmedOrder(newOrder);

    // Broadcast in real-time to seller (Bineta) and all open tabs
    realtimeHub.broadcast({
      type: 'NEW_ORDER',
      order: newOrder,
      sender: 'customer',
      timestamp: Date.now(),
    });

    // 1. Authoritative persistence in Firestore
    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (e) {
      console.warn('[Firestore] placeOrder error:', e);
    }

    // 2. Dual persistence in Supabase if configured
    syncOrderToSupabase(newOrder);

    showToast(`Commande ${newOrder.id} enregistrée avec succès !`, 'success');
    return newOrder;
  };

  // Multi-device order retrieval by customer phone
  const lookupCustomerOrdersByPhone = async (rawPhone: string): Promise<Order[]> => {
    const cleanPhone = rawPhone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 6) {
      showToast('Veuillez entrer un numéro de téléphone valide (ex: 77 123 45 67)', 'warning');
      return [];
    }

    try {
      const q = query(collection(db, 'orders'));
      const snap = await getDocs(q);
      const found: Order[] = [];
      snap.forEach((d) => {
        const data = d.data() as Order;
        const orderPhoneClean = (data.phone || '').replace(/\s+/g, '').replace(/[^0-9+]/g, '');
        if (orderPhoneClean && (orderPhoneClean.includes(cleanPhone) || cleanPhone.includes(orderPhoneClean))) {
          found.push(data);
        }
      });

      if (found.length > 0) {
        setCustomerOrderIds((prev) => {
          const set = new Set([...prev, ...found.map((o) => o.id)]);
          const arr = Array.from(set);
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS, JSON.stringify(arr));
          return arr;
        });
        showToast(`📱 ${found.length} commande(s) synchronisée(s) sur cet appareil !`, 'success');
      } else {
        showToast('Aucune commande trouvée pour ce numéro pour le moment', 'info');
      }
      return found;
    } catch (e) {
      console.warn('lookupCustomerOrdersByPhone error:', e);
      return [];
    }
  };

  // Claim order across devices by ID (#CB-xxxx)
  const claimOrderByNumber = async (orderIdToClaim: string): Promise<boolean> => {
    const trimmed = orderIdToClaim.trim().toUpperCase();
    const formatted = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

    const exists = orders.find((o) => o.id.toUpperCase() === formatted);
    if (exists) {
      setCustomerOrderIds((prev) => {
        const updated = [exists.id, ...prev.filter((id) => id !== exists.id)];
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS, JSON.stringify(updated));
        return updated;
      });
      setTrackedOrderId(exists.id);
      showToast(`Commande ${exists.id} synchronisée sur cet appareil !`, 'success');
      return true;
    }

    try {
      const snap = await getDocFromServer(doc(db, 'orders', formatted));
      if (snap.exists()) {
        const order = snap.data() as Order;
        setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
        setCustomerOrderIds((prev) => {
          const updated = [order.id, ...prev.filter((id) => id !== order.id)];
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDER_IDS, JSON.stringify(updated));
          return updated;
        });
        setTrackedOrderId(order.id);
        showToast(`Commande ${order.id} retrouvée avec succès !`, 'success');
        return true;
      }
    } catch {}

    showToast(`Commande ${formatted} introuvable. Vérifiez la référence`, 'error');
    return false;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, rejectionReason?: string) => {
    let targetOrder: Order | undefined;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated: Order = {
            ...order,
            status: newStatus,
            rejectionReason: rejectionReason !== undefined ? rejectionReason : order.rejectionReason,
          };
          targetOrder = updated;
          return updated;
        }
        return order;
      })
    );

    // Persist in Firestore
    try {
      updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        ...(rejectionReason !== undefined ? { rejectionReason } : {}),
      }).catch((err) => {
        console.warn('[Firestore] updateDoc error:', err);
      });
    } catch (e) {
      console.warn('[Firestore] updateOrderStatus error:', e);
    }

    const effectiveOrder = targetOrder || orders.find((o) => o.id === orderId);

    if (newStatus === 'preparing') {
      showToast(`🟢 Commande ${orderId} acceptée ! En préparation en cuisine 👨‍🍳`, 'success');
      if (effectiveOrder) {
        realtimeHub.broadcast({
          type: 'ORDER_ACCEPTED',
          orderId,
          order: effectiveOrder,
          sender: 'seller',
          timestamp: Date.now(),
        });
      }
    } else if (newStatus === 'cancelled') {
      showToast(`❌ Commande ${orderId} refusée. Motif : ${rejectionReason || 'Non spécifié'}`, 'error');
      if (effectiveOrder) {
        realtimeHub.broadcast({
          type: 'ORDER_REFUSED',
          orderId,
          reason: rejectionReason || 'Non spécifié',
          order: effectiveOrder,
          sender: 'seller',
          timestamp: Date.now(),
        });
      }
    } else if (newStatus === 'ready') {
      showToast(`🔵 Commande ${orderId} prête !`, 'info');
      if (effectiveOrder) {
        realtimeHub.broadcast({
          type: 'ORDER_STATUS_CHANGED',
          orderId,
          status: newStatus,
          order: effectiveOrder,
          sender: 'seller',
          timestamp: Date.now(),
        });
      }
    } else if (newStatus === 'delivering') {
      showToast(`🟣 Commande ${orderId} en cours de livraison 🚚`, 'info');
      if (effectiveOrder) {
        realtimeHub.broadcast({
          type: 'ORDER_STATUS_CHANGED',
          orderId,
          status: newStatus,
          order: effectiveOrder,
          sender: 'seller',
          timestamp: Date.now(),
        });
      }
    } else if (newStatus === 'completed') {
      showToast(`✅ Commande ${orderId} terminée / retirée !`, 'success');
      if (effectiveOrder) {
        realtimeHub.broadcast({
          type: 'ORDER_STATUS_CHANGED',
          orderId,
          status: newStatus,
          order: effectiveOrder,
          sender: 'seller',
          timestamp: Date.now(),
        });
      }
    } else {
      showToast(`Commande ${orderId} : statut mis à jour`, 'info');
    }
  };

  const acceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
  };

  const refuseOrder = (orderId: string, reason?: string) => {
    updateOrderStatus(orderId, 'cancelled', reason || 'Non disponible pour le moment');
  };

  // Sunday Reservations
  const createSundayReservation = (data: {
    customerName: string;
    phone: string;
    date: string;
    time: string;
    guestCount?: number;
    dishesDesired: string;
    notes?: string;
  }): SundayReservation => {
    const newRes: SundayReservation = {
      id: `res-${Date.now()}`,
      customerName: data.customerName,
      phone: data.phone,
      date: data.date,
      time: data.time,
      guestCount: data.guestCount,
      dishesDesired: data.dishesDesired,
      notes: data.notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setSundayReservations((prev) => [newRes, ...prev]);
    try {
      setDoc(doc(db, 'sundayReservations', newRes.id), newRes).catch(() => {});
    } catch {}
    showToast('Votre réservation pour dimanche a été enregistrée !', 'success');
    return newRes;
  };

  const updateSundayReservationStatus = (resId: string, status: 'confirmed' | 'cancelled') => {
    setSundayReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status } : r))
    );
    try {
      updateDoc(doc(db, 'sundayReservations', resId), { status }).catch(() => {});
    } catch {}
    showToast(`Réservation ${status === 'confirmed' ? 'confirmée' : 'annulée'}`, 'info');
  };

  // Product management with real-time central database & Supabase persistence
  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    try {
      setDoc(doc(db, 'products', product.id), product, { merge: true }).catch(() => {});
    } catch {}
    syncProductToSupabase(product);
    showToast(`Produit ${product.name} mis à jour dans le menu officiel`, 'success');
  };

  const toggleProductAvailability = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const updated = !p.available;

    setProducts((prev) =>
      prev.map((prod) => (prod.id === productId ? { ...prod, available: updated } : prod))
    );

    try {
      updateDoc(doc(db, 'products', productId), { available: updated }).catch(() => {});
    } catch {}

    syncProductToSupabase({ ...p, available: updated });

    showToast(
      `${p.name} est maintenant ${updated ? 'disponible 🟢' : 'indisponible 🔴'}`,
      updated ? 'success' : 'warning'
    );
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = { ...productData, id: newId };
    setProducts((prev) => [...prev, newProduct]);
    try {
      setDoc(doc(db, 'products', newId), newProduct).catch(() => {});
    } catch {}
    syncProductToSupabase(newProduct);
    showToast(`Produit ${newProduct.name} ajouté au menu officiel !`, 'success');
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      deleteDoc(doc(db, 'products', productId)).catch(() => {});
    } catch {}
    showToast('Produit supprimé du menu officiel', 'info');
  };

  // Customer Reviews actions
  const addReview = async (reviewData: Omit<CustomerReview, 'id' | 'createdAt'>): Promise<boolean> => {
    const sanitizedAuthor = reviewData.authorName.replace(/<[^>]*>?/gm, '').trim().slice(0, 60);
    const sanitizedComment = reviewData.comment.replace(/<[^>]*>?/gm, '').trim().slice(0, 1000);

    if (!sanitizedAuthor || !sanitizedComment) {
      showToast('Veuillez renseigner votre nom et votre avis', 'warning');
      return false;
    }

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      authorName: sanitizedAuthor,
      phone: reviewData.phone ? reviewData.phone.slice(0, 20) : undefined,
      rating: Math.min(5, Math.max(1, reviewData.rating)),
      dishOrdered: reviewData.dishOrdered ? reviewData.dishOrdered.slice(0, 80) : undefined,
      comment: sanitizedComment,
      createdAt: new Date().toISOString(),
      verifiedBuyer: reviewData.verifiedBuyer ?? true,
    };

    setReviews((prev) => [newRev, ...prev]);
    showToast('Merci beaucoup pour votre avis ! ⭐', 'success');

    try {
      setDoc(doc(db, 'reviews', newRev.id), newRev).catch(() => {});
    } catch {}

    return true;
  };

  const deleteReview = async (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    try {
      deleteDoc(doc(db, 'reviews', reviewId)).catch(() => {});
    } catch {}
    showToast('Avis supprimé', 'info');
  };

  // Server & Supabase RPC-Verified Admin Login (Never checked in local browser storage)
  const loginAdmin = async (pin: string): Promise<boolean> => {
    // 1. Check local lockout first
    const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEYS.PIN_LOCKOUT_UNTIL) || '0', 10);
    if (Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      showToast(`🔒 Accès temporairement verrouillé pour sécurité. Réessayez dans ${remaining}s`, 'error');
      return false;
    }

    // 2. Primary Verification via Supabase RPC verify_admin_pin
    // The PIN is evaluated server-side by PostgreSQL function / secure backend
    const res = await verifyAdminPinRPC(pin);

    if (res.success) {
      try {
        const tokenRes = await fetch('/api/admin/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: pin.trim() }),
        });
        const tokenData = await tokenRes.json();
        if (tokenRes.ok && tokenData.token) {
          sessionStorage.setItem('chez_bineta_admin_token', tokenData.token);
        }
      } catch {}
      setIsAdminLoggedIn(true);
      setUserRole('seller');
      setIsRoleModalOpen(false);
      try {
        localStorage.removeItem(STORAGE_KEYS.PIN_FAILED_ATTEMPTS);
        localStorage.removeItem(STORAGE_KEYS.PIN_LOCKOUT_UNTIL);
      } catch {}
      setLockoutRemainingSeconds(0);
      const authMethodLabel =
        res.verifiedVia === 'supabase_rpc'
          ? '⚡ Vérifié par Supabase RPC'
          : '🛡️ Vérifié par Serveur Sécurisé';
      showToast(`Bienvenue dans votre Terminal Vendeur (${authMethodLabel}) 🧑‍🍳`, 'success');
      return true;
    }

    // Handle failed attempts & rate limiting
    const prevAttempts =
      parseInt(localStorage.getItem(STORAGE_KEYS.PIN_FAILED_ATTEMPTS) || '0', 10) + 1;
    localStorage.setItem(STORAGE_KEYS.PIN_FAILED_ATTEMPTS, String(prevAttempts));

    if (prevAttempts >= 3) {
      const lockUntil = Date.now() + 30000;
      localStorage.setItem(STORAGE_KEYS.PIN_LOCKOUT_UNTIL, String(lockUntil));
      setLockoutRemainingSeconds(30);
      showToast('⚠️ 3 tentatives incorrectes ! Accès verrouillé pendant 30 secondes pour sécurité.', 'error');
    } else {
      showToast(res.error || `Code PIN incorrect (${prevAttempts}/3 tentatives). Veuillez réessayer.`, 'error');
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setUserRole('client');
    setActiveTab('home');
    try {
      sessionStorage.removeItem('chez_bineta_admin_token');
    } catch {}
    showToast('Déconnexion de l’espace gérante effectuée • Retour à l’interface client', 'info');
  };

  const setAdminPin = async (newPin: string) => {
    const res = await updateAdminPinRPC(adminPin, newPin);
    if (res.success) {
      setAdminPinState(newPin);
      showToast(res.message || 'Nouveau code PIN enregistré avec succès !', 'success');
    } else {
      showToast(res.error || 'Erreur lors de la mise à jour du code PIN', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        isRoleModalOpen,
        setIsRoleModalOpen,
        switchToSellerRole,
        switchToClientRole,
        supabaseUser,
        supabaseProfile,
        isSupabaseAuthModalOpen,
        setIsSupabaseAuthModalOpen,
        loginWithSupabaseEmail,
        signUpWithSupabase,
        logoutSupabase,
        hasSeenWelcome,
        setHasSeenWelcome,
        reopenWelcome,
        reviews,
        addReview,
        deleteReview,
        isReviewModalOpen,
        setIsReviewModalOpen,
        lockoutRemainingSeconds,
        products,
        cart,
        orders,
        sundayReservations,
        activeTab,
        setActiveTab,
        trackedOrderId,
        setTrackedOrderId,
        themeMode,
        toggleThemeMode,
        setThemeMode,
        isAdminLoggedIn,
        adminPin,
        isSundayModalOpen,
        setIsSundayModalOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        activeConfirmedOrder,
        setActiveConfirmedOrder,
        toasts,
        showToast,
        removeToast,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        placeOrder,
        updateOrderStatus,
        acceptOrder,
        refuseOrder,
        lookupCustomerOrdersByPhone,
        claimOrderByNumber,
        createSundayReservation,
        updateSundayReservationStatus,
        updateProduct,
        toggleProductAvailability,
        addProduct,
        deleteProduct,
        loginAdmin,
        logoutAdmin,
        setAdminPin,
        storeStatus,
        setStoreStatus,
        storeClosureMessage,
        setStoreClosureMessage,
        customerOrderIds,
        removeCustomerOrder,
        clearCustomerHistory,
        savedCustomerInfo,
        saveCustomerInfo,
        deleteOrder,
        clearAdminOrders,
        revenueResetTimestamp,
        resetDailyRevenue,
        soundEnabled,
        setSoundEnabled,
        playTestSound,
        latestRealtimeEvent,
        dismissRealtimeEvent,
        requestNotificationPermission,
        supabaseStatus,
        saveSupabaseSettings,
        checkSupabaseLive,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
