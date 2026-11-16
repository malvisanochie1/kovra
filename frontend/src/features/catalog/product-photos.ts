/**
 * Studio photos keyed by product ID, one per side. Products without an entry fall
 * back to their vector render, so new photos can be added with no other changes.
 *
 * For phones, `back` is the hero (it shows the camera) and `front` is the screen.
 * For gadgets, `front` is the hero shot and `back` is a second angle.
 *
 * Files are transparent WebP, cropped to the product and at most 720px, to keep
 * the app small. Values are `require()` results, which Metro resolves to asset IDs.
 */
export interface ProductPhotoSet {
  front: number;
  back: number;
}

export const productPhotos: Partial<Record<string, ProductPhotoSet>> = {
  'airpods-pro-3': {
    front: require('../../../assets/products/airpods-pro-3-front.webp'),
    back: require('../../../assets/products/airpods-pro-3-back.webp'),
  },
  'anker-65w-gan': {
    front: require('../../../assets/products/anker-65w-gan-front.webp'),
    back: require('../../../assets/products/anker-65w-gan-back.webp'),
  },
  'apple-watch-series-11': {
    front: require('../../../assets/products/apple-watch-series-11-front.webp'),
    back: require('../../../assets/products/apple-watch-series-11-back.webp'),
  },
  'galaxy-a56': {
    front: require('../../../assets/products/galaxy-a56-front.webp'),
    back: require('../../../assets/products/galaxy-a56-back.webp'),
  },
  'galaxy-buds3-pro': {
    front: require('../../../assets/products/galaxy-buds3-pro-front.webp'),
    back: require('../../../assets/products/galaxy-buds3-pro-back.webp'),
  },
  'galaxy-s24-uk': {
    front: require('../../../assets/products/galaxy-s24-uk-front.webp'),
    back: require('../../../assets/products/galaxy-s24-uk-back.webp'),
  },
  'galaxy-s25-ultra': {
    front: require('../../../assets/products/galaxy-s25-ultra-front.webp'),
    back: require('../../../assets/products/galaxy-s25-ultra-back.webp'),
  },
  'galaxy-watch8': {
    front: require('../../../assets/products/galaxy-watch8-front.webp'),
    back: require('../../../assets/products/galaxy-watch8-back.webp'),
  },
  'galaxy-z-flip7': {
    front: require('../../../assets/products/galaxy-z-flip7-front.webp'),
    back: require('../../../assets/products/galaxy-z-flip7-back.webp'),
  },
  'infinix-note-50-pro': {
    front: require('../../../assets/products/infinix-note-50-pro-front.webp'),
    back: require('../../../assets/products/infinix-note-50-pro-back.webp'),
  },
  'iphone-13-uk': {
    front: require('../../../assets/products/iphone-13-uk-front.webp'),
    back: require('../../../assets/products/iphone-13-uk-back.webp'),
  },
  'iphone-15-uk': {
    front: require('../../../assets/products/iphone-15-uk-front.webp'),
    back: require('../../../assets/products/iphone-15-uk-back.webp'),
  },
  'iphone-16-pro-max-uk': {
    front: require('../../../assets/products/iphone-16-pro-max-uk-front.webp'),
    back: require('../../../assets/products/iphone-16-pro-max-uk-back.webp'),
  },
  'iphone-17': {
    front: require('../../../assets/products/iphone-17-front.webp'),
    back: require('../../../assets/products/iphone-17-back.webp'),
  },
  'iphone-17-pro': {
    front: require('../../../assets/products/iphone-17-pro-front.webp'),
    back: require('../../../assets/products/iphone-17-pro-back.webp'),
  },
  'iphone-17-pro-max': {
    front: require('../../../assets/products/iphone-17-pro-max-front.webp'),
    back: require('../../../assets/products/iphone-17-pro-max-back.webp'),
  },
  'jbl-flip-7': {
    front: require('../../../assets/products/jbl-flip-7-front.webp'),
    back: require('../../../assets/products/jbl-flip-7-back.webp'),
  },
  'magsafe-clear-case': {
    front: require('../../../assets/products/magsafe-clear-case-front.webp'),
    back: require('../../../assets/products/magsafe-clear-case-back.webp'),
  },
  'oraimo-freepods-4': {
    front: require('../../../assets/products/oraimo-freepods-4-front.webp'),
    back: require('../../../assets/products/oraimo-freepods-4-back.webp'),
  },
  'oraimo-powerbank-20k': {
    front: require('../../../assets/products/oraimo-powerbank-20k-front.webp'),
    back: require('../../../assets/products/oraimo-powerbank-20k-back.webp'),
  },
  'pixel-10-pro': {
    front: require('../../../assets/products/pixel-10-pro-front.webp'),
    back: require('../../../assets/products/pixel-10-pro-back.webp'),
  },
  'redmi-note-14-pro': {
    front: require('../../../assets/products/redmi-note-14-pro-front.webp'),
    back: require('../../../assets/products/redmi-note-14-pro-back.webp'),
  },
  'tecno-camon-40-pro': {
    front: require('../../../assets/products/tecno-camon-40-pro-front.webp'),
    back: require('../../../assets/products/tecno-camon-40-pro-back.webp'),
  },
};
