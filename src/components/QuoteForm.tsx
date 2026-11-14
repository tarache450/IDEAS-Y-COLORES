import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  MessageCircle,
  UploadCloud,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Clock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Check,
  Layers,
  HelpCircle,
  Paintbrush,
  Printer,
  Hammer,
  Droplets,
  Wrench,
  Building2,
  Home,
  Store,
  Trophy,
  GraduationCap,
  Factory,
  Mail,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { motion, AnimatePresence } from 'motion/react';
import { submitQuoteRequest } from '../services/quotes';
import { assetUrl } from '../utils/asset';
import {
  buildSafeWhatsAppUrl,
  getObfuscatedEmailDisplay,
  buildSafeMailtoUrl,
} from '../utils/security';

interface QuoteFormProps {
  initialProjectType?: string;
  initialService?: string;
  initialMessage?: string;
  onOpenPrivacy?: () => void;
}

interface ServiceOption {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  icon: React.ReactNode;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'pintura',
    title: 'Pintura y recubrimientos',
    subtitle: 'Venta y/o aplicación en concreto, tablayeso, metal y madera',
    accent: '#0059FF',
    icon: <Paintbrush className="w-5 h-5" aria-hidden="true" />,
  },
  {
    id: 'impresion',
    title: 'Impresión digital',
    subtitle: 'Alta resolución, lonas, vinil, mesh, backlight y rotulación',
    accent: '#FF5738',
    icon: <Printer className="w-5 h-5" aria-hidden="true" />,
  },
  {
    id: 'carpinteria',
    title: 'Carpintería',
    subtitle: 'Muebles a la medida, cocinas, closets, pérgolas y decks',
    accent: '#FAB82A',
    icon: <Hammer className="w-5 h-5" aria-hidden="true" />,
  },
  {
    id: 'plomeria',
    title: 'Plomería',
    subtitle: 'Instalación, reparación, artefactos y desobstrucción',
    accent: '#00A3FF',
    icon: <Droplets className="w-5 h-5" aria-hidden="true" />,
  },
  {
    id: 'resina',
    title: 'Resina epóxica',
    subtitle: 'Pisos domiciliares e industriales, mesas de río y tops 3D',
    accent: '#4F46E5',
    icon: <Sparkles className="w-5 h-5" aria-hidden="true" />,
  },
  {
    id: 'mantenimiento',
    title: 'Mantenimiento general',
    subtitle: 'Instalaciones, switches, vidrios, paredes y terrazas',
    accent: '#10B981',
    icon: <Wrench className="w-5 h-5" aria-hidden="true" />,
  },
  {
    id: 'otro',
    title: 'Otro',
    subtitle: 'Cuéntanos tu requerimiento o proyecto especial',
    accent: '#FF5C00',
    icon: <HelpCircle className="w-5 h-5" aria-hidden="true" />,
  },
];

