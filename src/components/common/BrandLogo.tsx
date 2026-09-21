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
      {/* Unique Fieldnora emblem */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-[#111A24] border border-[#1E293B] p-1.5 flex-shrink-0 group shadow-sm`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform group-hover:scale-105"
        >
          {/* Hexagonal polygon emblem with teal accent */}
          <polygon
            points="20,4 34,12 34,28 20,36 6,28 6,12"
            fill="#0D2E2B"
            stroke="#14B8A6"
            strokeWidth="2"
          />
          {/* Internal nexus / pin / rotor */}
          <path
            d="M20 10 L28 24 L12 24 Z"
            fill="#14B8A6"
            fillOpacity="0.4"
            stroke="#2DD4BF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="20" r="4" fill="#14B8A6" />
          <circle cx="20" cy="20" r="1.5" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold tracking-tight text-white ${textSizes[size]}`}
          >
            Fieldnora
          </span>
          <span
            className="text-[11px] font-normal tracking-normal text-slate-400 mt-0.5"
          >
            Field Service Software
          </span>
        </div>
      )}
    </div>
  );
};
