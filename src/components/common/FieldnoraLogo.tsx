import React from 'react';

interface FieldnoraLogoProps {
  className?: string;
  size?: number;
  textColor?: string;
  showText?: boolean;
  textSize?: string;
}

/**
 * Fieldnora Logo matching the exact emblem from the UI design attachment:
 * Vibrant teal gear / cog with a wrench / spanner in the center.
 */
export const FieldnoraGearWrenchIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 8-tooth gear silhouette in vibrant teal */}
      <path
        d="M44.5 12h11c1.4 0 2.5 1.1 2.5 2.5v4.2c2.4.7 4.6 1.8 6.6 3.1l3.6-2.1c1.2-.7 2.8-.4 3.6.8l5.5 9.5c.7 1.2.4 2.8-.8 3.6l-3.6 2.1c.8 2.3 1.3 4.8 1.4 7.3h4.2c1.4 0 2.5 1.1 2.5 2.5v11c0 1.4-1.1 2.5-2.5 2.5h-4.2c-.2 2.5-.7 5-1.4 7.3l3.6 2.1c1.2.7 1.5 2.4.8 3.6l-5.5 9.5c-.7 1.2-2.4 1.5-3.6.8l-3.6-2.1c-2 1.3-4.2 2.4-6.6 3.1v4.2c0 1.4-1.1 2.5-2.5 2.5h-11c-1.4 0-2.5-1.1-2.5-2.5v-4.2c-2.4-.7-4.6-1.8-6.6-3.1l-3.6 2.1c-1.2.7-2.8.4-3.6-.8l-5.5-9.5c-.7-1.2-.4-2.8.8-3.6l3.6-2.1c-.8-2.3-1.3-4.8-1.4-7.3h-4.2c-1.4 0-2.5-1.1-2.5-2.5v-11c0-1.4 1.1-2.5 2.5-2.5h4.2c.2-2.5.7-5 1.4-7.3l-3.6-2.1c-1.2-.7-1.5-2.4-.8-3.6l5.5-9.5c.7-1.2 2.4-1.5 3.6-.8l3.6 2.1c2-1.3 4.2-2.4 6.6-3.1v-4.2c0-1.4 1.1-2.5 2.5-2.5z"
        fill="#00827F"
      />
      {/* Central circular cutout */}
      <circle cx="50" cy="50" r="23" fill="white" />
      {/* Central gear rim */}
      <circle cx="50" cy="50" r="19" fill="#00827F" />
      <circle cx="50" cy="50" r="13" fill="white" />
      {/* Angled spanner wrench head in center matching the emblem */}
      <g transform="translate(50,50) rotate(-45) translate(-50,-50)">
        {/* Wrench handle */}
        <path
          d="M46 50v24c0 2.2 1.8 4 4 4s4-1.8 4-4V50h-8z"
          fill="#00827F"
        />
        {/* Wrench open jaw */}
        <path
          d="M50 30c-7.7 0-14 6.3-14 14 0 3.2 1.1 6.1 2.9 8.5l6.3-6.3c-.8-1.2-1.2-2.6-1.2-4.2 0-3.3 2.7-6 6-6s6 2.7 6 6c0 1.6-.4 3-1.2 4.2l6.3 6.3c1.8-2.4 2.9-5.3 2.9-8.5 0-7.7-6.3-14-14-14z"
          fill="#00827F"
        />
      </g>
    </svg>
  );
};

export const FieldnoraLogo: React.FC<FieldnoraLogoProps> = ({
  className = '',
  size = 36,
  textColor = 'text-[#0F172A]',
  showText = true,
  textSize = 'text-2xl',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <FieldnoraGearWrenchIcon size={size} />
      {showText && (
        <span className={`font-bold tracking-tight lowercase ${textColor} ${textSize}`}>
          fieldnora
        </span>
      )}
    </div>
  );
};
