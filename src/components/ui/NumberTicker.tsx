import React, { useEffect, useRef, useState } from 'react';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  direction = 'up',
  delay = 0,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState<number>(direction === 'down' ? value : 0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            setTimeout(() => {
              const start = direction === 'down' ? value : 0;
              const end = direction === 'down' ? 0 : value;
              const duration = 1200; // ms
              const startTime = performance.now();

              const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Out-expo easing for pleasant deceleration
                const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const current = start + (end - start) * easeOutExpo;

                setDisplayValue(current);

                if (progress < 1) {
                  requestAnimationFrame(animate);
                } else {
                  setDisplayValue(end);
                }
              };

              requestAnimationFrame(animate);
            }, delay);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value, direction, delay, hasAnimated]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <span ref={ref} className={`inline-block tabular-nums font-display ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
