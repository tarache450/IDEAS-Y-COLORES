import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PROCESS_STEPS } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import FadeIn from './ui/FadeIn';
import { LOGO_SPECTRUM_LIST } from '../utils/logoPalette';

interface ProcessSectionProps {
  onQuoteClick: () => void;
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({ onQuoteClick }) => {
  const { currentMood } = useColorMood();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  return (
    <section id="proceso" className="py-20 sm:py-28 bg-white border-b border-[#E8E9EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn direction="up" distance={20}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14 pb-8 border-b border-[#E8E9EE]">
            <div className="max-w-3xl text-left">
              <div className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#80828C] mb-3">
                <span className="inline-flex items-center gap-1" aria-hidden="true">
                  {LOGO_SPECTRUM_LIST.map((hex) => (
                    <span
                      key={hex}
                      className="w-2 h-2 rounded-xs"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </span>
                <span>Metodología en 4 Pasos</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-[#090E19] tracking-[-0.04em] leading-[1.06] font-display">
                Proceso claro, de inicio a entrega
                <span style={{ color: currentMood.color }}>.</span>
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#525663] leading-relaxed max-w-md text-left">
              Flujo coordinado con cronograma definido desde el diagnóstico técnico hasta la
              entrega limpia con garantía por escrito.
            </p>
          </div>
        </FadeIn>

        {/* 4 Roofera Numbered Architectural Cards with Logo Palette Accents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROCESS_STEPS.map((item, idx) => {
            const isActive = activeStepIndex === idx;
            const stepAccent = LOGO_SPECTRUM_LIST[idx % LOGO_SPECTRUM_LIST.length];
            const isLightAccent = stepAccent === '#FAB82A' || stepAccent === '#00A3FF';

            return (
              <div
                key={item.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`rounded-xl p-6 sm:p-7 border transition-all duration-200 flex flex-col justify-between cursor-pointer relative text-left ${
                  isActive
                    ? 'bg-[#090E19] text-white border-[#090E19] shadow-xl -translate-y-1'
                    : 'bg-[#F4F5F7] hover:bg-white text-[#090E19] border-[#E8E9EE] hover:border-[#090E19]/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className="text-3xl sm:text-4xl font-black font-display tracking-tight transition-colors"
                      style={{ color: isActive ? stepAccent : '#80828C' }}
                    >
                      {item.step}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                        isActive
                          ? 'shadow-sm'
                          : 'bg-white text-[#80828C] border border-[#E8E9EE]'
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: stepAccent,
                              color: isLightAccent ? '#090E19' : '#FFFFFF',
                            }
                          : {}
                      }
                    >
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>

                  <span
                    className="text-[10px] font-extrabold uppercase tracking-[0.16em] block mb-1.5"
                    style={{ color: isActive ? stepAccent : '#80828C' }}
                  >
                    Paso {idx + 1}
                  </span>

                  <h3
                    className={`text-lg sm:text-xl font-black font-display tracking-tight mb-2.5 ${
                      isActive ? 'text-white' : 'text-[#090E19]'
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-5 ${
                      isActive ? 'text-[#B8BCC6]' : 'text-[#525663]'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>

                <div
                  className={`pt-4 border-t text-xs font-semibold ${
                    isActive
                      ? 'border-[#27324D] text-[#E8E9EE]'
                      : 'border-[#E8E9EE] text-[#525663]'
                  }`}
                >
                  {item.detail}
                </div>
              </div>
            );
          })}
        </div>

        {/* Roofera Square-Icon Action Button */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onQuoteClick}
            className="group inline-flex items-center gap-3 pl-2 pr-6 py-2 min-h-[48px] rounded-md font-bold text-sm shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
            style={{
              backgroundColor: currentMood.color,
              color: currentMood.textColorOnAccent,
            }}
          >
            <span className="w-8 h-8 rounded-sm bg-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-95">
              <ArrowRight
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: currentMood.color }}
                aria-hidden="true"
              />
            </span>
            <span>Inicia tu Paso 1: Cuéntanos tu proyecto</span>
          </button>
        </div>
      </div>
    </section>
  );
};
