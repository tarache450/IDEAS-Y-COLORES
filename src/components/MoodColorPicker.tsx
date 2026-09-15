import React from 'react';
import { useColorMood, ColorMood } from '../context/ColorMoodContext';
import { Sparkles, Check } from 'lucide-react';

interface MoodColorPickerProps {
  className?: string;
  variant?: 'compact' | 'full' | 'floating';
}

export const MoodColorPicker: React.FC<MoodColorPickerProps> = ({
  className = '',
  variant = 'full',
}) => {
  const { activeMood, setMood, allMoods, currentMood } = useColorMood();

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 p-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 shadow-xs ${className}`}
        id="mood-selector-compact"
      >
        <span className="text-[10px] font-bold text-slate-500 pl-2 pr-1 uppercase tracking-wider hidden sm:inline">
          Mood:
        </span>
        {allMoods.map((mood) => {
          const isActive = activeMood === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => setMood(mood.id)}
              className={`relative w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${
                isActive ? 'scale-110 shadow-sm ring-2 ring-offset-2' : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{
                backgroundColor: mood.color,
                ['--tw-ring-color' as string]: mood.color,
              } as React.CSSProperties}
              title={`${mood.name} - ${mood.concept}`}
              aria-label={`Seleccionar tono ${mood.name}`}
            >
              {isActive && (
                <Check
                  className="w-3 h-3 stroke-[3]"
                  style={{ color: mood.textColorOnAccent }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/90 p-3 sm:p-4 shadow-sm transition-all ${className}`}
      id="mood-selector-full"
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5" style={{ color: currentMood.color }} />
          <span>Color en Movimiento</span>
          <span className="text-[11px] font-normal text-slate-500">• Selecciona la energía de tu proyecto</span>
        </div>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors duration-400"
          style={{
            backgroundColor: currentMood.lightBg,
            color: currentMood.id === 'amarillo' ? '#854D0E' : currentMood.color,
          }}
        >
          {currentMood.name}
        </span>
      </div>

      {/* 4 Mood Selector Chips (Azul, Naranja, Amarillo, Celeste) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {allMoods.map((mood) => {
          const isActive = activeMood === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              id={`btn-mood-${mood.id}`}
              onClick={() => setMood(mood.id)}
              className={`relative px-3 py-2.5 rounded-xl border text-left transition-all duration-400 flex items-center gap-2.5 ${
                isActive
                  ? 'bg-white shadow-md border-transparent ring-2'
                  : 'bg-slate-50/80 hover:bg-white border-slate-200/80 hover:border-slate-300'
              }`}
              style={{
                ['--tw-ring-color' as string]: isActive ? mood.color : 'transparent',
              } as React.CSSProperties}
            >
              {/* Color Swatch Circle with Check */}
              <span
                className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-transform duration-300 shadow-xs"
                style={{ backgroundColor: mood.color }}
              >
                {isActive && (
                  <Check
                    className="w-3 h-3 stroke-[3]"
                    style={{ color: mood.textColorOnAccent }}
                  />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">{mood.name}</div>
                <div className="text-[10px] text-slate-500 truncate leading-tight">
                  {mood.id === 'azul'
                    ? 'Confianza & solidez'
                    : mood.id === 'naranja'
                    ? 'Energía & cambio'
                    : mood.id === 'amarillo'
                    ? 'Luz & vitalidad'
                    : 'Armonía & frescura'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
