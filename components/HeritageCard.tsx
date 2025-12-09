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
