'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Reservation } from '@/types';
import {
  formatIstanbulDateTime,
  isExitOverdue,
  getExitOverdueMinutes
} from '@/lib/calculations';
import QRCodeCard from '@/components/QRCodeCard';
import RoleGuard from '@/components/RoleGuard';
import {
  CalendarCheck,
  QrCode,
  XCircle,
  Clock,
  Zap,
  AlertTriangle,
  ArrowRight,
  X
} from 'lucide-react';

export default function RezervasyonlarimPage() {
  return (
    <RoleGuard allowedRoles={['surucu', 'demo_yoneticisi']}>
      <RezervasyonlarimContent />
    </RoleGuard>
  );
}

function RezervasyonlarimContent() {
  const { reservations, lots, cancelReservation, currentUser, currentDemoTime } = useStore();
  const [selectedQRReservation, setSelectedQRReservation] = useState<Reservation | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const myReservations = reservations.filter((r) => {
    if (currentUser.rol === 'demo_yoneticisi') return true;
    return r.user_id === currentUser.id;
  });

  const handleCancel = (id: string) => {
    const res = cancelReservation(id);
    if (!res.success) {
      setCancelError(res.error || 'İptal edilemedi.');
    } else {
      setCancelTargetId(null);
      setCancelError(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Rezervasyonlarım
            </h1>
            <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {currentUser.ad}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Otopark ve şarj rezervasyonlarınızın durumunu ve QR kodlarınızı yönetin.
          </p>
        </div>

        <Link
          href="/rezervasyon/yeni"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-xs transition-colors shrink-0 min-h-[42px]"
        >
          <span>Yeni Rezervasyon</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Toplam Rezervasyon
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900">{myReservations.length}</div>
          <span className="text-[10px] text-slate-500 truncate block">Tüm kayıtlar</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-teal-200 bg-teal-50/20 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-teal-800 block truncate">
            İçerideki Araç
          </span>
          <div className="mt-1 text-2xl font-black text-teal-700">
            {myReservations.filter((r) => r.durum === 'İÇERİDE').length}
          </div>
          <span className="text-[10px] text-teal-800 truncate block">Aktif park</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-800 block truncate">
            Onaylı / Bekleyen
          </span>
          <div className="mt-1 text-2xl font-black text-blue-600">
            {myReservations.filter((r) => r.durum === 'ONAYLI').length}
          </div>
          <span className="text-[10px] text-blue-800 truncate block">Giriş bekleniyor</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800 block truncate">
            Tamamlanan
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-600">
            {myReservations.filter((r) => r.durum === 'TAMAMLANDI').length}
          </div>
          <span className="text-[10px] text-emerald-800 truncate block">Geçmiş ziyaret</span>
        </div>
      </div>

      {cancelError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{cancelError}</span>
          </div>
          <button onClick={() => setCancelError(null)} className="text-rose-600 hover:text-rose-900 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rezervasyon Listesi */}
      {myReservations.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-8 sm:p-10 text-center space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <CalendarCheck className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Henüz Bir Rezervasyonunuz Yok</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Akıllı şehir otoparklarında yerinizi hemen ayırtarak beklemeden park edebilirsiniz.
            </p>
          </div>
          <Link
            href="/rezervasyon/yeni"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors min-h-[42px]"
          >
            <span>İlk Rezervasyonunuzu Oluşturun</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {myReservations.map((res) => {
            const lot = lots.find(l => l.id === res.lot_id);
            const isOverdue = isExitOverdue(res, currentDemoTime);
            const overdueMins = getExitOverdueMinutes(res, currentDemoTime);

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Durum Rozeti ve Kod */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {res.durum === 'ONAYLI' && (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>ONAYLI • Giriş Bekliyor</span>
                      </span>
                    )}

                    {res.durum === 'İÇERİDE' && !isOverdue && (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>İÇERİDE • Park Halinde</span>
                      </span>
                    )}

                    {res.durum === 'İÇERİDE' && isOverdue && (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>GECİKMEDE (+{overdueMins} dk)</span>
                      </span>
                    )}

                    {res.durum === 'TAMAMLANDI' && (
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        TAMAMLANDI • Çıkış Yapıldı
                      </span>
                    )}

                    {res.durum === 'İPTAL' && (
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        İPTAL EDİLDİ
                      </span>
                    )}

                    {res.durum === 'GELMEDİ' && (
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        GELMEDİ • Süre Aşımı
                      </span>
                    )}

                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{res.kod}
                    </span>
                  </div>

                  {/* Tesis ve Zaman Bilgileri */}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                      {lot?.ad || res.lot_id}
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                      <span>Giriş: <strong>{formatIstanbulDateTime(res.baslangic)}</strong></span>
                      <span>•</span>
                      <span>Çıkış: <strong>{formatIstanbulDateTime(res.bitis)}</strong></span>
                      {res.plaka && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-semibold text-slate-800">Plaka: {res.plaka}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {res.soket_tipi && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] sm:text-[11px] font-semibold">
                      <Zap className="w-3 h-3 text-teal-600 shrink-0" />
                      <span>{res.soket_tipi} Şarj Rezervasyonu</span>
                    </div>
                  )}
                </div>

                {/* Sağ Butonlar */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => setSelectedQRReservation(res)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer min-h-[38px]"
                  >
                    <QrCode className="w-4 h-4 text-slate-700 shrink-0" />
                    <span>QR Kod</span>
                  </button>

                  {res.durum === 'ONAYLI' && (
                    <button
                      onClick={() => setCancelTargetId(res.id)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer min-h-[38px]"
                    >
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>İptal Et</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR KOD MODALI */}
      {selectedQRReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedQRReservation(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-1"
              aria-label="Kapat"
            >
              <X className="w-6 h-6" />
            </button>
            <QRCodeCard
              reservation={selectedQRReservation}
              lot={lots.find(l => l.id === selectedQRReservation.lot_id)}
            />
          </div>
        </div>
      )}

      {/* İPTAL ONAY MODALI */}
      {cancelTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900">Rezervasyonu İptal Etmek İstiyor Musunuz?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                İptal edildiğinde ayrılan park kapasitesi diğer sürücüler için hemen serbest bırakılır.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setCancelTargetId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[42px]"
              >
                Vazgeç
              </button>
              <button
                onClick={() => handleCancel(cancelTargetId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs min-h-[42px]"
              >
                Evet, İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
