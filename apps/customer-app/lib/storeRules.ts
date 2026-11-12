export interface CartItem {
  inventoryId: string;
  productId: string;
  storeId: string;
  storeName: string;
  name: string;
  priceZmw: number;
  quantity: number;
  isChilled: boolean;
  isAlcoholic: boolean;
}

/**
 * Checks if current Lusaka time (CAT / UTC+2) is within legal liquor trading hours (10:00 - 22:00).
 */
export function checkZambianLiquorHours(now: Date = new Date()): {
  isOpen: boolean;
  bannerMessage: string;
} {
  // Convert to Lusaka CAT (UTC+2)
  const utcHours = now.getUTCHours();
  const lusakaHour = (utcHours + 2) % 24;

  const OPEN_HOUR = 10; // 10:00 AM
  const CLOSE_HOUR = 22; // 10:00 PM

  if (lusakaHour >= OPEN_HOUR && lusakaHour < CLOSE_HOUR) {
    return {
      isOpen: true,
      bannerMessage: 'Express Delivery Open — Under 35 mins in Lusaka',
    };
  }

  return {
    isOpen: false,
    bannerMessage: 'Alcohol sales closed under Zambian trading hours. Opens at 10:00 AM CAT.',
  };
}

/**
 * Enforces Single-Store Cart rule (Phase 2).
 */
export function validateSingleStoreCart(
  currentCart: CartItem[],
  newItemStoreId: string
): { conflict: boolean; existingStoreName?: string } {
  if (currentCart.length === 0) {
    return { conflict: false };
  }
  const existingStoreId = currentCart[0].storeId;
  if (existingStoreId !== newItemStoreId) {
    return {
      conflict: true,
      existingStoreName: currentCart[0].storeName,
    };
  }
  return { conflict: false };
}
