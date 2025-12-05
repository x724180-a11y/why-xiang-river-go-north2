// components/RiverVisualizer.tsx —— Vite 专用·最终完美版
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
  const pickingSceneRef = useRef<THREE.Scene | null>(null);
  const pickingTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const activeItemsRef = useRef<HeritageItem[]>([]);
  const featuredItemsRef = useRef<HeritageItem[]>([]);
  const frameRef = useRef<number>(0);
  const clock = new THREE.Clock();

  // 过滤后用于显示的所有粒子
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

  // 只存真实遗产，用于点空白随机
  const featuredItems = useMemo(() => items.filter(i => !i.isProcedural), [items]);

  useEffect(() => {
    activeItemsRef.current = activeItems;
    featuredItemsRef.current = featuredItems;
  }, [activeItems, featuredItems]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    scene.fog = new THREE.FogExp2(0x000814, 0.0018);

    const pickingScene = new THREE.Scene();
    pickingScene.background = new THREE.Color(0);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const pickingTarget = new THREE.WebGLRenderTarget(1, 1);
    pickingTarget.texture.minFilter = THREE.LinearFilter;
    pickingTarget.texture.generateMipmaps = false;

    // 几何体
    const geometry = new THREE.BufferGeometry();
    const count = activeItems.length;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const pickingColors = new Float32Array(count * 3);

    const palette = ['#D4AF37', '#FFD700', '#FFA500', '#FF8C00', '#B8860B'].map(c => new THREE.Color(c));

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 600;

      sizes[i] = !activeItems[i].isProcedural ? 50 + Math.random() * 30 : 10 + Math.random() * 15;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;

      phases[i] = Math.random() * Math.PI * 2;

      const id = i + 1;
      pickingColors[i * 3]     = ((id >> 16) & 255) / 255;
      pickingColors[i * 3 + 1] = ((id >> 8)  & 255) / 255;
      pickingColors[i * 3 + 2] = (id & 255) / 255;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('pickingColor', new THREE.BufferAttribute(pickingColors, 3));

    // 共享顶点逻辑
    const vertexLogic = `
      uniform float time;
      uniform float pixelRatio;
      attribute float size;
      attribute float phase;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float flow = mod(position.x + time * 30.0 + 4000.0, 8000.0) - 4000.0;
        vec3 pos = vec3(flow, position.y + sin(time + phase) * 30.0, position.z);
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
        vColor = color;
        vAlpha = smoothstep(-4000.0, -2000.0, flow) * smoothstep(4000.0, 2000.0, flow);
      }
    `;

    // 可视化材质
    const material = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, pixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: vertexLogic + `
        void main() {
          ${vertexLogic}
          vAlpha *= 0.7 + 0.3 * sin(time * 3.0 + phase);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float dist = length(c);
          if (dist > 0.5) discard;
          float glow = pow(1.0 - dist * 2.0, 2.0);
          gl_FragColor = vec4(vColor * 1.8, vAlpha * glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    // PICKING 材质（关键：去掉 discard → 方形拾取区）
    const pickingMaterial = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, pixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: vertexLogic.replace('varying vec3 vColor;', 'varying vec3 vPickingColor;')
        .replace('vColor = color;', 'vPickingColor = pickingColor;'),
      fragmentShader: `
        varying vec3 vPickingColor;
        void main() {
          gl_FragColor = vec4(vPickingColor, 1.0); // 完全不 discard！
        }
      `
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const pickingParticles = new THREE.Points(geometry, pickingMaterial);
    pickingScene.add(pickingParticles);

    // 点击拾取
    const handleClick = (e: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      camera.setViewOffset(rect.width, rect.height, x, y, 1, 1);
      renderer.setRenderTarget(pickingTarget);
      renderer.render(pickingScene, camera);
      renderer.setRenderTarget(null);
      camera.clearViewOffset();

      const pixel = new Uint8Array(4);
      renderer.readRenderTargetPixels(pickingTarget, 0, 0, 1, 1, pixel);
      const id = (pixel[0] << 16) | (pixel[1] << 8) | pixel[2];

      if (id > 0 && activeItemsRef.current[id - 1]) {
        onSelect(activeItemsRef.current[id - 1]);
      } else if (featuredItemsRef.current.length > 0) {
        const i = Math.floor(Math.random() * featuredItemsRef.current.length);
        onSelect(featuredItemsRef.current[i]);
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const animate = () => {
      const t = clock.getElapsedTime();
      material.uniforms.time.value = t;
      pickingMaterial.uniforms.time.value = t;
      camera.position.x = Math.sin(t * 0.08) * 80;
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    pickingSceneRef.current = pickingScene;
    pickingTargetRef.current = pickingTarget;

    return () => {
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      pickingMaterial.dispose();
      pickingTarget.dispose();
    };
  }, [activeItems, featuredItems, onSelect]);

  return <div ref={containerRef} className="fixed inset-0 -z-10" />;
};

export default RiverVisualizer;
