import { gsap } from 'gsap';
import * as THREE from 'three';

export interface ExplosionTargets {
  headbandGroup: THREE.Group | null;
  leftCupGroup: THREE.Group | null;
  rightCupGroup: THREE.Group | null;
  cableGroup: THREE.Group | null;
}

/**
 * ASSEMBLED POSITION:
 * All parts have their original natural positions.
 * In our gapless procedural model hierarchy, at (0, 0, 0) all components
 * visually form ONE complete, connected, airtight headphone.
 */
export const assembledPositions = {
  headband: { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1 },
  leftCup: { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1 },
  rightCup: { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1 },
  cable: { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1 },
};

/**
 * EXPLODED POSITION:
 * The separated navigation positions applied ONLY after explicit user click/tap.
 */
export const explodedPositions = {
  headband: {
    x: 0,
    y: 1.65,
    z: -0.3,
    rotX: -0.22,
    rotY: 0,
    rotZ: 0,
    scale: 0.95,
  },
  leftCup: {
    x: -1.75,
    y: 0.05,
    z: 0.65,
    rotX: 0.05,
    rotY: 0.42,
    rotZ: 0.1,
    scale: 1.08,
  },
  rightCup: {
    x: 1.75,
    y: 0.05,
    z: 0.65,
    rotX: 0.05,
    rotY: -0.42,
    rotZ: -0.1,
    scale: 1.08,
  },
  cable: {
    x: -1.05,
    y: -1.3,
    z: 0.35,
    rotX: 0.25,
    rotY: 0.1,
    rotZ: 0.1,
    scale: 0.9,
  },
};

/**
 * Animate the headphone components apart (assembled -> exploding -> exploded)
 * Duration: 950ms, ease: power3.inOut
 */
export function playExplosionAnimation(
  targets: ExplosionTargets,
  onComplete?: () => void
): gsap.core.Timeline | null {
  const { headbandGroup, leftCupGroup, rightCupGroup, cableGroup } = targets;
  if (!headbandGroup || !leftCupGroup || !rightCupGroup || !cableGroup) {
    return null;
  }

  // Kill any ongoing tweens on these targets
  gsap.killTweensOf([
    headbandGroup.position,
    headbandGroup.rotation,
    headbandGroup.scale,
    leftCupGroup.position,
    leftCupGroup.rotation,
    leftCupGroup.scale,
    rightCupGroup.position,
    rightCupGroup.rotation,
    rightCupGroup.scale,
    cableGroup.position,
    cableGroup.rotation,
    cableGroup.scale,
  ]);

  const tl = gsap.timeline({
    onComplete: () => {
      onComplete?.();
    },
  });

  const duration = 0.95;
  const ease = 'power3.inOut';

  // Headband moves upward and tilts back
  tl.to(
    headbandGroup.position,
    {
      x: explodedPositions.headband.x,
      y: explodedPositions.headband.y,
      z: explodedPositions.headband.z,
      duration,
      ease,
    },
    0
  );
  tl.to(
    headbandGroup.rotation,
    {
      x: explodedPositions.headband.rotX,
      y: explodedPositions.headband.rotY,
      z: explodedPositions.headband.rotZ,
      duration,
      ease,
    },
    0
  );
  tl.to(
    headbandGroup.scale,
    {
      x: explodedPositions.headband.scale,
      y: explodedPositions.headband.scale,
      z: explodedPositions.headband.scale,
      duration,
      ease,
    },
    0
  );

  // Left Cup (FILMS) moves outward left, slightly forward, and faces viewer
  tl.to(
    leftCupGroup.position,
    {
      x: explodedPositions.leftCup.x,
      y: explodedPositions.leftCup.y,
      z: explodedPositions.leftCup.z,
      duration,
      ease,
    },
    0
  );
  tl.to(
    leftCupGroup.rotation,
    {
      x: explodedPositions.leftCup.rotX,
      y: explodedPositions.leftCup.rotY,
      z: explodedPositions.leftCup.rotZ,
      duration,
      ease,
    },
    0
  );
  tl.to(
    leftCupGroup.scale,
    {
      x: explodedPositions.leftCup.scale,
      y: explodedPositions.leftCup.scale,
      z: explodedPositions.leftCup.scale,
      duration,
      ease,
    },
    0
  );

  // Right Cup (MUSIC) moves outward right, slightly forward, and faces viewer
  tl.to(
    rightCupGroup.position,
    {
      x: explodedPositions.rightCup.x,
      y: explodedPositions.rightCup.y,
      z: explodedPositions.rightCup.z,
      duration,
      ease,
    },
    0
  );
  tl.to(
    rightCupGroup.rotation,
    {
      x: explodedPositions.rightCup.rotX,
      y: explodedPositions.rightCup.rotY,
      z: explodedPositions.rightCup.rotZ,
      duration,
      ease,
    },
    0
  );
  tl.to(
    rightCupGroup.scale,
    {
      x: explodedPositions.rightCup.scale,
      y: explodedPositions.rightCup.scale,
      z: explodedPositions.rightCup.scale,
      duration,
      ease,
    },
    0
  );

  // Audio cable drops downward and stretches gently
  tl.to(
    cableGroup.position,
    {
      x: explodedPositions.cable.x,
      y: explodedPositions.cable.y,
      z: explodedPositions.cable.z,
      duration,
      ease,
    },
    0
  );
  tl.to(
    cableGroup.rotation,
    {
      x: explodedPositions.cable.rotX,
      y: explodedPositions.cable.rotY,
      z: explodedPositions.cable.rotZ,
      duration,
      ease,
    },
    0
  );
  tl.to(
    cableGroup.scale,
    {
      x: explodedPositions.cable.scale,
      y: explodedPositions.cable.scale,
      z: explodedPositions.cable.scale,
      duration,
      ease,
    },
    0
  );

  return tl;
}

