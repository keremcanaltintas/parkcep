'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { formatIstanbulTime } from '@/lib/calculations';
import { Wifi, BatteryMedium, Signal, Monitor, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: Props) {
  const { mobileFrameMode, toggleMobileFrameMode, currentDemoTime, resetDemoData } = useStore();

  if (!mobileFrameMode) {
    return <>{children}</>;
  }

  return (
    <div className="hidden md:flex flex-col items-center justify-center min-h-screen bg-slate-950 py-8 px-4 select-none">
      {/* Üst Sunum Kontrol Çubuğu */}
      <div className="mb-4 flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs shadow-xl">
        <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          Mobil Uygulama Sunum Modu (390 px)
        </span>
        <span className="text-slate-600">|</span>
        <button
          onClick={toggleMobileFrameMode}
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          <Monitor className="w-3.5 h-3.5 text-slate-400" />
          <span>Geniş Masaüstü Moduna Geç</span>
        </button>
      </div>

      {/* Telefon Gövdesi (390px standart mobil genişlik) */}
      <div className="relative w-[400px] h-[844px] bg-slate-900 rounded-[50px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-slate-700 ring-1 ring-slate-600 flex flex-col overflow-hidden">
        {/* Dynamic Island / Ahize Çentiği */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80 border border-slate-700 mr-1"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-950/80"></div>
        </div>

        {/* Ekran İç Alanı */}
        <div className="relative w-full h-full bg-[#F8FAFC] rounded-[38px] overflow-hidden flex flex-col select-text">
          {/* Durum Çubuğu */}
          <div className="pt-2 px-6 pb-1 bg-white border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-900 shrink-0 select-none">
            <span>{formatIstanbulTime(currentDemoTime)}</span>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          {/* Uygulama İçeriği (Kaydırılabilir alan) */}
          <div className="flex-1 overflow-y-auto pb-16 scrollbar-thin scrollbar-thumb-slate-300">
            {children}
          </div>

          {/* Home Göstergesi Çizgisi */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400/80 rounded-full z-50 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
