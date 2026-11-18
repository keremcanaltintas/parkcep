import { Reservation, Space, ParkingLot, LotOccupancySummary, SpaceType } from '@/types';

/**
 * Demo zamanına göre güncel Date objesi döndürür
 */
export function getDemoDate(offsetSeconds: number): Date {
  return new Date(Date.now() + offsetSeconds * 1000);
}

/**
 * Europe/Istanbul saat dilimine göre formatlar
 */
export function formatIstanbulDateTime(date: Date | string, includeSeconds = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false
  }).format(d);
}

export function formatIstanbulTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);
}

export function formatIstanbulDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d);
}

/**
 * Kuruş değerini TL stringine çevirir (örn: 4000 -> "40 TL")
 */
export function formatKurusToTL(kurus: number): string {
  const tl = kurus / 100;
  return `${tl.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} TL`;
}

/**
 * İki zaman aralığının çakışıp çakışmadığını denetler: [startA, endA) ve [startB, endB)
 * PDF Kuralı: 10:00-11:00 ile 11:00-12:00 çakışmaz!
 */
export function isOverlapping(
  startA: Date | string,
  endA: Date | string,
  startB: Date | string,
  endB: Date | string
): boolean {
  const a1 = new Date(startA).getTime();
  const a2 = new Date(endA).getTime();
  const b1 = new Date(startB).getTime();
  const b2 = new Date(endB).getTime();

  return a1 < b2 && b1 < a2;
}

/**
 * Park bedeli hesabı (Page 4 & Page 8 / T11):
 * Yukarı yuvarlanan saat * saatlik tarife, en az 1 saat.
 * Örn: 61 dakika, 40 TL/saat tarifede -> Math.ceil(61/60) = 2 saat * 40 TL = 80 TL.
 */
export function calculateParkingPriceKurus(
  start: Date | string,
  end: Date | string,
  hourlyRateKurus: number
): { hoursCharged: number; minutes: number; totalKurus: number } {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const diffMinutes = Math.max(0, (e - s) / (60 * 1000));
  
  // En az 1 saat, üzeri yukarı yuvarlanır
  const hoursCharged = Math.max(1, Math.ceil(diffMinutes / 60));
  const totalKurus = hoursCharged * hourlyRateKurus;

  return {
    hoursCharged,
    minutes: Math.round(diffMinutes),
    totalKurus
  };
}

/**
 * Şarj bedeli hesabı: kWh * kWh_bedeli_kurus
 * Örn: 10 kWh * 10 TL/kWh = 100 TL
 */
export function calculateChargePriceKurus(
  energyKwh: number,
  kwhRateKurus: number
): number {
  return Math.round(energyKwh * kwhRateKurus);
}

/**
 * Tesis bazlı doluluk göstergeleri hesabı (Page 5)
 */
export function calculateLotOccupancy(
  lot: ParkingLot,
  spaces: Space[],
  reservations: Reservation[],
  currentDemoTime: Date
): LotOccupancySummary {
  const lotSpaces = spaces.filter(s => s.lot_id === lot.id);
  const toplam_yer = lotSpaces.length;
  const kapali_yer = lotSpaces.filter(s => s.kapali_mi).length;

  // Fiziksel dolu yer: durum === 'İÇERİDE' olan araç sayısı
  const insideReservations = reservations.filter(
    r => r.lot_id === lot.id && r.durum === 'İÇERİDE'
  );
  const fiziksel_dolu_yer = insideReservations.length;

  // Fiziksel boş = toplam - kapalı - içerideki araç
  const fiziksel_bos_yer = Math.max(0, toplam_yer - kapali_yer - fiziksel_dolu_yer);

  // Yüzde = içerideki araç / açık yer * 100; açık yer sıfırsa "Hizmet dışı"
  const acik_yer = toplam_yer - kapali_yer;
  let doluluk_yuzdesi: number | 'Hizmet dışı' = 'Hizmet dışı';
  if (acik_yer > 0) {
    doluluk_yuzdesi = Math.min(100, Math.round((fiziksel_dolu_yer / acik_yer) * 100));
  }

  // Bugün beklenen rezervasyon: bugünün tarihi içinde ONAYLI rezervasyonlar
  const demoDayString = currentDemoTime.toISOString().slice(0, 10);
  const bugun_beklenen_rezervasyon = reservations.filter(r => {
    if (r.lot_id !== lot.id || r.durum !== 'ONAYLI') return false;
    return r.baslangic.slice(0, 10) === demoDayString;
  }).length;

  // Tür bazında boş yerler (şu anki fiziksel durum)
  const insideSpaceIds = new Set(insideReservations.map(r => r.space_id));

  const standart_spaces = lotSpaces.filter(s => s.tur === 'standart');
  const erisilebilir_spaces = lotSpaces.filter(s => s.tur === 'erisilebilir');
  const sarjli_spaces = lotSpaces.filter(s => s.tur === 'sarjli');

  const standart_bos = standart_spaces.filter(s => !s.kapali_mi && !insideSpaceIds.has(s.id)).length;
  const erisilebilir_bos = erisilebilir_spaces.filter(s => !s.kapali_mi && !insideSpaceIds.has(s.id)).length;
  const sarjli_bos = sarjli_spaces.filter(s => !s.kapali_mi && !insideSpaceIds.has(s.id)).length;

  return {
    lot,
    toplam_yer,
    kapali_yer,
    fiziksel_dolu_yer,
    fiziksel_bos_yer,
    bugun_beklenen_rezervasyon,
    doluluk_yuzdesi,
    standart_bos,
    erisilebilir_bos,
    sarjli_bos,
    standart_toplam: standart_spaces.length,
    erisilebilir_toplam: erisilebilir_spaces.length,
    sarjli_toplam: sarjli_spaces.length,
  };
}

