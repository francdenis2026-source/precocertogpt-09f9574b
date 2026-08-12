import { describe, it, expect } from 'vitest';
import { money } from '../lib/pricing';

// Simulação de renderização para validar lógica de exibição
const renderPriceGrid = (product: any) => {
  const hasMultiple = product.storeCount > 1 || (product.offers && product.offers.length > 1);
  if (!hasMultiple) return "EXCLUSIVE_MESSAGE";
  
  const min = Number.isFinite(product.minPrice) ? money(product.minPrice) : '---';
  
  const avgVal = product.avgPrice || (product.price_history && product.price_history.length > 0
    ? product.price_history.reduce((a: any, b: any) => a + b.value, 0) / product.price_history.length
    : product.minPrice);
  const avg = Number.isFinite(avgVal) ? money(avgVal) : '---';
  
  const maxVal = product.maxPrice || (product.price_history && product.price_history.length > 0
    ? Math.max(...product.price_history.map((h: any) => h.value))
    : (product.previousPrice || product.minPrice));
  const max = Number.isFinite(maxVal) ? money(maxVal) : '---';
  
  return { min, avg, max };
};

describe('Product Modal Price Comparison Logic', () => {
  it('should show exclusive message when only one store exists', () => {
    const product = { storeCount: 1, minPrice: 10, offers: [] };
    expect(renderPriceGrid(product)).toBe("EXCLUSIVE_MESSAGE");
  });

  it('should show price grid when multiple stores exist', () => {
    const product = { storeCount: 2, minPrice: 10, avgPrice: 12, maxPrice: 15 };
    const result: any = renderPriceGrid(product);
    expect(result.min).toContain('10,00');
    expect(result.avg).toContain('12,00');
    expect(result.max).toContain('15,00');
  });

  it('should handle missing or invalid price values with fallbacks', () => {
    const product = { storeCount: 2, minPrice: NaN, avgPrice: null, maxPrice: undefined };
    const result: any = renderPriceGrid(product);
    expect(result.min).toBe('---');
    expect(result.avg).toBe('---');
    expect(result.max).toBe('---');
  });

  it('should calculate averages from history when explicit fields are missing', () => {
    const product = { 
      storeCount: 2, 
      minPrice: 10, 
      price_history: [{ value: 10 }, { value: 20 }] 
    };
    const result: any = renderPriceGrid(product);
    expect(result.avg).toContain('15,00');
    expect(result.max).toContain('20,00');
  });
});
