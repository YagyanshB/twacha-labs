'use client';

export default function SystemStatusTicker() {
  return (
    <div className="w-full border-t border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm py-2">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop: Single centered line */}
        <div className="hidden md:flex justify-center items-center gap-4 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>[ SYSTEM: OPERATIONAL ]</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>[ ENGINE: GPT-4O VISION ]</div>
          <span className="text-slate-300">|</span>
          <div>[ NEXT_BATCH: 14_FEB_2025 ]</div>
          <span className="text-slate-300">|</span>
          <div className="text-blue-600 font-semibold">[ SPOTS_REMAINING: 14/50 ]</div>
          <span className="text-slate-300">|</span>
          <div>[ AVG_LATENCY: 420MS ]</div>
        </div>

        {/* Mobile: Scrolling marquee */}
        <div className="md:hidden overflow-hidden">
          <div className="flex items-center gap-4 font-mono text-[10px] tracking-widest text-slate-500 uppercase animate-marquee whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>[ SYSTEM: OPERATIONAL ]</span>
            </div>
            <span className="text-slate-300">•</span>
            <div>[ ENGINE: GPT-4O VISION ]</div>
            <span className="text-slate-300">•</span>
            <div>[ NEXT_BATCH: 14_FEB_2025 ]</div>
            <span className="text-slate-300">•</span>
            <div className="text-blue-600 font-semibold">[ SPOTS_REMAINING: 14/50 ]</div>
            <span className="text-slate-300">•</span>
            <div>[ AVG_LATENCY: 420MS ]</div>
            {/* Duplicate for seamless loop */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>[ SYSTEM: OPERATIONAL ]</span>
            </div>
            <span className="text-slate-300">•</span>
            <div>[ ENGINE: GPT-4O VISION ]</div>
            <span className="text-slate-300">•</span>
            <div>[ NEXT_BATCH: 14_FEB_2025 ]</div>
            <span className="text-slate-300">•</span>
            <div className="text-blue-600 font-semibold">[ SPOTS_REMAINING: 14/50 ]</div>
            <span className="text-slate-300">•</span>
            <div>[ AVG_LATENCY: 420MS ]</div>
          </div>
        </div>
      </div>
    </div>
  );
}
