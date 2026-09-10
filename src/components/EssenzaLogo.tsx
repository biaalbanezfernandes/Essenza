import React from 'react';
import logoFullImg from '../assets/essenza_logo.jpg';
import logoIconImg from '../assets/essenza_icon.png';

interface EssenzaLogoProps {
  /** 'full' = logo completa (E + ESSENZA + MODA COM PROPÓSITO), 'icon' = só o ícone do E */
  variant?: 'full' | 'icon';
  /** Altura da imagem em px */
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
  const src = variant === 'icon' ? logoIconImg : logoFullImg;

  return (
    <img
      src={src}
      alt="Essenza — Moda com Propósito"
      className={className}
      style={{
        height,
        width: 'auto',
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
    />
  );
};

export default EssenzaLogo;
