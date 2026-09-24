import React, { useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Info, X, Sun, Moon, Waves, Sparkles, ArrowUpRight } from 'lucide-react';
import { PORTFOLIO_CONFIG } from '../config/portfolio';
import { CursorMode, HeadphoneState } from '../types';
import { acousticEngine } from '../utils/acousticEngine';

interface UIProps {
  headphoneState: HeadphoneState;
  onReset: () => void;
  onTriggerExplode: () => void;
  onSetCursorMode: (mode: CursorMode, text?: string | null) => void;
  onOpenFilms: () => void;
  onOpenMusic: () => void;
  isMobile: boolean;
}

export const UI: React.FC<UIProps> = ({
  headphoneState,
  onReset,
  onTriggerExplode,
  onSetCursorMode,
  onOpenFilms,
  onOpenMusic,
  isMobile,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isMuted, setIsMuted] = useState(acousticEngine.getIsMuted());
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('sarang-theme') === 'dark'
  );
  const [ambientActive, setAmbientActive] = useState(acousticEngine.getIsAmbientActive());
  const artist = PORTFOLIO_CONFIG.artist;
  const isExploded = headphoneState === 'exploded';

  React.useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    localStorage.setItem('sarang-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  React.useEffect(() => {
    const startOnFirstGesture = () => {
      if (!acousticEngine.getIsMuted() && !acousticEngine.getIsAmbientActive()) {
        acousticEngine.startAmbient();
        setAmbientActive(true);
      }
    };
    window.addEventListener('pointerdown', startOnFirstGesture, { once: true });
    window.addEventListener('keydown', startOnFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startOnFirstGesture);
      window.removeEventListener('keydown', startOnFirstGesture);
    };
  }, []);

  const handleToggleAmbient = () => {
    const active = acousticEngine.toggleAmbient();
    setAmbientActive(active);
    if (active && isMuted) {
      acousticEngine.setMuted(false);
      setIsMuted(false);
    }
  };

  const handleToggleSound = () => {
    const nextMuted = acousticEngine.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      acousticEngine.playMicroTick();
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-7 lg:p-10 select-none">
      {/* 
        ==================================================
        TOP BAR CONTRACT:
        Desktop: Wordmark + Title + Status + Controls
        Mobile: Wordmark + Status + Touch Controls (min 44px)
        ==================================================
      */}
      <header className="w-full flex items-center justify-between pb-3 sm:pb-4 pointer-events-auto border-b border-[#1c1b18]/8 dark:border-white/10">
        {/* Brand Wordmark & Archive Metadata */}
        <button
          type="button"
          onClick={() => {
            if (headphoneState === 'exploded') onReset();
          }}
          className="text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1b18] dark:focus-visible:ring-white rounded"
          aria-label="SARANG Portfolio — Click to reset scene"
          onMouseEnter={() => {
            if (!isMobile && headphoneState === 'exploded') onSetCursorMode('reconstruct', 'RESET');
          }}
          onMouseLeave={() => {
            if (!isMobile) onSetCursorMode('default');
          }}
        >
          <div className="flex flex-col">
            <span className="font-serif-title text-lg sm:text-2xl font-bold tracking-[0.2em] text-[#1c1b18] dark:text-[#eeeae2] uppercase group-hover:opacity-75 transition-opacity">
              {isMobile ? 'SARANG' : 'SARANG R N'}
            </span>
            <span className="text-[10px] sm:text-xs tracking-[0.22em] uppercase text-[#726e66] dark:text-[#aaa59b] font-medium mt-0.5">
              {isMobile ? 'PORTFOLIO // 2026' : 'PORTFOLIO ARCHIVE // 2026'}
            </span>
          </div>
        </button>

        {/* Center status (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-3 text-xs tracking-widest uppercase text-[#726e66] dark:text-[#aaa59b] font-medium">
          <span>{artist.title}</span>
          <span aria-hidden="true" className="text-[#c2beb4] dark:text-[#555]">·</span>
          <span>{headphoneState === 'exploded' ? 'EXPLODED VIEW' : 'ASSEMBLED MODEL'}</span>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Direct Destination Links on Desktop Header (when exploded) */}
          {headphoneState === 'exploded' && !isMobile && (
            <>
              <button
                type="button"
                onClick={onOpenFilms}
                onMouseEnter={() => onSetCursorMode('open', 'LETTERBOXD')}
                onMouseLeave={() => onSetCursorMode('default')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wider uppercase text-[#3f3c36] dark:text-[#eeeae2] hover:text-[#1c1b18] hover:bg-[#1c1b18]/5 dark:hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#1c1b18]"
              >
                <span>[F] Films</span>
              </button>

              <button
                type="button"
                onClick={onOpenMusic}
                onMouseEnter={() => onSetCursorMode('open', 'INSTAGRAM')}
                onMouseLeave={() => onSetCursorMode('default')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wider uppercase text-[#3f3c36] dark:text-[#eeeae2] hover:text-[#1c1b18] hover:bg-[#1c1b18]/5 dark:hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#1c1b18]"
              >
                <span>[M] Music</span>
              </button>
            </>
          )}

          {/* Desktop Reconstruct button (when exploded) */}
          {headphoneState === 'exploded' && !isMobile && (
            <button
              type="button"
              onClick={onReset}
              onMouseEnter={() => onSetCursorMode('reconstruct', 'RESET')}
              onMouseLeave={() => onSetCursorMode('default')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold tracking-widest uppercase bg-[#1c1b18] text-white dark:bg-[#eeeae2] dark:text-[#171614] hover:bg-[#33312c] dark:hover:bg-white rounded-lg transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1c1b18]"
              aria-label="Reconstruct headphone model (Escape key)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reconstruct [Esc]</span>
            </button>
          )}

          {/* Sound Mute / Unmute */}
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Unmute acoustic cues' : 'Mute acoustic cues'}
            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-[#5a564f] dark:text-[#aaa59b] hover:text-[#1c1b18] dark:hover:text-white hover:bg-[#1c1b18]/5 dark:hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#1c1b18]"
            onMouseEnter={() => {
              if (!isMobile) onSetCursorMode('open', isMuted ? 'UNMUTE' : 'MUTE');
            }}
            onMouseLeave={() => {
              if (!isMobile) onSetCursorMode('default');
            }}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#a39e94] dark:text-[#666]" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Ambient Music */}
          <button
            type="button"
            onClick={handleToggleAmbient}
            aria-label={ambientActive ? 'Pause ambient soundscape' : 'Play ambient soundscape'}
            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-[#5a564f] dark:text-[#aaa59b] hover:text-[#1c1b18] dark:hover:text-white hover:bg-[#1c1b18]/5 dark:hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#1c1b18]"
            onMouseEnter={() => {
              if (!isMobile) onSetCursorMode('open', ambientActive ? 'PAUSE' : 'AMBIENT');
            }}
            onMouseLeave={() => {
              if (!isMobile) onSetCursorMode('default');
            }}
          >
            <Waves className={`w-4 h-4 ${ambientActive ? 'opacity-100 text-[#1c1b18] dark:text-white' : 'opacity-40'}`} />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-[#5a564f] dark:text-[#aaa59b] hover:text-[#1c1b18] dark:hover:text-white hover:bg-[#1c1b18]/5 dark:hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#1c1b18]"
            onMouseEnter={() => {
              if (!isMobile) onSetCursorMode('open', isDark ? 'LIGHT' : 'DARK');
            }}
            onMouseLeave={() => {
              if (!isMobile) onSetCursorMode('default');
            }}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* About / Info Modal Button */}
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            aria-label="About Sarang & Portfolio Information"
            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-[#5a564f] dark:text-[#aaa59b] hover:text-[#1c1b18] dark:hover:text-white hover:bg-[#1c1b18]/5 dark:hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#1c1b18]"
            onMouseEnter={() => {
              if (!isMobile) onSetCursorMode('open', 'ABOUT');
            }}
            onMouseLeave={() => {
              if (!isMobile) onSetCursorMode('default');
            }}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Center Portfolio Direct Link (When exploded) */}
      {isExploded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <a
            href="https://srnshowcase.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => {
              if (!isMobile) onSetCursorMode('open', 'VISIT PORTFOLIO');
            }}
            onMouseLeave={() => {
              if (!isMobile) onSetCursorMode('default');
            }}
            className="pointer-events-auto px-5 py-3 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#3f3c36] dark:text-[#eeeae2] hover:text-[#1c1b18] dark:hover:text-white border border-[#1c1b18]/15 dark:border-white/20 bg-white/80 dark:bg-[#1a1917]/85 backdrop-blur-md rounded-xl transition-all duration-200 shadow-md flex items-center gap-2"
          >
            <span>VISIT PORTFOLIO SHOWCASE</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* 
        ==================================================
        CENTER / INITIAL INSTRUCTION & INTERACTION LAYER
        ==================================================
      */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-end pb-24 sm:pb-20 pointer-events-none transition-all duration-500 ease-out select-none ${
          isExploded ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {isMobile ? (
          /* Android / Mobile Initial State */
          <div className="flex flex-col items-center gap-3 pointer-events-auto">
            <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-[#78746c] dark:text-[#aaa59b]">
              DRAG TO ROTATE
            </span>

            {/* Prominent Touch Button: min 44x44px touch target */}
            <button
              type="button"
              onClick={() => {
                acousticEngine.playMicroTick();
                onTriggerExplode();
              }}
              className="min-h-[44px] px-6 py-2.5 bg-[#1c1b18] dark:bg-[#eeeae2] text-white dark:text-[#171614] rounded-full text-xs font-semibold tracking-[0.2em] uppercase shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>DISASSEMBLE</span>
            </button>
          </div>
        ) : (
          /* Desktop Initial State */
          <div className="flex flex-col items-center text-center space-y-2 pointer-events-auto">
            <p className="text-xs sm:text-sm font-medium tracking-[0.25em] text-[#33312c] dark:text-[#eeeae2] uppercase">
              DRAG / ROTATE · CLICK / DISASSEMBLE
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#78746c] dark:text-[#aaa59b] font-mono">
              <span>Left Cup: Films [F]</span>
              <span aria-hidden="true">/</span>
              <span>Right Cup: Music [M]</span>
            </div>
          </div>
        )}
      </div>

      {/* 
        ==================================================
        BOTTOM UTILITY & NAVIGATION BAR
        ==================================================
      */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-between pt-3 sm:pt-4 pointer-events-auto border-t border-[#1c1b18]/8 dark:border-white/10 text-[11px] text-[#726e66] dark:text-[#aaa59b] gap-2">
        {/* Acoustic Status / Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleSound}
            className="flex items-center gap-1.5 font-medium text-[#2d2a26] dark:text-[#eeeae2] hover:opacity-75 transition-opacity min-h-[32px] sm:min-h-0"
            aria-label={isMuted ? 'Acoustic cues muted - click to enable' : 'Acoustic cues active - click to mute'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-[#a39e94]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#726e66] dark:text-[#aaa59b]" />
            )}
            <span>ACOUSTIC INTERFACE ({isMuted ? 'MUTED' : 'ACTIVE'})</span>
          </button>
          <span aria-hidden="true" className="text-[#c2beb4] dark:text-[#555]">·</span>
          <span className="hidden xs:inline">3D WIRED HEADPHONE</span>
        </div>

        {/* Mobile Exploded Quick Actions Bar */}
        {isMobile && isExploded && (
          <div className="flex items-center gap-2 w-full pt-1">
            <button
              type="button"
              onClick={onOpenFilms}
              className="flex-1 min-h-[44px] py-2 px-3 text-xs font-semibold tracking-wider uppercase bg-[#1c1b18] dark:bg-[#eeeae2] text-white dark:text-[#171614] rounded-lg shadow-sm flex items-center justify-center gap-1"
            >
              <span>FILMS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenMusic}
              className="flex-1 min-h-[44px] py-2 px-3 text-xs font-semibold tracking-wider uppercase bg-[#1c1b18] dark:bg-[#eeeae2] text-white dark:text-[#171614] rounded-lg shadow-sm flex items-center justify-center gap-1"
            >
              <span>MUSIC</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onReset}
              className="min-h-[44px] px-3.5 py-2 text-xs font-semibold tracking-wider uppercase border border-[#1c1b18]/20 dark:border-white/20 bg-white/70 dark:bg-[#1a1917]/70 text-[#1c1b18] dark:text-white rounded-lg flex items-center justify-center"
              aria-label="Reconstruct headphone"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Desktop Keyboard Shortcuts Guide */}
        {!isMobile && (
          <div className="flex items-center gap-2 text-[10px] tracking-wider uppercase font-mono text-[#827d73] dark:text-[#aaa59b]">
            <span>Rotate: [Arrow Keys]</span>
            <span aria-hidden="true">·</span>
            <span>{headphoneState === 'exploded' ? 'Reconstruct: [Esc]' : 'Disassemble: [Click / Space]'}</span>
            {headphoneState === 'exploded' && (
              <>
                <span aria-hidden="true">·</span>
                <span>[F] Films · [M] Music</span>
              </>
            )}
          </div>
        )}
      </footer>

      {/* Info / Curatorial Statement Modal */}
      {showInfoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1b18]/40 backdrop-blur-sm pointer-events-auto"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-[#1a1917] text-[#1c1b18] dark:text-[#eeeae2] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-[#1c1b18]/10 dark:border-white/10 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#88837a] dark:text-[#aaa59b] font-semibold">
                  Curatorial Statement
                </span>
                <h3 id="info-modal-title" className="font-serif-title text-2xl text-[#1c1b18] dark:text-white mt-1">
                  SARANG · 2026
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="w-10 h-10 flex items-center justify-center text-[#666] dark:text-[#aaa59b] hover:text-[#111] dark:hover:text-white rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#1c1b18]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#4d4942] dark:text-[#bbb6ab] leading-relaxed">
              {artist.about}
            </p>

            <div className="space-y-2 pt-2 border-t border-[#1c1b18]/8 dark:border-white/10 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-[#88837a] dark:text-[#aaa59b]">Left Navigation:</span>
                <span className="font-medium text-[#1c1b18] dark:text-[#eeeae2]">Films (Saranghaeyo on Letterboxd)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#88837a] dark:text-[#aaa59b]">Right Navigation:</span>
                <span className="font-medium text-[#1c1b18] dark:text-[#eeeae2]">Music (Playlist BGM on Instagram)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#88837a] dark:text-[#aaa59b]">Physical Object:</span>
                <span className="font-medium text-[#1c1b18] dark:text-[#eeeae2]">Complete White Wired Headphone</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="w-full py-3.5 min-h-[44px] bg-[#1c1b18] text-white dark:bg-[#eeeae2] dark:text-[#171614] text-xs font-semibold tracking-widest uppercase rounded-xl hover:bg-[#33312c] dark:hover:bg-white transition-colors"
              >
                Return to Headphone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
