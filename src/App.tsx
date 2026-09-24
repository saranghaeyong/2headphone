import { useState, useEffect, useCallback, useRef } from 'react';
import { Scene } from './components/Scene';
import { NavigationObject } from './components/NavigationObject';
import { UI } from './components/UI';
import { CustomCursor } from './components/CustomCursor';
import { LoadingScreen } from './components/LoadingScreen';
import { PORTFOLIO_CONFIG } from './config/portfolio';
import { CursorMode, ActiveDestination, HeadphoneState, ViewportMode } from './types';
import { acousticEngine } from './utils/acousticEngine';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(30);

  // State Machine: strictly starts as 'assembled'
  // Transitions: 'assembled' -> 'exploding' -> 'exploded' (and reverse for reset)
  const [headphoneState, setHeadphoneState] =
    useState<HeadphoneState>('assembled');

  const [activeDestination, setActiveDestination] = useState<ActiveDestination>(null);
  const [cursorMode, setCursorMode] = useState<CursorMode>('default');
  const [cursorText, setCursorText] = useState<string | null>(null);
  const [keyboardRot, setKeyboardRot] = useState({ x: 0, y: 0 });
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');

  // Keyboard rotation tracker
  const activeKeys = useRef<{ [key: string]: boolean }>({});

  // Responsive Breakpoint Handling:
  // - Small Mobile: < 600px
  // - Tablet / Large Mobile: 600px – 1023px
  // - Desktop: >= 1024px
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setViewportMode('mobile');
      } else if (width < 1024) {
        setViewportMode('tablet');
      } else {
        setViewportMode('desktop');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isMobile = viewportMode === 'mobile';

  // Subtle asset loading simulation - strictly ensures 'assembled' state
  useEffect(() => {
    const p1 = setTimeout(() => setLoadProgress(70), 180);
    const p2 = setTimeout(() => setLoadProgress(100), 450);
    const p3 = setTimeout(() => {
      setIsLoaded(true);
      setHeadphoneState('assembled');
    }, 650);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
    };
  }, []);

  const handleOpenFilms = useCallback(() => {
    acousticEngine.playMicroTick();
    window.open(PORTFOLIO_CONFIG.destinations.films.url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleOpenMusic = useCallback(() => {
    acousticEngine.playMicroTick();
    window.open(PORTFOLIO_CONFIG.destinations.music.url, '_blank', 'noopener,noreferrer');
  }, []);

  // Trigger disassembly
  const handleTriggerExplode = useCallback(() => {
    setHeadphoneState((current) => {
      if (current === 'assembled') {
        return 'exploding';
      }
      return current;
    });
  }, []);

  // Reset interaction to reconstruct headphone back to assembled position
  const handleTriggerReset = useCallback(() => {
    setHeadphoneState((current) => {
      if (current === 'exploded') {
        setActiveDestination(null);
        return 'exploding';
      }
      return current;
    });
  }, []);

  // Callback when GSAP animation completes
  const handleAnimationFinished = useCallback((nextState: 'assembled' | 'exploded') => {
    setHeadphoneState(nextState);
  }, []);

  const handleSetCursorMode = useCallback((mode: CursorMode, text?: string | null) => {
    setCursorMode(mode);
    setCursorText(text ?? null);
  }, []);

  // Keyboard Accessibility:
  // - Arrow keys: rotate headphone
  // - Enter / Space: triggers explosion
  // - Escape: resets scene
  // - F: opens Films
  // - M: opens Music
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      activeKeys.current[e.key] = true;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleTriggerExplode();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleTriggerReset();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleOpenFilms();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleOpenMusic();
      }

      let kx = 0;
      let ky = 0;
      if (activeKeys.current['ArrowUp']) kx -= 1;
      if (activeKeys.current['ArrowDown']) kx += 1;
      if (activeKeys.current['ArrowLeft']) ky -= 1;
      if (activeKeys.current['ArrowRight']) ky += 1;

      setKeyboardRot({ x: kx, y: ky });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys.current[e.key] = false;

      let kx = 0;
      let ky = 0;
      if (activeKeys.current['ArrowUp']) kx -= 1;
      if (activeKeys.current['ArrowDown']) kx += 1;
      if (activeKeys.current['ArrowLeft']) ky -= 1;
      if (activeKeys.current['ArrowRight']) ky += 1;

      setKeyboardRot({ x: kx, y: ky });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleTriggerExplode, handleTriggerReset, handleOpenFilms, handleOpenMusic]);

  return (
    <main className="relative w-full h-full min-h-[100dvh] h-[100dvh] overflow-hidden bg-paper select-none">
      <h1 className="sr-only">
        SARANG — Interactive 3D Portfolio & Acoustic Navigation Object
      </h1>

      {/* Subtle Editorial Loading Screen */}
      <LoadingScreen progress={loadProgress} isLoaded={isLoaded} />

      {/* Custom Precision Cursor (Active only on fine pointer desktop) */}
      <CustomCursor mode={cursorMode} hoverText={cursorText} />

      {/* Primary 3D Spatial Canvas Scene */}
      <Scene
        headphoneState={headphoneState}
        onTriggerExplode={handleTriggerExplode}
        onTriggerReset={handleTriggerReset}
        onAnimationFinished={handleAnimationFinished}
        onOpenFilms={handleOpenFilms}
        onOpenMusic={handleOpenMusic}
        onSetCursorMode={handleSetCursorMode}
        activeDestination={activeDestination}
        setActiveDestination={setActiveDestination}
        keyboardRot={keyboardRot}
        isMobile={isMobile}
      />

      {/* 2D/3D Destination Cards Layer (FILMS & MUSIC) */}
      <NavigationObject
        isExploded={headphoneState === 'exploded'}
        activeDestination={activeDestination}
        setActiveDestination={setActiveDestination}
        onSetCursorMode={handleSetCursorMode}
        onOpenFilms={handleOpenFilms}
        onOpenMusic={handleOpenMusic}
        isMobile={isMobile}
      />

      {/* Top Bar, Hero Name, and Bottom Accessibility Footer */}
      <UI
        headphoneState={headphoneState}
        onReset={handleTriggerReset}
        onTriggerExplode={handleTriggerExplode}
        onSetCursorMode={handleSetCursorMode}
        onOpenFilms={handleOpenFilms}
        onOpenMusic={handleOpenMusic}
        isMobile={isMobile}
      />
    </main>
  );
}
