import React from 'react';

interface TseLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const TseLogo: React.FC<TseLogoProps> = ({ size = 'md', showText = false, className = '' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
        {/* Heraldic Shield Emblem of Brookasil Electoral Justice */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B1E3B" />
              <stop offset="50%" stopColor="#122A4E" />
              <stop offset="100%" stopColor="#081427" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>

          {/* Outer Gold Border Ring */}
          <circle cx="50" cy="50" r="47" stroke="url(#goldGrad)" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="44" stroke="#0B1E3B" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />

          {/* Main Shield Body */}
          <path
            d="M 50 12 L 80 22 C 80 52 50 78 50 86 C 50 78 20 52 20 22 Z"
            fill="url(#shieldGrad)"
            stroke="url(#goldGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Accent Line */}
          <path
            d="M 50 18 L 74 26 C 74 48 50 70 50 77 C 50 70 26 48 26 26 Z"
            stroke="url(#goldGrad)"
            strokeWidth="0.75"
            strokeOpacity="0.4"
            fill="none"
          />

          {/* Scales of Justice (Balança da Justiça Eleitoral) */}
          <g transform="translate(50, 44)">
            {/* Center Pillar */}
            <path d="M -1 -17 L 1 -17 L 1 14 L -1 14 Z" fill="url(#goldGrad)" />
            {/* Base */}
            <path d="M -6 14 L 6 14 L 8 17 L -8 17 Z" fill="url(#goldGrad)" />
            {/* Crossbeam */}
            <path d="M -16 -13 L 16 -13 L 16 -11 L -16 -11 Z" fill="url(#goldGrad)" />
            {/* Scale strings & bowls Left */}
            <path d="M -15 -11 L -21 -2 M -15 -11 L -9 -2" stroke="url(#goldGrad)" strokeWidth="0.8" />
            <path d="M -22 -2 C -22 3 -8 3 -8 -2 Z" fill="url(#goldGrad)" />
            {/* Scale strings & bowls Right */}
            <path d="M 15 -11 L 9 -2 M 15 -11 L 21 -2" stroke="url(#goldGrad)" strokeWidth="0.8" />
            <path d="M 8 -2 C 8 3 22 3 22 -2 Z" fill="url(#goldGrad)" />
            {/* Top Star */}
            <polygon
              points="0,-22 2,-18 6,-18 3,-15 4,-11 0,-13 -4,-11 -3,-15 -6,-18 -2,-18"
              fill="url(#silverGrad)"
            />
          </g>

          {/* Laurel Wreath at bottom */}
          <g stroke="url(#goldGrad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.9">
            <path d="M 33 76 C 26 68 22 58 22 46" fill="none" />
            <path d="M 67 76 C 74 68 78 58 78 46" fill="none" />
          </g>

          {/* Federal Stars */}
          <circle cx="36" cy="22" r="1.5" fill="url(#goldGrad)" />
          <circle cx="50" cy="15" r="1.8" fill="url(#goldGrad)" />
          <circle cx="64" cy="22" r="1.5" fill="url(#goldGrad)" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-500 font-sans">
            Justiça Eleitoral
          </span>
          <span className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
            TSE Brookasil
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Tribunal Superior Eleitoral
          </span>
        </div>
      )}
    </div>
  );
};
