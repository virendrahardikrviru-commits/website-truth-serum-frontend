import React from 'react';

const WebsiteTruthSerumLogo = ({ size = 42, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Website Truth Serum"
      role="img"
      className={className}
    >
      <defs>
        <linearGradient
          id="truthSerumGradient"
          x1="14"
          y1="8"
          x2="52"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#00FF66" />
          <stop offset="52%" stopColor="#00D9A0" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>

      {/* Shield Background */}
      <path
        d="M32 4L54 13V29C54 43 45 54 32 60C19 54 10 43 10 29V13L32 4Z"
        fill="#0F172A"
        stroke="url(#truthSerumGradient)"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Serum Drop */}
      <path
        d="M32 14C32 14 21 26 21 35C21 42 25.9 47 32 47C38.1 47 43 42 43 35C43 26 32 14 32 14Z"
        fill="url(#truthSerumGradient)"
      />

      {/* Checkmark */}
      <path
        d="M26 35L30.5 39.5L39 30"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default WebsiteTruthSerumLogo;