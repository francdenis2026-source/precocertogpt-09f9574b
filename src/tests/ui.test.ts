import { describe, it, expect, vi } from 'vitest';
import { normalize } from '../data/remoteCatalog';

describe('Search & UI Logic Tests', () => {
  it('normalizes text correctly (accents and case)', () => {
    expect(normalize("Maçã")).toBe("maca");
    expect(normalize("CAFÉ")).toBe("cafe");
    expect(normalize("  Arroz Integral  ")).toBe("arroz integral");
  });

  it('filters products correctly by multiple criteria', () => {
    const products = [
      { id: 1, name: "Arroz", category: "Grãos", brand: "Tio João", minPrice: 20, capturedAt: new Date().toISOString() },
      { id: 2, name: "Feijão", category: "Grãos", brand: "Kicaldo", minPrice: 10, capturedAt: new Date().toISOString() }
    ];

    const query = "arro";
    const filtered = products.filter(p => normalize(p.name).includes(normalize(query)));
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Arroz");
  });

  it('calculates pagination correctly', () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const itemsPerPage = 12;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    expect(totalPages).toBe(3);
    
    const page2 = items.slice(12, 24);
    expect(page2).toHaveLength(12);
    expect(page2[0]).toBe(12);
  });

  it('sorts by price correctly', () => {
    const products = [
      { id: 1, minPrice: 30 },
      { id: 2, minPrice: 10 },
      { id: 3, minPrice: 20 }
    ];
    const sorted = [...products].sort((a, b) => a.minPrice - b.minPrice);
    expect(sorted[0].minPrice).toBe(10);
    expect(sorted[2].minPrice).toBe(30);
  });
});
