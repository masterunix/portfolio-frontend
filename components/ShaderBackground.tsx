/**
 * ShaderBackground.tsx — The animated background: dithered colour blobs drifting
 * behind every page, in the active theme's colours for the current page
 * (content/background-themes.yaml). Colours ease over when you change page.
 */
'use client';

import { useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { BackgroundTheme } from '@/types';

/**
 * The blobs. Each drifts around (x, y) by `ax`/`ay`, at speeds `fx`/`fy`, along sin
 * or cos (`trig`: x then y); `r` is its radius, and `color` the palette colours it
 * mixes half-and-half (one index for a pure colour).
 */
const BLOBS = [
  { x: 0.2, ax: 0.25, fx: 0.5, y: 0.8, ay: 0.15, fy: 0.3, trig: 'sc', r: 0.08, color: [0] },
  { x: 0.8, ax: 0.2, fx: 0.4, y: 0.2, ay: 0.2, fy: 0.6, trig: 'cs', r: 0.09, color: [1] },
  { x: 0.5, ax: 0.2, fx: 0.35, y: 0.5, ay: 0.2, fy: 0.45, trig: 'sc', r: 0.06, color: [2] },
  { x: 0.7, ax: 0.15, fx: 0.7, y: 0.7, ay: 0.2, fy: 0.5, trig: 'cs', r: 0.07, color: [3] },
  { x: 0.3, ax: 0.2, fx: 0.6, y: 0.3, ay: 0.15, fy: 0.4, trig: 'sc', r: 0.05, color: [0, 1] },
  { x: 0.1, ax: 0.1, fx: 0.3, y: 0.4, ay: 0.2, fy: 0.8, trig: 'cs', r: 0.08, color: [1, 2] },
  { x: 0.9, ax: 0.1, fx: 0.9, y: 0.6, ay: 0.2, fy: 0.5, trig: 'sc', r: 0.07, color: [2, 3] },
  { x: 0.4, ax: 0.2, fx: 0.5, y: 0.9, ay: 0.1, fy: 0.4, trig: 'cs', r: 0.06, color: [3, 0] },
  { x: 0.15, ax: 0.2, fx: 0.8, y: 0.15, ay: 0.1, fy: 0.6, trig: 'sc', r: 0.09, color: [0] },
  { x: 0.85, ax: 0.1, fx: 0.9, y: 0.85, ay: 0.2, fy: 0.7, trig: 'cs', r: 0.07, color: [2] },
  { x: 0.6, ax: 0.3, fx: 0.4, y: 0.2, ay: 0.1, fy: 0.5, trig: 'sc', r: 0.05, color: [1, 3] },
  { x: 0.4, ax: 0.1, fx: 0.6, y: 0.6, ay: 0.2, fy: 0.9, trig: 'cs', r: 0.08, color: [1] },
  { x: 0.2, ax: 0.1, fx: 0.7, y: 0.6, ay: 0.2, fy: 0.3, trig: 'sc', r: 0.06, color: [0, 3] },
  { x: 0.7, ax: 0.2, fx: 0.3, y: 0.4, ay: 0.1, fy: 0.4, trig: 'cs', r: 0.05, color: [3] },
  { x: 0.5, ax: 0.2, fx: 0.9, y: 0.1, ay: 0.1, fy: 0.8, trig: 'sc', r: 0.07, color: [2, 0] },
] as const;

const fn = (t: string) => (t === 's' ? 'sin' : 'cos');
const colorOf = (c: readonly number[]) =>
  c.length === 1 ? `u_colors[${c[0]}]` : `mix(u_colors[${c[0]}], u_colors[${c[1]}], 0.5)`;

const FRAGMENT = /* glsl */ `
  uniform float u_time;
  uniform float u_speed;
  uniform vec3 u_colors[4];
  varying vec2 vUv;

  // Ordered (Bayer) dithering, for the pixelated edges
  float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
  #define bayer4(a) (bayer2(0.5 * (a)) * 0.25 + bayer2(a))
  #define bayer8(a) (bayer4(0.5 * (a)) * 0.25 + bayer2(a))

  void main() {
    float t = u_time * u_speed * 0.08;
    float dither = (bayer8(floor(gl_FragCoord.xy / 4.0)) - 0.5) * 0.08;
    vec3 color = vec3(0.0);
    ${BLOBS.map((b) => `
    color = max(color, ${colorOf(b.color)} * step(distance(vUv, vec2(
      ${b.x} + ${fn(b.trig[0])}(t * ${b.fx}) * ${b.ax},
      ${b.y} + ${fn(b.trig[1])}(t * ${b.fy}) * ${b.ay})), ${b.r} + dither));`).join('')}
    gl_FragColor = vec4(color * 1.2, 1.0);
  }
`;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function Blobs({ colors, speed }: { colors: string[]; speed: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const target = useMemo(() => colors.map((c) => new THREE.Color(c)), [colors]);
  // The starting values; after that the material's uniforms are updated in place
  const [uniforms] = useState(() => ({
    u_time: { value: 0 },
    u_speed: { value: speed },
    u_colors: { value: colors.map((c) => new THREE.Color(c)) },
  }));

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.u_time.value = state.clock.elapsedTime;
    u.u_speed.value = speed;
    // Ease toward the page's colours
    (u.u_colors.value as THREE.Color[]).forEach((c, i) => c.lerp(target[i], delta * 0.5));
  });

  return (
    <mesh scale={[2, 2, 1]}>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT} />
    </mesh>
  );
}

export default function ShaderBackground({ theme }: { theme: BackgroundTheme | null }) {
  const pathname = usePathname();
  if (!theme) return null;

  // "/" is home; "/blog/a-post" uses the blog's colours
  const page = pathname.split('/')[1] || 'home';
  const palette = theme.colorPalettes.find((p) => p.page === page) ?? theme.colorPalettes.find((p) => p.page === 'all');
  if (!palette) return null;

  return (
    <div className="background" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}>
        <Blobs colors={palette.colors} speed={theme.animationSpeed} />
      </Canvas>
    </div>
  );
}
