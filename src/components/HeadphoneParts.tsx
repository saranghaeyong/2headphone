/**
 * HEADPHONE 3D PARTS & GAPLESS PROCEDURAL MESH DEFINITIONS
 * 
 * --------------------------------------------------------------------------------
 * All components are mathematically aligned so that when each part group is at
 * local position (0, 0, 0), the parts seamlessly connect with ZERO gaps:
 * - Headband slider ends at:      (±1.18, 0.28, 0)
 * - Ear cup yoke top socket at:   (±1.18, 0.28, 0) -> 100% seamless airtight fit!
 * - Ear cup body centered at:     (±1.18, 0, 0)
 * - Left ear cup cable port at:   (-1.18, -0.44, 0)
 * - Audio cable starts at:        (-1.18, -0.44, 0) -> 100% seamless airtight fit!
 * --------------------------------------------------------------------------------
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';

// Premium Light Editorial Material Finishes
const MATTE_WHITE = {
  color: '#f6f5f1',
  roughness: 0.36,
  metalness: 0.04,
};

const BRUSHED_ALUMINUM = {
  color: '#e4e6eb',
  roughness: 0.22,
  metalness: 0.88,
};

const LEATHER_CUSHION = {
  color: '#e8e4dc',
  roughness: 0.72,
  metalness: 0.02,
};

const GOLD_ACCENT = {
  color: '#d4b35e',
  roughness: 0.18,
  metalness: 0.92,
};

const DARK_ACCENT = {
  color: '#242220',
  roughness: 0.85,
  metalness: 0.1,
};

/**
 * Headband Part
 * Connects smoothly from left slider socket (-1.18, 0.28, 0) up over the arch
 * to right slider socket (+1.18, 0.28, 0).
 */
export const HeadbandPart = React.forwardRef<THREE.Group, { isHovered?: boolean }>(
  ({ isHovered: _isHovered }, ref) => {
    // Generate curved arch using CatmullRomCurve3 with exact endpoints
    const { archGeometry, subArchGeometry, cushionSegments } = useMemo(() => {
      // Main steel arch curve
      const points = [
        new THREE.Vector3(-1.18, 0.58, 0),
        new THREE.Vector3(-1.12, 0.92, 0),
        new THREE.Vector3(-0.78, 1.28, 0),
        new THREE.Vector3(0, 1.40, 0),
        new THREE.Vector3(0.78, 1.28, 0),
        new THREE.Vector3(1.12, 0.92, 0),
        new THREE.Vector3(1.18, 0.58, 0),
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const arch = new THREE.TubeGeometry(curve, 64, 0.038, 16, false);

      // Sub-rail band
      const subPoints = [
        new THREE.Vector3(-1.16, 0.62, 0.02),
        new THREE.Vector3(-0.76, 1.34, 0.02),
        new THREE.Vector3(0, 1.45, 0.02),
        new THREE.Vector3(0.76, 1.34, 0.02),
        new THREE.Vector3(1.16, 0.62, 0.02),
      ];
      const subCurve = new THREE.CatmullRomCurve3(subPoints);
      const subArch = new THREE.TubeGeometry(subCurve, 48, 0.018, 12, false);

      // Padded leather ribs under the arch
      const segments: Array<{ pos: THREE.Vector3; rotZ: number }> = [];
      const numRibs = 13;
      for (let i = 0; i < numRibs; i++) {
        const u = 0.16 + (i / (numRibs - 1)) * 0.68;
        const pt = curve.getPoint(u);
        const tangent = curve.getTangent(u);
        const angle = Math.atan2(tangent.y, tangent.x);
        segments.push({
          pos: new THREE.Vector3(pt.x, pt.y - 0.045, pt.z),
          rotZ: angle,
        });
      }

      return { archGeometry: arch, subArchGeometry: subArch, cushionSegments: segments };
    }, []);

    return (
      <group ref={ref} name="HeadbandPart">
        {/* Main Brushed Steel Arch */}
        <mesh geometry={archGeometry} castShadow>
          <meshStandardMaterial {...BRUSHED_ALUMINUM} />
        </mesh>

        {/* Upper Accent Tension Wire */}
        <mesh geometry={subArchGeometry}>
          <meshStandardMaterial {...BRUSHED_ALUMINUM} />
        </mesh>

        {/* Leather Under-Cushion Ribbed Segments */}
        <group>
          {cushionSegments.map((seg, idx) => (
            <mesh
              key={idx}
              position={[seg.pos.x, seg.pos.y, seg.pos.z]}
              rotation={[0, 0, seg.rotZ]}
            >
              <capsuleGeometry args={[0.065, 0.09, 10, 16]} />
              <meshStandardMaterial {...LEATHER_CUSHION} />
            </mesh>
          ))}
        </group>

        {/* LEFT EXTENSION SLIDER ARM (extends from y=0.58 down to socket at y=0.28) */}
        <group position={[-1.18, 0.43, 0]}>
          {/* Telescopic slide arm */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.075, 0.32, 0.05]} />
            <meshStandardMaterial {...BRUSHED_ALUMINUM} />
          </mesh>
          {/* Calibrated adjustment notches */}
          {[-0.08, -0.02, 0.04, 0.1].map((y, i) => (
            <mesh key={i} position={[-0.038, y, 0]}>
              <boxGeometry args={[0.006, 0.015, 0.032]} />
              <meshStandardMaterial color="#888" roughness={0.4} />
            </mesh>
          ))}
          {/* Outer metal clamp collar */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.09, 0.06, 0.065]} />
            <meshStandardMaterial {...MATTE_WHITE} />
          </mesh>
          {/* Lower Hinge Joint Cylinder (Centered exactly at y=-0.15 => world y=0.28) */}
          <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.085, 24]} />
            <meshStandardMaterial {...BRUSHED_ALUMINUM} />
          </mesh>
        </group>

        {/* RIGHT EXTENSION SLIDER ARM (extends from y=0.58 down to socket at y=0.28) */}
        <group position={[1.18, 0.43, 0]}>
          {/* Telescopic slide arm */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.075, 0.32, 0.05]} />
            <meshStandardMaterial {...BRUSHED_ALUMINUM} />
          </mesh>
          {/* Calibrated adjustment notches */}
          {[-0.08, -0.02, 0.04, 0.1].map((y, i) => (
            <mesh key={i} position={[0.038, y, 0]}>
              <boxGeometry args={[0.006, 0.015, 0.032]} />
              <meshStandardMaterial color="#888" roughness={0.4} />
            </mesh>
          ))}
          {/* Outer metal clamp collar */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.09, 0.06, 0.065]} />
            <meshStandardMaterial {...MATTE_WHITE} />
          </mesh>
          {/* Lower Hinge Joint Cylinder (Centered exactly at y=-0.15 => world y=0.28) */}
          <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.085, 24]} />
            <meshStandardMaterial {...BRUSHED_ALUMINUM} />
          </mesh>
        </group>
      </group>
    );
  }
);
HeadbandPart.displayName = 'HeadbandPart';

