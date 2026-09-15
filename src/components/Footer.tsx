import React from 'react';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, Mail, ArrowUp } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { BUSINESS_INFO, MULTI_SERVICES_CATEGORIES } from '../data/content';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="light" size="md" showSlogan={true} />
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm pt-2">
              {BUSINESS_INFO.positioning}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Garantía por escrito en mano de obra y productos seleccionados.
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { id: 'inicio', label: 'Inicio' },
                { id: 'soluciones', label: 'Multi-Servicios' },
                { id: 'sectores', label: 'Sectores' },
                { id: 'servicios', label: 'Confianza & Pilares' },
                { id: 'proyectos', label: 'Galería de Proyectos' },
                { id: 'promociones', label: 'Promociones' },
                { id: 'cotizar', label: 'Cotización Inteligente' },
                { id: 'contacto', label: 'Contacto' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className="text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 6 Multi-Services List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">
              Multi-Servicios
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              {MULTI_SERVICES_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate('soluciones')}
                    className="hover:text-white transition-colors text-left"
                  >
                    {cat.shortTitle}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">
              Contacto Verificado
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.addressFull}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {BUSINESS_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="hover:text-white transition-colors truncate"
                >
                  {BUSINESS_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hola%20Ideas%20%26%20Colores%2C%20quiero%20cotizar%20mi%20proyecto.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  WhatsApp: {BUSINESS_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p>{BUSINESS_INFO.scheduleWeekdays}</p>
                  <p className="text-[11px] text-slate-500">{BUSINESS_INFO.scheduleSaturdays}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright + Back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Ideas & Colores Multi-Servicios Guatemala. Fundada en{' '}
            {BUSINESS_INFO.foundationYear}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span>Guatemala, C.A.</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              title="Volver al inicio"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Subir</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
