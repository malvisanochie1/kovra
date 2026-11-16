/**
 * Studio photos keyed by product ID. Products without an entry fall back to their
 * vector render, so photos can be added one at a time with no other code changes:
 *
 *   'iphone-17-pro-max': require('../../../assets/products/iphone-17-pro-max.webp'),
 *
 * Use transparent-background WebP files around 900×900 to keep the app small.
 */
/** Values are `require()` results, which Metro resolves to asset IDs. */
export const productPhotos: Partial<Record<string, number>> = {};
