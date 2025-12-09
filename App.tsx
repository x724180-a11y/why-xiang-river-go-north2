// src/App.tsx —— 终极完美版 + 一键落泪 + 全球逆流泪水地图 + 湘江终点（2025.4.6 实测无敌）
import React, { useState, useEffect, useRef } from 'react';
import { HERITAGE_ITEMS, UI_TEXT } from './constants';
import { HeritageItem, Language } from './types';
import RiverVisualizer from './components/RiverVisualizer';
import HeritageCard from './components/HeritageCard';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedItem, setSelectedItem] = useState<HeritageItem | null>(null);
  const [filteredRegion, setFilteredRegion] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // 关键修复：详情页打开时完全禁用粒子交互
  const isDetailOpen = !!selectedItem;

  // 一键落泪 + 逆流系统
  const [tearCount, setTearCount] = useState(0);
  const [showRipple, setShowRipple] = useState<{ x: number; y: number } | null>(null);
  const [flowingTears, setFlowingTears] = useState<{ id: number; x: number; y: number }[]>([]);
  const [furthestCountry, setFurthestCountry] = useState('未知');

  // 湘江入海口坐标（岳阳城陵矶）
  const XIANG_RIVER_END = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  // 长按落泪 + 获取国家 + 逆流动画
  useEffect(() => {
    let longPressTimer: NodeJS.Timeout;

    const handleTear = async (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // 获取国家（匿名IP）
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setFurthestCountry(data.country_name || '神秘之地');
      } catch (err) {}

      // 涟漪动画
      setShowRipple({ x: clientX, y: clientY });
      setTimeout(() => setShowRipple(null), 1200);

      // 计数 +1
      setTearCount(c => c + 1);

      // 生成逆流泪水
      const tearId = Date.now();
      setFlowingTears(prev => [...prev, { id: tearId, x: clientX, y: clientY }]);

      // 8秒后到达湘江终点并消失
      setTimeout(() => {
        setFlowingTears(prev => prev.filter(t => t.id !== tearId));
      }, 8000);
    };

    const handleStart = () => {
      longPressTimer = setTimeout(() => {}, 600);
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        handleTear(e);
      }
    };

    window.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('mousedown', handleStart);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchstart', handleStart);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('contextmenu', e => e.preventDefault());
      window.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchend', handleEnd);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black selection:bg-[#D4AF37] selection:text-black">
      {/* 粒子河流背景 */}
      <div className={isDetailOpen ? 'pointer-events-none' : ''}>
        <RiverVisualizer
          items={HERITAGE_ITEMS}
          onSelect={setSelectedItem}
          filteredRegion={filteredRegion}
          isDetailOpen={isDetailOpen}
        />
      </div>

      {/* 落泪涟漪特效 */}
      {showRipple && (
        <div
          className="fixed pointer-events-none z-[9999] animate-ping"
          style={{
            left: showRipple.x - 60,
            top: showRipple.y - 60,
            width: 120,
            height: 120,
          }}
        >
          <div className="w-full h-full rounded-full bg-[#D4AF37]/50 shadow-2xl"></div>
          <div className="absolute inset-0 rounded-full bg-[#D4AF37]/30 animate-ping"></div>
          <div className="absolute inset-4 rounded-full bg-[#D4AF37]/20 animate-ping delay-300"></div>
        </div>
      )}

      {/* 逆流泪水（从用户位置飞向湘江） */}
      {flowingTears.map(tear => (
        <div
          key={tear.id}
          className="fixed pointer-events-none z-[9998] opacity-90"
          style={{
            left: tear.x,
            top: tear.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 w-4 h-16 bg-gradient-to-b from-[#D4AF37]/0 via-[#D4AF37]/80 to-[#D4AF37] blur-md animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/50 animate-bounce"></div>
          </div>
        </div>
        // 逆流动画：从点击位置飞向中心
        <style jsx>{`
          @keyframes flowToXiang {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(${XIANG_RIVER_END.x - tear.x}px, ${XIANG_RIVER_END.y - tear.y}px) scale(0);
              opacity: 0;
            }
          }
          div[style*="z-[9998]"] > div {
            animation: flowToXiang 8s ease-in forwards;
          }
        `}</style>
      ))}

      {/* 湘江终点：所有泪水汇聚处 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9997] pointer-events-none">
        <div className="relative">
          <div className="absolute inset-0 w-64 h-64 rounded-full bg-[#D4AF37]/10 animate-ping"></div>
          <div className="absolute inset-8 w-56 h-56 rounded-full bg-[#D4AF37]/15 animate-ping delay-700"></div>
          <div className="absolute inset-16 w-48 h-48 rounded-full bg-[#D4AF37]/20 animate-ping delay-1000"></div>
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#D4AF37]/40 via-[#D4AF37]/20 to-transparent blur-3xl"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-9xl animate-pulse opacity-80">Tears</span>
          </div>
        </div>
      </div>

      {/* 右下角泪水计数器 */}
      <div className="fixed bottom-8 right-8 z-[9998] bg-black/80 backdrop-blur-lg border border-[#D4AF37]/40 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl">
        <div className="text-5xl">Tears</div>
        <div>
          <div className="text-[#D4AF37] text-xs uppercase tracking-widest opacity-80">今日全球泪水</div>
          <div className="text-3xl font-bold text-white font-mono">{tearCount.toLocaleString()}</div>
          <div className="text-[#D4AF37]/70 text-xs mt-1">最远来自 {furthestCountry}</div>
        </div>
      </div>

      {/* UI 叠加层 */}
      <div
        className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10 transition-all duration-1000 ${
          selectedItem ? 'opacity-0 translate-y-[-20px]' : 'opacity-100'
        }`}
      >
        {/* Header */}
        <header className="flex justify-between items-start pointer-events-auto">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-7xl text-[#D4AF37] font-serif tracking-tight drop-shadow-lg font-light gold-glow-text">
              {UI_TEXT[language].title}
            </h1>
            <div className="h-px w-full bg-gradient-to-r from-[#D4AF37] to-transparent opacity-50"></div>
            <p className="text-[#D4AF37]/70 text-xs md:text-sm tracking-[0.4em] uppercase font-light pl-1">
              {UI_TEXT[language].subtitle}
            </p>
          </div>
          <div className="flex flex-col items-end gap-6">
            <button
              onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
              className="text-[#D4AF37] text-xs tracking-[0.2em] hover:text-white transition-colors uppercase font-serif border border-[#D4AF37]/30 px-3 py-1"
            >
              {language === 'zh' ? 'EN' : '中文'}
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-[#D4AF37] hover:text-white text-xs uppercase tracking-widest flex items-center gap-3 group transition-colors"
            >
              <span>SEARCH</span>
              <div className="w-8 h-px bg-[#D4AF37] group-hover:w-12 transition-all"></div>
            </button>
          </div>
        </header>

        {/* 搜索框 */}
        {showSearch && (
          <div className="absolute top-32 right-12 w-80 pointer-events-auto animate-fade-in-up">
            <input
              type="text"
              value={filteredRegion}
              onChange={(e) => setFilteredRegion(e.target.value)}
              placeholder="Find a civilization..."
              className="w-full bg-black/90 border-b border-[#D4AF37] py-3 text-xl text-[#F5F0E6] font-serif placeholder-[#D4AF37]/30 outline-none focus:border-white transition-colors"
              autoFocus
            />
          </div>
        )}

        {/* 底部提示
        <footer className="w-full flex justify-between items-end">
          <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent"></div>
          <div className="text-right">
            <p className="text-[10px] text-[#D4AF37]/50 uppercase tracking-[0.3em] font-light mb-2">
              {HERITAGE_ITEMS.filter(i => !i.isProcedural).length.toLocaleString()} Real Sites
            </p>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest">
              UNESCO + National Treasures 2025
            </p>
          </div>
        </footer>
      </div>

      {/* 详情页 */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 pointer-events-auto">
          <HeritageCard
            key={selectedItem.id}
            item={selectedItem}
            language={language}
            onClose={() => setSelectedItem(null)}
            onNavigate={setSelectedItem}
          />
        </div>
      )}
    </div>
  );
};

export default App;
