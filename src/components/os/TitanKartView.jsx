import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { titankartProducts } from '../../data/titankart';
import { soundFx } from '../../utils/audio';

export function TitanKartView() {
  const cash = useGameStore((s) => s.cash);
  const shopLevel = useGameStore((s) => s.shopLevel);
  const perks = useGameStore((s) => s.perks) || [];
  const buyPerk = useGameStore((s) => s.buyPerk);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Generate stable ratings per product (avoids flickering from Math.random in render)
  const productRatings = useMemo(() => {
    const ratings = {};
    titankartProducts.forEach(p => {
      // Simple hash from product id to generate a stable decimal
      let hash = 0;
      for (let i = 0; i < p.id.length; i++) {
        hash = ((hash << 5) - hash) + p.id.charCodeAt(i);
        hash |= 0;
      }
      ratings[p.id] = (4 + (Math.abs(hash) % 10) / 10).toFixed(1);
    });
    return ratings;
  }, []);

  const handleBuy = (product) => {
    if (shopLevel < product.unlockLevel) {
      soundFx.playWarning();
      alert(`This item unlocks at Shop Level ${product.unlockLevel}! Keep growing your business.`);
      return;
    }

    if (window.confirm(`Are you sure you want to buy ${product.name} for ₹${product.price.toLocaleString('en-IN')}?`)) {
      buyPerk(product);
    }
  };

  const allCategories = ['All', ...new Set(titankartProducts.map(p => p.category))];

  const filteredProducts = titankartProducts.filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#f1f3f6', overflowY: 'auto' }}>
      
      {/* Top Navbar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '10px 30px', 
        background: '#2874f0', 
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', fontStyle: 'italic', letterSpacing: '1px' }}>
            TitanKart
          </span>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search for tools, lifestyle, luxury and more" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '400px', padding: '8px 12px', borderRadius: '2px', border: 'none', outline: 'none', fontSize: '14px', color: '#000' }}
            />
            <span style={{ position: 'absolute', right: '10px', top: '7px', color: '#2874f0', cursor: 'pointer' }}>🔍</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '15px', fontWeight: '500' }}>
          <span style={{ cursor: 'pointer' }}>Titan Plus</span>
          <span style={{ cursor: 'pointer' }}>Become a Seller</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '20px' }}>🛒</span> Cart
          </div>
          <div style={{ background: 'white', color: '#2874f0', padding: '5px 20px', borderRadius: '2px', fontWeight: 'bold' }}>
            Wallet: ₹{cash.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* Banner */}
        <div style={{ 
          background: 'linear-gradient(90deg, #ff9900 0%, #ff5500 100%)', 
          borderRadius: '4px', 
          padding: '20px 30px',
          color: 'white',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>The Titan Big Billion Sale!</h2>
            <p style={{ margin: 0, fontSize: '16px' }}>Unlock exclusive perks to boost your PC building empire.</p>
          </div>
          <div style={{ fontSize: '50px' }}>🛍️</div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', padding: '0 5px' }}>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 18px',
                borderRadius: '20px',
                border: activeCategory === cat ? '2px solid #2874f0' : '1px solid #ddd',
                background: activeCategory === cat ? '#e3f0ff' : 'white',
                color: activeCategory === cat ? '#2874f0' : '#333',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeCategory === cat ? '700' : '500',
                transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredProducts.map(product => {
            const isLocked = shopLevel < product.unlockLevel;

            return (
              <div key={product.id} style={{ 
                background: 'white', 
                borderRadius: '4px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                opacity: isLocked ? 0.7 : 1,
                filter: isLocked ? 'grayscale(0.5)' : 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; }}
              >
                
                {/* Product Image / Icon */}
                <div style={{ 
                  height: '140px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '80px',
                  background: '#f8f9fa',
                  borderRadius: '4px',
                  marginBottom: '15px'
                }}>
                  {product.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#878787', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {product.category}
                  </div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#212121', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                  </h3>
                  <div style={{ fontSize: '14px', color: '#388e3c', fontWeight: 'bold', marginBottom: '10px' }}>
                    ★ {productRatings[product.id] || '4.5'} / 5
                  </div>
                  <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#555', lineHeight: '1.4' }}>
                    {product.description}
                  </p>
                </div>

                {/* Price and Action */}
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#212121' }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </div>
                    {perks.filter(id => id === product.id).length > 0 && (
                      <span style={{ fontSize: '12px', background: '#e0e0e0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        Owned: {perks.filter(id => id === product.id).length}
                      </span>
                    )}
                  </div>
                  
                    {isLocked ? (
                      <button style={{ 
                        width: '100%', padding: '12px', background: '#ffe0e0', color: '#d32f2f', 
                        border: '1px solid #d32f2f', borderRadius: '2px', fontWeight: 'bold', fontSize: '15px', cursor: 'not-allowed' 
                      }} disabled>
                        UNLOCKS AT LEVEL {product.unlockLevel}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBuy(product)}
                        style={{ 
                          width: '100%', padding: '12px', background: '#ff9f00', color: 'white', 
                          border: 'none', borderRadius: '2px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }}
                      >
                        BUY NOW
                      </button>
                    )}
                </div>
                
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
