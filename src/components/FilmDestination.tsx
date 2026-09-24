import React from 'react';
import { PORTFOLIO_CONFIG } from '../config/portfolio';
import { ArrowUpRight } from 'lucide-react';
import { CursorMode } from '../types';
import { acousticEngine } from '../utils/acousticEngine';

interface FilmDestinationProps {
  isExploded: boolean;
  isActive: boolean;
  onHover: (active: boolean) => void;
  onSetCursorMode: (mode: CursorMode, text?: string | null) => void;
  onOpen: () => void;
}

export const FilmDestination: React.FC<FilmDestinationProps> = ({
  isExploded,
  isActive,
  onHover,
  onSetCursorMode,
  onOpen,
}) => {
  const filmData = PORTFOLIO_CONFIG.destinations.films;

  return (
    <article
      aria-label="Films Destination — Left Ear Cup"
      className={`transition-all duration-700 ease-out ${
        isExploded
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      onMouseEnter={() => {
        onHover(true);
        acousticEngine.playMicroTick();
        onSetCursorMode('open', 'OPEN LETTERBOXD');
      }}
      onMouseLeave={() => {
        onHover(false);
        onSetCursorMode('default');
      }}
    >
      <div
        className={`w-full max-w-[340px] sm:max-w-[380px] p-5 sm:p-7 rounded-2xl transition-all duration-300 ${
          isActive
            ? 'bg-white dark:bg-[#1a1917] shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-[#1c1b18]/15 dark:border-white/20 -translate-y-1'
            : 'bg-white/85 dark:bg-[#1a1917]/85 shadow-[0_10px_35px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)] border border-[#1c1b18]/8 dark:border-white/10 backdrop-blur-md'
        }`}
      >
        {/* Origin indicator */}
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-[#78746c] dark:text-[#aaa59b] font-medium pb-3 sm:pb-4 border-b border-[#1c1b18]/6 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#1c1b18] dark:bg-[#eeeae2]" />
            <span>Left Ear Cup</span>
          </div>
          <span className="font-mono text-[10px] text-[#9a958b] dark:text-[#777]">Press [F]</span>
        </div>

        {/* Primary Required Hierarchy:
            FILMS
            SARANGHAEYO
            LETTERBOXD
        */}
        <div className="pt-4 sm:pt-5 space-y-1">
          <h2 className="font-serif-title text-2xl sm:text-4xl tracking-tight text-[#1c1b18] dark:text-[#eeeae2] font-normal leading-none uppercase">
            {filmData.title}
          </h2>
          <div className="font-display text-sm sm:text-lg font-medium tracking-wide text-[#3a3733] dark:text-[#dcd7ce] uppercase">
            {filmData.subtitle}
          </div>
          <div className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#78746c] dark:text-[#aaa59b] uppercase">
            {filmData.platform}
          </div>
        </div>

        {/* Curatorial description */}
        <p className="mt-3 text-xs sm:text-sm text-[#57534c] dark:text-[#bbb6ab] leading-relaxed font-normal">
          {filmData.description}
        </p>

        {/* Editorial tags */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#78746c] dark:text-[#aaa59b]">
          {filmData.tags.map((tag, idx) => (
            <React.Fragment key={tag}>
              <span>{tag}</span>
              {idx < filmData.tags.length - 1 && <span aria-hidden="true" className="text-[#bbb6ab] dark:text-[#555]">·</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Featured diary selections */}
        <div className="mt-4 pt-3 border-t border-[#1c1b18]/6 dark:border-white/10 space-y-1.5">
          <div className="text-[10px] uppercase tracking-widest text-[#9a958b] dark:text-[#777] font-medium">
            FAVOURITE MOVIES
          </div>
          <div className="space-y-1">
            {filmData.featuredWorks.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-[#2d2a26] dark:text-[#eeeae2] truncate max-w-[200px]">
                  {item.title}
                </span>
                <span className="text-[11px] text-[#78746c] dark:text-[#aaa59b] shrink-0 font-mono">
                  {item.year}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA Button: OPEN LETTERBOXD */}
        <div className="mt-5 pt-1">
          <a
            href={filmData.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="group relative flex w-full min-h-[44px] items-center justify-between px-5 py-3 bg-[#1c1b18] hover:bg-[#32302b] dark:bg-[#eeeae2] dark:hover:bg-white text-white dark:text-[#171614] rounded-xl transition-all duration-200 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1c1b18]"
            aria-label="Open Saranghaeyo on Letterboxd in a new tab"
          >
            <span className="text-xs font-semibold tracking-widest uppercase">
              {filmData.buttonLabel}
            </span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
};
