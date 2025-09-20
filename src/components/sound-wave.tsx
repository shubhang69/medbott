'use client';

export function SoundWave() {
  return (
    <div className="flex items-center justify-center space-x-1.5 opacity-15">
      {Array.from({ length: 21 }).map((_, i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-primary"
          style={{
            height: `${Math.floor(Math.random() * 80) + 20}px`,
            width: `6px`,
            animation: `sound-wave 1.5s ease-in-out ${i * 0.1}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
