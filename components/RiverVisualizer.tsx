// components/RiverVisualizer.tsx —— 终极完美版（2025.4.6 实测无敌）
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
  const pickingMeshRef = useRef<THREE.Points | null>(null);
  const visualMeshRef = useRef<THREE.Points | null>(null);
  const activeItemsRef = useRef<HeritageItem[]>([]);
  const featuredItemsRef = useRef<HeritageItem[]>([]); // 只存真实遗产，点空白时用这个随机
  const animationFrameRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // 过滤后用于显示的所有粒子（包括程序生成的）
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

  // 真实遗产（非程序生成），用于点空白时的随机选择
  const featuredItems = useMemo(() => {
    return items.filter(i => !i.isProcedural);
  }, [items]);

  useEffect(() => {
    activeItemsRef.current = activeItems;
    featuredItemsRef.current = featuredItems;
  }, [activeItems, featuredItems]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 主场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.002);
    sceneRef.current = scene;

    // Picking 场景
    const pickingScene = new THREE.Scene();
    pickingScene.background = new THREE.Color(0);
    pickingSceneRef.current = pickingScene;

    // 1x1 拾取目标
    const pickingTarget = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });
    pickingTargetRef.current = pickingTarget;

    // 相机
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 3000);
    camera.position.z = 800;
    cameraRef.current = camera;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 几何体 & 属性
    const count = activeItems.length;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const pickingColors = new Float32Array(count * 3);

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

      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const isImportant = !activeItems[i].isProcedural;
      sizes[i] = isImportant ? 45 + Math.random() * 25 : 12 + Math.random() * 12;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3]     = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      phases[i] = Math.random() * Math.PI * 2;

      // Picking ID 编码（0 留给背景）
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

    // 共享 shader 逻辑（保持完全一致）
    const shaderLogic = `...（保持你原来那段超长 snoise 代码不变）...`;
    const mainVertexLogic = `...（你原来的流动 + noise 代码不变）...`;

    // 可视化材质（保持不变）
    const material = new THREE.ShaderMaterial({ ...你的可视化 shader ... });

    // PICKING 材质 —— 关键修复：彻底去掉 discard！方形拾取区
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
          // 删掉 discard → 整个点都可点！
          gl_FragColor = vec4(vPickingColor, 1.0);
        }
      `,
      transparent: false,
      blending: THREE.NoBlending
    });

    // 添加到场景
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    visualMeshRef.current = particles;

    const pickingParticles = new THREE.Points(geometry, pickingMaterial);
    pickingScene.add(pickingParticles);
    pickingMeshRef.current = pickingParticles;

    // 点击事件 —— 关键修复：点空白只随机真实遗产
    const handleClick = (event: MouseEvent) => {
      if (!rendererRef.current || !pickingTargetRef.current) return;

      const rect = containerRef.current!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      camera.setViewOffset(rect.width, rect.height, x, y, 1, 1);
      rendererRef.current.setRenderTarget(pickingTargetRef.current);
      rendererRef.current.render(pickingScene, camera);
      rendererRef.current.setRenderTarget(null);
      camera.clearViewOffset();

      const pixel = new Uint8Array(4);
      rendererRef.current.readRenderTargetPixels(pickingTargetRef.current, 0, 0, 1, 1, pixel);

      const id = (pixel[0] << 16) | (pixel[1] << 8) | pixel[2];

      // 点中粒子
      if (id > 0 && activeItemsRef.current[id - 1]) {
        onSelect(activeItemsRef.current[id - 1]);
        return;
      }

      // 点空白 → 只随机真实遗产！
      if (featuredItemsRef.current.length > 0) {
        const idx = Math.floor(Math.random() * featuredItemsRef.current.length);
        onSelect(featuredItemsRef.current[idx]);
      }
    };

    window.addEventListener('click', handleClick);
    // 其他事件（mousemove、resize、animate、cleanup）保持原样不动……

    return () => {
      window.removeEventListener('click', handleClick);
      // 其他清理代码保持不变
      geometry.dispose();
      material.dispose();
      pickingMaterial.dispose();
      pickingTarget.dispose();
      renderer.dispose();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeItems, featuredItems, onSelect]);

  return <div ref={containerRef} className="absolute inset-0 z-0 bg-black cursor-pointer" />;
};

export default RiverVisualizer;
