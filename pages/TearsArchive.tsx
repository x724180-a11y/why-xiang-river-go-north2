// src/pages/TearsArchive.tsx —— 零依赖版（无需 react-router-dom！）
import React from 'react';

export default function TearsArchive({ onClose }: { onClose: () => void }) {
  const totalTears = 12784;
  const topCountries = [
    { name: '中国', count: 4321 },
    { name: '美国', count: 1876 },
    { name: '日本', count: 923 },
    { name: '韩国', count: 845 },
    { name: '德国', count: 612 }
  ];

  const exportReport = () => {
    const text = `2025 全球乡愁报告

为什么湘江北去？

截至此刻，全世界已落泪 ${totalTears.toLocaleString()} 次
每一滴泪都在逆流向北，因为世界上所有的水，都是湘江之水。

最乡愁的国家：
1. ${topCountries[0].name} — ${topCountries[0].count} 次
2. ${topCountries[1].name} — ${topCountries[1].count} 次
3. ${topCountries[2].name} — ${topCountries[2].count} 次

献给所有离乡的人。

—— 为什么湘江北去？2025`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2025全球乡愁报告.txt';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-[#F5F0E6] flex flex-col">
      <button
        onClick={onClose}
        className="absolute top-8 left-8 text-[#D4AF37] hover:text-white text-sm uppercase tracking-widest z-10"
      >
        ← 返回长河
      </button>

      <div className="flex-1 flex items-center justify-center relative">
        <div className="text-center">
          <h1 className="text-6xl md:text-9xl font-serif text-[#D4AF37] tracking-widest mb-8 gold-glow-text">
            全球泪水档案馆
          </h1>
          <p className="text-4xl md:text-6xl mb-12 animate-pulse">Tears</p>
          <p className="text-2xl text-[#D4AF37]/80 mb-16">
            2025 年，全世界已落泪
          </p>
          <p className="text-8xl font-bold text-white mb-20">
            {totalTears.toLocaleString()}
          </p>

          <div className="max-w-2xl mx-auto space-y-4 mb-20">
            {topCountries.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-2xl bg-black/40 px-8 py-6 rounded-2xl border border-[#D4AF37]/30">
                <span>{i + 1}. {c.name}</span>
                <span className="text-[#D4AF37] font-bold">{c.count.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <button
            onClick={exportReport}
            className="px-12 py-6 bg-[#D4AF37] text-black text-xl font-bold uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-2xl"
          >
            导出 2025 全球乡愁报告
          </button>
        </div>
      </div>
    </div>
  );
}
