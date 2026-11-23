'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { formatKurusToTL, formatIstanbulTime } from '@/lib/calculations';
import SmartCityBackground from '@/components/SmartCityBackground';
import {
  Car,
  Compass,
  Sliders,
  ArrowRight,
  Sparkles,
  PlayCircle,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export default function HomePage() {
  const { totalOccupancy, lotSummaries, lots, switchUserById, resetDemoData, currentDemoTime } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-10">
      {/* Hero Bölümü */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-5 sm:p-10 md:p-12 border border-slate-800 shadow-xl min-h-[360px] sm:min-h-[440px] flex items-center">
        {/* 3D Akıllı Şehir & Hareket Eden Arabalar Animasyonlu Arka Planı */}
        <SmartCityBackground />
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-slate-900/40 to-slate-900/80 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Akıllı Şehir Otopark ve Şarj Ekosistemi • Demo</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Akıllı Şehir İçin <span className="text-teal-400">Rezervasyonlu Otopark</span> ve Şarj Yönetimi
          </h1>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Sürücü, otopark işletmesi ve belediye yönetimini ortak veride buluşturan ParkCep; otopark arama belirsizliğini ortadan kaldırır, kapasite kullanımını görünür kılar.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <Link
              href="/kesfet"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/20 transition-all hover:scale-101 min-h-[44px]"
            >
              <Compass className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Sürücü Olarak Keşfet</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-all min-h-[44px]"
            >
              <Sliders className="w-4 h-4 text-teal-400 shrink-0" />
              <span>5 Dk. Sunum & Test Akışı</span>
            </Link>
          </div>
        </div>
      </div>

      {/* CANLI BAŞLANGIÇ GÖSTERGELERİ (30 Toplam / 7 Dolu / 1 Kapalı / 22 Boş) */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
              Sistem Genel Durumu & Kapasite Özeti
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Pilot bölgedeki 3 kurgusal tesisin anlık ortak veritabanı durumu
            </p>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Uygulama Saati: <strong className="text-slate-800 font-mono">{formatIstanbulTime(currentDemoTime)}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Toplam Kapasite
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalOccupancy.toplam_yer}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block truncate">
              3 tesiste kayıtlı kaynak
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Fiziksel Dolu
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-teal-700">
              {totalOccupancy.fiziksel_dolu_yer}
            </div>
            <span className="text-[10px] sm:text-[11px] text-teal-800 mt-0.5 block font-medium truncate">
              Şu an içerideki araç
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Kapalı / Bakımda
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-amber-600">
              {totalOccupancy.kapali_yer}
            </div>
            <span className="text-[10px] sm:text-[11px] text-amber-800 mt-0.5 block truncate">
              Hizmet dışı park yeri
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-teal-200 bg-teal-50/30 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-teal-800 uppercase tracking-wider block">
              Fiziksel Boş Yer
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {totalOccupancy.fiziksel_bos_yer}
            </div>
            <span className="text-[10px] sm:text-[11px] text-emerald-800 mt-0.5 block font-semibold truncate">
              Kullanıma hazır boş alan
            </span>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Genel Doluluk
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
              %{totalOccupancy.genel_doluluk_orani}
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalOccupancy.genel_doluluk_orani}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5 DAKİKALIK MÜŞTERİ SUNUM AKIŞI REHBERİ */}
      <section className="bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-teal-400 text-[11px] font-bold uppercase tracking-wider mb-1">
              <PlayCircle className="w-4 h-4 shrink-0" />
              <span>Doküman Madde 08 • Kabul Testi ve Sunum Senaryosu</span>
            </div>
            <h3 className="text-base sm:text-xl font-bold text-white">5 Dakikalık Uçtan Uca Müşteri Demosu</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              Sürücü yer ayırır → işletme görür → görevli giriş yapar → doluluk artar → görevli çıkış yapar → belediye özeti güncellenir.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={resetDemoData}
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer min-h-[40px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>1. Adım: Veriyi Sıfırla</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between space-y-3">
            <div>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center mb-2">
                1
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-white">Sürücü Rezervasyonu</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                Sürücü olarak giriş yapın, haritadan Merkez otoparkını seçip "şimdi" başlayan bir park oluşturun.
              </p>
            </div>
            <Link
              href="/rezervasyon/yeni?lot=merkez"
              onClick={() => switchUserById('user-surucu-1')}
              className="inline-flex items-center justify-between text-xs font-semibold text-teal-400 hover:text-teal-300 pt-2 border-t border-slate-700/50"
            >
              <span>Rezervasyon Başlat</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between space-y-3">
            <div>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center mb-2">
                2
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-white">Görevli Giriş Onayı</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                Merkez otopark görevlisi rolüne geçin, kodu doğrulayıp araç girişini onaylayın (Doluluk anında artar).
              </p>
            </div>
            <Link
              href="/isletme"
              onClick={() => switchUserById('user-gorevli-merkez')}
              className="inline-flex items-center justify-between text-xs font-semibold text-teal-400 hover:text-teal-300 pt-2 border-t border-slate-700/50"
            >
              <span>İşletme Paneline Git</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between space-y-3">
            <div>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center mb-2">
                3
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-white">Görevli Çıkış Kapatma</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                Aracı çıkış butonuna basarak tamamlayın (Doluluk azalır, ziyaret belediyeye aktarılır).
              </p>
            </div>
            <Link
              href="/isletme"
              onClick={() => switchUserById('user-gorevli-merkez')}
              className="inline-flex items-center justify-between text-xs font-semibold text-teal-400 hover:text-teal-300 pt-2 border-t border-slate-700/50"
            >
              <span>Çıkış İşlemini Tamamla</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between space-y-3">
            <div>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center mb-2">
                4
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-white">Belediye Raporu</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                Belediye panelinde tamamlanan ziyaret sayısındaki artışı ve ortalama park süresi hesaplamasını inceleyin.
              </p>
            </div>
            <Link
              href="/belediye"
              onClick={() => switchUserById('user-belediye')}
              className="inline-flex items-center justify-between text-xs font-semibold text-teal-400 hover:text-teal-300 pt-2 border-t border-slate-700/50"
            >
              <span>Belediye Paneline Git</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3 KURGUSAL TESİS KARTLARI */}
      <section className="space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
            Pilot Tesisler ve Kapasiteleri
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Farklı tarife, şarj cihazları ve erişilebilirlik donanımlarına sahip örnek otoparklar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {lots.map((lot) => {
            const summary = lotSummaries[lot.id];
            return (
              <div
                key={lot.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow p-4 sm:p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-teal-700 uppercase tracking-wider block truncate">
                        {lot.ornek_bolge}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5 truncate">{lot.ad}</h3>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-800 shrink-0">
                      {formatKurusToTL(lot.saatlik_ucret_kurus)}/saat
                    </span>
                  </div>

                  {lot.toplu_tasima_etiketi && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                      <span>🚇 {lot.toplu_tasima_etiketi}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {lot.aciklama}
                  </p>

                  {/* Kapasite dökümü */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Toplam Yer:</span>
                      <span className="font-bold text-slate-900">{summary?.toplam_yer} Park Yeri</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Fiziksel Boş Yer:</span>
                      <span className="font-bold text-emerald-700">{summary?.fiziksel_bos_yer} Boş</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Doluluk Oranı:</span>
                      <span className="font-semibold text-slate-800">
                        {summary?.doluluk_yuzdesi === 'Hizmet dışı' ? 'Hizmet Dışı' : `%${summary?.doluluk_yuzdesi}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                      <span>Donanım:</span>
                      <span className="truncate max-w-[170px] sm:max-w-none text-right">
                        {lot.id === 'merkez' && '⚡ CCS2 120 kW (10 TL/kWh)'}
                        {lot.id === 'kampus' && '⚡ Type 2 22 kW (8 TL/kWh)'}
                        {lot.id === 'aktarma' && '⚡ CCS2 60 kW (9 TL/kWh)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/otopark/${lot.id}`}
                    className="flex-1 text-center py-2 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors min-h-[38px] flex items-center justify-center"
                  >
                    Detayları Gör
                  </Link>
                  <Link
                    href={`/rezervasyon/yeni?lot=${lot.id}`}
                    className="flex-1 text-center py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs min-h-[38px] flex items-center justify-center"
                  >
                    Rezervasyon Yap
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
