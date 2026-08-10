import { Product } from "../data/catalog";
import { unitPrice, MeasureBase } from "./pricing";
import { supabase } from "./supabase";

export interface LatLng {
  lat: number;
  lng: number;
}

export type OptimizationMode = 'cheapest_single' | 'cheapest_multi' | 'best_value' | 'within_budget';

export interface BasketItemConfig {
  productName: string;
  category?: string;
  quantity: number;
  unit: MeasureBase;
  preferredBrands?: string[];
  isEssential: boolean;
}

export interface BasketResult {
  total: number;
  savings: number;
  travelCost?: number;
  items: Array<{
    product: Product;
    quantity: number;
    subtotal: number;
    establishment: string;
    neighborhood: string;
    isOptimizationMatch: boolean;
  }>;
  storeBreakdown: Record<string, {
    total: number;
    itemCount: number;
    storeName: string;
    neighborhood?: string;
    distanceKm?: number;
    estimatedTravelCost?: number;
  }>;
}

export const COST_PER_KM = 2.0;
export const FEIJO_CENTER: LatLng = { lat: -8.1633, lng: -70.3533 };
export const ACTIVE_BASKET_NAME = 'Cesta Ativa (Auto)';

export function neighborhoodCoords(neighborhood = ""): LatLng {
  const n = neighborhood.toLowerCase();
  if (n.includes("centro")) return { lat: -8.164, lng: -70.354 };
  if (n.includes("segundo")) return { lat: -8.168, lng: -70.358 };
  if (n.includes("bairro novo")) return { lat: -8.171, lng: -70.349 };
  return { lat: -8.160, lng: -70.350 };
}

export function distanceFromOrigin(neighborhood = "", origin?: LatLng): number {
  const from = origin || FEIJO_CENTER;
  const to = neighborhoodCoords(neighborhood);
  const km = Math.sqrt(Math.pow(from.lat - to.lat, 2) + Math.pow(from.lng - to.lng, 2)) * 111;
  return Math.round(km * 100) / 100;
}

export function optimizeBasket(
  catalog: Product[],
  items: BasketItemConfig[],
  mode: OptimizationMode,
  budget?: number,
  userLocation?: LatLng
): BasketResult {
  const mappedItems = items.map(config => {
    const matches = catalog.filter(p =>
      p.name.toLowerCase().includes(config.productName.toLowerCase()) ||
      (p.category && config.category && p.category === config.category)
    );
    return { config, matches };
  });

  let selectedItems: BasketResult['items'] = [];

  if (mode === 'cheapest_multi') {
    selectedItems = mappedItems.map(({ config, matches }) => {
      const bestProduct = matches.sort((a, b) => a.minPrice - b.minPrice)[0];
      const quantity = config.quantity;
      return {
        product: bestProduct,
        quantity,
        subtotal: (bestProduct?.minPrice || 0) * quantity,
        establishment: bestProduct?.establishment || 'Não encontrado',
        neighborhood: bestProduct?.neighborhood || '—',
        isOptimizationMatch: true
      };
    }).filter(i => i.product);
  } else if (mode === 'cheapest_single') {
    const primaryStore = mappedItems[0]?.matches.sort((a, b) => a.minPrice - b.minPrice)[0]?.establishment;
    selectedItems = mappedItems.map(({ config, matches }) => {
      const storeMatch = matches.find(p => p.establishment === primaryStore) || matches.sort((a, b) => a.minPrice - b.minPrice)[0];
      const quantity = config.quantity;
      return {
        product: storeMatch,
        quantity,
        subtotal: (storeMatch?.minPrice || 0) * quantity,
        establishment: storeMatch?.establishment || 'Não encontrado',
        neighborhood: storeMatch?.neighborhood || '—',
        isOptimizationMatch: storeMatch?.establishment === primaryStore
      };
    }).filter(i => i.product);
  } else if (mode === 'best_value') {
    selectedItems = mappedItems.map(({ config, matches }) => {
      const best = matches.slice().sort((a, b) => {
        const distA = distanceFromOrigin(a.neighborhood, userLocation);
        const distB = distanceFromOrigin(b.neighborhood, userLocation);
        return (a.minPrice + distA * COST_PER_KM) - (b.minPrice + distB * COST_PER_KM);
      })[0];
      return {
        product: best,
        quantity: config.quantity,
        subtotal: (best?.minPrice || 0) * config.quantity,
        establishment: best?.establishment || '—',
        neighborhood: best?.neighborhood || '—',
        isOptimizationMatch: true
      };
    }).filter(i => i.product);
  } else {
    selectedItems = mappedItems.map(({ config, matches }) => {
      const bestProduct = matches.sort((a, b) => a.minPrice - b.minPrice)[0];
      return {
        product: bestProduct,
        quantity: config.quantity,
        subtotal: (bestProduct?.minPrice || 0) * config.quantity,
        establishment: bestProduct?.establishment || '—',
        neighborhood: bestProduct?.neighborhood || '—',
        isOptimizationMatch: true
      };
    }).filter(i => i.product);
  }

  const total = selectedItems.reduce((sum, i) => sum + i.subtotal, 0);
  const avgTotal = selectedItems.reduce((sum, i) => sum + (i.product.avgPrice * i.quantity), 0);
  const savings = Math.max(0, avgTotal - total);
  const storeBreakdown: BasketResult['storeBreakdown'] = {};

  selectedItems.forEach(item => {
    if (!storeBreakdown[item.establishment]) {
      const distanceKm = distanceFromOrigin(item.neighborhood, userLocation);
      storeBreakdown[item.establishment] = {
        total: 0,
        itemCount: 0,
        storeName: item.establishment,
        neighborhood: item.neighborhood,
        distanceKm,
        estimatedTravelCost: Math.round(distanceKm * COST_PER_KM * 100) / 100,
      };
    }
    storeBreakdown[item.establishment].total += item.subtotal;
    storeBreakdown[item.establishment].itemCount += 1;
  });

  const travelCost = Math.round(
    Object.values(storeBreakdown).reduce((sum, s) => sum + (s.estimatedTravelCost || 0), 0) * 100,
  ) / 100;

  return { total, savings, travelCost, items: selectedItems, storeBreakdown };
}

