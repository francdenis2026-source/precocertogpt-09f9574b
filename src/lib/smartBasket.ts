import { Product } from "../data/catalog";
import { unitPrice, MeasureBase } from "./pricing";

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
    estimatedTravelCost?: number;
  }>;
}

/** Custo estimado de deslocamento por km (ida e volta já embutido no fator). */
export const COST_PER_KM = 2.0;

/** Origem padrão: centro de Feijó/AC. */
export const FEIJO_CENTER: LatLng = { lat: -8.1633, lng: -70.3533 };

/** Coordenadas aproximadas por bairro de Feijó. */
export function neighborhoodCoords(neighborhood = ""): LatLng {
  const n = neighborhood.toLowerCase();
  if (n.includes("centro")) return { lat: -8.164, lng: -70.354 };
  if (n.includes("segundo")) return { lat: -8.168, lng: -70.358 };
  if (n.includes("bairro novo")) return { lat: -8.171, lng: -70.349 };
  return { lat: -8.160, lng: -70.350 };
}

/** Distância aproximada (km) entre a origem do usuário e o bairro da loja. */
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
  // 1. Mapear itens da cesta para produtos do catálogo
  const mappedItems = items.map(config => {
    // Busca aproximada no catálogo (por nome/categoria)
    const matches = catalog.filter(p => 
      p.name.toLowerCase().includes(config.productName.toLowerCase()) ||
      (p.category && config.category && p.category === config.category)
    );
    
    return { config, matches };
  });

  let selectedItems: BasketResult['items'] = [];

  if (mode === 'cheapest_multi') {
    // Modo: Mais Barata (Lojas Múltiplas) - Pega o absoluto menor para cada item
    selectedItems = mappedItems.map(({ config, matches }) => {
      const bestProduct = matches.sort((a, b) => a.minPrice - b.minPrice)[0];
      const quantity = config.quantity;
      const subtotal = (bestProduct?.minPrice || 0) * quantity;

      return {
        product: bestProduct,
        quantity,
        subtotal,
        establishment: bestProduct?.establishment || 'Não encontrado',
        neighborhood: bestProduct?.neighborhood || '—',
        isOptimizationMatch: true
      };
    }).filter(i => i.product);
  } else if (mode === 'cheapest_single') {
    // Modo: Loja Única - Encontra a loja que tem o menor total para os itens disponíveis
    const storeTotals: Record<string, { total: number; items: BasketResult['items'] }> = {};
    
    // Simplificação: no catálogo atual, cada "Product" já vem com sua melhor loja vinculada.
    // Para uma otimização real de loja única, precisaríamos dos preços brutos de TODAS as lojas para cada produto.
    // Como o catálogo agregado do PreçoCerto foca no "melhor preço", vamos simular buscando o estabelecimento
    // que aparece com mais frequência como "melhor" ou computar via dados de preços se disponíveis.
    
    // Mock para MVP: se for loja única, priorizamos o estabelecimento do primeiro item mais barato.
    const primaryStore = mappedItems[0]?.matches.sort((a, b) => a.minPrice - b.minPrice)[0]?.establishment;
    
    selectedItems = mappedItems.map(({ config, matches }) => {
      const storeMatch = matches.find(p => p.establishment === primaryStore) || matches.sort((a, b) => a.minPrice - b.minPrice)[0];
      const quantity = config.quantity;
      const subtotal = (storeMatch?.minPrice || 0) * quantity;

      return {
        product: storeMatch,
        quantity,
        subtotal,
        establishment: storeMatch?.establishment || 'Não encontrado',
        neighborhood: storeMatch?.neighborhood || '—',
        isOptimizationMatch: storeMatch?.establishment === primaryStore
      };
    }).filter(i => i.product);
  } else if (mode === 'best_value') {
    // Modo: Melhor Custo-Benefício (Considerando Deslocamento)
    selectedItems = mappedItems.map(({ config, matches }) => {
      const best = matches.slice().sort((a, b) => {
        const distA = distanceFromOrigin(a.neighborhood, userLocation);
        const distB = distanceFromOrigin(b.neighborhood, userLocation);
        const scoreA = a.minPrice + (distA * COST_PER_KM);
        const scoreB = b.minPrice + (distB * COST_PER_KM);
        return scoreA - scoreB;
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
    // Fallback/Within Budget
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
  
  // Cálculo de economia (vs Preço Médio ou Preço Máximo)
  const avgTotal = selectedItems.reduce((sum, i) => sum + (i.product.avgPrice * i.quantity), 0);
  const savings = Math.max(0, avgTotal - total);

  const storeBreakdown: BasketResult['storeBreakdown'] = {};
  selectedItems.forEach(item => {
    if (!storeBreakdown[item.establishment]) {
      storeBreakdown[item.establishment] = { total: 0, itemCount: 0, storeName: item.establishment };
    }
    storeBreakdown[item.establishment].total += item.subtotal;
    storeBreakdown[item.establishment].itemCount += 1;
  });

  return {
    total,
    savings,
    items: selectedItems,
    storeBreakdown
  };
}

export async function saveBasket(
  userId: string,
  name: string,
  mode: OptimizationMode,
  budget: number,
  items: BasketItemConfig[],
  result: BasketResult
) {
  const { data: basket, error: bError } = await (window as any).supabase
    .from('smart_baskets')
    .insert({
      user_id: userId,
      name,
      budget,
      optimization_mode: mode
    })
    .select()
    .single();

  if (bError) throw bError;

  const basketId = basket.id;

  // Insert items
  const { error: iError } = await (window as any).supabase
    .from('smart_basket_items')
    .insert(items.map(i => ({
      basket_id: basketId,
      product_name: i.productName,
      category: i.category,
      quantity: i.quantity,
      unit: i.unit,
      is_essential: i.isEssential
    })));

  if (iError) throw iError;

  // Insert snapshots
  const { error: sError } = await (window as any).supabase
    .from('basket_snapshots')
    .insert(result.items.map(item => ({
      basket_id: basketId,
      product_id: item.product.id,
      product_name: item.product.name,
      establishment_id: item.product.establishmentId || '00000000-0000-0000-0000-000000000000',
      establishment_name: item.establishment,
      price: item.product.minPrice,
      unit_price: (unitPrice(item.product.minPrice, item.product.size) as any)?.value || 0
    })));

  if (sError) throw sError;

  return basketId;
}

export async function getBasketSnapshot(basketId: string) {
  const { data, error } = await (window as any).supabase
    .from('smart_baskets')
    .select(`
      *,
      items:smart_basket_items(*),
      snapshots:basket_snapshots(*)
    `)
    .eq('id', basketId)
    .single();

  if (error) throw error;
  return data;
}
