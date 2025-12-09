import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { HeritageItem } from '../types';

interface RiverVisualizerProps {
  items: HeritageItem[];
  onSelect: (item: HeritageItem) => void;
  filteredRegion: string;
  isDetailOpen?: boolean; // ← 新增，防穿透
}

const RiverVisualizer: React.FC<RiverVisualizerProps> = ({ 
  items, 
  onSelect, 
  filteredRegion,
  isDetailOpen = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
 
  const pickingSceneRef = useRef<THREE.Scene | null>(null);
  const pickingTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const pickingMeshRef = useRef<THREE.Points | null>(null);
  const visualMeshRef = useRef<THREE.Points | null>(null);
  const activeItemsRef = useRef<HeritageItem[]>([]);
  const animationFrameRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

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

    // --- 所有初始化代码保持你原来的不变 ---

    // --- EVENTS ---
    const handleClick = (event: MouseEvent) => {
      if (isDetailOpen) return; // ← 加上这行，详情页打开时禁用点击

      if (!containerRef.current || !rendererRef.current || !pickingTargetRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
     
      camera.setViewOffset(rect.width, rect.height, mouseX, mouseY, 1, 1);
     
      rendererRef.current.setRenderTarget(pickingTargetRef.current);
      rendererRef.current.render(pickingScene, camera);
     
      rendererRef.current.setRenderTarget(null);
      camera.clearViewOffset();

      const pixelBuffer = new Uint8Array(4);
      rendererRef.current.readRenderTargetPixels(pickingTargetRef.current, 0, 0, 1, 1, pixelBuffer);
     
      const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];
      if (id > 0) {
        const index = id - 1;
        if (activeItemsRef.current[index]) {
          onSelect(activeItemsRef.current[index]);
          return;
        }
      }
     
      if (activeItemsRef.current.length > 0) {
        const randomIndex = Math.floor(Math.random() * activeItemsRef.current.length);
        onSelect(activeItemsRef.current[randomIndex]);
      }
    };

    // 关键修复：监听 window，不要监听 containerEl！
    window.addEventListener('click', handleClick);

    const handleResize = () => {
      // ... 你原来的 resize 代码 ...
    };
    window.addEventListener('resize', handleResize);

    // --- LOOP ---
    const animate = () => {
      // ... 你原来的 animate 代码 ...
    };
    animate();

    return () => {
      window.removeEventListener('click', handleClick); // ← 清理也改回 window
      window.removeEventListener('resize', handleResize);
      // ... 其他清理 ...
    };
  }, [activeItems, onSelect, isDetailOpen]); // ← 加上 isDetailOpen

  // 关键修复：去掉 pointer-events-none，改成 auto
  return <div ref={containerRef} className="absolute inset-0 z-0 bg-black cursor-pointer pointer-events-auto" />;
};

export default RiverVisualizer;
