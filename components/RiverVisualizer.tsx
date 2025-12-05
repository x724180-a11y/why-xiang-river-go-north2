// components/RiverVisualizer.tsx —— 终极完美版（2025最新）
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
  const featuredItemsRef = useRef<HeritageItem[]>([]); // 专门存真实遗产
  const animationFrameRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // 只保留真实遗产（非程序生成）用于随机 fallback
  const featuredItems = useMemo(() => {
    return items.filter(item => !item.isProcedural);
  }, [items]);

  // 过滤后的所有粒子（包括程序生成的，用于视觉填充）
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
    featuredItemsRef.current = featuredItems; // 同步真实遗产列表
  }, [activeItems, featuredItems]);

  useEffect(() => {
    if (!containerRef.current) return;

    // ……（前面所有初始化代码保持不变，直到 pickingMaterial 部分）……

    // 只改这一段：PICKING MATERIAL —— 去掉圆形 discard，改成方形拾取
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
          // 关键改动：不 discard！让整个点都是可点击的方形区域
          gl_FragColor = vec4(vPickingColor, 1.0);
        }
      `,
      transparent: false,
      blending: THREE.NoBlending
    });

    // ……（中间渲染循环保持不变）……

    // 关键修复：handleClick 里的 fallback 逻辑
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !rendererRef.current || !pickingTargetRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      camera.setViewOffset(rect.width, rect.height, mouseX, mouseY, 1, 1);
      rendererRef.current!.setRenderTarget(pickingTargetRef.current);
      rendererRef.current!.render(pickingScene, camera);
      rendererRef.current!.setRenderTarget(null);
      camera.clearViewOffset();

      const pixelBuffer = new Uint8Array(4);
      rendererRef.current!.readRenderTargetPixels(pickingTargetRef.current!, 0, 0, 1, 1, pixelBuffer);

      const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];

      if (id > 0 && activeItemsRef.current[id - 1]) {
        onSelect(activeItemsRef.current[id - 1]);
        return;
      }

      // 点空白只随机真实遗产！再也不会刷“Unrecorded Heritage”
      if (featuredItemsRef.current.length > 0) {
        const randomIndex = Math.floor(Math.random() * featuredItemsRef.current.length);
        onSelect(featuredItemsRef.current[randomIndex]);
      }
    };

    // ……其余代码完全不变（mousemove、resize、animate、cleanup）……
  }, [activeItems, onSelect]);

  return <div ref={containerRef} className="absolute inset-0 z-0 bg-black cursor-pointer" />;
};

export default RiverVisualizer;
