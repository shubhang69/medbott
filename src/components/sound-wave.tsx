'use client';

import { useEffect, useState } from 'react';

export function SoundWave() {
  const [barHeights, setBarHeights] = useState<number[]>([]);

  useEffect(() => {
    // Generate initial random heights
    const initialHeights = Array.from({ length: 40 }, () => Math.floor(Math.random() * 80) + 10);
    setBarHeights(initialHeights);

    // Animate the bars
    const interval = setInterval(() => {
      setBarHeights(heights =>
        heights.map(() => Math.floor(Math.random() * 80) + 10)
      );
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-1 opacity-20">
      {barHeights.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-primary transition-all duration-150"
          style={{
            height: `${height}px`,
          }}
        />
      ))}
    </div>
  );
}
