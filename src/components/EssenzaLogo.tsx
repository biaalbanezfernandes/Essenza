import React from 'react';

interface EssenzaLogoProps {
  /** 'full' = ícone + tipografia ESSENZA + subtítulo, 'icon' = apenas o ícone 'E' */
  variant?: 'full' | 'icon';
  /** Altura desejada em pixels (padrão: 64px para full, 48px para icon) */
  height?: number;
  style?: React.CSSProperties;
  className?: string;
}

export const EssenzaLogo: React.FC<EssenzaLogoProps> = ({
  variant = 'full',
  height = 64,
  style,
  className,
}) => {
  if (variant === 'icon') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        height={height}
        style={{ height, width: 'auto', display: 'block', ...style }}
        className={className}
        aria-label="Essenza Icon"
      >
        <defs>
          <linearGradient id="purpleGoldGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
          <linearGradient id="goldLeafAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>

        {/* Outer Hexagon Framing */}
        <polygon
          points="50,6 88,28 88,72 50,94 12,72 12,28"
          fill="none"
          stroke="url(#purpleGoldGradIcon)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Modern Lettermark 'E' */}
        <path
          d="M 32,26 L 68,26 C 68,26 70,26 70,29 C 70,32 68,32 68,32 L 38,32 L 38,46 L 60,46 C 66,46 68,42 74,48 C 68,54 66,50 60,50 L 38,50 L 38,68 L 70,68 C 70,68 72,68 72,71 C 72,74 70,74 70,74 L 32,74 Z"
          fill="url(#purpleGoldGradIcon)"
        />

        {/* Stylized Center Leaf Accent */}
        <path
          d="M 40,48 C 50,40 64,44 72,48 C 64,52 50,56 40,48 Z"
          fill="url(#goldLeafAccent)"
        />
      </svg>
    );
  }

  // Full Variant (Icon + Modern Logotype + Subtitle)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 380 90"
      height={height}
      style={{ height, width: 'auto', display: 'block', ...style }}
      className={className}
      aria-label="Essenza — Moda com Propósito"
    >
      <defs>
        <linearGradient id="purpleGoldGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="40%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
        <linearGradient id="goldLeafFull" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
      </defs>

      {/* Left Symbol Mark */}
      <g transform="translate(10, 5) scale(0.8)">
        <polygon
          points="50,6 88,28 88,72 50,94 12,72 12,28"
          fill="none"
          stroke="url(#purpleGoldGradFull)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 32,26 L 68,26 C 68,26 70,26 70,29 C 70,32 68,32 68,32 L 38,32 L 38,46 L 60,46 C 66,46 68,42 74,48 C 68,54 66,50 60,50 L 38,50 L 38,68 L 70,68 C 70,68 72,68 72,71 C 72,74 70,74 70,74 L 32,74 Z"
          fill="url(#purpleGoldGradFull)"
        />
        <path
          d="M 40,48 C 50,40 64,44 72,48 C 64,52 50,56 40,48 Z"
          fill="url(#goldLeafFull)"
        />
      </g>

      {/* Logotype Text "ESSENZA" */}
      <text
        x="105"
        y="50"
        fill="url(#purpleGoldGradFull)"
        fontSize="44"
        fontWeight="800"
        fontFamily="Outfit, 'Inter', sans-serif"
        letterSpacing="7"
      >
        ESSENZA
      </text>

      {/* Elegant Subtitle "MODA COM PROPÓSITO" */}
      <text
        x="108"
        y="70"
        fill="#9ca3af"
        fontSize="10"
        fontWeight="600"
        fontFamily="'Inter', sans-serif"
        letterSpacing="4"
      >
        MODA COM PROPÓSITO
      </text>

      {/* Decorative Gold Underline Accent */}
      <line
        x1="108"
        y1="76"
        x2="340"
        y2="76"
        stroke="url(#goldLeafFull)"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default EssenzaLogo;
