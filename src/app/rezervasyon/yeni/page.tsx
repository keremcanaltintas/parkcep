'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { SpaceType, SocketType, Reservation } from '@/types';
import {
  calculateParkingPriceKurus,
  formatKurusToTL,
  formatIstanbulTime,
  formatIstanbulDateTime
} from '@/lib/calculations';
import QRCodeCard from '@/components/QRCodeCard';
import {
  Car,
  Zap,
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

function YeniRezervasyonForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLot = searchParams.get('lot') || 'merkez';
  const preselectedTur = (searchParams.get('tur') as SpaceType) || 'standart';

  const { lots, spaces, chargers, createReservation, currentDemoTime, currentUser } = useStore();

  const [selectedLotId, setSelectedLotId] = useState<string>(preselectedLot);
  const [selectedTur, setSelectedTur] = useState<SpaceType>(preselectedTur);
  const [selectedSocket, setSelectedSocket] = useState<SocketType>('CCS2');
  const [startOffsetMinutes, setStartOffsetMinutes] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [plaka, setPlaka] = useState<string>('34 PC 101');
  const [erisilebilirBeyan, setErisilebilirBeyan] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);

  const selectedLot = useMemo(() => lots.find(l => l.id === selectedLotId), [lots, selectedLotId]);

  const availableSockets = useMemo(() => {
    if (!selectedLot) return [];
    if (selectedLot.id === 'kampus') return ['Type 2'] as SocketType[];
    return ['CCS2'] as SocketType[];
  }, [selectedLot]);

  const calculatedStart = useMemo(() => {
    return new Date(currentDemoTime.getTime() + startOffsetMinutes * 60 * 1000);
  }, [currentDemoTime, startOffsetMinutes]);

  const calculatedEnd = useMemo(() => {
    return new Date(calculatedStart.getTime() + durationMinutes * 60 * 1000);
  }, [calculatedStart, durationMinutes]);

  const priceInfo = useMemo(() => {
    if (!selectedLot) return { hoursCharged: 2, minutes: 120, totalKurus: 0 };
    return calculateParkingPriceKurus(calculatedStart, calculatedEnd, selectedLot.saatlik_ucret_kurus);
  }, [calculatedStart, calculatedEnd, selectedLot]);

  const chargeRate = useMemo(() => {
    if (selectedTur !== 'sarjli' || !selectedLot) return null;
    const charger = chargers.find(c => {
      const sp = spaces.find(s => s.id === c.space_id && s.lot_id === selectedLot.id);
      return sp !== undefined;
    });
    return charger ? charger.kWh_bedeli_kurus : null;
  }, [selectedTur, selectedLot, chargers, spaces]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedTur === 'erisilebilir' && !erisilebilirBeyan) {
      setErrorMessage('Erişilebilir park yeri için ihtiyaç beyanı onaylanmalıdır.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Rezervasyonu oluşturmak için gecikme ve iptal koşullarını onaylamalısınız.');
      return;
    }

    setIsLoading(true);

    try {
      const idempotencyKey = `idemp-${currentUser.id}-${selectedLotId}-${calculatedStart.getTime()}`;

      const res = createReservation({
        lotId: selectedLotId,
        tur: selectedTur,
        start: calculatedStart,
        end: calculatedEnd,
        plaka: plaka.trim().toUpperCase(),
        soketTipi: selectedTur === 'sarjli' ? selectedSocket : undefined,
        erisilebilirBeyan: selectedTur === 'erisilebilir' ? erisilebilirBeyan : undefined,
        idempotencyKey
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Rezervasyon oluşturulamadı (Kapasite çatışması).');
      } else if (res.reservation) {
        setCreatedReservation(res.reservation);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (createdReservation) {
    return (
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-75">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Rezervasyon Oluşturuldu
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Yeriniz Ayrıldı!</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Girişte bu kodu görevliye göstererek veya QR kodu okutarak otoparka giriş yapabilirsiniz.
          </p>
        </div>

        <QRCodeCard reservation={createdReservation} lot={selectedLot} />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-2">
          <Link
            href="/rezervasyonlarim"
            className="flex-1 text-center py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors min-h-[44px] flex items-center justify-center"
          >
            Rezervasyonlarım Sayfasına Git
          </Link>
          <button
            onClick={() => {
              setCreatedReservation(null);
              setTermsAccepted(false);
            }}
            className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors min-h-[44px]"
          >
            Yeni Rezervasyon Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div>
        <Link
          href="/kesfet"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Keşfet Ekranına Dön</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Yeni Otopark & Şarj Rezervasyonu
        </h1>
        <p className="text-xs text-slate-500">
          İstediğiniz zaman aralığı ve park türünü seçerek yerinizi garanti altına alın.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xs space-y-4 sm:space-y-5">
        {/* 1. Tesis Seçimi */}
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            1. Otopark Tesisi Seçimi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {lots.map((lot) => {
              const isSelected = selectedLotId === lot.id;
              return (
                <button
                  type="button"
                  key={lot.id}
                  onClick={() => {
                    setSelectedLotId(lot.id);
                    if (lot.id === 'kampus') setSelectedSocket('Type 2');
                    else setSelectedSocket('CCS2');
                  }}
                  className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer min-h-[64px] ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 text-slate-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{lot.ad.replace('ParkCep ', '')}</div>
                  <div className="text-[10px] sm:text-[11px] text-teal-700 mt-0.5 truncate">{lot.ornek_bolge}</div>
                  <div className="text-xs font-extrabold text-slate-900 mt-1.5">
                    {formatKurusToTL(lot.saatlik_ucret_kurus)} <span className="text-[10px] text-slate-500 font-normal">/saat</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Park Türü Seçimi */}
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            2. Park Yeri Türü
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSelectedTur('standart')}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[60px] ${
                selectedTur === 'standart'
                  ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Car className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-[10px] sm:text-xs text-center leading-tight">Standart</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTur('erisilebilir')}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[60px] ${
                selectedTur === 'erisilebilir'
                  ? 'bg-blue-700 text-white border-blue-700 font-bold shadow-xs'
                  : 'bg-white hover:bg-blue-50/50 border-slate-200 text-slate-700'
              }`}
            >
              <Accessibility className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-[10px] sm:text-xs text-center leading-tight">Erişilebilir</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTur('sarjli')}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[60px] ${
                selectedTur === 'sarjli'
                  ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                  : 'bg-white hover:bg-teal-50/50 border-slate-200 text-slate-700'
              }`}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-[10px] sm:text-xs text-center leading-tight">Şarjlı (EV)</span>
            </button>
          </div>
        </div>

        {/* Şarjlı Park Soket Seçimi */}
        {selectedTur === 'sarjli' && (
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-teal-50 border border-teal-200 space-y-2 animate-in fade-in">
            <label className="block text-xs font-bold text-teal-900">
              ⚡ Şarj Soket Tipi Seçimi (Zorunlu)
            </label>
            <div className="flex gap-2">
              {availableSockets.map((soket) => (
                <button
                  type="button"
                  key={soket}
                  onClick={() => setSelectedSocket(soket)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border transition-all min-h-[38px] ${
                    selectedSocket === soket
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {soket === 'CCS2' ? '⚡ CCS2 (Hızlı DC)' : '🔌 Type 2 (AC Normal)'}
                </button>
              ))}
            </div>
            {chargeRate && (
              <p className="text-[10px] sm:text-[11px] text-teal-800">
                Bu istasyon için şarj tarifesi: <strong>{formatKurusToTL(chargeRate)} / kWh</strong>.
              </p>
            )}
          </div>
        )}

        {/* Erişilebilir Park İhtiyaç Beyanı */}
        {selectedTur === 'erisilebilir' && (
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-200 space-y-2 animate-in fade-in">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={erisilebilirBeyan}
                onChange={(e) => setErisilebilirBeyan(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 shrink-0"
              />
              <span className="text-xs text-blue-900 leading-tight">
                <strong>İhtiyaç Beyanı:</strong> Erişilebilir park yerine ihtiyacım olduğunu beyan ediyorum.
              </span>
            </label>
          </div>
        )}

        {/* 3. Tarih ve Saat Seçimi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Başlangıç Zamanı
            </label>
            <select
              value={startOffsetMinutes}
              onChange={(e) => setStartOffsetMinutes(Number(e.target.value))}
              aria-label="Rezervasyon başlangıç zamanı seçimi"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[42px]"
            >
              <option value={0}>Şimdi ({formatIstanbulTime(currentDemoTime)})</option>
              <option value={15}>15 Dakika Sonra</option>
              <option value={30}>30 Dakika Sonra</option>
              <option value={60}>1 Saat Sonra</option>
              <option value={120}>2 Saat Sonra</option>
              <option value={1440}>Yarın Bu Saatte (+1 Gün)</option>
              <option value={2880}>2 Gün Sonra</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Park Süresi
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              aria-label="Rezervasyon kalış süresi seçimi"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[42px]"
            >
              <option value={30}>30 Dakika</option>
              <option value={60}>1 Saat</option>
              <option value={120}>2 Saat</option>
              <option value={180}>3 Saat</option>
              <option value={240}>4 Saat</option>
              <option value={360}>6 Saat</option>
              <option value={480}>8 Saat (Azami Süre)</option>
            </select>
          </div>
        </div>

        {/* Araç Plakası */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Araç Plakası (Demo için örnek)
          </label>
          <input
            type="text"
            value={plaka}
            onChange={(e) => setPlaka(e.target.value)}
            placeholder="34 PC 101"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold tracking-wider text-slate-900 bg-slate-50 uppercase focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[42px]"
          />
        </div>

        {/* 4. Onay ve Fiyat Dökümü */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
          <div className="font-bold text-slate-900 pb-1.5 border-b border-slate-200">
            Fiyat ve Süre Özeti
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Başlangıç:</span>
            <strong className="text-slate-800 text-right">{formatIstanbulDateTime(calculatedStart)}</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Planlanan Çıkış:</span>
            <strong className="text-slate-800 text-right">{formatIstanbulDateTime(calculatedEnd)}</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Saatlik Tarife:</span>
            <strong className="text-slate-800">{formatKurusToTL(selectedLot?.saatlik_ucret_kurus || 0)}/saat</strong>
          </div>
          <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-xs sm:text-sm">
            <span>Planlanan Park Bedeli:</span>
            <span className="text-teal-700 font-black">{formatKurusToTL(priceInfo.totalKurus)}</span>
          </div>
          {chargeRate && (
            <div className="text-[10px] sm:text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1.5">
              * Şarj bedeli çıkışta tüketilen kWh üzerinden tahsil edilir.
            </div>
          )}
        </div>

        {/* Gecikme ve İptal Koşulları */}
        <div className="pt-0.5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4 shrink-0"
            />
            <span className="text-[11px] sm:text-xs text-slate-600 leading-tight">
              Başlangıç saatinden itibaren 10 dakika içinde giriş yapılmazsa rezervasyonun <strong>GELMEDİ</strong> olacağını ve yerin açılacağını onaylıyorum.
            </span>
          </label>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl sm:rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:bg-slate-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
        >
          {isLoading ? (
            <span>Kapasite Kontrol Ediliyor...</span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Rezervasyonu Tamamla ve QR Kod Al</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function YeniRezervasyonPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Yükleniyor...</div>}>
      <YeniRezervasyonForm />
    </Suspense>
  );
}
