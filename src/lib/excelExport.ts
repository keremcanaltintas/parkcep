import * as XLSX from 'xlsx';
import { ParkingLot, Reservation, ChargeSession, Space, Charger, LotOccupancySummary } from '@/types';
import { formatIstanbulDateTime, formatKurusToTL } from '@/lib/calculations';

// Para formatlama yardımcısı (sayı olarak)
function kurusToTLNumber(kurus?: number): number {
  if (!kurus) return 0;
  return Number((kurus / 100).toFixed(2));
}

// Kolon genişliklerini otomatik hesaplama
function fitCols(rows: any[][]) {
  const colWidths: number[] = [];
  rows.forEach((row) => {
    row.forEach((cell, colIdx) => {
      const len = cell ? String(cell).length : 0;
      colWidths[colIdx] = Math.max(colWidths[colIdx] || 10, len + 3);
    });
  });
  return colWidths.map((w) => ({ wch: Math.min(w, 40) }));
}

// -------------------------------------------------------------
// 1. İŞLETME RAPORU EXCEL DIŞA AKTARIMI
// -------------------------------------------------------------
export interface IsletmeReportOptions {
  lot: ParkingLot;
  reservations: Reservation[];
  chargeSessions: ChargeSession[];
  spaces: Space[];
  chargers: Charger[];
  summary?: LotOccupancySummary;
  dateRangeLabel: string;
  reportType?: 'hepsi' | 'rezervasyon' | 'doluluk' | 'sarj';
}

