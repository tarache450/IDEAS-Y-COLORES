import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { PROCESS_STEPS } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';

interface ProcessSectionProps {
  onQuoteClick: () => void;
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({ onQuoteClick }) => {
  const { currentMood } = useColorMood();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  return (
    <section id="proceso" className="py-20 sm:py-24 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" style={{ color: currentMood.color }} />
            <span>Metodología en 4 Pasos Claros</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            Proceso de trabajo sin fricciones.
          </h2>

          <p className="mt-3 text-base sm:text-lg text-slate-300 font-normal">
            Flujo coordinado con claridad total desde la primera idea hasta la entrega con garantía por escrito.
          </p>
        </div>

        {/* 4 Steps Horizontal / Responsive Interactive Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {PROCESS_STEPS.map((item, idx) => {
            const isActive = activeStepIndex === idx;

            return (
              <div
                key={item.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between cursor-pointer relative group ${
                  isActive
                    ? 'bg-slate-800 border-amber-400/80 shadow-xl -translate-y-1'
                    : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className="text-3xl sm:text-4xl font-black font-display transition-colors duration-300"
                      style={{ color: isActive ? currentMood.color : '#94A3B8' }}
                    >
                      {item.step}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? 'text-slate-950 shadow-md scale-110'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                      }`}
                      style={isActive ? { backgroundColor: currentMood.color } : {}}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Paso {idx + 1}
                  </span>

                  <h3 className="text-lg sm:text-xl font-bold text-white font-display mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal mb-4">
                    {item.desc}
                  </p>
                </div>

                <div
                  className={`pt-4 border-t text-xs font-medium transition-colors ${
                    isActive ? 'border-slate-700 text-amber-300' : 'border-slate-800/80 text-slate-400'
                  }`}
                >
                  {item.detail}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Prompt */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onQuoteClick}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 hover:scale-102 text-slate-950"
            style={{ backgroundColor: currentMood.color }}
          >
            <span>Inicia tu Paso 1: Cuéntanos tu proyecto</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
