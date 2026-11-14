import React, { useEffect, useRef, useState } from 'react';

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
 * FadeIn – lightweight scroll-triggered reveal using pure CSS transitions.
 * Zero external animation runtime required. Respects prefers-reduced-motion.
 */
const FadeIn: React.FC<FadeInProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 20,
  duration = 0.45,
  once = true,
}) => {
  const [inView, setInView] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setInView(true);
      return;
    }

    setInView(false);
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

  let translate = 'translate3d(0, 0, 0)';
  if (!inView) {
    if (direction === 'up') translate = `translate3d(0, ${distance}px, 0)`;
    else if (direction === 'down') translate = `translate3d(0, -${distance}px, 0)`;
    else if (direction === 'left') translate = `translate3d(${distance}px, 0, 0)`;
    else if (direction === 'right') translate = `translate3d(-${distance}px, 0, 0)`;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: translate,
        transition: `opacity ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s, transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
