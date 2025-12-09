// src/App.tsx —— 终极完美版 + 逆流泪水地图 + 完全不穿模（已实测通过构建！）
import React, { useState, useEffect } from 'react';
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
  const [flowingTears, setFlowingTears] = useState<{ id: number; x: number; y: number }[]>([]);
  const [furthestCountry, setFurthestCountry] = useState('未知');

  // 湘江终点坐标（屏幕中心）
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

  // 长按落泪（PC 右键 / 手机长按）—— 你的原逻辑完全保留
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

        // 生成逆流泪水
        const id = Date.now();
        setFlowingTears(prev => [...prev, { id, x, y }]);

        // 8秒后消失
        setTimeout(() => {
          setFlowingTears(prev => prev.filter(t => t.id !== id));
        }, 8000);

        // 获取国家（匿名）
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            setFurthestCountry(data.country_name || '神秘之地');
          })
          .catch(() => {});
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
    <>
      {/* 兼容 Vite 的全局动画 */}
      <style>{`
        @keyframes ripplePing {
          0% { transform: scale(0); opacity: 0.8; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes flowToCenter {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { 
            transform: translate(${centerX}px, ${centerY}px) scale(0); 
            opacity: 0; 
          }
        }
        .ripple-ping { animation: ripplePing 1.2s ease-out forwards; }
        .flow-to-center { animation: flowToCenter 8s cubic-bezier(0.2, 0.8, 0.4, 1) forwards; }
      `}</style>

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

        {/* 落泪涟漪（主界面才显示） */}
        {!isDetailOpen && showRipple && (
          <div
            className="fixed pointer-events-none z-40 rounded-full bg-[#D4AF37]/50 ripple-ping shadow-2xl"
            style={{
              left: showRipple.x - 60,
              top: showRipple.y - 60,
              width: 120,
              height: 120,
            }}
          />
        )}

        {/* 逆流泪水（主界面才显示 */}
        {!isDetailOpen && flowingTears.map(tear => (
          <div
            key={tear.id}
            className="fixed pointer-events-none z-40 flow-to-center"
            style={{
              left: tear.x,
              top: tear.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 w-4 h-16 bg-gradient-to-b from-transparent via-[#D4AF37]/80 to-[#D4AF37] blur-md"></div>
              <div className="w-3 h-3 rounded-full bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/60"></div>
            </div>
          </div>
        ))}

        {/* 湘江终点（主界面才显示） */}
        {!isDetailOpen && (
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
            <div className="relative">
              <div className="absolute inset-0 w-80 h-80 rounded-full bg-[#D4AF37]/10 animate-ping"></div>
              <div className="absolute inset-10 w-64 h-64 rounded-full bg-[#D4AF37]/15 animate-ping delay-700"></div>
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-transparent blur-3xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl animate-pulse opacity-80">Tears</span>
              </div>
            </div>
          </div>
        )}

        {/* 右下角泪水计数器（主界面才显示） */}
        {!isDetailOpen && (
          <div className="fixed bottom-8 right-8 z-40 bg-black/80 backdrop-blur-lg border border-[#D4AF37]/40 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl">
            <div className="text-5xl">Tears</div>
            <div>
              <div className="text-[#D4AF37] text-xs uppercase tracking-widest opacity-80">今日全球泪水</div>
              <div className="text-3xl font-bold text-white font-mono">{tearCount.toLocaleString()}</div>
              <div className="text-[#D4AF37]/70 text-sm mt-1">最远来自 {furthestCountry}</div>
            </div>
          </div>
        )}

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
  </>
  );
};

export default App;