function requireSupabase() {
  if (!supabase) throw new Error('Supabase indisponível. Verifique a configuração da conexão antes de salvar a cesta.');
  return supabase;
}

async function replaceBasketChildren(basketId: string, items: BasketItemConfig[], result: BasketResult) {
  const client = requireSupabase();
  const { error: deleteItemsError } = await client.from('smart_basket_items').delete().eq('basket_id', basketId);
  if (deleteItemsError) throw deleteItemsError;
  const { error: deleteSnapshotsError } = await client.from('basket_snapshots').delete().eq('basket_id', basketId);
  if (deleteSnapshotsError) throw deleteSnapshotsError;

  if (items.length) {
    const { error: iError } = await client.from('smart_basket_items').insert(items.map(i => ({
      basket_id: basketId,
      product_name: i.productName,
      category: i.category,
      quantity: i.quantity,
      unit: i.unit,
      is_essential: i.isEssential
    })));
    if (iError) throw iError;
  }

  if (result.items.length) {
    const { error: sError } = await client.from('basket_snapshots').insert(result.items.map(item => ({
      basket_id: basketId,
      product_id: String(item.product.id),
      product_name: item.product.name,
      establishment_id: String(item.product.establishmentId || ''),
      establishment_name: item.establishment,
      price: item.product.minPrice,
      unit_price: (unitPrice(item.product.minPrice, item.product.size) as any)?.value || 0
    })));
    if (sError) throw sError;
  }
}

export async function saveBasket(
  userId: string,
  name: string,
  mode: OptimizationMode,
  budget: number,
  items: BasketItemConfig[],
  result: BasketResult
) {
  const client = requireSupabase();
  let basketId: string | null = null;

  if (name === ACTIVE_BASKET_NAME) {
    const { data: existing, error: findError } = await client
      .from('smart_baskets')
      .select('id')
      .eq('user_id', userId)
      .eq('name', ACTIVE_BASKET_NAME)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (findError) throw findError;

    if (existing?.id) {
      basketId = existing.id;
      const { error: updateError } = await client
        .from('smart_baskets')
        .update({ budget, optimization_mode: mode, updated_at: new Date().toISOString() })
        .eq('id', basketId);
      if (updateError) throw updateError;
    }
  }

  if (!basketId) {
    const { data: basket, error: bError } = await client
      .from('smart_baskets')
      .insert({ user_id: userId, name, budget, optimization_mode: mode })
      .select('id')
      .single();
    if (bError) throw bError;
    if (!basket?.id) throw new Error('A cesta foi criada sem um identificador válido.');
    basketId = basket.id;
  }

  await replaceBasketChildren(basketId as string, items, result);
  return basketId;
}

export async function saveActiveBasketDraft(userId: string, items: BasketItemConfig[]) {
  const emptyResult: BasketResult = { total: 0, savings: 0, items: [], storeBreakdown: {} };
  return saveBasket(userId, ACTIVE_BASKET_NAME, 'cheapest_multi', 0, items, emptyResult);
}

export async function getBasketSnapshot(basketId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('smart_baskets')
    .select(`*, items:smart_basket_items(*), snapshots:basket_snapshots(*)`)
    .eq('id', basketId)
    .single();
  if (error) throw error;
  return data;
}
