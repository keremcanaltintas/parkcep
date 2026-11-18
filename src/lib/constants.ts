import { ParkingLot, Space, Charger, User, Reservation, ChargeSession, AuditLog } from '@/types';

export const INITIAL_PARKING_LOTS: ParkingLot[] = [
  {
    id: 'merkez',
    ad: 'ParkCep Merkez Otoparkı',
    ornek_bolge: 'Kadıköy / Rıhtım',
    lat: 40.9904,
    lng: 29.0253,
    saatlik_ucret_kurus: 4000, // 40 TL / saat
    veri_zamani: '1 dk önce güncellendi',
    calisma_saatleri: '24 Saat Açık',
    aciklama: 'Rıhtım ve vapur iskelelerine 2 dakika yürüme mesafesinde, hızlı DC şarj istasyonlarına sahip ana tesis.'
  },
  {
    id: 'kampus',
    ad: 'ParkCep Kampüs Otoparkı',
    ornek_bolge: 'Beşiktaş / Üniversite',
    lat: 41.0428,
    lng: 29.0077,
    saatlik_ucret_kurus: 3000, // 30 TL / saat
    veri_zamani: '2 dk önce güncellendi',
    calisma_saatleri: '24 Saat Açık',
    aciklama: 'Üniversite kampüsleri ve sahil caddesi kesişiminde yer alan, AC Type 2 şarj üniteli tesis.'
  },
  {
    id: 'aktarma',
    ad: 'ParkCep Aktarma Merkezi Otoparkı',
    ornek_bolge: 'Üsküdar / Marmaray Aktarma',
    lat: 41.0267,
    lng: 29.0152,
    saatlik_ucret_kurus: 2500, // 25 TL / saat
    veri_zamani: 'Az önce güncellendi',
    toplu_tasima_etiketi: 'Toplu taşımaya yakın • örnek',
    calisma_saatleri: '24 Saat Açık',
    aciklama: 'Marmaray, metro ve metrobüs aktarma aksında yer alan, Park & Ride entegrasyonuna uygun ekonomik tesis.'
  }
];

