// Market Simulation Engine
// Simulates live dynamic prices, retailer offers (Amazon, Newegg, Best Buy, Micro Center, B&H),
// price fluctuations, stock status, 7-day price history, and market breaking news.

import { ALL_COMPONENTS } from '../data/index';

export const RETAILER_NAMES = ['Amazon', 'Newegg', 'Best Buy', 'Micro Center', 'B&H Photo'];

export const MARKET_EVENTS = [
  {
    id: 'crypto_surge',
    title: '🚀 AI & Crypto Compute Surge',
    description: 'Datacenter demand for high-VRAM GPUs surges globally. Retail GPU pricing rises by 10-18%.',
    affectedCategory: 'gpu',
    priceMultiplier: 1.15,
    durationTicks: 5,
  },
  {
    id: 'ram_oversupply',
    title: '📉 DRAM Surplus Floods Channels',
    description: 'Semiconductor manufacturers report excess inventory. High-speed DDR5 prices drop by 12-18%.',
    affectedCategory: 'ram',
    priceMultiplier: 0.85,
    durationTicks: 6,
  },
  {
    id: 'festive_sale',
    title: '🎉 Mega Tech Hardware Deals Week',
    description: 'E-tailers unlock limited-time bundle promotions across CPUs and Motherboards.',
    affectedCategory: 'cpu',
    priceMultiplier: 0.88,
    durationTicks: 4,
  },
  {
    id: 'storage_nand_shortage',
    title: '⚡ NAND Flash Fab Supply Constraint',
    description: 'Silicon wafer manufacturing adjustments constrain Gen4/Gen5 NVMe SSD inventory.',
    affectedCategory: 'storage',
    priceMultiplier: 1.16,
    durationTicks: 4,
  },
  {
    id: 'spring_clearance',
    title: '🏷️ Case & Power Supply Clearance',
    description: 'Vendors discount popular airflow cases and 750W-850W Gold PSUs.',
    affectedCategory: 'psu',
    priceMultiplier: 0.90,
    durationTicks: 5,
  },
];

/**
 * Generate retailer offers for a component given its base price
 */
function generateRetailers(basePrice, currentBestPrice) {
  return [
    {
      name: 'Amazon',
      price: Math.round(currentBestPrice * (1 + (Math.random() * 0.04 - 0.01))),
      inStock: Math.random() > 0.04,
      shipping: 'Free 1-Day Prime',
      badge: 'Best Seller',
      url: 'https://www.amazon.com',
    },
    {
      name: 'Newegg',
      price: Math.round(currentBestPrice * (1 + (Math.random() * 0.05 - 0.01))),
      inStock: Math.random() > 0.06,
      shipping: 'Free 3-Day Shipping',
      badge: 'EggPoints',
      url: 'https://www.newegg.com',
    },
    {
      name: 'Best Buy',
      price: Math.round(currentBestPrice * (1 + (Math.random() * 0.06 - 0.02))),
      inStock: Math.random() > 0.08,
      shipping: 'Free In-Store Pickup Today',
      badge: 'Price Match',
      url: 'https://www.bestbuy.com',
    },
    {
      name: 'Micro Center',
      price: Math.round(currentBestPrice * (0.96 + Math.random() * 0.03)),
      inStock: Math.random() > 0.12,
      shipping: 'In-Store Pickup Deal',
      badge: 'Lowest Price',
      url: 'https://www.microcenter.com',
    },
    {
      name: 'B&H Photo',
      price: Math.round(currentBestPrice * (1 + (Math.random() * 0.04))),
      inStock: Math.random() > 0.07,
      shipping: 'Free 2-Day Shipping',
      badge: 'Authorized Dealer',
      url: 'https://www.bhphotovideo.com',
    },
  ];
}

/**
 * Initialize dynamic market state with all components, price history, and retailer quotes
 */