interface SpaceOption {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

const SPACE_OPTIONS: SpaceOption[] = [
  {
    id: 'residencial',
    title: 'Residencial',
    desc: 'Casas, apartamentos y condominios',
    icon: <Home className="w-5 h-5" aria-hidden="true" />,
  },
  {
    id: 'oficina',
    title: 'Oficina',
    desc: 'Espacios de trabajo corporativos y áreas colaborativas',
    icon: <Building2 className="w-5 h-5" aria-hidden="true" />,
  },
  {
    id: 'comercial',
    title: 'Comercial',
    desc: 'Locales, tiendas, plazas y restaurantes',
    icon: <Store className="w-5 h-5" aria-hidden="true" />,
  },
  {
    id: 'recreativo',
    title: 'Recreativo',
    desc: 'Gimnasios, canchas, clubes y áreas sociales',
    icon: <Trophy className="w-5 h-5" aria-hidden="true" />,
  },
  {
    id: 'institucional',
    title: 'Institucional',
    desc: 'Colegios, clínicas, sedes y dependencias',
    icon: <GraduationCap className="w-5 h-5" aria-hidden="true" />,
  },
  {
    id: 'industrial',
    title: 'Industrial',
    desc: 'Bodegas, plantas, hangares y talleres',
    icon: <Factory className="w-5 h-5" aria-hidden="true" />,
  },
];

function normalizeServiceTitle(raw?: string): string {
  if (!raw) return SERVICE_OPTIONS[0].title;
  const lower = raw.toLowerCase();
  if (lower.includes('pintura') || lower.includes('recubrimiento') || lower.includes('impermeab')) {
    return 'Pintura y recubrimientos';
  }
  if (lower.includes('impresi') || lower.includes('rotulaci')) return 'Impresión digital';
  if (lower.includes('carpinter') || lower.includes('madera') || lower.includes('pérgola'))
    return 'Carpintería';
  if (lower.includes('plomer')) return 'Plomería';
  if (lower.includes('resina') || lower.includes('epóxic') || lower.includes('epoxic'))
    return 'Resina epóxica';
  if (lower.includes('mantenimiento') || lower.includes('instalaci') || lower.includes('reparaci')) {
    return 'Mantenimiento general';
  }
  const exact = SERVICE_OPTIONS.find((s) => s.title.toLowerCase() === lower);
  return exact ? exact.title : SERVICE_OPTIONS[0].title;
}

function normalizeSpaceTitle(raw?: string): string {
  if (!raw) return SPACE_OPTIONS[0].title;
  const lower = raw.toLowerCase();
  if (lower.includes('residencial') || lower.includes('casa') || lower.includes('condominio'))
    return 'Residencial';
  if (lower.includes('oficina') || lower.includes('corporativ')) return 'Oficina';
  if (lower.includes('comercial') || lower.includes('local') || lower.includes('plaza'))
    return 'Comercial';
  if (
    lower.includes('recreativ') ||
    lower.includes('deportiv') ||
    lower.includes('gimnasio') ||
    lower.includes('cancha')
  ) {
    return 'Recreativo';
  }
  if (lower.includes('institucional') || lower.includes('colegio') || lower.includes('campus'))
    return 'Institucional';
  if (lower.includes('industrial') || lower.includes('bodega') || lower.includes('planta'))
    return 'Industrial';
  const exact = SPACE_OPTIONS.find((s) => s.title.toLowerCase() === lower);
  return exact ? exact.title : SPACE_OPTIONS[0].title;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  initialProjectType = 'Residencial',
  initialService = 'Pintura y recubrimientos',
  initialMessage = '',
  onOpenPrivacy,
}) => {
  const { currentMood } = useColorMood();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 State
  const [selectedService, setSelectedService] = useState<string>(() =>
    normalizeServiceTitle(initialService)
  );

  // Step 2 State
  const [selectedSpace, setSelectedSpace] = useState<string>(() =>
    normalizeSpaceTitle(initialProjectType)
  );
  const [estimatedArea, setEstimatedArea] = useState<string>(
    '50 - 150 m² (Apartamento o casa mediana)'
  );
  const [desiredTimeline, setDesiredTimeline] = useState<string>('Próximos 7 días');

  // Step 3 State
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [location, setLocation] = useState<string>('Carretera a El Salvador');
  const [description, setDescription] = useState<string>(initialMessage);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(true);

  const [uploadedPhotos, setUploadedPhotos] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState('');
  const [submittedWaUrl, setSubmittedWaUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const activeOptionAccent =
    SERVICE_OPTIONS.find((s) => s.title === selectedService)?.accent || currentMood.color || '#FF5C00';
  const formAccentColor = activeOptionAccent;
  const formTextOnAccent =
    formAccentColor === '#FAB82A' || formAccentColor === '#00A3FF' || formAccentColor === '#10B981'
      ? '#090E19'
      : '#FFFFFF';

  useEffect(() => {
    if (initialService) {
      setSelectedService(normalizeServiceTitle(initialService));
    }
  }, [initialService]);

  useEffect(() => {
    if (initialProjectType) {
      setSelectedSpace(normalizeSpaceTitle(initialProjectType));
    }
  }, [initialProjectType]);

  useEffect(() => {
    if (initialMessage) {
      setDescription(initialMessage);
      setCurrentStep(3);
    }
  }, [initialMessage]);

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );
    const newPhotos = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedPhotos((prev) => [...prev, ...newPhotos].slice(0, 4));
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handlePhotoUpload(e.dataTransfer.files);
    }
  };

  const validateStep3 = () => {
    if (!fullName.trim()) {
      setErrorMsg('Por favor escribe tu nombre completo.');
      return false;
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor ingresa tu número de WhatsApp o teléfono para contactarte.');
      return false;
    }
    if (!location.trim()) {
      setErrorMsg('Por favor especifica tu ubicación o zona en Guatemala.');
      return false;
    }
    if (!privacyAccepted) {
      setErrorMsg('Debes aceptar la política de privacidad para procesar la cotización.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleSubmitWeb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateStep3()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const result = await submitQuoteRequest({
        name: fullName,
        phone,
        email: email || undefined,
        service: selectedService,
        spaceType: selectedSpace,
        estimatedArea,
        desiredTimeline,
        location,
        message: description || undefined,
        source: 'website_quote_wizard',
        honeypot,
      });

      if (!result.success) {
        setErrorMsg(
          result.error ||
            'No pudimos enviar tu solicitud en este momento. Por favor inténtalo nuevamente o escríbenos por WhatsApp.'
        );
        setIsSubmitting(false);
        return;
      }

      setSubmittedLeadId(result.leadId || '');
      setSubmittedWaUrl(result.whatsappRedirectUrl || '');
      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setErrorMsg('No pudimos enviar tu solicitud. Inténtalo nuevamente o escríbenos a WhatsApp.');
      setIsSubmitting(false);
    }
  };

  const buildWhatsAppLink = () => {
    const text =
      `*COTIZACIÓN WEB - IDEAS & COLORES MULTI-SERVICIOS*\n\n` +
      `*1. Servicio solicitado:* ${selectedService}\n` +
      `*2. Tipo de espacio:* ${selectedSpace}\n` +
      `*Área estimada:* ${estimatedArea}\n` +
      `*Plazo deseado:* ${desiredTimeline}\n\n` +
      `*3. Datos del solicitante:*\n` +
      `*Nombre:* ${fullName || 'Por confirmar'}\n` +
      `*Teléfono/WhatsApp:* ${phone || 'Por confirmar'}\n` +
      `*Ubicación en GT:* ${location || 'Carretera a El Salvador / GT'}\n` +
      (email ? `*Correo:* ${email}\n` : '') +
      (description ? `*Descripción:* ${description}\n` : '') +
      (uploadedPhotos.length > 0
        ? `*Fotografías:* Tengo ${uploadedPhotos.length} fotografía(s) para enviar en este chat.\n`
        : '') +
      `\nSolicito asesoría técnica y presupuesto formal con garantía por escrito.`;

    return buildSafeWhatsAppUrl(BUSINESS_INFO.whatsappNumber, text);
  };

  return (
    <section
      id="cotizar"
      className="py-20 sm:py-28 bg-[#090E19] text-white border-b border-[#27324D] relative overflow-hidden"
    >
      {/* Alias anchor #quote matching Roofera template navigation */}
      <div id="quote" className="absolute -top-20" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Roofera #quote 2-Column Flagship Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column (5 cols): Visual Architectural Context + Direct Trust & Summary */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6 text-left">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#80828C]">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: formAccentColor }}
                />
                <span>Solicita una Cotización • 3 Pasos</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.04em] leading-[1.04] font-display">
                ¿Tienes un Proyecto en Mente?
                <span style={{ color: formAccentColor }}>.</span>
              </h2>

              <p className="text-sm sm:text-base text-[#B8BCC6] leading-relaxed">
                Respuesta técnica en menos de 24 horas hábiles. Coordinamos diagnóstico en sitio sin
                costo en Carretera a El Salvador y Ciudad de Guatemala con presupuesto desglosado y
                garantía por escrito.
              </p>

              {/* Architectural Showcase Photo Framed */}
              <div className="relative rounded-xl overflow-hidden border border-[#27324D] aspect-[16/10] bg-[#151D30]">
                <img
                  src={assetUrl('projects/fachada-residencial-carretera.webp')}
                  alt="Acabado profesional de pintura Airless en fachada residencial de Carretera a El Salvador por Ideas & Colores Guatemala"
                  className="w-full h-full object-cover opacity-85"
                  width={1200}
                  height={670}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090E19] via-[#090E19]/25 to-transparent pointer-events-none" />
                <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    <span>Garantía por escrito + Factura FEL</span>
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-white"
                    style={{ backgroundColor: formAccentColor }}
                  >
                    Visita Gratis
                  </span>
                </div>
              </div>
            </div>

            {/* Live Selection Summary + Immediate Contact Card */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#151D30] border border-[#27324D] space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#27324D]">
                  <span className="font-extrabold uppercase tracking-[0.14em] text-white flex items-center gap-1.5">
                    <Layers
                      className="w-3.5 h-3.5"
                      style={{ color: formAccentColor }}
                      aria-hidden="true"
                    />
                    <span>Resumen de tu solicitud</span>
                  </span>
                  <span
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: formAccentColor }}
                  >
                    Paso {currentStep}/3
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                  <div>
                    <span className="text-[#80828C] block text-[10px] uppercase tracking-wider">
                      Servicio
                    </span>
                    <span className="font-bold text-white truncate block">{selectedService}</span>
                  </div>
                  <div>
                    <span className="text-[#80828C] block text-[10px] uppercase tracking-wider">
                      Espacio
                    </span>
                    <span className="font-bold text-white truncate block">{selectedSpace}</span>
                  </div>
                  <div>
                    <span className="text-[#80828C] block text-[10px] uppercase tracking-wider">
                      Área
                    </span>
                    <span className="font-bold text-white truncate block">{estimatedArea}</span>
                  </div>
                  <div>
                    <span className="text-[#80828C] block text-[10px] uppercase tracking-wider">
                      Plazo
                    </span>
                    <span className="font-bold text-white truncate block">{desiredTimeline}</span>
                  </div>
                </div>
              </div>

              {/* Direct Quick Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="flex items-center gap-2.5 text-white p-3.5 min-h-[48px] rounded-xl bg-[#151D30] hover:bg-black border border-[#27324D] transition-colors"
                >
                  <Phone
                    className="w-4 h-4 shrink-0"
                    style={{ color: formAccentColor }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#80828C] block">
                      Llámanos hoy
                    </span>
                    <span className="font-bold text-white truncate block">
                      {BUSINESS_INFO.phone}
                    </span>
                  </div>
                </a>

                <a
                  href={buildSafeMailtoUrl('Cotización de Proyecto - Ideas & Colores')}
                  className="flex items-center gap-2.5 text-white p-3.5 min-h-[48px] rounded-xl bg-[#151D30] hover:bg-black border border-[#27324D] transition-colors"
                >
                  <Mail
                    className="w-4 h-4 shrink-0"
                    style={{ color: formAccentColor }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#80828C] block">
                      Correo Gerencia
                    </span>
                    <span className="font-bold text-white truncate block">
                      {getObfuscatedEmailDisplay()}
                    </span>
                  </div>
                </a>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#80828C]">
                <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: formAccentColor }} aria-hidden="true" />
                <span>Horario: {BUSINESS_INFO.scheduleWeekdays}</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Roofera Dark Elevated Form Card */}
          <div className="lg:col-span-7 bg-[#151D30] rounded-xl p-6 sm:p-8 lg:p-10 border border-[#27324D] shadow-2xl text-left">
            {submitted ? (
              /* Success State */
              <div className="text-center py-10 space-y-6">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto shadow-md text-white"
                  style={{ backgroundColor: formAccentColor }}
                >
                  <CheckCircle2 className="w-11 h-11 stroke-[2.2]" aria-hidden="true" />
                </div>

                <div className="space-y-3 max-w-lg mx-auto">
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                    ¡Cotización recibida con éxito!
                  </h3>
                  {submittedLeadId && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#090E19] border border-[#27324D] text-white text-xs font-mono font-bold">
                      <span className="text-[#80828C] font-sans">No. de Seguimiento:</span>
                      <span style={{ color: formAccentColor }}>[{submittedLeadId}]</span>
                    </div>
                  )}
                  <p className="text-sm sm:text-base text-[#B8BCC6]">
                    Gracias, <strong className="text-white">{fullName}</strong>. Un asesor técnico de
                    Ideas &amp; Colores te contactará al{' '}
                    <strong className="text-white">{phone}</strong> para coordinar la visita y
                    afinar tu presupuesto formal.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-[#090E19] border border-[#27324D] max-w-md mx-auto text-center space-y-3">
                  <p className="text-sm font-bold text-white">
                    ¿Deseas atención inmediata por WhatsApp?
                  </p>
                  <p className="text-xs text-[#B8BCC6]">
                    Envía el resumen de tu cotización directo a nuestro equipo técnico:
                  </p>
                  <a
                    href={submittedWaUrl || buildWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 min-h-[48px] rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition-all"
                  >
                    <MessageCircle className="w-5 h-5" aria-hidden="true" />
                    <span>Enviar cotización a WhatsApp</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setSubmittedLeadId('');
                    setSubmittedWaUrl('');
                    setCurrentStep(1);
                    setFullName('');
                    setPhone('');
                    setEmail('');
                    setDescription('');
                    setUploadedPhotos([]);
                    setErrorMsg('');
                    setHoneypot('');
                  }}
                  className="text-xs font-bold text-[#80828C] hover:text-white underline cursor-pointer min-h-[44px] px-3"
                >
                  Realizar otra cotización
                </button>
              </div>
            ) : (
              /* Wizard Steps */
              <form
                onSubmit={handleSubmitWeb}
                {...({
                  toolname: 'solicitar_cotizacion_ideas_y_colores',
                  tooldescription:
                    'Solicita una cotización formal o visita técnica sin costo en Guatemala para pintura Airless, impermeabilización de losas, hidrolavado a presión, resinas epóxicas, carpintería o remodelación.',
                } as React.FormHTMLAttributes<HTMLFormElement>)}
              >
                {/* Honeypot Anti-Spam (Invisible for humans) */}
                <input
                  type="text"
                  name="website_hp"
                  title="No completar este campo anti-spam"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  aria-hidden="true"
                  autoComplete="off"
                  style={{ display: 'none' }}
                  className="hidden absolute -left-[9999px]"
                  {...({
                    toolparamdescription: 'Campo de verificación anti-spam (dejar vacío).',
                  } as React.InputHTMLAttributes<HTMLInputElement>)}
                />

                {/* Imported Configuration Alert */}
                {description && (
                  <div className="mb-6 p-4 rounded-xl bg-[#090E19] border border-[#27324D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-md text-white flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: formAccentColor }}
                      >
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div>
                        <span
                          className="text-[11px] font-bold uppercase tracking-wider block"
                          style={{ color: formAccentColor }}
                        >
                          Datos cargados desde herramienta interactiva
                        </span>
                        <p className="text-xs text-[#E8E9EE] font-medium line-clamp-2 mt-0.5">
                          {description}
                        </p>
                      </div>
                    </div>
                    {currentStep !== 3 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="px-3.5 py-2 min-h-[40px] rounded-md text-white font-bold text-xs shrink-0 transition-opacity hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: formAccentColor }}
                      >
                        Ir directo a enviar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-semibold text-[#B8BCC6] hover:text-white underline shrink-0 cursor-pointer"
                      >
                        Ajustar opciones
                      </button>
                    )}
                  </div>
                )}

                {/* Step Progress Bar */}
                <div className="mb-8">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { step: 1, label: '1. ¿Qué necesitas?' },
                      { step: 2, label: '2. Tipo de espacio' },
                      { step: 3, label: '3. Datos y envío' },
                    ].map((st) => {
                      const isActive = currentStep === st.step;
                      const isDone = currentStep > st.step;
                      return (
                        <button
                          key={st.step}
                          type="button"
                          onClick={() => setCurrentStep(st.step as 1 | 2 | 3)}
                          className={`text-left pb-3 border-b-2 transition-all cursor-pointer ${
                            isActive
                              ? 'text-white font-bold'
                              : isDone
                              ? 'border-emerald-400 text-emerald-400 font-semibold'
                              : 'border-[#27324D] text-[#B8BCC6] hover:text-white'
                          }`}
                          style={isActive ? { borderColor: formAccentColor } : undefined}
                        >
                          <span className="text-xs sm:text-sm block">{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs sm:text-sm font-semibold">
                    {errorMsg}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {/* STEP 1 */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-black text-white font-display mb-1">
                          Paso 1: ¿Qué necesitas para tu espacio?
                        </h3>
                        <p className="text-xs sm:text-sm text-[#B8BCC6]">
                          Selecciona el servicio o especialidad de tu interés:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SERVICE_OPTIONS.map((item) => {
                          const isSelected = selectedService === item.title;
                          const itemLight =
                            item.accent === '#FAB82A' ||
                            item.accent === '#00A3FF' ||
                            item.accent === '#10B981';
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedService(item.title)}
                              className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#090E19] text-white shadow-md'
                                  : 'bg-[#090E19]/50 hover:bg-[#090E19] text-[#E8E9EE] border-[#27324D]'
                              }`}
                              style={isSelected ? { borderColor: item.accent } : undefined}
                            >
                              <div
                                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors"
                                style={
                                  isSelected
                                    ? {
                                        backgroundColor: item.accent,
                                        color: itemLight ? '#090E19' : '#FFFFFF',
                                      }
                                    : {
                                        backgroundColor: '#151D30',
                                        color: item.accent,
                                        border: '1px solid #27324D',
                                      }
                                }
                              >
                                {item.icon}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs sm:text-sm font-bold truncate">
                                    {item.title}
                                  </span>
                                  {isSelected && (
                                    <Check
                                      className="w-4 h-4 shrink-0"
                                      style={{ color: item.accent }}
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>
                                <p className="text-[11px] mt-0.5 leading-tight text-[#80828C]">
                                  {item.subtitle}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="group inline-flex items-center justify-center min-h-[48px] gap-2.5 pl-2 pr-5 py-2 rounded-md font-bold text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
                          style={{ backgroundColor: formAccentColor, color: formTextOnAccent }}
                        >
                          <span className="w-7 h-7 rounded-sm bg-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-95">
                            <ArrowRight
                              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                              style={{ color: formAccentColor === '#FAB82A' ? '#B45309' : formAccentColor }}
                              aria-hidden="true"
                            />
                          </span>
                          <span>Siguiente: Tipo de espacio</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2 */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-black text-white font-display mb-1">
                          Paso 2: Tipo de espacio a intervenir
                        </h3>
                        <p className="text-xs sm:text-sm text-[#B8BCC6]">
                          Indícanos dónde se ubica el proyecto para adaptar cuadrilla y materiales:
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {SPACE_OPTIONS.map((sp) => {
                          const isSelected = selectedSpace === sp.title;
                          return (
                            <button
                              key={sp.id}
                              type="button"
                              onClick={() => setSelectedSpace(sp.title)}
                              className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-[#090E19] text-white shadow-md'
                                  : 'bg-[#090E19]/50 hover:bg-[#090E19] text-[#E8E9EE] border-[#27324D]'
                              }`}
                              style={isSelected ? { borderColor: formAccentColor } : undefined}
                            >
                              <div
                                className={`w-9 h-9 rounded-md flex items-center justify-center mb-3 ${
                                  isSelected
                                    ? 'text-white'
                                    : 'bg-[#151D30] text-[#B8BCC6] border border-[#27324D]'
                                }`}
                                style={isSelected ? { backgroundColor: formAccentColor } : undefined}
                              >
                                {sp.icon}
                              </div>
                              <div>
                                <span className="text-xs sm:text-sm font-bold block mb-0.5">
                                  {sp.title}
                                </span>
                                <span className="text-[10px] leading-tight block text-[#80828C]">
                                  {sp.desc}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label
                            htmlFor="quote-estimated-area"
                            className="text-xs font-bold text-[#E8E9EE] block mb-1.5"
                          >
                            Área estimada del espacio:
                          </label>
                          <select
                            id="quote-estimated-area"
                            name="estimatedArea"
                            title="Área estimada del espacio en metros cuadrados"
                            value={estimatedArea}
                            onChange={(e) => setEstimatedArea(e.target.value)}
                            className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#27324D] text-base sm:text-sm font-medium text-white bg-[#090E19] focus:outline-none"
                            {...({
                              toolparamdescription:
                                'Rango de área estimada del espacio a intervenir en metros cuadrados.',
                            } as React.SelectHTMLAttributes<HTMLSelectElement>)}
                          >
                            <option value="Menos de 50 m² (Puntual o habitación)">
                              Menos de 50 m² (Puntual o habitación)
                            </option>
                            <option value="50 - 150 m² (Apartamento o casa mediana)">
                              50 - 150 m² (Apartamento o casa mediana)
                            </option>
                            <option value="150 - 300 m² (Residencia completa)">
                              150 - 300 m² (Residencia completa)
                            </option>
                            <option value="Más de 300 m² (Comercial o nave industrial)">
                              Más de 300 m² (Comercial o nave industrial)
                            </option>
                            <option value="No estoy seguro (deseo visita diagnóstica)">
                              No estoy seguro (deseo visita diagnóstica)
                            </option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="quote-timeline"
                            className="text-xs font-bold text-[#E8E9EE] block mb-1.5"
                          >
                            Plazo deseado de inicio:
                          </label>
                          <select
                            id="quote-timeline"
                            name="desiredTimeline"
                            title="Plazo deseado de inicio del proyecto"
                            value={desiredTimeline}
                            onChange={(e) => setDesiredTimeline(e.target.value)}
                            className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#27324D] text-base sm:text-sm font-medium text-white bg-[#090E19] focus:outline-none"
                            {...({
                              toolparamdescription: 'Plazo deseado para iniciar el trabajo.',
                            } as React.SelectHTMLAttributes<HTMLSelectElement>)}
                          >
                            <option value="Urgente (1-3 días)">Urgente (1-3 días)</option>
                            <option value="Próximos 7 días">Próximos 7 días</option>
                            <option value="Este mes">Este mes</option>
                            <option value="Planificación a futuro / Solo cotizando">
                              Planificación a futuro / Solo cotizando
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="inline-flex items-center justify-center min-h-[44px] gap-1.5 px-4 py-2.5 rounded-md font-bold text-xs sm:text-sm text-[#B8BCC6] hover:bg-[#090E19] hover:text-white border border-[#27324D] transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                          <span>Atrás</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="group inline-flex items-center justify-center min-h-[48px] gap-2.5 pl-2 pr-5 py-2 rounded-md font-bold text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
                          style={{ backgroundColor: formAccentColor, color: formTextOnAccent }}
                        >
                          <span className="w-7 h-7 rounded-sm bg-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-95">
                            <ArrowRight
                              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                              style={{ color: formAccentColor === '#FAB82A' ? '#B45309' : formAccentColor }}
                              aria-hidden="true"
                            />
                          </span>
                          <span>Siguiente: Datos de contacto</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3 */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      <div>
                        <h3 className="text-lg font-black text-white font-display mb-1">
                          Paso 3: Tus datos de contacto y detalles
                        </h3>
                        <p className="text-xs sm:text-sm text-[#B8BCC6]">
                          Te contactaremos para entregarte tu presupuesto desglosado con garantía por
                          escrito:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="quote-fullname"
                            className="text-xs font-bold text-[#E8E9EE] block mb-1.5"
                          >
                            Nombre completo: *
                          </label>
                          <input
                            type="text"
                            id="quote-fullname"
                            name="fullName"
                            title="Nombre completo del cliente"
                            required
                            maxLength={150}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Tu nombre y apellido"
                            autoComplete="name"
                            className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#27324D] text-base sm:text-sm font-medium text-white placeholder:text-[#80828C] bg-[#090E19] focus:outline-none"
                            {...({
                              toolparamdescription: 'Nombre y apellido del cliente o solicitante.',
                            } as React.InputHTMLAttributes<HTMLInputElement>)}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="quote-phone"
                            className="text-xs font-bold text-[#E8E9EE] block mb-1.5"
                          >
                            Teléfono / WhatsApp: *
                          </label>
                          <input
                            type="tel"
                            id="quote-phone"
                            name="phone"
                            title="Teléfono o WhatsApp en Guatemala"
                            required
                            maxLength={25}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Ej: +502 6661-7592"
                            autoComplete="tel"
                            className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#27324D] text-base sm:text-sm font-medium text-white placeholder:text-[#80828C] bg-[#090E19] focus:outline-none"
                            {...({
                              toolparamdescription:
                                'Número de teléfono o WhatsApp en Guatemala (ej. +502 6661-7592).',
                            } as React.InputHTMLAttributes<HTMLInputElement>)}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="quote-email"
                            className="text-xs font-bold text-[#E8E9EE] block mb-1.5"
                          >
                            Correo electrónico:
                          </label>
                          <input
                            type="email"
                            id="quote-email"
                            name="email"
                            title="Correo electrónico opcional"
                            maxLength={254}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu-correo@ejemplo.com"
                            autoComplete="email"
                            className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#27324D] text-base sm:text-sm font-medium text-white placeholder:text-[#80828C] bg-[#090E19] focus:outline-none"
                            {...({
                              toolparamdescription:
                                'Dirección de correo electrónico para recibir la cotización formal.',
                            } as React.InputHTMLAttributes<HTMLInputElement>)}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="quote-location"
                            className="text-xs font-bold text-[#E8E9EE] block mb-1.5"
                          >
                            Ubicación / Sector en Guatemala: *
                          </label>
                          <input
                            type="text"
                            id="quote-location"
                            name="location"
                            title="Ubicación o zona del proyecto en Guatemala"
                            required
                            maxLength={200}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ej: Carretera a El Salvador Km 21.5, Fraijanes..."
                            className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#27324D] text-base sm:text-sm font-medium text-white placeholder:text-[#80828C] bg-[#090E19] focus:outline-none"
                            {...({
                              toolparamdescription:
                                'Zona o municipio en Guatemala donde se realizará el proyecto.',
                            } as React.InputHTMLAttributes<HTMLInputElement>)}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="quote-description"
                          className="text-xs font-bold text-[#E8E9EE] block mb-1.5"
                        >
                          Descripción de tu necesidad o proyecto:
                        </label>
                        <textarea
                          rows={3}
                          id="quote-description"
                          name="description"
                          title="Descripción detallada de tu necesidad o proyecto"
                          maxLength={3000}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Detalla dimensiones, estado de la superficie, requerimientos de color o fecha de inicio..."
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#27324D] text-base sm:text-sm text-white placeholder:text-[#80828C] bg-[#090E19] focus:outline-none"
                          {...({
                            toolparamdescription:
                              'Detalles adicionales, dimensiones, estado de paredes o losas y requerimientos técnicos.',
                          } as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        />
                      </div>

                      {/* Photo upload */}
                      <div>
                        <label className="text-xs font-bold text-[#E8E9EE] block mb-1.5">
                          Adjuntar fotografías de referencia (opcional, hasta 4 fotos):
                        </label>
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleFileDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className="border border-dashed border-[#27324D] hover:border-white/40 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#090E19]"
                        >
                          <UploadCloud
                            className="w-6 h-6 mx-auto mb-1"
                            style={{ color: formAccentColor }}
                            aria-hidden="true"
                          />
                          <p className="text-xs font-semibold text-white">
                            Arrastra fotografías aquí o haz clic para seleccionarlas
                          </p>
                          <p className="text-[10px] text-[#80828C] mt-0.5">
                            PNG, JPG o HEIC de tus paredes, techos, pisos o muebles
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            name="photos"
                            title="Fotografías opcionales de referencia"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e.target.files)}
                            {...({
                              toolparamdescription:
                                'Fotografías opcionales del espacio o superficie a intervenir.',
                            } as React.InputHTMLAttributes<HTMLInputElement>)}
                          />
                        </div>

                        {uploadedPhotos.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 mt-2.5">
                            {uploadedPhotos.map((item, idx) => (
                              <div
                                key={idx}
                                className="relative aspect-square rounded-lg overflow-hidden border border-[#27324D]"
                              >
                                <img
                                  src={item.preview}
                                  alt={`Fotografía de referencia para cotización ${idx + 1} — Ideas & Colores Guatemala`}
                                  width={160}
                                  height={160}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePhoto(idx);
                                  }}
                                  aria-label={`Eliminar foto ${idx + 1}`}
                                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#090E19]/90 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Privacy */}
                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          type="checkbox"
                          id="privacy-check"
                          checked={privacyAccepted}
                          onChange={(e) => setPrivacyAccepted(e.target.checked)}
                          className="mt-1 rounded border-[#27324D] bg-[#090E19]"
                        />
                        <label
                          htmlFor="privacy-check"
                          className="text-xs text-[#B8BCC6] leading-relaxed"
                        >
                          Acepto ser contactado por un asesor técnico de Ideas &amp; Colores Guatemala
                          para recibir la cotización y agendar visita técnica si aplica.{' '}
                          {onOpenPrivacy && (
                            <button
                              type="button"
                              onClick={onOpenPrivacy}
                              className="underline font-semibold inline ml-1 cursor-pointer hover:text-white"
                              style={{ color: formAccentColor }}
                            >
                              Ver política de privacidad y protección de datos (Guatemala Dto.
                              57-2008)
                            </button>
                          )}
                        </label>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-[#27324D] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="inline-flex items-center justify-center min-h-[44px] gap-1.5 px-4 py-2.5 rounded-md font-bold text-xs sm:text-sm text-[#B8BCC6] hover:bg-[#090E19] hover:text-white border border-[#27324D] transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                          <span>Atrás</span>
                        </button>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <a
                            href={buildWhatsAppLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-md font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" aria-hidden="true" />
                            <span>Enviar por WhatsApp</span>
                          </a>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group inline-flex items-center justify-center gap-2.5 pl-2 pr-5 py-2 min-h-[48px] rounded-md font-bold text-xs sm:text-sm shadow-lg hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
                            style={{ backgroundColor: formAccentColor, color: formTextOnAccent }}
                          >
                            {isSubmitting ? (
                              <span className="px-3">Procesando...</span>
                            ) : (
                              <>
                                <span className="w-7 h-7 rounded-sm bg-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-95">
                                  <Send
                                    className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                                    style={{ color: formAccentColor === '#FAB82A' ? '#B45309' : formAccentColor }}
                                    aria-hidden="true"
                                  />
                                </span>
                                <span>Enviar cotización</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
