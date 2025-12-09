// src/pages/TearsArchive.tsx —— 全球泪水档案馆（2025终极版）
import React, { useState, useEffect } from 'react';
import { UI_TEXT } from '../constants';
import { useNavigate } from 'react-router-dom'; // 如果你用的是 Vite + React Router，确保已安装

interface TearDrop {
  id: number;
  country: string;
  city?: string;
  time: string;
  lat: number;
  lng: number;
}

const TearsArchive: React.FC = () => {
  const [tears, setTears] = useState<TearDrop[]>([]);
  const [selectedTear, setSelectedTear] = useState<TearDrop | null>(null);
  const [stats, setStats] = useState<{ country: string; count: number }[]>([]);
  const navigate = useNavigate();

  // 模拟从本地存储或 API 获取全球泪水数据（真实项目可用 localStorage 或 Firebase）
  useEffect(() => {
    const saved = localStorage.getItem('globalTears');
    if (saved) {
      const data = JSON.parse(saved);
      setTears(data);
      // 计算国家排行
      const countryCount = data.reduce((acc: any, t: TearDrop) => {
        acc[t.country] = (acc[t.country] || 0) + 1;
        return acc;
      }, {});
      const sorted = Object.entries(countryCount)
        .map(([country, count]) => ({ country, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setStats(sorted);
    }
  }, []);

  // 导出报告
  const exportReport = () => {
    const report = `
2025 全球乡愁报告
「为什么湘江北去？」

截至目前，全世界共落泪 ${tears.length.toLocaleString()} 次
最乡愁的国家：${stats[0]?.country || '未知'}（${stats[0]?.count || 0} 次）
最远的一滴泪来自：${tears[tears.length - 1]?.country || '未知'}
时间：${new Date().toLocaleString('zh-CN')}

每一滴泪，都在逆流向北。
因为世界上所有的水，都是湘江之水。

—— 献给所有离乡的人
`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2025_全球乡愁报告.txt';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-[#F5F0E6] overflow-hidden">
      {/* 背景：微弱粒子河流 */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-black via-[#0a0a0a] to-black"></div>
      </div>

      {/* 标题 */}
      <div className="absolute top-0 left-0 right-0 p-8 text-center z-10">
        <h1 className="text-5xl md:text-8xl font-serif text-[#D4AF37] tracking-widest gold-glow-text">
          全球泪水档案馆
        </h1>
        <p className="text-[#D4AF37]/70 text-lg mt-4 tracking-[0.4em] uppercase">
          2025 · {tears.length.toLocaleString()} 滴泪水已被记录
        </p>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 text-[#D4AF37] hover:text-white transition-colors uppercase tracking-widest text-sm"
        >
          ← 返回长河
        </button>
      </div>

      <div className="flex h-full pt-32">
        {/* 左侧：世界地图 + 泪滴标记（用简单 SVG 模拟） */}
        <div className="w-2/3 relative border-r border-[#D4AF37]/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-9xl animate-pulse mb-8">Tears</div>
              <p className="text-[#D4AF37]/60 text-xl">实时世界地图开发中...</p>
              <p className="text-sm mt-4">（未来将接入 Leaflet + 真实落点）</p>
            </div>
          </div>
          {/* 示例泪滴 */}
          {tears.slice(-20).map((tear, i) => (
            <div
              key={tear.id}
              className="absolute w-4 h-4 rounded-full bg-[#D4AF37]/60 animate-ping"
              style={{
                left: `${30 + (i % 10) * 6}%`,
                top: `${20 + Math.floor(i / 10) * 30}%`,
              }}
              onClick={() => setSelectedTear(tear)}
            />
          ))}
        </div>

        {/* 右侧：详情 + 排行榜 */}
        <div className="w-1/3 p-8 space-y-8 overflow-y-auto">
          {/* 选中泪滴详情 */}
          {selectedTear && (
            <div className="bg-black/60 border border-[#D4AF37]/30 rounded-2xl p-6 backdrop-blur">
              <div className="text-6xl mb-4">Tears</div>
              <div className="space-y-3 text-lg">
                <p><span className="text-[#D4AF37]">来自：</span> {selectedTear.country} {selectedTear.city && `· ${selectedTear.city}`}</p>
                <p><span className="text-[#D4AF37]">时间：</span> {selectedTear.time}</p>
                <p className="text-[#D4AF37]/70 italic">“这一刻，有人想家了。”</p>
              </div>
            </div>
          )}

          {/* 全球排行榜 */}
          <div>
            <h2 className="text-3xl text-[#D4AF37] mb-6">最乡愁国家排行</h2>
            <div className="space-y-3">
              {stats.map((s, i) => (
                <div key={i} className="flex justify-between items-center bg-black/40 px-4 py-3 rounded-lg border border-[#D4AF37]/20">
                  <span className="text-lg">{i + 1}. {s.country}</span>
                  <span className="text-2xl font-bold text-[#D4AF37]">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 导出按钮 */}
          <button
            onClick={exportReport}
            className="w-full py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-white transition-all rounded-xl"
          >
            导出 2025 全球乡愁报告
          </button>
        </div>
      </div>
    </div>
  );
};

export default TearsArchive;
