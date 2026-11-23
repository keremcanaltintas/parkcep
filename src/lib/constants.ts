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
    ornek_bolge: 'Beşiktaş / Meydan & Üniversite',
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
    toplu_tasima_etiketi: 'Marmaray & Metro Entegre',
    calisma_saatleri: '24 Saat Açık',
    aciklama: 'Marmaray ve metro aktarma aksında yer alan, Park & Ride entegrasyonuna uygun ekonomik tesis.'
  },
  {
    id: 'sisli',
    ad: 'ParkCep Şişli Plaza Otoparkı',
    ornek_bolge: 'Şişli / Mecidiyeköy',
    lat: 41.0635,
    lng: 28.9925,
    saatlik_ucret_kurus: 4500, // 45 TL / saat
    veri_zamani: '3 dk önce güncellendi',
    toplu_tasima_etiketi: 'Metrobüs & M2 Yakını',
    calisma_saatleri: '24 Saat Açık',
    aciklama: 'İş merkezleri, metro ve metrobüs aktarma hattında 150 kW Ultra DC hızlı şarj üniteli kapalı tesis.'
  },
  {
    id: 'atasehir',
    ad: 'ParkCep Finans Merkezi Otoparkı',
    ornek_bolge: 'Ataşehir / Finans Merkezi',
    lat: 40.9982,
    lng: 29.1158,
    saatlik_ucret_kurus: 3500, // 35 TL / saat
    veri_zamani: '1 dk önce güncellendi',
    toplu_tasima_etiketi: 'M12 Metro Bağlantılı',
    calisma_saatleri: '24 Saat Açık',
    aciklama: 'İstanbul Uluslararası Finans Merkezi kalbinde 180 kW DC yüksek güç şarj ve geniş erişilebilir alanlar.'
  },
  {
    id: 'bakirkoy',
    ad: 'ParkCep Sahil Otoparkı',
    ornek_bolge: 'Bakırköy / Sahil & Meydan',
    lat: 40.9775,
    lng: 28.8712,
    saatlik_ucret_kurus: 3000, // 30 TL / saat
    veri_zamani: '2 dk önce güncellendi',
    toplu_tasima_etiketi: 'Marmaray 3 Dk',
    calisma_saatleri: '24 Saat Açık',
    aciklama: 'Bakırköy Özgürlük Meydanı ve sahil yolu kesişiminde 90 kW DC hızlı şarj donanımlı sahil tesisi.'
  },
  {
    id: 'beyoglu',
    ad: 'ParkCep Taksim Kültür Otoparkı',
    ornek_bolge: 'Beyoğlu / Taksim & Galata',
    lat: 41.0345,
    lng: 28.9805,
    saatlik_ucret_kurus: 5000, // 50 TL / saat
    veri_zamani: 'Az önce güncellendi',
    toplu_tasima_etiketi: 'M2 Taksim 2 Dk',
    calisma_saatleri: '24 Saat Açık',
    aciklama: 'İstiklal Caddesi ve Taksim Meydanı yürüme mesafesinde AC Type 2 şarj istasyonlu merkezi otopark.'
  }
];

