"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 z-50">
      {/* Outer glow ring */}
      <div className="relative flex items-center justify-center mb-8">
        <span className="absolute w-28 h-28 rounded-full bg-orange-500 opacity-10 animate-ping" />
        <span className="absolute w-20 h-20 rounded-full bg-orange-500 opacity-15 animate-ping [animation-delay:0.3s]" />

        {/* Spinner track */}
        <svg
          className="w-24 h-24 animate-spin"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="#1e293b"
            strokeWidth="6"
          />
          <path
            d="M48 8 A40 40 0 0 1 88 48"
            stroke="#f97316"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        {/* Center logo badge */}
        <div className="absolute flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500 text-white font-bold text-xl tracking-wider shadow-lg shadow-orange-500/30">
          RB
        </div>
      </div>

      {/* Brand name */}
      <h1 className="text-2xl font-bold text-slate-100 tracking-wide mb-2">
        BiteBot
      </h1>

      {/* Subtitle with animated dots */}
      <div className="flex items-center space-x-1.5 text-slate-400 text-sm font-medium">
        <span>Getting things ready</span>
        <div className="flex space-x-1 pt-0.5">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
        </div>
      </div>

      {/* Bottom online badge */}
      <div className="mt-6 flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-xs text-slate-400 font-medium">Connecting to server</span>
      </div>
    </div>
  );
}
