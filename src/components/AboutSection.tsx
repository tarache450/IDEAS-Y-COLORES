import React from 'react';
import { Eye, Clock, Scale, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { ABOUT_VALUES, BUSINESS_INFO } from '../data/content';

export const AboutSection: React.FC = () => {
  const iconMap: Record<string, React.ReactNode> = {
    Eye: <Eye className="w-6 h-6 text-amber-500" />,
    Clock: <Clock className="w-6 h-6 text-sky-500" />,
    Scale: <Scale className="w-6 h-6 text-emerald-500" />,
    CheckCircle2: <CheckCircle2 className="w-6 h-6 text-rose-500" />,
  };

  return (
    <section id="nosotros" className="py-20 bg-transparent border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Editorial Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Sobre Ideas & Colores Multi-Servicios
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display leading-tight">
              Color que transforma, soluciones que perduran.
            </h2>

            <div className="space-y-4 text-base text-slate-600 leading-relaxed font-normal">
              <p>
                <strong>Ideas & Colores Multi-Servicios</strong> nace en {BUSINESS_INFO.foundationYear}{' '}
                con el propósito de eliminar la dispersión de proveedores y la improvisación técnica
                en Guatemala, transformando, protegiendo y manteniendo espacios mediante soluciones
                profesionales integrales.
              </p>
              <p>
                No somos únicamente una empresa de pintura: coordinamos en un solo equipo de
                confianza las especialidades de pintura y recubrimientos, impresión digital,
                carpintería a la medida, plomería, resinas epóxicas e instalaciones generales.
              </p>
              <p>
                Trabajamos con marcas reconocidas tanto locales como internacionales, personal
                debidamente calificado, y un compromiso que nos distingue: garantía por escrito en
                mano de obra y materiales.
              </p>
            </div>

            {/* Formal Technical backing */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-xs sm:text-sm text-slate-700">
                <strong className="block text-slate-950 font-bold mb-0.5">
                  Estándar técnico y respaldo formal
                </strong>
                Asesoramiento y soporte personalizado por técnicos certificados en líneas
                Arquitectónico, Industrial, Automotriz y Madera con garantía por escrito.
              </div>
            </div>
          </div>

          {/* Right Core Values Grid */}
          <div className="lg:col-span-6 space-y-4">
            <div className="text-left mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Nuestros pilares
              </span>
              <h3 className="text-2xl font-bold text-slate-950 font-display mt-1">
                Principios que guían cada proyecto
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ABOUT_VALUES.map((val) => (
                <div
                  key={val.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                      {iconMap[val.icon]}
                    </div>
                    <h4 className="text-base font-bold text-slate-950 font-display mb-1.5">
                      {val.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Guatemala identity statement */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Empresa 100% Guatemalteca</h4>
                  <p className="text-xs text-slate-400">
                    Sede en Carretera a El Salvador con cobertura en toda Guatemala
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
