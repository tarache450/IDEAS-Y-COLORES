import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  MessageCircle,
  UploadCloud,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  MapPin,
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
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import { motion, AnimatePresence } from 'motion/react';
import { SpotlightCard } from './ui/SpotlightCard';

interface QuoteFormProps {
  initialProjectType?: string;
  initialService?: string;
  initialMessage?: string;
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
    icon: <Paintbrush className="w-5 h-5" />,
  },
  {
    id: 'impresion',
    title: 'Impresión digital',
    subtitle: 'Alta resolución, lonas, vinil, mesh, backlight y rotulación',
    accent: '#FF5738',
    icon: <Printer className="w-5 h-5" />,
  },
  {
    id: 'carpinteria',
    title: 'Carpintería',
    subtitle: 'Muebles a la medida, cocinas, closets, pérgolas y decks',
    accent: '#FAB82A',
    icon: <Hammer className="w-5 h-5" />,
  },
  {
    id: 'plomeria',
    title: 'Plomería',
    subtitle: 'Instalación, reparación, artefactos y desobstrucción',
    accent: '#00A3FF',
    icon: <Droplets className="w-5 h-5" />,
  },
  {
    id: 'resina',
    title: 'Resina epóxica',
    subtitle: 'Pisos domiciliares e industriales, mesas de río y tops 3D',
    accent: '#0059FF',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: 'mantenimiento',
    title: 'Mantenimiento general',
    subtitle: 'Instalaciones, switches, vidrios, paredes y terrazas',
    accent: '#10B981',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    id: 'otro',
    title: 'Otro',
    subtitle: 'Cuéntanos tu requerimiento o proyecto especial',
    accent: '#64748B',
    icon: <HelpCircle className="w-5 h-5" />,
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
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: 'oficina',
    title: 'Oficina',
    desc: 'Espacios de trabajo corporativos y áreas colaborativas',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: 'comercial',
    title: 'Comercial',
    desc: 'Locales, tiendas, plazas y restaurantes',
    icon: <Store className="w-5 h-5" />,
  },
  {
    id: 'recreativo',
    title: 'Recreativo',
    desc: 'Gimnasios, canchas, clubes y áreas sociales',
    icon: <Trophy className="w-5 h-5" />,
  },
  {
    id: 'institucional',
    title: 'Institucional',
    desc: 'Colegios, clínicas, sedes y dependencias',
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    id: 'industrial',
    title: 'Industrial',
    desc: 'Bodegas, plantas, hangares y talleres',
    icon: <Factory className="w-5 h-5" />,
  },
];

