import React, { useEffect, useRef, useState } from 'react';
import { CursorMode } from '../types';

interface CustomCursorProps {
  mode: CursorMode;
  hoverText?: string | null;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ mode, hoverText }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSupportedDevice, setIsSupportedDevice] = useState(false);

  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable on desktop with fine mouse pointer and hover capability
    const checkFinePointer = () => {
      const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      setIsSupportedDevice(isFine);
      if (isFine) {
        document.body.classList.add('custom-cursor-active');
      } else {
        document.body.classList.remove('custom-cursor-active');
      }
    };

    checkFinePointer();
    window.addEventListener('resize', checkFinePointer);

    const onMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let animationFrameId: number;
    const updateCursor = () => {
      // Fluid damped lerp
      pos.current.x += (target.current.x - pos.current.x) * 0.24;
      pos.current.y += (target.current.y - pos.current.y) * 0.24;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updateCursor);
    };

    animationFrameId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('resize', checkFinePointer);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isVisible]);

  // Completely disabled on mobile / touch devices
  if (!isSupportedDevice) return null;

  // Determine label
  let displayLabel: string | null = null;
  if (hoverText) {
    displayLabel = hoverText;
  } else if (mode === 'rotate') {
    displayLabel = 'ROTATE';
  } else if (mode === 'open') {
    displayLabel = 'OPEN';
  } else if (mode === 'click') {
    displayLabel = 'DISASSEMBLE';
  } else if (mode === 'reconstruct') {
    displayLabel = 'RESET';
  }

  const isExpanded = mode !== 'default' || Boolean(displayLabel);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-50 -ml-5 -mt-5 transition-opacity duration-200"
      style={{
        opacity: isVisible ? 1 : 0,
        willChange: 'transform',
      }}
    >
      <div
        className={`flex items-center justify-center transition-all duration-300 ease-out ${
          isExpanded
            ? 'h-16 w-16 -ml-3 -mt-3 rounded-full bg-[#1c1b18]/90 text-white shadow-lg backdrop-blur-md'
            : 'h-10 w-10 rounded-full border border-[#1c1b18]/40 bg-[#1c1b18]/5'
        }`}
      >
        {isExpanded ? (
          <span
            ref={textRef}
            className="text-[9px] font-semibold tracking-widest uppercase select-none text-center px-1 font-sans"
          >
            {displayLabel}
          </span>
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-[#1c1b18]" />
        )}
      </div>
    </div>
  );
};
