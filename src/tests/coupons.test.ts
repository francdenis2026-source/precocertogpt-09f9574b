import { optimizeBasket, type BasketItemConfig, type OptimizationMode } from '../lib/smartBasket';
import { type Product } from '../data/catalog';

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

  // Note: Coupon logic currently resides in PrecoCertoApp.tsx component state
  // This test file serves as a foundation for future library-side coupon logic
});
