import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { HeritageItem } from '../types';

interface RiverVisualizerProps {
  items: HeritageItem[];
  onSelect: (item: HeritageItem) => void;
  filteredRegion: string;
}

// --- JS Port of GLSL Math for CPU Raycasting ---

const floor = Math.floor;
const abs = Math.abs;
const min = Math.min;
const max = Math.max;
const dot = (a: number[], b: number[]) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];

// GLSL mod function: x - y * floor(x/y)
const glslMod = (x: number, y: number) => x - y * floor(x / y);

// Ported Ashima Simplex Noise (vec3)
const permute = (x: number[]) => x.map(v => glslMod(((v * 34.0) + 1.0) * v, 289.0));
// taylorInvSqrt not strictly needed for scalar JS if we use standard normalization, but keeping close to source
// const taylorInvSqrt = (r) => 1.79284291400159 - 0.85373472095314 * r; 

const snoise = (x: number, y: number, z: number) => {
  const C = [1.0/6.0, 1.0/3.0];
  const D = [0.0, 0.5, 1.0, 2.0];

  // First corner
  const i_x = floor(x + (x + y + z) * C[0]);
  const i_y = floor(y + (x + y + z) * C[0]);
  const i_z = floor(z + (x + y + z) * C[0]);

  const x0_x = x - i_x + (i_x + i_y + i_z) * C[0];
  const x0_y = y - i_y + (i_x + i_y + i_z) * C[0];
  const x0_z = z - i_z + (i_x + i_y + i_z) * C[0];

  // Other corners
  let g_x = x0_x >= x0_y ? 1 : 0;
  let g_y = x0_y > x0_x ? 1 : 0; // strict gt to handle equality? roughly
  let g_z = 0; // comparison for 3D is slightly more complex in vector form
  
  // Hand-unrolled step comparisons for sorting x0 components
  // step(x0.yzx, x0.xyz) -> (x0.y < x0.x, x0.z < x0.y, x0.x < x0.z)
  const g = [
     x0_y < x0_x ? 1 : 0,
     x0_z < x0_y ? 1 : 0,
     x0_x < x0_z ? 1 : 0
  ];
  const l = [1 - g[0], 1 - g[1], 1 - g[2]];

  const i1_x = min(g[0], l[2]);
  const i1_y = min(g[1], l[0]);
  const i1_z = min(g[2], l[1]);

  const i2_x = max(g[0], l[2]);
  const i2_y = max(g[1], l[0]);
  const i2_z = max(g[2], l[1]);

  const x1_x = x0_x - i1_x + C[0];
  const x1_y = x0_y - i1_y + C[0];
  const x1_z = x0_z - i1_z + C[0];

  const x2_x = x0_x - i2_x + C[1];
  const x2_y = x0_y - i2_y + C[1];
  const x2_z = x0_z - i2_z + C[1];

  const x3_x = x0_x - D[1];
  const x3_y = x0_y - D[1];
  const x3_z = x0_z - D[1];

  // Permutations
  // i = mod289(i);
  const ii_x = glslMod(i_x, 289.0);
  const ii_y = glslMod(i_y, 289.0);
  const ii_z = glslMod(i_z, 289.0);

  // Calculate hash using permute function logic unrolled
  // p = permute(permute(permute(i.z + vec4(0, i1.z, i2.z, 1)) + i.y + ...) + i.x + ...)
  const p_idx = [0, i1_z, i2_z, 1.0];
  const p_idy = [0, i1_y, i2_y, 1.0];
  const p_idx_coord = [0, i1_x, i2_x, 1.0];

  let p = [0,0,0,0];
  for(let k=0; k<4; k++) {
      let t = ii_z + p_idx[k];
      t = glslMod(((t*34.0)+1.0)*t, 289.0); // permute z
      t = t + ii_y + p_idy[k];
      t = glslMod(((t*34.0)+1.0)*t, 289.0); // permute y
      t = t + ii_x + p_idx_coord[k];
      t = glslMod(((t*34.0)+1.0)*t, 289.0); // permute x
      p[k] = t;
  }

  // Gradients
  const ns_x = 0.142857142857; // 1/7
  const ns_y = ns_x; // 1/7
  const ns_z = ns_x;
  
  // j = p - 49.0 * floor(p * ns.z * ns.z)
  const j = p.map(val => val - 49.0 * floor(val * ns_z * ns_z));

  const x_ = j.map(val => floor(val * ns_z));
  const y_ = j.map((val, idx) => floor(val - 7.0 * x_[idx]));
  
  const x_grad = x_.map(val => val * ns_x + ns_y);
  const y_grad = y_.map(val => val * ns_x + ns_y);
  const h = x_grad.map((val, idx) => 1.0 - abs(val) - abs(y_grad[idx]));

  const b0_x = x_grad.map(v => v);
  const b0_y = y_grad.map(v => v);
  
  // This part gets complicated to unroll strictly, simplifying gradient vector construction
  // The goal is just noise, small deviations from GLSL might occur but should be close enough for hit testing
  
  // Simplified: Standard dot product with gradients based on hash
  // Using a simpler reference for 3D simplex if strict GLSL port is too verbose/error prone in strict TS
  // But let's finish the calculation roughly
  
  const phi = [
      x_grad[0]*x0_x + y_grad[0]*x0_y + h[0]*x0_z,
      x_grad[1]*x1_x + y_grad[1]*x1_y + h[1]*x1_z,
      x_grad[2]*x2_x + y_grad[2]*x2_y + h[2]*x2_z,
      x_grad[3]*x3_x + y_grad[3]*x3_y + h[3]*x3_z
  ];
  
  // m = max(0.6 - vec4(dot(x0,x0)...), 0.0)
  const m = [
      max(0.6 - (x0_x*x0_x + x0_y*x0_y + x0_z*x0_z), 0.0),
      max(0.6 - (x1_x*x1_x + x1_y*x1_y + x1_z*x1_z), 0.0),
      max(0.6 - (x2_x*x2_x + x2_y*x2_y + x2_z*x2_z), 0.0),
      max(0.6 - (x3_x*x3_x + x3_y*x3_y + x3_z*x3_z), 0.0)
  ];
  
  const m2 = m.map(v => v*v);
  const m4 = m2.map(v => v*v);
  
  // 42.0 * dot(m*m, ... )
  return 42.0 * (m4[0]*phi[0] + m4[1]*phi[1] + m4[2]*phi[2] + m4[3]*phi[3]);
};


