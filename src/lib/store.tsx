'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  ParkingLot,
  Space,
  Charger,
  Reservation,
  ChargeSession,
  AuditLog,
  SpaceType,
  SocketType,
  LotOccupancySummary
} from '@/types';
import {
  INITIAL_PARKING_LOTS,
  INITIAL_SPACES,
  INITIAL_CHARGERS,
  DEMO_USERS,
  createInitialReservations,
  INITIAL_CHARGE_SESSIONS,
  INITIAL_AUDIT_LOGS
} from './constants';
import {
  getDemoDate,
  calculateLotOccupancy,
  findAvailableSpace,
  validateCheckInTime,
  calculateParkingPriceKurus,
  calculateChargePriceKurus,
  isOverlapping
} from './calculations';

interface StoreContextType {
  // Veri
  currentUser: User;
  users: User[];
  lots: ParkingLot[];
  spaces: Space[];
  chargers: Charger[];
  reservations: Reservation[];
  chargeSessions: ChargeSession[];
  auditLogs: AuditLog[];
  clockOffsetSeconds: number;
  currentDemoTime: Date;
  mobileFrameMode: boolean;
  isHydrated: boolean;

  // Hesaplamalar
  lotSummaries: Record<string, LotOccupancySummary>;
  totalOccupancy: {
    toplam_yer: number;
    kapali_yer: number;
    fiziksel_dolu_yer: number;
    fiziksel_bos_yer: number;
    toplam_bugun_rezervasyon: number;
    genel_doluluk_orani: number;
  };

  // Eylemler
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  advanceClock: (seconds: number) => void;
  resetDemoData: () => void;
  setMobileFrameMode: (val: boolean) => void;
  toggleMobileFrameMode: () => void;

  // Rezervasyon Eylemleri
  createReservation: (params: {
    lotId: string;
    tur: SpaceType;
    start: Date | string;
    end: Date | string;
    plaka?: string;
    soketTipi?: SocketType;
    erisilebilirBeyan?: boolean;
    idempotencyKey?: string;
  }) => { success: boolean; reservation?: Reservation; error?: string; code?: number };

  cancelReservation: (reservationId: string) => { success: boolean; error?: string };

  // Operasyon Eylemleri
  checkIn: (kod: string, operatorLotId?: string) => { success: boolean; message?: string; error?: string };
  checkOut: (reservationId: string, operatorLotId?: string) => { success: boolean; message?: string; error?: string };
  walkInCheckIn: (params: {
    lotId: string;
    tur: SpaceType;
    expectedEnd: Date | string;
    plaka: string;
    soketTipi?: SocketType;
  }) => { success: boolean; message?: string; error?: string };