// Toplam 30 Park Yeri: 12 Merkez + 10 Kampüs + 8 Aktarma
// 1 standart yer kapalı: merkez-s8
export const INITIAL_SPACES: Space[] = [
  // --- Merkez Otoparkı (12 yer = 8 standart + 2 erişilebilir + 2 şarjlı) ---
  { id: 'merkez-s1', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S01' }, // İÇERİDE (34 PC 101)
  { id: 'merkez-s2', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S02' },
  { id: 'merkez-s3', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S03' },
  { id: 'merkez-s4', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S04' },
  { id: 'merkez-s5', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S05' },
  { id: 'merkez-s6', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S06' },
  { id: 'merkez-s7', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S07' },
  { id: 'merkez-s8', lot_id: 'merkez', tur: 'standart', kapali_mi: true, kod: 'M-S08' }, // 1 KAPALI YER
  { id: 'merkez-e1', lot_id: 'merkez', tur: 'erisilebilir', kapali_mi: false, kod: 'M-E01' },
  { id: 'merkez-e2', lot_id: 'merkez', tur: 'erisilebilir', kapali_mi: false, kod: 'M-E02' },
  { id: 'merkez-c1', lot_id: 'merkez', tur: 'sarjli', kapali_mi: false, kod: 'M-Ş01' },
  { id: 'merkez-c2', lot_id: 'merkez', tur: 'sarjli', kapali_mi: false, kod: 'M-Ş02' },

  // --- Kampüs Otoparkı (10 yer = 7 standart + 1 erişilebilir + 2 şarjlı) ---
  { id: 'kampus-s1', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S01' }, // İÇERİDE (34 PC 202)
  { id: 'kampus-s2', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S02' },
  { id: 'kampus-s3', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S03' },
  { id: 'kampus-s4', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S04' },
  { id: 'kampus-s5', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S05' },
  { id: 'kampus-s6', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S06' },
  { id: 'kampus-s7', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S07' },
  { id: 'kampus-e1', lot_id: 'kampus', tur: 'erisilebilir', kapali_mi: false, kod: 'K-E01' },
  { id: 'kampus-c1', lot_id: 'kampus', tur: 'sarjli', kapali_mi: false, kod: 'K-Ş01' },
  { id: 'kampus-c2', lot_id: 'kampus', tur: 'sarjli', kapali_mi: false, kod: 'K-Ş02' },

  // --- Aktarma Otoparkı (8 yer = 5 standart + 1 erişilebilir + 2 şarjlı) ---
  { id: 'aktarma-s1', lot_id: 'aktarma', tur: 'standart', kapali_mi: false, kod: 'A-S01' }, // İÇERİDE (34 PC 303)
  { id: 'aktarma-s2', lot_id: 'aktarma', tur: 'standart', kapali_mi: false, kod: 'A-S02' },
  { id: 'aktarma-s3', lot_id: 'aktarma', tur: 'standart', kapali_mi: false, kod: 'A-S03' },
  { id: 'aktarma-s4', lot_id: 'aktarma', tur: 'standart', kapali_mi: false, kod: 'A-S04' },
  { id: 'aktarma-s5', lot_id: 'aktarma', tur: 'standart', kapali_mi: false, kod: 'A-S05' },
  { id: 'aktarma-e1', lot_id: 'aktarma', tur: 'erisilebilir', kapali_mi: false, kod: 'A-E01' },
  { id: 'aktarma-c1', lot_id: 'aktarma', tur: 'sarjli', kapali_mi: false, kod: 'A-Ş01' },
  { id: 'aktarma-c2', lot_id: 'aktarma', tur: 'sarjli', kapali_mi: false, kod: 'A-Ş02' },
];

// Şarj Cihazları
export const INITIAL_CHARGERS: Charger[] = [
  // Merkez: CCS2 120 kW, 10 TL/kWh (1000 kurus)
  { id: 'ch-merkez-1', space_id: 'merkez-c1', soket_tipi: 'CCS2', guc_kW: 120, durum: 'HAZIR', kWh_bedeli_kurus: 1000 },
  { id: 'ch-merkez-2', space_id: 'merkez-c2', soket_tipi: 'CCS2', guc_kW: 120, durum: 'HAZIR', kWh_bedeli_kurus: 1000 },

  // Kampüs: Type 2 22 kW, 8 TL/kWh (800 kurus)
  { id: 'ch-kampus-1', space_id: 'kampus-c1', soket_tipi: 'Type 2', guc_kW: 22, durum: 'HAZIR', kWh_bedeli_kurus: 800 },
  { id: 'ch-kampus-2', space_id: 'kampus-c2', soket_tipi: 'Type 2', guc_kW: 22, durum: 'HAZIR', kWh_bedeli_kurus: 800 },

  // Aktarma: CCS2 60 kW, 9 TL/kWh (900 kurus)
  { id: 'ch-aktarma-1', space_id: 'aktarma-c1', soket_tipi: 'CCS2', guc_kW: 60, durum: 'HAZIR', kWh_bedeli_kurus: 900 },
  { id: 'ch-aktarma-2', space_id: 'aktarma-c2', soket_tipi: 'CCS2', guc_kW: 60, durum: 'HAZIR', kWh_bedeli_kurus: 900 },
];

// Demo Kullanıcıları (Page 6)
export const DEMO_USERS: User[] = [
  {
    id: 'user-surucu-1',
    ad: 'Ahmet Yılmaz',
    email: 'ahmet@parkcep.com',
    parola_hash: 'demo123',
    rol: 'surucu',
    avatar: '🚗'
  },
  {
    id: 'user-surucu-2',
    ad: 'Ayşe Kaya',
    email: 'ayse@parkcep.com',
    parola_hash: 'demo123',
    rol: 'surucu',
    avatar: '🚙'
  },
  {
    id: 'user-gorevli-merkez',
    ad: 'Mehmet Demir',
    email: 'merkez.gorevli@parkcep.com',
    parola_hash: 'demo123',
    rol: 'gorevli',
    assigned_lot_id: 'merkez',
    avatar: '👮‍♂️'
  },
  {
    id: 'user-gorevli-kampus',
    ad: 'Ali Can',
    email: 'kampus.gorevli@parkcep.com',
    parola_hash: 'demo123',
    rol: 'gorevli',
    assigned_lot_id: 'kampus',
    avatar: '👮'
  },
  {
    id: 'user-gorevli-aktarma',
    ad: 'Fatma Koç',
    email: 'aktarma.gorevli@parkcep.com',
    parola_hash: 'demo123',
    rol: 'gorevli',
    assigned_lot_id: 'aktarma',
    avatar: '👮‍♀️'
  },
  {
    id: 'user-belediye',
    ad: 'Ulaşım Daire Başkanlığı',
    email: 'belediye@ulasim.gov.tr',
    parola_hash: 'demo123',
    rol: 'belediye',
    avatar: '🏛️'
  },
  {
    id: 'user-admin',
    ad: 'Sistem Yöneticisi',
    email: 'admin@parkcep.com',
    parola_hash: 'demo123',
    rol: 'demo_yoneticisi',
    avatar: '⚡'
  }
];

export const STATIC_SEED_TIMESTAMP = 1795003200000; // 2026-11-18T12:00:00.000Z

// Başlangıç Rezervasyonları ve Ziyaretleri üreten yardımcı fonksiyon
// Demo saatine göre dinamik olarak tarih üretir:
// 3 İÇERİDE araç, 4 gelecek ONAYLI rezervasyon, son 7 güne yayılmış 12 TAMAMLANDI ziyaret
export function createInitialReservations(baseTime: Date = new Date(STATIC_SEED_TIMESTAMP)): Reservation[] {
  const now = baseTime.getTime();
  const ONE_HOUR = 3600 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;

  const reservations: Reservation[] = [
    // --- 3 İÇERİDE ARAÇ (1 Merkez, 1 Kampüs, 1 Aktarma) ---
    {
      id: 'res-active-1',
      kod: 'PC-10101',
      user_id: 'user-surucu-1',
      user_ad: 'Ahmet Yılmaz',
      user_email: 'ahmet@parkcep.com',
      space_id: 'merkez-s1',
      lot_id: 'merkez',
      baslangic: new Date(now - 1.5 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 2 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'uygulama',
      giris: new Date(now - 1.4 * ONE_HOUR).toISOString(),
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 3 * ONE_HOUR).toISOString(),
      plaka: '34 PC 101'
    },
    {
      id: 'res-active-2',
      kod: 'PC-20202',
      space_id: 'kampus-s1',
      lot_id: 'kampus',
      baslangic: new Date(now - 45 * 60 * 1000).toISOString(),
      bitis: new Date(now + 1.5 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'gorevli', // walk-in rezervasyonsuz giriş
      giris: new Date(now - 45 * 60 * 1000).toISOString(),
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 45 * 60 * 1000).toISOString(),
      plaka: '34 PC 202'
    },
    {
      id: 'res-active-3',
      kod: 'PC-30303',
      user_id: 'user-surucu-2',
      user_ad: 'Ayşe Kaya',
      user_email: 'ayse@parkcep.com',
      space_id: 'aktarma-s1',
      lot_id: 'aktarma',
      baslangic: new Date(now - 30 * 60 * 1000).toISOString(),
      bitis: new Date(now + 3 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'uygulama',
      giris: new Date(now - 25 * 60 * 1000).toISOString(),
      saatlik_tarife_kurus: 2500,
      olusturulma: new Date(now - 2 * ONE_HOUR).toISOString(),
      plaka: '34 PC 303'
    },

    // --- 4 ÇAKIŞMAYAN GELECEK REZERVASYON (ONAYLI) ---
    {
      id: 'res-future-1',
      kod: 'PC-40401',
      user_id: 'user-surucu-1',
      user_ad: 'Ahmet Yılmaz',
      user_email: 'ahmet@parkcep.com',
      space_id: 'merkez-s2',
      lot_id: 'merkez',
      baslangic: new Date(now + 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 4 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 1 * ONE_HOUR).toISOString(),
      plaka: '34 PC 101'
    },
    {
      id: 'res-future-2',
      kod: 'PC-40402',
      user_id: 'user-surucu-2',
      user_ad: 'Ayşe Kaya',
      user_email: 'ayse@parkcep.com',
      space_id: 'merkez-c1',
      lot_id: 'merkez',
      baslangic: new Date(now + 5 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 7 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      sarj_tarife_kurus: 1000,
      soket_tipi: 'CCS2',
      olusturulma: new Date(now - 2 * ONE_HOUR).toISOString(),
      plaka: '34 EV 888'
    },
    {
      id: 'res-future-3',
      kod: 'PC-40403',
      user_id: 'user-surucu-1',
      user_ad: 'Ahmet Yılmaz',
      user_email: 'ahmet@parkcep.com',
      space_id: 'kampus-e1',
      lot_id: 'kampus',
      baslangic: new Date(now + 1 * ONE_DAY).toISOString(),
      bitis: new Date(now + 1 * ONE_DAY + 2 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      erisilebilir_ihtiyac_beyani: true,
      olusturulma: new Date(now - 3 * ONE_HOUR).toISOString(),
      plaka: '34 ENG 01'
    },
    {
      id: 'res-future-4',
      kod: 'PC-40404',
      user_id: 'user-surucu-2',
      user_ad: 'Ayşe Kaya',
      user_email: 'ayse@parkcep.com',
      space_id: 'aktarma-c1',
      lot_id: 'aktarma',
      baslangic: new Date(now + 2 * ONE_DAY).toISOString(),
      bitis: new Date(now + 2 * ONE_DAY + 3 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 2500,
      sarj_tarife_kurus: 900,
      soket_tipi: 'CCS2',
      olusturulma: new Date(now - 4 * ONE_HOUR).toISOString(),
      plaka: '34 EV 999'
    },

    // --- SON 7 GÜNE YAYILMIŞ 12 TAMAMLANAN ZİYARET (TAMAMLANDI) ---
    // (Belediye paneli ortalama süre ve geçmiş istatistik hesapları için)
    {
      id: 'res-comp-1',
      kod: 'PC-90101',
      space_id: 'merkez-s3',
      lot_id: 'merkez',
      baslangic: new Date(now - 0.5 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 0.5 * ONE_DAY).toISOString(),
      giris: new Date(now - 0.5 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 0.5 * ONE_DAY).toISOString(), // süre: 120 dk
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 1 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-2',
      kod: 'PC-90102',
      space_id: 'kampus-s2',
      lot_id: 'kampus',
      baslangic: new Date(now - 1 * ONE_DAY - 1.5 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 1 * ONE_DAY).toISOString(),
      giris: new Date(now - 1 * ONE_DAY - 1.5 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 1 * ONE_DAY).toISOString(), // süre: 90 dk
      durum: 'TAMAMLANDI',
      kaynak: 'gorevli',
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 1.5 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-3',
      kod: 'PC-90103',
      space_id: 'aktarma-s2',
      lot_id: 'aktarma',
      baslangic: new Date(now - 1.5 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 1.5 * ONE_DAY).toISOString(),
      giris: new Date(now - 1.5 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 1.5 * ONE_DAY).toISOString(), // süre: 180 dk
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 2500,
      olusturulma: new Date(now - 2 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-4',
      kod: 'PC-90104',
      space_id: 'merkez-c1',
      lot_id: 'merkez',
      baslangic: new Date(now - 2 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 2 * ONE_DAY).toISOString(),
      giris: new Date(now - 2 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 2 * ONE_DAY).toISOString(), // süre: 60 dk
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      sarj_tarife_kurus: 1000,
      olusturulma: new Date(now - 2.5 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-5',
      kod: 'PC-90105',
      space_id: 'kampus-s3',
      lot_id: 'kampus',
      baslangic: new Date(now - 2.5 * ONE_DAY - 2.5 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 2.5 * ONE_DAY).toISOString(),
      giris: new Date(now - 2.5 * ONE_DAY - 2.5 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 2.5 * ONE_DAY).toISOString(), // süre: 150 dk
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 3 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-6',
      kod: 'PC-90106',
      space_id: 'aktarma-s3',
      lot_id: 'aktarma',
      baslangic: new Date(now - 3 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 3 * ONE_DAY).toISOString(),
      giris: new Date(now - 3 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 3 * ONE_DAY).toISOString(), // süre: 240 dk
      durum: 'TAMAMLANDI',
      kaynak: 'gorevli',
      saatlik_tarife_kurus: 2500,
      olusturulma: new Date(now - 3.5 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-7',
      kod: 'PC-90107',
      space_id: 'merkez-s4',
      lot_id: 'merkez',
      baslangic: new Date(now - 4 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 4 * ONE_DAY).toISOString(),
      giris: new Date(now - 4 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 4 * ONE_DAY).toISOString(), // süre: 60 dk
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 4.5 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-8',
      kod: 'PC-90108',
      space_id: 'kampus-c1',
      lot_id: 'kampus',
      baslangic: new Date(now - 4.5 * ONE_DAY - 1.5 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 4.5 * ONE_DAY).toISOString(),
      giris: new Date(now - 4.5 * ONE_DAY - 1.5 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 4.5 * ONE_DAY).toISOString(), // süre: 90 dk
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      sarj_tarife_kurus: 800,
      olusturulma: new Date(now - 5 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-9',
      kod: 'PC-90109',
      space_id: 'aktarma-s4',
      lot_id: 'aktarma',
      baslangic: new Date(now - 5 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 5 * ONE_DAY).toISOString(),
      giris: new Date(now - 5 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 5 * ONE_DAY).toISOString(), // süre: 120 dk
      durum: 'TAMAMLANDI',
      kaynak: 'gorevli',
      saatlik_tarife_kurus: 2500,
      olusturulma: new Date(now - 5.5 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-10',
      kod: 'PC-90110',
      space_id: 'merkez-e1',
      lot_id: 'merkez',
      baslangic: new Date(now - 5.5 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 5.5 * ONE_DAY).toISOString(),
      giris: new Date(now - 5.5 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 5.5 * ONE_DAY).toISOString(), // süre: 60 dk
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      erisilebilir_ihtiyac_beyani: true,
      olusturulma: new Date(now - 6 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-11',
      kod: 'PC-90111',
      space_id: 'kampus-s4',
      lot_id: 'kampus',
      baslangic: new Date(now - 6 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 6 * ONE_DAY).toISOString(),
      giris: new Date(now - 6 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 6 * ONE_DAY).toISOString(), // süre: 180 dk
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 6.5 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-12',
      kod: 'PC-90112',
      space_id: 'aktarma-c2',
      lot_id: 'aktarma',
      baslangic: new Date(now - 6.5 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 6.5 * ONE_DAY).toISOString(),
      giris: new Date(now - 6.5 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 6.5 * ONE_DAY).toISOString(), // süre: 120 dk
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 2500,
      sarj_tarife_kurus: 900,
      olusturulma: new Date(now - 7 * ONE_DAY).toISOString()
    }
  ];

  return reservations;
}

export const INITIAL_CHARGE_SESSIONS: ChargeSession[] = [
  {
    id: 'cs-demo-1',
    reservation_id: 'res-comp-4',
    charger_id: 'ch-merkez-1',
    baslangic: '2026-11-16T10:00:00.000Z',
    bitis: '2026-11-16T11:00:00.000Z',
    enerji_kWh: 18.40,
    birim_fiyat_kurus: 1000,
    aktif_mi: false
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-seed-1',
    aktor: 'Sistem Başlangıç',
    rol: 'demo_yoneticisi',
    islem: 'SISTEM_BASLATILDI',
    nesne: '3 Tesis / 30 Park Yeri',
    zaman: '2026-11-18T12:00:00.000Z',
    detay: 'Başlangıç verileri başarıyla yüklendi (30 toplam yer, 3 içeride, 1 kapalı, 26 fiziksel boş).'
  }
];
