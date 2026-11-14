import React, { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { buildSafeWhatsAppUrl } from '../utils/security';

const Grainient = React.lazy(() =>
  import('./ui/Grainient').then((module) => ({ default: module.Grainient }))
);

interface FinalCTAProps {
  onQuoteClick: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onQuoteClick }) => {
  const { currentMood } = useColorMood();
  const sectionRef = useRef<HTMLElement>(null);
  const [showAmbient, setShowAmbient] = useState(false);
  const directWhatsAppUrl = buildSafeWhatsAppUrl(
    BUSINESS_INFO.whatsappNumber,
    'Hola Ideas & Colores, quiero cotizar mi proyecto.'
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 767px)').matches)
      return;
    const observer = new IntersectionObserver(([entry]) => setShowAmbient(entry.isIntersecting), {
      rootMargin: '200px 0px',
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 sm:py-32 bg-[#090E19] text-white relative overflow-hidden border-b border-[#27324D]"
    >
      {/* Subtle architectural gradient ambience */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none" aria-hidden="true">
        {showAmbient && (
          <Suspense fallback={null}>
            <Grainient
              color1="#151D30"
              color2={currentMood.color || '#FF5C00'}
              color3="#090E19"
              timeSpeed={0.18}
              colorBalance={0.0}
              warpStrength={0.7}
              warpFrequency={4.0}
              warpSpeed={1.4}
              warpAmplitude={40.0}
              blendAngle={20.0}
              blendSoftness={0.1}
              rotationAmount={360.0}
              noiseScale={2.0}
              grainAmount={0.06}
              grainScale={2.0}
              grainAnimated={false}
              contrast={1.3}
              gamma={1.0}
              saturation={1.0}
              centerX={0.0}
              centerY={0.0}
              zoom={0.9}
            />
          </Suspense>
        )}
      </div>

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(9, 14, 25, 0.35), rgba(9, 14, 25, 0.92))',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#B8BCC6] mb-5">
          <span
            className="w-2.5 h-2.5 rounded-xs shrink-0"
            style={{ backgroundColor: currentMood.color }}
          />
          <span>Ideas &amp; Colores Multi-Servicios Guatemala</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black font-display tracking-[-0.04em] text-white leading-[1.02]">
          {BUSINESS_INFO.sloganPrimary}
          <span style={{ color: currentMood.color }}>.</span>
        </h2>

        <p
          className="mt-4 text-lg sm:text-2xl font-bold"
          style={{ color: currentMood.color }}
        >
          {BUSINESS_INFO.sloganSecondary}
        </p>

        <p className="mt-4 text-sm sm:text-base text-[#B8BCC6] max-w-2xl mx-auto leading-relaxed">
          {BUSINESS_INFO.positioning}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            id="final-cta-quote"
            onClick={onQuoteClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 pl-2 pr-7 py-2.5 min-h-[54px] rounded-md font-bold text-base shadow-xl hover:opacity-95 transition-all cursor-pointer"
            style={{
              backgroundColor: currentMood.color,
              color: currentMood.textColorOnAccent,
            }}
          >
            <span className="w-9 h-9 rounded-sm bg-white flex items-center justify-center shrink-0">
              <ArrowRight
                className="w-4 h-4"
                style={{ color: currentMood.color }}
                aria-hidden="true"
              />
            </span>
            <span>Cotiza tu proyecto</span>
          </button>

          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="final-cta-whatsapp"
            className="w-full sm:w-auto px-7 py-4 min-h-[54px] rounded-md bg-[#151D30] hover:bg-black text-white font-bold text-base border border-[#27324D] transition-all flex items-center justify-center gap-2.5"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            <span>Hablar por WhatsApp</span>
          </a>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#CBD5E1]">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>
            Atención técnica • Personal calificado • Garantía por escrito en productos y mano de
            obra
          </span>
        </div>
      </div>
    </section>
  );
};
