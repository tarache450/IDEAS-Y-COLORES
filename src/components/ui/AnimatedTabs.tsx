import React from 'react';
import { motion } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  layoutId?: string;
  activeColor?: string;
  variant?: 'pills' | 'underline' | 'cards';
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeId,
  onChange,
  className = '',
  layoutId = 'animated-tabs-indicator',
  activeColor,
  variant = 'pills',
}) => {
  return (
    <div
      className={`inline-flex flex-wrap items-center p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 max-w-full overflow-x-auto no-scrollbar ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-colors duration-200 flex items-center gap-1.5 z-10 select-none whitespace-nowrap ${
              isActive ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 35,
                }}
                className="absolute inset-0 rounded-xl bg-white shadow-xs border border-slate-200/60 -z-10"
                style={
                  activeColor
                    ? {
                        borderLeftWidth: '3px',
                        borderLeftColor: activeColor,
                      }
                    : undefined
                }
              />
            )}
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
