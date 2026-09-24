import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress?: number;
  isLoaded: boolean;
  onEnter?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress = 100,
  isLoaded,
}) => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  if (!shouldRender) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-40 flex flex-col items-center justify-between p-8 sm:p-12 bg-[#f7f6f2] transition-opacity duration-700 ease-in-out ${
        isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top micro-meta */}
      <div className="w-full flex items-center justify-between text-[11px] uppercase tracking-widest text-[#726e66] font-medium">
        <span>Curated Archive</span>
        <span>Cinema · Sound</span>
      </div>

      {/* Center brand mark & loader */}
      <div className="flex flex-col items-center text-center space-y-6">
        <h1 className="font-serif-title text-4xl sm:text-6xl tracking-[0.25em] text-[#1c1b18] font-normal uppercase pl-[0.25em]">
          SARANG
        </h1>
        <p className="text-xs sm:text-sm tracking-widest text-[#726e66] uppercase font-light">
          Interactive Headphone Interface
        </p>

        {/* Minimal linear loader */}
        <div className="w-48 sm:w-64 h-[2px] bg-[#e6e2d8] overflow-hidden relative mt-4">
          <div
            className="h-full bg-[#1c1b18] transition-all duration-300 ease-out"
            style={{ width: `${Math.max(12, progress)}%` }}
          />
        </div>

        <div className="text-[10px] tracking-widest text-[#938e83] uppercase font-mono tabular-nums">
          {Math.round(progress)}% Initialized
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="w-full flex items-center justify-between text-[11px] text-[#938e83] font-light tracking-wider">
        <span>Spatial Navigation Unit 01</span>
        <span>Three.js · WebGL</span>
      </div>
    </div>
  );
};
