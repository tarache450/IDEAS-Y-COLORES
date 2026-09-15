import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customNote, setCustomNote] = useState('');

  const defaultWaText = 'Hola Ideas & Colores, quiero cotizar mi proyecto.';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const message = customNote.trim()
      ? `Hola Ideas & Colores, quiero cotizar mi proyecto: ${encodeURIComponent(customNote)}`
      : encodeURIComponent(defaultWaText);
    window.open(`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${message}`, '_blank');
    setIsOpen(false);
    setCustomNote('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end print:hidden">
      {/* Interactive Quick Chat Drawer / Tooltip */}
      {isOpen && (
        <div
          id="whatsapp-quick-dialog"
          className="mb-3 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm leading-tight text-white">
                    Ideas & Colores Multi-Servicios
                  </h4>
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    En línea • Asesoría técnica
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-whatsapp-bubble"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                aria-label="Cerrar ventana WhatsApp"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              ¡Hola! Con gusto te asesoramos con pintura, recubrimientos y multi-servicios para tu
              espacio en Guatemala.
            </p>
          </div>

          {/* Quick preset suggestions */}
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-1.5">
            {[
              'Cotizar pintura y aplicación',
              'Impresión digital',
              'Carpintería a la medida',
              'Plomería y mantenimiento',
              'Resina epóxica',
              'Instalaciones generales',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCustomNote(preset)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-3.5 bg-white">
            <div className="relative">
              <input
                type="text"
                id="whatsapp-custom-input"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Escribe tu consulta o proyecto..."
                className="w-full text-xs sm:text-sm pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
              <button
                type="submit"
                id="btn-submit-whatsapp-quick"
                className="absolute right-1.5 top-1.5 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition-colors shadow-sm"
                aria-label="Enviar mensaje a WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-slate-600">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Respuesta en menos de 15 min
              </span>
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
                  defaultWaText
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Abrir directo
              </a>
            </div>
          </form>
        </div>
      )}

      {/* Main floating trigger button */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-lg border border-slate-200 text-xs font-semibold text-slate-800 animate-in fade-in slide-in-from-right-3 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            ¿Necesitas cotizar hoy?
          </span>
        )}
        <button
          type="button"
          id="btn-floating-whatsapp"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Hablar por WhatsApp con Ideas & Colores"
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-200"
        >
          <span className="sr-only">Abrir WhatsApp de Ideas & Colores</span>
          <MessageCircle className="w-7 h-7 transition-transform group-hover:rotate-6" />
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white" />
          </span>
        </button>
      </div>
    </div>
  );
};
