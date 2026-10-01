import React from 'react';

interface BlurHighlightProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export const BlurHighlight: React.FC<BlurHighlightProps> = ({
  children,
  color = '#FAB82A',
  className = '',
}) => {
  return (
    <span className={`relative inline-block font-inherit ${className}`}>
      {/* Background soft blur aura */}
      <span
        className="absolute inset-x-[-4px] inset-y-[2px] rounded-lg opacity-25 blur-xs pointer-events-none -z-10 transition-all duration-300"
        style={{ backgroundColor: color }}
      />
      {/* Subtle highlight underlying strip */}
      <span
        className="absolute inset-x-[-2px] bottom-[10%] h-[35%] rounded-xs opacity-35 pointer-events-none -z-10"
        style={{ backgroundColor: color }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
};
