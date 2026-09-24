import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import {
  HeadbandPart,
  EarCupPart,
  WiredCablePart,
} from './HeadphoneParts';
import {
  assembledPositions,
  playExplosionAnimation,
  playReassembleAnimation,
} from './ExplosionAnimation';
import { acousticEngine } from '../utils/acousticEngine';
import { CursorMode, ActiveDestination, HeadphoneState, InteractionState } from '../types';

interface HeadphonesProps {
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

export const Headphones: React.FC<HeadphonesProps> = ({
  headphoneState,
  onTriggerExplode,
  onAnimationFinished,
  onOpenFilms,
  onOpenMusic,
  onSetCursorMode,
  activeDestination,
  setActiveDestination,
  keyboardRot,
  isMobile,
}) => {
  const { gl } = useThree();

  // Root group controlling overall transforms
  const headphoneRootRef = useRef<THREE.Group>(null);

  // Individual child groups for GSAP disassembly
  const headbandGroupRef = useRef<THREE.Group>(null);
  const leftCupGroupRef = useRef<THREE.Group>(null);
  const rightCupGroupRef = useRef<THREE.Group>(null);
  const cableGroupRef = useRef<THREE.Group>(null);

  const prevStateRef = useRef<HeadphoneState>(headphoneState);

  // Hover states for individual parts (desktop only)
  const [hoveredPart, setHoveredPart] = useState<'headband' | 'leftCup' | 'rightCup' | 'cable' | null>(null);

  // Authoritative Single-Source Rotation & Touch Controller State
  const rotCtrl = useRef({
    // Rendered angles
    current: { x: 0.1, y: -0.25 },
    // Target angles updated by input & inertia
    target: { x: 0.1, y: -0.25 },
    // Velocity for momentum
    velocity: { x: 0, y: 0 },
    // Pointer tracking
    pointer: {
      id: null as number | null,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      startTime: 0,
      isDown: false,
      hasExceededDragThreshold: false,
    },
    interactionState: 'idle' as InteractionState,
    // Idle float influence (1.0 = fully active, 0.0 = completely frozen)
    idleFloatWeight: 1.0,
    isAnimating: false,
  });

  // GSAP Disassembly / Reassembly Animation
  useEffect(() => {
    const prevState = prevStateRef.current;
    prevStateRef.current = headphoneState;

    if (headphoneState === 'exploding') {
      rotCtrl.current.isAnimating = true;
      rotCtrl.current.velocity = { x: 0, y: 0 };

      const targets = {
        headbandGroup: headbandGroupRef.current,
        leftCupGroup: leftCupGroupRef.current,
        rightCupGroup: rightCupGroupRef.current,
        cableGroup: cableGroupRef.current,
      };

      if (prevState === 'assembled') {
        acousticEngine.playDisassembly();
        playExplosionAnimation(targets, () => {
          rotCtrl.current.isAnimating = false;
          onAnimationFinished('exploded');
        });
      } else if (prevState === 'exploded') {
        acousticEngine.playReassemblyWhoosh();
        playReassembleAnimation(targets, () => {
          acousticEngine.playReassemblyLock();
          rotCtrl.current.isAnimating = false;
          onAnimationFinished('assembled');
        });
      }
    }
  }, [headphoneState, onAnimationFinished]);

  // Robust Native DOM Pointer Events attached directly to the canvas
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    canvas.style.touchAction = 'none';
    canvas.style.userSelect = 'none';
    (canvas.style as any).webkitUserSelect = 'none';
    (canvas.style as any).webkitTouchCallout = 'none';
    (canvas.style as any).webkitTapHighlightColor = 'transparent';

    const onPointerDown = (e: PointerEvent) => {
      // Allow only primary mouse button or touch
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const ctrl = rotCtrl.current;
      // If already tracking a pointer, ignore multi-touch conflicts
      if (ctrl.pointer.isDown) return;

      ctrl.pointer.id = e.pointerId;
      ctrl.pointer.startX = e.clientX;
      ctrl.pointer.startY = e.clientY;
      ctrl.pointer.lastX = e.clientX;
      ctrl.pointer.lastY = e.clientY;
      ctrl.pointer.startTime = performance.now();
      ctrl.pointer.isDown = true;
      ctrl.pointer.hasExceededDragThreshold = false;

      ctrl.interactionState = 'pressing';
      ctrl.velocity = { x: 0, y: 0 };
      // Rapidly suppress idle floating so it never fights user touch
      ctrl.idleFloatWeight = 0;

      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      const ctrl = rotCtrl.current;
      const p = ctrl.pointer;
      if (!p.isDown || p.id !== e.pointerId) return;

      const totalDist = Math.hypot(e.clientX - p.startX, e.clientY - p.startY);
      const DRAG_THRESHOLD = 9; // 9px threshold to prevent accidental clicks on touch

      if (!p.hasExceededDragThreshold) {
        if (totalDist >= DRAG_THRESHOLD) {
          p.hasExceededDragThreshold = true;
          ctrl.interactionState = 'dragging';
          // Synchronize last position to eliminate any initial jump
          p.lastX = e.clientX;
          p.lastY = e.clientY;
          if (!isMobile) {
            onSetCursorMode('rotate', 'ROTATE');
          }
        } else {
          return; // Still within tap tolerance
        }
      }

      const deltaX = e.clientX - p.lastX;
      const deltaY = e.clientY - p.lastY;
      p.lastX = e.clientX;
      p.lastY = e.clientY;

      const sensitivity = isMobile ? 0.0062 : 0.005;

      // X motion rotates around Y axis (yaw); Y motion tilts around X axis (pitch)
      ctrl.target.y += deltaX * sensitivity;
      ctrl.target.x += deltaY * sensitivity;

      // Smooth instantaneous velocity tracking
      const instantVelY = deltaX * sensitivity;
      const instantVelX = deltaY * sensitivity;
      ctrl.velocity.y = ctrl.velocity.y * 0.35 + instantVelY * 0.65;
      ctrl.velocity.x = ctrl.velocity.x * 0.35 + instantVelX * 0.65;
    };

    const onPointerUp = (e: PointerEvent) => {
      const ctrl = rotCtrl.current;
      const p = ctrl.pointer;
      if (!p.isDown || (p.id !== null && p.id !== e.pointerId)) return;

      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}

      const duration = performance.now() - p.startTime;
      const wasDrag = p.hasExceededDragThreshold;

      p.isDown = false;
      p.id = null;

      if (!wasDrag && duration < 400) {
        // CLEAN TAP DETECTED
        ctrl.interactionState = 'idle';
        ctrl.velocity = { x: 0, y: 0 };

        if (headphoneState === 'assembled') {
          onTriggerExplode();
        }
      } else {
        // DRAG RELEASE DETECTED -> APPLY INERTIA
        ctrl.interactionState = 'releasing';
        // Clamp maximum initial release velocity to avoid uncontrolled spinning
        const MAX_VELOCITY = 0.07;
        ctrl.velocity.x = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, ctrl.velocity.x));
        ctrl.velocity.y = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, ctrl.velocity.y));
      }

      if (!isMobile) {
        onSetCursorMode('default');
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      const ctrl = rotCtrl.current;
      if (ctrl.pointer.id === e.pointerId) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {}
        ctrl.pointer.isDown = false;
        ctrl.pointer.id = null;
        ctrl.interactionState = 'idle';
        ctrl.velocity = { x: 0, y: 0 };
        if (!isMobile) onSetCursorMode('default');
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerCancel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [gl, isMobile, headphoneState, onTriggerExplode, onSetCursorMode]);

  // Unified Frame-rate Normalized Render & Physics Loop
  useFrame((state, delta) => {
    if (!headphoneRootRef.current) return;

    const dt = Math.min(delta, 0.045);
    const timeScale = dt / 0.01667; // Normalized to 60fps standard
    const ctrl = rotCtrl.current;

    // 1. Keyboard Rotation Input
    if (keyboardRot.x !== 0 || keyboardRot.y !== 0) {
      ctrl.target.x += keyboardRot.x * dt * 2.4;
      ctrl.target.y += keyboardRot.y * dt * 2.4;
      ctrl.idleFloatWeight = 0;
    }

    // 2. Inertia Decay & Settling
    if (!ctrl.pointer.isDown) {
      if (ctrl.interactionState === 'releasing') {
        ctrl.target.x += ctrl.velocity.x * timeScale;
        ctrl.target.y += ctrl.velocity.y * timeScale;

        // Friction damping
        const damping = Math.pow(0.89, timeScale);
        ctrl.velocity.x *= damping;
        ctrl.velocity.y *= damping;

        if (Math.hypot(ctrl.velocity.x, ctrl.velocity.y) < 0.00015) {
          ctrl.velocity.x = 0;
          ctrl.velocity.y = 0;
          ctrl.interactionState = 'idle';
        }
      }

      // Gentle orientation stabilization when in exploded state
      if (headphoneState === 'exploded' && ctrl.interactionState === 'idle') {
        ctrl.target.x = THREE.MathUtils.lerp(ctrl.target.x, 0.04, 0.035 * timeScale);
        ctrl.target.y = THREE.MathUtils.lerp(ctrl.target.y, 0, 0.035 * timeScale);
      }
    }

    // 3. Clamp vertical pitch rotation to prevent disorientation
    ctrl.target.x = THREE.MathUtils.clamp(
      ctrl.target.x,
      -Math.PI / 3.2,
      Math.PI / 3.2
    );

    // 4. Smooth frame-rate independent interpolation towards target
    const lerpAlpha = 1 - Math.pow(0.002, dt);
    const clampedAlpha = THREE.MathUtils.clamp(lerpAlpha, 0.08, 0.35);
    ctrl.current.x = THREE.MathUtils.lerp(ctrl.current.x, ctrl.target.x, clampedAlpha);
    ctrl.current.y = THREE.MathUtils.lerp(ctrl.current.y, ctrl.target.y, clampedAlpha);

    // 5. Idle Floating Priority Management:
    // If user is touching, dragging, or reassembling, idle floating pauses completely.
    // When idle and settled, floating smoothly fades back in.
    if (ctrl.interactionState === 'idle' && !ctrl.isAnimating) {
      ctrl.idleFloatWeight = THREE.MathUtils.lerp(ctrl.idleFloatWeight, 1, 0.04 * timeScale);
    } else {
      ctrl.idleFloatWeight = THREE.MathUtils.lerp(ctrl.idleFloatWeight, 0, 0.18 * timeScale);
    }

    const time = state.clock.getElapsedTime();
    const floatY = (headphoneState === 'exploded' ? 0 : Math.sin(time * 1.25) * 0.045) * ctrl.idleFloatWeight;
    const floatTilt = (headphoneState === 'exploded' ? 0 : Math.cos(time * 0.85) * 0.012) * ctrl.idleFloatWeight;

    // Apply Authoritative Transforms
    headphoneRootRef.current.position.y = floatY;
    headphoneRootRef.current.rotation.x = ctrl.current.x + floatTilt;
    headphoneRootRef.current.rotation.y = ctrl.current.y;
    headphoneRootRef.current.rotation.z = floatTilt * 0.35;
  });

  const handleCupClick = useCallback((side: 'left' | 'right', e: any) => {
    e.stopPropagation();
    // If the user was dragging, ignore the click
    if (rotCtrl.current.pointer.hasExceededDragThreshold) return;

    if (headphoneState === 'assembled') {
      onTriggerExplode();
    } else if (headphoneState === 'exploded') {
      if (side === 'left') {
        onOpenFilms();
      } else {
        onOpenMusic();
      }
    }
  }, [headphoneState, onTriggerExplode, onOpenFilms, onOpenMusic]);

  return (
    <group
      ref={headphoneRootRef}
      scale={isMobile ? 0.76 : 1.0}
    >
      {/* Headband Group */}
      <group
        ref={headbandGroupRef}
        position={[
          assembledPositions.headband.x,
          assembledPositions.headband.y,
          assembledPositions.headband.z,
        ]}
        onPointerOver={(e) => {
          if (e.pointerType === 'touch') return;
          e.stopPropagation();
          setHoveredPart('headband');
          if (headphoneState === 'assembled') {
            onSetCursorMode('click', 'DISASSEMBLE');
          } else if (headphoneState === 'exploded') {
            onSetCursorMode('rotate', 'ROTATE');
          }
        }}
        onPointerOut={() => {
          setHoveredPart(null);
          onSetCursorMode('default');
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (rotCtrl.current.pointer.hasExceededDragThreshold) return;
          if (headphoneState === 'assembled') onTriggerExplode();
        }}
      >
        <HeadbandPart isHovered={hoveredPart === 'headband'} />
      </group>

      {/* Left Cup Group (FILMS Destination) */}
      <group
        ref={leftCupGroupRef}
        position={[
          assembledPositions.leftCup.x,
          assembledPositions.leftCup.y,
          assembledPositions.leftCup.z,
        ]}
        onPointerOver={(e) => {
          if (e.pointerType === 'touch') return;
          e.stopPropagation();
          setHoveredPart('leftCup');
          acousticEngine.playMicroTick();
          if (headphoneState === 'assembled') {
            onSetCursorMode('click', 'DISASSEMBLE');
          } else if (headphoneState === 'exploded') {
            onSetCursorMode('open', 'OPEN FILMS');
            setActiveDestination('films');
          }
        }}
        onPointerOut={() => {
          setHoveredPart(null);
          onSetCursorMode('default');
          if (activeDestination === 'films') {
            setActiveDestination(null);
          }
        }}
        onClick={(e) => handleCupClick('left', e)}
      >
        <EarCupPart
          side="left"
          isHovered={hoveredPart === 'leftCup' || activeDestination === 'films'}
        />
      </group>

      {/* Right Cup Group (MUSIC Destination) */}
      <group
        ref={rightCupGroupRef}
        position={[
          assembledPositions.rightCup.x,
          assembledPositions.rightCup.y,
          assembledPositions.rightCup.z,
        ]}
        onPointerOver={(e) => {
          if (e.pointerType === 'touch') return;
          e.stopPropagation();
          setHoveredPart('rightCup');
          acousticEngine.playMicroTick();
          if (headphoneState === 'assembled') {
            onSetCursorMode('click', 'DISASSEMBLE');
          } else if (headphoneState === 'exploded') {
            onSetCursorMode('open', 'OPEN MUSIC');
            setActiveDestination('music');
          }
        }}
        onPointerOut={() => {
          setHoveredPart(null);
          onSetCursorMode('default');
          if (activeDestination === 'music') {
            setActiveDestination(null);
          }
        }}
        onClick={(e) => handleCupClick('right', e)}
      >
        <EarCupPart
          side="right"
          isHovered={hoveredPart === 'rightCup' || activeDestination === 'music'}
        />
      </group>

      {/* Wired Cable Group */}
      <group
        ref={cableGroupRef}
        position={[
          assembledPositions.cable.x,
          assembledPositions.cable.y,
          assembledPositions.cable.z,
        ]}
        onPointerOver={(e) => {
          if (e.pointerType === 'touch') return;
          e.stopPropagation();
          setHoveredPart('cable');
          if (headphoneState === 'assembled') {
            onSetCursorMode('click', 'DISASSEMBLE');
          } else if (headphoneState === 'exploded') {
            onSetCursorMode('rotate', 'ROTATE');
          }
        }}
        onPointerOut={() => {
          setHoveredPart(null);
          onSetCursorMode('default');
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (rotCtrl.current.pointer.hasExceededDragThreshold) return;
          if (headphoneState === 'assembled') onTriggerExplode();
        }}
      >
        <WiredCablePart isHovered={hoveredPart === 'cable'} />
      </group>
    </group>
  );
};
