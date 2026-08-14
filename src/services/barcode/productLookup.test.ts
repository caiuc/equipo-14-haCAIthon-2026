import { describe, expect, it } from 'vitest';

import {
  inferCategoryFromPackaging,
  lookupLocalProduct,
  normalizeBarcode,
  OpenFoodFactsProvider,
  type ProductLookupFetch,
} from './productLookup';

describe('barcode lookup', () => {
  it('normaliza códigos EAN y UPC desde texto escaneado o escrito', () => {
    expect(normalizeBarcode(' 780-1610000567 ')).toBe('7801610000567');
    expect(normalizeBarcode('012345678905')).toBe('012345678905');
    expect(normalizeBarcode('12345670')).toBe('12345670');
    expect(normalizeBarcode('abc')).toBeUndefined();
  });

  it('resuelve productos del catálogo local sin red', () => {
    expect(lookupLocalProduct('7801610000567')).toMatchObject({
      name: 'Bebida en lata',
      categoryId: 'metal',
      source: 'local',
    });
  });

  it('mapea materiales de empaque a categorías internas', () => {
    expect(inferCategoryFromPackaging(['en:plastic-bottle', 'PET 1'])).toMatchObject({ categoryId: 'plastic' });
    expect(inferCategoryFromPackaging(['Tetra Pak', 'aseptic carton'])).toMatchObject({ categoryId: 'carton' });
    expect(inferCategoryFromPackaging(['aluminium can'])).toMatchObject({ categoryId: 'metal' });
    expect(inferCategoryFromPackaging(['glass jar'])).toMatchObject({ categoryId: 'glass' });
  });

  it('convierte respuesta de Open Food Facts a producto escaneado', async () => {
    const fetcher: ProductLookupFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        status: 1,
        product: {
          product_name_es: 'Agua mineral',
          brands: 'Marca Demo',
          image_front_url: 'https://example.test/front.jpg',
          packaging_tags: ['en:plastic-bottle', 'en:pet'],
        },
      }),
    });
    const provider = new OpenFoodFactsProvider({ fetcher, includeUserAgentHeader: false });

    await expect(provider.lookup('7800000000001')).resolves.toEqual({
      status: 'found',
      product: {
        barcode: '7800000000001',
        name: 'Agua mineral',
        brand: 'Marca Demo',
        imageUrl: 'https://example.test/front.jpg',
        categoryId: 'plastic',
        categoryConfidence: 'medium',
        packagingSummary: 'plastic-bottle, pet',
        preparation: 'Vacía, enjuaga y aplasta. Separa tapa y etiqueta cuando el punto limpio lo indique.',
        source: 'open_food_facts',
      },
    });
  });

  it('permite fallback manual cuando Open Food Facts no encuentra el código', async () => {
    const fetcher: ProductLookupFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ status: 0 }),
    });
    const provider = new OpenFoodFactsProvider({ fetcher, includeUserAgentHeader: false });

    await expect(provider.lookup('7800000000002')).resolves.toMatchObject({
      status: 'not_found',
      barcode: '7800000000002',
    });
  });
});
