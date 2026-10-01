import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  className?: string;
  isPriority?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSlogan = false,
  className = '',
  isPriority = true,
}) => {
  const isLight = variant === 'light'; // Light variant is for dark backgrounds (Footer, dark banners)
  const logoSrc = isLight ? '/logo-white.png' : '/logo.png';

  // Dimension presets maintaining natural 2:1 aspect ratio
  const sizeClasses = {
    sm: 'h-8 sm:h-9 w-auto',
    md: 'h-11 sm:h-12 w-auto',
    lg: 'h-14 sm:h-16 w-auto',
    xl: 'h-20 sm:h-24 w-auto',
  }[size];

  return (
    <div
      className={`inline-flex items-center select-none group transition-transform duration-300 ${className}`}
      id="brand-logo-container"
    >
      <img
        src={logoSrc}
        alt="Ideas & Colores Guatemala"
        className={`shrink-0 object-contain transition-transform duration-300 group-hover:scale-[1.03] ${sizeClasses}`}
        loading={isPriority ? 'eager' : 'lazy'}
        decoding="async"
      />

      {showSlogan && (
        <span
          className={`hidden md:inline-block ml-3 pl-3 border-l text-xs font-semibold tracking-wide leading-tight ${
            isLight ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-500'
          }`}
        >
          Color que transforma espacios
        </span>
      )}
    </div>
  );
};

