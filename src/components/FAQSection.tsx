import React, { useState } from 'react';
import { ChevronDown, MessageCircle, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { AnimatedTabs } from './ui/AnimatedTabs';
import { motion, AnimatePresence } from 'motion/react';
import { buildSafeWhatsAppUrl } from '../utils/security';

interface FAQSectionProps {
  onOpenPrivacy?: () => void;
}

interface FAQItem {
  id: string;
  category: 'visitas' | 'garantias' | 'materiales' | 'servicios' | 'privacidad';
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
    id: 'privacidad-ley-guatemala',
    category: 'privacidad',
    question: '¿Cómo protegen mis datos personales según la ley de Guatemala?',
    answer:
      'En estricto apego al Decreto Número 57-2008 del Congreso de la República de Guatemala (Ley de Acceso a la Información Pública y Protección de Datos Personales, Artículos 9, 22, 23 y 64) y a los Artículos 24 y 31 de la Constitución Política de Guatemala (Inviolabilidad de Correspondencia y Habeas Data), tus datos personales y de ubicación son confidenciales y se tratan bajo el principio de finalidad exclusiva para la formulación de tu presupuesto y coordinación de visitas. NUNCA comercializamos, cedemos ni compartimos tu información con terceros, agencias de publicidad ni bases de datos externas.',
  },
  {
    id: 'suministro-materiales',
    category: 'materiales',
    question: '¿Ustedes suministran los materiales o el cliente debe comprarlos?',
    answer:
      'Ofrecemos ambas modalidades según tu conveniencia. En la modalidad recomendada "Llave en mano", suministramos productos originales de marcas líderes (Sherwin-Williams, Corona, Lanco, Sika) con descuentos por volumen y sin diluciones perjudiciales. Si ya compraste tu pintura o recubrimiento, también brindamos exclusivamente el servicio de aplicación calificada.',
  },
  {
    id: 'privacidad-fotografias-contacto',
    category: 'privacidad',
    question: '¿Para qué se utilizan mis datos de contacto y fotografías de espacios?',
    answer: `Tu nombre, número de WhatsApp/teléfono y fotografías de referencia se emplean exclusivamente por nuestro equipo técnico para calcular metrajes, evaluar el sustrato y redactar tu presupuesto formal desglosado. Los datos se transmiten bajo conexión segura HTTPS y están protegidos por políticas criptográficas y de aislamiento en base de datos (Row Level Security). Puedes solicitar la eliminación definitiva de tus datos en cualquier momento escribiendo a ${BUSINESS_INFO.email} o a nuestro WhatsApp oficial.`,
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

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenPrivacy }) => {
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
    <section id="faq" className="py-20 sm:py-28 bg-white border-b border-[#E8E9EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Sticky Header Column (Roofera 2-col FAQ structure) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 text-left space-y-6">
            <div>
              <div className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#80828C] mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: currentMood.color }}
                />
                <span>Preguntas Frecuentes</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-[#090E19] tracking-[-0.04em] leading-[1.06] font-display">
                Resolvemos tus Dudas
                <span style={{ color: currentMood.color }}>.</span>
              </h2>

              <p className="mt-4 text-sm sm:text-base text-[#525663] leading-relaxed">
                Transparencia total sobre visitas en Carretera a El Salvador, tiempos de entrega,
                garantía por escrito y cumplimiento legal en Guatemala.
              </p>
            </div>

            {/* Legal Privacy Summary Box */}
            <div className="rounded-xl bg-[#F4F5F7] border border-[#E8E9EE] p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-md text-white flex items-center justify-center shrink-0"
                  style={{ backgroundColor: currentMood.color }}
                >
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#80828C] block">
                    Decreto No. 57-2008 &amp; Art. 24/31 CPRG
                  </span>
                  <h3 className="text-sm font-black text-[#090E19] font-display">
                    Protección de Datos Personales
                  </h3>
                </div>
              </div>
              <p className="text-xs text-[#525663] leading-relaxed">
                Tus datos y fotografías se custodian bajo confidencialidad estricta. Cero venta o
                cesión a terceros.
              </p>
              {onOpenPrivacy && (
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="w-full py-2.5 px-4 min-h-[44px] rounded-md bg-white hover:bg-[#090E19] hover:text-white text-[#090E19] border border-[#E8E9EE] font-bold text-xs transition-colors cursor-pointer"
                >
                  Ver Aviso Legal Completo →
                </button>
              )}
            </div>

            {/* Direct WhatsApp Prompt */}
            <div className="rounded-xl bg-[#090E19] text-white p-6 border border-[#27324D] space-y-3">
              <span
                className="text-[11px] font-extrabold uppercase tracking-[0.16em] block"
                style={{ color: currentMood.color }}
              >
                ¿Otra consulta técnica?
              </span>
              <h3 className="text-lg font-black font-display text-white">
                Habla directo con un asesor técnico.
              </h3>
              <p className="text-xs text-[#B8BCC6] leading-relaxed">
                Respondemos tus dudas en minutos por WhatsApp con soporte personalizado.
              </p>
              <a
                href={buildSafeWhatsAppUrl(
                  BUSINESS_INFO.whatsappNumber,
                  'Hola Ideas & Colores, tengo una consulta sobre sus servicios.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 min-h-[46px] rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Filter Tabs + Clean Accordion */}
          <div className="lg:col-span-7 space-y-6">
            <div className="overflow-x-auto pb-1">
              <AnimatedTabs
                tabs={[
                  { id: 'todos', label: 'Todas' },
                  { id: 'visitas', label: 'Visitas y cotización' },
                  { id: 'garantias', label: 'Garantía y FEL' },
                  { id: 'privacidad', label: 'Privacidad (GT)' },
                  { id: 'materiales', label: 'Materiales' },
                  { id: 'servicios', label: 'Multi-Servicios' },
                ]}
                activeId={activeCategory}
                onChange={setActiveCategory}
                layoutId="faq-category-indicator"
              />
            </div>

            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'bg-[#F4F5F7] border-[#090E19] shadow-sm'
                        : 'bg-white border-[#E8E9EE] hover:border-[#090E19]/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFAQ(item.id)}
                      className="w-full py-5 px-6 min-h-[64px] text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-extrabold text-[#090E19] font-display">
                        {item.question}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isOpen
                            ? 'rotate-180 text-white'
                            : 'bg-[#F4F5F7] text-[#090E19] border border-[#E8E9EE]'
                        }`}
                        style={isOpen ? { backgroundColor: currentMood.color } : undefined}
                      >
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="faq-content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-[#525663] leading-relaxed border-t border-[#E8E9EE]">
                            <p>{item.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
