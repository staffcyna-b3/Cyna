import { CartItem } from '../types/interfaces/cart/CartItem';

const STORAGE_KEY = 'cyna_saas_durations';
const GUEST_ID_KEY = 'cyna_guest_id';

export const GUEST_CART_KEY = 'cyna_guest_cart';

export const PERIOD_TO_MONTHS: Record<string, number> = {
  '3m': 3,
  '6m': 6,
  '1y': 12,
};

export const computeCartTotal = (items: CartItem[]): number =>
  Number(items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));

export const loadGuestCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const saveGuestCart = (items: CartItem[]): void => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // localStorage plein ou désactivé — on continue sans planter
  }
};

export const getOrCreateGuestId = (): string => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
};

export const getAllSaaSDurations = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const saveSaaSDuration = (productId: string, duration: string) => {
  if (typeof window === 'undefined') return;
  const durations = getAllSaaSDurations();
  durations[productId] = duration;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(durations));
};

export const removeSaaSDuration = (productId: string) => {
  if (typeof window === 'undefined') return;
  const durations = getAllSaaSDurations();
  if (durations[productId]) {
    delete durations[productId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(durations));
  }
};
