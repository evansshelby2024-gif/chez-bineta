export type ProductCategory = 'all' | 'tacos' | 'pizza' | 'fataya' | 'nems' | 'poutine';

export type StoreStatus = 'open' | 'closed' | 'reservation_only';

export interface ProductOption {
  id: string;
  name: string;
  priceModifier?: number;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  category: 'tacos' | 'pizza' | 'fataya' | 'nems' | 'poutine';
  price: number; // in FCFA
  description: string;
  image: string;
  available: boolean;
  isPopular?: boolean;
  icon: string;
  options?: ProductOption[];
}

export interface CartItem {
  cartItemId: string; // unique ID for product + option combination
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOption?: string;
  image: string;
  icon: string;
}

export type OrderMode = 'retrait' | 'livraison';

export type OrderStatus =
  | 'received'      // Commande reçue (🟢)
  | 'preparing'     // En préparation (🟡)
  | 'ready'         // Commande prête / Prête à récupérer (🔵)
  | 'delivering'    // En livraison (🟣)
  | 'completed'     // Livrée / Retirée (✅)
  | 'cancelled';    // Refusée / Annulée (❌)

export interface Order {
  id: string; // e.g. "#CB-1042"
  numericId: number;
  customerName: string;
  phone: string;
  mode: OrderMode;
  pickupTime?: string;
  address?: string;
  quartier?: string;
  indications?: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'especes_retrait' | 'especes_livraison';
  status: OrderStatus;
  createdAt: string;
  notes?: string;
  isSundayReservation?: boolean;
  sundayReservationDate?: string;
  rejectionReason?: string;
}

export type ThemeMode = 'warm-dark' | 'light-orange';

export type UserRole = 'client' | 'seller';

export interface SundayReservation {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  guestCount?: number;
  dishesDesired: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface CustomerReview {
  id: string;
  authorName: string;
  phone?: string;
  rating: number; // 1 to 5
  dishOrdered?: string;
  comment: string;
  createdAt: string;
  verifiedBuyer?: boolean;
}

