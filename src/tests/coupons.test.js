import { optimizeBasket } from '../lib/smartBasket';

const describe = (name, fn) => { console.log(`Running test suite: ${name}`); fn(); };
const test = (name, fn) => { console.log(`Running test: ${name}`); fn(); };
const expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) throw new Error(`Expected ${expected}, but got ${actual}`);
  }
});

describe('Smart Basket Coupons', () => {
  const mockCatalog = [
    { id: 1, name: 'Arroz', minPrice: 20, avgPrice: 25, establishment: 'Mercado A', neighborhood: 'Centro', category: 'Alimentos', slug: 'arroz', size: '1kg', unit: 'kg' },
    { id: 2, name: 'Feijão', minPrice: 10, avgPrice: 12, establishment: 'Mercado A', neighborhood: 'Centro', category: 'Alimentos', slug: 'feijao', size: '1kg', unit: 'kg' }
  ];

  const items = [
    { productName: 'Arroz', quantity: 1, unit: 'kg', isEssential: true },
    { productName: 'Feijão', quantity: 2, unit: 'kg', isEssential: true }
  ];

  test('calculates total correctly without coupon', () => {
    const result = optimizeBasket(mockCatalog, items, 'cheapest_multi');
    expect(result.total).toBe(40); // 20*1 + 10*2
  });
});
