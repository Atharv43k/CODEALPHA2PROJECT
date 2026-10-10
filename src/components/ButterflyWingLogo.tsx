import React from 'react';

interface ButterflyWingLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  stage?: number; // 1: Chrysalis, 2: Awakening, 3: Emergence, 4: Metamorphosis
  animated?: boolean;
}

export const ButterflyWingLogo: React.FC<ButterflyWingLogoProps> = ({
  className = '',
  size = 'md',
  stage = 4,
  animated = true,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // Stage-based gradient IDs & accents
  const wingOpacity = stage === 1 ? 0.45 : stage === 2 ? 0.7 : stage === 3 ? 0.85 : 1;
  const spreadAngle = stage === 1 ? 'scale-75' : stage === 2 ? 'scale-90' : 'scale-100';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}
      aria-label="Metamorphosis Butterfly Emblem"
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-full blur-xl bg-gradient-to-tr from-violet-600/30 via-indigo-500/20 to-cyan-400/25 ${
          animated ? 'animate-pulse' : ''
        }`}
        style={{ animationDuration: '4s' }}
      />

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 w-full h-full transition-transform duration-700 ${spreadAngle}`}
      >
        <defs>
          <linearGradient id="primaryWingGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="40%" stopColor="#6366f1" />
            <stop offset="85%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>

          <linearGradient id="innerWingGrad" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="coreSpineGrad" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Left Upper Wing */}
        <path
          d="M 50 48 C 38 28, 14 20, 10 36 C 6 50, 22 64, 48 56 Z"
          fill="url(#primaryWingGrad)"
          fillOpacity={wingOpacity}
          filter="url(#softGlow)"
        />

        {/* Left Lower Wing */}
        <path
          d="M 49 57 C 32 60, 16 68, 24 82 C 32 92, 45 78, 50 63 Z"
          fill="url(#innerWingGrad)"
          fillOpacity={wingOpacity * 0.85}
        />

        {/* Right Upper Wing */}
        <path
          d="M 50 48 C 62 28, 86 20, 90 36 C 94 50, 78 64, 52 56 Z"
          fill="url(#primaryWingGrad)"
          fillOpacity={wingOpacity}
          filter="url(#softGlow)"
        />

        {/* Right Lower Wing */}
        <path
          d="M 51 57 C 68 60, 84 68, 76 82 C 68 92, 55 78, 50 63 Z"
          fill="url(#innerWingGrad)"
          fillOpacity={wingOpacity * 0.85}
        />

        {/* Geometric Wing Facet Lines (Evolutionary Lattice) */}
        <path
          d="M 50 48 L 22 34 M 50 52 L 20 48 M 50 56 L 28 72 M 50 48 L 78 34 M 50 52 L 80 48 M 50 56 L 72 72"
          stroke="#ffffff"
          strokeOpacity="0.4"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* Central Metamorphic Core / Chrysalis Spine */}
        <ellipse cx="50" cy="52" rx="2.5" ry="16" fill="url(#coreSpineGrad)" />

        {/* Antennae */}
        <path
          d="M 49 38 C 46 28, 40 22, 34 20 M 51 38 C 54 28, 60 22, 66 20"
          stroke="#e0e7ff"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Radiant Apex Light */}
        <circle cx="50" cy="36" r="2.2" fill="#38bdf8" filter="url(#softGlow)" />
        <circle cx="34" cy="20" r="1.2" fill="#06b6d4" />
        <circle cx="66" cy="20" r="1.2" fill="#a855f7" />
      </svg>
    </div>
  );
};
