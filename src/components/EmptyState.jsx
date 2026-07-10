import React from 'react';
import useStore from '../store/useStore';

const EmptyState = () => {
  const { openAddModal } = useStore();

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-16 bg-ag-surface/50 border border-ag-border rounded-3xl max-w-lg mx-auto fade-in-up mt-8">
      {/* Astronaut Floating Vector Illustration */}
      <div className="w-48 h-48 mb-8 flex items-center justify-center float">
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Space Stars */}
          <circle cx="20" cy="30" r="1.5" fill="#A855F7" className="opacity-60" />
          <circle cx="120" cy="40" r="1.0" fill="#7C3AED" className="opacity-80" />
          <circle cx="15" cy="110" r="2.0" fill="#F8F8FF" className="opacity-40" />
          <circle cx="105" cy="100" r="1.5" fill="#A855F7" className="opacity-70" />
          <circle cx="75" cy="15" r="1.0" fill="#F8F8FF" className="opacity-90" />

          {/* Astronaut Body Group */}
          <g transform="translate(10, 10)">
            {/* Suit Lines / Tether */}
            <path
              d="M30 90 C 20 110, 5 95, 0 120"
              stroke="#7C3AED"
              strokeWidth="2"
              strokeDasharray="4 4"
              fill="none"
            />
            
            {/* Limbs */}
            {/* Left Arm */}
            <line x1="45" y1="60" x2="25" y2="45" stroke="#F8F8FF" strokeWidth="6" strokeLinecap="round" />
            {/* Right Arm */}
            <line x1="75" y1="60" x2="95" y2="55" stroke="#F8F8FF" strokeWidth="6" strokeLinecap="round" />
            {/* Left Leg */}
            <line x1="50" y1="85" x2="40" y2="105" stroke="#F8F8FF" strokeWidth="6" strokeLinecap="round" />
            {/* Right Leg */}
            <line x1="70" y1="85" x2="80" y2="100" stroke="#F8F8FF" strokeWidth="6" strokeLinecap="round" />

            {/* Torso */}
            <rect
              x="45"
              y="50"
              width="30"
              height="38"
              rx="8"
              fill="#F8F8FF"
              stroke="#1E1E2E"
              strokeWidth="2"
            />
            
            {/* Chest Control Panel */}
            <rect x="52" y="58" width="16" height="12" rx="2" fill="#7C3AED" />
            <circle cx="56" cy="64" r="1.5" fill="#10B981" />
            <circle cx="64" cy="64" r="1.5" fill="#EF4444" />

            {/* Astronaut Helmet */}
            <circle
              cx="60"
              y="32"
              r="20"
              fill="#F8F8FF"
              stroke="#1E1E2E"
              strokeWidth="2"
            />
            
            {/* Dark Visor (Glassmorphism Purple) */}
            <rect
              x="48"
              y="22"
              width="24"
              height="16"
              rx="6"
              fill="#12121A"
              stroke="#A855F7"
              strokeWidth="2"
            />
            {/* Visor Glare */}
            <path
              d="M52 26 L64 26"
              stroke="#F8F8FF"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="opacity-70"
            />
          </g>
        </svg>
      </div>

      {/* Text Info */}
      <h2 className="text-2xl font-extrabold text-ag-white mb-3">
        Nothing tracked yet.
      </h2>
      <p className="text-sm text-ag-muted leading-relaxed mb-8 max-w-sm">
        Add your first product URL from Amazon, Flipkart, Myntra, or Ajio, and let Antigravity fight the pull of high prices.
      </p>

      {/* Button CTA */}
      <button
        onClick={openAddModal}
        className="btn-primary space-x-2 py-3 px-6 shadow-lg shadow-ag-purple/20"
      >
        <span>Track Your First Product</span>
        <span className="text-lg">→</span>
      </button>
    </div>
  );
};

export default EmptyState;
