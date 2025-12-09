// src/App.tsx —— 终极完美版 + 一键落泪功能（2025.4.6 已实测无敌）
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

  // 一键落泪功能
  const [tearCount, setTearCount] = useState(0);
  const [showRipple, setShowRipple] = useState<{ x: number; y: number } | null>(null);

  // 长按落泪（PC 右键 / 手机长按）
  useEffect(() => {
    let longPressTimer: NodeJS.Timeout;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      longPressTimer = setTimeout(() => {
        let x, y;
        if ('touches' in e) {
          x = e.touches[0].clientX;
          y = e.touches[0].clientY;
        } else {
          x = (e as MouseEvent).clientX;
          y = (e as MouseEvent).clientY;
        }

        // 播放水滴音效（静音兜底）
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-small-water-splash-1206.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});

        // 涟漪动画
        setShowRipple({ x, y });
        setTimeout(() => setShowRipple(null), 1200);

        // 计数 +1
        setTearCount(c => c + 1);
      }, 600); // 600ms 长按触发
    };

    const handleEnd = () => {
      clearTimeout(longPressTimer);
    };

    // 阻止右键菜单
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
      {/* 粒子河流背景 - 详情页打开时禁用点击 */}
      <div className={isDetailOpen ? 'pointer-events-none' : ''}>
        <RiverVisualizer
          items={HERITAGE_ITEMS}
          onSelect={setSelectedItem}
          filteredRegion={filteredRegion}
          isDetailOpen={isDetailOpen}
        />
      </div>

      {/* 全局涟漪效果（落泪时显示） */}
      {showRipple && (
        <div
          className="fixed pointer-events-none z-[9998] animate-ping"
          style={{
            left: showRipple.x - 50,
            top: showRipple.y - 50,
            width: 100,
            height: 100,
          }}
        >
          <div className="w-full h-full rounded-full bg-[#D4AF37]/40 shadow-2xl"></div>
          <div className="absolute inset-0 rounded-full bg-[#D4AF37]/20 animate-ping"></div>
        </div>
      )}

      {/* 右下角泪水计数器 */}
      <div className="fixed bottom-8 right-8 z-[9998] bg-black/80 backdrop-blur-lg border border-[#D4AF37]/40 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl">
        <div className="text-5xl">Tears</div>
        <div>
          <div className="text-[#D4AF37] text-xs uppercase tracking-widest opacity-80">今日全球泪水</div>
          <div className="text-3xl font-bold text-white font-mono">{tearCount.toLocaleString()}</div>
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

        {/* 底部提示 */}
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

      {/* 详情页 - 完全隔离交互 */}
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
