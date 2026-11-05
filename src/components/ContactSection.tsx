import React from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Navigation,
  ShieldCheck,
  Instagram,
  Facebook,
  Star,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';
import { SpotlightCard } from './ui/SpotlightCard';
import { StaggeredText } from './ui/StaggeredText';
import { GoogleIcon } from './ui/GoogleIcon';
import {
  buildSafeWhatsAppUrl,
  getObfuscatedEmailDisplay,
  buildSafeMailtoUrl,
} from '../utils/security';

export const ContactSection: React.FC = () => {
  const directWhatsAppUrl = buildSafeWhatsAppUrl(
    BUSINESS_INFO.whatsappNumber,
    'Hola Ideas & Colores, quiero cotizar mi proyecto.'
  );

  return (
    <section id="contacto" className="py-20 sm:py-24 bg-transparent border-b border-slate-200/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-300">
            Canales Verificados y Ubicación
          </span>
          <div className="mt-3">
            <StaggeredText
              text="Atención directa en Carretera a El Salvador y toda Guatemala."
              as="h2"
              className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-display"
            />
          </div>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Comunícate directamente con nuestra gerencia técnica por teléfono, WhatsApp o correo electrónico para coordinar tu visita sin costo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 4 Direct Information Cards + Social & WhatsApp Banner */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Card */}
              <SpotlightCard
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all"
                spotlightColor="rgba(251, 191, 36, 0.15)"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Teléfono directo
                </h3>
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="text-lg font-bold text-slate-950 hover:text-amber-600 transition-colors block mt-1"
                >
                  {BUSINESS_INFO.phone}
                </a>
                <p className="text-xs text-slate-500 mt-1">{BUSINESS_INFO.scheduleWeekdays}</p>
              </SpotlightCard>

              {/* WhatsApp Card */}
              <SpotlightCard
                className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 shadow-2xs hover:shadow-md transition-all"
                spotlightColor="rgba(16, 185, 129, 0.18)"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  WhatsApp Oficial
                </h3>
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-emerald-950 hover:text-emerald-700 transition-colors block mt-1"
                >
                  {BUSINESS_INFO.phone}
                </a>
                <p className="text-xs text-emerald-700 mt-1">Asesoría inmediata y cotizaciones</p>
              </SpotlightCard>

              {/* Email Card */}
              <SpotlightCard
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all"
                spotlightColor="rgba(0, 89, 255, 0.12)"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Correo Corporativo
                </h3>
                <a
                  href={buildSafeMailtoUrl('Consulta de Proyecto - Ideas & Colores')}
                  className="text-sm font-bold text-slate-950 hover:text-sky-600 transition-colors block mt-1 truncate"
                >
                  {getObfuscatedEmailDisplay()}
                </a>
                <p className="text-xs text-slate-500 mt-1">Gerencia y presupuestos formales</p>
              </SpotlightCard>

              {/* Location Card */}
              <SpotlightCard
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all"
                spotlightColor="rgba(168, 85, 247, 0.12)"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ubicación Principal
                </h3>
                <p className="text-sm font-bold text-slate-950 mt-1">
                  {BUSINESS_INFO.addressFull}
                </p>
                <p className="text-xs text-slate-500 mt-1">{BUSINESS_INFO.scheduleSaturdays}</p>
              </SpotlightCard>
            </div>

            {/* Social Media & Google Business Review Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={BUSINESS_INFO.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="contact-btn-google-reviews"
                className="sm:col-span-2 p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-amber-50/40 border border-slate-200/90 hover:border-amber-300 shadow-2xs hover:shadow-md flex items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                    <GoogleIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                        Perfil de Google
                      </span>
                      <span className="inline-flex items-center text-amber-400 text-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span className="font-bold text-slate-800 ml-1 text-xs">{BUSINESS_INFO.googleRating}</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-950 group-hover:text-amber-700 transition-colors truncate">
                      Deja tu reseña o comentario en Google
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl shadow-2xs transition-all shrink-0">
                  Calificar ★
                </span>
              </a>

              <a
                href={BUSINESS_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="contact-btn-instagram"
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md flex items-center justify-between gap-3 transition-all hover:border-pink-300 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Instagram className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600 block">
                      Instagram
                    </span>
                    <p className="text-xs font-bold text-slate-950 group-hover:text-pink-600 transition-colors truncate">
                      {BUSINESS_INFO.instagram}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 group-hover:bg-pink-600 group-hover:text-white px-2.5 py-1 rounded-lg border border-slate-200 transition-all shrink-0">
                  Ver →
                </span>
              </a>

              <a
                href={BUSINESS_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="contact-btn-facebook"
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md flex items-center justify-between gap-3 transition-all hover:border-blue-300 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Facebook className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                      Facebook
                    </span>
                    <p className="text-xs font-bold text-slate-950 group-hover:text-blue-600 transition-colors truncate">
                      Ideas &amp; Colores
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1 rounded-lg border border-slate-200 transition-all shrink-0">
                  Ver →
                </span>
              </a>
            </div>

            {/* Large WhatsApp CTA Button */}
            <div className="p-7 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Atención Inmediata
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                  ¿Prefieres enviar fotos por WhatsApp?
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100">
                  Envíanos fotos de tus ambientes o medidas aproximadas y te asesoramos al instante.
                </p>
              </div>

              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-large-whatsapp-contact"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-emerald-950 font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2.5 shrink-0"
              >
                <MessageCircle className="w-6 h-6 text-emerald-600" aria-hidden="true" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right: Map & Location Pin Representation */}
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 relative">
              <div className="aspect-[4/3] sm:aspect-[16/11] w-full relative">
                <iframe
                  title="Ubicación Ideas & Colores Carretera a El Salvador Km 21.5, Fraijanes, Guatemala"
                  src="https://maps.google.com/maps?q=Carretera%20a%20El%20Salvador%20Km%2021.5%2C%20Fraijanes%2C%20Guatemala&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              <div className="p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-950">
                    Sede Carretera a El Salvador Km 21.5, Fraijanes
                  </h4>
                  <p className="text-xs text-slate-500">
                    Carretera a El Salvador Km 21.5, Fraijanes, Guatemala · Atención residencial, comercial e industrial
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Carretera+a+El+Salvador+Km+21.5+Fraijanes+Guatemala"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                    <span>Abrir en Google Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Regional coverage list */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
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