export function initializeMarket() {
  const prices = {};
  const history = {};
  const alerts = [
    { id: 1, type: 'info', text: 'Live Hardware Market initialized. Tracking live vendor pricing across Amazon, Newegg, Best Buy, and Micro Center.', time: 'Just now' },
    { id: 2, type: 'deal', text: '🔥 Flash Deal: Several DDR5 RAM kits and Gen4 NVMe drives are currently at 30-day price lows!', time: '1m ago' },
  ];

  Object.entries(ALL_COMPONENTS).forEach(([category, list]) => {
    list.forEach(item => {
      const base = item.basePrice;
      const historyPoints = [];
      let walk = base;

      for (let d = 7; d >= 1; d--) {
        const delta = (Math.random() - 0.5) * 0.07 * base;
        walk = Math.round(Math.max(base * 0.75, Math.min(base * 1.35, walk + delta)));
        historyPoints.push(walk);
      }

      const currentPrice = historyPoints[historyPoints.length - 1];
      const prevPrice = historyPoints[historyPoints.length - 2];
      const change24h = Math.round(((currentPrice - prevPrice) / prevPrice) * 1000) / 10;
      const flashDeal = Math.random() < 0.12 ? Math.floor(6 + Math.random() * 12) : 0;
      const finalPrice = flashDeal > 0 ? Math.round(currentPrice * (1 - flashDeal / 100)) : currentPrice;

      const retailers = generateRetailers(base, finalPrice);
      const inStockRetailers = retailers.filter(r => r.inStock);
      const lowestMerchant = inStockRetailers.length > 0 
        ? inStockRetailers.reduce((min, r) => (r.price < min.price ? r : min), inStockRetailers[0])
        : retailers[0];

      prices[item.id] = {
        id: item.id,
        category,
        model: item.model,
        brand: item.brand,
        basePrice: base,
        currentPrice: lowestMerchant.price,
        previousPrice: prevPrice,
        change24h,
        discountPercent: flashDeal,
        inStock: true,
        stockStatus: Math.random() > 0.15 ? 'in_stock' : (Math.random() > 0.5 ? 'low_stock' : 'out_of_stock'),
        retailers,
        bestMerchant: lowestMerchant.name,
        lowestPriceRecorded: Math.min(...historyPoints, lowestMerchant.price),
        highestPriceRecorded: Math.max(...historyPoints, lowestMerchant.price),
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      history[item.id] = [...historyPoints, lowestMerchant.price];
    });
  });

  return {
    prices,
    history,
    alerts,
    activeEvent: null,
    eventTicksRemaining: 0,
    marketTickCount: 1,
    lastMarketUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

/**
 * Ticks the market forward: dynamically changes component prices, refreshes merchant quotes,
 * updates 7-day history arrays, triggers flash deals and market alerts.
 */
export function tickMarket(currentMarket) {
  const newPrices = { ...currentMarket.prices };
  const newHistory = { ...currentMarket.history };
  const newAlerts = [...(currentMarket.alerts || [])];
  let activeEvent = currentMarket.activeEvent;
  let eventTicksRemaining = currentMarket.eventTicksRemaining || 0;

  if (eventTicksRemaining > 0) {
    eventTicksRemaining--;
    if (eventTicksRemaining <= 0) {
      newAlerts.unshift({
        id: Date.now(),
        type: 'info',
        text: `Market Event Ended: "${activeEvent.title}" condition has normalized.`,
        time: 'Just now',
      });
      activeEvent = null;
    }
  }

  if (!activeEvent && Math.random() < 0.25) {
    activeEvent = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
    eventTicksRemaining = activeEvent.durationTicks;
    newAlerts.unshift({
      id: Date.now(),
      type: 'event',
      text: `${activeEvent.title}: ${activeEvent.description}`,
      time: 'Just now',
    });
  }

  let notableDeals = [];

  Object.entries(ALL_COMPONENTS).forEach(([category, list]) => {
    list.forEach(item => {
      const pData = newPrices[item.id];
      if (!pData) return;

      let targetBase = pData.basePrice;
      if (activeEvent && activeEvent.affectedCategory === category) {
        targetBase = Math.round(targetBase * activeEvent.priceMultiplier);
      }

      const drift = (targetBase - pData.currentPrice) * 0.12;
      const noise = (Math.random() - 0.49) * 0.05 * targetBase;
      const calculatedPrice = Math.round(Math.max(pData.basePrice * 0.70, Math.min(pData.basePrice * 1.45, pData.currentPrice + drift + noise)));

      const flashDeal = Math.random() < 0.09 ? Math.floor(7 + Math.random() * 12) : 0;
      const finalTarget = flashDeal > 0 ? Math.round(calculatedPrice * (1 - flashDeal / 100)) : calculatedPrice;

      const retailers = generateRetailers(pData.basePrice, finalTarget);
      const inStockRetailers = retailers.filter(r => r.inStock);
      const lowestMerchant = inStockRetailers.length > 0 
        ? inStockRetailers.reduce((min, r) => (r.price < min.price ? r : min), inStockRetailers[0])
        : retailers[0];

      const oldPrice = pData.currentPrice;
      const change24h = Math.round(((lowestMerchant.price - oldPrice) / oldPrice) * 1000) / 10;

      if (change24h <= -4.5 && notableDeals.length < 2) {
        notableDeals.push({
          name: item.model,
          drop: Math.abs(change24h),
          merchant: lowestMerchant.name,
        });
      }

      newPrices[item.id] = {
        ...pData,
        currentPrice: lowestMerchant.price,
        previousPrice: oldPrice,
        change24h,
        discountPercent: flashDeal,
        retailers,
        bestMerchant: lowestMerchant.name,
        stockStatus: Math.random() > 0.12 ? 'in_stock' : (Math.random() > 0.4 ? 'low_stock' : 'out_of_stock'),
        lowestPriceRecorded: Math.min(pData.lowestPriceRecorded || lowestMerchant.price, lowestMerchant.price),
        highestPriceRecorded: Math.max(pData.highestPriceRecorded || lowestMerchant.price, lowestMerchant.price),
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const hist = [...(newHistory[item.id] || [pData.basePrice])];
      hist.push(lowestMerchant.price);
      if (hist.length > 10) hist.shift();
      newHistory[item.id] = hist;
    });
  });

  if (notableDeals.length > 0) {
    const deal = notableDeals[0];
    newAlerts.unshift({
      id: Date.now() + 1,
      type: 'deal',
      text: `⚡ Price Drop Alert: ${deal.name} dropped ${deal.drop}% on ${deal.merchant}!`,
      time: 'Just now',
    });
  }

  if (newAlerts.length > 12) newAlerts.length = 12;

  return {
    prices: newPrices,
    history: newHistory,
    alerts: newAlerts,
    activeEvent,
    eventTicksRemaining,
    marketTickCount: (currentMarket.marketTickCount || 1) + 1,
    lastMarketUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

// Export alias for advanceMarketDay
export const advanceMarketDay = tickMarket;
