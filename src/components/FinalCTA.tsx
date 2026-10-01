import React, { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';

const Grainient = React.lazy(() => import('./ui/Grainient').then((module) => ({ default: module.Grainient })));

interface FinalCTAProps {
  onQuoteClick: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onQuoteClick }) => {
  const { currentMood } = useColorMood();
  const sectionRef = useRef<HTMLElement>(null);
  const [showAmbient, setShowAmbient] = useState(false);
  const directWhatsAppUrl = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hola%20Ideas%20%26%20Colores%2C%20quiero%20cotizar%20mi%20proyecto.`;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 767px)').matches) return;
    const observer = new IntersectionObserver(([entry]) => setShowAmbient(entry.isIntersecting), {
      rootMargin: '200px 0px',
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 sm:py-28 bg-slate-950 text-white relative overflow-hidden cta-ambient">
      {/* Background WebGL Grainient with brand colors (Royal Blue, Coral Orange / Current Mood, Deep Navy) */}
      <div className="absolute inset-0 z-0 opacity-35 pointer-events-none" aria-hidden="true">
        {showAmbient && <Suspense fallback={null}><Grainient
          color1="#0059FF"
          color2={currentMood.color || "#FF5738"}
          color3="#07101E"
          timeSpeed={0.2}
          colorBalance={0.0}
          warpStrength={0.8}
          warpFrequency={4.5}
          warpSpeed={1.6}
          warpAmplitude={45.0}
          blendAngle={20.0}
          blendSoftness={0.08}
          rotationAmount={400.0}
          noiseScale={2.0}
          grainAmount={0.08}
          grainScale={2.0}
          grainAnimated={false}
          contrast={1.4}
          gamma={1.0}
          saturation={1.1}
          centerX={0.0}
          centerY={0.0}
          zoom={0.9}
        /></Suspense>}
      </div>

      {/* Radial vignette & gradient overlay for crystal clear typography legibility */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-slate-950/90 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Ideas & Colores Multi-Servicios</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
          {BUSINESS_INFO.sloganPrimary}
        </h2>

        <p className="mt-3 text-lg sm:text-2xl font-medium text-amber-300">
          {BUSINESS_INFO.sloganSecondary}
        </p>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {BUSINESS_INFO.positioning}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            id="final-cta-quote"
            onClick={onQuoteClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Cotiza tu proyecto</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="final-cta-whatsapp"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-base border border-slate-700/80 backdrop-blur-sm transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>Hablar por WhatsApp</span>
          </a>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Atención técnica • Personal calificado • Garantía por escrito en productos y mano de obra</span>
        </div>
      </div>
    </section>
  );
};
