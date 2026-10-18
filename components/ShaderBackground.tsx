'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import type { BackgroundTheme } from '@/types';

// Bayer dithering implementation for ordered pixelation falloff
const bayerDithering = `
  float Bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
  }
  #define Bayer4(a) (Bayer2(0.5 * (a)) * 0.25 + Bayer2(a))
  #define Bayer8(a) (Bayer4(0.5 * (a)) * 0.25 + Bayer2(a))
  #define Bayer16(a) (Bayer8(0.5 * (a)) * 0.25 + Bayer2(a))
`;

// Custom shader material
class GradientShaderMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        u_time: { value: 0 },
        u_color1: { value: new THREE.Color('#667eea') },
        u_color2: { value: new THREE.Color('#764ba2') },
        u_color3: { value: new THREE.Color('#f093fb') },
        u_color4: { value: new THREE.Color('#f5576c') },
        u_grainIntensity: { value: 0.05 },
        u_speed: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;
        uniform vec3 u_color4;
        uniform float u_grainIntensity;
        uniform float u_speed;
        
        varying vec2 vUv;
        
        ${bayerDithering}
        
        void main() {
          vec2 uv = vUv;
          float time = u_time * u_speed * 0.08;
          
          // Setup Bayer Grid
          const float PIXEL_SIZE = 4.0; 
          vec2 pixelId = floor(gl_FragCoord.xy / PIXEL_SIZE);
          float dither = Bayer8(pixelId);
          
          // Apply dither distortion directly to the radius (creates rough jagged edges)
          float ditherOffset = (dither - 0.5) * 0.08;
          
          // Create 15 solid, small blobs using step()
          vec2 b1 = vec2(0.2 + sin(time * 0.5) * 0.25, 0.8 + cos(time * 0.3) * 0.15);
          float blob1 = step(distance(uv, b1), 0.08 + ditherOffset); 
          
          vec2 b2 = vec2(0.8 + cos(time * 0.4) * 0.2, 0.2 + sin(time * 0.6) * 0.2);
          float blob2 = step(distance(uv, b2), 0.09 + ditherOffset); 
          
          vec2 b3 = vec2(0.5 + sin(time * 0.35) * 0.2, 0.5 + cos(time * 0.45) * 0.2);
          float blob3 = step(distance(uv, b3), 0.06 + ditherOffset); 
          
          vec2 b4 = vec2(0.7 + cos(time * 0.7) * 0.15, 0.7 + sin(time * 0.5) * 0.2);
          float blob4 = step(distance(uv, b4), 0.07 + ditherOffset); 
          
          vec2 b5 = vec2(0.3 + sin(time * 0.6) * 0.2, 0.3 + cos(time * 0.4) * 0.15);
          float blob5 = step(distance(uv, b5), 0.05 + ditherOffset); 
          
          vec2 b6 = vec2(0.1 + cos(time * 0.3) * 0.1, 0.4 + sin(time * 0.8) * 0.2);
          float blob6 = step(distance(uv, b6), 0.08 + ditherOffset); 
          
          vec2 b7 = vec2(0.9 + sin(time * 0.9) * 0.1, 0.6 + cos(time * 0.5) * 0.2);
          float blob7 = step(distance(uv, b7), 0.07 + ditherOffset); 
          
          vec2 b8 = vec2(0.4 + cos(time * 0.5) * 0.2, 0.9 + sin(time * 0.4) * 0.1);
          float blob8 = step(distance(uv, b8), 0.06 + ditherOffset); 
          
          // New blobs
          vec2 b9 = vec2(0.15 + sin(time * 0.8) * 0.2, 0.15 + cos(time * 0.6) * 0.1);
          float blob9 = step(distance(uv, b9), 0.09 + ditherOffset); 
          
          vec2 b10 = vec2(0.85 + cos(time * 0.9) * 0.1, 0.85 + sin(time * 0.7) * 0.2);
          float blob10 = step(distance(uv, b10), 0.07 + ditherOffset); 
          
          vec2 b11 = vec2(0.6 + sin(time * 0.4) * 0.3, 0.2 + cos(time * 0.5) * 0.1);
          float blob11 = step(distance(uv, b11), 0.05 + ditherOffset); 
          
          vec2 b12 = vec2(0.4 + cos(time * 0.6) * 0.1, 0.6 + sin(time * 0.9) * 0.2);
          float blob12 = step(distance(uv, b12), 0.08 + ditherOffset); 
          
          vec2 b13 = vec2(0.2 + sin(time * 0.7) * 0.1, 0.6 + cos(time * 0.3) * 0.2);
          float blob13 = step(distance(uv, b13), 0.06 + ditherOffset); 
          
          vec2 b14 = vec2(0.7 + cos(time * 0.3) * 0.2, 0.4 + sin(time * 0.4) * 0.1);
          float blob14 = step(distance(uv, b14), 0.05 + ditherOffset); 
          
          vec2 b15 = vec2(0.5 + sin(time * 0.9) * 0.2, 0.1 + cos(time * 0.8) * 0.1);
          float blob15 = step(distance(uv, b15), 0.07 + ditherOffset);
          
          // Multiply solid shapes by pure colors and mixes
          vec3 c1 = u_color1 * blob1;
          vec3 c2 = u_color2 * blob2;
          vec3 c3 = u_color3 * blob3;
          vec3 c4 = u_color4 * blob4;
          vec3 c5 = mix(u_color1, u_color2, 0.5) * blob5;
          vec3 c6 = mix(u_color2, u_color3, 0.5) * blob6;
          vec3 c7 = mix(u_color3, u_color4, 0.5) * blob7;
          vec3 c8 = mix(u_color4, u_color1, 0.5) * blob8;
          vec3 c9 = u_color1 * blob9;
          vec3 c10 = u_color3 * blob10;
          vec3 c11 = mix(u_color2, u_color4, 0.5) * blob11;
          vec3 c12 = u_color2 * blob12;
          vec3 c13 = mix(u_color1, u_color4, 0.5) * blob13;
          vec3 c14 = u_color4 * blob14;
          vec3 c15 = mix(u_color3, u_color1, 0.5) * blob15;
          
          // Use max() to prevent overlapping blobs from turning white
          // Split into multiple lines to prevent GLSL compiler issues with deep nesting
          vec3 finalColor = max(c1, max(c2, max(c3, c4)));
          finalColor = max(finalColor, max(c5, max(c6, max(c7, c8))));
          finalColor = max(finalColor, max(c9, max(c10, max(c11, c12))));
          finalColor = max(finalColor, max(c13, max(c14, c15)));
          
          // Brighten the solid colors slightly
          finalColor *= 1.2;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }
}

