// components/ImageWithFallback.tsx
import React, { useState, useEffect } from 'react';

interface Props {
  srcs: string[]; // 图片 URL 数组，优先级从左到右
  alt: string;
  className?: string;
  fallbackPlaceholder?: string; // 失败时的占位文本
}

const ImageWithFallback: React.FC<Props> = ({ srcs, alt, className = '', fallbackPlaceholder = '图片加载失败' }) => {
  const [imgSrc, setImgSrc] = useState(srcs[0]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setLoaded(true);
      setError(false);
    };
    img.onerror = () => {
      setError(true);
      // 切换下一个 URL
      const nextSrc = srcs.find(s => s !== imgSrc);
      if (nextSrc) setImgSrc(nextSrc);
      else setImgSrc(''); // 所有失败，用占位
    };
    img.src = imgSrc;
  }, [imgSrc, srcs]);

  if (error && !imgSrc) {
    return <div className={`w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg ${className}`}>
      {fallbackPlaceholder}
    </div>;
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`${className} w-full h-96 object-cover rounded-lg ${loaded ? '' : 'animate-pulse bg-gray-200'}`}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  );
};

export default ImageWithFallback;
