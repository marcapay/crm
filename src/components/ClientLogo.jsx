import React, { useState } from 'react';

export default function ClientLogo({ height = 52, theme = 'dark' }) {
  const [imgError, setImgError] = useState(false);
  const logoHeight = Math.max(height * 1.5, 68);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', userSelect: 'none' }}>
      {!imgError ? (
        <img 
          src="/araujo-logo.png?v=4" 
          alt="Araújo Imóveis Logo" 
          onError={() => setImgError(true)}
          style={{ 
            height: `${logoHeight}px`, 
            width: 'auto', 
            maxHeight: '95px',
            maxWidth: '100%',
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto',
            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))',
            flexShrink: 0
          }} 
        />
      ) : (
        /* Crisp Vector Penrose Triangle Geometric Icon Fallback */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
          <svg 
            width={height + 12} 
            height={height + 12} 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path d="M50 10 L85 75 L65 75 L50 45 L35 75 L15 75 Z" fill="#38bdf8" />
            <path d="M50 25 L75 70 L25 70 Z" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontWeight: '800', fontSize: '16px', color: theme === 'dark' ? '#ffffff' : '#0f172a' }}>
              ARAÚJO IMÓVEIS
            </span>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600' }}>
              Credibilidade começa no nome
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