export const INITIAL_SPACES: Space[] = [
  // --- 1. Merkez Otoparkı (12 yer = 8 standart + 2 erişilebilir + 2 şarjlı) ---
  { id: 'merkez-s1', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S01' },
  { id: 'merkez-s2', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S02' },
  { id: 'merkez-s3', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S03' },
  { id: 'merkez-s4', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S04' },
  { id: 'merkez-s5', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S05' },
  { id: 'merkez-s6', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S06' },
  { id: 'merkez-s7', lot_id: 'merkez', tur: 'standart', kapali_mi: false, kod: 'M-S07' },
  { id: 'merkez-s8', lot_id: 'merkez', tur: 'standart', kapali_mi: true, kod: 'M-S08' }, // 1 Kapalı
  { id: 'merkez-e1', lot_id: 'merkez', tur: 'erisilebilir', kapali_mi: false, kod: 'M-E01' },
  { id: 'merkez-e2', lot_id: 'merkez', tur: 'erisilebilir', kapali_mi: false, kod: 'M-E02' },
  { id: 'merkez-c1', lot_id: 'merkez', tur: 'sarjli', kapali_mi: false, kod: 'M-Ş01' },
  { id: 'merkez-c2', lot_id: 'merkez', tur: 'sarjli', kapali_mi: false, kod: 'M-Ş02' },

  // --- 2. Kampüs Otoparkı (10 yer = 7 standart + 1 erişilebilir + 2 şarjlı) ---
  { id: 'kampus-s1', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S01' },
  { id: 'kampus-s2', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S02' },
  { id: 'kampus-s3', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S03' },
  { id: 'kampus-s4', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S04' },
  { id: 'kampus-s5', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S05' },
  { id: 'kampus-s6', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S06' },
  { id: 'kampus-s7', lot_id: 'kampus', tur: 'standart', kapali_mi: false, kod: 'K-S07' },
  { id: 'kampus-e1', lot_id: 'kampus', tur: 'erisilebilir', kapali_mi: false, kod: 'K-E01' },
  { id: 'kampus-c1', lot_id: 'kampus', tur: 'sarjli', kapali_mi: false, kod: 'K-Ş01' },
  { id: 'kampus-c2', lot_id: 'kampus', tur: 'sarjli', kapali_mi: false, kod: 'K-Ş02' },

  // --- 3. Aktarma Otoparkı (8 yer = 5 standart + 1 erişilebilir + 2 şarjlı) ---
  { id: 'aktarma-s1', lot_id: 'aktarma', tur: 'standart', kapali_mi: false, kod: 'A-S01' },
  { id: 'aktarma-s2', lot_id: 'aktarma', tur: 'standart', kapali_mi: false, kod: 'A-S02' },
  { id: 'aktarma-s3', lot_id: 'aktarma', tur: 'standart', kapali_mi: false, kod: 'A-S03' },
  { id: 'aktarma-s4', lot_id: 'aktarma', tur: 'standart', kapali_mi: false, kod: 'A-S04' },
  { id: 'aktarma-s5', lot_id: 'aktarma', tur: 'standart', kapali_mi: false, kod: 'A-S05' },
  { id: 'aktarma-e1', lot_id: 'aktarma', tur: 'erisilebilir', kapali_mi: false, kod: 'A-E01' },
  { id: 'aktarma-c1', lot_id: 'aktarma', tur: 'sarjli', kapali_mi: false, kod: 'A-Ş01' },
  { id: 'aktarma-c2', lot_id: 'aktarma', tur: 'sarjli', kapali_mi: false, kod: 'A-Ş02' },

  // --- 4. Şişli Otoparkı (10 yer = 7 standart + 1 erişilebilir + 2 şarjlı) ---
  { id: 'sisli-s1', lot_id: 'sisli', tur: 'standart', kapali_mi: false, kod: 'Ş-S01' },
  { id: 'sisli-s2', lot_id: 'sisli', tur: 'standart', kapali_mi: false, kod: 'Ş-S02' },
  { id: 'sisli-s3', lot_id: 'sisli', tur: 'standart', kapali_mi: false, kod: 'Ş-S03' },
  { id: 'sisli-s4', lot_id: 'sisli', tur: 'standart', kapali_mi: false, kod: 'Ş-S04' },
  { id: 'sisli-s5', lot_id: 'sisli', tur: 'standart', kapali_mi: false, kod: 'Ş-S05' },
  { id: 'sisli-s6', lot_id: 'sisli', tur: 'standart', kapali_mi: false, kod: 'Ş-S06' },
  { id: 'sisli-s7', lot_id: 'sisli', tur: 'standart', kapali_mi: false, kod: 'Ş-S07' },
  { id: 'sisli-e1', lot_id: 'sisli', tur: 'erisilebilir', kapali_mi: false, kod: 'Ş-E01' },
  { id: 'sisli-c1', lot_id: 'sisli', tur: 'sarjli', kapali_mi: false, kod: 'Ş-Ş01' },
  { id: 'sisli-c2', lot_id: 'sisli', tur: 'sarjli', kapali_mi: false, kod: 'Ş-Ş02' },

  // --- 5. Ataşehir Otoparkı (12 yer = 8 standart + 2 erişilebilir + 2 şarjlı) ---
  { id: 'atasehir-s1', lot_id: 'atasehir', tur: 'standart', kapali_mi: false, kod: 'F-S01' },
  { id: 'atasehir-s2', lot_id: 'atasehir', tur: 'standart', kapali_mi: false, kod: 'F-S02' },
  { id: 'atasehir-s3', lot_id: 'atasehir', tur: 'standart', kapali_mi: false, kod: 'F-S03' },
  { id: 'atasehir-s4', lot_id: 'atasehir', tur: 'standart', kapali_mi: false, kod: 'F-S04' },
  { id: 'atasehir-s5', lot_id: 'atasehir', tur: 'standart', kapali_mi: false, kod: 'F-S05' },
  { id: 'atasehir-s6', lot_id: 'atasehir', tur: 'standart', kapali_mi: false, kod: 'F-S06' },
  { id: 'atasehir-s7', lot_id: 'atasehir', tur: 'standart', kapali_mi: false, kod: 'F-S07' },
  { id: 'atasehir-s8', lot_id: 'atasehir', tur: 'standart', kapali_mi: false, kod: 'F-S08' },
  { id: 'atasehir-e1', lot_id: 'atasehir', tur: 'erisilebilir', kapali_mi: false, kod: 'F-E01' },
  { id: 'atasehir-e2', lot_id: 'atasehir', tur: 'erisilebilir', kapali_mi: false, kod: 'F-E02' },
  { id: 'atasehir-c1', lot_id: 'atasehir', tur: 'sarjli', kapali_mi: false, kod: 'F-Ş01' },
  { id: 'atasehir-c2', lot_id: 'atasehir', tur: 'sarjli', kapali_mi: false, kod: 'F-Ş02' },

  // --- 6. Bakırköy Otoparkı (10 yer = 7 standart + 1 erişilebilir + 2 şarjlı) ---
  { id: 'bakirkoy-s1', lot_id: 'bakirkoy', tur: 'standart', kapali_mi: false, kod: 'B-S01' },
  { id: 'bakirkoy-s2', lot_id: 'bakirkoy', tur: 'standart', kapali_mi: false, kod: 'B-S02' },
  { id: 'bakirkoy-s3', lot_id: 'bakirkoy', tur: 'standart', kapali_mi: false, kod: 'B-S03' },
  { id: 'bakirkoy-s4', lot_id: 'bakirkoy', tur: 'standart', kapali_mi: false, kod: 'B-S04' },
  { id: 'bakirkoy-s5', lot_id: 'bakirkoy', tur: 'standart', kapali_mi: false, kod: 'B-S05' },
  { id: 'bakirkoy-s6', lot_id: 'bakirkoy', tur: 'standart', kapali_mi: false, kod: 'B-S06' },
  { id: 'bakirkoy-s7', lot_id: 'bakirkoy', tur: 'standart', kapali_mi: false, kod: 'B-S07' },
  { id: 'bakirkoy-e1', lot_id: 'bakirkoy', tur: 'erisilebilir', kapali_mi: false, kod: 'B-E01' },
  { id: 'bakirkoy-c1', lot_id: 'bakirkoy', tur: 'sarjli', kapali_mi: false, kod: 'B-Ş01' },
  { id: 'bakirkoy-c2', lot_id: 'bakirkoy', tur: 'sarjli', kapali_mi: false, kod: 'B-Ş02' },

  // --- 7. Beyoğlu Otoparkı (8 yer = 5 standart + 1 erişilebilir + 2 şarjlı) ---
  { id: 'beyoglu-s1', lot_id: 'beyoglu', tur: 'standart', kapali_mi: false, kod: 'T-S01' },
  { id: 'beyoglu-s2', lot_id: 'beyoglu', tur: 'standart', kapali_mi: false, kod: 'T-S02' },
  { id: 'beyoglu-s3', lot_id: 'beyoglu', tur: 'standart', kapali_mi: false, kod: 'T-S03' },
  { id: 'beyoglu-s4', lot_id: 'beyoglu', tur: 'standart', kapali_mi: false, kod: 'T-S04' },
  { id: 'beyoglu-s5', lot_id: 'beyoglu', tur: 'standart', kapali_mi: false, kod: 'T-S05' },
  { id: 'beyoglu-e1', lot_id: 'beyoglu', tur: 'erisilebilir', kapali_mi: false, kod: 'T-E01' },
  { id: 'beyoglu-c1', lot_id: 'beyoglu', tur: 'sarjli', kapali_mi: false, kod: 'T-Ş01' },
  { id: 'beyoglu-c2', lot_id: 'beyoglu', tur: 'sarjli', kapali_mi: false, kod: 'T-Ş02' },
];

export const INITIAL_CHARGERS: Charger[] = [
  // Merkez (Kadıköy): CCS2 120 kW, 10 TL/kWh
  { id: 'ch-merkez-1', space_id: 'merkez-c1', soket_tipi: 'CCS2', guc_kW: 120, durum: 'ŞARJ EDİYOR', kWh_bedeli_kurus: 1000 },
  { id: 'ch-merkez-2', space_id: 'merkez-c2', soket_tipi: 'CCS2', guc_kW: 120, durum: 'HAZIR', kWh_bedeli_kurus: 1000 },

  // Kampüs (Beşiktaş): Type 2 22 kW AC, 8 TL/kWh
  { id: 'ch-kampus-1', space_id: 'kampus-c1', soket_tipi: 'Type 2', guc_kW: 22, durum: 'HAZIR', kWh_bedeli_kurus: 800 },
  { id: 'ch-kampus-2', space_id: 'kampus-c2', soket_tipi: 'Type 2', guc_kW: 22, durum: 'HAZIR', kWh_bedeli_kurus: 800 },

  // Aktarma (Üsküdar): CCS2 60 kW DC, 9 TL/kWh
  { id: 'ch-aktarma-1', space_id: 'aktarma-c1', soket_tipi: 'CCS2', guc_kW: 60, durum: 'ŞARJ EDİYOR', kWh_bedeli_kurus: 900 },
  { id: 'ch-aktarma-2', space_id: 'aktarma-c2', soket_tipi: 'CCS2', guc_kW: 60, durum: 'HAZIR', kWh_bedeli_kurus: 900 },

  // Şişli: CCS2 150 kW Ultra DC, 11 TL/kWh
  { id: 'ch-sisli-1', space_id: 'sisli-c1', soket_tipi: 'CCS2', guc_kW: 150, durum: 'HAZIR', kWh_bedeli_kurus: 1100 },
  { id: 'ch-sisli-2', space_id: 'sisli-c2', soket_tipi: 'CCS2', guc_kW: 150, durum: 'HAZIR', kWh_bedeli_kurus: 1100 },

  // Ataşehir: CCS2 180 kW DC + Type 2 22 kW AC, 10 TL/kWh
  { id: 'ch-atasehir-1', space_id: 'atasehir-c1', soket_tipi: 'CCS2', guc_kW: 180, durum: 'HAZIR', kWh_bedeli_kurus: 1050 },
  { id: 'ch-atasehir-2', space_id: 'atasehir-c2', soket_tipi: 'Type 2', guc_kW: 22, durum: 'HAZIR', kWh_bedeli_kurus: 800 },

  // Bakırköy: CCS2 90 kW DC, 9.5 TL/kWh
  { id: 'ch-bakirkoy-1', space_id: 'bakirkoy-c1', soket_tipi: 'CCS2', guc_kW: 90, durum: 'HAZIR', kWh_bedeli_kurus: 950 },
  { id: 'ch-bakirkoy-2', space_id: 'bakirkoy-c2', soket_tipi: 'CCS2', guc_kW: 90, durum: 'HAZIR', kWh_bedeli_kurus: 950 },

  // Beyoğlu: Type 2 22 kW AC, 8.5 TL/kWh
  { id: 'ch-beyoglu-1', space_id: 'beyoglu-c1', soket_tipi: 'Type 2', guc_kW: 22, durum: 'HAZIR', kWh_bedeli_kurus: 850 },
  { id: 'ch-beyoglu-2', space_id: 'beyoglu-c2', soket_tipi: 'Type 2', guc_kW: 22, durum: 'HAZIR', kWh_bedeli_kurus: 850 },
];

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
    id: 'user-gorevli-sisli',
    ad: 'Burak Şen',
    email: 'sisli.gorevli@parkcep.com',
    parola_hash: 'demo123',
    rol: 'gorevli',
    assigned_lot_id: 'sisli',
    avatar: '👮‍♂️'
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

export function createInitialReservations(baseTime: Date = new Date()): Reservation[] {
  const now = baseTime.getTime();
  const ONE_HOUR = 3600 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;

  const reservations: Reservation[] = [
    // --- İçerideki Araçlar ---
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
      kaynak: 'gorevli',
      giris: new Date(now - 55 * 60 * 1000).toISOString(),
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 55 * 60 * 1000).toISOString(),
      plaka: '34 BJK 1903'
    },
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
    {
      id: 'res-active-4',
      kod: 'PC-40101',
      space_id: 'sisli-s1',
      lot_id: 'sisli',
      baslangic: new Date(now - 40 * 60 * 1000).toISOString(),
      bitis: new Date(now + 2 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'gorevli',
      giris: new Date(now - 38 * 60 * 1000).toISOString(),
      saatlik_tarife_kurus: 4500,
      olusturulma: new Date(now - 40 * 60 * 1000).toISOString(),
      plaka: '34 SIS 44'
    },
    {
      id: 'res-active-5',
      kod: 'PC-50101',
      user_id: 'user-surucu-2',
      user_ad: 'Ayşe Kaya',
      user_email: 'ayse@parkcep.com',
      space_id: 'atasehir-s1',
      lot_id: 'atasehir',
      baslangic: new Date(now - 20 * 60 * 1000).toISOString(),
      bitis: new Date(now + 3 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'uygulama',
      giris: new Date(now - 18 * 60 * 1000).toISOString(),
      saatlik_tarife_kurus: 3500,
      olusturulma: new Date(now - 1 * ONE_HOUR).toISOString(),
      plaka: '34 FIN 01'
    },
    {
      id: 'res-active-6',
      kod: 'PC-60101',
      space_id: 'bakirkoy-s1',
      lot_id: 'bakirkoy',
      baslangic: new Date(now - 1 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 1 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'uygulama',
      giris: new Date(now - 55 * 60 * 1000).toISOString(),
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 2 * ONE_HOUR).toISOString(),
      plaka: '34 BAK 34'
    },
    {
      id: 'res-active-7',
      kod: 'PC-70101',
      space_id: 'beyoglu-s1',
      lot_id: 'beyoglu',
      baslangic: new Date(now - 30 * 60 * 1000).toISOString(),
      bitis: new Date(now + 2 * ONE_HOUR).toISOString(),
      durum: 'İÇERİDE',
      kaynak: 'gorevli',
      giris: new Date(now - 28 * 60 * 1000).toISOString(),
      saatlik_tarife_kurus: 5000,
      olusturulma: new Date(now - 30 * 60 * 1000).toISOString(),
      plaka: '34 TAK 99'
    },

    // --- Onaylı Gelecek Rezervasyonlar ---
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
      space_id: 'sisli-c1',
      lot_id: 'sisli',
      baslangic: new Date(now + 1.5 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 3.5 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4500,
      sarj_tarife_kurus: 1100,
      soket_tipi: 'CCS2',
      olusturulma: new Date(now - 1 * ONE_HOUR).toISOString(),
      plaka: '34 EV 888'
    },
    {
      id: 'res-future-3',
      kod: 'PC-40403',
      user_id: 'user-surucu-1',
      user_ad: 'Ahmet Yılmaz',
      user_email: 'ahmet@parkcep.com',
      space_id: 'atasehir-c1',
      lot_id: 'atasehir',
      baslangic: new Date(now + 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 4 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3500,
      sarj_tarife_kurus: 1050,
      soket_tipi: 'CCS2',
      olusturulma: new Date(now - 2 * ONE_HOUR).toISOString(),
      plaka: '34 PC 101'
    },
    {
      id: 'res-future-4',
      kod: 'PC-40404',
      user_id: 'user-surucu-2',
      user_ad: 'Ayşe Kaya',
      user_email: 'ayse@parkcep.com',
      space_id: 'bakirkoy-e1',
      lot_id: 'bakirkoy',
      baslangic: new Date(now + 2.5 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 4.5 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      erisilebilir_ihtiyac_beyani: true,
      olusturulma: new Date(now - 1.5 * ONE_HOUR).toISOString(),
      plaka: '34 ENG 01'
    },
    {
      id: 'res-future-5',
      kod: 'PC-40405',
      user_id: 'user-surucu-1',
      user_ad: 'Ahmet Yılmaz',
      user_email: 'ahmet@parkcep.com',
      space_id: 'beyoglu-c1',
      lot_id: 'beyoglu',
      baslangic: new Date(now + 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now + 5 * ONE_HOUR).toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 5000,
      sarj_tarife_kurus: 850,
      soket_tipi: 'Type 2',
      olusturulma: new Date(now - 3 * ONE_HOUR).toISOString(),
      plaka: '34 EV 999'
    },

    // --- Geçmiş Tamamlanan Ziyaretler (Belediye Analitiği) ---
    {
      id: 'res-comp-1',
      kod: 'PC-80101',
      space_id: 'sisli-s2',
      lot_id: 'sisli',
      baslangic: new Date(now - 4 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 2 * ONE_HOUR).toISOString(),
      giris: new Date(now - 4 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 2.1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4500,
      olusturulma: new Date(now - 6 * ONE_HOUR).toISOString()
    },
    {
      id: 'res-comp-2',
      kod: 'PC-80102',
      space_id: 'atasehir-s2',
      lot_id: 'atasehir',
      baslangic: new Date(now - 5 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 3 * ONE_HOUR).toISOString(),
      giris: new Date(now - 5 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 3 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'gorevli',
      saatlik_tarife_kurus: 3500,
      olusturulma: new Date(now - 5.5 * ONE_HOUR).toISOString()
    },
    {
      id: 'res-comp-3',
      kod: 'PC-80103',
      space_id: 'bakirkoy-s2',
      lot_id: 'bakirkoy',
      baslangic: new Date(now - 1 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 1 * ONE_DAY).toISOString(),
      giris: new Date(now - 1 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 1 * ONE_DAY).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 1.2 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-4',
      kod: 'PC-80104',
      space_id: 'beyoglu-s2',
      lot_id: 'beyoglu',
      baslangic: new Date(now - 1 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 1 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      giris: new Date(now - 1 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 1 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 5000,
      olusturulma: new Date(now - 1.5 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-5',
      kod: 'PC-80105',
      space_id: 'merkez-s3',
      lot_id: 'merkez',
      baslangic: new Date(now - 2 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 2 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      giris: new Date(now - 2 * ONE_DAY - 3 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 2 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 4000,
      olusturulma: new Date(now - 2.2 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-6',
      kod: 'PC-80106',
      space_id: 'kampus-s3',
      lot_id: 'kampus',
      baslangic: new Date(now - 3 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 3 * ONE_DAY).toISOString(),
      giris: new Date(now - 3 * ONE_DAY - 2 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 3 * ONE_DAY).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'gorevli',
      saatlik_tarife_kurus: 3000,
      olusturulma: new Date(now - 3.2 * ONE_DAY).toISOString()
    },
    {
      id: 'res-comp-7',
      kod: 'PC-80107',
      space_id: 'aktarma-s2',
      lot_id: 'aktarma',
      baslangic: new Date(now - 4 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      bitis: new Date(now - 4 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      giris: new Date(now - 4 * ONE_DAY - 4 * ONE_HOUR).toISOString(),
      cikis: new Date(now - 4 * ONE_DAY - 1 * ONE_HOUR).toISOString(),
      durum: 'TAMAMLANDI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: 2500,
      olusturulma: new Date(now - 4.5 * ONE_DAY).toISOString()
    }
  ];

  return reservations;
}

export const INITIAL_CHARGE_SESSIONS: ChargeSession[] = [
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
  {
    id: 'cs-comp-1',
    reservation_id: 'res-comp-1',
    charger_id: 'ch-sisli-1',
    baslangic: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    bitis: new Date(Date.now() - 2.1 * 3600 * 1000).toISOString(),
    enerji_kWh: 28.50,
    birim_fiyat_kurus: 1100,
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
    aktor: 'Burak Şen',
    rol: 'gorevli',
    islem: 'GIRIS_YAPILDI',
    nesne: 'Rezervasyon #PC-40101',
    zaman: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    detay: 'Şişli Plaza Otoparkı - 34 SIS 44 plakalı araç giriş yaptı.'
  },
  {
    id: 'log-seed-4',
    aktor: 'Sistem Yöneticisi',
    rol: 'demo_yoneticisi',
    islem: 'SISTEM_BASLATILDI',
    nesne: '7 Tesis / 68 Park Yeri',
    zaman: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    detay: 'ParkCep İstanbul pilot ağı aktif edildi (Kadıköy, Beşiktaş, Üsküdar, Şişli, Ataşehir, Bakırköy, Beyoğlu).'
  }
];
