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
  { id: 'merkez-s2', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S02' }, // İÇERİDE (34 BJK 1903)
  { id: 'merkez-s3', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S03' },
  { id: 'merkez-s4', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S04' },
  { id: 'merkez-s5', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S05' },
  { id: 'merkez-s6', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S06' },
  { id: 'merkez-s7', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S07' },
  { id: 'merkez-s8', lot_id: 'merkez', tur: 'standart', kapali_mi: true, kod: 'M-S08' }, // 1 KAPALI YER (Bakım)
  { id: 'merkez-e1', lot_id: 'merkez', tur: 'erisilebilir', kapali_mi: false, kod: 'M-E01' },
  { id: 'merkez-e2', lot_id: 'merkez', tur: 'erisilebilir', kapali_mi: false, kod: 'M-E02' },
  { id: 'merkez-c1', lot_id: 'merkez', tur: 'sarjli', kapali_mi: false, kod: 'M-Ş01' }, // İÇERİDE & ŞARJDA (34 EV 888)
  { id: 'merkez-c2', lot_id: 'merkez', tur: 'sarjli', kapali_mi: false, kod: 'M-Ş02' },

  // --- Kampüs Otoparkı (10 yer = 7 standart + 1 erişilebilir + 2 şarjlı) ---
  { id: 'kampus-s1', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S01' }, // İÇERİDE (34 PC 202)
  { id: 'kampus-s2', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S02' }, // İÇERİDE (34 IST 3434)
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
  { id: 'aktarma-c1', lot_id: 'aktarma', tur: 'sarjli', kapali_mi: false, kod: 'A-Ş01' }, // İÇERİDE & ŞARJDA (34 TR 0606)
  { id: 'aktarma-c2', lot_id: 'aktarma', tur: 'sarjli', kapali_mi: false, kod: 'A-Ş02' },
];

// Şarj Cihazları
export const INITIAL_CHARGERS: Charger[] = [
  // Merkez: CCS2 120 kW, 10 TL/kWh (1000 kurus)
  { id: 'ch-merkez-1', space_id: 'merkez-c1', soket_tipi: 'CCS2', guc_kW: 120, durum: 'ŞARJ EDİYOR', kWh_bedeli_kurus: 1000 },
  { id: 'ch-merkez-2', space_id: 'merkez-c2', soket_tipi: 'CCS2', guc_kW: 120, durum: 'HAZIR', kWh_bedeli_kurus: 1000 },

  // Kampüs: Type 2 22 kW, 8 TL/kWh (800 kurus)
  { id: 'ch-kampus-1', space_id: 'kampus-c1', soket_tipi: 'Type 2', guc_kW: 22, durum: 'HAZIR', kWh_bedeli_kurus: 800 },
  { id: 'ch-kampus-2', space_id: 'kampus-c2', soket_tipi: 'Type 2', guc_kW: 22, durum: 'HAZIR', kWh_bedeli_kurus: 800 },

  // Aktarma: CCS2 60 kW, 9 TL/kWh (900 kurus)
  { id: 'ch-aktarma-1', space_id: 'aktarma-c1', soket_tipi: 'CCS2', guc_kW: 60, durum: 'ŞARJ EDİYOR', kWh_bedeli_kurus: 900 },
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

export const STATIC_SEED_TIMESTAMP = 1795003200000;

// Başlangıç Rezervasyonları ve Ziyaretleri üreten zengin yardımcı fonksiyon
export function createInitialReservations(baseTime: Date = new Date()): Reservation[] {
  const now = baseTime.getTime();
  const ONE_HOUR = 3600 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;

  const reservations: Reservation[] = [
    // ==========================================
    // 1. İÇERİDEKİ ARAÇLAR (Canlı Otopark Doluluğu)
    // ==========================================
    // Merkez Otoparkı - 3 araç içeride
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
      id: 'res-active-1b',
      kod: 'PC-10102',
      user_id: 'user-surucu-2',
      user_ad: 'Ayşe Kaya',
      user_email: 'ayse@parkcep.com',
      space_id: 'merkez-c1',
      lot_id: 'merkez',
      baslangic: new Date(now - 40 * 60 * 1000).toISOString(),
      bitis: new Date(now + 1.2 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'uygulama',
      giris: new Date(now - 35 * 60 * 1000).toISOString(),
      saatlik_tarife_kurus: 4000,
      sarj_tarife_kurus: 1000,
      soket_tipi: 'CCS2',
      olusturulma: new Date(now - 2 * ONE_HOUR).toISOString(),
      plaka: '34 EV 888'
    },
    {
      id: 'res-active-1c',
      kod: 'PC-W1001',
      space_id: 'merkez-s2',
      lot_id: 'merkez',
      baslangic: new Date(now - 55 * 60 * 1000).toISOString(),
      bitis: new Date(now + 1 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'gorevli', // walk-in
      giris: new Date(now - 55 * 60 * 1000).toISOString(),
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 55 * 60 * 1000).toISOString(),
      plaka: '34 BJK 1903'
    },

    // Kampüs Otoparkı - 2 araç içeride
    {
      id: 'res-active-2',
      kod: 'PC-20202',
      space_id: 'kampus-s1',
      lot_id: 'kampus',
      baslangic: new Date(now - 45 * 60 * 1000).toISOString(),
      bitis: new Date(now + 1.5 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'gorevli',
      giris: new Date(now - 45 * 60 * 1000).toISOString(),
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 45 * 60 * 1000).toISOString(),
      plaka: '34 PC 202'
    },
    {
      id: 'res-active-2b',
      kod: 'PC-20203',
      user_id: 'user-surucu-1',
      user_ad: 'Ahmet Yılmaz',
      user_email: 'ahmet@parkcep.com',
      space_id: 'kampus-s2',
      lot_id: 'kampus',
      baslangic: new Date(now - 1.1 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 2.5 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'uygulama',
      giris: new Date(now - 1 * ONE_HOUR).toISOString(),
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 2 * ONE_HOUR).toISOString(),
      plaka: '34 IST 3434'
    },

    // Aktarma Otoparkı - 2 araç içeride
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
    {
      id: 'res-active-3b',
      kod: 'PC-30304',
      user_id: 'user-surucu-1',
      user_ad: 'Ahmet Yılmaz',
      user_email: 'ahmet@parkcep.com',
      space_id: 'aktarma-c1',
      lot_id: 'aktarma',
      baslangic: new Date(now - 50 * 60 * 1000).toISOString(),
      bitis: new Date(now + 1.5 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'uygulama',
      giris: new Date(now - 48 * 60 * 1000).toISOString(),
      saatlik_tarife_kurus: 2500,
      sarj_tarife_kurus: 900,
      soket_tipi: 'CCS2',
      olusturulma: new Date(now - 3 * ONE_HOUR).toISOString(),
      plaka: '34 TR 0606'
    },

    // ==========================================
    // 2. BUGÜN VE GELECEKTE BEKLENEN ONAYLI REZERVASYONLAR
    // ==========================================
    {
      id: 'res-future-1',
      kod: 'PC-40401',
      user_id: 'user-surucu-1',
      user_ad: 'Ahmet Yılmaz',
      user_email: 'ahmet@parkcep.com',
      space_id: 'merkez-s3',
      lot_id: 'merkez',
      baslangic: new Date(now + 1 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 3 * ONE_HOUR).toISOString(),
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
      space_id: 'merkez-c2',
      lot_id: 'merkez',
      baslangic: new Date(now + 2.5 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 4.5 * ONE_HOUR).toISOString(),
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
      baslangic: new Date(now + 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 4 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      erisilebilir_ihtiyac_beyani: true,
      olusturulma: new Date(now - 1.5 * ONE_HOUR).toISOString(),
      plaka: '34 ENG 01'
    },
    {
      id: 'res-future-4',
      kod: 'PC-40404',
      user_id: 'user-surucu-2',
      user_ad: 'Ayşe Kaya',
      user_email: 'ayse@parkcep.com',
      space_id: 'aktarma-c2',
      lot_id: 'aktarma',
      baslangic: new Date(now + 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 5 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 2500,
      sarj_tarife_kurus: 900,
      soket_tipi: 'CCS2',
      olusturulma: new Date(now - 4 * ONE_HOUR).toISOString(),
      plaka: '34 EV 999'
    },
    {
      id: 'res-future-5',
      kod: 'PC-40405',
      user_id: 'user-surucu-1',
      user_ad: 'Ahmet Yılmaz',
      user_email: 'ahmet@parkcep.com',
      space_id: 'merkez-s4',
      lot_id: 'merkez',
      baslangic: new Date(now + 1 * ONE_DAY).toISOString(),
      bitis: new Date(now + 1 * ONE_DAY + 2 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 2 * ONE_HOUR).toISOString(),
      plaka: '34 PC 101'
    },
    {
      id: 'res-future-6',
      kod: 'PC-40406',
      user_id: 'user-surucu-2',
      user_ad: 'Ayşe Kaya',
      user_email: 'ayse@parkcep.com',
      space_id: 'kampus-c1',
      lot_id: 'kampus',
      baslangic: new Date(now + 1 * ONE_DAY + 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 1 * ONE_DAY + 5 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      sarj_tarife_kurus: 800,
      soket_tipi: 'Type 2',
      olusturulma: new Date(now - 3 * ONE_HOUR).toISOString(),
      plaka: '34 EV 888'
    },
    {
      id: 'res-future-7',
      kod: 'PC-40407',
      user_id: 'user-surucu-1',
      user_ad: 'Ahmet Yılmaz',
      user_email: 'ahmet@parkcep.com',
      space_id: 'aktarma-s2',
      lot_id: 'aktarma',
      baslangic: new Date(now + 2 * ONE_DAY).toISOString(),
      bitis: new Date(now + 2 * ONE_DAY + 4 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 2500,
      olusturulma: new Date(now - 5 * ONE_HOUR).toISOString(),
      plaka: '34 PC 101'
    },

    // ==========================================
    // 3. TAMAMLANAN ZİYARETLER (Belediye ve Analitik Raporu İçin 24+ Zengin Kayıt)
    // ==========================================
    // Bugün tamamlananlar
    {
      id: 'res-comp-today-1',
      kod: 'PC-80101',
      user_id: 'user-surucu-1',
      space_id: 'merkez-s5',
      lot_id: 'merkez',
      baslangic: new Date(now - 4 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 2 * ONE_HOUR).toISOString(),
      giris: new Date(now - 4 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 2.1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 6 * ONE_HOUR).toISOString(),
      plaka: '34 ABC 12'
    },
    {
      id: 'res-comp-today-2',
      kod: 'PC-80102',
      space_id: 'kampus-s3',
      lot_id: 'kampus',
      baslangic: new Date(now - 5 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 3.5 * ONE_HOUR).toISOString(),
      giris: new Date(now - 5 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 3.5 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'gorevli',
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 5 * ONE_HOUR).toISOString(),
      plaka: '34 DEF 34'
    },
    {
      id: 'res-comp-today-3',
      kod: 'PC-80103',
      space_id: 'aktarma-s3',
      lot_id: 'aktarma',
      baslangic: new Date(now - 6 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 3 * ONE_HOUR).toISOString(),
      giris: new Date(now - 5.9 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 3 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 2500,
      olusturulma: new Date(now - 7 * ONE_HOUR).toISOString(),
      plaka: '34 GHK 56'
    },
    {
      id: 'res-comp-today-4',
      kod: 'PC-80104',
      space_id: 'merkez-c2',
      lot_id: 'merkez',
      baslangic: new Date(now - 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 1.5 * ONE_HOUR).toISOString(),
      giris: new Date(now - 3 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 1.5 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      sarj_tarife_kurus: 1000,
      soket_tipi: 'CCS2',
      olusturulma: new Date(now - 4 * ONE_HOUR).toISOString(),
      plaka: '34 TES 99'
    },

    // 1 gün önce
    {
      id: 'res-comp-d1-1',
      kod: 'PC-70101',
      space_id: 'merkez-s3',
      lot_id: 'merkez',
      baslangic: new Date(now - 1 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 1 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      giris: new Date(now - 1 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 1 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 1.2 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-d1-2',
      kod: 'PC-70102',
      space_id: 'kampus-e1',
      lot_id: 'kampus',
      baslangic: new Date(now - 1 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 1 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      giris: new Date(now - 1 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 1 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      erisilebilir_ihtiyac_beyani: true,
      olusturulma: new Date(now - 1.5 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-d1-3',
      kod: 'PC-70103',
      space_id: 'aktarma-s4',
      lot_id: 'aktarma',
      baslangic: new Date(now - 1 * ONE_DAY - 5 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 1 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      giris: new Date(now - 1 * ONE_DAY - 5 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 1 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'gorevli',
      saatlik_tarife_kurus: 2500,
      olusturulma: new Date(now - 1.2 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-d1-4',
      kod: 'PC-70104',
      space_id: 'merkez-c1',
      lot_id: 'merkez',
      baslangic: new Date(now - 1 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 1 * ONE_DAY).toISOString(),
      giris: new Date(now - 1 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 1 * ONE_DAY).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      sarj_tarife_kurus: 1000,
      soket_tipi: 'CCS2',
      olusturulma: new Date(now - 1.3 * ONE_DAY).toISOString()
    },

    // 2 gün önce
    {
      id: 'res-comp-d2-1',
      kod: 'PC-60101',
      space_id: 'kampus-s4',
      lot_id: 'kampus',
      baslangic: new Date(now - 2 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 2 * ONE_DAY).toISOString(),
      giris: new Date(now - 2 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 2 * ONE_DAY).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 2.2 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-d2-2',
      kod: 'PC-60102',
      space_id: 'aktarma-c1',
      lot_id: 'aktarma',
      baslangic: new Date(now - 2 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 2 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      giris: new Date(now - 2 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 2 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 2500,
      sarj_tarife_kurus: 900,
      soket_tipi: 'CCS2',
      olusturulma: new Date(now - 2.4 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-d2-3',
      kod: 'PC-60103',
      space_id: 'merkez-s6',
      lot_id: 'merkez',
      baslangic: new Date(now - 2 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 2 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      giris: new Date(now - 2 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 2 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'gorevli',
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 2.5 * ONE_DAY).toISOString()
    },

    // 3 gün önce
    {
      id: 'res-comp-d3-1',
      kod: 'PC-50101',
      space_id: 'merkez-s7',
      lot_id: 'merkez',
      baslangic: new Date(now - 3 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 3 * ONE_DAY).toISOString(),
      giris: new Date(now - 3 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 3 * ONE_DAY).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 3.2 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-d3-2',
      kod: 'PC-50102',
      space_id: 'kampus-c2',
      lot_id: 'kampus',
      baslangic: new Date(now - 3 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 3 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      giris: new Date(now - 3 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 3 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      sarj_tarife_kurus: 800,
      soket_tipi: 'Type 2',
      olusturulma: new Date(now - 3.4 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-d3-3',
      kod: 'PC-50103',
      space_id: 'aktarma-s5',
      lot_id: 'aktarma',
      baslangic: new Date(now - 3 * ONE_DAY - 5 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 3 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      giris: new Date(now - 3 * ONE_DAY - 5 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 3 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 2500,
      olusturulma: new Date(now - 3.5 * ONE_DAY).toISOString()
    },

    // 4 gün önce
    {
      id: 'res-comp-d4-1',
      kod: 'PC-40101',
      space_id: 'merkez-e2',
      lot_id: 'merkez',
      baslangic: new Date(now - 4 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 4 * ONE_DAY).toISOString(),
      giris: new Date(now - 4 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 4 * ONE_DAY).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      erisilebilir_ihtiyac_beyani: true,
      olusturulma: new Date(now - 4.3 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-d4-2',
      kod: 'PC-40102',
      space_id: 'kampus-s5',
      lot_id: 'kampus',
      baslangic: new Date(now - 4 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 4 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      giris: new Date(now - 4 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 4 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'gorevli',
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 4.5 * ONE_DAY).toISOString()
    },

    // 5 gün önce
    {
      id: 'res-comp-d5-1',
      kod: 'PC-30101',
      space_id: 'aktarma-e1',
      lot_id: 'aktarma',
      baslangic: new Date(now - 5 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 5 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      giris: new Date(now - 5 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 5 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 2500,
      erisilebilir_ihtiyac_beyani: true,
      olusturulma: new Date(now - 5.4 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-d5-2',
      kod: 'PC-30102',
      space_id: 'merkez-s1',
      lot_id: 'merkez',
      baslangic: new Date(now - 5 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 5 * ONE_DAY).toISOString(),
      giris: new Date(now - 5 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 5 * ONE_DAY).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 5.2 * ONE_DAY).toISOString()
    },

    // 6 gün önce
    {
      id: 'res-comp-d6-1',
      kod: 'PC-20101',
      space_id: 'kampus-s6',
      lot_id: 'kampus',
      baslangic: new Date(now - 6 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 6 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      giris: new Date(now - 6 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 6 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 6.3 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-d6-2',
      kod: 'PC-20102',
      space_id: 'aktarma-c2',
      lot_id: 'aktarma',
      baslangic: new Date(now - 6 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 6 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      giris: new Date(now - 6 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 6 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 2500,
      sarj_tarife_kurus: 900,
      soket_tipi: 'CCS2',
      olusturulma: new Date(now - 6.5 * ONE_DAY).toISOString()
    }
  ];

  return reservations;
}

export const INITIAL_CHARGE_SESSIONS: ChargeSession[] = [
  // 2 Aktif Şarj Oturumu (Merkez ve Aktarma)
  {
    id: 'cs-active-1',
    reservation_id: 'res-active-1b',
    charger_id: 'ch-merkez-1',
    baslangic: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    enerji_kWh: 14.80,
    birim_fiyat_kurus: 1000,
    aktif_mi: true
  },
  {
    id: 'cs-active-2',
    reservation_id: 'res-active-3b',
    charger_id: 'ch-aktarma-1',
    baslangic: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    enerji_kWh: 9.20,
    birim_fiyat_kurus: 900,
    aktif_mi: true
  },
  // Tamamlanmış Şarj Oturumları
  {
    id: 'cs-comp-1',
    reservation_id: 'res-comp-today-4',
    charger_id: 'ch-merkez-2',
    baslangic: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    bitis: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    enerji_kWh: 22.40,
    birim_fiyat_kurus: 1000,
    aktif_mi: false
  },
  {
    id: 'cs-comp-2',
    reservation_id: 'res-comp-d1-4',
    charger_id: 'ch-merkez-1',
    baslangic: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    bitis: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    enerji_kWh: 18.50,
    birim_fiyat_kurus: 1000,
    aktif_mi: false
  },
  {
    id: 'cs-comp-3',
    reservation_id: 'res-comp-d2-2',
    charger_id: 'ch-aktarma-1',
    baslangic: new Date(Date.now() - 51 * 3600 * 1000).toISOString(),
    bitis: new Date(Date.now() - 49 * 3600 * 1000).toISOString(),
    enerji_kWh: 15.20,
    birim_fiyat_kurus: 900,
    aktif_mi: false
  },
  {
    id: 'cs-comp-4',
    reservation_id: 'res-comp-d3-2',
    charger_id: 'ch-kampus-2',
    baslangic: new Date(Date.now() - 75 * 3600 * 1000).toISOString(),
    bitis: new Date(Date.now() - 73 * 3600 * 1000).toISOString(),
    enerji_kWh: 11.00,
    birim_fiyat_kurus: 800,
    aktif_mi: false
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-seed-1',
    aktor: 'Mehmet Demir',
    rol: 'gorevli',
    islem: 'GIRIS_YAPILDI',
    nesne: 'Rezervasyon #PC-10101',
    zaman: new Date(Date.now() - 84 * 60 * 1000).toISOString(),
    detay: 'Merkez Otoparkı - 34 PC 101 plakalı araç otoparka giriş yaptı.'
  },
  {
    id: 'log-seed-2',
    aktor: 'Ayşe Kaya',
    rol: 'surucu',
    islem: 'SARJ_BASLATILDI',
    nesne: 'Şarj Ünitesi #ch-merkez-1',
    zaman: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    detay: 'Rezervasyon #PC-10102 için 120 kW CCS2 DC şarj oturumu başlatıldı.'
  },
  {
    id: 'log-seed-3',
    aktor: 'Mehmet Demir',
    rol: 'gorevli',
    islem: 'REZERVASYONSUZ_GIRIS',
    nesne: 'Plaka: 34 BJK 1903 (#PC-W1001)',
    zaman: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    detay: 'Merkez Otoparkı - Kapıdan doğrudan walk-in giriş kaydı yapıldı. Yer: M-S02.'
  },
  {
    id: 'log-seed-4',
    aktor: 'Ali Can',
    rol: 'gorevli',
    islem: 'GIRIS_YAPILDI',
    nesne: 'Rezervasyon #PC-20202',
    zaman: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    detay: 'Kampüs Otoparkı - 34 PC 202 plakalı araç giriş onaylandı.'
  },
  {
    id: 'log-seed-5',
    aktor: 'Fatma Koç',
    rol: 'gorevli',
    islem: 'SARJ_BASLATILDI',
    nesne: 'Şarj Ünitesi #ch-aktarma-1',
    zaman: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    detay: 'Aktarma Merkezi Otoparkı - 34 TR 0606 plakalı araç için 60 kW CCS2 şarj başlatıldı.'
  },
  {
    id: 'log-seed-6',
    aktor: 'Sistem Yöneticisi',
    rol: 'demo_yoneticisi',
    islem: 'SISTEM_BASLATILDI',
    nesne: '3 Tesis / 30 Park Yeri',
    zaman: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    detay: 'ParkCep ekosistemi aktif edildi (30 toplam yer, 7 aktif araç, 1 kapalı alan).'
  }
];
