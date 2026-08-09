import React from 'react';

interface MessTrackerLogoProps {
  className?: string;
}

export const MessTrackerLogo: React.FC<MessTrackerLogoProps> = ({
  className = 'w-10 h-10',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      aria-label="Mess Tracker Logo"
    >
      <defs>
        <linearGradient id="headerBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="headerBowlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>

        <linearGradient id="headerBlueAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <linearGradient id="headerGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Background Base App Icon Frame */}
      <rect width="512" height="512" rx="128" fill="url(#headerBgGrad)" />
      <rect x="8" y="8" width="496" height="496" rx="120" fill="none" stroke="#334155" strokeWidth="4" opacity="0.6" />

      {/* Outer Tech Ring */}
      <circle cx="256" cy="256" r="176" fill="none" stroke="url(#headerBlueAccent)" strokeWidth="5" opacity="0.25" />
      <circle cx="256" cy="256" r="160" fill="#0f172a" stroke="#1e293b" strokeWidth="8" />

      {/* MINIMAL FOOD BOWL / PLATE (Clean Crisp White) */}
      <ellipse cx="256" cy="216" rx="115" ry="26" fill="none" stroke="url(#headerBowlGrad)" strokeWidth="14" strokeLinecap="round"/>
      <path d="M 143 218 C 147 312, 198 342, 256 342 C 314 342, 365 312, 369 218 Z" fill="url(#headerBowlGrad)"/>
      <path d="M 155 222 C 159 298, 202 326, 256 326 C 310 326, 353 298, 357 222 Z" fill="#0f172a" opacity="0.12"/>

      {/* SUBTLE RUPEE SYMBOL (₹) */}
      <g transform="translate(256, 268) scale(1.15)" stroke="url(#headerBlueAccent)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1="-16" y1="-22" x2="16" y2="-22" />
        <line x1="-16" y1="-10" x2="14" y2="-10" />
        <path d="M -10 -22 L -10 -10 C -2 -10, 8 -10, 8 0 C 8 10, -4 10, -10 10" />
        <line x1="-6" y1="8" x2="14" y2="26" />
      </g>

      {/* VIBRANT GREEN CHECKMARK BADGE */}
      <g transform="translate(328, 178)">
        <circle cx="0" cy="0" r="40" fill="#0f172a" stroke="url(#headerGreenGrad)" strokeWidth="6" />
        <circle cx="0" cy="0" r="34" fill="url(#headerGreenGrad)" />
        <path d="M -13 0 L -4 9 L 13 -9" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};
