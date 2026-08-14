import type { RecyclingCategory } from '@/domain/types';

export type ProductLookupSource = 'local' | 'open_food_facts';
export type ProductCategoryConfidence = 'high' | 'medium' | 'low';

export interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  categoryId?: RecyclingCategory['id'];
  categoryConfidence: ProductCategoryConfidence;
  packagingSummary?: string;
  preparation: string;
  source: ProductLookupSource;
}

export type ProductLookupResult =
  | { status: 'found'; product: ScannedProduct }
  | { status: 'not_found'; barcode: string; message: string }
  | { status: 'invalid'; barcode: string; message: string }
  | { status: 'error'; barcode: string; message: string };

export interface ProductLookupProvider {
  lookup: (barcode: string) => Promise<ProductLookupResult>;
}

interface ProductCategoryInference {
  categoryId?: RecyclingCategory['id'];
  confidence: ProductCategoryConfidence;
}

export type ProductLookupFetch = (
  input: string,
  init?: { headers?: Record<string, string> },
) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

interface LocalProductSeed {
  name: string;
  brand: string;
  categoryId: RecyclingCategory['id'];
  packagingSummary: string;
  preparation: string;
  imageUrl?: string;
}

interface OpenFoodFactsResponse {
  status?: number;
  product?: {
    product_name?: string;
    product_name_es?: string;
    generic_name?: string;
    brands?: string;
    image_front_url?: string;
    image_url?: string;
    packaging?: string;
    packaging_text?: string;
    packaging_text_es?: string;
    packaging_tags?: string[];
    packagings?: {
      material?: string;
      shape?: string;
      recycling?: string;
    }[];
  };
}

const USER_AGENT = 'Retorna/0.1.0 (https://github.com/caiuc/equipo-14-haCAIthon-2026)';
const OPEN_FOOD_FACTS_FIELDS = [
  'code',
  'product_name',
  'product_name_es',
  'generic_name',
  'brands',
  'image_front_url',
  'image_url',
  'packaging',
  'packaging_text',
  'packaging_text_es',
  'packaging_tags',
  'packagings',
].join(',');

const LOCAL_PRODUCTS: Record<string, LocalProductSeed> = {
  '7802800002783': {
    name: 'Bebida individual',
    brand: 'Catálogo demo Chile',
    categoryId: 'plastic',
    packagingSummary: 'Botella PET',
    preparation: 'Vacía, enjuaga y aplasta la botella. Separa tapa y etiqueta si el punto limpio lo pide.',
  },
  '7801610000567': {
    name: 'Bebida en lata',
    brand: 'Catálogo demo Chile',
    categoryId: 'metal',
    packagingSummary: 'Lata de aluminio',
    preparation: 'Vacía, enjuaga y aplasta con cuidado. Evita dejar bordes cortantes.',
  },
  '7802920000014': {
    name: 'Leche larga vida',
    brand: 'Catálogo demo Chile',
    categoryId: 'carton',
    packagingSummary: 'Envase tipo Tetra Pak',
    preparation: 'Abre, enjuaga, seca y aplana el envase antes de llevarlo al punto de reciclaje.',
  },
  '7802225510003': {
    name: 'Cereal familiar',
    brand: 'Catálogo demo Chile',
    categoryId: 'cardboard',
    packagingSummary: 'Caja de cartón',
    preparation: 'Retira la bolsa interior, desarma y aplana la caja. Mantén el cartón seco.',
  },
  '7806500500036': {
    name: 'Conserva en frasco',
    brand: 'Catálogo demo Chile',
    categoryId: 'glass',
    packagingSummary: 'Frasco de vidrio',
    preparation: 'Vacía y enjuaga el frasco. Retira la tapa metálica y entrégala separada.',
  },
};

const DEFAULT_PREPARATION = 'Entrégalo limpio, seco y separado por material.';

const CATEGORY_PREPARATION: Record<RecyclingCategory['id'], string> = {
  plastic: 'Vacía, enjuaga y aplasta. Separa tapa y etiqueta cuando el punto limpio lo indique.',
  glass: 'Vacía y enjuaga. Retira tapas; no es necesario quitar etiquetas si el gestor no lo pide.',
  metal: 'Vacía, enjuaga y aplasta con cuidado. Evita bordes cortantes.',
  paper: 'Mantén seco y retira clips grandes o envoltorios plásticos.',
  cardboard: 'Desarma y aplana las cajas para ahorrar espacio.',
  carton: 'Abre, enjuaga, seca y aplana. Conserva la tapa sólo si el gestor la acepta.',
  electronics: 'Borra datos personales y entrega el equipo completo en un punto especializado.',
  batteries: 'Aísla terminales si corresponde y llévalas a un contenedor específico.',
  other: DEFAULT_PREPARATION,
};

export function normalizeBarcode(input: string) {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 8 || digits.length === 12 || digits.length === 13) return digits;
  return undefined;
}

export function lookupLocalProduct(barcode: string): ScannedProduct | undefined {
  const seed = LOCAL_PRODUCTS[barcode];
  if (!seed) return undefined;
  return {
    barcode,
    ...seed,
    categoryConfidence: 'high',
    source: 'local',
  };
}

