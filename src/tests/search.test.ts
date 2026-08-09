
import { describe, it, expect } from 'vitest';

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

describe('Normalização de Busca', () => {
  it('deve normalizar acentos corretamente', () => {
    expect(normalize('Maçã')).toBe('maca');
    expect(normalize('Café')).toBe('cafe');
    expect(normalize('Arroz Tio João')).toBe('arroz tio joao');
  });

  it('deve lidar com espaços extras', () => {
    expect(normalize('  Arroz  ')).toBe('arroz');
  });
});

describe('Lógica de Filtro', () => {
  const products = [
    { name: 'Arroz Tio João', barcode: '123456789' },
    { name: 'Feijão Kicaldo', barcode: '987654321' },
    { name: 'Maçã Argentina', barcode: '11223344' }
  ];

  it('deve encontrar produto por nome parcial com acento', () => {
    const query = normalize('maca');
    const filtered = products.filter(p => normalize(p.name).includes(query));
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Maçã Argentina');
  });

  it('deve encontrar produto por barcode', () => {
    const query = '123456789';
    const filtered = products.filter(p => p.barcode === query || normalize(p.name).includes(normalize(query)));
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Arroz Tio João');
  });
});
