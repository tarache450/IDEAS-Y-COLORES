import React, { useEffect } from 'react';
import { X, ShieldCheck, Lock, FileText, CheckCircle2, Scale, Mail, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BUSINESS_INFO } from '../data/content';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="privacy-modal-title" className="text-base sm:text-lg font-bold text-slate-950 font-display">
                    Aviso de Privacidad y Protección de Datos Personales
                  </h3>
                  <p className="text-xs text-slate-500">
                    Conforme a la legislación vigente de la República de Guatemala
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 flex items-center justify-center transition-colors"
                aria-label="Cerrar aviso de privacidad"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {/* Highlight Badge */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-950 flex items-start gap-3">
                <Scale className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 mb-1">
                    Compromiso de Legalidad y Confidencialidad en Guatemala
                  </h4>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>Ideas & Colores Multi-Servicios</strong> garantiza el tratamiento confidencial,
                    lícito y seguro de la información personal de sus clientes, en estricta observancia del marco
                    constitucional y legal guatemalteco de protección de datos personales.
                  </p>
                </div>
              </div>

              {/* 1. Marco Legal */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>1. Marco Legal Aplicable en Guatemala</span>
                </h4>
                <p>
                  El presente aviso y las políticas de tratamiento de datos de nuestra empresa se fundamentan en:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>
                    <strong>Constitución Política de la República de Guatemala:</strong> Artículo 24 (Inviolabilidad
                    de correspondencia, documentos y libros) y Artículo 31 (Acceso a archivos y registros estatales / Habeas Data).
                  </li>
                  <li>
                    <strong>Decreto Número 57-2008 del Congreso de la República de Guatemala (Ley de Acceso a la Información Pública):</strong>{' '}
                    Artículos 9, 22, 23 y 64, que regulan la confidencialidad de datos personales sensibles y el principio
                    de consentimiento expreso para su tratamiento y custodia.
                  </li>
                  <li>
                    <strong>Decreto Número 47-2008 del Congreso de la República de Guatemala:</strong> Ley para el
                    Reconocimiento de las Comunicaciones y Firmas Electrónicas, que rige la validez de los acuerdos y
                    formularios enviados por canales digitales.
                  </li>
                  <li>
                    <strong>Código Civil y Código de Comercio de Guatemala:</strong> Principios de buena fe contractual y
                    reserva del secreto profesional y comercial.
                  </li>
                </ul>
              </div>

              {/* 2. Responsable del Tratamiento */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>2. Responsable del Tratamiento de Datos</span>
                </h4>
                <p>
                  El responsable de la recepción, custodia y gestión de los datos recopilados en esta plataforma web es:
                </p>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <p><strong>Razón Comercial:</strong> {BUSINESS_INFO.name}</p>
                  <p><strong>Ubicación Principal:</strong> {BUSINESS_INFO.addressFull}</p>
                  <p><strong>Canal Oficial de Privacidad:</strong> {BUSINESS_INFO.email}</p>
                  <p><strong>Teléfono / WhatsApp de Atención:</strong> {BUSINESS_INFO.phone}</p>
                </div>
              </div>

              {/* 3. Datos que Recolectamos y Finalidad */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3. Datos Recopilados y Principio de Finalidad</span>
                </h4>
                <p>
                  Recolectamos exclusivamente los datos necesarios para brindar asesoría técnica y formular presupuestos:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Datos de Identificación y Contacto:</strong> Nombre y apellidos, número de teléfono o WhatsApp, correo electrónico.</li>
                  <li><strong>Datos del Inmueble y Proyecto:</strong> Ubicación geográfica en Guatemala (municipio, zona o kilómetro), área estimada en metros cuadrados, tipo de espacio y requerimiento técnico.</li>
                  <li><strong>Fotografías de Referencia:</strong> Imágenes opcionales de paredes, pisos o mobiliario que el cliente adjunte para evaluar el estado de la superficie.</li>
                </ul>
                <p className="pt-1 font-semibold text-slate-800">
                  Finalidad Exclusiva: Dichos datos se emplean únicamente para:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-600">
                  <li>Elaborar y remitir la cotización técnica solicitada.</li>
                  <li>Coordinar la visita técnica diagnóstica sin costo en su inmueble si el cliente lo autoriza.</li>
                  <li>Formalizar la garantía escrita de mano de obra y materiales una vez contratado el servicio.</li>
                </ol>
              </div>

              {/* 4. No Cesión a Terceros */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-500" />
                  <span>4. Prohibición Estricta de Comercialización o Cesión</span>
                </h4>
                <p>
                  En cumplimiento del Artículo 64 del Decreto 57-2008, <strong>Ideas & Colores Multi-Servicios NUNCA vende,
                  alquila, cede ni transfiere</strong> sus bases de datos o información de contacto a terceras empresas,
                  agencias de mercadeo masivo o plataformas de publicidad. Su información permanece estrictamente resguardada
                  para la relación contractual directa entre usted y nuestra empresa.
                </p>
              </div>

              {/* 5. Medidas de Seguridad Técnica */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>5. Medidas de Seguridad Técnica y Criptográfica</span>
                </h4>
                <p>
                  Para salvaguardar sus datos frente a accesos no autorizados, pérdida o alteración, implementamos:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Conexión Cifrada SSL/TLS:</strong> Tráfico web transmitido bajo protocolo seguro HTTPS de 256 bits.</li>
                  <li><strong>Políticas de Seguridad en Base de Datos (Row Level Security - RLS):</strong> La base de datos impide de manera estricta que usuarios públicos o anónimos consulten, lean, alteren o eliminen información de cotizaciones ajenas.</li>
                  <li><strong>Filtros Sanitizadores y Anti-Spam:</strong> Bloqueo automatizado de inyección de código (XSS/SQL) y descarte de bots mediante honeypots técnicos.</li>
                </ul>
              </div>

              {/* 6. Derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-600" />
                  <span>6. Ejercicio de Derechos de Cancelación y Supresión de Datos</span>
                </h4>
                <p>
                  Usted tiene derecho en cualquier momento a conocer qué datos conservamos, solicitar su actualización, o
                  exigir la eliminación definitiva e inmediata de sus registros de contacto una vez concluida su cotización:
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Solicitud de baja o actualización de datos:</p>
                    <p className="text-xs text-slate-600">Escríbenos indicando tu nombre y teléfono de referencia.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`mailto:${BUSINESS_INFO.email}?subject=Solicitud%20de%20Privacidad%20y%20Baja%20de%20Datos%20-%20Guatemala`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{BUSINESS_INFO.email}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 text-center sm:text-left">
                Vigencia actualizada • {BUSINESS_INFO.location}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Entendido y cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