export function inferCategoryFromPackaging(packagingValues: string[]): ProductCategoryInference {
  const normalized = packagingValues.map(normalizeText).filter(Boolean);
  const joined = normalized.join(' ');

  if (hasAny(joined, ['pila', 'pilas', 'bateria', 'battery', 'batteries'])) {
    return { categoryId: 'batteries', confidence: 'high' as const };
  }
  if (hasAny(joined, ['electronico', 'electronics', 'electronic', 'raee'])) {
    return { categoryId: 'electronics', confidence: 'high' as const };
  }
  if (hasAny(joined, ['tetra pak', 'tetrapak', 'tetra-pak', 'brik', 'brick', 'aseptic carton', 'beverage carton'])) {
    return { categoryId: 'carton', confidence: 'high' as const };
  }
  if (hasAny(joined, ['aluminio', 'aluminum', 'aluminium', 'steel', 'acero', 'metal', 'tin can', 'lata', 'can'])) {
    return { categoryId: 'metal', confidence: 'high' as const };
  }
  if (hasAny(joined, ['vidrio', 'glass', 'jar', 'bottle glass'])) {
    return { categoryId: 'glass', confidence: 'high' as const };
  }
  if (hasAny(joined, ['cardboard', 'paperboard', 'carton corrugado', 'corrugated', 'box', 'caja', 'carton'])) {
    return { categoryId: 'cardboard', confidence: 'medium' as const };
  }
  if (hasAny(joined, ['papel', 'paper'])) {
    return { categoryId: 'paper', confidence: 'medium' as const };
  }
  if (hasAny(joined, ['plastico', 'plastic', 'pet', 'hdpe', 'ldpe', 'pvc', 'polypropylene', 'polyethylene'])) {
    return { categoryId: 'plastic', confidence: 'medium' as const };
  }

  return { categoryId: undefined, confidence: 'low' as const };
}

export class OpenFoodFactsProvider implements ProductLookupProvider {
  private readonly fetcher: ProductLookupFetch;
  private readonly includeUserAgentHeader: boolean;

  constructor(options: { fetcher?: ProductLookupFetch; includeUserAgentHeader?: boolean } = {}) {
    this.fetcher = options.fetcher ?? ((input, init) => fetch(input, init));
    this.includeUserAgentHeader = options.includeUserAgentHeader ?? typeof document === 'undefined';
  }

  async lookup(input: string): Promise<ProductLookupResult> {
    const barcode = normalizeBarcode(input);
    if (!barcode) {
      return {
        status: 'invalid',
        barcode: input,
        message: 'Ingresa un código EAN o UPC válido.',
      };
    }

    const localProduct = lookupLocalProduct(barcode);
    if (localProduct) return { status: 'found', product: localProduct };

    try {
      const response = await this.fetcher(buildOpenFoodFactsUrl(barcode), {
        headers: this.includeUserAgentHeader ? { 'User-Agent': USER_AGENT } : undefined,
      });
      if (!response.ok) {
        return {
          status: 'error',
          barcode,
          message: 'No pudimos consultar Open Food Facts. Puedes elegir la categoría manualmente.',
        };
      }

      const payload = await response.json() as OpenFoodFactsResponse;
      if (payload.status !== 1 || !payload.product) {
        return {
          status: 'not_found',
          barcode,
          message: 'No encontramos ese producto. Puedes elegir la categoría manualmente.',
        };
      }

      return { status: 'found', product: productFromOpenFoodFacts(barcode, payload.product) };
    } catch {
      return {
        status: 'error',
        barcode,
        message: 'No hay conexión con la base externa. Puedes continuar de forma manual.',
      };
    }
  }
}

export function createProductLookupProvider(): ProductLookupProvider {
  return new OpenFoodFactsProvider();
}

function productFromOpenFoodFacts(barcode: string, product: NonNullable<OpenFoodFactsResponse['product']>): ScannedProduct {
  const packagingValues = collectPackagingValues(product);
  const inferred = inferCategoryFromPackaging(packagingValues);
  const categoryId = inferred.categoryId;
  return {
    barcode,
    name: firstText(product.product_name_es, product.product_name, product.generic_name) ?? 'Producto escaneado',
    brand: firstText(product.brands),
    imageUrl: firstText(product.image_front_url, product.image_url),
    categoryId,
    categoryConfidence: inferred.confidence,
    packagingSummary: summarizePackaging(packagingValues),
    preparation: categoryId ? preparationForCategory(categoryId) : preparationForCategory('other'),
    source: 'open_food_facts',
  };
}

function buildOpenFoodFactsUrl(barcode: string) {
  const params = new URLSearchParams({ fields: OPEN_FOOD_FACTS_FIELDS, lc: 'es' });
  return `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?${params.toString()}`;
}

function preparationForCategory(categoryId: RecyclingCategory['id']): string {
  return CATEGORY_PREPARATION[categoryId] ?? DEFAULT_PREPARATION;
}

function collectPackagingValues(product: NonNullable<OpenFoodFactsResponse['product']>) {
  return [
    product.packaging,
    product.packaging_text_es,
    product.packaging_text,
    ...(product.packaging_tags ?? []),
    ...(product.packagings ?? []).flatMap((item) => [item.material, item.shape, item.recycling]),
  ].filter((value): value is string => Boolean(value?.trim()));
}

function summarizePackaging(values: string[]) {
  const clean = values.map((value) => value.replace(/^[-a-z]{2}:/i, '').trim()).filter(Boolean);
  if (!clean.length) return undefined;
  return [...new Set(clean)].slice(0, 3).join(', ');
}

function firstText(...values: (string | undefined)[]) {
  return values.map((value) => value?.trim()).find(Boolean);
}

function hasAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase('es-CL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
