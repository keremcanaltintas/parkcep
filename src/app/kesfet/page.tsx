'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { ParkingLot, SpaceType, SocketType } from '@/types';
import {
  formatKurusToTL,
  calculateParkingPriceKurus,
  getAvailableCapacityForRange,
  formatIstanbulTime
} from '@/lib/calculations';
import InteractiveMap from '@/components/InteractiveMap';
import {
  Search,
  Clock,
  Zap,
  Accessibility,
  Car,
  ChevronRight,
  List,
  Map,
  RotateCcw
} from 'lucide-react';

export default function KesfetPage() {
  const { lots, spaces, chargers, reservations, lotSummaries, currentDemoTime } = useStore();

  // Mobil Görünüm Sekmesi (Liste vs Harita)
  const [mobileTab, setMobileTab] = useState<'liste' | 'harita'>('liste');

  // Filtre State'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<SpaceType | 'hepsi'>('hepsi');
  const [selectedSocket, setSelectedSocket] = useState<SocketType | 'hepsi'>('hepsi');
  const [minPowerKw, setMinPowerKw] = useState<number>(0);
  const [sortOption, setSortOption] = useState<'ucret' | 'bosYer' | 'ad'>('ucret');
  const [selectedLotId, setSelectedLotId] = useState<string | undefined>(undefined);

  // Tarih / Saat Aralığı (Varsayılan: Şimdi ve +2 saat)
  const [startOffsetMinutes, setStartOffsetMinutes] = useState<number>(0); // 0 = Şimdi
  const [durationMinutes, setDurationMinutes] = useState<number>(120);     // 2 saat

  // Hesaplanmış Başlangıç ve Bitiş Tarihleri
  const calculatedStart = useMemo(() => {
    return new Date(currentDemoTime.getTime() + startOffsetMinutes * 60 * 1000);
  }, [currentDemoTime, startOffsetMinutes]);

  const calculatedEnd = useMemo(() => {
    return new Date(calculatedStart.getTime() + durationMinutes * 60 * 1000);
  }, [calculatedStart, durationMinutes]);

  // Filtreleri Sıfırlama
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('hepsi');
    setSelectedSocket('hepsi');
    setMinPowerKw(0);
    setStartOffsetMinutes(0);
    setDurationMinutes(120);
    setSortOption('ucret');
  };

  const isFiltered = searchTerm !== '' || selectedType !== 'hepsi' || selectedSocket !== 'hepsi' || minPowerKw > 0;

  // Otoparkları Filtreleme ve Sıralama
  const filteredLots = useMemo(() => {
    return lots
      .filter((lot) => {
        if (searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase();
          const matchName = lot.ad.toLowerCase().includes(term);
          const matchRegion = lot.ornek_bolge.toLowerCase().includes(term);
          if (!matchName && !matchRegion) return false;
        }

        if (selectedType !== 'hepsi') {
          const hasType = spaces.some(
            s => s.lot_id === lot.id && s.tur === selectedType && !s.kapali_mi
          );
          if (!hasType) return false;
        }

        if (selectedType === 'sarjli' || selectedSocket !== 'hepsi' || minPowerKw > 0) {
          const lotSpaces = spaces.filter(s => s.lot_id === lot.id && s.tur === 'sarjli');
          const lotSpaceIds = new Set(lotSpaces.map(s => s.id));
          const lotChargers = chargers.filter(c => lotSpaceIds.has(c.space_id));

          if (selectedSocket !== 'hepsi') {
            const hasSocket = lotChargers.some(c => c.soket_tipi === selectedSocket);
            if (!hasSocket) return false;
          }

          if (minPowerKw > 0) {
            const hasPower = lotChargers.some(c => c.guc_kW >= minPowerKw);
            if (!hasPower) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'ucret') {
          const priceA = calculateParkingPriceKurus(calculatedStart, calculatedEnd, a.saatlik_ucret_kurus).totalKurus;
          const priceB = calculateParkingPriceKurus(calculatedStart, calculatedEnd, b.saatlik_ucret_kurus).totalKurus;
          return priceA - priceB;
        }
        if (sortOption === 'bosYer') {
          const freeA = lotSummaries[a.id]?.fiziksel_bos_yer || 0;
          const freeB = lotSummaries[b.id]?.fiziksel_bos_yer || 0;
          return freeB - freeA;
        }
        return a.ad.localeCompare(b.ad);
      });
  }, [
    lots,
    spaces,
    chargers,
    searchTerm,
    selectedType,
    selectedSocket,
    minPowerKw,
    sortOption,
    calculatedStart,
    calculatedEnd,
    lotSummaries
  ]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Üst Başlık & Süre Barı */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Otopark ve Şarj Noktaları Keşfet
            </h1>
            <span className="hidden sm:inline-flex text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
              Pilot Bölge
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Zaman aralığına göre anlık fiziksel boşluk ve ayrılabilir kapasiteyi karşılaştırın.
          </p>
        </div>

        {/* Zaman Aralığı Seçimi */}
        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50 p-2 rounded-xl border border-slate-200/90">
          <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
            <span className="text-slate-500 font-medium text-[11px]">Giriş:</span>
            <select
              value={startOffsetMinutes}
              onChange={(e) => setStartOffsetMinutes(Number(e.target.value))}
              aria-label="Rezervasyon başlangıç zamanı"
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[34px]"
            >
              <option value={0}>Şimdi ({formatIstanbulTime(currentDemoTime)})</option>
              <option value={15}>+15 dk sonra</option>
              <option value={30}>+30 dk sonra</option>
              <option value={60}>+1 saat sonra</option>
              <option value={120}>+2 saat sonra</option>
              <option value={1440}>Yarın bu saatte</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
            <span className="text-slate-500 font-medium text-[11px]">Süre:</span>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              aria-label="Rezervasyon süresi"
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[34px]"
            >
              <option value={30}>30 Dakika</option>
              <option value={60}>1 Saat</option>
              <option value={120}>2 Saat</option>
              <option value={180}>3 Saat</option>
              <option value={240}>4 Saat</option>
              <option value={480}>8 Saat (Maks.)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ARAMA VE FİLTRE ÇUBUĞU */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
          {/* Arama Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0" />
            <input
              type="text"
              placeholder="Otopark veya bölge ara (Kadıköy, Beşiktaş, Üsküdar)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-slate-50/50 min-h-[40px]"
            />
          </div>

          {/* Sıralama */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs text-slate-500 font-medium shrink-0">Sırala:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              aria-label="Sonuçları sıralama ölçütü"
              className="flex-1 sm:flex-initial bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[40px]"
            >
              <option value="ucret">Park Bedeli (En Uygun)</option>
              <option value="bosYer">Fiziksel Boş Yer Sayısı</option>
              <option value="ad">Tesis Adı (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filtre Butonları */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 mr-1 shrink-0">Tür:</span>

          <button
            onClick={() => setSelectedType('hepsi')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[34px] ${
              selectedType === 'hepsi'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tümü
          </button>

          <button
            onClick={() => setSelectedType('standart')}
            className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[34px] ${
              selectedType === 'standart'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5 shrink-0" />
            <span>Standart</span>
          </button>

          <button
            onClick={() => setSelectedType('erisilebilir')}
            className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[34px] ${
              selectedType === 'erisilebilir'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5 shrink-0" />
            <span>Erişilebilir</span>
          </button>

          <button
            onClick={() => setSelectedType('sarjli')}
            className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[34px] ${
              selectedType === 'sarjli'
                ? 'bg-teal-600 text-white font-semibold shadow-xs'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>Şarjlı (EV)</span>
          </button>

          {/* Şarjlı Park Detay Filtreleri */}
          {(selectedType === 'sarjli' || selectedSocket !== 'hepsi' || minPowerKw > 0) && (
            <div className="flex items-center gap-1.5 flex-wrap pl-2 border-l border-slate-200 my-0.5">
              <button
                onClick={() => setSelectedSocket(selectedSocket === 'CCS2' ? 'hepsi' : 'CCS2')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all min-h-[30px] ${
                  selectedSocket === 'CCS2'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ⚡ CCS2
              </button>

              <button
                onClick={() => setSelectedSocket(selectedSocket === 'Type 2' ? 'hepsi' : 'Type 2')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all min-h-[30px] ${
                  selectedSocket === 'Type 2'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🔌 Type 2
              </button>

              <select
                value={minPowerKw}
                onChange={(e) => setMinPowerKw(Number(e.target.value))}
                aria-label="Asgari şarj gücü"
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 min-h-[30px]"
              >
                <option value={0}>Tüm Güçler</option>
                <option value={50}>≥ 50 kW</option>
                <option value={100}>≥ 100 kW</option>
              </select>
            </div>
          )}

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-medium ml-auto transition-colors min-h-[34px]"
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span>Filtreleri Temizle</span>
            </button>
          )}
        </div>
      </div>

      {/* MOBİL GÖRÜNÜM SEKME GEÇİŞİ (Telefonda Liste / Harita) */}
      <div className="flex md:hidden bg-slate-200 p-1 rounded-xl">
        <button
          onClick={() => setMobileTab('liste')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
            mobileTab === 'liste'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <List className="w-4 h-4 shrink-0" />
          <span>Liste ({filteredLots.length})</span>
        </button>

        <button
          onClick={() => setMobileTab('harita')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
            mobileTab === 'harita'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Map className="w-4 h-4 shrink-0" />
          <span>Harita Görünümü</span>
        </button>
      </div>

      {/* ANA İKİ SÜTUNLU YAPI */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* SOL: OTOPARK LİSTESİ */}
        <div className={`md:col-span-6 lg:col-span-5 space-y-3.5 sm:space-y-4 ${mobileTab === 'harita' ? 'hidden md:block' : 'block'}`}>
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider">
              Bulunan Tesisler ({filteredLots.length})
            </span>
            <span>
              {durationMinutes / 60} Saat İçin
            </span>
          </div>

          {filteredLots.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Kriterlere Uygun Otopark Bulunamadı</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Arama teriminizi veya filtrelerinizi değiştirerek tekrar deneyebilirsiniz.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 transition-colors min-h-[40px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Filtreleri Temizle</span>
              </button>
            </div>
          ) : (
            filteredLots.map((lot) => {
              const summary = lotSummaries[lot.id];
              const isSelected = selectedLotId === lot.id;

              const ayrilabilirKapasite = getAvailableCapacityForRange(
                lot.id,
                selectedType === 'hepsi' ? 'hepsi' : selectedType,
                calculatedStart,
                calculatedEnd,
                spaces,
                reservations,
                currentDemoTime
              );

              const priceInfo = calculateParkingPriceKurus(
                calculatedStart,
                calculatedEnd,
                lot.saatlik_ucret_kurus
              );

              return (
                <div
                  key={lot.id}
                  onClick={() => setSelectedLotId(lot.id)}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 cursor-pointer ${
                    isSelected
                      ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                      : 'border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-teal-700 uppercase tracking-wide truncate">
                          {lot.ornek_bolge}
                        </span>
                        {lot.toplu_tasima_etiketi && (
                          <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 shrink-0">
                            Toplu Taşıma
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-0.5 truncate">
                        {lot.ad}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-500 mt-1 flex-wrap">
                        <span>Çalışma: <strong>{lot.calisma_saatleri}</strong></span>
                        <span>•</span>
                        <span>{lot.veri_zamani}</span>
                      </div>
                    </div>

                    {/* Fiyat Rozeti */}
                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-lg font-black text-slate-900">
                        {formatKurusToTL(priceInfo.totalKurus)}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500">
                        {priceInfo.hoursCharged} sa × {formatKurusToTL(lot.saatlik_ucret_kurus)}
                      </div>
                    </div>
                  </div>

                  {/* Anlık Boşluk ve Ayrılabilir Kapasite */}
                  <div className="mt-3.5 grid grid-cols-1 xs:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Şu Anki Fiziksel Boşluk
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            (summary?.fiziksel_bos_yer || 0) > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900">
                          {summary?.fiziksel_bos_yer || 0} Boş Yer
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        ({summary?.toplam_yer} toplam / {summary?.kapali_yer} kapalı)
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-teal-800 uppercase tracking-wider block">
                        Seçilen Zaman İçin Ayrılabilir
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            ayrilabilirKapasite > 0 ? 'bg-teal-500' : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-teal-900">
                          {ayrilabilirKapasite > 0 ? `${ayrilabilirKapasite} Yer Ayrılabilir` : 'Kapasite Yok'}
                        </span>
                      </div>
                      <span className="text-[10px] text-teal-800">
                        ({durationMinutes / 60} saatlik aralık için)
                      </span>
                    </div>
                  </div>

                  {/* Donanım Etiketleri */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[10px] sm:text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      Standart: {summary?.standart_bos} boş
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                      Erişilebilir: {summary?.erisilebilir_bos} boş
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3 text-teal-600 shrink-0" />
                      <span>Şarjlı: {summary?.sarjli_bos} boş</span>
                    </span>
                  </div>

                  {/* Butonlar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/otopark/${lot.id}`}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-slate-50 min-h-[36px]"
                    >
                      <span>Detayları İncele</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/rezervasyon/yeni?lot=${lot.id}&startOffset=${startOffsetMinutes}&duration=${durationMinutes}&tur=${selectedType !== 'hepsi' ? selectedType : 'standart'}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs min-h-[38px]"
                    >
                      <span>Bu Otoparkı Ayır</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* SAĞ: İNTERAKTİF HARİTA */}
        <div className={`md:col-span-6 lg:col-span-7 sticky top-20 ${mobileTab === 'liste' ? 'hidden md:block' : 'block'}`}>
          <InteractiveMap
            lots={filteredLots}
            summaries={lotSummaries}
            selectedLotId={selectedLotId}
            onSelectLot={(id) => setSelectedLotId(id)}
          />

          {/* Harita Altı İpucu */}
          <div className="mt-2.5 p-3 rounded-xl bg-white border border-slate-200 text-[11px] sm:text-xs text-slate-600 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
              <span className="truncate">Haritada pin seçtiğinizde otopark detayları öne çıkar.</span>
            </div>
            {selectedLotId && (
              <button
                onClick={() => setSelectedLotId(undefined)}
                className="text-teal-700 font-semibold hover:underline shrink-0 ml-2"
              >
                Seçimi Kaldır
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
