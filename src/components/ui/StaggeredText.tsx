import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

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
  staggerDelay = 0.04,
  initialDelay = 0.1,
}) => {
  const reduceMotion = useReducedMotion();
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 12,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  const Component = motion[as] as any;

  if (reduceMotion) {
    const StaticComponent = as;
    return <StaticComponent className={className}>{text}</StaticComponent>;
  }

  return (
    <Component
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={`inline-block ${className}`}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={wordVariants}
          className="inline-block mr-[0.28em] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </Component>
  );
};
