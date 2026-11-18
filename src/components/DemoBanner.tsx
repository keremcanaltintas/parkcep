'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { formatIstanbulTime, formatIstanbulDate } from '@/lib/calculations';
import { AlertTriangle, Clock, RotateCcw, Smartphone, Monitor } from 'lucide-react';

export default function DemoBanner({ onOpenTimeModal }: { onOpenTimeModal?: () => void }) {
  const { currentDemoTime, clockOffsetSeconds, mobileFrameMode, toggleMobileFrameMode } = useStore();

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-3 sm:px-4 border-b border-slate-800 flex items-center justify-between gap-2 select-none z-50">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold text-[11px] border border-teal-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          Demo • Örnek veriler
        </span>
        <span className="hidden sm:inline text-slate-400 text-[11px]">
          Gerçek rezervasyon veya yer garantisi verilmez.
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Saati Göstergesi */}
        <button
          onClick={onOpenTimeModal}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors border border-slate-700 cursor-pointer"
          title="Demo saatini ileri al veya sıfırla"
        >
          <Clock className="w-3 h-3 text-teal-400" />
          <span className="font-mono font-medium text-teal-300">
            {formatIstanbulTime(currentDemoTime)}
          </span>
          {clockOffsetSeconds !== 0 && (
            <span className="text-[10px] text-amber-400 hidden xs:inline">
              (+{Math.round(clockOffsetSeconds / 60)} dk)
            </span>
          )}
        </button>

        {/* Mobil Çerçeve Toggle (Desktop ekranlarda telefon mock-up görünümü sunar) */}
        <button
          onClick={toggleMobileFrameMode}
          className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors border ${
            mobileFrameMode
              ? 'bg-teal-600 text-white border-teal-500 font-medium'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Mobil telefon önizleme modunu aç/kapat"
        >
          {mobileFrameMode ? (
            <>
              <Monitor className="w-3 h-3" />
              <span>Geniş Ekran</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3" />
              <span>Mobil Görünüm</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
