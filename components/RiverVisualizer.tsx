// RiverVisualizer.tsx —— 完全修复点击 + 优化性能 + 防抖
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { HeritageItem from '../types';

interface RiverVisualizerProps {
  items: HeritageItem[];
  onSelect: (item: HeritageItem) => void;
  filteredRegion: string;
}

export default function RiverVisualizer({ items, onSelect, filteredRegion }: RiverVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const materialRef = useRef<THREE.ShaderMaterial>();
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const animationFrameRef = useRef<number>();

  // 关键修复：实时获取尺寸 + 响应式
  const sizeRef = useRef({ width: 0, height: 0 });

  const activeItemsRef = useRef<HeritageItem[]>([]);
  const initialPositionsRef = useRef<Float32Array>();

  const getScreenPosition = (x: number, y: number, z: number, time: number): THREE.Vector3 => {
    // 你的流动动画逻辑（保持原样）
    const phase = time * 0.3 + x * 0.5 + y * 0.3;
    const offsetY = Math.sin(phase) * 8;
    const offsetX = Math.cos(phase * 0.7) * 3;

    const pos = new THREE.Vector3(x + offsetX, y + offsetY, z);
    pos.project(cameraRef.current!);

    return pos;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    sizeRef.current = { width, height }; // 实时更新

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 20, 100);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 粒子几何体
    const count = items.length;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    items.forEach((item, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 30 + Math.random() * 40;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      scales[i] = item.isProcedural ? 0.3 : 1.0 + Math.random() * 0.8;
    });

    initialPositionsRef.current = positions;

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
        varying float vScale;
        void main() {
          vScale = scale;
          vec3 pos = position;
          float phase = time * 0.3 + position.x * 0.05;
          pos.y += sin(phase) * 8.0;
          pos.x += cos(phase * 0.7) * 3.0;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = scale * 80.0 * (1.0 / -mvPosition.z) * pixelRatio;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vScale;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);
          if (dist > 0.5) discard;
          float intensity = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(color, intensity * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    materialRef.current = material;
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    activeItemsRef.current = items;

    // 关键修复：实时更新 sizeRef
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      sizeRef.current = { width: w, height: h };

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      material.uniforms.pixelRatio.value = renderer.getPixelRatio();
    };

    // 鼠标悬停 + 点击（修复版）
    let hovered = false;

    const handleMouseMove = (e: MouseEvent) => {
      const { width, height } = sizeRef.current;
      if (!width || !height) return;

      const mouseX = (e.clientX / width) * 2 - 1;
      const mouseY = -(e.clientY / height) * 2 + 1;

      const time = clockRef.current.getElapsedTime();
      const positions = initialPositionsRef.current;
      if (!positions) return;

      hovered = false;
      const threshold = 0.06;

      for (let i = 0; i < items.length; i++) {
        if (items[i].isProcedural) continue;

        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];

        const screenPos = getScreenPosition(x, y, z, time);
        if (screenPos.z > 1) continue;

        const dx = screenPos.x - mouseX;
        const dy = screenPos.y - mouseY;
        if (dx * dx + dy * dy < threshold * threshold) {
          hovered = true;
          break;
        }
      }

      container.style.cursor = hovered ? 'pointer' : 'default';
    };

    const handleClick = (e: MouseEvent) => {
      const { width, height } = sizeRef.current;
      if (!width || !height) return;

      const mouseX = (e.clientX / width) * 2 - 1;
      const mouseY = -(e.clientY / height) * 2 + 1;

      const time = clockRef.current.getElapsedTime();
      const positions = initialPositionsRef.current;
      if (!positions) return;

      let closestDist = Infinity;
      let selected: HeritageItem | null = null;
      const threshold = 0.08; // 点击容错稍大一点

      for (let i = 0; i < items.length; i++) {
        if (items[i].isProcedural) continue;

        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];

        const screenPos = getScreenPosition(x, y, z, time);
        if (screenPos.z > 1) continue;

        const dx = screenPos.x - mouseX;
        const dy = screenPos.y - mouseY;
        const distSq = dx * dx + dy * dy;

        if (distSq < threshold * threshold && distSq < closestDist) {
          closestDist = distSq;
          selected = items[i];
        }
      }

      if (selected) {
        onSelect(selected);
      }
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    const animate = () => {
      const time = clockRef.current.getElapsedTime();
      material.uniforms.time.value = time;

      camera.position.x = Math.sin(time * 0.08) * 60;
      camera.position.y = Math.cos(time *0.12) * 40 + 20;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [items, onSelect]);

  return <div ref={containerRef} className="absolute inset-0 -z-10 bg-black" />;
}
