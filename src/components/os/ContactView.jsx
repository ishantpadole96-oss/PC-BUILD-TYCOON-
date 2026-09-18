import React from 'react';

export function ContactView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center', color: 'white' }}>
      <h2 style={{ color: '#d946ef', marginBottom: '2rem', fontSize: '2rem' }}>Contact Developer</h2>
      
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'inline-block' }}>
        <img 
          src="/instagram-qr.png" 
          alt="Instagram QR Code" 
          style={{ width: '300px', height: '300px', objectFit: 'contain', display: 'block' }} 
        />
      </div>
      
      <h1 style={{ marginTop: '2rem', fontSize: '2.5rem', fontWeight: '800' }}>
        <span style={{ background: '-webkit-linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ISHANT VISHNU PADOLE
        </span>
      </h1>
      
      <p style={{ marginTop: '1rem', color: '#94a3b8', maxWidth: '500px', fontSize: '1.1rem' }}>
        Scan the QR code to follow me on Instagram for more updates and behind-the-scenes development!
      </p>
      
      <a 
        href="https://www.instagram.com/ishant_padole/" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          marginTop: '2rem', 
          display: 'inline-block', 
          padding: '0.8rem 2rem', 
          background: 'linear-gradient(45deg, #f09433, #bc1888)', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '30px',
          fontWeight: 'bold',
          transition: 'transform 0.2s'
        }}
      >
        Open Instagram
      </a>
    </div>
  );
}
