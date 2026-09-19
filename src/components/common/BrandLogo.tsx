import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'dark',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Unique fieldnora emblem: field location polygon + teal pulse + task completion nexus */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] shadow-md border border-slate-700/60 p-1.5 flex-shrink-0 group`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform group-hover:scale-105"
        >
          {/* Outer radar/location pulse ring */}
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="#14B8A6"
            strokeWidth="2"
            strokeDasharray="4 2"
            className="opacity-70"
          />
          {/* Compass / field sector */}
          <path
            d="M20 6 L25 18 L34 20 L24 25 L20 34 L16 25 L6 20 L15 18 Z"
            fill="#14B8A6"
            fillOpacity="0.2"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Center pinpoint */}
          <circle cx="20" cy="20" r="4.5" fill="#14B8A6" />
          {/* Completion check mark in white */}
          <path
            d="M17.5 20.2 L19.2 21.8 L23 18"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-extrabold tracking-tight ${
              variant === 'light' ? 'text-white' : 'text-[#0F172A]'
            } ${textSizes[size]}`}
          >
            field<span className="text-[#14B8A6]">nora</span>
          </span>
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase ${
              variant === 'light' ? 'text-slate-400' : 'text-[#64748B]'
            } mt-0.5`}
          >
            Field Operations
          </span>
        </div>
      )}
    </div>
  );
};