// Register the material with R3F
extend({ GradientShaderMaterial });

interface AnimatedMeshProps {
  colors: string[];
  speed: number;
  grainIntensity: number;
}

function AnimatedMesh({ colors, speed, grainIntensity }: AnimatedMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<GradientShaderMaterial>(null);

  // Store target colors and current colors for smooth transition
  const currentColors = useRef({
    color1: new THREE.Color(colors[0]),
    color2: new THREE.Color(colors[1]),
    color3: new THREE.Color(colors[2]),
    color4: new THREE.Color(colors[3]),
  });

  const targetColors = useRef({
    color1: new THREE.Color(colors[0]),
    color2: new THREE.Color(colors[1]),
    color3: new THREE.Color(colors[2]),
    color4: new THREE.Color(colors[3]),
  });

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;

      // Smoothly interpolate colors (lerp)
      const lerpSpeed = delta * 0.5; // Slow transition (adjust 0.5 for speed)

      currentColors.current.color1.lerp(targetColors.current.color1, lerpSpeed);
      currentColors.current.color2.lerp(targetColors.current.color2, lerpSpeed);
      currentColors.current.color3.lerp(targetColors.current.color3, lerpSpeed);
      currentColors.current.color4.lerp(targetColors.current.color4, lerpSpeed);

      materialRef.current.uniforms.u_color1.value.copy(currentColors.current.color1);
      materialRef.current.uniforms.u_color2.value.copy(currentColors.current.color2);
      materialRef.current.uniforms.u_color3.value.copy(currentColors.current.color3);
      materialRef.current.uniforms.u_color4.value.copy(currentColors.current.color4);
    }
  });

  useEffect(() => {
    // Update target colors when page changes
    targetColors.current.color1.set(colors[0] || '#667eea');
    targetColors.current.color2.set(colors[1] || '#764ba2');
    targetColors.current.color3.set(colors[2] || '#f093fb');
    targetColors.current.color4.set(colors[3] || '#f5576c');

    if (materialRef.current) {
      materialRef.current.uniforms.u_speed.value = speed;
      materialRef.current.uniforms.u_grainIntensity.value = grainIntensity;
    }
  }, [colors, speed, grainIntensity]);

  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[10, 10]} />
      <gradientShaderMaterial ref={materialRef} />
    </mesh>
  );
}

export type { BackgroundTheme };

export default function ShaderBackground({ theme }: { theme: BackgroundTheme | null }) {
  const pathname = usePathname();

  // Determine current page
  const currentPage = pathname === '/' ? 'home'
    : pathname.startsWith('/projects') ? 'projects'
      : pathname.startsWith('/skills') ? 'skills'
        : pathname.startsWith('/dsa') ? 'dsa'
          : pathname.startsWith('/resumes') ? 'resumes'
            : pathname.startsWith('/blog') ? 'blog'
              : 'all';

  // Don't render if no theme or theme is default/static
  if (!theme) {
    return null;
  }

  if (theme.slug === 'default' || theme.slug === 'background-theme' || theme.animationType === 'static') {
    return null;
  }

  // Find color palette for current page
  const palette = theme.colorPalettes?.find(p => p.page === currentPage)
    || theme.colorPalettes?.find(p => p.page === 'all');

  if (!palette || !palette.colors || palette.colors.length < 4) {
    console.warn('No valid color palette found for page:', currentPage);
    return null;
  }


  return (
    <div
      className="fixed inset-0"
      style={{
        zIndex: 0,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
        opacity: 0.95
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000 }}
        style={{ width: '100%', height: '100%', display: 'block' }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        <AnimatedMesh
          colors={palette.colors}
          speed={theme.animationSpeed || 1.0}
          grainIntensity={theme.grainIntensity || 0.05}
        />
      </Canvas>
    </div>
  );
}
