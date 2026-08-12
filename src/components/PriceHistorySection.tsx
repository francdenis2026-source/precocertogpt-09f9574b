import React, { useState, useEffect } from 'react';
import { money } from '../lib/pricing';
import { Product } from '../data/catalog';
import { Clock3, TrendingDown, TrendingUp, LineChart } from 'lucide-react';

interface PriceHistorySectionProps {
  product: Product;
}

export const PriceHistorySection: React.FC<PriceHistorySectionProps> = ({ product }) => {
  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
      <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Histórico de Variação</h4>
      {product.price_history && product.price_history.length > 1 ? (
        <div className="real-price-history">
          {product.price_history.slice(-8).map((record: any, index: number, records: any[]) => {
            const previous = records[index - 1];
            const variation = previous ? ((record.value - previous.value) / previous.value) * 100 : 0;
            return (
              <div key={`${record.date}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-soft)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                  <Clock3 size={14}/>
                  {new Date(record.date).toLocaleDateString("pt-BR")}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <strong style={{ fontSize: '1rem' }}>{money(record.value)}</strong>
                  {index > 0 && (
                    <em style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: variation <= 0 ? 'var(--green)' : 'var(--red)', 
                      fontStyle: 'normal', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '2px' 
                    }}>
                      {variation <= 0 ? <TrendingDown size={12}/> : <TrendingUp size={12}/>}
                      {Math.abs(variation).toFixed(1)}%
                    </em>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="history-unavailable" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '1.5rem', 
          background: 'var(--surface-2)', 
          borderRadius: '12px', 
          color: 'var(--muted)' 
        }}>
          <LineChart/>
          <span>
            <b>Histórico ainda insuficiente</b>
            <br/>
            <small>Exibiremos a evolução assim que houver pelo menos duas coletas verificadas.</small>
          </span>
        </div>
      )}
    </div>
  );
};