export const QuoteForm: React.FC<QuoteFormProps> = ({
  initialProjectType = 'Residencial',
  initialService = 'Pintura y recubrimientos',
  initialMessage = '',
}) => {
  const { currentMood } = useColorMood();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: ¿Qué necesitas?
  const [selectedService, setSelectedService] = useState<string>(initialService);

  // Step 2 State: Tipo de espacio
  const [selectedSpace, setSelectedSpace] = useState<string>(initialProjectType);
  const [estimatedArea, setEstimatedArea] = useState<string>('50 - 150 m²');
  const [desiredTimeline, setDesiredTimeline] = useState<string>('Próximos 7 días');

  // Step 3 State: Datos de contacto y proyecto
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [location, setLocation] = useState<string>('Carretera a El Salvador');
  const [description, setDescription] = useState<string>(initialMessage);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(true);

  // Functional file upload state
  const [uploadedPhotos, setUploadedPhotos] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Determine dynamic form accent color based on chosen service
  const currentServiceObj =
    SERVICE_OPTIONS.find((s) => s.title === selectedService) || SERVICE_OPTIONS[0];
  const formAccentColor = currentServiceObj?.accent || currentMood.color;

  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
    }
  }, [initialService]);

  useEffect(() => {
    if (initialMessage) {
      setDescription(initialMessage);
      setCurrentStep(3);
    }
  }, [initialMessage]);

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return;
    const newPhotos = Array.from(files).map((file) => ({
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

  const handleSubmitWeb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
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

    return `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="cotizar" className="py-20 sm:py-24 bg-transparent border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider shadow-2xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Cotización Inteligente en 3 Pasos</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Cotiza tu proyecto con precisión.
          </h2>

          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal">
            Respuesta profesional en menos de 24 horas. Recibe asesoría técnica en sitio, marcas
            certificadas y garantía por escrito.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Wizard Form Container (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl transition-all">
            {submitted ? (
              /* Success State */
              <div className="text-center py-10 space-y-6 animate-in fade-in duration-300">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-md"
                  style={{ backgroundColor: `${formAccentColor}20`, color: formAccentColor }}
                >
                  <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display">
                    ¡Cotización recibida con éxito!
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600">
                    Gracias, <strong>{fullName}</strong>. Un asesor técnico de Ideas & Colores te
                    contactará al <strong>{phone}</strong> para coordinar la visita y afinar tu
                    presupuesto formal.
                  </p>
                </div>

                {/* Direct WhatsApp Acceleration */}
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 max-w-md mx-auto text-center space-y-3">
                  <p className="text-sm font-bold text-emerald-950">
                    ¿Deseas atención inmediata por WhatsApp?
                  </p>
                  <p className="text-xs text-emerald-800">
                    Envía el resumen de tu cotización directo a nuestro equipo técnico:
                  </p>
                  <a
                    href={buildWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Enviar cotización a WhatsApp</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setCurrentStep(1);
                    setUploadedPhotos([]);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
                >
                  Realizar otra cotización
                </button>
              </div>
            ) : (
              /* Wizard Steps */
              <form onSubmit={handleSubmitWeb}>
                {/* Imported Configuration Alert */}
                {description && (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                          Datos cargados desde la herramienta interactiva
                        </span>
                        <p className="text-xs text-slate-700 font-medium line-clamp-2 mt-0.5">
                          {description}
                        </p>
                      </div>
                    </div>
                    {currentStep !== 3 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 transition-colors"
                      >
                        Ir directo a enviar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-semibold text-amber-900 hover:underline shrink-0"
                      >
                        Ajustar opciones
                      </button>
                    )}
                  </div>
                )}

                {/* Step Progress Bar */}
                <div className="mb-8">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { step: 1, label: '1. ¿Qué necesitas?' },
                      { step: 2, label: '2. Tipo de espacio' },
                      { step: 3, label: '3. Datos del proyecto' },
                    ].map((st) => {
                      const isActive = currentStep === st.step;
                      const isDone = currentStep > st.step;
                      return (
                        <button
                          key={st.step}
                          type="button"
                          onClick={() => {
                            if (st.step === 1) setCurrentStep(1);
                            if (st.step === 2 && currentStep >= 2) setCurrentStep(2);
                            if (st.step === 3 && currentStep === 3) setCurrentStep(3);
                          }}
                          className={`text-left pb-2.5 border-b-2 transition-all ${
                            isActive
                              ? 'border-slate-950 text-slate-950 font-bold'
                              : isDone
                              ? 'border-emerald-500 text-emerald-700 font-semibold'
                              : 'border-slate-200 text-slate-400'
                          }`}
                        >
                          <span className="text-xs sm:text-sm block">{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold">
                    {errorMsg}
                  </div>
                )}

                {/* --- STEPS ANIMATED CONTAINER --- */}
                <AnimatePresence mode="wait">
                  {/* --- STEP 1: ¿Qué necesitas? --- */}
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
                        <h3 className="text-lg font-bold text-slate-950 mb-1">
                          Paso 1: ¿Qué necesitas para tu espacio?
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500">
                          Selecciona el servicio o especialidad de tu interés:
                        </p>
                      </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SERVICE_OPTIONS.map((item) => {
                        const isSelected = selectedService === item.title;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedService(item.title)}
                            className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-3.5 ${
                              isSelected
                                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-offset-2'
                                : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                            }`}
                            style={{
                              ['--tw-ring-color' as string]: isSelected ? item.accent : 'transparent',
                            } as React.CSSProperties}
                          >
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'text-white' : 'bg-white text-slate-700 border border-slate-200'
                              }`}
                              style={{
                                backgroundColor: isSelected ? item.accent : undefined,
                              }}
                            >
                              {item.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-bold truncate">
                                  {item.title}
                                </span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
                                )}
                              </div>
                              <p
                                className={`text-[11px] mt-0.5 leading-tight ${
                                  isSelected ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
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
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-md hover:opacity-95 transition-all"
                        style={{ backgroundColor: formAccentColor }}
                      >
                        <span>Siguiente: Tipo de espacio</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* --- STEP 2: Tipo de espacio --- */}
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
                      <h3 className="text-lg font-bold text-slate-950 mb-1">
                        Paso 2: Tipo de espacio a intervenir
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Indícanos dónde se ubica el proyecto para adaptar la cuadrilla y los materiales:
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
                            className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-offset-2'
                                : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                            }`}
                            style={{
                              ['--tw-ring-color' as string]: isSelected ? formAccentColor : 'transparent',
                            } as React.CSSProperties}
                          >
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-200'
                              }`}
                            >
                              {sp.icon}
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-bold block mb-0.5">
                                {sp.title}
                              </span>
                              <span
                                className={`text-[10px] leading-tight block ${
                                  isSelected ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                {sp.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Additional specifications */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                          Área estimada del espacio:
                        </label>
                        <select
                          value={estimatedArea}
                          onChange={(e) => setEstimatedArea(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none bg-white"
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
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                          Plazo deseado de inicio:
                        </label>
                        <select
                          value={desiredTimeline}
                          onChange={(e) => setDesiredTimeline(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none bg-white"
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

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Atrás</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-md hover:opacity-95 transition-all"
                        style={{ backgroundColor: formAccentColor }}
                      >
                        <span>Siguiente: Datos de contacto</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* --- STEP 3: Datos de contacto & proyecto --- */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-950 mb-1">
                        Paso 3: Tus datos de contacto y detalles
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Te contactaremos para entregarte tu presupuesto desglosado con garantía por escrito:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nombre */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Nombre completo: *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Tu nombre y apellido"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none bg-white"
                        />
                      </div>

                      {/* Teléfono / WhatsApp */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Teléfono / WhatsApp: *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ej: +502 6661-7592"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none bg-white"
                        />
                      </div>

                      {/* Correo */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Correo electrónico:
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu-correo@ejemplo.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none bg-white"
                        />
                      </div>

                      {/* Ubicación */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Ubicación / Sector en Guatemala: *
                        </label>
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Ej: Carretera a El Salvador Km 16, Z.10, Fraijanes..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Descripción de tu necesidad o proyecto:
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detalla dimensiones, estado de la superficie, requerimientos de color o fecha de inicio..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none bg-white"
                      />
                    </div>

                    {/* Adjuntar fotografías (funcional) */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Adjuntar fotografías de referencia (opcional, hasta 4 fotos):
                      </label>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center cursor-pointer hover:border-slate-500 transition-colors bg-slate-50/60"
                      >
                        <UploadCloud className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                        <p className="text-xs font-semibold text-slate-700">
                          Arrastra fotografías aquí o haz clic para seleccionarlas
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          PNG, JPG o HEIC de tus paredes, techos, pisos o muebles
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e.target.files)}
                        />
                      </div>

                      {/* Photo Previews */}
                      {uploadedPhotos.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2.5">
                          {uploadedPhotos.map((item, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200"
                            >
                              <img
                                src={item.preview}
                                alt={`Subida ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePhoto(idx);
                                }}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Privacy terms */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="privacy-check"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <label htmlFor="privacy-check" className="text-xs text-slate-600 leading-tight">
                        Acepto ser contactado por un asesor técnico de Ideas & Colores Guatemala para
                        recibir la cotización y agendar visita técnica si aplica.
                      </label>
                    </div>

                    {/* Form Action Buttons */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Atrás</span>
                      </button>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <a
                          href={buildWhatsAppLink()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-700" />
                          <span>Enviar directo a WhatsApp</span>
                        </a>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md hover:opacity-95 transition-all"
                          style={{ backgroundColor: formAccentColor }}
                        >
                          {isSubmitting ? (
                            <span>Procesando...</span>
                          ) : (
                            <>
                              <span>Enviar cotización</span>
                              <Send className="w-4 h-4" />
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

          {/* Right Summary & Guarantees Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Quotation Summary */}
            <SpotlightCard
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4"
              spotlightColor="rgba(0, 89, 255, 0.1)"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" style={{ color: formAccentColor }} />
                  <span>Resumen de Solicitud</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Paso {currentStep}/3
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Servicio:</span>
                  <span className="font-bold text-slate-900 text-right">{selectedService}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Espacio:</span>
                  <span className="font-bold text-slate-900 text-right">{selectedSpace}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Área:</span>
                  <span className="font-bold text-slate-900 text-right">{estimatedArea}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Plazo:</span>
                  <span className="font-bold text-slate-900 text-right">{desiredTimeline}</span>
                </div>
                {location && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Ubicación:</span>
                    <span className="font-bold text-slate-900 text-right">{location}</span>
                  </div>
                )}
              </div>
            </SpotlightCard>

            {/* Direct Contact Card */}
            <SpotlightCard
              className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-lg space-y-4"
              spotlightColor="rgba(251, 191, 36, 0.12)"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Atención Inmediata
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                ¿Prefieres conversar directamente con nuestro equipo de gerencia técnica?
              </p>

              <div className="space-y-2 text-xs">
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="flex items-center gap-2.5 text-slate-200 hover:text-white p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 transition-colors"
                >
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold">{BUSINESS_INFO.phone}</span>
                </a>

                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="flex items-center gap-2.5 text-slate-200 hover:text-white p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 transition-colors"
                >
                  <span className="font-semibold truncate">{BUSINESS_INFO.email}</span>
                </a>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Horario: {BUSINESS_INFO.scheduleWeekdays}</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
};
