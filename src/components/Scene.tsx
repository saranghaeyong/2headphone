import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { Headphones } from './Headphones';
import { CursorMode, ActiveDestination, HeadphoneState } from '../types';

interface SceneProps {
  headphoneState: HeadphoneState;
  onTriggerExplode: () => void;
  onTriggerReset: () => void;
  onAnimationFinished: (nextState: 'assembled' | 'exploded') => void;
  onOpenFilms: () => void;
  onOpenMusic: () => void;
  onSetCursorMode: (mode: CursorMode, text?: string | null) => void;
  activeDestination: ActiveDestination;
  setActiveDestination: (dest: ActiveDestination) => void;
  keyboardRot: { x: number; y: number };
  isMobile: boolean;
}

export const Scene: React.FC<SceneProps> = ({
  headphoneState,
  onTriggerExplode,
  onTriggerReset,
  onAnimationFinished,
  onOpenFilms,
  onOpenMusic,
  onSetCursorMode,
  activeDestination,
  setActiveDestination,
  keyboardRot,
  isMobile,
}) => {
  return (
    <div
      className="w-full h-full absolute inset-0 select-none canvas-interaction-surface"
      onPointerLeave={() => {
        if (!isMobile) onSetCursorMode('default');
      }}
    >
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, isMobile ? 1.75 : 2)]}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 0, isMobile ? 7.2 : 6.2]}
          fov={isMobile ? 46 : 40}
        />

        {/* Ambient & Studio Three-Point Lighting */}
        <ambientLight intensity={1.15} color="#ffffff" />
        
        {/* Key Directional Light */}
        <directionalLight
          position={[4, 8, 5]}
          intensity={1.75}
          castShadow
          shadow-mapSize-width={isMobile ? 512 : 1024}
          shadow-mapSize-height={isMobile ? 512 : 1024}
          shadow-camera-near={0.5}
          shadow-camera-far={25}
          shadow-bias={-0.0001}
          color="#fffdfa"
        />

        {/* Soft Cool Fill Light */}
        <directionalLight
          position={[-5, 2, -3]}
          intensity={0.8}
          color="#f4f6fa"
        />

        {/* Rim Light for Crisp Separation */}
        <directionalLight
          position={[0, -4, -6]}
          intensity={1.15}
          color="#ffffff"
        />

        {/* Studio Top Soft Fill */}
        <directionalLight
          position={[0, 6, 0]}
          intensity={0.55}
          color="#faf8f5"
        />

        {/* Subtle environment reflection map */}
        <Environment preset="studio" environmentIntensity={0.32} />

        <Suspense fallback={null}>
          <Headphones
            headphoneState={headphoneState}
            onTriggerExplode={onTriggerExplode}
            onTriggerReset={onTriggerReset}
            onAnimationFinished={onAnimationFinished}
            onOpenFilms={onOpenFilms}
            onOpenMusic={onOpenMusic}
            onSetCursorMode={onSetCursorMode}
            activeDestination={activeDestination}
            setActiveDestination={setActiveDestination}
            keyboardRot={keyboardRot}
            isMobile={isMobile}
          />

          {/* Soft natural studio contact shadow */}
          <ContactShadows
            position={[0, headphoneState === 'exploded' ? -2.7 : -2.3, 0]}
            opacity={0.3}
            scale={isMobile ? 9 : 11}
            blur={2.4}
            far={4.5}
            resolution={isMobile ? 512 : 1024}
            color="#686358"
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
