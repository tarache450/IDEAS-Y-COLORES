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
import { useColorMood } from '../context/ColorMoodContext';
import { StaggeredText } from './ui/StaggeredText';
import { GoogleIcon } from './ui/GoogleIcon';
import {
  buildSafeWhatsAppUrl,
  getObfuscatedEmailDisplay,
  buildSafeMailtoUrl,
} from '../utils/security';

export const ContactSection: React.FC = () => {
  const { currentMood } = useColorMood();
  const directWhatsAppUrl = buildSafeWhatsAppUrl(
    BUSINESS_INFO.whatsappNumber,
    'Hola Ideas & Colores, quiero cotizar mi proyecto.'
  );

  return (
    <section
      id="contacto"
      className="py-20 sm:py-28 bg-[#F4F5F7] border-b border-[#E8E9EE] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Roofera Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14 pb-8 border-b border-[#E8E9EE]">
          <div className="max-w-3xl text-left">
            <div className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#80828C] mb-3">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: currentMood.color }}
              />
              <span>Canales Verificados y Sede Central</span>
            </div>

            <div className="flex items-baseline">
              <StaggeredText
                text="Atención en Carretera a El Salvador y toda Guatemala"
                as="h2"
                className="text-3xl sm:text-5xl font-black text-[#090E19] tracking-[-0.04em] leading-[1.06] font-display inline"
              />
              <span
                className="text-4xl sm:text-5xl font-black leading-none select-none"
                style={{ color: currentMood.color }}
              >
                .
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#525663] leading-relaxed max-w-md text-left">
            Comunícate con nuestra gerencia técnica por teléfono, WhatsApp o correo para coordinar
            tu visita sin costo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 4 Direct Contact Cards + Social Channels */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Card */}
              <div className="p-6 rounded-xl bg-white border border-[#E8E9EE] hover:border-[#090E19]/30 transition-all">
                <div
                  className="w-10 h-10 rounded-md text-white flex items-center justify-center mb-3"
                  style={{ backgroundColor: currentMood.color }}
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#80828C]">
                  Teléfono directo
                </h3>
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="text-lg font-black text-[#090E19] hover:opacity-80 transition-opacity block mt-1"
                >
                  {BUSINESS_INFO.phone}
                </a>
                <p className="text-xs text-[#525663] mt-1">{BUSINESS_INFO.scheduleWeekdays}</p>
              </div>

              {/* WhatsApp Card */}
              <div className="p-6 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 transition-all">
                <div className="w-10 h-10 rounded-md bg-emerald-600 text-white flex items-center justify-center mb-3">
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                  WhatsApp Oficial
                </h3>
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-black text-[#090E19] hover:text-emerald-700 transition-colors block mt-1"
                >
                  {BUSINESS_INFO.phone}
                </a>
                <p className="text-xs text-[#525663] mt-1">Asesoría inmediata y cotizaciones</p>
              </div>

              {/* Email Card */}
              <div className="p-6 rounded-xl bg-white border border-[#E8E9EE] hover:border-[#090E19]/30 transition-all">
                <div className="w-10 h-10 rounded-md bg-[#090E19] text-white flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#80828C]">
                  Correo Corporativo
                </h3>
                <a
                  href={buildSafeMailtoUrl('Consulta de Proyecto - Ideas & Colores')}
                  className="text-sm font-black text-[#090E19] hover:opacity-80 transition-opacity block mt-1 truncate"
                >
                  {getObfuscatedEmailDisplay()}
                </a>
                <p className="text-xs text-[#525663] mt-1">Gerencia y presupuestos formales</p>
              </div>

              {/* Location Card */}
              <div className="p-6 rounded-xl bg-white border border-[#E8E9EE] hover:border-[#090E19]/30 transition-all">
                <div className="w-10 h-10 rounded-md bg-[#090E19] text-white flex items-center justify-center mb-3">
                  <MapPin
                    className="w-5 h-5"
                    style={{ color: currentMood.color }}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#80828C]">
                  Ubicación Principal
                </h3>
                <p className="text-sm font-black text-[#090E19] mt-1">
                  {BUSINESS_INFO.addressFull}
                </p>
                <p className="text-xs text-[#525663] mt-1">{BUSINESS_INFO.scheduleSaturdays}</p>
              </div>
            </div>

            {/* Social Media & Google Business Review Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={BUSINESS_INFO.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="contact-btn-google-reviews"
                className="sm:col-span-2 p-4 rounded-xl bg-white border border-[#E8E9EE] hover:border-[#090E19]/40 flex items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-md bg-[#F4F5F7] border border-[#E8E9EE] flex items-center justify-center shrink-0">
                    <GoogleIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[11px] font-extrabold uppercase tracking-wider"
                        style={{ color: currentMood.color }}
                      >
                        Perfil de Google
                      </span>
                      <span className="inline-flex items-center text-amber-400 text-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span className="font-bold text-[#090E19] ml-1 text-xs">
                          {BUSINESS_INFO.googleRating}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#090E19] truncate">
                      Deja tu reseña o comentario en Google
                    </p>
                  </div>
                </div>

                <span
                  className="text-xs font-bold text-white px-3.5 py-2 rounded-md shrink-0"
                  style={{ backgroundColor: currentMood.color }}
                >
                  Calificar ★
                </span>
              </a>

              <a
                href={BUSINESS_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="contact-btn-instagram"
                className="p-3.5 rounded-xl bg-white border border-[#E8E9EE] hover:border-pink-400 flex items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600 block">
                      Instagram
                    </span>
                    <p className="text-xs font-bold text-[#090E19] truncate">
                      {BUSINESS_INFO.instagram}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#090E19] bg-[#F4F5F7] px-2.5 py-1 rounded-md shrink-0">
                  Ver →
                </span>
              </a>

              <a
                href={BUSINESS_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="contact-btn-facebook"
                className="p-3.5 rounded-xl bg-white border border-[#E8E9EE] hover:border-blue-400 flex items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Facebook className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
                      Facebook
                    </span>
                    <p className="text-xs font-bold text-[#090E19] truncate">Ideas &amp; Colores</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#090E19] bg-[#F4F5F7] px-2.5 py-1 rounded-md shrink-0">
                  Ver →
                </span>
              </a>
            </div>

            {/* Large WhatsApp Dark Banner */}
            <div className="p-6 sm:p-7 rounded-xl bg-[#090E19] text-white border border-[#27324D] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-400">
                  Atención Inmediata
                </span>
                <h3 className="text-xl font-black font-display text-white">
                  ¿Prefieres enviar fotos por WhatsApp?
                </h3>
                <p className="text-xs text-[#B8BCC6]">
                  Envíanos fotos de tus ambientes o medidas aproximadas y te asesoramos al instante.
                </p>
              </div>

              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-large-whatsapp-contact"
                className="w-full sm:w-auto px-5 py-3.5 min-h-[48px] rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                <span>Hablar por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right: Map Carretera a El Salvador Km 21.5, Fraijanes */}
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="rounded-xl overflow-hidden border border-[#E8E9EE] shadow-md bg-white relative">
              <div className="aspect-[4/3] sm:aspect-[16/11] w-full relative bg-[#E8E9EE]">
                <iframe
                  title="Ubicación Ideas & Colores Carretera a El Salvador Km 21.5, Fraijanes, Guatemala"
                  src="https://maps.google.com/maps?q=Carretera%20a%20El%20Salvador%20Km%2021.5%2C%20Fraijanes%2C%20Guatemala&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              <div className="p-5 bg-white border-t border-[#E8E9EE] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-[#090E19] font-display">
                    Sede Carretera a El Salvador Km 21.5, Fraijanes
                  </h4>
                  <p className="text-xs text-[#525663]">
                    Carretera a El Salvador Km 21.5, Fraijanes, Guatemala · Atención residencial,
                    comercial e industrial
                  </p>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Carretera+a+El+Salvador+Km+21.5+Fraijanes+Guatemala"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md bg-[#090E19] hover:bg-[#151D30] text-white text-xs font-bold transition-colors"
                >
                  <Navigation
                    className="w-3.5 h-3.5"
                    style={{ color: currentMood.color }}
                    aria-hidden="true"
                  />
                  <span>Abrir en Google Maps</span>
                </a>
              </div>
            </div>

            {/* Regional coverage */}
            <div className="p-5 rounded-xl bg-white border border-[#E8E9EE] text-xs text-[#525663] space-y-2">
              <div className="flex items-center gap-2 text-[#090E19] font-extrabold">
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
