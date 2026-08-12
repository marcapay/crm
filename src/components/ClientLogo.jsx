import React from 'react';

export default function ClientLogo({ height = 36, showSubtitles = true, theme = 'dark' }) {
  const textColor = theme === 'dark' ? '#ffffff' : '#111827';
  const clientName = import.meta.env.VITE_CLIENT_NAME || 'CRM Base';
  const clientSubtitle = import.meta.env.VITE_CLIENT_SUBTITLE || 'Gestão Inteligente';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', userSelect: 'none' }}>
      {/* Premium Generic CRM Logo (Interconnected Nodes/Users) */}
      <svg 
        width={height} 
        height={height} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="100%" stopColor="var(--accent-secondary)" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#logo-grad)" />
        <path d="M16 17v-1.5a2.5 2.5 0 0 0-2.5-2.5h-3A2.5 2.5 0 0 0 8 15.5V17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="8.5" r="2.5" fill="#ffffff" />
      </svg>
      
      {showSubtitles && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ 
            fontFamily: 'Outfit, sans-serif', 
            fontWeight: '800', 
            fontSize: height * 0.48, 
            lineHeight: '1.1', 
            color: textColor,
            letterSpacing: '0.02em'
          }}>
            {clientName}
          </div>
          <div style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontSize: height * 0.22, 
            fontStyle: 'italic', 
            fontWeight: '600', 
            color: 'var(--accent-primary)',
            lineHeight: '1.2',
            marginTop: '2px',
            whiteSpace: 'nowrap',
            opacity: 0.85
          }}>
            {clientSubtitle}
          </div>
        </div>
      )}
    </div>
  );
}
