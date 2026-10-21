import React, { useState, useEffect, useRef } from 'react';

interface LazySectionProps {
  id: string;
  minHeight?: string;
  rootMargin?: string;
  children: React.ReactNode;
}

export const LazySection: React.FC<LazySectionProps> = ({
  id,
  minHeight = '350px',
  rootMargin = '800px',
  children,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const hash = window.location.hash.replace('#', '');
    return hash === id || hash === 'admin' || window.location.pathname === '/admin';
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === id) setIsVisible(true);
    };

    const handleCustomNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === id) setIsVisible(true);
    };

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('navigate-section', handleCustomNavigate);

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return () => {
        window.removeEventListener('hashchange', handleHash);
        window.removeEventListener('navigate-section', handleCustomNavigate);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin }
    );

    const el = containerRef.current;
    if (el) observer.observe(el);

    // Idle fallback to complete hydration without blocking LCP
    const idleTimer = window.setTimeout(() => {
      setIsVisible(true);
    }, 3200);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('navigate-section', handleCustomNavigate);
      window.clearTimeout(idleTimer);
      observer.disconnect();
    };
  }, [id, isVisible, rootMargin]);

  if (isVisible) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      id={id}
      style={{ minHeight }}
      className="w-full flex items-center justify-center py-12"
      aria-busy="true"
    >
      <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
};
