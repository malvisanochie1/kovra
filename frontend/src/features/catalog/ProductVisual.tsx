import type { Product } from '@kovra/shared';
import { Image } from 'expo-image';
import { memo } from 'react';
import { artAspect, DeviceArt } from './DeviceArt';
import { productPhotos } from './product-photos';

export type ProductSide = 'back' | 'front';

interface ProductVisualProps {
  product: Product;
  /** Hex of the selected colour. Defaults to the product's first colour. */
  color?: string;
  height: number;
  /** Which side to show. Defaults to the product's hero side. */
  view?: ProductSide;
}

/** Phones lead with their back (the camera is the identity); gadgets with their main shot. */
export function heroSide(product: Product): ProductSide {
  return product.art === 'phone' ? 'back' : 'front';
}

/** A product's studio photo when one exists, otherwise its vector render. */
function ProductVisualBase({ product, color, height, view }: ProductVisualProps) {
  const side = view ?? heroSide(product);
  const photo = productPhotos[product.id]?.[side];
  const tint = color ?? product.colors[0]?.hex ?? '#8E9CB0';

  if (photo) {
    return (
      <Image
        source={photo}
        style={{ width: height, height }}
        contentFit="contain"
        transition={180}
        recyclingKey={`${product.id}-${side}`}
        accessibilityLabel={product.name}
      />
    );
  }

  return (
    <DeviceArt
      kind={product.art}
      color={tint}
      brand={product.brand}
      height={height * (artAspect(product.art) === 1 ? 0.8 : 1)}
      view={side}
    />
  );
}

export const ProductVisual = memo(ProductVisualBase);
