import React, { useState } from 'react';

export default function ClientLogo({ height = 36, theme = 'dark' }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none' }}>
      {!imgError ? (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          padding: '5px 12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          flexShrink: 0
        }}>
          <img 
            src="/araujo-logo.png?v=2" 
            alt="Araújo Imóveis Logo" 
            onError={() => setImgError(true)}
            style={{ 
              height: `${height + 6}px`, 
              width: 'auto', 
              maxHeight: '52px',
              objectFit: 'contain',
              display: 'block'
            }} 
          />
        </div>
      ) : (
        /* Crisp Vector Penrose Triangle Geometric Icon Fallback */
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg 
            width={height + 4} 
            height={height + 4} 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path d="M50 10 L85 75 L65 75 L50 45 L35 75 L15 75 Z" fill="#0000cc" />
            <path d="M50 25 L75 70 L25 70 Z" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '800', fontSize: '14px', color: theme === 'dark' ? '#ffffff' : '#0f172a' }}>
              ARAÚJO IMÓVEIS
            </span>
            <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '600' }}>
              Credibilidade começa no nome
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
