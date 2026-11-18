'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { formatIstanbulTime } from '@/lib/calculations';
import { Clock, Sparkles } from 'lucide-react';

export default function DemoBanner({ onOpenTimeModal }: { onOpenTimeModal?: () => void }) {
  const { currentDemoTime, clockOffsetSeconds } = useStore();

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-3 sm:px-6 border-b border-slate-800 flex items-center justify-between gap-2 select-none z-50">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold text-[11px] border border-teal-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          Demo • Örnek veriler
        </span>
        <span className="hidden sm:inline text-slate-400 text-[11px]">
          Gerçek rezervasyon veya yer garantisi verilmez. Kurgusal pilot sistem.
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Saati Göstergesi */}
        <button
          onClick={onOpenTimeModal}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors border border-slate-700 cursor-pointer"
          title="Demo saatini ileri al veya sıfırla"
        >
          <Clock className="w-3 h-3 text-teal-400" />
          <span className="font-mono font-semibold text-teal-300">
            {formatIstanbulTime(currentDemoTime)}
          </span>
          {clockOffsetSeconds !== 0 && (
            <span className="text-[10px] text-amber-400 hidden xs:inline font-mono">
              (+{Math.round(clockOffsetSeconds / 60)} dk)
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