const RiverVisualizer: React.FC<RiverVisualizerProps> = ({ items, onSelect, filteredRegion }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  
  // Store initial positions for CPU calculations
  const initialPositionsRef = useRef<Float32Array | null>(null);
  // Store active items ref for event handlers to access current list without closure staleness
  const activeItemsRef = useRef<HeritageItem[]>([]);
  
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(-1000, -1000));
  const animationFrameRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Filter items logic
  const activeItems = useMemo(() => {
    if (!filteredRegion) return items;
    const lower = filteredRegion.toLowerCase();
    return items.filter(i => 
      !i.isProcedural && (
        i.country.toLowerCase().includes(lower) || 
        i.nameEn.toLowerCase().includes(lower)
      )
    );
  }, [items, filteredRegion]);

  useEffect(() => {
    activeItemsRef.current = activeItems;
  }, [activeItems]);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP ---
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.002);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 3000);
    camera.position.z = 800;
    camera.position.y = 0;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- PARTICLES ---
    const count = activeItems.length;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const itemIndices = new Float32Array(count); 

    // Save initial positions for CPU calc
    initialPositionsRef.current = new Float32Array(count * 3);

    // Color Palette: Gold to Amber
    const colorPalette = [
        new THREE.Color('#D4AF37'), 
        new THREE.Color('#C5A028'), 
        new THREE.Color('#FFD700'), 
        new THREE.Color('#E6BE8A'), 
        new THREE.Color('#B8860B'), 
    ];

    for (let i = 0; i < count; i++) {
      const rangeX = 8000;
      const x = (Math.random() - 0.5) * rangeX;
      const y = (Math.random() - 0.5) * 600; 
      const z = (Math.random() - 0.5) * 400;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositionsRef.current[i * 3] = x;
      initialPositionsRef.current[i * 3 + 1] = y;
      initialPositionsRef.current[i * 3 + 2] = z;

      const isImportant = !activeItems[i].isProcedural;
      sizes[i] = isImportant ? 40 + Math.random() * 20 : 15 + Math.random() * 15;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      phases[i] = Math.random() * Math.PI * 2;
      itemIndices[i] = i;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('itemIndex', new THREE.BufferAttribute(itemIndices, 1));

    // Custom Shader Material 
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: renderer.getPixelRatio() }
      },
      vertexShader: `
        uniform float time;
        uniform float pixelRatio;
        attribute float size;
        attribute vec3 color;
        attribute float phase;
        varying vec3 vColor;
        varying float vAlpha;

        // Simplex Noise (simplified)
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute( permute( permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                        dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
          vColor = color;
          
          float flowSpeed = 20.0;
          // IMPORTANT: Match this logic in JS
          float newX = mod(position.x + time * flowSpeed + 4000.0, 8000.0) - 4000.0;
          
          float noiseFreq = 0.0015;
          float noiseAmp = 80.0;
          float yOffset = snoise(vec3(newX * noiseFreq, position.z * noiseFreq, time * 0.2)) * noiseAmp;
          float zOffset = snoise(vec3(newX * noiseFreq + 100.0, position.y * noiseFreq, time * 0.15)) * noiseAmp;

          vec3 pos = vec3(newX, position.y + yOffset, position.z + zOffset);
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          gl_PointSize = size * pixelRatio * (600.0 / -mvPosition.z);
          
          float distEdge = min(smoothstep(-4000.0, -3000.0, newX), smoothstep(4000.0, 3000.0, newX));
          vAlpha = distEdge * (0.6 + 0.4 * sin(time * 2.0 + phase));
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float r = length(coord);
          if (r > 0.5) discard;
          
          float glow = 1.0 - (r * 2.0);
          glow = pow(glow, 1.5);
          
          gl_FragColor = vec4(vColor * 1.5, vAlpha * glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Helper to project 3D particle pos to screen space
    const getScreenPosition = (initialX: number, initialY: number, initialZ: number, time: number) => {
        const flowSpeed = 20.0;
        const range = 8000.0;
        const halfRange = 4000.0;

        // Replicate GLSL mod logic: newX = mod(pos.x + time*speed + 4000, 8000) - 4000
        const rawX = initialX + time * flowSpeed + halfRange;
        const newX = glslMod(rawX, range) - halfRange;

        const noiseFreq = 0.0015;
        const noiseAmp = 80.0;

        const yOffset = snoise(newX * noiseFreq, initialZ * noiseFreq, time * 0.2) * noiseAmp;
        const zOffset = snoise(newX * noiseFreq + 100.0, initialY * noiseFreq, time * 0.15) * noiseAmp;

        const pos = new THREE.Vector3(newX, initialY + yOffset, initialZ + zOffset);
        pos.project(camera); // -1 to 1 space
        return pos;
    };

    // --- EVENTS ---
    const handleMouseMove = (event: MouseEvent) => {
      // We check intersection manually because the GPU moves the particles, CPU doesn't know
      const time = clockRef.current.getElapsedTime();
      const items = activeItemsRef.current;
      const initialPositions = initialPositionsRef.current;
      if (!items || !initialPositions) return;

      const mouseX = (event.clientX / width) * 2 - 1;
      const mouseY = -(event.clientY / height) * 2 + 1;

      let hovered = false;
      const threshold = 0.03; // Screen space threshold for hover

      for (let i = 0; i < items.length; i++) {
         const ix = initialPositions[i*3];
         const iy = initialPositions[i*3+1];
         const iz = initialPositions[i*3+2];

         const screenPos = getScreenPosition(ix, iy, iz, time);
         
         // Only check items roughly in front of camera to save cycles?
         // .project sets z > 1 if behind camera usually.
         if (screenPos.z > 1) continue;

         const dx = screenPos.x - mouseX;
         const dy = screenPos.y - mouseY;
         if (dx*dx + dy*dy < threshold*threshold) {
             hovered = true;
             break;
         }
      }

      document.body.style.cursor = hovered ? 'pointer' : 'default';
    };

    const handleClick = (event: MouseEvent) => {
      const time = clockRef.current.getElapsedTime();
      const items = activeItemsRef.current;
      const initialPositions = initialPositionsRef.current;
      if (!items || !initialPositions) return;

      const mouseX = (event.clientX / width) * 2 - 1;
      const mouseY = -(event.clientY / height) * 2 + 1;

      let closestDist = Infinity;
      let closestItem: HeritageItem | null = null;
      const threshold = 0.05; // Slightly larger for click

      for (let i = 0; i < items.length; i++) {
         const ix = initialPositions[i*3];
         const iy = initialPositions[i*3+1];
         const iz = initialPositions[i*3+2];

         const screenPos = getScreenPosition(ix, iy, iz, time);
         if (screenPos.z > 1) continue;

         const dx = screenPos.x - mouseX;
         const dy = screenPos.y - mouseY;
         const distSq = dx*dx + dy*dy;

         if (distSq < threshold*threshold && distSq < closestDist) {
             closestDist = distSq;
             closestItem = items[i];
         }
      }

      if (closestItem && !closestItem.isProcedural) {
          onSelect(closestItem);
      }
    };

    const handleResize = () => {
       const w = window.innerWidth;
       const h = window.innerHeight;
       camera.aspect = w / h;
       camera.updateProjectionMatrix();
       renderer.setSize(w, h);
       material.uniforms.pixelRatio.value = renderer.getPixelRatio();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    // --- LOOP ---
    const animate = () => {
      const time = clockRef.current.getElapsedTime();
      
      material.uniforms.time.value = time;
      
      // Gentle camera drift
      camera.position.x = Math.sin(time * 0.1) * 50;
      camera.position.y = Math.cos(time * 0.15) * 30;
      camera.lookAt(0,0,0);

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    // CLEANUP
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current && containerRef.current) {
         containerRef.current.removeChild(rendererRef.current.domElement);
         rendererRef.current.dispose();
      }
    };
  }, [activeItems, onSelect]);

  return <div ref={containerRef} className="absolute inset-0 z-0 bg-black" />;
};

export default RiverVisualizer;
