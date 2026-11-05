import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Palette, Calculator, Sparkles, ArrowRight } from 'lucide-react';
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
      // Fallback for browsers without hidden="until-found": standard boolean hidden attribute
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
      className="pt-16 pb-8 bg-transparent border-b border-slate-200/50 relative"
    >
      {/* Anchor targets for deep links */}
      <div id="estudio-color" className="absolute -top-20" aria-hidden="true" />
      <div id="calculadora" className="absolute -top-20" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Unified Tools Header & Accessible Tab Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6 pb-6 border-b border-slate-200/80">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-2xs mb-3">
              <Sparkles className="w-3.5 h-3.5" style={{ color: currentMood.color }} aria-hidden="true" />
              <span>Herramientas Interactivas de Planificación</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-display">
              Visualiza tu color y calcula tu proyecto al instante.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Alterna entre el simulador arquitectónico de ambientes en tiempo real y la calculadora técnica de rendimiento en m² y galones.
            </p>
          </div>

          {/* Accessible Tablist */}
          <div
            role="tablist"
            aria-label="Herramientas de planificación de pintura"
            className="inline-flex p-1.5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-lg self-start lg:self-auto w-full sm:w-auto"
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
              className={`flex-1 sm:flex-initial min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                activeTab === 'color'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
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
              className={`flex-1 sm:flex-initial min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                activeTab === 'calculadora'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>2. Calculadora m² y Galones</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel 1: Color Studio Visualizer (Nested wrapper carries spacing per search-hidden-content guide) */}
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
                <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
              </div>
            }
          >
            <ColorStudioVisualizer onSelectColorForQuote={onSelectColorForQuote} />
          </Suspense>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex justify-end">
            <button
              type="button"
              onClick={() => selectTab('calculadora')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
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
                <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
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

