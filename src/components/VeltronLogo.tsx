import React from 'react';

interface VeltronLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

export const VeltronLogo: React.FC<VeltronLogoProps> = ({
  size = 'md',
  className = '',
  animated = false,
}) => {
  const logoDimensions = {
    sm: 'h-8 max-w-[140px]',
    md: 'h-14 max-w-[200px]',
    lg: 'h-20 max-w-[260px]',
    xl: 'h-28 max-w-[320px]',
    hero: 'h-44 sm:h-52 max-w-[280px] sm:max-w-[320px]',
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${animated ? 'animate-logo-float' : ''} ${className}`}>
      {/* Ambient tactical energy glow - completely separated behind the image so it never blurs the logo */}
      {animated && (
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-[#8E8C3A]/30 blur-3xl rounded-full -z-10 pointer-events-none animate-glow-pulse" />
      )}

      {/* Main Logo Image - Ultra Sharp Vector-like rendering */}
      <img
        src="/veltron-logo.webp"
        alt="Veltron Training Club"
        className={`${logoDimensions[size]} w-auto object-contain brightness-0 invert relative z-10 [image-rendering:-webkit-optimize-contrast] [backface-visibility:hidden] [transform:translateZ(0)]`}
        loading="eager"
        decoding="sync"
      />
    </div>
  );
};
