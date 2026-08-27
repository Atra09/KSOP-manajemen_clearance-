import { useState, useEffect } from 'react';

const BACKGROUND_IMAGES = [
  '/images/background1.jpg',
  '/images/background2.jpg'
];

export default function AuthLayout({ children }) {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-900">
      {/* Background Images with smooth crossfade transition (no blur) */}
      {BACKGROUND_IMAGES.map((imgUrl, index) => (
        <div
          key={imgUrl}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            index === currentBgIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${imgUrl}')` }}
        />
      ))}

      {/* Subtle overlay without blur to keep photo crisp & sharp */}
      <div className="absolute inset-0 bg-slate-950/25"></div>

      {/* Centered content box */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}