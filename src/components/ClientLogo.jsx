import React from 'react';

export default function ClientLogo({ height = 36, showSubtitles = true, theme = 'dark' }) {
  const textColor = theme === 'dark' ? '#ffffff' : '#111827';
  const arrowColor = '#f29b11'; // Orange from logo
  const skyBlueColor = '#1fb5e4'; // Sky blue from logo
  const slateGrayColor = '#596a7d'; // Medium slate from logo
  const darkSlateColor = '#1b2938'; // Dark slate from logo

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}>
      {/* SVG Icon of the ascending bars and orange arrow */}
      <svg 
        width={height * 1.15} 
        height={height} 
        viewBox="0 0 110 95" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Ascending columns */}
        {/* Bars 1 to 5 (slate grey/blue) */}
        <rect x="3" y="76" width="5.5" height="15" rx="1" fill={slateGrayColor} />
        <rect x="12" y="68" width="5.5" height="23" rx="1" fill={slateGrayColor} />
        <rect x="21" y="60" width="5.5" height="31" rx="1" fill={slateGrayColor} />
        <rect x="30" y="50" width="5.5" height="41" rx="1" fill={slateGrayColor} />
        <rect x="39" y="40" width="5.5" height="51" rx="1" fill={slateGrayColor} />
        
        {/* Bars 6 & 7 (bright sky blue) */}
        <rect x="48" y="28" width="5.5" height="63" rx="1" fill={skyBlueColor} />
        <rect x="57" y="17" width="5.5" height="74" rx="1" fill={skyBlueColor} />
        
        {/* Bars 8 & 9 (dark slate blue) */}
        <rect x="66" y="8" width="5.5" height="83" rx="1" fill={darkSlateColor} stroke={skyBlueColor} strokeWidth="0.5" />
        <rect x="75" y="0" width="5.5" height="91" rx="1" fill={darkSlateColor} stroke={skyBlueColor} strokeWidth="0.5" />
        
        {/* Curved Orange Arrow */}
        <path 
          d="M 1 82 C 10 70, 20 54, 34 40 C 48 27, 62 18, 72 11" 
          fill="none" 
          stroke={arrowColor} 
          strokeWidth="3.2" 
          strokeLinecap="round"
        />
        {/* Arrowhead */}
        <path 
          d="M 64 12 L 73 10 L 71 19" 
          fill="none" 
          stroke={arrowColor} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      
      {showSubtitles && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ 
            fontFamily: 'Outfit, sans-serif', 
            fontWeight: '800', 
            fontSize: height * 0.48, 
            lineHeight: '1', 
            color: textColor,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center'
          }}>
            ANÁLI<span style={{ color: arrowColor }}>$</span>E
          </div>
          <div style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontSize: height * 0.22, 
            fontStyle: 'italic', 
            fontWeight: '600', 
            color: skyBlueColor,
            lineHeight: '1.3',
            marginTop: '1px',
            whiteSpace: 'nowrap'
          }}>
            Contabilidade & Consultoria
          </div>
        </div>
      )}
    </div>
  );
}
