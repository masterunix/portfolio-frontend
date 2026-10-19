/**
 * ShaderBackground.tsx — The animated background: dithered colour blobs drifting
 * behind every page, in the active theme's colours for the current page
 * (content/background.md). Colours ease over when you change page.
 *
 * One fragment shader on a full-screen triangle, in plain WebGL: no 3D library to
 * download before the page can start.
 */
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import type { Background, ThemePage } from '@/types';

/**
 * The blobs. Each drifts around (x, y) by `ax`/`ay`, at speeds `fx`/`fy`, along sin
 * or cos (`trig`: x then y); `r` is its radius, and `color` the palette colours it
 * mixes half-and-half (one index for a pure colour). Positions are in the shader's
 * uv space, where the window shows roughly 0.2–0.8 across and 0.3–0.7 down.
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

/**
 * Maps the screen to uv the way the original three.js scene did: a 20 × 20 plane
 * seen by a 75° camera 5 units away, so the window shows its middle part. Half the
 * view's height is 5 · tan(37.5°) units; ÷ 20 gives it in uv.
 */
const VERTEX = /* glsl */ `
  attribute vec2 a_position;
  uniform float u_aspect;
  varying vec2 vUv;
  void main() {
    vUv = 0.5 + a_position * vec2(u_aspect, 1.0) * ${(5 * Math.tan((37.5 * Math.PI) / 180)) / 20};
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
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
    // Off the plane's edge (very wide windows) was black
    if (abs(vUv.x - 0.5) > 0.5 || abs(vUv.y - 0.5) > 0.5) color = vec3(0.0);
    gl_FragColor = vec4(color * 1.2, 1.0);
  }
`;

/** Any CSS colour → linear-light RGB (0–1), which the original three.js version passed to its shader */
function toLinear(color: string): number[] {
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
}

function compile(gl: WebGLRenderingContext): WebGLProgram {
  const program = gl.createProgram()!;
  for (const [type, source] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader');
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  return program;
}

export default function ShaderBackground({ background }: { background: Background | null }) {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // "/" is home; "/blog/a-post" uses the blog's colours
  const page = pathname.split('/')[1] || 'home';
  const colors = background && (background.palettes[page as ThemePage] ?? background.palettes.all).join(' ');
  const speed = background?.speed ?? 1;

  // The render loop reads these, so changing page eases colours without restarting
  const target = useRef<number[][]>([]);
  const speedRef = useRef(speed);
  useEffect(() => {
    if (colors) target.current = colors.split(' ').map(toLinear);
    speedRef.current = speed;
  }, [colors, speed]);

  const visible = Boolean(colors);
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!canvas || !gl) return;

    const program = compile(gl);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    // One triangle that covers the whole screen
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const [uTime, uSpeed, uAspect, uColors] = [u('u_time'), u('u_speed'), u('u_aspect'), u('u_colors')];

    const current = target.current.map((c) => [...c]);
    const start = performance.now();
    let last = start;
    let frame = 0;

    const draw = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      // Ease toward the page's colours, a little each frame
      const ease = Math.min(1, ((now - last) / 1000) * 0.5);
      last = now;
      target.current.forEach((to, i) => {
        current[i] ??= [...to];
        current[i] = current[i].map((v, k) => v + (to[k] - v) * ease);
      });

      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform1f(uSpeed, speedRef.current);
      gl.uniform1f(uAspect, width / height);
      gl.uniform3fv(uColors, current.flat());
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  if (!visible) return null;
  return <canvas ref={canvasRef} className="background" style={{ opacity: background!.brightness }} aria-hidden="true" />;
}
