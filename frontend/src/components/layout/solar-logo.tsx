import React from "react";

export interface SolarLogoProps {
  className?: string;
  size?: number;
}

export function SolarLogo({ className = "w-10 h-10 shrink-0", size = 40 }: SolarLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-label="SolarOS"
      className={className}
    >
      <rect width="40" height="40" rx="11" fill="#55764D" />
      <path d="M11 18.5a9 9 0 0 1 18 0" fill="#A8CE45" />
      <path
        d="M20 6.5v2.6M11.6 10l1.8 1.8M28.4 10l-1.8 1.8"
        stroke="#A8CE45"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M8.5 31.5 12 21h16l3.5 10.5z" fill="#2F3B47" />
      <path
        d="M10.2 26.3h19.6M17.2 21l-1 10.5M22.8 21l1 10.5"
        stroke="#8FA3B6"
        strokeWidth="0.9"
        opacity="0.8"
      />
    </svg>
  );
}
