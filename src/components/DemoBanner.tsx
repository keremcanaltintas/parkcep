'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { formatIstanbulTime } from '@/lib/calculations';
import { Clock } from 'lucide-react';

export default function DemoBanner({ onOpenTimeModal }: { onOpenTimeModal?: () => void }) {
  const { currentDemoTime, clockOffsetSeconds } = useStore();

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-1 px-3 sm:px-6 border-b border-slate-800 flex items-center justify-between gap-2 select-none z-50">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold text-[10px] sm:text-[11px] border border-teal-500/30 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          <span>Demo</span>
        </span>
        <span className="text-slate-400 text-[10px] sm:text-[11px] truncate">
          <span className="hidden sm:inline">Kurgusal akıllı şehir pilot sistemi • </span>Örnek veriler
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenTimeModal}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-200 text-[10px] sm:text-[11px] transition-colors border border-slate-700 cursor-pointer min-h-[26px]"
          title="Demo saatini ileri al veya sıfırla"
        >
          <Clock className="w-3 h-3 text-teal-400 shrink-0" />
          <span className="font-mono font-semibold text-teal-300">
            {formatIstanbulTime(currentDemoTime)}
          </span>
          {clockOffsetSeconds !== 0 && (
            <span className="text-[9px] text-amber-400 hidden xs:inline font-mono">
              (+{Math.round(clockOffsetSeconds / 60)}dk)
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
