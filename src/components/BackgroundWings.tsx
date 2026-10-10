import React from 'react';

export const BackgroundWings: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#08070e]">
      {/* Deep Aurora Radial Gradients */}
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] rounded-full blur-[140px] opacity-25"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, #4c1d95 40%, transparent 75%)',
        }}
      />
      <div
        className="absolute top-[40%] -left-[10%] w-[800px] h-[600px] rounded-full blur-[160px] opacity-15"
        style={{
          background: 'radial-gradient(circle, #06b6d4 0%, #312e81 50%, transparent 80%)',
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-5%] w-[850px] h-[700px] rounded-full blur-[170px] opacity-20"
        style={{
          background: 'radial-gradient(circle, #8b5cf6 0%, #1e1b4b 60%, transparent 85%)',
        }}
      />

      {/* Subtle Geometric Wing Constellation Watermark */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-[0.035]"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 500 480 C 380 280, 140 200, 100 360 C 60 500, 220 640, 480 560 Z"
          stroke="#a855f7"
          strokeWidth="1.5"
        />
        <path
          d="M 500 480 C 620 280, 860 200, 900 360 C 940 500, 780 640, 520 560 Z"
          stroke="#06b6d4"
          strokeWidth="1.5"
        />
        <circle cx="500" cy="500" r="320" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="6 6" />
        <circle cx="500" cy="500" r="460" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="12 12" />
        <line x1="100" y1="500" x2="900" y2="500" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="4 8" />
        <line x1="500" y1="100" x2="500" y2="900" stroke="#818cf8" strokeWidth="0.5" strokeDasharray="4 8" />
      </svg>

      {/* Subtle Grid Veil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};