/**
 * Belirli bir zaman aralığında [start, end) seçilen park türü için ayrılabilir kapasiteyi hesaplar
 * ve uygun en küçük kaynak kimliğini seçer (Page 4).
 */
export function findAvailableSpace(
  lotId: string,
  tur: SpaceType,
  start: Date | string,
  end: Date | string,
  spaces: Space[],
  reservations: Reservation[],
  currentDemoTime: Date
): Space | null {
  // Otoparka ve türe ait açık yerler
  const candidateSpaces = spaces
    .filter(s => s.lot_id === lotId && s.tur === tur && !s.kapali_mi)
    .sort((a, b) => a.id.localeCompare(b.id)); // En küçük kaynak kimliği

  for (const space of candidateSpaces) {
    // 1. Demoda içerideki aracın gelecekte çıkacağı varsayılmaz:
    // Eğer araç şu anda içerideyse ve istenen aralık şimdiyi kapsıyorsa adaydan çıkar
    const isCurrentlyInside = reservations.some(
      r => r.space_id === space.id && r.durum === 'İÇERİDE'
    );
    if (isCurrentlyInside) {
      // İçerideki araç varsa bu kaynak elenir
      continue;
    }

    // 2. İstenen aralıkla çakışan ONAYLI veya İÇERİDE rezervasyon var mı?
    const hasConflict = reservations.some(r => {
      if (r.space_id !== space.id) return false;
      if (r.durum !== 'ONAYLI' && r.durum !== 'İÇERİDE') return false;
      return isOverlapping(start, end, r.baslangic, r.bitis);
    });

    if (!hasConflict) {
      return space; // Uygun en küçük kaynak bulundu
    }
  }

  return null;
}

/**
 * Seçilen zaman aralığı için ayrılabilir toplam kapasite sayısını hesaplar
 */
export function getAvailableCapacityForRange(
  lotId: string,
  tur: SpaceType | 'hepsi',
  start: Date | string,
  end: Date | string,
  spaces: Space[],
  reservations: Reservation[],
  currentDemoTime: Date
): number {
  const lotSpaces = spaces.filter(s => s.lot_id === lotId && !s.kapali_mi);
  let availableCount = 0;

  for (const space of lotSpaces) {
    if (tur !== 'hepsi' && space.tur !== tur) continue;

    const isCurrentlyInside = reservations.some(
      r => r.space_id === space.id && r.durum === 'İÇERİDE'
    );
    if (isCurrentlyInside) continue;

    const hasConflict = reservations.some(r => {
      if (r.space_id !== space.id) return false;
      if (r.durum !== 'ONAYLI' && r.durum !== 'İÇERİDE') return false;
      return isOverlapping(start, end, r.baslangic, r.bitis);
    });

    if (!hasConflict) {
      availableCount++;
    }
  }

  return availableCount;
}

/**
 * Giriş işlemi uygunluk kontrolü (Page 4):
 * Giriş yalnızca başlangıçtan itibaren 10 dakika içinde yapılır; erken giriş reddedilir.
 * Başlangıç + 10 dakikada hâlâ giriş yoksa GELMEDİ olur.
 */
export function validateCheckInTime(
  reservation: Reservation,
  demoTime: Date
): { allowed: boolean; reason?: string } {
  const startTime = new Date(reservation.baslangic).getTime();
  const current = demoTime.getTime();
  const tenMinutesMs = 10 * 60 * 1000;

  if (current < startTime) {
    const diffMins = Math.ceil((startTime - current) / (60 * 1000));
    return {
      allowed: false,
      reason: `Giriş saatinize henüz ${diffMins} dakika var. Rezervasyon başlangıç saati gelmeden giriş yapılamaz.`
    };
  }

  if (current > startTime + tenMinutesMs) {
    return {
      allowed: false,
      reason: 'Giriş süresi aşılmıştır (başlangıç saati üzerinden 10 dakikadan fazla geçti). Rezervasyon GELMEDİ olarak işaretlenmiştir.'
    };
  }

  return { allowed: true };
}

/**
 * Araç çıkış gecikmesi kontrolü (Page 4):
 * Bitiş saati geçince araç otomatik çıkarılmaz: İÇERİDE kalır ve gecikme uyarısı gösterilir.
 */
export function isExitOverdue(reservation: Reservation, demoTime: Date): boolean {
  if (reservation.durum !== 'İÇERİDE') return false;
  const endTime = new Date(reservation.bitis).getTime();
  return demoTime.getTime() > endTime;
}

export function getExitOverdueMinutes(reservation: Reservation, demoTime: Date): number {
  if (reservation.durum !== 'İÇERİDE') return 0;
  const endTime = new Date(reservation.bitis).getTime();
  const diff = demoTime.getTime() - endTime;
  return diff > 0 ? Math.floor(diff / (60 * 1000)) : 0;
}
