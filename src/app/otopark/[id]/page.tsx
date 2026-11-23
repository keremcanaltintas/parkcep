'use client';

import React, { use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatKurusToTL, getAvailableCapacityForRange } from '@/lib/calculations';
import {
  Clock,
  Zap,
  Car,
  Accessibility,
  ExternalLink,
  ArrowLeft,
  CalendarCheck,
  ShieldAlert
} from 'lucide-react';

function OtoparkDetailInner({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { lots, spaces, chargers, reservations, lotSummaries, currentDemoTime } = useStore();

  const lot = lots.find(l => l.id === resolvedParams.id);
  const summary = lot ? lotSummaries[lot.id] : null;

  if (!lot) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Otopark Bulunamadı (404)</h1>
        <p className="text-xs text-slate-500">
          Aradığınız tesis sistemde kayıtlı değil veya kaldırılmış olabilir.
        </p>
        <Link
          href="/kesfet"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Keşfet Ekranına Dön</span>
        </Link>
      </div>
    );
  }

  const lotSpaces = spaces.filter(s => s.lot_id === lot.id);
  const chargerSpaces = lotSpaces.filter(s => s.tur === 'sarjli');
  const chargerSpaceIds = new Set(chargerSpaces.map(s => s.id));
  const lotChargers = chargers.filter(c => chargerSpaceIds.has(c.space_id));

  const twoHoursLater = new Date(currentDemoTime.getTime() + 2 * 3600 * 1000);
  const ayrilabilirStandart = getAvailableCapacityForRange(lot.id, 'standart', currentDemoTime, twoHoursLater, spaces, reservations, currentDemoTime);
  const ayrilabilirErisilebilir = getAvailableCapacityForRange(lot.id, 'erisilebilir', currentDemoTime, twoHoursLater, spaces, reservations, currentDemoTime);
  const ayrilabilirSarjli = getAvailableCapacityForRange(lot.id, 'sarjli', currentDemoTime, twoHoursLater, spaces, reservations, currentDemoTime);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Geri Butonu */}
      <div>
        <Link
          href="/kesfet"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Otopark Listesine Dön</span>
        </Link>
      </div>

      {/* Başlık Kartı */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wide">
                {lot.ornek_bolge}
              </span>
              {lot.toplu_tasima_etiketi && (
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  🚇 {lot.toplu_tasima_etiketi}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-slate-900 mt-1.5">
              {lot.ad}
            </h1>

            <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Çalışma: <strong>{lot.calisma_saatleri}</strong></span>
              </span>
              <span>•</span>
              <span>{lot.veri_zamani}</span>
              <span>•</span>
              <a
                href={`https://maps.google.com/?q=${lot.lat},${lot.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-teal-700 font-semibold hover:underline"
              >
                <span>Haritada Aç</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:text-right shrink-0">
            <span className="text-[11px] sm:text-xs text-slate-500 block">Standart Saatlik Ücret</span>
            <div className="text-xl sm:text-3xl font-black text-slate-900">
              {formatKurusToTL(lot.saatlik_ucret_kurus)}
              <span className="text-xs font-medium text-slate-500"> / saat</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
          {lot.aciklama}
        </p>

        {/* Rezervasyon CTA */}
        <div className="pt-1">
          <Link
            href={`/rezervasyon/yeni?lot=${lot.id}`}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-101 min-h-[44px]"
          >
            <CalendarCheck className="w-4 h-4 text-slate-950 shrink-0" />
            <span>Bu Otopark İçin Rezervasyon Oluştur</span>
          </Link>
        </div>
      </div>

      {/* ANLIK FİZİKSEL BOŞLUK VE AYRILABİLİR KAPASİTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Şu Anki Fiziksel Boşluk */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
              Şu Anki Fiziksel Durum
            </h3>
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600 shrink-0">
              Canlı Veri
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {summary?.fiziksel_bos_yer || 0}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-600">Fiziksel Boş Yer</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Toplam Tesis Kapasitesi:</span>
              <strong className="text-slate-900">{summary?.toplam_yer} Park Yeri</strong>
            </div>
            <div className="flex justify-between">
              <span>Şu An İçerideki Araç:</span>
              <strong className="text-slate-900">{summary?.fiziksel_dolu_yer} Araç</strong>
            </div>
            <div className="flex justify-between">
              <span>Kapalı / Hizmet Dışı:</span>
              <strong className="text-amber-700">{summary?.kapali_yer} Yer</strong>
            </div>
            <div className="flex justify-between">
              <span>Doluluk Oranı:</span>
              <strong className="text-slate-900">
                {summary?.doluluk_yuzdesi === 'Hizmet dışı' ? 'Hizmet Dışı' : `%${summary?.doluluk_yuzdesi}`}
              </strong>
            </div>
          </div>
        </div>

        {/* Seçilen Zaman İçin Ayrılabilir Kapasite */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-200 bg-teal-50/20 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[11px] sm:text-xs font-bold text-teal-800 uppercase tracking-wider truncate">
              Önümüzdeki Saatler İçin Ayrılabilir
            </h3>
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold shrink-0">
              Kapasite Kontrollü
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-teal-700">
              {(ayrilabilirStandart + ayrilabilirErisilebilir + ayrilabilirSarjli)}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-teal-900">Toplam Ayrılabilir Yer</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-teal-100">
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Standart Park:</span>
              </span>
              <strong className="text-slate-900">{ayrilabilirStandart} yer müsait</strong>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Accessibility className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Erişilebilir Park:</span>
              </span>
              <strong className="text-blue-900">{ayrilabilirErisilebilir} yer müsait</strong>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Şarjlı Park (EV):</span>
              </span>
              <strong className="text-teal-900">{ayrilabilirSarjli} yer müsait</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Şarj Üniteleri Kartı */}
      {lotChargers.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Zap className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Tesis İçi Elektrikli Araç Şarj İstasyonları ({lotChargers.length} Ünite)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {lotChargers.map((ch) => (
              <div
                key={ch.id}
                className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs gap-2"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <span>{ch.soket_tipi} Soket</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-semibold">
                      {ch.guc_kW} kW
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Tarife: <strong>{formatKurusToTL(ch.kWh_bedeli_kurus)}/kWh</strong>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    ch.durum === 'HAZIR'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ch.durum === 'ŞARJ EDİYOR'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {ch.durum}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OtoparkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center text-xs text-slate-500">
          Otopark bilgileri yükleniyor...
        </div>
      }
    >
      <OtoparkDetailInner params={params} />
    </Suspense>
  );
}
