"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import RoleGuard from "@/components/RoleGuard";
import {
  BarChart3,
  Clock,
  Accessibility,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Download,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  formatIstanbulDate,
  formatKurusToTL,
  calculateParkingPriceKurus,
  calculateChargePriceKurus,
} from "@/lib/calculations";
import { exportBelediyeExcelReport } from "@/lib/excelExport";

export default function BelediyePage() {
  return (
    <RoleGuard allowedRoles={["belediye", "demo_yoneticisi"]}>
      <BelediyePanelContent />
    </RoleGuard>
  );
}

function BelediyePanelContent() {
  const {
    lots,
    spaces,
    chargers,
    reservations,
    chargeSessions,
    lotSummaries,
    currentDemoTime,
  } = useStore();

  const [selectedLotFilter, setSelectedLotFilter] = useState<string>("hepsi");
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("bugun");
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const todayStr = currentDemoTime.toISOString().slice(0, 10);
  const currentMonthStr = currentDemoTime.toISOString().slice(0, 7);
  const sevenDaysAgoTime = currentDemoTime.getTime() - 7 * 24 * 3600 * 1000;

  const activeLots = useMemo(() => {
    if (selectedLotFilter === "hepsi") return lots;
    return lots.filter((l) => l.id === selectedLotFilter);
  }, [lots, selectedLotFilter]);

  const completedVisits = useMemo(() => {
    return reservations
      .filter((r) => {
        if (r.durum !== "TAMAMLANDI") return false;
        if (selectedLotFilter !== "hepsi" && r.lot_id !== selectedLotFilter)
          return false;

        const resDate = (r.cikis || r.bitis).slice(0, 10);
        const resTime = new Date(r.cikis || r.bitis).getTime();
        if (selectedDayFilter === "bugun") {
          return resDate === todayStr;
        } else if (selectedDayFilter === "son7gun") {
          return resTime >= sevenDaysAgoTime;
        } else if (selectedDayFilter === "buay") {
          return resDate.slice(0, 7) === currentMonthStr;
        }
        return true;
      })
      .map((r) => {
        const start = new Date(r.giris || r.baslangic).getTime();
        const end = new Date(r.cikis || r.bitis).getTime();
        const durationMinutes = Math.max(
          0,
          Math.round((end - start) / (60 * 1000)),
        );

        return {
          id: r.id,
          lot_id: r.lot_id,
          tarih: (r.cikis || r.bitis).slice(0, 10),
          sure_dakika: durationMinutes,
          sarj_var_mi: r.soket_tipi !== undefined,
          erisilebilir_mi: r.erisilebilir_ihtiyac_beyani === true,
        };
      });
  }, [
    reservations,
    selectedLotFilter,
    selectedDayFilter,
    todayStr,
    currentMonthStr,
    sevenDaysAgoTime,
  ]);

  const createdReservationsCount = useMemo(() => {
    return reservations.filter((r) => {
      if (selectedLotFilter !== "hepsi" && r.lot_id !== selectedLotFilter)
        return false;
      const resDate = r.olusturulma.slice(0, 10);
      const resTime = new Date(r.olusturulma).getTime();
      if (selectedDayFilter === "bugun") {
        return resDate === todayStr;
      } else if (selectedDayFilter === "son7gun") {
        return resTime >= sevenDaysAgoTime;
      } else if (selectedDayFilter === "buay") {
        return resDate.slice(0, 7) === currentMonthStr;
      }
      return true;
    }).length;
  }, [
    reservations,
    selectedLotFilter,
    selectedDayFilter,
    todayStr,
    currentMonthStr,
    sevenDaysAgoTime,
  ]);

  const periodTotalRevenueKurus = useMemo(() => {
    const filteredReservations = reservations.filter((r) => {
      if (selectedLotFilter !== "hepsi" && r.lot_id !== selectedLotFilter)
        return false;
      if (r.durum !== "TAMAMLANDI" && r.durum !== "İÇERİDE") return false;
      const resDate = (r.cikis || r.bitis || r.olusturulma).slice(0, 10);
      const resTime = new Date(r.cikis || r.bitis || r.olusturulma).getTime();
      if (selectedDayFilter === "bugun") return resDate === todayStr;
      if (selectedDayFilter === "son7gun") return resTime >= sevenDaysAgoTime;
      if (selectedDayFilter === "buay")
        return resDate.slice(0, 7) === currentMonthStr;
      return true;
    });

    return filteredReservations.reduce((total, r) => {
      const start = r.giris || r.baslangic;
      const end = r.cikis || r.bitis;
      const parking = calculateParkingPriceKurus(
        start,
        end,
        r.saatlik_tarife_kurus,
      ).totalKurus;

      const charge = chargeSessions
        .filter((session) => session.reservation_id === r.id)
        .reduce((sum, session) => {
          const sessionCost = calculateChargePriceKurus(
            session.enerji_kWh,
            session.birim_fiyat_kurus,
          );
          return sum + sessionCost;
        }, 0);

      return total + parking + charge;
    }, 0);
  }, [
    reservations,
    chargeSessions,
    selectedLotFilter,
    selectedDayFilter,
    todayStr,
    currentMonthStr,
    sevenDaysAgoTime,
  ]);

  const periodTotalEnergyKwh = useMemo(() => {
    const activeLotIds = new Set(activeLots.map((l) => l.id));
    return chargeSessions
      .filter((cs) => {
        const ch = chargers.find((c) => c.id === cs.charger_id);
        if (!ch) return false;
        const sp = spaces.find((s) => s.id === ch.space_id);
        if (!sp || !activeLotIds.has(sp.lot_id)) return false;
        const csDate = cs.baslangic.slice(0, 10);
        const csTime = new Date(cs.baslangic).getTime();
        if (selectedDayFilter === "bugun") return csDate === todayStr;
        if (selectedDayFilter === "son7gun") return csTime >= sevenDaysAgoTime;
        if (selectedDayFilter === "buay")
          return csDate.slice(0, 7) === currentMonthStr;
        return true;
      })
      .reduce((acc, cs) => acc + cs.enerji_kWh, 0);
  }, [
    chargeSessions,
    chargers,
    spaces,
    activeLots,
    selectedDayFilter,
    todayStr,
    currentMonthStr,
    sevenDaysAgoTime,
  ]);

  const averageDurationMinutes = useMemo(() => {
    if (completedVisits.length === 0) return 0;
    const totalMinutes = completedVisits.reduce(
      (acc, v) => acc + v.sure_dakika,
      0,
    );
    return Math.round(totalMinutes / completedVisits.length);
  }, [completedVisits]);

  const totalPhysicalInside = useMemo(() => {
    return reservations.filter((r) => {
      if (selectedLotFilter !== "hepsi" && r.lot_id !== selectedLotFilter)
        return false;
      return r.durum === "İÇERİDE";
    }).length;
  }, [reservations, selectedLotFilter]);

  const totalOpenSpaces = useMemo(() => {
    return spaces.filter((s) => {
      if (selectedLotFilter !== "hepsi" && s.lot_id !== selectedLotFilter)
        return false;
      return !s.kapali_mi;
    }).length;
  }, [spaces, selectedLotFilter]);

  const overallOccupancyPercent =
    totalOpenSpaces > 0
      ? Math.round((totalPhysicalInside / totalOpenSpaces) * 100)
      : 0;

  const accessibleSpacesCount = useMemo(() => {
    const activeLotIds = new Set(activeLots.map((l) => l.id));
    return spaces.filter(
      (s) =>
        activeLotIds.has(s.lot_id) && s.tur === "erisilebilir" && !s.kapali_mi,
    ).length;
  }, [spaces, activeLots]);

  const handleExportExcel = () => {
    exportBelediyeExcelReport({
      lots,
      spaces,
      chargers,
      reservations,
      chargeSessions,
      lotSummaries,
      selectedLotFilter,
      selectedDayFilter,
    });
    setExportFeedback(
      "Belediye Excel Analitik Raporu (.xlsx) başarıyla indirildi.",
    );
    setTimeout(() => setExportFeedback(null), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Üst Başlık & Excel İndirme Aksiyonu */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                Akıllı Şehir Ulaşım Yönetimi
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Belediye Analitik & Raporlama
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Belediye Otopark ve Doluluk İstatistikleri
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[42px]"
              title="Resmi çok sekmeli Excel raporunu bilgisayarınıza indirin"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel Raporu İndir (.xlsx)</span>
              <Download className="w-3.5 h-3.5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>KVKK Uyumlu</span>
            </div>
          </div>
        </div>

        {/* Başarı Geri Bildirimi */}
        {exportFeedback && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportFeedback}</span>
            </div>
            <button
              onClick={() => setExportFeedback(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filtreleme Çubuğu */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-slate-600 shrink-0">
              Tesis:
            </span>
            <select
              value={selectedLotFilter}
              onChange={(e) => setSelectedLotFilter(e.target.value)}
              aria-label="Tesis filtresi seçimi"
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden w-full min-h-[38px]"
            >
              <option value="hepsi">
                Tüm Tesisler ({lots.length} İlçe Otoparkı)
              </option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.ad} ({l.ornek_bolge})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-slate-600 shrink-0">
              Zaman:
            </span>
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              aria-label="Zaman filtresi seçimi"
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden w-full min-h-[38px]"
            >
              <option value="bugun">
                Bugün ({formatIstanbulDate(currentDemoTime)})
              </option>
              <option value="son7gun">Son 7 Günlük Dönem</option>
              <option value="buay">Bu Ay ({currentMonthStr})</option>
              <option value="tumu">Tüm Kayıtlar</option>
            </select>
          </div>
        </div>
      </div>

      {/* BELEDİYE METRİKLERİ KARTLARI (6 Kart) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Şehir Doluluğu</span>
            <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            %{overallOccupancyPercent}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            {totalPhysicalInside} araç / {totalOpenSpaces} açık
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Rezervasyon</span>
            <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {createdReservationsCount}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            Kayıtlı rezervasyon
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Tamamlanan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
            {completedVisits.length}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            Giriş & çıkış yapılmış
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate">Ortalama Park</span>
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {averageDurationMinutes > 0
              ? `${averageDurationMinutes} dk`
              : "0 dk"}
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            {averageDurationMinutes > 0
              ? `(~${(averageDurationMinutes / 60).toFixed(1)} sa)`
              : "Ziyaret yok"}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate text-emerald-800">Toplam Hasılat</span>
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {formatKurusToTL(periodTotalRevenueKurus)}
          </div>
          <span className="text-[10px] text-emerald-800 block truncate font-medium">
            Park & şarj geliri
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-teal-200 bg-teal-50/20 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <span className="truncate text-teal-800">Yeşil Enerji</span>
            <Zap className="w-4 h-4 text-teal-600 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-800 mt-0.5">
            {periodTotalEnergyKwh.toFixed(1)} kWh
          </div>
          <span className="text-[10px] text-teal-800 block truncate font-medium">
            Dağıtılan EV şarjı
          </span>
        </div>
      </div>

      {/* TESİS BAZLI DOLULUK ÇUBUKLARI */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900">
            Tesis Bazlı Canlı Doluluk Çubukları
          </h2>
          <p className="text-xs text-slate-500">
            Fiziksel doluluk, kapalı alanlar ve ayrılabilir kapasite dengesi
          </p>
        </div>

        <div className="space-y-3">
          {activeLots.map((l) => {
            const sum = lotSummaries[l.id];
            const pct =
              sum?.doluluk_yuzdesi === "Hizmet dışı"
                ? 0
                : Number(sum?.doluluk_yuzdesi || 0);

            return (
              <div
                key={l.id}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="min-w-0">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                      {l.ad}
                    </span>
                    <span className="text-xs text-teal-700 font-medium ml-1.5">
                      ({l.ornek_bolge})
                    </span>
                    {l.toplu_tasima_etiketi && (
                      <span className="ml-2 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
                        🚇 Toplu Taşıma
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-700">
                    {sum?.fiziksel_dolu_yer} / {sum?.toplam_yer} Yer Dolu (
                    {sum?.doluluk_yuzdesi === "Hizmet dışı"
                      ? "Hizmet Dışı"
                      : `%${sum?.doluluk_yuzdesi}`}
                    )
                  </div>
                </div>

                {/* Doluluk Çubuğu */}
                <div className="w-full bg-slate-200 h-2.5 sm:h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                    title={`Dolu: ${sum?.fiziksel_dolu_yer}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 pt-0.5 flex-wrap gap-1">
                  <span>
                    Standart: <strong>{sum?.standart_bos}</strong>
                  </span>
                  <span>
                    Erişilebilir: <strong>{sum?.erisilebilir_bos}</strong>
                  </span>
                  <span>
                    Şarjlı: <strong>{sum?.sarjli_bos}</strong>
                  </span>
                  <span>
                    Kapalı:{" "}
                    <strong className="text-amber-700">
                      {sum?.kapali_yer}
                    </strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ŞEHİR FAYDASI ENTEGRASYON KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
            <Accessibility className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Engelsiz Şehir & Erişilebilir Park Donanımı</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pilot bölgedeki tesislerde toplam{" "}
            <strong>
              {accessibleSpacesCount} adet erişilebilir park alanı
            </strong>{" "}
            bulunmaktadır. İhtiyaç sahibi sürücüler rezervasyonla yer garantisi
            sağlar.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
            <span>Erişilebilir Tesis Oranı:</span>
            <strong className="font-bold text-blue-700">
              %100 (Tüm Tesislerde)
            </strong>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
            <Zap className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Toplu Taşıma ve Park & Ride Entegrasyonu</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Üsküdar Aktarma Merkezi tesisi{" "}
            <strong>Marmaray ve Metro entegrasyonu</strong> ile Park & Ride
            modelini destekleyerek tarihi yarımada trafiğini azaltır.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
            <span>Örnek Aktarma Tesisi:</span>
            <strong className="font-bold text-teal-700">
              ParkCep Aktarma Merkezi
            </strong>
          </div>
        </div>
      </div>

      {/* ANONİM ZİYARET KAYITLARI TABLOSU */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Tamamlanan Ziyaret Akışı (Toplulaştırılmış Kayıtlar)
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              * KVKK gereği kullanıcı adı, e-posta, plaka ve kodlar belediye
              ekranına yansıtılmaz.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 shrink-0">
            {completedVisits.length} Kayıt
          </span>
        </div>

        {/* Tablo Taşırma Koruması */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Tarih</th>
                <th className="py-2.5 px-3">Tesis</th>
                <th className="py-2.5 px-3">Kalış Süresi</th>
                <th className="py-2.5 px-3">Şarj Kullanımı</th>
                <th className="py-2.5 px-3">Erişilebilirlik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedVisits.slice(0, 15).map((v, i) => (
                <tr key={v.id || i} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                    {v.tarih}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {lots
                      .find((l) => l.id === v.lot_id)
                      ?.ad.replace("ParkCep ", "")}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {v.sure_dakika} dk
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {v.sarj_var_mi ? (
                      <span className="text-teal-700 font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Şarj Edildi
                      </span>
                    ) : (
                      <span className="text-slate-400">Yalnız Park</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {v.erisilebilir_mi ? (
                      <span className="text-blue-700 font-semibold">
                        Erişilebilir
                      </span>
                    ) : (
                      <span className="text-slate-400">Standart</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
