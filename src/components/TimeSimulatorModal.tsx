'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatIstanbulTime, formatIstanbulDate } from '@/lib/calculations';
import { Clock, RotateCcw, FastForward, CheckCircle2, X, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TimeSimulatorModal({ isOpen, onClose }: Props) {
  const { currentDemoTime, clockOffsetSeconds, advanceClock, resetDemoData, currentUser } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [justAdvanced, setJustAdvanced] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdvance = (seconds: number, label: string) => {
    advanceClock(seconds);
    setJustAdvanced(label);
    setTimeout(() => setJustAdvanced(null), 2500);
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm truncate">Demo Zaman ve Durum Kontrolü</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Europe/Istanbul Simülatörü</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gövde - Dikey Kaydırılabilir */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Şu Anki Demo Saati Kartı */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-slate-500 block">
              Mevcut Uygulama Saati
            </span>
            <div className="mt-1 font-mono text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {formatIstanbulTime(currentDemoTime)}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
              {formatIstanbulDate(currentDemoTime)}
            </div>
            {clockOffsetSeconds !== 0 && (
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">
                Sistem saatinden {Math.round(clockOffsetSeconds / 60)} dakika ileride
              </div>
            )}
          </div>

          {justAdvanced && (
            <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] sm:text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Zaman başarıyla <strong>{justAdvanced}</strong> ileri alındı.</span>
            </div>
          )}

          {/* Hızlı Zaman İlerletme Butonları */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Zamanı İleri Al (Test İçin)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAdvance(15 * 60, '+15 Dakika')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs shadow-xs hover:border-teal-500 transition-all cursor-pointer min-h-[42px]"
              >
                <FastForward className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>+15 Dakika</span>
              </button>

              <button
                onClick={() => handleAdvance(60 * 60, '+1 Saat')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs shadow-xs hover:border-teal-500 transition-all cursor-pointer min-h-[42px]"
              >
                <FastForward className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>+1 Saat</span>
              </button>

              <button
                onClick={() => handleAdvance(4 * 3600, '+4 Saat')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs shadow-xs hover:border-teal-500 transition-all cursor-pointer min-h-[42px]"
              >
                <FastForward className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>+4 Saat</span>
              </button>

              <button
                onClick={() => handleAdvance(24 * 3600, '+1 Gün')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs shadow-xs hover:border-teal-500 transition-all cursor-pointer min-h-[42px]"
              >
                <FastForward className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>+1 Gün</span>
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 leading-tight">
              * Başlangıç +10 dk aşılınca onaylı kayıtlar <strong>GELMEDİ</strong> olur. Bitişi geçen araçlar <strong>GECİKMEDE</strong> uyarısı alır.
            </p>
          </div>

          <div className="border-t border-slate-200 pt-3">
            {/* Sıfırlama Bölümü */}
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 font-semibold text-xs transition-colors cursor-pointer min-h-[42px]"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Tüm Verileri Başlangıca Sıfırla</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">Sıfırlama Onayı</h4>
                    <p className="text-[10px] sm:text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                      Tüm test hareketleri temizlenecek; başlangıç durumuna (30 yer / 7 dolu / 1 kapalı / 22 boş) dönülecektir. Emin misiniz?
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleConfirmReset}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-xs"
                  >
                    Evet, Sıfırla
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alt bilgi */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="truncate">Rol: <strong className="text-slate-800">{currentUser.ad}</strong></span>
          <button
            onClick={onClose}
            className="text-teal-700 font-semibold hover:underline shrink-0 ml-2"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