  toggleSpaceClosed: (spaceId: string) => { success: boolean; error?: string };
  startCharging: (reservationId: string, chargerId: string) => { success: boolean; error?: string };
  stopCharging: (chargeSessionId: string, energyKwh: number) => { success: boolean; message?: string; error?: string };
  toggleChargerOutage: (chargerId: string) => { success: boolean; error?: string };
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'parkcep_demo_state_v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [lots, setLots] = useState<ParkingLot[]>(INITIAL_PARKING_LOTS);
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);
  const [chargers, setChargers] = useState<Charger[]>(INITIAL_CHARGERS);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [chargeSessions, setChargeSessions] = useState<ChargeSession[]>(INITIAL_CHARGE_SESSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [clockOffsetSeconds, setClockOffsetSeconds] = useState<number>(0);
  const [mobileFrameMode, setMobileFrameMode] = useState<boolean>(false);

  // Güncel demo saati (her saniye veya offset değiştikçe tetiklenir)
  const [ticker, setTicker] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDemoTime = useMemo(() => {
    return getDemoDate(clockOffsetSeconds);
  }, [clockOffsetSeconds, ticker]);

  // Sayfa ilk açılışında LocalStorage'dan yükleme
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lots) setLots(parsed.lots);
        if (parsed.spaces) setSpaces(parsed.spaces);
        if (parsed.chargers) setChargers(parsed.chargers);
        if (parsed.reservations) setReservations(parsed.reservations);
        if (parsed.chargeSessions) setChargeSessions(parsed.chargeSessions);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (typeof parsed.clockOffsetSeconds === 'number') setClockOffsetSeconds(parsed.clockOffsetSeconds);
        if (parsed.currentUserId) {
          const user = DEMO_USERS.find(u => u.id === parsed.currentUserId);
          if (user) setCurrentUser(user);
        }
        if (typeof parsed.mobileFrameMode === 'boolean') setMobileFrameMode(parsed.mobileFrameMode);
      } else {
        // İlk kez açılıyorsa varsayılan verileri oluştur
        const initialRes = createInitialReservations(new Date());
        setReservations(initialRes);
      }
    } catch (e) {
      console.error('LocalStorage yükleme hatası:', e);
      setReservations(createInitialReservations(new Date()));
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Durum değiştikçe LocalStorage'a kaydetme (Kalıcılık garantisi)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const stateToSave = {
        lots,
        spaces,
        chargers,
        reservations,
        chargeSessions,
        auditLogs,
        clockOffsetSeconds,
        currentUserId: currentUser.id,
        mobileFrameMode
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('LocalStorage kaydetme hatası:', e);
    }
  }, [
    isHydrated,
    lots,
    spaces,
    chargers,
    reservations,
    chargeSessions,
    auditLogs,
    clockOffsetSeconds,
    currentUser,
    mobileFrameMode
  ]);

  // Audit log ekleyici
  const logAudit = useCallback((
    islem: string,
    nesne: string,
    onceki_durum?: string,
    sonraki_durum?: string,
    detay?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      aktor: currentUser.ad || currentUser.email,
      rol: currentUser.rol,
      islem,
      nesne,
      onceki_durum,
      sonraki_durum,
      zaman: currentDemoTime.toISOString(),
      detay
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, [currentUser, currentDemoTime]);

  // Otomatik Süre Denetleyicisi (Page 4):
  // Başlangıç + 10 dakikada hâlâ giriş yoksa ONAYLI rezervasyonlar GELMEDİ olur ve yer serbest kalır!
  useEffect(() => {
    if (!isHydrated) return;

    const tenMinutesMs = 10 * 60 * 1000;
    const nowTime = currentDemoTime.getTime();

    let hasChanges = false;
    const updated = reservations.map(r => {
      if (r.durum === 'ONAYLI') {
        const startTime = new Date(r.baslangic).getTime();
        if (nowTime > startTime + tenMinutesMs) {
          hasChanges = true;
          logAudit(
            'ZAMAN_ASIMI_GELMEDI',
            `Rezervasyon #${r.kod}`,
            'ONAYLI',
            'GELMEDİ',
            'Başlangıç saati üzerinden 10 dakika geçmesine rağmen giriş yapılmadı.'
          );
          return { ...r, durum: 'GELMEDİ' as const };
        }
      }
      return r;
    });

    if (hasChanges) {
      setReservations(updated);
    }
  }, [isHydrated, currentDemoTime, reservations, logAudit]);

  // Kullanıcı değiştirici
  const switchUserById = useCallback((userId: string) => {
    const found = DEMO_USERS.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      logAudit('KULLANICI_DEGISTI', `${found.ad} (${found.rol})`);
    }
  }, [logAudit]);

  // Zaman simülasyonu
  const advanceClock = useCallback((seconds: number) => {
    setClockOffsetSeconds(prev => prev + seconds);
    const mins = Math.round(seconds / 60);
    logAudit(
      'DEMO_SAATI_ILERLETILDI',
      `+${mins} dakika`,
      undefined,
      undefined,
      `Demo saati ${mins} dakika ileri alındı.`
    );
  }, [logAudit]);

  // Demo verilerini sıfırlama (Page 6 & 8)
  const resetDemoData = useCallback(() => {
    setClockOffsetSeconds(0);
    const initialRes = createInitialReservations(new Date());
    setReservations(initialRes);
    setSpaces(INITIAL_SPACES);
    setChargers(INITIAL_CHARGERS);
    setChargeSessions(INITIAL_CHARGE_SESSIONS);
    setLots(INITIAL_PARKING_LOTS);
    
    const resetLog: AuditLog = {
      id: `log-reset-${Date.now()}`,
      aktor: currentUser.ad || 'Demo Yöneticisi',
      rol: currentUser.rol,
      islem: 'VERI_SIFIRLANDI',
      nesne: 'Tüm Sistem Veritabanı',
      zaman: new Date().toISOString(),
      detay: 'Tüm veriler başlangıç kurgusuna (30 yer, 3 içeride, 1 kapalı, 26 boş) döndürüldü.'
    };
    setAuditLogs([resetLog]);
  }, [currentUser]);

  // Mobil Çerçeve Modu Toggle
  const toggleMobileFrameMode = useCallback(() => {
    setMobileFrameMode(prev => !prev);
  }, []);

  // --- REZERVASYON OLUŞTURMA (Page 3 & 4) ---
  const createReservation = useCallback((params: {
    lotId: string;
    tur: SpaceType;
    start: Date | string;
    end: Date | string;
    plaka?: string;
    soketTipi?: SocketType;
    erisilebilirBeyan?: boolean;
    idempotencyKey?: string;
  }): { success: boolean; reservation?: Reservation; error?: string; code?: number } => {
    const { lotId, tur, start, end, plaka, soketTipi, erisilebilirBeyan, idempotencyKey } = params;

    // 1. Idempotency Key kontrolü (T02)
    if (idempotencyKey) {
      const existing = reservations.find(r => r.islem_anahtari === idempotencyKey);
      if (existing) {
        return { success: true, reservation: existing };
      }
    }

    const lot = lots.find(l => l.id === lotId);
    if (!lot) {
      return { success: false, error: 'Otopark bulunamadı.', code: 404 };
    }

    const startTime = new Date(start);
    const endTime = new Date(end);

    // Geçmiş saat kontrolü
    if (startTime.getTime() < currentDemoTime.getTime() - 60000) {
      return { success: false, error: 'Geçmiş bir saate rezervasyon oluşturulamaz.', code: 400 };
    }

    // Süre kontrolü: 30 dakika - 8 saat
    const diffHours = (endTime.getTime() - startTime.getTime()) / (3600 * 1000);
    if (diffHours < 0.5 || diffHours > 8.01) {
      return { success: false, error: 'Rezervasyon süresi en az 30 dakika, en fazla 8 saat olabilir.', code: 400 };
    }

    // En fazla 7 gün ileri
    const sevenDaysMs = 7 * 24 * 3600 * 1000;
    if (startTime.getTime() > currentDemoTime.getTime() + sevenDaysMs) {
      return { success: false, error: 'En fazla 7 gün ileriye rezervasyon yapılabilir.', code: 400 };
    }

    // Şarjlı parkta soket tipi kontrolü
    if (tur === 'sarjli' && !soketTipi) {
      return { success: false, error: 'Şarjlı park için soket tipi seçimi zorunludur.', code: 400 };
    }

    // Uygun en küçük kaynak kimliğini seç (Page 4: "Kontrol ve kayıt tek işlem içinde kilitlenir; iki eşzamanlı istekten yalnızca biri son yeri alabilir.")
    const space = findAvailableSpace(lotId, tur, startTime, endTime, spaces, reservations, currentDemoTime);

    if (!space) {
      // T01: Kapasite / durum çatışması -> 409
      return {
        success: false,
        error: 'Seçtiğiniz tarih ve saat aralığında bu otoparkta uygun park yeri bulunmamaktadır.',
        code: 409
      };
    }

    // Şarjlı park ise bağlı soketi ve tarifeyi al
    let sarjTarifeKurus: number | undefined;
    if (tur === 'sarjli') {
      const charger = chargers.find(c => c.space_id === space.id);
      if (charger) {
        sarjTarifeKurus = charger.kWh_bedeli_kurus;
      }
    }

    // Benzersiz okunabilir rezervasyon kodu (örn: "PC-84729")
    const randomCode = `PC-${Math.floor(10000 + Math.random() * 90000)}`;

    const newReservation: Reservation = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      kod: randomCode,
      user_id: currentUser.id,
      user_ad: currentUser.ad,
      user_email: currentUser.email,
      space_id: space.id,
      lot_id: lotId,
      baslangic: startTime.toISOString(),
      bitis: endTime.toISOString(),
      durum: 'ONAYLI',
      kaynak: 'uygulama',
      saatlik_tarife_kurus: lot.saatlik_ucret_kurus,
      sarj_tarife_kurus: sarjTarifeKurus,
      olusturulma: currentDemoTime.toISOString(),
      islem_anahtari: idempotencyKey,
      plaka: plaka || '34 DEMO 99',
      erisilebilir_ihtiyac_beyani: erisilebilirBeyan,
      soket_tipi: soketTipi
    };

    setReservations(prev => [newReservation, ...prev]);
    logAudit(
      'REZERVASYON_OLUSTURULDU',
      `Rezervasyon #${newReservation.kod}`,
      undefined,
      'ONAYLI',
      `${lot.ad} - Yer: ${space.kod} (${tur})`
    );

    return { success: true, reservation: newReservation };
  }, [lots, spaces, chargers, reservations, currentDemoTime, currentUser, logAudit]);

  // --- İPTAL ETME (Page 2 & 4 & 8 / T03) ---
  const cancelReservation = useCallback((reservationId: string): { success: boolean; error?: string } => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) {
      return { success: false, error: 'Rezervasyon bulunamadı.' };
    }

    // Yalnızca ONAYLI durumdayken iptal edilebilir
    if (res.durum !== 'ONAYLI') {
      return { success: false, error: 'Yalnızca ONAYLI durumdaki rezervasyonlar iptal edilebilir.' };
    }

    // Sürücü yetki kontrolü: Sürücü yalnızca kendi rezervasyonunu iptal edebilir
    if (currentUser.rol === 'surucu' && res.user_id && res.user_id !== currentUser.id) {
      return { success: false, error: 'Başka kullanıcının rezervasyonunu iptal edemezsiniz.' };
    }

    setReservations(prev =>
      prev.map(r => (r.id === reservationId ? { ...r, durum: 'İPTAL' as const } : r))
    );

    logAudit(
      'REZERVASYON_IPTAL_EDILDI',
      `Rezervasyon #${res.kod}`,
      'ONAYLI',
      'İPTAL',
      'Kullanıcı/Yetkili tarafından iptal edildi; kapasite serbest bırakıldı.'
    );

    return { success: true };
  }, [reservations, currentUser, logAudit]);

  // --- GÖREVLİ GİRİŞ (CHECK-IN) (Page 4, 5, 8 / T07, T08) ---
  const checkIn = useCallback((kod: string, operatorLotId?: string): { success: boolean; message?: string; error?: string } => {
    const cleanCode = kod.trim().toUpperCase();
    const res = reservations.find(r => r.kod.toUpperCase() === cleanCode);

    if (!res) {
      return { success: false, error: 'Bu koda sahip rezervasyon bulunamadı.' };
    }

    // Görevli yetki kontrolü: Yalnızca atandığı otoparkın araçlarına işlem yapabilir
    const effectiveLotId = operatorLotId || currentUser.assigned_lot_id;
    if (currentUser.rol === 'gorevli' && effectiveLotId && res.lot_id !== effectiveLotId) {
      return { success: false, error: 'Bu rezervasyon başka bir otoparka aittir. İşlem yetkiniz yoktur.' };
    }

    // Durum kontrolü: Zaten İÇERİDE ise çift tıklama engellenir (idempotent)
    if (res.durum === 'İÇERİDE') {
      return { success: true, message: 'Araç zaten içeride olarak kayıtlıdır (tekrar işlem yapılmadı).' };
    }

    if (res.durum !== 'ONAYLI') {
      return { success: false, error: `Rezervasyon durumu (${res.durum}) giriş için uygun değildir.` };
    }

    // Zaman penceresi doğrulaması (validateCheckInTime)
    const timeValidation = validateCheckInTime(res, currentDemoTime);
    if (!timeValidation.allowed) {
      return { success: false, error: timeValidation.reason };
    }

    // Giriş onaylanır -> İÇERİDE durumuna geçer, giriş zamanı atanır
    setReservations(prev =>
      prev.map(r =>
        r.id === res.id
          ? { ...r, durum: 'İÇERİDE' as const, giris: currentDemoTime.toISOString() }
          : r
      )
    );

    logAudit(
      'GIRIS_YAPILDI',
      `Rezervasyon #${res.kod}`,
      'ONAYLI',
      'İÇERİDE',
      `Araç otoparka giriş yaptı. Fiziksel doluluk +1 arttı.`
    );

    return { success: true, message: `Araç girişi onaylandı. Kod: ${res.kod}` };
  }, [reservations, currentUser, currentDemoTime, logAudit]);

  // --- GÖREVLİ ÇIKIŞ (CHECK-OUT) (Page 4, 5, 8 / T07) ---
  const checkOut = useCallback((reservationId: string, operatorLotId?: string): { success: boolean; message?: string; error?: string } => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) {
      return { success: false, error: 'Rezervasyon bulunamadı.' };
    }

    const effectiveLotId = operatorLotId || currentUser.assigned_lot_id;
    if (currentUser.rol === 'gorevli' && effectiveLotId && res.lot_id !== effectiveLotId) {
      return { success: false, error: 'Bu rezervasyon başka bir otoparka aittir.' };
    }

    // Tekrar çıkış engellenir
    if (res.durum === 'TAMAMLANDI') {
      return { success: true, message: 'Araç çıkışı daha önce tamamlanmıştır.' };
    }

    if (res.durum !== 'İÇERİDE') {
      return { success: false, error: `Araç içeride değil (Durum: ${res.durum}).` };
    }

    // Şarj kontrolü (Page 5): "Şarj sürerken çıkış engellenir; önce şarj kapatılır."
    const activeCharge = chargeSessions.find(
      cs => cs.reservation_id === res.id && cs.aktif_mi
    );
    if (activeCharge) {
      return {
        success: false,
        error: 'Bu aracın şarj işlemi devam etmektedir! Çıkış yapabilmek için önce şarj simülasyonunu bitiriniz.'
      };
    }

    // Çıkış onaylanır -> TAMAMLANDI olur, çıkış zamanı kaydedilir
    setReservations(prev =>
      prev.map(r =>
        r.id === res.id
          ? { ...r, durum: 'TAMAMLANDI' as const, cikis: currentDemoTime.toISOString() }
          : r
      )
    );

    logAudit(
      'CIKIS_YAPILDI',
      `Rezervasyon #${res.kod}`,
      'İÇERİDE',
      'TAMAMLANDI',
      `Araç çıkış yaptı. Fiziksel doluluk -1 azaldı, belediye tamamlanan ziyaret sayısı arttı.`
    );

    return { success: true, message: `Çıkış işlemi tamamlandı. Kod: ${res.kod}` };
  }, [reservations, chargeSessions, currentUser, currentDemoTime, logAudit]);

  // --- REZERVASYONSUZ GİRİŞ (WALK-IN) (Page 4 & 5) ---
  const walkInCheckIn = useCallback((params: {
    lotId: string;
    tur: SpaceType;
    expectedEnd: Date | string;
    plaka: string;
    soketTipi?: SocketType;
  }): { success: boolean; message?: string; error?: string } => {
    const { lotId, tur, expectedEnd, plaka, soketTipi } = params;

    const lot = lots.find(l => l.id === lotId);
    if (!lot) return { success: false, error: 'Otopark bulunamadı.' };

    const startTime = currentDemoTime;
    const endTime = new Date(expectedEnd);

    if (endTime.getTime() <= startTime.getTime()) {
      return { success: false, error: 'Beklenen çıkış saati şimdiki zamandan ileri olmalıdır.' };
    }

    // Boş kaynak bul
    const space = findAvailableSpace(lotId, tur, startTime, endTime, spaces, reservations, currentDemoTime);
    if (!space) {
      return { success: false, error: 'Bu türde şu anda boş veya uygun yer bulunmamaktadır.' };
    }

    const randomCode = `PC-W${Math.floor(1000 + Math.random() * 9000)}`;

    const newReservation: Reservation = {
      id: `res-walkin-${Date.now()}`,
      kod: randomCode,
      space_id: space.id,
      lot_id: lotId,
      baslangic: startTime.toISOString(),
      bitis: endTime.toISOString(),
      durum: 'İÇERİDE', // Doğrudan İÇERİDE olur
      kaynak: 'gorevli',
      giris: startTime.toISOString(),
      saatlik_tarife_kurus: lot.saatlik_ucret_kurus,
      olusturulma: startTime.toISOString(),
      plaka: plaka.trim().toUpperCase(),
      soket_tipi: soketTipi
    };

    setReservations(prev => [newReservation, ...prev]);
    logAudit(
      'REZERVASYONSUZ_GIRIS',
      `Plaka: ${plaka} (#${randomCode})`,
      undefined,
      'İÇERİDE',
      `Görevli tarafından kapıdan araç alındı. Yer: ${space.kod}`
    );

    return { success: true, message: `Araç girişi yapıldı. Tahsis edilen yer: ${space.kod}` };
  }, [lots, spaces, reservations, currentDemoTime, logAudit]);

  // --- ALAN KAPATMA / AÇMA (Page 4 & 8 / T09) ---
  const toggleSpaceClosed = useCallback((spaceId: string): { success: boolean; error?: string } => {
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return { success: false, error: 'Park yeri bulunamadı.' };

    // Eğer şu an kapalı ise, direkt açılabilir
    if (space.kapali_mi) {
      setSpaces(prev =>
        prev.map(s => (s.id === spaceId ? { ...s, kapali_mi: false } : s))
      );
      logAudit('ALAN_ACILDI', `Yer: ${space.kod}`, 'KAPALI', 'AÇIK');
      return { success: true };
    }

    // Kapatılmak isteniyorsa:
    // Page 4: "Aktif veya gelecekte rezervasyonu olan yerin kapatılması engellenir; önce çözüm gerekir."
    const hasActiveOrFuture = reservations.some(r => {
      if (r.space_id !== spaceId) return false;
      if (r.durum === 'İÇERİDE') return true;
      if (r.durum === 'ONAYLI' && new Date(r.bitis).getTime() > currentDemoTime.getTime()) return true;
      return false;
    });

    if (hasActiveOrFuture) {
      return {
        success: false,
        error: 'Bu park yerinde aktif içeride araç veya onaylı gelecek rezervasyon bulunmaktadır! Kapatılamaz.'
      };
    }

    setSpaces(prev =>
      prev.map(s => (s.id === spaceId ? { ...s, kapali_mi: true } : s))
    );
    logAudit('ALAN_KAPATILDI', `Yer: ${space.kod}`, 'AÇIK', 'KAPALI');
    return { success: true };
  }, [spaces, reservations, currentDemoTime, logAudit]);

  // --- ŞARJ SİMÜLASYONU BAŞLATMA (Page 5 & 8 / T10) ---
  const startCharging = useCallback((reservationId: string, chargerId: string): { success: boolean; error?: string } => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return { success: false, error: 'Rezervasyon bulunamadı.' };

    // Şarj simülasyonu yalnızca ilgili rezervasyon İÇERİDE iken başlayabilir (Page 5)
    if (res.durum !== 'İÇERİDE') {
      return { success: false, error: 'Şarj simülasyonu yalnızca araç İÇERİDE durumundayken başlatılabilir.' };
    }

    const charger = chargers.find(c => c.id === chargerId);
    if (!charger) return { success: false, error: 'Şarj cihazı bulunamadı.' };

    if (charger.durum !== 'HAZIR') {
      return { success: false, error: `Şarj cihazı şu anda kullanımda veya arızalıdır (Durum: ${charger.durum}).` };
    }

    // İkinci şarj oturumu başlatılamaz
    const existingActive = chargeSessions.find(cs => cs.reservation_id === reservationId && cs.aktif_mi);
    if (existingActive) {
      return { success: false, error: 'Bu rezervasyon için zaten devam eden bir şarj oturumu vardır.' };
    }

    const newSession: ChargeSession = {
      id: `cs-${Date.now()}`,
      reservation_id: reservationId,
      charger_id: chargerId,
      baslangic: currentDemoTime.toISOString(),
      enerji_kWh: 0,
      birim_fiyat_kurus: charger.kWh_bedeli_kurus,
      aktif_mi: true
    };

    setChargeSessions(prev => [newSession, ...prev]);
    setChargers(prev =>
      prev.map(c => (c.id === chargerId ? { ...c, durum: 'ŞARJ EDİYOR' as const } : c))
    );

    logAudit(
      'SARJ_BASLATILDI',
      `Şarj Ünitesi #${charger.id}`,
      'HAZIR',
      'ŞARJ EDİYOR',
      `Rezervasyon: #${res.kod}`
    );

    return { success: true };
  }, [reservations, chargers, chargeSessions, currentDemoTime, logAudit]);

  // --- ŞARJ SİMÜLASYONU BİTİRME (Page 5 & 8 / T10, T11) ---
  const stopCharging = useCallback((chargeSessionId: string, energyKwh: number): { success: boolean; message?: string; error?: string } => {
    const session = chargeSessions.find(cs => cs.id === chargeSessionId);
    if (!session) return { success: false, error: 'Şarj oturumu bulunamadı.' };
    if (!session.aktif_mi) return { success: false, error: 'Bu şarj oturumu zaten sonlandırılmış.' };

    if (energyKwh < 0 || energyKwh > 100) {
      return { success: false, error: 'Enerji miktarı 0 ile 100 kWh arasında olmalıdır.' };
    }

    const roundedKwh = Math.round(energyKwh * 100) / 100;
    const totalCostKurus = calculateChargePriceKurus(roundedKwh, session.birim_fiyat_kurus);

    setChargeSessions(prev =>
      prev.map(cs =>
        cs.id === chargeSessionId
          ? {
              ...cs,
              aktif_mi: false,
              enerji_kWh: roundedKwh,
              bitis: currentDemoTime.toISOString()
            }
          : cs
      )
    );

    // Charger durumunu tekrar HAZIR yap
    setChargers(prev =>
      prev.map(c => (c.id === session.charger_id ? { ...c, durum: 'HAZIR' as const } : c))
    );

    logAudit(
      'SARJ_TAMAMLANDI',
      `Şarj Oturumu #${session.id}`,
      'ŞARJ EDİYOR',
      'HAZIR',
      `Tüketilen Enerji: ${roundedKwh} kWh, Tutar: ${totalCostKurus / 100} TL`
    );

    return {
      success: true,
      message: `Şarj tamamlandı. Tüketim: ${roundedKwh} kWh, Tutar: ${(totalCostKurus / 100).toFixed(2)} TL`
    };
  }, [chargeSessions, currentDemoTime, logAudit]);

  // --- ŞARJ CİHAZI ARIZA TOGGLE ---
  const toggleChargerOutage = useCallback((chargerId: string): { success: boolean; error?: string } => {
    const charger = chargers.find(c => c.id === chargerId);
    if (!charger) return { success: false, error: 'Şarj cihazı bulunamadı.' };

    if (charger.durum === 'ARIZALI') {
      setChargers(prev =>
        prev.map(c => (c.id === chargerId ? { ...c, durum: 'HAZIR' as const } : c))
      );
      logAudit('SARJ_ARIZA_GIDERILDI', `Cihaz #${chargerId}`, 'ARIZALI', 'HAZIR');
      return { success: true };
    }

    if (charger.durum === 'ŞARJ EDİYOR') {
      return { success: false, error: 'Aktif şarj sürerken cihaz arızaya alınamaz.' };
    }

    setChargers(prev =>
      prev.map(c => (c.id === chargerId ? { ...c, durum: 'ARIZALI' as const } : c))
    );
    logAudit('SARJ_ARIZAYA_ALINDI', `Cihaz #${chargerId}`, 'HAZIR', 'ARIZALI');
    return { success: true };
  }, [chargers, logAudit]);

  // Tesis Doluluk Özetleri
  const lotSummaries = useMemo(() => {
    const map: Record<string, LotOccupancySummary> = {};
    for (const lot of lots) {
      map[lot.id] = calculateLotOccupancy(lot, spaces, reservations, currentDemoTime);
    }
    return map;
  }, [lots, spaces, reservations, currentDemoTime]);

  // Genel Toplam Doluluk Göstergeleri
  const totalOccupancy = useMemo(() => {
    let toplam_yer = 0;
    let kapali_yer = 0;
    let fiziksel_dolu_yer = 0;
    let toplam_bugun_rezervasyon = 0;

    for (const key of Object.keys(lotSummaries)) {
      const summary = lotSummaries[key];
      toplam_yer += summary.toplam_yer;
      kapali_yer += summary.kapali_yer;
      fiziksel_dolu_yer += summary.fiziksel_dolu_yer;
      toplam_bugun_rezervasyon += summary.bugun_beklenen_rezervasyon;
    }

    const fiziksel_bos_yer = Math.max(0, toplam_yer - kapali_yer - fiziksel_dolu_yer);
    const acik_yer = toplam_yer - kapali_yer;
    const genel_doluluk_orani = acik_yer > 0 ? Math.round((fiziksel_dolu_yer / acik_yer) * 100) : 0;

    return {
      toplam_yer,
      kapali_yer,
      fiziksel_dolu_yer,
      fiziksel_bos_yer,
      toplam_bugun_rezervasyon,
      genel_doluluk_orani
    };
  }, [lotSummaries]);

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users: DEMO_USERS,
        lots,
        spaces,
        chargers,
        reservations,
        chargeSessions,
        auditLogs,
        clockOffsetSeconds,
        currentDemoTime,
        mobileFrameMode,
        isHydrated,
        lotSummaries,
        totalOccupancy,
        setCurrentUser,
        switchUserById,
        advanceClock,
        resetDemoData,
        setMobileFrameMode,
        toggleMobileFrameMode,
        createReservation,
        cancelReservation,
        checkIn,
        checkOut,
        walkInCheckIn,
        toggleSpaceClosed,
        startCharging,
        stopCharging,
        toggleChargerOutage
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore, bir StoreProvider içerisinde kullanılmalıdır.');
  }
  return context;
}
