import React from 'react';

interface StaggeredTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  staggerDelay?: number;
  initialDelay?: number;
}

export const StaggeredText: React.FC<StaggeredTextProps> = ({
  text,
  className = '',
  as = 'h2',
}) => {
  const Component = as;
  return <Component className={className}>{text}</Component>;
};
