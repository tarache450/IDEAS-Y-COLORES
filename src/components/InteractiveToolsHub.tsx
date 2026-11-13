import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Palette, Calculator, ArrowRight } from 'lucide-react';
import { useColorMood } from '../context/ColorMoodContext';

const ColorStudioVisualizer = lazy(() =>
  import('./ColorStudioVisualizer').then((m) => ({ default: m.ColorStudioVisualizer }))
);
const PaintCalculator = lazy(() =>
  import('./PaintCalculator').then((m) => ({ default: m.PaintCalculator }))
);

interface InteractiveToolsHubProps {
  activeToolTab?: 'color' | 'calculadora';
  onTabChange?: (tab: 'color' | 'calculadora') => void;
  onSelectColorForQuote: (
    colorName: string,
    colorCode: string,
    finish: string,
    roomName: string,
    hex?: string
  ) => void;
  onTransferCalculatorToQuote: (details: string) => void;
}

export const InteractiveToolsHub: React.FC<InteractiveToolsHubProps> = ({
  activeToolTab = 'color',
  onTabChange,
  onSelectColorForQuote,
  onTransferCalculatorToQuote,
}) => {
  const [activeTab, setActiveTab] = useState<'color' | 'calculadora'>(activeToolTab);
  const { currentMood } = useColorMood();
  const colorPanelRef = useRef<HTMLDivElement>(null);
  const calcPanelRef = useRef<HTMLDivElement>(null);
  const colorTabBtnRef = useRef<HTMLButtonElement>(null);
  const calcTabBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setActiveTab(activeToolTab);
  }, [activeToolTab]);

  const selectTab = (tab: 'color' | 'calculadora') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Listen to custom navigation events for #estudio-color and #calculadora
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === 'calculadora') {
        selectTab('calculadora');
      } else if (detail === 'estudio-color' || detail === 'herramientas') {
        selectTab('color');
      }
    };
    window.addEventListener('navigate-section', handleNavigate);
    return () => window.removeEventListener('navigate-section', handleNavigate);
  }, []);

  // Synchronize hidden="until-found" attribute & beforematch event for native Find-in-page accessibility
  useEffect(() => {
    const colorEl = colorPanelRef.current;
    const calcEl = calcPanelRef.current;
    if (!colorEl || !calcEl) return;

    const supportsBeforeMatch = 'onbeforematch' in HTMLElement.prototype;

    if (supportsBeforeMatch) {
      if (activeTab === 'color') {
        colorEl.removeAttribute('hidden');
        calcEl.setAttribute('hidden', 'until-found');
      } else {
        calcEl.removeAttribute('hidden');
        colorEl.setAttribute('hidden', 'until-found');
      }
    } else {
      colorEl.hidden = activeTab !== 'color';
      calcEl.hidden = activeTab !== 'calculadora';
    }

    const onColorMatch = () => selectTab('color');
    const onCalcMatch = () => selectTab('calculadora');

    colorEl.addEventListener('beforematch', onColorMatch);
    calcEl.addEventListener('beforematch', onCalcMatch);

    return () => {
      colorEl.removeEventListener('beforematch', onColorMatch);
      calcEl.removeEventListener('beforematch', onCalcMatch);
    };
  }, [activeTab]);

  const handleKeyDown = (e: React.KeyboardEvent, current: 'color' | 'calculadora') => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = current === 'color' ? 'calculadora' : 'color';
      selectTab(next);
      if (next === 'color') {
        colorTabBtnRef.current?.focus();
      } else {
        calcTabBtnRef.current?.focus();
      }
    }
  };

  return (
    <section
      id="herramientas"
      className="pt-20 pb-10 bg-[#F4F5F7] border-b border-[#E8E9EE] relative"
    >
      {/* Anchor targets for deep links */}
      <div id="estudio-color" className="absolute -top-20" aria-hidden="true" />
      <div id="calculadora" className="absolute -top-20" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Roofera Workbench Header & Accessible Tab Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-8 border-b border-[#E8E9EE]">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#80828C] mb-3">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: currentMood.color }}
              />
              <span>Herramientas Técnicas de Planificación</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#090E19] tracking-[-0.04em] leading-[1.06] font-display">
              Visualiza y calcula tu proyecto
              <span style={{ color: currentMood.color }}>.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#525663]">
              Alterna entre el simulador arquitectónico de ambientes en tiempo real y la
              calculadora técnica de rendimiento en m² y galones.
            </p>
          </div>

          {/* Accessible Tablist */}
          <div
            role="tablist"
            aria-label="Herramientas de planificación de pintura"
            className="inline-flex p-1.5 rounded-xl bg-[#090E19] border border-[#27324D] shadow-lg self-start lg:self-auto w-full sm:w-auto"
          >
            <button
              ref={colorTabBtnRef}
              type="button"
              role="tab"
              id="tab-btn-estudio-color"
              aria-selected={activeTab === 'color'}
              aria-controls="tabpanel-estudio-color"
              tabIndex={activeTab === 'color' ? 0 : -1}
              onClick={() => selectTab('color')}
              onKeyDown={(e) => handleKeyDown(e, 'color')}
              className={`flex-1 sm:flex-initial min-h-[44px] px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'color'
                  ? 'text-white shadow-sm'
                  : 'text-[#B8BCC6] hover:text-white hover:bg-[#151D30]'
              }`}
              style={activeTab === 'color' ? { backgroundColor: currentMood.color } : undefined}
            >
              <Palette className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>1. Estudio de Color</span>
            </button>

            <button
              ref={calcTabBtnRef}
              type="button"
              role="tab"
              id="tab-btn-calculadora"
              aria-selected={activeTab === 'calculadora'}
              aria-controls="tabpanel-calculadora"
              tabIndex={activeTab === 'calculadora' ? 0 : -1}
              onClick={() => selectTab('calculadora')}
              onKeyDown={(e) => handleKeyDown(e, 'calculadora')}
              className={`flex-1 sm:flex-initial min-h-[44px] px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'calculadora'
                  ? 'text-white shadow-sm'
                  : 'text-[#B8BCC6] hover:text-white hover:bg-[#151D30]'
              }`}
              style={
                activeTab === 'calculadora' ? { backgroundColor: currentMood.color } : undefined
              }
            >
              <Calculator className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>2. Calculadora m² y Galones</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel 1: Color Studio Visualizer */}
      <div
        ref={colorPanelRef}
        id="tabpanel-estudio-color"
        role="tabpanel"
        aria-labelledby="tab-btn-estudio-color"
      >
        <div>
          <Suspense
            fallback={
              <div className="min-h-[420px] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#E8E9EE] border-t-[#FF5C00] rounded-full animate-spin" />
              </div>
            }
          >
            <ColorStudioVisualizer onSelectColorForQuote={onSelectColorForQuote} />
          </Suspense>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex justify-end">
            <button
              type="button"
              onClick={() => selectTab('calculadora')}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 min-h-[44px] rounded-md bg-[#090E19] hover:bg-[#151D30] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Calculator
                className="w-4 h-4"
                style={{ color: currentMood.color }}
                aria-hidden="true"
              />
              <span>¿Ya elegiste tu tono? Calcula tus m² y galones aquí</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Panel 2: Paint Calculator */}
      <div
        ref={calcPanelRef}
        id="tabpanel-calculadora"
        role="tabpanel"
        aria-labelledby="tab-btn-calculadora"
      >
        <div>
          <Suspense
            fallback={
              <div className="min-h-[420px] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#E8E9EE] border-t-[#FF5C00] rounded-full animate-spin" />
              </div>
            }
          >
            <PaintCalculator onTransferToQuote={onTransferCalculatorToQuote} />
          </Suspense>
        </div>
      </div>
    </section>
  );
};
