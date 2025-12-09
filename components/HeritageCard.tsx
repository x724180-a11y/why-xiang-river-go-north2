import React, { useEffect, useState, useRef } from 'react';
import { HeritageItem, Language } from '../types';
import { UI_TEXT, POETRY_DATABASE, HERITAGE_ITEMS } from '../constants';
import { generateCreativeImage } from '../services/geminiService';

declare global {
  interface Window {
    L: any;
  }
}

interface HeritageCardProps {
  item: HeritageItem;
  language: Language;
  onClose: () => void;
  onNavigate: (item: HeritageItem) => void;
}

const HeritageCard: React.FC<HeritageCardProps> = ({ item, language, onClose, onNavigate }) => {
  const [activePoem, setActivePoem] = useState<{line: string, trans: string, author: string, year?: string} | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // 新增：智能图片加载器（带 5 个备用图，永不白屏！）
  const [currentImage, setCurrentImage] = useState<string>('');

  useEffect(() => {
    const urls = [
      item.imageUrl, // 主图
      `https://images.unsplash.com/photo-1506905925346-5002d28f63d9?w=1600`, // 高质量备用
      `https://images.unsplash.com/photo-1517332712256-6fb136b2d6a3?w=1600`, // 通用文化遗产图
      `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600`, // 金色古建筑
      `https://images.unsplash.com/photo-1540889921-7185b936e762?w=1600`  // 备用金色图
    ];

    let index = 0;
    const img = new Image();

    const tryLoad = () => {
      if (index >= urls.length) {
        setCurrentImage('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600'); // 最终兜底
        return;
      }
      img.src = urls[index];
    };

    img.onload = () => setCurrentImage(urls[index]);
    img.onerror = () => {
      index++;
      tryLoad();
    };

    tryLoad();
  }, [item.imageUrl]);
  
  return (
    // 修复3：最高 z-index + 完全防穿透
    <div
      className="fixed inset-0 z-[9999] bg-black text-[#F5F0E6] overflow-y-auto sanctuary-scroll animate-fade-in-up pointer-events-auto"
      onScroll={handleScroll}
    >
      {/* Sticky Top Header with Fixed Title */}
      <nav className="fixed top-0 left-0 w-full p-6 z-[9999] flex justify-between items-center bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none">
         <div
            className="pointer-events-auto cursor-pointer flex items-center gap-3 group"
            onClick={onClose}
         >
             <div className="w-12 h-[1px] bg-[#D4AF37] group-hover:w-20 transition-all duration-500"></div>
             <span className="font-serif tracking-[0.2em] text-xs uppercase text-[#D4AF37] opacity-80 group-hover:opacity-100">{UI_TEXT[language].back}</span>
         </div>
         {/* The Permanent Fixed Title */}
         <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-auto">
            <h1 className="text-xl md:text-2xl text-[#D4AF37] font-serif font-light tracking-widest gold-glow-text opacity-90">
                为什么湘江北去？
            </h1>
            <p className="text-[10px] text-[#D4AF37]/60 uppercase tracking-[0.3em] mt-1 hidden md:block">
                Why Does the Xiang River Flow North?
            </p>
         </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative h-screen w-full overflow-hidden flex items-end justify-center pb-24">
         {/* Parallax Background */}
         <div
            ref={heroRef}
            className="absolute inset-0 bg-cover bg-center transition-transform will-change-transform"
            style={{
                backgroundImage: `url(${currentImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600'})`,                filter: 'brightness(0.6) contrast(1.1) sepia(0.1)'
            }}
         ></div>
        
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        
         {/* Hero Text */}
         <div className="relative z-10 text-center max-w-5xl px-6 animate-float">
             <div className="mb-6 flex justify-center items-center gap-4 text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase opacity-80">
                 <span>{item.country}</span>
                 <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>
                 <span>{item.era}</span>
             </div>
            
             <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#F5F0E6] mb-8 drop-shadow-2xl leading-none">
                 {language === 'zh' ? item.nameZh : item.nameEn}
             </h2>
             {/* Poetic Invocation (Immediately Below Hero Title) */}
             {activePoem && (
                <div className="mt-12 space-y-4 max-w-2xl mx-auto border-t border-[#D4AF37]/30 pt-8">
                    <p className="text-2xl md:text-3xl font-serif text-[#D4AF37] italic font-light font-serif-sc">
                        "{activePoem.line}"
                    </p>
                    <p className="text-sm md:text-base text-gray-400 font-serif tracking-wide">
                        {activePoem.trans}
                    </p>
                    <div className="text-[10px] tracking-[0.2em] text-[#D4AF37]/60 uppercase">
                        — {activePoem.author}
                    </div>
                </div>
             )}
         </div>
      </div>

      {/* --- IMMERSIVE MAP SECTION --- */}
      <div className="w-full h-[70vh] bg-black relative border-y border-[#D4AF37]/10 flex flex-col items-center justify-center overflow-hidden">
         
          <div ref={mapContainerRef} className="w-full h-full z-0 grayscale"></div>
          {/* Map Overlay Info */}
          <div className="absolute bottom-8 left-8 z-[400] bg-black/80 backdrop-blur border border-[#D4AF37]/30 px-4 py-2 text-[#D4AF37] text-xs tracking-[0.2em] font-mono pointer-events-none">
              {Math.abs(item.coordinates.lat).toFixed(4)}° {item.coordinates.lat > 0 ? 'N' : 'S'}
              <span className="mx-2">|</span>
              {Math.abs(item.coordinates.lng).toFixed(4)}° {item.coordinates.lng > 0 ? 'E' : 'W'}
          </div>
      </div>

      {/* --- NARRATIVE CHAPTERS --- */}
      <div className="max-w-5xl mx-auto px-6 py-32 space-y-24 bg-black">
         
          {/* Chapter 1: History */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
             <div className="md:col-span-4 sticky top-32">
                 <h3 className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] mb-4">Chapter I</h3>
                 <h2 className="text-4xl font-serif text-[#F5F0E6]">{UI_TEXT[language].history}</h2>
             </div>
             <div className="md:col-span-8 space-y-8">
                 <p className="text-xl md:text-2xl font-serif leading-relaxed text-gray-300 first-letter:text-5xl first-letter:text-[#D4AF37] first-letter:float-left first-letter:mr-3">
                    {language === 'zh'
                       ? '在这里，每一块砖瓦都不仅仅是建筑材料，而是时间的容器。它们见证了帝国的兴衰，记录了人类对永恒的渴望。当阳光穿过古老的廊柱，历史的回响便在尘埃中起舞。'
                       : 'Here, every brick is not merely building material, but a vessel of time. They have witnessed the rise and fall of empires and recorded humanity\'s longing for eternity. When sunlight filters through the ancient colonnades, the echoes of history dance in the dust.'}
                 </p>
                 <div className="h-px w-24 bg-[#D4AF37]/50"></div>
                 <p className="text-lg font-serif leading-relaxed text-gray-400">
                    {item.descriptionEn}
                 </p>
                 <p className="text-lg font-serif leading-relaxed text-gray-400">
                    {item.descriptionZh}
                 </p>
             </div>
          </section>

          {/* Related Sites */}
          {relatedItems.length > 0 && (
            <section className="pt-12 border-t border-[#D4AF37]/10">
                <h3 className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] mb-12 text-center">{UI_TEXT[language].related}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedItems.map(rel => (
                        <div key={rel.id} className="group cursor-pointer" onClick={() => onNavigate(rel)}>
                             <div className="aspect-[3/4] overflow-hidden mb-4 relative">
                                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                 <img src={rel.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out" />
                             </div>
                             <h4 className="text-center font-serif text-lg text-gray-400 group-hover:text-[#D4AF37] transition-colors">{language === 'zh' ? rel.nameZh : rel.nameEn}</h4>
                        </div>
                    ))}
                </div>
            </section>
          )}
      </div>

      {/* --- AI FOOTER --- */}
      <footer className="bg-[#080808] py-24 border-t border-[#D4AF37]/20">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-16 items-center">
              <div className="w-full md:w-1/3 space-y-6">
                  <h3 className="text-2xl font-serif text-[#D4AF37] italic">{UI_TEXT[language].reimagine}</h3>
                  <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={UI_TEXT[language].prompt}
                      className="w-full bg-[#111] border border-[#333] p-4 text-[#F5F0E6] font-serif focus:border-[#D4AF37] outline-none min-h-[120px] resize-none text-sm"
                  />
                  <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt}
                      className="w-full py-4 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all uppercase text-xs tracking-widest disabled:opacity-50"
                  >
                      {isGenerating ? UI_TEXT[language].generating : UI_TEXT[language].generate}
                  </button>
              </div>
              <div className="w-full md:w-2/3 aspect-video bg-[#0C0C0C] border border-[#222] flex items-center justify-center relative overflow-hidden">
                  {generatedImage ? (
                      <div className="w-full h-full relative group">
                          <img src={generatedImage} className="w-full h-full object-contain animate-fade-in-up" />
                          <a href={generatedImage} download className="absolute bottom-4 right-4 px-4 py-2 bg-black/50 backdrop-blur border border-white/20 text-white text-xs uppercase hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100">
                              {UI_TEXT[language].download}
                          </a>
                      </div>
                  ) : (
                      <div className="text-center opacity-30">
                          <span className="text-4xl text-[#D4AF37]">✦</span>
                      </div>
                  )}
              </div>
          </div>
         
          <div className="text-center mt-24 text-[10px] text-gray-800 tracking-[0.6em] uppercase">
              {UI_TEXT[language].title} • 2025
          </div>
      </footer>
    </div>
  );
};

export default HeritageCard;
