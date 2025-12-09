import React, { useState } from 'react';
import { HERITAGE_ITEMS, UI_TEXT } from './constants';
import { HeritageItem, Language } from './types';
import RiverVisualizer from './components/RiverVisualizer';
import HeritageCard from './components/HeritageCard';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedItem, setSelectedItem] = useState<HeritageItem | null>(null);
  const [filteredRegion, setFilteredRegion] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black selection:bg-[#D4AF37] selection:text-black">
      
      {/* --- WebGL River Background --- */}
      <RiverVisualizer 
        items={HERITAGE_ITEMS} 
        onSelect={setSelectedItem}
        filteredRegion={filteredRegion}
      />

      {/* --- UI Overlay (Fades out when item selected) --- */}
      <div 
        className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10 transition-all duration-1000 ${selectedItem ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}
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

        {/* Search Input */}
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

        {/* Footer Hints */}
        <footer className="w-full flex justify-between items-end">
           <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent"></div>
           
           <div className="text-right">
             <p className="text-[10px] text-[#D4AF37]/50 uppercase tracking-[0.3em] font-light mb-2">
               {HERITAGE_ITEMS.length.toLocaleString()} {language === 'zh' ? '处世界遗产' : 'World Heritage Sites'}
             </p>
             <p className="text-[9px] text-gray-600 uppercase tracking-widest">
               UNESCO Data Visualization
             </p>
           </div>
        </footer>
      </div>

      {/* --- Detail Sanctuary View --- */}
      {selectedItem && (
        <HeritageCard 
          key={selectedItem.id}
          item={selectedItem}
          language={language}
          onClose={() => setSelectedItem(null)}
          onNavigate={setSelectedItem}
        />
      )}

    </div>
  );
};

export default App;
