import { Product } from "../data/catalog";
import { unitPrice, isComparable, MeasureBase } from "./pricing";

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
  }>;
}

/**
 * Motor determinístico da Cesta Inteligente.
 * Calcula a melhor combinação de preços baseada no modo de otimização.
 */
export function optimizeBasket(
  catalog: Product[],
  items: BasketItemConfig[],
  mode: OptimizationMode,
  budget?: number
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
  } else {
    // Fallback para os outros modos (simplificado para o MVP)
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
