// src/App.tsx —— 终极完美版（2025.4.6 已实测无敌）
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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black selection:bg-[#D4AF37] selection:text-black">
      {/* 粒子河流背景 - 详情页打开时禁用点击 */}
      <div className={isDetailOpen ? 'pointer-events-none' : ''}>
        <RiverVisualizer
          items={HERITAGE_ITEMS}
          onSelect={setSelectedItem}
          filteredRegion={filteredRegion}
          isDetailOpen={isDetailOpen} // 传给 RiverVisualizer 让它内部也判断
        />
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
