import { describe, it, expect } from 'vitest';
import { suggestProducts } from '../lib/productSearch';

describe('Comparação Prática Logic', () => {
  const mockProducts = [
    { id: '1', name: 'Arroz A', minPrice: 10, maxPrice: 15, offers: [{ value: 10 }, { value: 15 }], storeCount: 2 },
    { id: '2', name: 'Feijão B', minPrice: 8, maxPrice: 8, offers: [{ value: 8 }], storeCount: 1 },
    { id: '3', name: 'Leite C', minPrice: 5, maxPrice: 7, offers: [{ value: 5 }, { value: 7 }], storeCount: 2 },
  ] as any[];

  it('should filter products with multiple offers for comparison', () => {
    const comparable = mockProducts.filter(p => p.minPrice > 0 && (p.offers?.length ?? 0) > 1);
    expect(comparable.length).toBe(2);
    expect(comparable[0].name).toBe('Arroz A');
    expect(comparable[1].name).toBe('Leite C');
  });

  it('should sort products by price difference', () => {
    const sorted = [...mockProducts].sort((a, b) => (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice));
    expect(sorted[0].name).toBe('Arroz A'); // Diff 5
    expect(sorted[1].name).toBe('Leite C'); // Diff 2
  });
});
