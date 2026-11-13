import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { MULTI_SERVICES_CATEGORIES } from '../../data/content';
import { getCategoryLogoTheme, LOGO_SPECTRUM_GRADIENT } from '../../utils/logoPalette';

interface ServicesMarqueeProps {
  onOpenCategoryPage: (categoryId: string) => void;
}

export const ServicesMarquee: React.FC<ServicesMarqueeProps> = ({ onOpenCategoryPage }) => {
  const prefersReduced = useReducedMotion();
  const items = [...MULTI_SERVICES_CATEGORIES, ...MULTI_SERVICES_CATEGORIES];

  return (
    <section
      aria-label="Cinta rápida de especialidades"
      className="relative bg-[#090E19] border-y border-white/10 overflow-hidden select-none"
    >
      <div
        className="h-[2px] w-full"
        style={{ background: LOGO_SPECTRUM_GRADIENT }}
        aria-hidden="true"
      />
      <div className="py-3.5 overflow-hidden flex items-center">
        {prefersReduced ? (
          <div className="flex flex-wrap justify-center gap-4 px-4 mx-auto max-w-7xl">
            {MULTI_SERVICES_CATEGORIES.map((cat) => {
              const theme = getCategoryLogoTheme(cat.id, cat.accentColor);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onOpenCategoryPage(cat.id)}
                  className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-sm bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-200 transition-colors cursor-pointer"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <span>{cat.shortTitle}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <motion.div
            className="flex items-center gap-6 whitespace-nowrap w-max"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              repeat: Infinity,
              ease: 'linear',
              duration: 28,
            }}
          >
            {items.map((cat, idx) => {
              const theme = getCategoryLogoTheme(cat.id, cat.accentColor);
              return (
                <button
                  key={`${cat.id}-${idx}`}
                  type="button"
                  onClick={() => onOpenCategoryPage(cat.id)}
                  className="group inline-flex items-center gap-3 px-4 py-1.5 rounded-sm bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 hover:border-white/25 transition-all cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-slate-100">
                    {cat.shortTitle}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    · Div. {cat.number}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};
