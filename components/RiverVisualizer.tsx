import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { HeritageItem } from '../types';

interface RiverVisualizerProps {
  items: HeritageItem[];
  onSelect: (item: HeritageItem) => void;
  filteredRegion: string;
}

const RiverVisualizer: React.FC<RiverVisualizerProps> = ({ items, onSelect, filteredRegion }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  // Picking Refs
  const pickingSceneRef = useRef<THREE.Scene | null>(null);
  const pickingTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const activeItemsRef = useRef<HeritageItem[]>([]);
  const featuredItemsRef = useRef<HeritageItem[]>([]);
  
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

  // Keep a separate ref for only "Real" items to use in the fallback random selection
  // This prevents clicking the void from opening "Unrecorded Heritage"
  const featuredItems = useMemo(() => items.filter(i => !i.isProcedural), [items]);

  useEffect(() => {
    activeItemsRef.current = activeItems;
    featuredItemsRef.current = featuredItems;
  }, [activeItems, featuredItems]);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP ---
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Main Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.002);
    sceneRef.current = scene;

    // Picking Scene
    const pickingScene = new THREE.Scene();
    pickingScene.background = new THREE.Color(0); // 0 = background (no hit)
    pickingSceneRef.current = pickingScene;

    // Picking Target (1x1 pixel)
    const pickingTarget = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });
    pickingTargetRef.current = pickingTarget;

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

    // --- GEOMETRY & ATTRIBUTES ---
    const count = activeItems.length;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const pickingColors = new Float32Array(count * 3);

    // Color Palette: Gold to Amber (Restored High Quality Palette)
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

      // Real items are larger
      const isImportant = !activeItems[i].isProcedural;
      sizes[i] = isImportant ? 40 + Math.random() * 20 : 15 + Math.random() * 15;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      phases[i] = Math.random() * Math.PI * 2;

      // Unique Picking Color (ID encoded in RGB)
      // ID = i + 1 (0 is reserved for background)
      const id = i + 1;
      pickingColors[i * 3] = ((id >> 16) & 255) / 255;
      pickingColors[i * 3 + 1] = ((id >> 8) & 255) / 255;
      pickingColors[i * 3 + 2] = (id & 255) / 255;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('pickingColor', new THREE.BufferAttribute(pickingColors, 3));

    // --- SHADER LOGIC (SHARED) ---
    // This defines the "Liquid Gold" look. 
    // We use Simplex Noise to displace particles over time.
    const shaderLogic = `
        uniform float time;
        uniform float pixelRatio;
        attribute float size;
        attribute float phase;
        
        // Simplex Noise (GLSL) - Restored for fluid effect
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
    `;

    // Shared Vertex Position Logic
    const mainVertexLogic = `
          float flowSpeed = 20.0;
          float newX = mod(position.x + time * flowSpeed + 4000.0, 8000.0) - 4000.0;
          
          // Noise calculation for organic flow
          float noiseFreq = 0.0015;
          float noiseAmp = 80.0;
          float yOffset = snoise(vec3(newX * noiseFreq, position.z * noiseFreq, time * 0.2)) * noiseAmp;
          float zOffset = snoise(vec3(newX * noiseFreq + 100.0, position.y * noiseFreq, time * 0.15)) * noiseAmp;

          vec3 pos = vec3(newX, position.y + yOffset, position.z + zOffset);
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          gl_PointSize = size * pixelRatio * (600.0 / -mvPosition.z);
    `;

    // 1. VISUAL MATERIAL (The Golden Look)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: renderer.getPixelRatio() }
      },
      vertexShader: `
        ${shaderLogic}
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = color;
          ${mainVertexLogic}
          
          // Fade out edges for infinity illusion
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
          if (r > 0.5) discard; // Round particles for visual
          
          float glow = 1.0 - (r * 2.0);
          glow = pow(glow, 1.5);
          
          gl_FragColor = vec4(vColor * 1.5, vAlpha * glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    // 2. PICKING MATERIAL (The Interaction Logic)
    const pickingMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            pixelRatio: { value: renderer.getPixelRatio() }
        },
        vertexShader: `
            ${shaderLogic}
            attribute vec3 pickingColor;
            varying vec3 vPickingColor;
            
            void main() {
                vPickingColor = pickingColor;
                ${mainVertexLogic}
            }
        `,
        fragmentShader: `
            varying vec3 vPickingColor;
            void main() {
                // IMPORTANT: NO DISCARD here (or very minimal)
                // We draw a full square for hit testing to make clicking easier
                gl_FragColor = vec4(vPickingColor, 1.0);
            }
        `,
        transparent: false,
        blending: THREE.NoBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const pickingParticles = new THREE.Points(geometry, pickingMaterial);
    pickingScene.add(pickingParticles);

    // --- EVENTS ---
    const handleClick = (event: MouseEvent) => {
        if (!containerRef.current || !rendererRef.current || !pickingTargetRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // 1. Virtual Camera Windowing (1x1 pixel)
        camera.setViewOffset(rect.width, rect.height, mouseX, mouseY, 1, 1);
        
        // 2. Render Picking Scene
        rendererRef.current.setRenderTarget(pickingTargetRef.current);
        rendererRef.current.render(pickingScene, camera);
        
        // 3. Read Pixel
        const pixelBuffer = new Uint8Array(4); // RGBA
        rendererRef.current.readRenderTargetPixels(pickingTargetRef.current, 0, 0, 1, 1, pixelBuffer);
        
        // 4. Cleanup
        rendererRef.current.setRenderTarget(null);
        camera.clearViewOffset();

        // 5. Decode ID
        const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];

        if (id > 0) {
            // HIT SPECIFIC ITEM
            const index = id - 1;
            if (activeItemsRef.current[index]) {
                onSelect(activeItemsRef.current[index]);
                return;
            }
        } 
        
        // MISS / VOID CLICK -> Fallback to random REAL item
        if (featuredItemsRef.current.length > 0) {
            const randomIndex = Math.floor(Math.random() * featuredItemsRef.current.length);
            onSelect(featuredItemsRef.current[randomIndex]);
        }
    };

    const handleMouseMove = () => {
        document.body.style.cursor = 'pointer'; 
    };

    const handleResize = () => {
       const w = window.innerWidth;
       const h = window.innerHeight;
       camera.aspect = w / h;
       camera.updateProjectionMatrix();
       renderer.setSize(w, h);
       material.uniforms.pixelRatio.value = renderer.getPixelRatio();
       pickingMaterial.uniforms.pixelRatio.value = renderer.getPixelRatio();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    // --- LOOP ---
    const animate = () => {
      const time = clockRef.current.getElapsedTime();
      
      material.uniforms.time.value = time;
      pickingMaterial.uniforms.time.value = time;
      
      // Gentle camera drift
      camera.position.x = Math.sin(time * 0.1) * 50;
      camera.position.y = Math.cos(time * 0.15) * 30;
      camera.lookAt(0,0,0);

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      
      if (rendererRef.current && containerRef.current) {
         if (rendererRef.current.domElement.parentNode === containerRef.current) {
             containerRef.current.removeChild(rendererRef.current.domElement);
         }
         rendererRef.current.dispose();
      }
      
      pickingTarget.dispose();
      geometry.dispose();
      material.dispose();
      pickingMaterial.dispose();
    };
  }, [activeItems, featuredItems, onSelect]);

  return <div ref={containerRef} className="absolute inset-0 z-0 bg-black cursor-pointer" />;
};

export default RiverVisualizer;