/**
 * Animate the headphone components back to assembled state (exploded -> exploding -> assembled)
 * Duration: 950ms, ease: power3.inOut
 */
export function playReassembleAnimation(
  targets: ExplosionTargets,
  onComplete?: () => void
): gsap.core.Timeline | null {
  const { headbandGroup, leftCupGroup, rightCupGroup, cableGroup } = targets;
  if (!headbandGroup || !leftCupGroup || !rightCupGroup || !cableGroup) {
    return null;
  }

  // Kill any ongoing tweens
  gsap.killTweensOf([
    headbandGroup.position,
    headbandGroup.rotation,
    headbandGroup.scale,
    leftCupGroup.position,
    leftCupGroup.rotation,
    leftCupGroup.scale,
    rightCupGroup.position,
    rightCupGroup.rotation,
    rightCupGroup.scale,
    cableGroup.position,
    cableGroup.rotation,
    cableGroup.scale,
  ]);

  const tl = gsap.timeline({
    onComplete: () => {
      onComplete?.();
    },
  });

  const duration = 0.95;
  const ease = 'power3.inOut';

  // Headband returns to assembled position
  tl.to(
    headbandGroup.position,
    {
      x: assembledPositions.headband.x,
      y: assembledPositions.headband.y,
      z: assembledPositions.headband.z,
      duration,
      ease,
    },
    0
  );
  tl.to(
    headbandGroup.rotation,
    {
      x: assembledPositions.headband.rotX,
      y: assembledPositions.headband.rotY,
      z: assembledPositions.headband.rotZ,
      duration,
      ease,
    },
    0
  );
  tl.to(
    headbandGroup.scale,
    {
      x: assembledPositions.headband.scale,
      y: assembledPositions.headband.scale,
      z: assembledPositions.headband.scale,
      duration,
      ease,
    },
    0
  );

  // Left Cup returns to assembled position
  tl.to(
    leftCupGroup.position,
    {
      x: assembledPositions.leftCup.x,
      y: assembledPositions.leftCup.y,
      z: assembledPositions.leftCup.z,
      duration,
      ease,
    },
    0
  );
  tl.to(
    leftCupGroup.rotation,
    {
      x: assembledPositions.leftCup.rotX,
      y: assembledPositions.leftCup.rotY,
      z: assembledPositions.leftCup.rotZ,
      duration,
      ease,
    },
    0
  );
  tl.to(
    leftCupGroup.scale,
    {
      x: assembledPositions.leftCup.scale,
      y: assembledPositions.leftCup.scale,
      z: assembledPositions.leftCup.scale,
      duration,
      ease,
    },
    0
  );

  // Right Cup returns to assembled position
  tl.to(
    rightCupGroup.position,
    {
      x: assembledPositions.rightCup.x,
      y: assembledPositions.rightCup.y,
      z: assembledPositions.rightCup.z,
      duration,
      ease,
    },
    0
  );
  tl.to(
    rightCupGroup.rotation,
    {
      x: assembledPositions.rightCup.rotX,
      y: assembledPositions.rightCup.rotY,
      z: assembledPositions.rightCup.rotZ,
      duration,
      ease,
    },
    0
  );
  tl.to(
    rightCupGroup.scale,
    {
      x: assembledPositions.rightCup.scale,
      y: assembledPositions.rightCup.scale,
      z: assembledPositions.rightCup.scale,
      duration,
      ease,
    },
    0
  );

  // Cable returns to assembled position
  tl.to(
    cableGroup.position,
    {
      x: assembledPositions.cable.x,
      y: assembledPositions.cable.y,
      z: assembledPositions.cable.z,
      duration,
      ease,
    },
    0
  );
  tl.to(
    cableGroup.rotation,
    {
      x: assembledPositions.cable.rotX,
      y: assembledPositions.cable.rotY,
      z: assembledPositions.cable.rotZ,
      duration,
      ease,
    },
    0
  );
  tl.to(
    cableGroup.scale,
    {
      x: assembledPositions.cable.scale,
      y: assembledPositions.cable.scale,
      z: assembledPositions.cable.scale,
      duration,
      ease,
    },
    0
  );

  return tl;
}
