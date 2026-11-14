import React from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Mail,
  ArrowUp,
  Instagram,
  Facebook,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { GoogleIcon } from './ui/GoogleIcon';
import { BUSINESS_INFO, MULTI_SERVICES_CATEGORIES } from '../data/content';
import { useColorMood } from '../context/ColorMoodContext';
import {
  buildSafeWhatsAppUrl,
  getObfuscatedEmailDisplay,
  buildSafeMailtoUrl,
} from '../utils/security';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenCategoryPage?: (categoryId: string) => void;
  onOpenAdmin?: () => void;
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenCategoryPage,
  onOpenAdmin,
  onOpenPrivacy,
}) => {
  const { currentMood } = useColorMood();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#090E19] text-[#B8BCC6] pt-16 pb-12 border-t border-[#27324D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#27324D]">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <BrandLogo variant="light" size="md" showSlogan={true} />
            <p className="text-xs sm:text-sm text-[#80828C] leading-relaxed max-w-sm pt-2">
              {BUSINESS_INFO.positioning}
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-[#B8BCC6]">
              <ShieldCheck
                className="w-4 h-4 shrink-0"
                style={{ color: currentMood.color }}
                aria-hidden="true"
              />
              <span>Garantía por escrito en mano de obra y productos seleccionados.</span>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href={BUSINESS_INFO.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="footer-btn-google-reviews"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#151D30] border border-[#27324D] text-[#E8E9EE] hover:text-white hover:border-white/30 text-xs font-bold transition-all"
                aria-label="Dejar reseña en Google para Ideas & Colores"
                title="Dejar reseña en Google (5.0 ★)"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Google (5.0 ★)</span>
              </a>
              <a
                href={BUSINESS_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#151D30] border border-[#27324D] text-[#E8E9EE] hover:text-white hover:border-pink-400/50 text-xs font-bold transition-all"
                aria-label="Seguir a Ideas & Colores en Instagram"
              >
                <Instagram className="w-4 h-4 text-pink-400" aria-hidden="true" />
                <span>Instagram</span>
              </a>
              <a
                href={BUSINESS_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#151D30] border border-[#27324D] text-[#E8E9EE] hover:text-white hover:border-blue-400/50 text-xs font-bold transition-all"
                aria-label="Seguir a Ideas & Colores en Facebook"
              >
                <Facebook className="w-4 h-4 text-blue-400" aria-hidden="true" />
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3 text-left">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-white font-display">
              Navegación
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { id: 'inicio', label: 'Inicio' },
                { id: 'confianza', label: 'Confianza & Respaldo' },
                { id: 'soluciones', label: 'Multi-Servicios' },
                { id: 'sectores', label: 'Sectores' },
                { id: 'herramientas', label: 'Color & Calculadora' },
                { id: 'proyectos', label: 'Galería de Proyectos' },
                { id: 'promociones', label: 'Promociones' },
                { id: 'faq', label: 'Preguntas Frecuentes' },
                { id: 'cotizar', label: 'Cotizar Proyecto' },
                { id: 'contacto', label: 'Contacto' },
              ].map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.id);
                    }}
                    className="text-[#80828C] hover:text-white transition-colors inline-block"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 6 Multi-Services Subpage Links */}
          <div className="space-y-3 text-left">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-white font-display">
              Especialidades
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-[#80828C]">
              {MULTI_SERVICES_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/servicios/${cat.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenCategoryPage) {
                        onOpenCategoryPage(cat.id);
                      } else {
                        onNavigate('soluciones');
                      }
                    }}
                    className="hover:text-white transition-colors text-left inline-block py-0.5"
                  >
                    {cat.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Direct (NAP) */}
          <div className="space-y-3 text-left">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-white font-display">
              Contacto y Cobertura (NAP)
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: currentMood.color }}
                  aria-hidden="true"
                />
                <span>
                  {BUSINESS_INFO.addressFull} — Cobertura en Ciudad de Guatemala (Zonas 10, 14, 15
                  y 16), Carretera a El Salvador, Fraijanes, Mixco y Villa Nueva.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone
                  className="w-4 h-4 shrink-0"
                  style={{ color: currentMood.color }}
                  aria-hidden="true"
                />
                <a href={`tel:${BUSINESS_INFO.phoneClean}`} className="hover:text-white transition-colors">
                  {BUSINESS_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck
                  className="w-4 h-4 shrink-0"
                  style={{ color: currentMood.color }}
                  aria-hidden="true"
                />
                <a
                  href="https://ideasycoloresgt.site/"
                  className="hover:text-white transition-colors"
                >
                  Web: {BUSINESS_INFO.website}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail
                  className="w-4 h-4 shrink-0"
                  style={{ color: currentMood.color }}
                  aria-hidden="true"
                />
                <a
                  href={buildSafeMailtoUrl('Consulta Web - Ideas & Colores')}
                  className="hover:text-white transition-colors truncate"
                >
                  {getObfuscatedEmailDisplay()}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <a
                  href={buildSafeWhatsAppUrl(
                    BUSINESS_INFO.whatsappNumber,
                    'Hola Ideas & Colores, quiero cotizar mi proyecto.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  WhatsApp: {BUSINESS_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" aria-hidden="true" />
                <a
                  href={BUSINESS_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors"
                >
                  Instagram: {BUSINESS_INFO.instagram}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Facebook className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
                <a
                  href={BUSINESS_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors truncate"
                >
                  Facebook: {BUSINESS_INFO.facebook}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <a
                  href={BUSINESS_INFO.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 truncate"
                >
                  <span>Google: Reseñas ({BUSINESS_INFO.googleRating} ★)</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-[#80828C]">
                <Clock className="w-4 h-4 text-[#80828C] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p>{BUSINESS_INFO.scheduleWeekdays}</p>
                  <p className="text-[11px] text-[#80828C]">{BUSINESS_INFO.scheduleSaturdays}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#80828C]">
          <p>
            © {new Date().getFullYear()} Ideas &amp; Colores Multi-Servicios Guatemala. Fundada en{' '}
            {BUSINESS_INFO.foundationYear}. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4">
            <span>Guatemala, C.A.</span>
            {onOpenPrivacy && (
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-[#B8BCC6] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer flex items-center gap-1"
                title="Aviso de Privacidad y Protección de Datos Personales (Guatemala - Decreto 57-2008)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Privacidad (Dto. 57-2008)</span>
              </button>
            )}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-[#B8BCC6] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
                title="Acceso exclusivo al CRM de Administrador"
              >
                🔒 Staff CRM
              </button>
            )}
            <button
              type="button"
              onClick={scrollToTop}
              className="px-3 py-2 min-h-[40px] rounded-md bg-[#151D30] hover:bg-black text-white border border-[#27324D] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Volver al inicio"
            >
              <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Subir</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
