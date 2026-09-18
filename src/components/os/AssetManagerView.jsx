import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { titankartProducts } from '../../data/titankart';

export function AssetManagerView() {
  const perks = useGameStore((s) => s.perks) || [];
  const cash = useGameStore((s) => s.cash);
  const [activeCategory, setActiveCategory] = useState('All');

  const ownedProducts = titankartProducts.filter(p => perks.includes(p.id));
  
  // Calculate total asset value
  const totalAssetValue = ownedProducts.reduce((sum, p) => sum + p.price, 0);
  const netWorth = cash + totalAssetValue;

  // Get categories from owned items
  const categories = ['All', ...new Set(ownedProducts.map(p => p.category))];
  
  const displayedAssets = activeCategory === 'All' 
    ? ownedProducts 
    : ownedProducts.filter(p => p.category === activeCategory);

  // Category breakdown for pie chart style display
  const categoryBreakdown = {};
  ownedProducts.forEach(p => {
    categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + p.price;
  });

  const categoryColors = {
    'Tools': '#f59e0b',
    'Accessories': '#8b5cf6',
    'Decor': '#ec4899',
    'Lifestyle': '#06b6d4',
    'Fashion': '#f43f5e',
    'Vehicles': '#10b981',
    'Real Estate': '#3b82f6',
    'Precious Metals': '#eab308',
    'Investments': '#22c55e',
    'Aviation': '#6366f1',
    'Collectibles': '#a855f7',
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', width: '100%', height: '100%', 
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', 
      color: 'white', overflowY: 'auto', fontFamily: "'Inter', sans-serif" 
    }}>
      
      {/* Header */}
      <div style={{ 
        padding: '25px 30px', 
        background: 'rgba(0,0,0,0.3)', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '1px' }}>
            <span style={{ color: '#f59e0b' }}>💼</span> Asset Manager
          </h1>
          <p style={{ margin: '5px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            Track your empire's wealth & holdings
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Worth</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#10b981' }}>
            ₹{netWorth.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', padding: '20px 30px' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Cash Balance</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#10b981' }}>₹{cash.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Asset Value</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#f59e0b' }}>₹{totalAssetValue.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Items Owned</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#6366f1' }}>{ownedProducts.length} / {titankartProducts.length}</div>
        </div>
        <div style={{ background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Portfolio Rank</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#ec4899' }}>
            {netWorth >= 100000000 ? '🏆 Titan' : netWorth >= 10000000 ? '💎 Mogul' : netWorth >= 1000000 ? '🥇 Millionaire' : netWorth >= 100000 ? '📈 Investor' : '🌱 Beginner'}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div style={{ padding: '0 30px 20px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Portfolio Breakdown
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(categoryBreakdown).sort((a,b) => b[1] - a[1]).map(([cat, val]) => (
              <div key={cat} style={{
                background: `${categoryColors[cat] || '#666'}22`,
                border: `1px solid ${categoryColors[cat] || '#666'}55`,
                borderRadius: '8px',
                padding: '10px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: categoryColors[cat] || '#666' }}></div>
                <div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{cat}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>₹{val.toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div style={{ padding: '0 30px', display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: activeCategory === cat ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.15)',
              background: activeCategory === cat ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
              color: activeCategory === cat ? '#f59e0b' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.15s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Asset List */}
      <div style={{ padding: '0 30px 30px', flex: 1 }}>
        {displayedAssets.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '60px 20px', 
            background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
            border: '1px dashed rgba(255,255,255,0.1)' 
          }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>📭</div>
            <h3 style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>No Assets Yet</h3>
            <p style={{ color: 'rgba(255,255,255,0.3)', margin: 0, fontSize: '13px' }}>
              Visit TitanKart 🛍️ to start building your empire!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {displayedAssets.map(asset => (
              <div key={asset.id} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                transition: 'all 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <div style={{ 
                  width: '55px', height: '55px', borderRadius: '12px',
                  background: `${categoryColors[asset.category] || '#666'}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', flexShrink: 0
                }}>
                  {asset.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '3px' }}>{asset.name}</div>
                  <div style={{ fontSize: '11px', color: categoryColors[asset.category] || '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{asset.category}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Value: ₹{asset.price.toLocaleString('en-IN')}</div>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  OWNED ✓
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
