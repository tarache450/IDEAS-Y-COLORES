import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  once?: boolean;
}

/**
 * FadeIn – lightweight scroll-triggered reveal using motion/react.
 * No GSAP required. Replaces AnimatedContent from React Bits.
 * Respects prefers-reduced-motion.
 */
const FadeIn: React.FC<FadeInProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 28,
  duration = 0.55,
  once = true,
}) => {
  const [inView, setInView] = useState(false);
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const initial: Record<string, string | number> = { opacity: 0, filter: 'blur(6px)' };
  if (direction === 'up') initial.y = distance;
  if (direction === 'down') initial.y = -distance;
  if (direction === 'left') initial.x = distance;
  if (direction === 'right') initial.x = -distance;

  const animate = inView
    ? { opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }
    : initial;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduceMotion ? false : initial}
      animate={reduceMotion ? { opacity: 1, x: 0, y: 0, filter: 'none' } : animate}
      transition={{
        duration: reduceMotion ? 0 : duration,
        delay: reduceMotion ? 0 : delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
