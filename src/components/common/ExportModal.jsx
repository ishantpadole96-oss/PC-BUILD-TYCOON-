import React, { useState } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { formatCurrency } from '../../utils/currency';
import { CATEGORIES } from '../../data/index';
import './ExportModal.css';

export function ExportModal() {
  const isOpen = useSiteStore((s) => s.exportModalOpen);
  const setOpen = useSiteStore((s) => s.setExportModalOpen);
  const currentBuild = useSiteStore((s) => s.currentBuild);
  const market = useSiteStore((s) => s.market);
  const currency = useSiteStore((s) => s.currency);

  const [exportFormat, setExportFormat] = useState('reddit');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const buildItems = CATEGORIES.map(cat => ({
    category: cat.label,
    component: currentBuild[cat.key],
    price: currentBuild[cat.key] 
      ? (market.prices[currentBuild[cat.key].id]?.currentPrice || currentBuild[cat.key].basePrice)
      : 0,
    merchant: currentBuild[cat.key]
      ? (market.prices[currentBuild[cat.key].id]?.bestMerchant || 'Amazon')
      : '—',
  })).filter(item => item.component);

  const totalPrice = buildItems.reduce((sum, item) => sum + item.price, 0);

  let formattedOutput = '';

  if (exportFormat === 'reddit') {
    formattedOutput = [
      `[PCPartPulse Part List](${window.location.origin})`,
      '',
      'Type|Item|Price|Merchant',
      ':----|:----|:----|:----',
      ...buildItems.map(item => `**${item.category}** | ${item.component.brand} ${item.component.model} | ${formatCurrency(item.price, currency)} | ${item.merchant}`),
      `**Total** | | **${formatCurrency(totalPrice, currency)}** |`,
      '',
      `*Generated dynamically by PCPartPulse Live Hardware Platform*`,
    ].join('\n');
  } else if (exportFormat === 'text') {
    formattedOutput = [
      `=== PCPartPulse System Configuration ===`,
      `Total Cost: ${formatCurrency(totalPrice, currency)} (${currency})`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      ...buildItems.map(item => `${item.category.padEnd(14)}: ${item.component.brand} ${item.component.model} - ${formatCurrency(item.price, currency)} (${item.merchant})`),
      '',
      `Live Hardware Market: ${window.location.origin}`,
    ].join('\n');
  } else if (exportFormat === 'json') {
    const jsonObj = {
      generatedAt: new Date().toISOString(),
      totalPriceFormatted: formatCurrency(totalPrice, currency),
      currency,
      parts: buildItems.map(item => ({
        category: item.category,
        brand: item.component.brand,
        model: item.component.model,
        priceINR: item.price,
        merchant: item.merchant,
      })),
    };
    formattedOutput = JSON.stringify(jsonObj, null, 2);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-category-chip">EXPORT SPECIFICATION</span>
            <h2 className="modal-component-name">Share & Export PC Build</h2>
          </div>
          <button className="modal-close-btn" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="modal-body">
          <div className="format-selector">
            <button
              className={`format-btn ${exportFormat === 'reddit' ? 'active' : ''}`}
              onClick={() => setExportFormat('reddit')}
            >
              Reddit Markdown (r/buildapc)
            </button>
            <button
              className={`format-btn ${exportFormat === 'text' ? 'active' : ''}`}
              onClick={() => setExportFormat('text')}
            >
              Plain Text
            </button>
            <button
              className={`format-btn ${exportFormat === 'json' ? 'active' : ''}`}
              onClick={() => setExportFormat('json')}
            >
              JSON Data
            </button>
          </div>

          <div className="export-textarea-wrapper">
            <textarea
              readOnly
              value={formattedOutput || 'No components selected in the build yet.'}
              className="export-textarea"
              rows={12}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setOpen(false)}>Close</button>
          <button className="btn-primary" onClick={handleCopy}>
            {copied ? '✓ Copied to Clipboard!' : '📋 Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
