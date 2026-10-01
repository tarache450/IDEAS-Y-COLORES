import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Sparkles,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { AnimatedTabs } from './ui/AnimatedTabs';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
  id: string;
  category: 'visitas' | 'garantias' | 'materiales' | 'servicios';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'visita-costo',
    category: 'visitas',
    question: '¿Tiene algún costo la visita técnica y diagnóstico en sitio?',
    answer:
      'No, nuestra visita técnica de evaluación y asesoría en Carretera a El Salvador, Fraijanes, Santa Catarina Pinula y principales zonas de Ciudad de Guatemala (Zonas 10, 14, 15, 16, etc.) es completamente sin costo y sin compromiso. Evaluamos el estado real de tus paredes, posibles filtraciones o fisuras, y te entregamos un presupuesto formal detallado.',
  },
  {
    id: 'garantia-escrito',
    category: 'garantias',
    question: '¿En qué consiste la garantía por escrito y qué cubre?',
    answer:
      'Entregamos un documento formal de garantía respaldado por Ideas & Colores Multi-Servicios. Cubre tanto la calidad de los materiales originales como la adherencia y mano de obra profesional, garantizando que no existirá descascaramiento prematuro, ampollamiento ni fallas por mala preparación de superficie.',
  },
  {
    id: 'suministro-materiales',
    category: 'materiales',
    question: '¿Ustedes suministran los materiales o el cliente debe comprarlos?',
    answer:
      'Ofrecemos ambas modalidades según tu conveniencia. En la modalidad recomendada "Llave en mano", suministramos productos originales de marcas líderes (Sherwin-Williams, Corona, Lanco, Sika) con descuentos por volumen y sin diluciones perjudiciales. Si ya compraste tu pintura o recubrimiento, también brindamos exclusivamente el servicio de aplicación calificada.',
  },
  {
    id: 'tiempo-cotizacion',
    category: 'visitas',
    question: '¿Cuánto tiempo toma recibir la cotización formal?',
    answer:
      'Entregamos el presupuesto formal desglosado en un plazo máximo de 24 horas hábiles después de realizada la visita técnica y levantadas las medidas. Si nos compartes tus medidas y fotos preliminares por WhatsApp, podemos darte un estimado orientativo el mismo día.',
  },
  {
    id: 'facturacion-sat',
    category: 'garantias',
    question: '¿Emiten factura contable para empresas y personas individuales?',
    answer:
      'Sí, somos una empresa formalmente constituida en Guatemala. Emitimos Factura Electrónica (FEL) autorizada por la SAT con todos los requisitos de ley para particulares, condominios, colegios, oficinas y empresas corporativas.',
  },
  {
    id: 'proteccion-mobiliario',
    category: 'materiales',
    question: '¿Cómo protegen el mobiliario, pisos y áreas limpias durante el trabajo?',
    answer:
      'La protección meticulosa es un estándar obligatorio en Ideas & Colores. Antes de empezar cualquier aplicación o lijado, cubrimos pisos con plástico o cartón de alta densidad, encintamos con precisión marcos, rodapiés y apagadores, y cubrimos todo el mobiliario. Entregamos el espacio limpio y listo para habitar.',
  },
  {
    id: 'otros-servicios',
    category: 'servicios',
    question: '¿Qué otros servicios ofrecen además de pintura?',
    answer:
      'Somos un grupo Multi-Servicios: además de pintura arquitectónica e industrial, contamos con divisiones especializadas en resinas epóxicas para pisos y barras, carpintería a la medida (pérgolas, decks, closets y cocinas), plomería, rotulación e impresión digital de gran formato, y mantenimiento general locativo.',
  },
];

export const FAQSection: React.FC = () => {
  const { currentMood } = useColorMood();
  const [openId, setOpenId] = useState<string | null>('visita-costo');
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredItems =
    activeCategory === 'todos'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section id="faq" className="py-20 bg-transparent border-b border-slate-200/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-2xs mb-3">
            <HelpCircle className="w-3.5 h-3.5" style={{ color: currentMood.color }} />
            <span>Preguntas Frecuentes</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Resolvemos tus dudas antes de iniciar.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Transparencia total sobre nuestras visitas en Carretera a El Salvador, tiempos de
            entrega, garantía por escrito y formas de trabajo.
          </p>
        </div>

        {/* Filter Categories using AnimatedTabs */}
        <div className="flex items-center justify-center mb-10">
          <AnimatedTabs
            tabs={[
              { id: 'todos', label: 'Todas las preguntas' },
              { id: 'visitas', label: 'Visitas y presupuestos' },
              { id: 'garantias', label: 'Garantía y facturación' },
              { id: 'materiales', label: 'Materiales y protección' },
              { id: 'servicios', label: 'Multi-Servicios' },
            ]}
            activeId={activeCategory}
            onChange={setActiveCategory}
            layoutId="faq-category-indicator"
          />
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-slate-300 shadow-md ring-1 ring-slate-900/5'
                    : 'bg-white/80 border-slate-200/90 hover:bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-slate-950 font-display">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-slate-100 text-slate-900' : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="faq-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100">
                        <p>{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* WhatsApp Fast Consultation Card */}
        <div className="mt-12 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              ¿Tienes otra pregunta sobre tu proyecto?
            </span>
            <h4 className="text-lg sm:text-xl font-bold font-display text-white">
              Habla directamente con un asesor técnico ahora.
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Respondemos tus dudas en minutos por WhatsApp con amabilidad y soporte técnico.
            </p>
          </div>

          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hola%20Ideas%20%26%20Colores%2C%20tengo%20una%20consulta%20sobre%20sus%20servicios.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 shadow-md"
          >
            <MessageCircle className="w-4 h-4 text-slate-950" />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