export function exportIsletmeExcelReport({
  lot,
  reservations,
  chargeSessions,
  spaces,
  chargers,
  summary,
  dateRangeLabel,
  reportType = 'hepsi'
}: IsletmeReportOptions) {
  const wb = XLSX.utils.book_new();
  const createdDate = formatIstanbulDateTime(new Date());

  // İlgili otoparkın verilerini filtrele
  const lotRes = reservations.filter((r) => r.lot_id === lot.id);
  const lotSpaces = spaces.filter((s) => s.lot_id === lot.id);
  const lotSpaceIds = new Set(lotSpaces.map((s) => s.id));
  const lotChargers = chargers.filter((c) => lotSpaceIds.has(c.space_id));
  const lotChargerIds = new Set(lotChargers.map((c) => c.id));
  const lotSessions = chargeSessions.filter((cs) => lotChargerIds.has(cs.charger_id));

  // Gelir ve metrik hesapları
  const totalParkIncomeKurus = lotRes
    .filter((r) => r.durum === 'TAMAMLANDI' || r.durum === 'İÇERİDE')
    .reduce((acc, r) => acc + (r.park_ucreti_kurus || 0), 0);

  const totalChargeIncomeKurus = lotRes
    .filter((r) => r.durum === 'TAMAMLANDI' || r.durum === 'İÇERİDE')
    .reduce((acc, r) => acc + (r.sarj_ucreti_kurus || 0), 0);

  const totalIncomeKurus = totalParkIncomeKurus + totalChargeIncomeKurus;

  const totalKwh = lotSessions.reduce((acc, s) => acc + (s.tuketilen_kWh || 0), 0);

  const completedCount = lotRes.filter((r) => r.durum === 'TAMAMLANDI').length;
  const insideCount = lotRes.filter((r) => r.durum === 'İÇERİDE').length;
  const approvedCount = lotRes.filter((r) => r.durum === 'ONAYLI').length;
  const cancelledCount = lotRes.filter((r) => r.durum === 'IPTAL' || r.durum === 'GELMEDI').length;

  // SAYFA 1: ÖZET PERFORMANS & METRİKLER
  if (reportType === 'hepsi' || reportType === 'doluluk') {
    const summaryData: any[][] = [
      ['PARKCEP AKILLI OTOPARK YÖNETİM SİSTEMİ - İŞLETME PERFORMANS RAPORU'],
      ['Rapor Tarihi:', createdDate],
      ['Tesis Adı:', lot.ad],
      ['Bölge / İlçe:', lot.ornek_bolge],
      ['Filtrelenen Dönem:', dateRangeLabel],
      [''],
      ['METRİK', 'DEĞER', 'BİRİM / AÇIKLAMA'],
      ['Toplam Kapasite', summary?.toplam_yer || lotSpaces.length, 'Park Yeri'],
      ['Açık / Kullanılabilir Yer', (summary?.toplam_yer || lotSpaces.length) - (summary?.kapali_yer || 0), 'Park Yeri'],
      ['Kapalı / Bakımdaki Yer', summary?.kapali_yer || 0, 'Park Yeri'],
      ['Anlık Fiziksel Dolu Yer', summary?.fiziksel_dolu_yer || insideCount, 'Araç'],
      ['Anlık Fiziksel Boş Yer', summary?.fiziksel_bos_yer || 0, 'Park Yeri'],
      ['Anlık Doluluk Oranı', summary?.doluluk_yuzdesi ? `%${summary.doluluk_yuzdesi}` : '%0', 'Dolu/Açık Oranı'],
      [''],
      ['DÖNEMSEL İŞLEM İSTATİSTİKLERİ', '', ''],
      ['Toplam Rezervasyon Kaydı', lotRes.length, 'Adet'],
      ['Tamamlanan Ziyaret', completedCount, 'Adet'],
      ['Şu An İçerideki Araç', insideCount, 'Adet'],
      ['Bugün Beklenen Onaylı Rezervasyon', approvedCount, 'Adet'],
      ['İptal / Gelmedi Sayısı', cancelledCount, 'Adet'],
      [''],
      ['FİNANSAL PERFORMANS', '', ''],
      ['Otopark Park Geliri', kurusToTLNumber(totalParkIncomeKurus), 'TL'],
      ['Elektrikli Şarj Geliri', kurusToTLNumber(totalChargeIncomeKurus), 'TL'],
      ['Toplam Hasılat', kurusToTLNumber(totalIncomeKurus), 'TL'],
      [''],
      ['ŞARJ İSTASYONU METRİKLERİ', '', ''],
      ['Toplam Şarj Soketi Sayısı', lotChargers.length, 'Adet'],
      ['Gerçekleşen Şarj Seansı', lotSessions.length, 'Seans'],
      ['Aktarılan Toplam Enerji', Number(totalKwh.toFixed(2)), 'kWh']
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = fitCols(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Genel Performans');
  }

  // SAYFA 2: REZERVASYONLAR VE ZİYARET DETAYLARI
  if (reportType === 'hepsi' || reportType === 'rezervasyon') {
    const resHeaders = [
      'Rezervasyon Kodu',
      'Plaka',
      'Park Yeri Kodu',
      'Tür',
      'Durum',
      'Başlangıç / Giriş',
      'Bitiş / Çıkış',
      'Kalış Süresi (Dk)',
      'Şarj Soketi',
      'Park Geliri (TL)',
      'Şarj Geliri (TL)',
      'Toplam Tutar (TL)'
    ];

    const resRows = lotRes.map((r) => {
      const spaceObj = spaces.find((s) => s.id === r.space_id);
      const start = new Date(r.giris || r.baslangic).getTime();
      const end = new Date(r.cikis || r.bitis).getTime();
      const durationMins = Math.max(0, Math.round((end - start) / 60000));

      return [
        r.kod,
        r.plaka,
        spaceObj?.kod || '-',
        r.tur === 'sarjli' ? 'Şarjlı (EV)' : r.tur === 'erisilebilir' ? 'Erişilebilir' : 'Standart',
        r.durum,
        formatIstanbulDateTime(new Date(r.giris || r.baslangic)),
        formatIstanbulDateTime(new Date(r.cikis || r.bitis)),
        durationMins,
        r.soket_tipi || 'Yok',
        kurusToTLNumber(r.park_ucreti_kurus),
        kurusToTLNumber(r.sarj_ucreti_kurus),
        kurusToTLNumber((r.park_ucreti_kurus || 0) + (r.sarj_ucreti_kurus || 0))
      ];
    });

    const resData = [
      [`${lot.ad} - REZERVASYON VE GİRİŞ/ÇIKIŞ KAYITLARI (${dateRangeLabel})`],
      ['Rapor Üretilme:', createdDate],
      [''],
      resHeaders,
      ...resRows
    ];

    const wsRes = XLSX.utils.aoa_to_sheet(resData);
    wsRes['!cols'] = fitCols(resData);
    XLSX.utils.book_append_sheet(wb, wsRes, 'Rezervasyonlar');
  }

  // SAYFA 3: ŞARJ SEANSLARI VE ENERJİ TÜKETİMİ
  if (reportType === 'hepsi' || reportType === 'sarj') {
    const chargeHeaders = [
      'Seans ID',
      'Plaka',
      'Soket Tipi',
      'İstasyon Gücü (kW)',
      'Başlangıç Zamanı',
      'Bitiş Zamanı',
      'Tüketilen Enerji (kWh)',
      'Birim Fiyat (TL/kWh)',
      'Toplam Tutar (TL)',
      'Durum'
    ];

    const chargeRows = lotSessions.map((cs) => {
      const ch = chargers.find((c) => c.id === cs.charger_id);
      return [
        cs.id,
        cs.plaka,
        ch?.soket_tipi || 'CCS2',
        ch?.guc_kW || 0,
        formatIstanbulDateTime(new Date(cs.baslangic)),
        cs.bitis ? formatIstanbulDateTime(new Date(cs.bitis)) : 'Devam Ediyor',
        Number((cs.tuketilen_kWh || 0).toFixed(2)),
        kurusToTLNumber(ch?.kWh_bedeli_kurus),
        kurusToTLNumber(cs.toplam_bedel_kurus),
        cs.durum
      ];
    });

    const chargeData = [
      [`${lot.ad} - ELEKTRİKLİ ARAÇ ŞARJ İSTASYONU SEANSLARI (${dateRangeLabel})`],
      ['Rapor Üretilme:', createdDate],
      [''],
      chargeHeaders,
      ...chargeRows
    ];

    const wsCharge = XLSX.utils.aoa_to_sheet(chargeData);
    wsCharge['!cols'] = fitCols(chargeData);
    XLSX.utils.book_append_sheet(wb, wsCharge, 'Şarj Seansları');
  }

  // SAYFA 4: ALTYAPI VE PARK YERİ ENVANTERİ
  if (reportType === 'hepsi' || reportType === 'doluluk') {
    const spaceHeaders = ['Park Yeri Kodu', 'Tür', 'Fiziksel Durum', 'Şarj Donanımı', 'Şarj Gücü', 'Birim Tarife'];
    const spaceRows = lotSpaces.map((s) => {
      const charger = chargers.find((c) => c.space_id === s.id);
      return [
        s.kod,
        s.tur === 'sarjli' ? 'Şarjlı (EV)' : s.tur === 'erisilebilir' ? 'Erişilebilir' : 'Standart',
        s.kapali_mi ? 'KAPALI (Bakımda)' : 'AÇIK (Hizmette)',
        charger ? charger.soket_tipi : 'Yok',
        charger ? `${charger.guc_kW} kW` : '-',
        formatKurusToTL(lot.saatlik_ucret_kurus) + '/saat'
      ];
    });

    const spaceData = [
      [`${lot.ad} - PARK YERİ VE DONANIM ENVANTERİ`],
      ['Rapor Üretilme:', createdDate],
      [''],
      spaceHeaders,
      ...spaceRows
    ];

    const wsSpace = XLSX.utils.aoa_to_sheet(spaceData);
    wsSpace['!cols'] = fitCols(spaceData);
    XLSX.utils.book_append_sheet(wb, wsSpace, 'Park Yerleri');
  }

  // Dosya adını güvenli oluştur
  const safeLotName = lot.ad.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ]/g, '_');
  const fileName = `ParkCep_Isletme_Raporu_${safeLotName}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

// -------------------------------------------------------------
// 2. BELEDİYE RAPORU EXCEL DIŞA AKTARIMI
// -------------------------------------------------------------
export interface BelediyeReportOptions {
  lots: ParkingLot[];
  spaces: Space[];
  chargers: Charger[];
  reservations: Reservation[];
  chargeSessions: ChargeSession[];
  lotSummaries: Record<string, LotOccupancySummary>;
  selectedLotFilter: string;
  selectedDayFilter: string;
}

export function exportBelediyeExcelReport({
  lots,
  spaces,
  chargers,
  reservations,
  chargeSessions,
  lotSummaries,
  selectedLotFilter,
  selectedDayFilter
}: BelediyeReportOptions) {
  const wb = XLSX.utils.book_new();
  const createdDate = formatIstanbulDateTime(new Date());

  const activeLots = selectedLotFilter === 'hepsi' ? lots : lots.filter((l) => l.id === selectedLotFilter);
  const activeLotIds = new Set(activeLots.map((l) => l.id));

  const dayLabel =
    selectedDayFilter === 'bugun'
      ? 'Bugün'
      : selectedDayFilter === 'son7gun'
      ? 'Son 7 Gün'
      : selectedDayFilter === 'buay'
      ? 'Bu Ay'
      : 'Tüm Zamanlar';

  // Filtrelenmiş rezervasyonlar
  const filteredRes = reservations.filter((r) => activeLotIds.has(r.lot_id));

  const totalOpenSpaces = spaces.filter((s) => activeLotIds.has(s.lot_id) && !s.kapali_mi).length;
  const totalPhysicalInside = filteredRes.filter((r) => r.durum === 'İÇERİDE').length;
  const overallOccupancyPct = totalOpenSpaces > 0 ? Math.round((totalPhysicalInside / totalOpenSpaces) * 100) : 0;

  const totalRevenueKurus = filteredRes
    .filter((r) => r.durum === 'TAMAMLANDI' || r.durum === 'İÇERİDE')
    .reduce((acc, r) => acc + (r.park_ucreti_kurus || 0) + (r.sarj_ucreti_kurus || 0), 0);

  const totalEnergyKwh = chargeSessions
    .filter((cs) => {
      const ch = chargers.find((c) => c.id === cs.charger_id);
      if (!ch) return false;
      const sp = spaces.find((s) => s.id === ch.space_id);
      return sp && activeLotIds.has(sp.lot_id);
    })
    .reduce((acc, cs) => acc + (cs.tuketilen_kWh || 0), 0);

  const completedVisits = filteredRes.filter((r) => r.durum === 'TAMAMLANDI');
  const avgDurationMinutes =
    completedVisits.length > 0
      ? Math.round(
          completedVisits.reduce((acc, v) => {
            const start = new Date(v.giris || v.baslangic).getTime();
            const end = new Date(v.cikis || v.bitis).getTime();
            return acc + Math.max(0, Math.round((end - start) / 60000));
          }, 0) / completedVisits.length
        )
      : 0;

  // SAYFA 1: ŞEHİR GENELİ ÖZET
  const citySummaryData: any[][] = [
    ['İSTANBUL BÜYÜKŞEHİR BELEDİYESİ - AKILLI ŞEHİR OTOPARK VE ULAŞIM RAPORU'],
    ['Rapor Oluşturma Zamanı:', createdDate],
    ['Kapsanan Tesis Sayısı:', activeLots.length],
    ['Filtre Dönemi:', dayLabel],
    [''],
    ['ŞEHİR GENELİ TEMEL GÖSTERGELER (KPI)', 'DEĞER', 'BİRİM / AÇIKLAMA'],
    ['Kapsamdaki Toplam Otopark Kapasitesi', spaces.filter((s) => activeLotIds.has(s.lot_id)).length, 'Park Yeri'],
    ['Şu Anki Açık Hizmet Veren Kapasite', totalOpenSpaces, 'Park Yeri'],
    ['Şu An İçerideki Toplam Araç Sayısı', totalPhysicalInside, 'Araç'],
    ['Şehir Geneli Anlık Doluluk Oranı', `%${overallOccupancyPct}`, 'Dolu / Açık Kapasite'],
    ['Toplam Gerçekleşen Rezervasyon Sayısı', filteredRes.length, 'Adet'],
    ['Tamamlanan Başarılı Ziyaret Sayısı', completedVisits.length, 'Adet'],
    ['Ortalama Araç Park Süresi', `${avgDurationMinutes} dk (~${(avgDurationMinutes / 60).toFixed(1)} sa)`, 'Dakika'],
    ['Toplam Park ve Şarj Hasılatı', kurusToTLNumber(totalRevenueKurus), 'TL'],
    ['Dağıtılan Yeşil Şarj Enerjisi', Number(totalEnergyKwh.toFixed(2)), 'kWh'],
    ['Erişilebilir (Engelli) Park Yeri Sayısı', spaces.filter((s) => activeLotIds.has(s.lot_id) && s.tur === 'erisilebilir').length, 'Adet'],
    ['Elektrikli Araç Şarj Soketi Sayısı', chargers.filter((c) => {
      const sp = spaces.find((s) => s.id === c.space_id);
      return sp && activeLotIds.has(sp.lot_id);
    }).length, 'Adet']
  ];

  const wsCity = XLSX.utils.aoa_to_sheet(citySummaryData);
  wsCity['!cols'] = fitCols(citySummaryData);
  XLSX.utils.book_append_sheet(wb, wsCity, 'Şehir Özeti');

  // SAYFA 2: İLÇE VE TESİS BAZLI DOLULUK VE PERFORMANS
  const lotHeaders = [
    'Tesis Adı',
    'İlçe / Bölge',
    'Saatlik Ücret (TL)',
    'Toplam Kapasite',
    'Açık Yer',
    'Kapalı Yer',
    'Anlık Dolu Yer',
    'Anlık Boş Yer',
    'Doluluk (%)',
    'Toplu Taşıma Entegre',
    'Şarj Soket Sayısı'
  ];

  const lotRows = activeLots.map((lot) => {
    const sum = lotSummaries[lot.id];
    const lotSpaces = spaces.filter((s) => s.lot_id === lot.id);
    const lotSpaceIds = new Set(lotSpaces.map((s) => s.id));
    const lotChCount = chargers.filter((c) => lotSpaceIds.has(c.space_id)).length;

    return [
      lot.ad,
      lot.ornek_bolge,
      kurusToTLNumber(lot.saatlik_ucret_kurus),
      sum?.toplam_yer || lotSpaces.length,
      (sum?.toplam_yer || lotSpaces.length) - (sum?.kapali_yer || 0),
      sum?.kapali_yer || 0,
      sum?.fiziksel_dolu_yer || 0,
      sum?.fiziksel_bos_yer || 0,
      sum?.doluluk_yuzdesi === 'Hizmet dışı' ? 'Hizmet Dışı' : `%${sum?.doluluk_yuzdesi || 0}`,
      lot.toplu_tasima_etiketi ? 'Evet (Metro/Marmaray)' : 'Hayır',
      lotChCount
    ];
  });

  const lotData = [
    ['İSTANBUL İLÇE VE TESİS BAZLI KAPASİTE VE DOLULUK ANALİZİ'],
    ['Rapor Üretilme:', createdDate],
    [''],
    lotHeaders,
    ...lotRows
  ];

  const wsLots = XLSX.utils.aoa_to_sheet(lotData);
  wsLots['!cols'] = fitCols(lotData);
  XLSX.utils.book_append_sheet(wb, wsLots, 'İlçe ve Tesisler');

  // SAYFA 3: KVKK UYUMLU ANONİM ZİYARET AKIŞI
  const visitHeaders = ['Ziyaret ID', 'Tarih', 'Tesis Adı', 'Bölge', 'Park Süresi (Dk)', 'Şarj Hizmeti', 'Erişilebilir Talep'];
  const visitRows = completedVisits.map((v, idx) => {
    const lotObj = lots.find((l) => l.id === v.lot_id);
    const start = new Date(v.giris || v.baslangic).getTime();
    const end = new Date(v.cikis || v.bitis).getTime();
    const durationMins = Math.max(0, Math.round((end - start) / 60000));

    return [
      `Z-${idx + 1001}`,
      (v.cikis || v.bitis).slice(0, 10),
      lotObj?.ad.replace('ParkCep ', '') || '-',
      lotObj?.ornek_bolge || '-',
      durationMins,
      v.soket_tipi ? `Evet (${v.soket_tipi})` : 'Hayır',
      v.erisilebilir_ihtiyac_beyani ? 'Evet' : 'Hayır'
    ];
  });

  const visitData = [
    ['KVKK UYUMLU ANONİM ZİYARET VE HAREKETLİLİK AKIŞI'],
    ['* Kişisel veri (isim, telefon, plaka, kod) içermez; kentsel planlama ve trafik modellemesi içindir.'],
    ['Rapor Üretilme:', createdDate],
    [''],
    visitHeaders,
    ...visitRows
  ];

  const wsVisits = XLSX.utils.aoa_to_sheet(visitData);
  wsVisits['!cols'] = fitCols(visitData);
  XLSX.utils.book_append_sheet(wb, wsVisits, 'Anonim Ziyaret Akışı');

  // SAYFA 4: ŞEHİR GENELİ ELEKTRİKLİ ŞARJ AĞI İSTATİSTİKLERİ
  const evHeaders = ['Tesis Adı', 'Bölge', 'Soket ID', 'Soket Tipi', 'Güç (kW)', 'Durum', 'Birim Fiyat (TL/kWh)'];
  const evRows: any[][] = [];

  activeLots.forEach((l) => {
    const lSpaces = spaces.filter((s) => s.lot_id === l.id && s.tur === 'sarjli');
    const lSpaceIds = new Set(lSpaces.map((s) => s.id));
    const lChargers = chargers.filter((c) => lSpaceIds.has(c.space_id));

    lChargers.forEach((c) => {
      evRows.push([
        l.ad,
        l.ornek_bolge,
        c.id,
        c.soket_tipi,
        c.guc_kW,
        c.durum,
        kurusToTLNumber(c.kWh_bedeli_kurus)
      ]);
    });
  });

  const evData = [
    ['ŞEHİR GENELİ ELEKTRİKLİ ŞARJ ALTYAPISI VE SOKET DAĞILIMI'],
    ['Rapor Üretilme:', createdDate],
    [''],
    evHeaders,
    ...evRows
  ];

  const wsEv = XLSX.utils.aoa_to_sheet(evData);
  wsEv['!cols'] = fitCols(evData);
  XLSX.utils.book_append_sheet(wb, wsEv, 'Şarj Altyapısı');

  const fileName = `ParkCep_Belediye_Sehir_Raporu_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
