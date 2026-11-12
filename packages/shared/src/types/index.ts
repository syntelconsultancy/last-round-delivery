export type UserRole = 'customer' | 'driver' | 'merchant' | 'super_admin';

export type ProductCategory = 'Whiskey' | 'Beer' | 'Wine' | 'Mixers' | 'Ice';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED';

export interface Store {
  id: string;
  name: string;
  isInternalStore: boolean;
  commissionRate: number;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

export interface MasterProduct {
  id: string;
  name: string;
  category: ProductCategory;
  volumeMl: number;
  abvPercentage: number;
  isAlcoholic: boolean;
  imageUrl?: string;
}

export interface StoreInventory {
  id: string;
  storeId: string;
  productId: string;
  priceZmw: number;
  stockQuantity: number;
  reservedQuantity: number;
  isChilled: boolean;
}

export interface CartItem {
  inventoryId: string;
  productId: string;
  storeId: string;
  name: string;
  priceZmw: number;
  quantity: number;
  isChilled: boolean;
  volumeMl: number;
}
