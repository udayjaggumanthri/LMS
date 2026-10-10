import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'mark-only';
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  inverted = false
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 rounded select-none ${className}`}
      aria-label="Prajnadhara EDU Homepage"
    >
      {/* Precision inline SVG emblem matching the open-book tree of wisdom */}
      <svg
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} shrink-0`}
        aria-hidden="true"
      >
        {/* Book base cover / spine in deep earth timber */}
        <path
          d="M10 68C22 66 38 64 50 74C62 64 78 66 90 68V38C78 36 62 34 50 44C38 34 22 36 10 38V68Z"
          fill="#533316"
        />
        {/* Left inner book pages */}
        <path
          d="M16 62C26 60 38 58 48 66V39C38 31 26 33 16 35V62Z"
          fill="#0D5C3A"
        />
        <path
          d="M22 56C30 54 40 53 47 58V34C40 29 30 30 22 32V56Z"
          fill="#157B4F"
        />
        {/* Right inner book pages */}
        <path
          d="M84 62C74 60 62 58 52 66V39C62 31 74 33 84 35V62Z"
          fill="#0D5C3A"
        />
        <path
          d="M78 56C70 54 60 53 53 58V34C60 29 70 30 78 32V56Z"
          fill="#157B4F"
        />

        {/* Tree trunk rising from book spine */}
        <path
          d="M47 62C47 52 48 38 50 30C52 38 53 52 53 62C51 60 49 60 47 62Z"
          fill="#533316"
        />
        {/* Left branches */}
        <path
          d="M49 38C44 32 38 30 34 28C38 32 43 36 48 42Z"
          fill="#533316"
        />
        {/* Right branches */}
        <path
          d="M51 38C56 32 62 30 66 28C62 32 57 36 52 42Z"
          fill="#533316"
        />

        {/* Center top wisdom leaf */}
        <path
          d="M50 4C44 14 46 22 50 28C54 22 56 14 50 4Z"
          fill="#188C5A"
        />
        {/* Upper left leaf cluster */}
        <path
          d="M36 12C32 20 37 26 43 28C41 21 41 15 36 12Z"
          fill="#126E46"
        />
        {/* Upper right leaf cluster */}
        <path
          d="M64 12C68 20 63 26 57 28C59 21 59 15 64 12Z"
          fill="#126E46"
        />
        {/* Mid left leaf cluster */}
        <path
          d="M26 24C24 32 30 37 36 37C35 30 33 25 26 24Z"
          fill="#188C5A"
        />
        {/* Mid right leaf cluster */}
        <path
          d="M74 24C76 32 70 37 64 37C65 30 67 25 74 24Z"
          fill="#188C5A"
        />
      </svg>

      {variant === 'full' && (
        <div className="flex items-baseline">
          <span
            className={`font-display font-bold tracking-tight ${textSizes[size]} ${
              inverted ? 'text-white' : 'text-slate-900'
            }`}
          >
            Prajnadhara
          </span>
          <span
            className={`font-display font-semibold ml-1 ${textSizes[size]} ${
              inverted ? 'text-emerald-400' : 'text-emerald-800'
            }`}
          >
            EDU
          </span>
        </div>
      )}
    </Link>
  );
};
