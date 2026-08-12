import { optimizeBasket } from '../lib/smartBasket.js';
import { buildCatalog } from '../data/catalog.js';

// Mocking vitest globals for the sandbox
const describe = (name: string, fn: () => void) => { console.log(`Running test suite: ${name}`); fn(); };
const test = (name: string, fn: () => void) => { console.log(`Running test: ${name}`); fn(); };
const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) throw new Error(`Expected ${expected}, but got ${actual}`);
  }
});

describe('Smart Basket Coupons', () => {
  const mockCatalog: Product[] = [
    { id: 1, name: 'Arroz', minPrice: 20, avgPrice: 25, establishment: 'Mercado A', neighborhood: 'Centro', category: 'Alimentos', slug: 'arroz' } as any,
    { id: 2, name: 'Feijão', minPrice: 10, avgPrice: 12, establishment: 'Mercado A', neighborhood: 'Centro', category: 'Alimentos', slug: 'feijao' } as any
  ];

  const items: BasketItemConfig[] = [
    { productName: 'Arroz', quantity: 1, unit: 'kg', isEssential: true },
    { productName: 'Feijão', quantity: 2, unit: 'kg', isEssential: true }
  ];

  test('calculates total correctly without coupon', () => {
    const result = optimizeBasket(mockCatalog, items, 'cheapest_multi');
    expect(result.total).toBe(40); // 20*1 + 10*2
  });
});

