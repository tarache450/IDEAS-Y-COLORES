import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'monochrome';
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSlogan = false,
  className = '',
}) => {
  const isLight = variant === 'light'; // Light text for dark backgrounds

  // Proportional sizing: height determines overall dimension
  const config = {
    sm: { height: 38, width: 140 },
    md: { height: 48, width: 180 },
    lg: { height: 64, width: 236 },
  }[size];

  return (
    <div
      className={`inline-flex items-center select-none group transition-transform ${className}`}
      id="brand-logo-container"
    >
      {/* Official Ideas & Colores Guatemala Vector Logo */}
      <svg
        width={config.width}
        height={config.height}
        viewBox="0 0 540 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-[1.02]"
        aria-label="Logotipo Oficial Ideas & Colores Guatemala"
      >
        <defs>
          <style>
            {`
              .brand-title-font {
                font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
                font-weight: 800;
              }
              .brand-country-font {
                font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
                font-weight: 800;
                letter-spacing: 0.38em;
              }
            `}
          </style>
        </defs>

        {/* --- ICONIC TILTED PAINTBRUSH EMBLEM --- */}
        <g transform="translate(16, 8)" className="transition-transform duration-300 group-hover:rotate-1">
          {/* Brush Handle in Deep Navy / Light Slate in dark mode */}
          <path
            d="M74 214 C65 223 51 223 42 214 C33 205 33 191 42 182 L64 160 C68 156 71 150 72 144 L75 130 C76 126 80 123 84 125 L125 166 C127 170 124 174 120 175 L106 178 C100 179 94 182 90 186 Z"
            fill={isLight ? '#F8FAFC' : '#0F1B2B'}
            className="transition-colors duration-300"
          />
          {/* Handle Hang Hole Cutout */}
          <circle
            cx="58"
            cy="198"
            r="9"
            fill={isLight ? '#0F172A' : '#FFFFFF'}
            className="transition-colors duration-300"
          />

          {/* Metal Ferrule Base */}
          <path
            d="M74 128 L86 116 C90 112 96 112 100 116 L134 150 C138 154 138 160 134 164 L122 176 Z"
            fill={isLight ? '#F8FAFC' : '#0F1B2B'}
          />
          {/* White / Silver Collar Band */}
          <path
            d="M82 124 L94 112 C96 110 100 110 102 112 L138 148 C140 150 140 154 138 156 L126 168 C124 170 120 170 118 168 L82 132 C80 130 80 126 82 124 Z"
            fill={isLight ? '#334155' : '#FFFFFF'}
            stroke={isLight ? '#F8FAFC' : '#0F1B2B'}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Inner Ferrule Accent Notch */}
          <line
            x1="94"
            y1="126"
            x2="128"
            y2="160"
            stroke={isLight ? '#F8FAFC' : '#0F1B2B'}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* 4 Radiating Color Plumes / Bristles */}
          {/* 1. Royal Blue Bristle (#0059FF) */}
          <path
            d="M93 110 C88 95 86 65 92 36 C94 28 103 24 109 29 C126 44 140 68 144 94 C145 99 141 104 136 104 L110 106 C103 107 96 108 93 110 Z"
            fill={isLight ? '#3884FF' : '#0059FF'}
            className="transition-all duration-300 group-hover:opacity-95"
          />
          {/* 2. Sky Cyan Blue Bristle (#00A3FF) */}
          <path
            d="M116 104 C122 84 132 58 148 40 C154 34 164 36 168 44 C178 63 184 85 186 106 C186 111 182 115 177 115 L144 115 C136 115 124 112 116 104 Z"
            fill={isLight ? '#38BDF8' : '#00A3FF'}
            className="transition-all duration-300 group-hover:opacity-95"
          />
          {/* 3. Golden Amber Yellow Bristle (#FAB82A) */}
          <path
            d="M138 116 C148 100 162 76 182 60 C188 55 197 58 200 66 C210 88 214 110 215 130 C215 135 210 139 205 138 L170 132 C160 130 148 126 138 116 Z"
            fill="#FAB82A"
            className="transition-all duration-300 group-hover:opacity-95"
          />
          {/* 4. Coral Orange Bristle (#FF5738) */}
          <path
            d="M148 136 C162 128 184 112 206 98 C213 93 222 98 223 106 C225 128 221 150 213 168 C211 173 205 175 200 172 L164 152 C156 148 151 142 148 136 Z"
            fill="#FF5738"
            className="transition-all duration-300 group-hover:opacity-95"
          />
        </g>

        {/* --- OFFICIAL WORDMARK --- */}
        <g transform="translate(244, 30)">
          {/* Line 1: "Ideas" (Royal Blue) & "&" (Coral Orange) */}
          <text
            x="0"
            y="105"
            className="brand-title-font"
            fontSize="84"
            fill={isLight ? '#3884FF' : '#0059FF'}
            letterSpacing="-0.02em"
          >
            Ideas
          </text>
          <text
            x="202"
            y="105"
            className="brand-title-font"
            fontSize="84"
            fill="#FF5738"
          >
            &amp;
          </text>

          {/* Line 2: "Colores" in Deep Navy / White */}
          <text
            x="0"
            y="176"
            className="brand-title-font"
            fontSize="86"
            fill={isLight ? '#F8FAFC' : '#0F1B2B'}
            letterSpacing="-0.03em"
          >
            Colores
          </text>

          {/* Line 3: "G U A T E M A L A" tracked uppercase */}
          <text
            x="8"
            y="214"
            className="brand-country-font"
            fontSize="18"
            fill={isLight ? '#E2E8F0' : '#0F1B2B'}
          >
            GUATEMALA
          </text>
        </g>
      </svg>

      {showSlogan && (
        <span
          className={`hidden md:inline-block ml-3 pl-3 border-l text-xs font-semibold tracking-wide ${
            isLight ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-500'
          }`}
        >
          Color que transforma
        </span>
      )}
    </div>
  );
};
