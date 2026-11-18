'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import RoleGuard from '@/components/RoleGuard';
import {
  Landmark,
  BarChart3,
  TrendingUp,
  Clock,
  Car,
  Accessibility,
  Zap,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
  Building2,
  Info
} from 'lucide-react';
import { formatIstanbulDate } from '@/lib/calculations';

export default function BelediyePage() {
  return (
    <RoleGuard allowedRoles={['belediye', 'demo_yoneticisi']}>
      <BelediyePanelContent />
    </RoleGuard>
  );
}

function BelediyePanelContent() {
  const { lots, spaces, reservations, lotSummaries, currentDemoTime } = useStore();

  // Filtreler
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>('hepsi');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('bugun'); // 'bugun' | 'son7gun' | 'tumu'

  // Gün hesapları
  const todayStr = currentDemoTime.toISOString().slice(0, 10);
  const sevenDaysAgoTime = currentDemoTime.getTime() - 7 * 24 * 3600 * 1000;

  // Filtrelenmiş Tesisler
  const activeLots = useMemo(() => {
    if (selectedLotFilter === 'hepsi') return lots;
    return lots.filter(l => l.id === selectedLotFilter);
  }, [lots, selectedLotFilter]);

  // Filtrelenmiş Tamamlanan Ziyaretler (KİŞİSEL VERİLERİN TAMAMEN ARINDIRILMIŞ ŞEKLİ - Page 5)
  const completedVisits = useMemo(() => {
    return reservations
      .filter((r) => {
        if (r.durum !== 'TAMAMLANDI') return false;
        if (selectedLotFilter !== 'hepsi' && r.lot_id !== selectedLotFilter) return false;

        const resTime = new Date(r.cikis || r.bitis).getTime();
        if (selectedDayFilter === 'bugun') {
          return (r.cikis || r.bitis).slice(0, 10) === todayStr;
        } else if (selectedDayFilter === 'son7gun') {
          return resTime >= sevenDaysAgoTime;
        }
        return true;
      })
      .map((r) => {
        // Kişisel verilerden (ad, e-posta, plaka, rezervasyon kodu) tamamen arındırılmış anonim nesne
        const start = new Date(r.giris || r.baslangic).getTime();
        const end = new Date(r.cikis || r.bitis).getTime();
        const durationMinutes = Math.max(0, Math.round((end - start) / (60 * 1000)));

        return {
          id: r.id,
          lot_id: r.lot_id,
          tarih: (r.cikis || r.bitis).slice(0, 10),
          sure_dakika: durationMinutes,
          sarj_var_mi: r.soket_tipi !== undefined,
          erisilebilir_mi: r.erisilebilir_ihtiyac_beyani === true
        };
      });
  }, [reservations, selectedLotFilter, selectedDayFilter, todayStr, sevenDaysAgoTime]);

  // Seçili günde oluşturulan rezervasyonlar (Anonim)
  const createdReservationsCount = useMemo(() => {
    return reservations.filter((r) => {
      if (selectedLotFilter !== 'hepsi' && r.lot_id !== selectedLotFilter) return false;
      if (selectedDayFilter === 'bugun') {
        return r.olusturulma.slice(0, 10) === todayStr;
      } else if (selectedDayFilter === 'son7gun') {
        return new Date(r.olusturulma).getTime() >= sevenDaysAgoTime;
      }
      return true;
    }).length;
  }, [reservations, selectedLotFilter, selectedDayFilter, todayStr, sevenDaysAgoTime]);

  // Tamamlanan ziyaretlerin ortalama süresi hesabı (Page 5: toplam (çıkış - giriş) / ziyaret sayısı)
  const averageDurationMinutes = useMemo(() => {
    if (completedVisits.length === 0) return 0;
    const totalMinutes = completedVisits.reduce((acc, v) => acc + v.sure_dakika, 0);
    return Math.round(totalMinutes / completedVisits.length);
  }, [completedVisits]);

  // Toplam şehir geneli fiziksel doluluk
  const totalPhysicalInside = useMemo(() => {
    return reservations.filter(r => {
      if (selectedLotFilter !== 'hepsi' && r.lot_id !== selectedLotFilter) return false;
      return r.durum === 'İÇERİDE';
    }).length;
  }, [reservations, selectedLotFilter]);

  const totalOpenSpaces = useMemo(() => {
    return spaces.filter(s => {
      if (selectedLotFilter !== 'hepsi' && s.lot_id !== selectedLotFilter) return false;
      return !s.kapali_mi;
    }).length;
  }, [spaces, selectedLotFilter]);

  const overallOccupancyPercent = totalOpenSpaces > 0
    ? Math.round((totalPhysicalInside / totalOpenSpaces) * 100)
    : 0;

  // Erişilebilir Park Sayısı (Page 5)
  const accessibleSpacesCount = useMemo(() => {
    return spaces.filter(s => s.tur === 'erisilebilir' && !s.kapali_mi).length;
  }, [spaces]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Üst Başlık */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                Akıllı Şehir Ulaşım Yönetimi
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Belediye Analitik & Raporlama Ekranı
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Belediye Otopark ve Doluluk İstatistikleri
            </h1>
          </div>

          {/* Gizlilik & KVKK Güvencesi Rozeti (Page 5) */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kişisel Veriler Maskelenmiştir (KVKK Uyumlu)</span>
          </div>
        </div>

        {/* Filtreleme Çubuğu (Otopark & Gün) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 shrink-0">Tesis Filtresi:</span>
            <select
              value={selectedLotFilter}
              onChange={(e) => setSelectedLotFilter(e.target.value)}
              aria-label="Tesis filtresi seçimi"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden w-full sm:w-auto"
            >
              <option value="hepsi">Tüm Tesisler (Kadıköy, Beşiktaş, Üsküdar)</option>
              {lots.map(l => (
                <option key={l.id} value={l.id}>{l.ad}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 shrink-0">Zaman Filtresi:</span>
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              aria-label="Zaman filtresi seçimi"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden w-full sm:w-auto"
            >
              <option value="bugun">Bugün ({formatIstanbulDate(currentDemoTime)})</option>
              <option value="son7gun">Son 7 Günlük Dönem</option>
              <option value="tumu">Tüm Kayıtlar</option>
            </select>
          </div>
        </div>
      </div>

      {/* BELEDİYE METRİKLERİ KARTLARI (Page 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Şehir Fiziksel Doluluk</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            %{overallOccupancyPercent}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {totalPhysicalInside} araç içeride / {totalOpenSpaces} açık yer
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Oluşturulan Rezervasyon</span>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {createdReservationsCount}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Seçili zaman aralığında
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tamamlanan Ziyaret</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {completedVisits.length}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Giriş ve çıkışı yapılmış
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Ortalama Park Süresi</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {averageDurationMinutes > 0 ? `${averageDurationMinutes} dk` : 'Veri yok'}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {averageDurationMinutes > 0 ? `(~${(averageDurationMinutes / 60).toFixed(1)} saat)` : 'Tamamlanan ziyaret yok'}
          </span>
        </div>
      </div>

      {/* TESİS BAZLI DOLULUK ÇUBUKLARI (Page 5: Grafikler veritabanından üretilir) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div>
          <h2 className="font-bold text-base text-slate-900">
            Tesis Bazlı Canlı Doluluk Çubukları
          </h2>
          <p className="text-xs text-slate-500">
            Fiziksel doluluk, kapalı alanlar ve ayrılabilir kapasite dengesi
          </p>
        </div>

        <div className="space-y-4">
          {activeLots.map((l) => {
            const sum = lotSummaries[l.id];
            const pct = sum?.doluluk_yuzdesi === 'Hizmet dışı' ? 0 : Number(sum?.doluluk_yuzdesi || 0);

            return (
              <div key={l.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900">{l.ad}</span>
                    <span className="text-xs text-teal-700 font-medium ml-2">({l.ornek_bolge})</span>
                    {l.toplu_tasima_etiketi && (
                      <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        🚇 {l.toplu_tasima_etiketi}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {sum?.fiziksel_dolu_yer} / {sum?.toplam_yer} Yer Dolu ({sum?.doluluk_yuzdesi === 'Hizmet dışı' ? 'Hizmet Dışı' : `%${sum?.doluluk_yuzdesi}`})
                  </div>
                </div>

                {/* Doluluk Çubuğu */}
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                    title={`Dolu: ${sum?.fiziksel_dolu_yer}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Standart Boş: <strong>{sum?.standart_bos}</strong></span>
                  <span>Erişilebilir Boş: <strong>{sum?.erisilebilir_bos}</strong></span>
                  <span>Şarjlı Boş: <strong>{sum?.sarjli_bos}</strong></span>
                  <span>Kapalı: <strong className="text-amber-700">{sum?.kapali_yer}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ŞEHİR FAYDASI VE AKILLI ŞEHİR ENTEGRASYONU (Page 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Accessibility className="w-4 h-4 text-blue-600" />
            <span>Engelsiz Şehir & Erişilebilir Park Donanımı</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pilot bölgedeki tesislerde toplam <strong>{accessibleSpacesCount} adet erişilebilir park alanı</strong> bulunmaktadır. İhtiyaç sahibi sürücüler rezervasyon sistemiyle yer garantisi sağlayabilir.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
            <span>Erişilebilir Park Ayrılan Tesis Oranı:</span>
            <strong className="font-bold text-blue-700">%100 (Tüm Tesislerde)</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Zap className="w-4 h-4 text-teal-600" />
            <span>Toplu Taşıma ve Park & Ride Entegrasyonu</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Üsküdar Aktarma Merkezi tesisi <strong>Marmaray ve Metro entegrasyonu</strong> ile Park & Ride modelini destekleyerek tarihi yarımada ve boğaz köprülerindeki trafik yoğunluğunu azaltmayı hedefler.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
            <span>Örnek Aktarma Tesisi:</span>
            <strong className="font-bold text-teal-700">ParkCep Aktarma Merkezi</strong>
          </div>
        </div>
      </div>

      {/* ANONİM ZİYARET KAYITLARI TABLOSU (Kişisel Veri İçermez!) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Tamamlanan Ziyaret Akışı (Toplulaştırılmış Kayıtlar)
            </h3>
            <p className="text-[11px] text-slate-500">
              * KVKK ve sözleşme gereği kullanıcı adı, e-posta, plaka ve kodlar belediye ekranına yansıtılmaz.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
            {completedVisits.length} Kayıt
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Tarih</th>
                <th className="py-2.5 px-3">Tesis</th>
                <th className="py-2.5 px-3">Kalış Süresi</th>
                <th className="py-2.5 px-3">Şarj Kullanımı</th>
                <th className="py-2.5 px-3">Erişilebilirlik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedVisits.slice(0, 10).map((v, i) => (
                <tr key={v.id || i} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-medium text-slate-700">{v.tarih}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {lots.find(l => l.id === v.lot_id)?.ad.replace('ParkCep ', '')}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{v.sure_dakika} dk</td>
                  <td className="py-2.5 px-3">
                    {v.sarj_var_mi ? (
                      <span className="text-teal-700 font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Şarj Edildi
                      </span>
                    ) : (
                      <span className="text-slate-400">Yalnız Park</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {v.erisilebilir_mi ? (
                      <span className="text-blue-700 font-semibold">Erişilebilir Yer</span>
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
