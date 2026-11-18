export type Role = 'surucu' | 'gorevli' | 'belediye' | 'demo_yoneticisi';

export interface User {
  id: string;
  ad: string;
  email: string;
  parola_hash: string;
  rol: Role;
  assigned_lot_id?: string; // Görevli için atanmış otopark
  avatar?: string;
}

export interface ParkingLot {
  id: string;
  ad: string;
  ornek_bolge: string;
  lat: number;
  lng: number;
  saatlik_ucret_kurus: number; // 40 TL = 4000 kurus
  veri_zamani: string;
  toplu_tasima_etiketi?: string; // örn: "Toplu taşımaya yakın • örnek"
  calisma_saatleri: string; // "24 Saat Açık"
  aciklama?: string;
}

export type SpaceType = 'standart' | 'erisilebilir' | 'sarjli';

export interface Space {
  id: string;
  lot_id: string;
  tur: SpaceType;
  kapali_mi: boolean;
  kod: string; // örn: "A-01", "Ş-01", "E-01"
}

export type SocketType = 'CCS2' | 'Type 2';
export type ChargerStatus = 'HAZIR' | 'ŞARJ EDİYOR' | 'ARIZALI';

export interface Charger {
  id: string;
  space_id: string;
  soket_tipi: SocketType;
  guc_kW: number; // 120, 22, 60
  durum: ChargerStatus;
  kWh_bedeli_kurus: number; // 10 TL = 1000 kurus
}

export type ReservationStatus = 
  | 'ONAYLI' 
  | 'İÇERİDE' 
  | 'TAMAMLANDI' 
  | 'İPTAL' 
  | 'GELMEDİ';

export interface Reservation {
  id: string;
  kod: string; // Benzersiz rezervasyon kodu (örn: "PC-84729")
  user_id?: string; // Rezervasyonsuz walk-in için boş olabilir
  user_ad?: string;
  user_email?: string;
  space_id: string;
  lot_id: string;
  baslangic: string; // ISO UTC string
  bitis: string;     // ISO UTC string
  durum: ReservationStatus;
  kaynak: 'uygulama' | 'gorevli'; // Uygulamadan mı walk-in mi
  giris?: string;    // ISO UTC string
  cikis?: string;    // ISO UTC string
  saatlik_tarife_kurus: number;
  sarj_tarife_kurus?: number;
  olusturulma: string; // ISO UTC string
  islem_anahtari?: string; // Idempotency key
  plaka?: string;
  erisilebilir_ihtiyac_beyani?: boolean;
  soket_tipi?: SocketType;
}

export interface ChargeSession {
  id: string;
  reservation_id: string;
  charger_id: string;
  baslangic: string; // ISO UTC string
  bitis?: string;    // ISO UTC string
  enerji_kWh: number; // örn: 14.50
  birim_fiyat_kurus: number;
  aktif_mi: boolean;
}

export interface DemoClock {
  zaman_farki_saniye: number; // offset from real system clock
}

export interface AuditLog {
  id: string;
  aktor: string;       // Kullanıcı e-posta veya adı
  rol: Role;
  islem: string;       // örn: "REZERVASYON_OLUSTURMA", "GIRIS_YAPILDI"
  nesne: string;       // örn: "Rezervasyon #PC-84729"
  onceki_durum?: string;
  sonraki_durum?: string;
  zaman: string;       // Demo saati (ISO UTC)
  detay?: string;
}

export interface LotOccupancySummary {
  lot: ParkingLot;
  toplam_yer: number;
  kapali_yer: number;
  fiziksel_dolu_yer: number;
  fiziksel_bos_yer: number;
  bugun_beklenen_rezervasyon: number;
  doluluk_yuzdesi: number | 'Hizmet dışı';
  standart_bos: number;
  erisilebilir_bos: number;
  sarjli_bos: number;
  standart_toplam: number;
  erisilebilir_toplam: number;
  sarjli_toplam: number;
}
