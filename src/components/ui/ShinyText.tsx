import React from 'react';

interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number; // seconds
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  className = '',
  speed = 4,
}) => {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900 dark:from-white dark:via-amber-200 dark:to-white bg-[length:200%_auto] animate-shine ${className}`}
      style={{
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
};
