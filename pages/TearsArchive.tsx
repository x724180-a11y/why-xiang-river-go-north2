// src/pages/TearsArchive.tsx —— 完美中英文双语版（已实测通过构建！）
import React from 'react';
import { UI_TEXT } from '../constants';

export default function TearsArchive({ onClose, language }: { onClose: () => void; language: 'zh' | 'en' }) {
  const t = language === 'zh' ? UI_TEXT.zh : UI_TEXT.en;

  const totalTears = 12784;

  const topCountries = language === 'zh'
    ? [
        { name: '中国', count: 4321 },
        { name: '美国', count: 1876 },
        { name: '日本', count: 923 },
        { name: '韩国', count: 845 },
        { name: '德国', count: 612 },
        { name: '英国', count: 598 },
        { name: '法国', count: 521 },
        { name: '巴西', count: 487 },
        { name: '印度', count: 456 },
        { name: '加拿大', count: 423 },
        { name: '澳大利亚', count: 398 },
        { name: '俄罗斯', count: 376 },
        { name: '意大利', count: 354 },
        { name: '西班牙', count: 321 },
        { name: '墨西哥', count: 298 },
      ]
    : [
        { name: 'China', count: 4321 },
        { name: 'United States', count: 1876 },
        { name: 'Japan', count: 923 },
        { name: 'South Korea', count: 845 },
        { name: 'Germany', count: 612 },
        { name: 'United Kingdom', count: 598 },
        { name: 'France', count: 521 },
        { name: 'Brazil', count: 487 },
        { name: 'India', count: 456 },
        { name: 'Canada', count: 423 },
        { name: 'Australia', count: 398 },
        { name: 'Russia', count: 376 },
        { name: 'Italy', count: 354 },
        { name: 'Spain', count: 321 },
        { name: 'Mexico', count: 298 },
      ];

  const exportReport = () => {
    const reportText = language === 'zh'
      ? `2025 全球乡愁报告

为什么湘江北去？

截至此刻，全世界已落泪 ${totalTears.toLocaleString()} 次
每一滴泪都在逆流向北，因为世界上所有的水，都是湘江之水。

最乡愁国家排行：
${topCountries.map((c, i) => `${i + 1}. ${c.name} — ${c.count.toLocaleString()} 次`).join('\n')}

献给所有离乡的人。
—— 为什么湘江北去？2025`
      : `2025 Global Homesickness Report

Why Does the Xiang River Flow North?

So far, the world has shed ${totalTears.toLocaleString()} tears.
Every tear flows northward, because all water in the world is Xiang River water.

Most Homesick Countries:
${topCountries.map((c, i) => `${i + 1}. ${c.name} — ${c.count.toLocaleString()} tears`).join('\n')}

To all who are far from home.
— Why Does the Xiang River Flow North? 2025`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = language === 'zh' ? '2025全球乡愁报告.txt' : '2025_Global_Homesickness_Report.txt';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-[#F5F0E6] flex flex-col">
      {/* 固定标题栏 */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black to-transparent z-50 pointer-events-none" />
      <div className="fixed top-8 left-8 z-50 pointer-events-auto">
        <button
          onClick={onClose}
          className="text-[#D4AF37] hover:text-white text-lg uppercase tracking-widest flex items-center gap-3 transition-colors"
        >
          <span className="text-2xl">←</span> {language === 'zh' ? '返回长河' : 'Back to River'}
        </button>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-y-auto pt-32 pb-32 px-8 md:px-16">
        <div className="max-w-5xl mx-auto">
          {/* 主标题 */}
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-9xl font-serif text-[#D4AF37] tracking-widest gold-glow-text mb-8">
              {language === 'zh' ? '全球泪水档案馆' : 'Global Tears Archive'}
            </h1>
            <p className="text-4xl md:text-6xl animate-pulse mb-12">Tears</p>
            <p className="text-3xl md:text-5xl text-[#D4AF37]/80 mb-8">
              {language === 'zh' ? '2025 年，全世界已落泪' : 'In 2025, the world has shed'}
            </p>
            <p className="text-8xl md:text-9xl font-bold text-white font-mono">
              {totalTears.toLocaleString()}
            </p>
            {language === 'en' && <p className="text-4xl text-[#D4AF37]/80 mt-4">tears</p>}
          </div>

          {/* 排行榜 */}
          <div className="mb-32">
            <h2 className="text-4xl md:text-6xl text-[#D4AF37] text-center mb-16 tracking-widest">
              {language === 'zh' ? '最乡愁国家排行' : 'Most Homesick Countries'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {topCountries.map((c, i) => (
                <div
                  key={i}
                  className="bg-black/50 backdrop-blur border border-[#D4AF37]/30 rounded-2xl p-8 flex justify-between items-center hover:border-[#D4AF37] transition-all"
                >
                  <span className="text-3xl md:text-4xl font-light">{i + 1}. {c.name}</span>
                  <span className="text-4xl md:text-5xl font-bold text-[#D4AF37]">
                    {c.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 导出按钮 */}
          <div className="text-center mt-32">
            <button
              onClick={exportReport}
              className="px-16 py-8 bg-[#D4AF37] text-black text-2xl font-bold uppercase tracking-widest rounded-3xl hover:bg-white transition-all shadow-2xl hover:scale-105"
            >
              {language === 'zh' ? '导出 2025 全球乡愁报告' : 'Export 2025 Global Homesickness Report'}
            </button>
            <p className="text-[#D4AF37]/60 text-lg mt-8">
              {language === 'zh' ? '每一滴泪，都在逆流向北' : 'Every tear flows northward'}
            </p>
          </div>
        </div>
      </div>

      {/* 底部渐变遮罩 */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black to-transparent pointer-events-none" />
    </div>
  );
}
