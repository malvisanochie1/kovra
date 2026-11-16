import type {
  ArtKind,
  CategoryId,
  ColorOption,
  Condition,
  Customer,
  DeliveryAddress,
  FulfilmentMethod,
  OrderLine,
  OrderStatus,
  PaymentMethod,
  Platform,
  Spec,
  StorageOption,
  SwapQuote,
  TradeDevice,
  TradeKind,
  TradeQuote,
  TradeRequest,
} from '@kovra/shared';
import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
};

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    brand: text('brand').notNull(),
    category: text('category').$type<CategoryId>().notNull(),
    platform: text('platform').$type<Platform>(),
    condition: text('condition').$type<Condition>().notNull(),
    price: integer('price').notNull(),
    compareAtPrice: integer('compare_at_price'),
    tagline: text('tagline').notNull(),
    description: text('description').notNull(),
    colors: text('colors', { mode: 'json' }).$type<ColorOption[]>().notNull(),
    storage: text('storage', { mode: 'json' }).$type<StorageOption[]>(),
    specs: text('specs', { mode: 'json' }).$type<Spec[]>().notNull(),
    rating: real('rating').notNull(),
    reviewCount: integer('review_count').notNull(),
    stock: integer('stock').notNull(),
    badge: text('badge').$type<'new' | 'hot' | 'deal'>(),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    art: text('art').$type<ArtKind>().notNull(),
    ...timestamps,
  },
  (table) => [index('products_category_idx').on(table.category)],
);

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  /** Stored lowercase; used with the password or fingerprint to sign in. */
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  passwordHash: text('password_hash').notNull(),
  ...timestamps,
});

/**
 * One row per account per device that has fingerprint sign-in turned on. The device
 * keeps the secret in hardware-backed storage that only a fingerprint can unlock;
 * the server keeps a SHA-256 hash of it.
 */
export const biometricCredentials = sqliteTable(
  'biometric_credentials',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deviceId: text('device_id').notNull(),
    secretHash: text('secret_hash').notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex('biometric_user_device_idx').on(table.userId, table.deviceId)],
);

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    reference: text('reference').notNull().unique(),
    userId: text('user_id').references(() => users.id),
    status: text('status').$type<OrderStatus>().notNull(),
    customer: text('customer', { mode: 'json' }).$type<Customer>().notNull(),
    lines: text('lines', { mode: 'json' }).$type<OrderLine[]>().notNull(),
    fulfilment: text('fulfilment').$type<FulfilmentMethod>().notNull(),
    address: text('address', { mode: 'json' }).$type<DeliveryAddress>(),
    payment: text('payment').$type<PaymentMethod>().notNull(),
    note: text('note'),
    subtotal: integer('subtotal').notNull(),
    deliveryFee: integer('delivery_fee').notNull(),
    total: integer('total').notNull(),
    ...timestamps,
  },
  (table) => [index('orders_user_idx').on(table.userId)],
);

export const tradeRequests = sqliteTable('trade_requests', {
  id: text('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  userId: text('user_id').references(() => users.id),
  kind: text('kind').$type<TradeKind>().notNull(),
  customer: text('customer', { mode: 'json' }).$type<Customer>().notNull(),
  device: text('device', { mode: 'json' }).$type<TradeDevice>().notNull(),
  targetProductId: text('target_product_id').references(() => products.id),
  quote: text('quote', { mode: 'json' }).$type<TradeQuote | SwapQuote>().notNull(),
  status: text('status').$type<TradeRequest['status']>().notNull(),
  ...timestamps,
});
