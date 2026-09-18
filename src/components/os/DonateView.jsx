import React from 'react';

export function DonateView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center', color: 'white' }}>
      <h2 style={{ color: '#fbbf24', marginBottom: '2rem', fontSize: '2rem' }}>Support the Developer</h2>
      
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'inline-block' }}>
        <img 
          src="/donate-qr.jpg" 
          alt="Donate QR Code" 
          style={{ width: '300px', height: '300px', objectFit: 'contain', display: 'block' }} 
        />
      </div>
      
      <h1 style={{ marginTop: '2rem', fontSize: '3rem', letterSpacing: '4px', textShadow: '0 0 10px rgba(251, 191, 36, 0.5)' }}>
        THANK YOU
      </h1>
      <p style={{ marginTop: '1rem', color: '#94a3b8', maxWidth: '500px' }}>
        Your donations help keep the TITAN OS servers running and fund future updates for PC Builder Tycoon!
      </p>
    </div>
  );
}
