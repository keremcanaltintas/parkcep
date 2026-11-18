'use client';

import React from 'react';
import { ParkingLot, LotOccupancySummary } from '@/types';
import { MapPin, Zap, ExternalLink, Navigation, Compass, Layers, Info } from 'lucide-react';
import { formatKurusToTL } from '@/lib/calculations';

interface Props {
  lots: ParkingLot[];
  summaries: Record<string, LotOccupancySummary>;
  selectedLotId?: string;
  onSelectLot: (lotId: string) => void;
}

export default function InteractiveMap({
  lots,
  summaries,
  selectedLotId,
  onSelectLot
}: Props) {
  // Koordinatların harita SVG düzlemine normalize edilmiş konumları (Kadıköy, Üsküdar, Beşiktaş)
  // Beşiktaş: Avrupa Yakası (Üst sol / orta)
  // Üsküdar: Anadolu Yakası (Orta sağ)
  // Kadıköy: Anadolu Yakası (Alt sağ)
  const markerPositions: Record<string, { x: number; y: number; side: string }> = {
    kampus: { x: 38, y: 32, side: 'Avrupa (Beşiktaş)' },
    aktarma: { x: 62, y: 46, side: 'Anadolu (Üsküdar)' },
    merkez: { x: 68, y: 68, side: 'Anadolu (Kadıköy)' }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] bg-[#E2E8F0] rounded-2xl overflow-hidden border border-slate-300 shadow-inner select-none">
      {/* Harita Arka Planı (SVG İstanbul Boğazı, Sahil Şeridi ve Yollar) */}
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#CBD5E1" strokeWidth="0.15" />
          </pattern>
        </defs>

        {/* Kara Alanı (Zemin) */}
        <rect width="100" height="100" fill="url(#landGrad)" />
        <rect width="100" height="100" fill="url(#grid)" opacity="0.6" />

        {/* İstanbul Boğazı Su Yolu Eğrisi */}
        <path
          d="M 52 0 
             C 48 15, 45 28, 48 38 
             C 51 48, 55 52, 48 65 
             C 42 76, 25 82, 0 85 
             L 0 100 L 100 100 L 100 0 Z"
          fill="url(#waterGrad)"
          opacity="0.9"
        />

        {/* Marmara Denizi / Kadıköy Sahil Koyu */}
        <path
          d="M 48 65 
             C 42 76, 30 82, 0 85 
             L 0 100 L 70 100 
             C 65 85, 58 75, 48 65 Z"
          fill="url(#waterGrad)"
          opacity="0.95"
        />

        {/* 15 Temmuz Şehitler Köprüsü (Beşiktaş - Üsküdar bağlantısı) */}
        <line
          x1="41"
          y1="34"
          x2="59"
          y2="39"
          stroke="#94A3B8"
          strokeWidth="0.8"
          strokeDasharray="1,0.5"
        />
        <text x="50" y="35" fontSize="2" fill="#64748B" textAnchor="middle" transform="rotate(16, 50, 35)">
          Boğaziçi Köprüsü
        </text>

        {/* Marmaray Denizaltı Tüneli */}
        <path
          d="M 32 58 C 45 56, 55 50, 62 46"
          fill="none"
          stroke="#0D9488"
          strokeWidth="0.5"
          strokeDasharray="0.8,0.8"
        />

        {/* Ana Arter Yollar */}
        <path
          d="M 10 10 Q 30 25 38 32 T 32 58"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="0.9"
        />
        <path
          d="M 62 46 Q 66 58 68 68 T 85 90"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="0.9"
        />

        {/* Bölge Etiketleri */}
        <text x="26" y="24" fontSize="3" fontWeight="bold" fill="#64748B" letterSpacing="0.2">
          BEŞİKTAŞ
        </text>
        <text x="74" y="42" fontSize="3" fontWeight="bold" fill="#64748B" letterSpacing="0.2">
          ÜSKÜDAR
        </text>
        <text x="78" y="72" fontSize="3" fontWeight="bold" fill="#64748B" letterSpacing="0.2">
          KADIKÖY
        </text>
        <text x="20" y="92" fontSize="2.8" fontWeight="600" fill="#2563EB" opacity="0.6">
          Marmara Denizi
        </text>
        <text x="54" y="18" fontSize="2.5" fontWeight="600" fill="#2563EB" opacity="0.6" transform="rotate(70, 54, 18)">
          İstanbul Boğazı
        </text>
      </svg>

      {/* Harita Bilgi Rozeti */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-2 text-xs font-medium text-slate-700">
        <Compass className="w-4 h-4 text-teal-600" />
        <span>Örnek İstanbul Pilot Bölgesi</span>
      </div>

      {/* Harita Katman Kontrolü */}
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>3 Tesis Aktif</span>
      </div>

      {/* İNTERAKTİF İŞARETÇİLER (MARKERS) */}
      {lots.map((lot) => {
        const pos = markerPositions[lot.id] || { x: 50, y: 50, side: '' };
        const isSelected = selectedLotId === lot.id;
        const summary = summaries[lot.id];
        const bosYer = summary ? summary.fiziksel_bos_yer : 0;
        const isAvailable = bosYer > 0;

        return (
          <div
            key={lot.id}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            className="absolute z-20 transition-all duration-300"
          >
            <div className="relative group">
              {/* Seçili veya hover halkası */}
              {isSelected && (
                <span className="absolute -inset-3 rounded-full bg-teal-400/30 animate-ping pointer-events-none" />
              )}

              {/* Tıklanabilir Pin Düğmesi */}
              <button
                onClick={() => onSelectLot(lot.id)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl shadow-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-teal-400 scale-110 shadow-teal-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200 hover:border-teal-500 hover:scale-105'
                }`}
              >
                {/* İkon */}
                <div
                  className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-teal-500 text-slate-900 font-bold'
                      : isAvailable
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>

                {/* Metin ve Boş Yer */}
                <div className="text-left pr-1">
                  <div className="text-[11px] font-bold leading-tight flex items-center gap-1">
                    <span>{lot.ad.replace('ParkCep ', '')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className={`font-semibold ${isSelected ? 'text-teal-300' : 'text-slate-600'}`}>
                      {formatKurusToTL(lot.saatlik_ucret_kurus)}/saat
                    </span>
                    <span className="text-slate-300">•</span>
                    <span
                      className={`font-bold ${
                        isAvailable ? (isSelected ? 'text-emerald-300' : 'text-emerald-700') : 'text-rose-600'
                      }`}
                    >
                      {bosYer > 0 ? `${bosYer} Boş` : 'Dolu'}
                    </span>
                  </div>
                </div>
              </button>

              {/* Hover / Tıklama Bilgi Kartı */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 pointer-events-none transition-all duration-200 z-30 ${
                  isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="font-bold text-xs text-slate-900">{lot.ad}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {lot.ornek_bolge}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mb-2">
                  {summary?.doluluk_yuzdesi === 'Hizmet dışı'
                    ? 'Hizmet Dışı'
                    : `%${summary?.doluluk_yuzdesi || 0} Fiziksel Dolu`}
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                  <span className="text-teal-700 font-semibold">Tıklayarak incele</span>
                  <span className="text-slate-500">24 Saat Açık</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Alt Harita Bilgi Çubuğu & Dış Harita Linki */}
      <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="text-slate-600 truncate text-[11px]">
            İşaretçilere tıklayarak otopark detayına gidebilir veya filtreleyebilirsiniz.
          </span>
        </div>
        {selectedLotId && (
          <a
            href={`https://maps.google.com/?q=${lots.find(l => l.id === selectedLotId)?.lat},${lots.find(l => l.id === selectedLotId)?.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 shrink-0"
          >
            <span>Dış Haritada Aç</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
