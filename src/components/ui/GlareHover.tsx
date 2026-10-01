import React, { useRef } from 'react';

interface GlareHoverProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
}

/**
 * GlareHover – metallic sheen that sweeps across a card on hover.
 * Adapted from React Bits (MIT). No external deps.
 */
const GlareHover: React.FC<GlareHoverProps> = ({
  children,
  className = '',
  style = {},
  glareColor = '#ffffff',
  glareOpacity = 0.28,
  glareAngle = -45,
  glareSize = 260,
  transitionDuration = 600,
}) => {
  const hex = glareColor.replace('#', '');
  let rgba = glareColor;
  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const overlayRef = useRef<HTMLDivElement | null>(null);

  const animateIn = () => {
    const el = overlayRef.current;
    if (!el) return;
    el.style.transition = 'none';
    el.style.backgroundPosition = '-100% -100%, 0 0';
    requestAnimationFrame(() => {
      el.style.transition = `${transitionDuration}ms ease`;
      el.style.backgroundPosition = '100% 100%, 0 0';
    });
  };

  const animateOut = () => {
    const el = overlayRef.current;
    if (!el) return;
    el.style.transition = `${transitionDuration}ms ease`;
    el.style.backgroundPosition = '-100% -100%, 0 0';
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(${glareAngle}deg,
        hsla(0,0%,0%,0) 60%,
        ${rgba} 70%,
        hsla(0,0%,0%,0) 100%)`,
    backgroundSize: `${glareSize}% ${glareSize}%, 100% 100%`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '-100% -100%, 0 0',
    pointerEvents: 'none',
    borderRadius: 'inherit',
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={style}
      onMouseEnter={animateIn}
      onMouseLeave={animateOut}
    >
      <div ref={overlayRef} style={overlayStyle} />
      {children}
    </div>
  );
};

export default GlareHover;
