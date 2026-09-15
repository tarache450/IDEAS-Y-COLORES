import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Mail,
  Send,
  Navigation,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';

export const ContactSection: React.FC = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;
    setSent(true);
  };

  const directWhatsAppUrl = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hola%20Ideas%20%26%20Colores%2C%20quiero%20cotizar%20mi%20proyecto.`;

  return (
    <section id="contacto" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
            Canales Verificados
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-display">
            Hablemos de tu proyecto hoy mismo.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Ideas & Colores Multi-Servicios transforma, protege y mantiene espacios con soluciones
            profesionales integrales en Carretera a El Salvador y toda Guatemala.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Info Cards + WhatsApp Large CTA */}
          <div className="lg:col-span-6 space-y-6">
            {/* Direct Information 4-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Teléfono directo
                </h4>
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="text-lg font-bold text-slate-950 hover:text-amber-600 transition-colors block mt-1"
                >
                  {BUSINESS_INFO.phone}
                </a>
                <p className="text-xs text-slate-500 mt-1">Llamadas y coordinación de visitas</p>
              </div>

              {/* WhatsApp Card */}
              <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  WhatsApp Oficial
                </h4>
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-emerald-950 hover:text-emerald-700 transition-colors block mt-1"
                >
                  {BUSINESS_INFO.phone}
                </a>
                <p className="text-xs text-emerald-700 mt-1">Asesoría inmediata y cotizaciones</p>
              </div>

              {/* Email Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Correo Electrónico
                </h4>
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="text-sm font-bold text-slate-950 hover:text-sky-600 transition-colors block mt-1 truncate"
                >
                  {BUSINESS_INFO.email}
                </a>
                <p className="text-xs text-slate-500 mt-1">Gerencia y presupuestos formales</p>
              </div>

              {/* Location Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ubicación Principal
                </h4>
                <p className="text-sm font-bold text-slate-950 mt-1">
                  {BUSINESS_INFO.addressFull}
                </p>
                <p className="text-xs text-slate-500 mt-1">Cobertura en toda Guatemala</p>
              </div>
            </div>

            {/* Required Large WhatsApp CTA Button */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Atención Inmediata
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                  ¿Quieres cotizar por WhatsApp?
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100">
                  Envíanos fotos de tus paredes o las medidas y te asesoramos al instante.
                </p>
              </div>

              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-large-whatsapp-contact"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-emerald-950 font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2.5 shrink-0"
              >
                <MessageCircle className="w-6 h-6 text-emerald-600" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>

            {/* Quick Contact Form */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-base font-bold text-slate-950 font-display mb-1">
                Déjanos tu consulta
              </h4>
              <p className="text-xs text-slate-600 mb-4">
                Si prefieres que te contactemos por llamada o correo, completa tus datos:
              </p>

              {sent ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>¡Mensaje recibido! Te contactaremos a la brevedad posible.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Tu WhatsApp o celular"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="¿Qué servicio o proyecto necesitas cotizar?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Enviar mensaje</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Map & Location Pin Representation */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 relative">
              {/* Google Map embed for Carretera a El Salvador, Guatemala */}
              <div className="aspect-[4/3] sm:aspect-[16/11] w-full relative">
                <iframe
                  title="Ubicación Ideas & Colores Carretera a El Salvador"
                  src="https://maps.google.com/maps?q=Carretera%20a%20El%20Salvador%20Guatemala&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              <div className="p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h5 className="text-sm font-bold text-slate-950">
                    Sede Carretera a El Salvador
                  </h5>
                  <p className="text-xs text-slate-500">
                    Atención técnica en proyectos residenciales, comerciales e industriales
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Carretera+a+El+Salvador+Guatemala"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-sky-600" />
                    <span>Ver en Google Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Regional coverage list */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cobertura en toda la República de Guatemala:</span>
              </div>
              <p className="leading-relaxed">
                Carretera a El Salvador (km 8 al 30), Santa Catarina Pinula, Fraijanes, San José
                Pinula, Muxbal, Zonas 10, 14, 15 y 16, y atención técnica en departamentos para
                obras comerciales e industriales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
