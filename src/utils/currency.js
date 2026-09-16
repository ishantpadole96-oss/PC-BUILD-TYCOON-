// Currency and Formatting Utility
// Converts prices between INR (base), USD, EUR, and GBP

export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', rateFromINR: 1, label: 'INR (₹)' },
  USD: { code: 'USD', symbol: '$', rateFromINR: 1 / 84.5, label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rateFromINR: 1 / 92.0, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rateFromINR: 1 / 108.0, label: 'GBP (£)' },
};

/**
 * Format an INR base price into chosen currency string
 */
export function formatCurrency(inrAmount, currencyCode = 'USD') {
  if (inrAmount === null || inrAmount === undefined) return '—';
  
  const curr = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = inrAmount * curr.rateFromINR;

  if (curr.code === 'INR') {
    return `₹${Math.round(converted).toLocaleString('en-IN')}`;
  }

  return `${curr.symbol}${Math.round(converted).toLocaleString('en-US')}`;
}

/**
 * Return raw numerical value in selected currency
 */
export function convertAmount(inrAmount, currencyCode = 'USD') {
  if (!inrAmount) return 0;
  const curr = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return Math.round(inrAmount * curr.rateFromINR);
}
