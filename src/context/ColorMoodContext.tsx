import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorMood = 'azul' | 'naranja' | 'amarillo' | 'celeste';

export interface MoodData {
  id: ColorMood;
  name: string;
  concept: string;
  color: string;
  hoverColor: string;
  glow: string;
  lightBg: string;
  borderColor: string;
  textColorOnAccent: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
  badgeBg: string;
}

export const MOODS: Record<ColorMood, MoodData> = {
  azul: {
    id: 'azul',
    name: 'Azul Confianza',
    concept: 'Seguridad, solidez técnica y respaldo garantizado',
    color: '#0059FF',
    hoverColor: '#0047D4',
    glow: 'rgba(0, 89, 255, 0.35)',
    lightBg: 'rgba(0, 89, 255, 0.08)',
    borderColor: 'rgba(0, 89, 255, 0.3)',
    textColorOnAccent: '#FFFFFF',
    tailwindBg: 'bg-[#0059FF]',
    tailwindText: 'text-[#0059FF]',
    tailwindBorder: 'border-[#0059FF]',
    badgeBg: 'bg-blue-50 text-[#0059FF] border-blue-200',
  },
  naranja: {
    id: 'naranja',
    name: 'Naranja Roofera',
    concept: 'Energía arquitectónica, precisión técnica y alto impacto visual',
    color: '#FF5C00',
    hoverColor: '#CC4A00',
    glow: 'rgba(255, 92, 0, 0.32)',
    lightBg: 'rgba(255, 92, 0, 0.08)',
    borderColor: 'rgba(255, 92, 0, 0.35)',
    textColorOnAccent: '#090E19',
    tailwindBg: 'bg-[#FF5C00]',
    tailwindText: 'text-[#FF5C00]',
    tailwindBorder: 'border-[#FF5C00]',
    badgeBg: 'bg-[#FFF0E6] text-[#CC4A00] border-[#FF5C00]/30',
  },
  amarillo: {
    id: 'amarillo',
    name: 'Amarillo Vitalidad',
    concept: 'Luminosidad arquitectónica, alegría y calidez solar',
    color: '#FAB82A',
    hoverColor: '#E5A51A',
    glow: 'rgba(250, 184, 42, 0.35)',
    lightBg: 'rgba(250, 184, 42, 0.12)',
    borderColor: 'rgba(250, 184, 42, 0.4)',
    textColorOnAccent: '#0F1B2B', // Dark text on yellow for WCAG AA compliance!
    tailwindBg: 'bg-[#FAB82A]',
    tailwindText: 'text-[#FAB82A]',
    tailwindBorder: 'border-[#FAB82A]',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  celeste: {
    id: 'celeste',
    name: 'Celeste Armonía',
    concept: 'Frescura, amplitud visual y serenidad moderna',
    color: '#00A3FF',
    hoverColor: '#008BD9',
    glow: 'rgba(0, 163, 255, 0.35)',
    lightBg: 'rgba(0, 163, 255, 0.08)',
    borderColor: 'rgba(0, 163, 255, 0.3)',
    textColorOnAccent: '#0F172A',
    tailwindBg: 'bg-[#00A3FF]',
    tailwindText: 'text-[#00A3FF]',
    tailwindBorder: 'border-[#00A3FF]',
    badgeBg: 'bg-sky-50 text-[#00A3FF] border-sky-200',
  },
};

interface ColorMoodContextType {
  activeMood: ColorMood;
  currentMood: MoodData;
  setMood: (mood: ColorMood) => void;
  allMoods: MoodData[];
}

const ColorMoodContext = createContext<ColorMoodContextType | undefined>(undefined);

export const ColorMoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMood, setActiveMood] = useState<ColorMood>('naranja');

  // Load persisted mood from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ideas_colores_roofera_mood') as ColorMood;
      if (saved && MOODS[saved]) {
        setActiveMood(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  // Update CSS variables whenever mood changes
  useEffect(() => {
    const mood = MOODS[activeMood];
    const root = document.documentElement;
    root.style.setProperty('--mood-accent', mood.color);
    root.style.setProperty('--mood-accent-hover', mood.hoverColor);
    root.style.setProperty('--mood-glow', mood.glow);
    root.style.setProperty('--mood-light', mood.lightBg);
    root.style.setProperty('--mood-border', mood.borderColor);
    root.style.setProperty('--mood-text-contrast', mood.textColorOnAccent);
    root.style.setProperty('--mood-color', mood.color);

    try {
      localStorage.setItem('ideas_colores_roofera_mood', activeMood);
    } catch {
      // ignore
    }
  }, [activeMood]);

  const value: ColorMoodContextType = {
    activeMood,
    currentMood: MOODS[activeMood],
    setMood: setActiveMood,
    allMoods: Object.values(MOODS),
  };

  return <ColorMoodContext.Provider value={value}>{children}</ColorMoodContext.Provider>;
};

export const useColorMood = () => {
  const context = useContext(ColorMoodContext);
  if (!context) {
    throw new Error('useColorMood must be used within a ColorMoodProvider');
  }
  return context;
};
