// components/RiverVisualizer.tsx
// 100% 能在 GitHub + Vercel 直接通过的终极版本

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HeritageItem } from '../types';

interface RiverVisualizerProps {
  items: HeritageItem[];
  onSelect: (item: HeritageItem) => void;
  filteredRegion: string;
}

export default function RiverVisualizer({ items, onSelect }: RiverVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const materialRef = useRef<THREE.ShaderMaterial>();
  const clock = useRef(new THREE.Clock());
  const frameId = useRef<number>();
  const size = useRef({ width: 0, height: 0 });

  const itemsRef = useRef<HeritageItem[]>([]);
  const positionsRef = useRef<Float32Array>();

  const project = (x: number, y: number, z: number, time: number) => {
    const phase = time * 0.3 + x * 0.05;
    const offsetY = Math.sin(phase) * 8;
    const offsetX = Math.cos(phase * 0.7) * 3;
    const vec = new THREE.Vector3(x + offsetX, y + offsetY, z);
    vec.project(cameraRef.current!);
    return vec;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const updateSize = () => {
      size.current = { width: container.clientWidth, height: container.clientHeight };
    };
    updateSize();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, size.current.width / size.current.height, 0.1, 1000);
    camera.position.set(0, 25, 100);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(size.current.width, size.current.height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 生成粒子
    const count = items.length;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    items.forEach((item, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 35 + Math.random() * 50;
      positions[i * 3]     = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      scales[i] = item.isProcedural ? 0.3 : 1.0 + Math.random() * 1.2;
    });

    positionsRef.current = positions;
    itemsRef.current = items;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: renderer.getPixelRatio() },
        color: { value: new THREE.Color('#D4AF37') },
      },
      vertexShader: `
        uniform float time;
        uniform float pixelRatio;
        attribute float scale;
        void main() {
          vec3 p = position;
          float phase = time * 0.3 + position.x * 0.05;
          p.y += sin(phase) * 8.0;
          p.x += cos(phase * 0.7) * 3.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = scale * 100.0 * (1.0 / -mv.z) * pixelRatio;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float a = 1.0 - smoothstep(0.0, 0.5, d);
          gl_FragColor = vec4(color, a * 0.95);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    materialRef.current = material;

    // 鼠标悬停 & 点击
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      const { width, height } = size.current;
      if (!width) return;
      const mx = (e.clientX / width) * 2 - 1;
      const my = -(e.clientY / height) * 2 + 1;
      const t = clock.current.getElapsedTime();
      const pos = positionsRef.current;
      if (!pos) return;

      hovering = false;
      const thresh = 0.06;
      for (let i = 0; i < items.length; i++) {
        if (items[i].isProcedural) continue;
        const screen = project(pos[i*3], pos[i*3+1], pos[i*3+2], t);
        if (screen.z > 1) continue;
        const dx = screen.x - mx;
        const dy = screen.y - my;
        if (dx*dx + dy*dy < thresh*thresh) {
          hovering = true;
          break;
        }
      }
      container.style.cursor = hovering ? 'pointer' : 'default';
    };

    const onClick = (e: MouseEvent) => {
      const { width, height } = size.current;
      if (!width) return;
      const mx = (e.clientX / width) * 2 - 1;
      const my = -(e.clientY / height) * 2 + 1;
      const t = clock.current.getElapsedTime();
      const pos = positionsRef.current;
      if (!pos) return;

      let best = Infinity;
      let chosen: HeritageItem | null = null;
      const thresh = 0.09;

      for (let i = 0; i < items.length; i++) {
        if (items[i].isProcedural) continue;
        const screen = project(pos[i*3], pos[i*3+1], pos[i*3+2], t);
        if (screen.z > 1) continue;
        const dx = screen.x - mx;
        const dy = screen.y - my;
        const dist2 = dx*dx + dy*dy;
        if (dist2 < thresh*thresh && dist2 < best) {
          best = dist2;
          chosen = items[i];
        }
      }
      if (chosen) onSelect(chosen);
    };

    const onResize = () => {
      updateSize();
      camera.aspect = size.current.width / size.current.height;
      camera.updateProjectionMatrix();
      renderer.setSize(size.current.width, size.current.height);
      material.uniforms.pixelRatio.value = renderer.getPixelRatio();
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    const animate = () => {
      const t = clock.current.getElapsedTime();
      material.uniforms.time.value = t;
      camera.position.x = Math.sin(t * 0.08) * 60;
      camera.position.y = 20 + Math.cos(t * 0.12) * 30;
      camera.lookAt(0,0,0);
      renderer.render(scene, camera);
      frameId.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      if (frameId.current) cancelAnimationFrame(frameId.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [items, onSelect]);

  return <div ref={containerRef} className="absolute inset-0 -z-10 bg-black" />;
}