/**
 * Ear Cup Assembly
 * Left Cup is centered at (-1.18, 0, 0).
 * Right Cup is centered at (+1.18, 0, 0).
 * Their top yoke pivots connect directly at (±1.18, 0.28, 0).
 */
interface EarCupProps {
  side: 'left' | 'right';
  isHovered?: boolean;
}

export const EarCupPart = React.forwardRef<THREE.Group, EarCupProps>(
  ({ side, isHovered }, ref) => {
    const isLeft = side === 'left';
    const cupX = isLeft ? -1.18 : 1.18;
    const outerDir = isLeft ? -1 : 1; // direction pointing outwards
    const innerDir = isLeft ? 1 : -1; // direction pointing towards head center

    return (
      <group ref={ref} name={isLeft ? 'LeftCupGroup' : 'RightCupGroup'}>
        {/* SWIVEL GIMBAL / YOKE
            Top bracket connects at (cupX, 0.28, 0), curving down around cup to (cupX, 0, ±0.44) */}
        <group position={[cupX, 0, 0]}>
          {/* Top connection socket attaching to headband slider */}
          <mesh position={[0, 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.058, 0.058, 0.065, 20]} />
            <meshStandardMaterial {...MATTE_WHITE} />
          </mesh>
          {/* Upper Yoke Stem */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.042, 0.042, 0.12, 16]} />
            <meshStandardMaterial {...BRUSHED_ALUMINUM} />
          </mesh>
          {/* Semi-circular Yoke Arch wrapping over the cup in Z */}
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.44, 0.032, 16, 32, Math.PI]} />
            <meshStandardMaterial {...BRUSHED_ALUMINUM} />
          </mesh>
          {/* Front Pivot Pin into cup */}
          <mesh position={[0, 0, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.06, 16]} />
            <meshStandardMaterial {...BRUSHED_ALUMINUM} />
          </mesh>
          {/* Back Pivot Pin into cup */}
          <mesh position={[0, 0, -0.44]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.06, 16]} />
            <meshStandardMaterial {...BRUSHED_ALUMINUM} />
          </mesh>

          {/* MAIN EAR CUP BODY (Centered at cupX, 0, 0) */}
          <group position={[0, 0, 0]}>
            {/* Outer Chamber Housing Shell (Matte Porcelain White) */}
            <mesh
              position={[outerDir * 0.14, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[0.44, 0.46, 0.28, 48]} />
              <meshStandardMaterial
                {...MATTE_WHITE}
                color={isHovered ? '#ffffff' : '#f7f6f2'}
              />
            </mesh>

            {/* Outer Center Chamfer Cap with Aluminum Bezel */}
            <mesh
              position={[outerDir * 0.285, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.34, 0.36, 0.02, 36]} />
              <meshStandardMaterial {...BRUSHED_ALUMINUM} />
            </mesh>

            {/* Subtle concentric disk inlay */}
            <mesh
              position={[outerDir * 0.298, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.24, 0.24, 0.012, 32]} />
              <meshStandardMaterial {...MATTE_WHITE} />
            </mesh>

            {/* Tactile Rotary Dial / Center Badge */}
            <mesh
              position={[outerDir * 0.306, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.09, 0.09, 0.018, 24]} />
              <meshStandardMaterial {...BRUSHED_ALUMINUM} />
            </mesh>

            {/* Plush Memory Foam Ear Cushion (pointing inward towards user's head) */}
            <mesh
              position={[innerDir * 0.13, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <torusGeometry args={[0.32, 0.13, 24, 48]} />
              <meshStandardMaterial {...LEATHER_CUSHION} />
            </mesh>

            {/* Inner Driver Baffle Acoustic Cloth */}
            <mesh
              position={[innerDir * 0.12, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <circleGeometry args={[0.26, 32]} />
              <meshStandardMaterial {...DARK_ACCENT} />
            </mesh>

            {/* Inner fine acoustic concentric ring */}
            <mesh
              position={[innerDir * 0.122, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <ringGeometry args={[0.12, 0.22, 28]} />
              <meshStandardMaterial color="#4a4640" roughness={0.9} />
            </mesh>

            {/* Bottom 3.5mm Cable Input Jack Port on Left Cup */}
            {isLeft && (
              <group position={[0, -0.44, 0]}>
                <mesh position={[0, 0.02, 0]}>
                  <cylinderGeometry args={[0.052, 0.052, 0.06, 20]} />
                  <meshStandardMaterial {...BRUSHED_ALUMINUM} />
                </mesh>
                <mesh position={[0, -0.015, 0]}>
                  <cylinderGeometry args={[0.035, 0.035, 0.02, 20]} />
                  <meshStandardMaterial {...GOLD_ACCENT} />
                </mesh>
              </group>
            )}

            {/* Engraved L or R indicator badge */}
            <mesh
              position={[outerDir * 0.08, 0.36, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <boxGeometry args={[0.03, 0.05, 0.008]} />
              <meshStandardMaterial color="#88847c" roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>
    );
  }
);
EarCupPart.displayName = 'EarCupPart';

/**
 * Wired Audio Cable Part
 * Starts exactly at (-1.18, -0.44, 0) flush against the left ear cup's bottom port!
 */
export const WiredCablePart = React.forwardRef<THREE.Group, { isHovered?: boolean }>(
  ({ isHovered: _isHovered }, ref) => {
    const { cableGeometry, endPosition } = useMemo(() => {
      // Natural CatmullRomCurve3 draping down from (-1.18, -0.44, 0)
      const points = [
        new THREE.Vector3(-1.18, -0.44, 0),
        new THREE.Vector3(-1.16, -0.72, 0.05),
        new THREE.Vector3(-1.02, -1.15, 0.16),
        new THREE.Vector3(-0.75, -1.60, 0.25),
        new THREE.Vector3(-0.45, -2.02, 0.22),
        new THREE.Vector3(-0.15, -2.38, 0.12),
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const geom = new THREE.TubeGeometry(curve, 48, 0.026, 12, false);
      const end = points[points.length - 1];
      return { cableGeometry: geom, endPosition: end };
    }, []);

    return (
      <group ref={ref} name="CableGroup">
        {/* Flexible Braided Audio Cord */}
        <mesh geometry={cableGeometry} castShadow>
          <meshStandardMaterial
            color="#ede9e1"
            roughness={0.55}
            metalness={0.06}
          />
        </mesh>

        {/* Cable Strain Relief Sleeve right at the Left Cup Port */}
        <mesh position={[-1.18, -0.48, 0]}>
          <cylinderGeometry args={[0.038, 0.048, 0.08, 16]} />
          <meshStandardMaterial color="#2c2a27" roughness={0.7} />
        </mesh>

        {/* 3.5mm Studio Jack Plug at the bottom end of the cord */}
        <group position={[endPosition.x, endPosition.y, endPosition.z]} rotation={[0.4, 0.2, -0.45]}>
          {/* Rubber Strain Relief Boot */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 0.08, 16]} />
            <meshStandardMaterial color="#2c2a27" roughness={0.7} />
          </mesh>

          {/* Knurled Aluminum Barrel Grip */}
          <mesh position={[0, 0.20, 0]}>
            <cylinderGeometry args={[0.058, 0.058, 0.20, 24]} />
            <meshStandardMaterial {...BRUSHED_ALUMINUM} />
          </mesh>

          {/* Gold plated 3.5mm Connector Tip */}
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.14, 20]} />
            <meshStandardMaterial {...GOLD_ACCENT} />
          </mesh>

          {/* TRS Insulator Rings */}
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.033, 0.033, 0.012, 16]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.37, 0]}>
            <cylinderGeometry args={[0.033, 0.033, 0.012, 16]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
        </group>
      </group>
    );
  }
);
WiredCablePart.displayName = 'WiredCablePart';
