import React from 'react';

export const FuturisticBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        background: '#030107',
      }}
    >
      {/* Deep Ultra-Dark Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, #100420 0%, #050209 60%, #020104 100%)',
        }}
      />

      {/* Very Subtle Deep Purple Radial Light Accent */}
      <div
        style={{
          position: 'absolute',
          top: '-25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1200px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(126, 34, 206, 0.08) 0%, rgba(60, 15, 100, 0.02) 50%, transparent 80%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Executive Micro-Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(126, 34, 206, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(126, 34, 206, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(circle at 50% 25%, black 15%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 25%, black 15%, transparent 75%)',
          opacity: 0.5,
        }}
      />
    </div>
  );
};
