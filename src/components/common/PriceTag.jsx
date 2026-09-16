import React from 'react';
import { formatCurrency } from '../../utils/currency';
import { useSiteStore } from '../../store/siteStore';
import './PriceTag.css';

export function PriceTag({ inrPrice, discountPercent, change24h, size = 'medium', showChange = true }) {
  const currency = useSiteStore((s) => s.currency);
  const formatted = formatCurrency(inrPrice, currency);

  return (
    <div className={`price-tag-wrapper price-tag-${size}`}>
      <div className="price-tag-main">
        <span className="price-amount">{formatted}</span>
        {discountPercent > 0 && (
          <span className="price-discount-badge">-{discountPercent}%</span>
        )}
      </div>

      {showChange && change24h !== undefined && change24h !== null && (
        <div className={`price-change-pill ${change24h < 0 ? 'change-down' : change24h > 0 ? 'change-up' : 'change-flat'}`}>
          {change24h < 0 ? '▼' : change24h > 0 ? '▲' : '•'} {Math.abs(change24h)}%
        </div>
      )}
    </div>
  );
}
