/**
 * Domain contracts shared by the API and the app.
 * Money is always an integer amount in Naira (no kobo) to avoid float drift.
 */

export type Naira = number;

export type CategoryId = 'phones' | 'audio' | 'wearables' | 'power' | 'accessories';

export type Platform = 'ios' | 'android';

/** `uk-used` is the market term for imported, lightly used devices. */
export type Condition = 'new' | 'uk-used' | 'pre-owned';

/** Which built-in illustration renders when a product has no photo yet. */
export type ArtKind = 'phone' | 'phone-fold' | 'buds' | 'watch' | 'speaker' | 'charger' | 'powerbank' | 'case';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface StorageOption {
  label: string;
  /** Added to the base price. */
  priceDelta: Naira;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  platform?: Platform;
  condition: Condition;
  price: Naira;
  compareAtPrice?: Naira;
  tagline: string;
  description: string;
  colors: ColorOption[];
  storage?: StorageOption[];
  specs: Spec[];
  rating: number;
  reviewCount: number;
  stock: number;
  badge?: 'new' | 'hot' | 'deal';
  featured?: boolean;
  art: ArtKind;
}

export interface Category {
  id: CategoryId;
  label: string;
  blurb: string;
}

/* ---------------------------------- Orders --------------------------------- */

export type FulfilmentMethod = 'delivery' | 'pickup';

export type PaymentMethod = 'transfer' | 'pay-on-delivery';

export type OrderStatus = 'placed' | 'confirmed' | 'packed' | 'in-transit' | 'delivered' | 'cancelled';

export interface OrderLineInput {
  productId: string;
  quantity: number;
  color?: string;
  storage?: string;
}

export interface OrderLine extends Required<Omit<OrderLineInput, 'color' | 'storage'>> {
  name: string;
  unitPrice: Naira;
  color?: string;
  storage?: string;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface DeliveryAddress {
  state: string;
  city: string;
  street: string;
  landmark?: string;
}

export interface CreateOrderInput {
  customer: Customer;
  lines: OrderLineInput[];
  fulfilment: FulfilmentMethod;
  address?: DeliveryAddress;
  payment: PaymentMethod;
  note?: string;
}

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  customer: Customer;
  lines: OrderLine[];
  fulfilment: FulfilmentMethod;
  address?: DeliveryAddress;
  payment: PaymentMethod;
  note?: string;
  subtotal: Naira;
  deliveryFee: Naira;
  total: Naira;
  createdAt: string;
  updatedAt: string;
}

/* ---------------------------------- Trade ---------------------------------- */

export type DeviceGrade = 'flawless' | 'good' | 'fair' | 'cracked';

export type BatteryBand = 'above-90' | '80-90' | 'below-80';

export interface TradeDevice {
  modelId: string;
  storage: string;
  grade: DeviceGrade;
  battery: BatteryBand;
  hasBox: boolean;
}

export interface TradeModel {
  id: string;
  name: string;
  brand: string;
  platform: Platform;
  /** Offer for a flawless unit at the base storage tier. */
  baseValue: Naira;
  storage: StorageOption[];
}

export interface TradeQuote {
  low: Naira;
  high: Naira;
  /** Single figure the UI headlines; the midpoint of the range. */
  offer: Naira;
}

export interface SwapQuote extends TradeQuote {
  targetPrice: Naira;
  /** What the customer pays on top. Zero when their device covers the target. */
  topUp: Naira;
}

export type TradeKind = 'sell' | 'swap';

export interface CreateTradeInput {
  kind: TradeKind;
  customer: Customer;
  device: TradeDevice;
  /** Required when `kind` is `swap`. */
  targetProductId?: string;
}

export interface TradeRequest extends CreateTradeInput {
  id: string;
  reference: string;
  quote: TradeQuote | SwapQuote;
  status: 'received' | 'inspecting' | 'offer-final' | 'completed' | 'declined';
  createdAt: string;
}
