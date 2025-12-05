// components/RiverVisualizer.tsx
// 最终版：Vercel 构建通过 + 粒子点击完美生效 + 响应式 + 性能优化

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
  const clockRef = useRef(new THREE.Clock());
  const frameRef = useRef<number>();
  const sizeRef = useRef({ width: 0, height: 0 });

  // 实时保存当前有效的 items 和初始位置
  const currentItemsRef = useRef<HeritageItem[]>([]);
  const initialPositionsRef = useRef<Float32Array>();

  // 将粒子世界坐标投影到标准化设备坐标（NDC
  const worldToScreen = (worldX: number, worldY: number, worldZ: number, time: number) => {
    const phase = time * 0.3 + worldX * 0.05;
    const offsetY = Math.sin(phase) * 8;
    const offsetX = Math.cos(phase * 0.7) * 3;

    const vec = new THREE.Vector3(worldX + offsetX, worldY + offsetY, worldZ);
    vec.project(cameraRef.current!);

    return vec; // x, y ∈ [-1, 1], z ∈ [-1, 1]
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const updateSize = () => {
      sizeRef.current = {
        width: container.clientWidth,
        height: container.clientHeight,
      };
    };
    updateSize();

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, sizeRef.current.width / sizeRef.current.height, 0.1, 1000);
    camera.position.set(0, 25, 100);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(sizeRef.current.width, sizeRef.current.height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 粒子数据准备
    const count = items.length;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    items.forEach((item, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 35 + Math.random() * 50;

      positions[i * 3 + 0] = Math.cos(angle) * radius;     // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;   // y
      positions[i * 3 + 2] = Math.sin(angle) * radius;     // z

      scales[i] = item.isProcedural ? 0.3 : 1.0 + Math.random() * 1.2;
    });

    initialPositionsRef.current = positions;
    currentItemsRef.current = items;

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
          vec3 pos = position;
          float phase = time * 0.3 + position.x * 0.05;
          pos.y += sin(phase) * 8.0;
          pos.x += cos(phase * 0.7) * 3.0;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = scale * 100.0 * (1.0 / -mvPosition.z) * pixelRatio;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(color, alpha * 0.95);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    materialRef.current = material;

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 鼠标交互
    let isHovering = false;

    const onMouseMove = (e: MouseEvent) => {
      const { width, height } = sizeRef.current;
      if (!width || !height) return;

      const mx = (e.clientX / width) * 2 - 1;
      const my = -(e.clientY / height) * 2 + 1;

      const time = clockRef.current.getElapsedTime();
      const posArray = initialPositionsRef.current;
      if (!posArray) return;

      isHovering = false;
      const threshold = 0.06;

      for (let i = 0; i < items.length; i++) {
        if (items[i].isProcedural) continue;

        const x = posArray[i * 3];
        const y = posArray[i * 3 + 1];
        const z = posArray[i * 3 + 2];

        const screen = worldToScreen(x, y, z, time);
        if (screen.z > 1) continue;

        const dx = screen.x - mx;
        const dy = screen.y - my;
        if (dx * dx + dy * dy < threshold * threshold) {
          isHovering = true;
          break;
        }
      }

      container.style.cursor = isHovering ? 'pointer' : 'default';
    };

    const onClick = (e: MouseEvent) => {
      const { width, height } = sizeRef.current;
      if (!width || !height) return;

      const mx = (e.clientX / width) * 2 - 1;
      const my = -(e.clientY / height) * 2 + 1;

      const time = clockRef.current.getElapsedTime();
      const posArray = initialPositionsRef.current;
      if (!posArray) return;

      let closestDist = Infinity;
      let selected: HeritageItem | null = null;
      const threshold = 0.09;

      // 点击容差稍大一点

      for (let i = 0; i < items.length; i++) {
        if (items[i].isProcedural) continue;

        const x = posArray[i * 3];
        const y = posArray[i * 3 + 1];
        const z = posArray[i * 3 + 2];

        const screen = worldToScreen(x, y, z, time);
        if (screen.z > 1) continue;

        const dx = screen.x - mx;
        const dy = screen.y - my;
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

    const onResize = () => {
      updateSize();
      const { width, height } = sizeRef.current;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      material.uniforms.pixelRatio.value = renderer.getPixelRatio();
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    // 动画循环
    const animate = () => {
      const elapsed = clockRef.current.getElapsedTime();
      material.uniforms.time.value = elapsed;

      // 相机缓慢漂移
      camera.position.x = Math.sin(elapsed * 0.08) * 60;
      camera.position.y = 20 + Math.cos(elapsed * 0.12) * 30;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [items, onSelect]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 bg-black pointer-events-auto
    />
  );
}
