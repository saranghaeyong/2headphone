import React from 'react';
import { FilmDestination } from './FilmDestination';
import { MusicDestination } from './MusicDestination';
import { ActiveDestination, CursorMode } from '../types';

interface NavigationObjectProps {
  isExploded: boolean;
  activeDestination: ActiveDestination;
  setActiveDestination: (dest: ActiveDestination) => void;
  onSetCursorMode: (mode: CursorMode, text?: string | null) => void;
  onOpenFilms: () => void;
  onOpenMusic: () => void;
  isMobile: boolean;
}

export const NavigationObject: React.FC<NavigationObjectProps> = ({
  isExploded,
  activeDestination,
  setActiveDestination,
  onSetCursorMode,
  onOpenFilms,
  onOpenMusic,
  isMobile,
}) => {
  // Mobile Tab selector state when exploded
  const [mobileTab, setMobileTab] = React.useState<'films' | 'music'>('films');

  return (
    <div
      aria-hidden={!isExploded}
      className={`absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-7 lg:p-10 transition-opacity duration-500 ${
        isExploded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Desktop / Large Screen Layout: Flanking Ear Cups */}
      <div className="hidden lg:flex w-full h-full items-center justify-between">
        {/* Left Ear Cup = FILMS */}
        <div className="w-[320px] xl:w-[360px] pointer-events-auto">
          <FilmDestination
            isExploded={isExploded}
            isActive={activeDestination === 'films'}
            onHover={(active) => {
              if (!isMobile) setActiveDestination(active ? 'films' : null);
            }}
            onSetCursorMode={onSetCursorMode}
            onOpen={onOpenFilms}
          />
        </div>

        {/* Right Ear Cup = MUSIC */}
        <div className="w-[320px] xl:w-[360px] pointer-events-auto">
          <MusicDestination
            isExploded={isExploded}
            isActive={activeDestination === 'music'}
            onHover={(active) => {
              if (!isMobile) setActiveDestination(active ? 'music' : null);
            }}
            onSetCursorMode={onSetCursorMode}
            onOpen={onOpenMusic}
          />
        </div>
      </div>

      {/* Tablet / Medium Screen Layout: Side or Bottom Drawer */}
      <div className="hidden md:flex lg:hidden w-full h-full items-end pb-12 justify-center">
        <div className="flex items-center gap-6 pointer-events-auto max-w-2xl w-full">
          <div className="flex-1">
            <FilmDestination
              isExploded={isExploded}
              isActive={activeDestination === 'films'}
              onHover={(active) => setActiveDestination(active ? 'films' : null)}
              onSetCursorMode={onSetCursorMode}
              onOpen={onOpenFilms}
            />
          </div>
          <div className="flex-1">
            <MusicDestination
              isExploded={isExploded}
              isActive={activeDestination === 'music'}
              onHover={(active) => setActiveDestination(active ? 'music' : null)}
              onSetCursorMode={onSetCursorMode}
              onOpen={onOpenMusic}
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout: Segmented Viewport bottom container */}
      <div className="md:hidden flex flex-col justify-end w-full h-full pb-14">
        {/* Mobile Tab switcher */}
        <div className="pointer-events-auto w-full max-w-sm mx-auto mb-2.5 flex items-center justify-center p-1 bg-white/85 dark:bg-[#1a1917]/85 backdrop-blur-md rounded-xl border border-[#1c1b18]/10 dark:border-white/10 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setMobileTab('films');
              setActiveDestination('films');
            }}
            className={`flex-1 min-h-[40px] py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-colors ${
              mobileTab === 'films'
                ? 'bg-[#1c1b18] text-white dark:bg-[#eeeae2] dark:text-[#171614] shadow-sm'
                : 'text-[#6d6961] dark:text-[#aaa59b] hover:text-[#1c1b18]'
            }`}
          >
            Left: Films
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileTab('music');
              setActiveDestination('music');
            }}
            className={`flex-1 min-h-[40px] py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-colors ${
              mobileTab === 'music'
                ? 'bg-[#1c1b18] text-white dark:bg-[#eeeae2] dark:text-[#171614] shadow-sm'
                : 'text-[#6d6961] dark:text-[#aaa59b] hover:text-[#1c1b18]'
            }`}
          >
            Right: Music
          </button>
        </div>

        {/* Mobile active destination card */}
        <div className="pointer-events-auto w-full max-w-sm mx-auto max-h-[44dvh] overflow-y-auto rounded-2xl">
          {mobileTab === 'films' ? (
            <FilmDestination
              isExploded={isExploded}
              isActive={true}
              onHover={() => {}}
              onSetCursorMode={onSetCursorMode}
              onOpen={onOpenFilms}
            />
          ) : (
            <MusicDestination
              isExploded={isExploded}
              isActive={true}
              onHover={() => {}}
              onSetCursorMode={onSetCursorMode}
              onOpen={onOpenMusic}
            />
          )}
        </div>
      </div>
    </div>
  );
};
