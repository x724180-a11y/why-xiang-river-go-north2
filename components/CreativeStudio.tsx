import React, { useState } from 'react';
import { HeritageItem, Language } from '../types';
import { UI_TEXT } from '../constants';
import { generateCreativeImage } from '../services/geminiService';

interface CreativeStudioProps {
  item: HeritageItem;
  language: Language;
  onClose: () => void;
}

const CreativeStudio: React.FC<CreativeStudioProps> = ({ item, language, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Enhance prompt with context
      const fullPrompt = `High quality artistic rendering of ${item.nameEn} (${item.descriptionEn}), ${prompt}. Cinematic lighting, 8k resolution, highly detailed.`;
      const result = await generateCreativeImage(fullPrompt);
      setGeneratedImage(result);
    } catch (e) {
      console.error(e);
      alert("Generation failed. Please check console or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="w-full max-w-6xl h-[90vh] flex flex-col md:flex-row gap-8">
        
        {/* Left: Controls */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 p-6 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-md">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                <span className="text-3xl">✦</span> 
                {UI_TEXT[language].create}
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                {UI_TEXT[language].back}
              </button>
           </div>
           
           <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <h3 className="text-slate-300 font-semibold mb-2">{language === 'zh' ? item.nameZh : item.nameEn}</h3>
              <p className="text-sm text-slate-500 line-clamp-3">{language === 'zh' ? item.descriptionZh : item.descriptionEn}</p>
           </div>

           <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm text-slate-400">Your Vision</label>
              <textarea 
                className="w-full flex-1 bg-black/40 border border-slate-700 rounded-lg p-4 text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none placeholder-slate-600"
                placeholder={UI_TEXT[language].promptPlaceholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
           </div>

           <button 
             onClick={handleGenerate}
             disabled={isGenerating || !prompt.trim()}
             className={`w-full py-4 rounded-lg font-bold tracking-wide transition-all
               ${isGenerating || !prompt.trim() 
                 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                 : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-900/50'
               }`}
           >
             {isGenerating ? UI_TEXT[language].generating : UI_TEXT[language].generate}
           </button>
        </div>

        {/* Right: Preview */}
        <div className="w-full md:w-2/3 bg-black border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden relative group">
           {generatedImage ? (
             <>
               <img src={generatedImage} alt="Generated Art" className="w-full h-full object-contain animate-in fade-in duration-700" />
               <a 
                 href={generatedImage} 
                 download={`xiang-heritage-${item.id}-remix.png`}
                 className="absolute bottom-6 right-6 px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white rounded-full border border-white/20 transition-all opacity-0 group-hover:opacity-100"
               >
                 {UI_TEXT[language].download}
               </a>
             </>
           ) : (
             <div className="text-center p-12">
               {isGenerating ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-amber-600/30 border-t-amber-500 rounded-full animate-spin"></div>
                    <p className="text-slate-500 animate-pulse">{UI_TEXT[language].generating}</p>
                  </div>
               ) : (
                  <div className="text-slate-700 flex flex-col items-center">
                    <svg className="w-24 h-24 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Enter a prompt to reimagine this heritage.</p>
                  </div>
               )}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default CreativeStudio;
