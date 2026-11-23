'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { SpaceType, SocketType } from '@/types';
import {
  formatIstanbulTime,
  formatKurusToTL,
  isExitOverdue,
  getExitOverdueMinutes
} from '@/lib/calculations';
import RoleGuard from '@/components/RoleGuard';
import {
  CheckCircle2,
  AlertTriangle,
  Car,
  Zap,
  LogIn,
  LogOut,
  PlusCircle,
  Lock,
  Search,
  BatteryCharging
} from 'lucide-react';

export default function IsletmePage() {
  return (
    <RoleGuard allowedRoles={['gorevli', 'demo_yoneticisi']}>
      <IsletmePanelContent />
    </RoleGuard>
  );
}

function IsletmePanelContent() {
  const {
    currentUser,
    lots,
    spaces,
    chargers,
    reservations,
    chargeSessions,
    lotSummaries,
    currentDemoTime,
    checkIn,
    checkOut,
    walkInCheckIn,
    toggleSpaceClosed,
    startCharging,
    stopCharging,
    toggleChargerOutage
  } = useStore();

  const defaultLotId = currentUser.assigned_lot_id || 'merkez';
  const [activeLotId, setActiveLotId] = useState<string>(defaultLotId);

  const lot = useMemo(() => lots.find(l => l.id === activeLotId) || lots[0], [lots, activeLotId]);
  const summary = lotSummaries[lot.id];

  const [activeTab, setActiveTab] = useState<'genel' | 'araclar' | 'kapasite' | 'sarj'>('genel');
  const [checkInCode, setCheckInCode] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInPlate, setWalkInPlate] = useState('34 KAPI 01');
  const [walkInTur, setWalkInTur] = useState<SpaceType>('standart');
  const [walkInHours, setWalkInHours] = useState(2);

  const [stopChargeSessionId, setStopChargeSessionId] = useState<string | null>(null);
  const [chargeKwhInput, setChargeKwhInput] = useState<number>(14.5);

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleCheckIn = (codeToUse?: string) => {
    const code = codeToUse || checkInCode;
    if (!code.trim()) {
      showFeedback('Lütfen geçerli bir rezervasyon kodu giriniz.', 'error');
      return;
    }

    const res = checkIn(code, lot.id);
    if (!res.success) {
      showFeedback(res.error || 'Giriş onaylanamadı.', 'error');
    } else {
      showFeedback(res.message || 'Araç girişi onaylandı.', 'success');
      setCheckInCode('');
    }
  };

  const handleCheckOut = (reservationId: string) => {
    const res = checkOut(reservationId, lot.id);
    if (!res.success) {
      showFeedback(res.error || 'Çıkış onaylanamadı.', 'error');
    } else {
      showFeedback(res.message || 'Araç çıkışı tamamlandı.', 'success');
    }
  };

  const handleWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedEnd = new Date(currentDemoTime.getTime() + walkInHours * 3600 * 1000);
    const res = walkInCheckIn({
      lotId: lot.id,
      tur: walkInTur,
      expectedEnd,
      plaka: walkInPlate
    });

    if (!res.success) {
      showFeedback(res.error || 'Kapıdan giriş oluşturulamadı.', 'error');
    } else {
      showFeedback(res.message || 'Kapıdan araç girişi tamamlandı.', 'success');
      setShowWalkInModal(false);
    }
  };

  const handleToggleSpace = (spaceId: string) => {
    const res = toggleSpaceClosed(spaceId);
    if (!res.success) {
      showFeedback(res.error || 'Alan kapatılamadı.', 'error');
    } else {
      showFeedback('Park yeri durumu güncellendi.', 'success');
    }
  };

  const insideCars = reservations.filter(
    r => r.lot_id === lot.id && r.durum === 'İÇERİDE'
  );

  const todayExpected = reservations.filter(
    r => r.lot_id === lot.id && r.durum === 'ONAYLI'
  );

  const lotSpaces = spaces.filter(s => s.lot_id === lot.id);
  const lotSpaceIds = new Set(lotSpaces.map(s => s.id));
  const lotChargers = chargers.filter(c => lotSpaceIds.has(c.space_id));

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Üst Başlık & Tesis Seçici */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Görevli İşletme Paneli
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Görevli: <strong className="text-slate-800">{currentUser.ad}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {lot.ad}
          </h1>
          <p className="text-xs text-slate-500">{lot.ornek_bolge} • Canlı Tesis Yönetimi</p>
        </div>

        {currentUser.rol === 'demo_yoneticisi' && (
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 pl-1 shrink-0">Tesis:</span>
            {lots.map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveLotId(l.id)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[32px] ${
                  activeLotId === l.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l.ad.replace('ParkCep ', '').split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bildirim / Hata Mesajı */}
      {feedbackMessage && (
        <div
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-xs flex items-center justify-between animate-in fade-in ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600 p-1">
            ✕
          </button>
        </div>
      )}

      {/* İŞLETME GÖSTERGELERİ (6 Kart) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Toplam Yer
          </span>
          <div className="mt-0.5 text-xl sm:text-2xl font-black text-slate-900">{summary?.toplam_yer}</div>
          <span className="text-[10px] text-slate-500 truncate block">Kapasite</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Kapalı Yer
          </span>
          <div className="mt-0.5 text-xl sm:text-2xl font-black text-amber-600">{summary?.kapali_yer}</div>
          <span className="text-[10px] text-amber-800 truncate block">Bakım</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-teal-200 bg-teal-50/20 shadow-2xs">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-teal-800 block truncate">
            Fiziksel Dolu
          </span>
          <div className="mt-0.5 text-xl sm:text-2xl font-black text-teal-700">{summary?.fiziksel_dolu_yer}</div>
          <span className="text-[10px] text-teal-800 truncate block">İçerideki araç</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-800 block truncate">
            Fiziksel Boş
          </span>
          <div className="mt-0.5 text-xl sm:text-2xl font-black text-emerald-600">{summary?.fiziksel_bos_yer}</div>
          <span className="text-[10px] text-emerald-800 truncate block">Boş park yeri</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Bugün Beklenen
          </span>
          <div className="mt-0.5 text-xl sm:text-2xl font-black text-blue-600">{summary?.bugun_beklenen_rezervasyon}</div>
          <span className="text-[10px] text-blue-800 truncate block">Onaylı rezervasyon</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Doluluk Oranı
          </span>
          <div className="mt-0.5 text-xl sm:text-2xl font-black text-slate-900 truncate">
            {summary?.doluluk_yuzdesi === 'Hizmet dışı' ? 'Hizmet Dışı' : `%${summary?.doluluk_yuzdesi}`}
          </div>
          <span className="text-[10px] text-slate-500 truncate block">Dolu / açık</span>
        </div>
      </div>

      {/* HIZLI İŞLEM ÇUBUĞU (KODLA GİRİŞ & WALK-IN) */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Kod ile Check-in */}
        <div className="flex items-center gap-2 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rezervasyon kodu (örn: PC-10101)..."
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 placeholder-slate-400 bg-slate-50 uppercase focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[42px]"
            />
          </div>
          <button
            onClick={() => handleCheckIn()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 min-h-[42px]"
          >
            <LogIn className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Giriş Onayla</span>
          </button>
        </div>

        {/* Walk-in Butonu */}
        <button
          onClick={() => setShowWalkInModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer min-h-[42px]"
        >
          <PlusCircle className="w-4 h-4 text-slate-950 shrink-0" />
          <span>Rezervasyonsuz Giriş (Walk-in)</span>
        </button>
      </div>

      {/* İÇERİK SEKMELERİ */}
      <div className="flex gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('genel')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
            activeTab === 'genel'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900'
          }`}
        >
          İçerideki Araçlar ({insideCars.length})
        </button>

        <button
          onClick={() => setActiveTab('araclar')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
            activeTab === 'araclar'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900'
          }`}
        >
          Beklenen Rezervasyonlar ({todayExpected.length})
        </button>

        <button
          onClick={() => setActiveTab('kapasite')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
            activeTab === 'kapasite'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900'
          }`}
        >
          Alan Kapatma & Yerler ({lotSpaces.length})
        </button>

        <button
          onClick={() => setActiveTab('sarj')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
            activeTab === 'sarj'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900'
          }`}
        >
          Şarj İstasyonları ({lotChargers.length})
        </button>
      </div>

      {/* 1. SEKME: İÇERİDEKİ ARAÇLAR */}
      {activeTab === 'genel' && (
        <div className="space-y-2.5 sm:space-y-3">
          {insideCars.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              Şu anda bu tesiste içeride kayıtlı araç bulunmamaktadır.
            </div>
          ) : (
            insideCars.map((car) => {
              const space = spaces.find(s => s.id === car.space_id);
              const isOverdue = isExitOverdue(car, currentDemoTime);
              const overdueMins = getExitOverdueMinutes(car, currentDemoTime);
              const activeCharge = chargeSessions.find(cs => cs.reservation_id === car.id && cs.aktif_mi);

              return (
                <div
                  key={car.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all ${
                    isOverdue ? 'border-rose-300 bg-rose-50/20 shadow-xs' : 'border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs sm:text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        {car.plaka || 'PLAKA BELİRTİLMEDİ'}
                      </span>
                      <span className="font-mono text-xs text-slate-500">#{car.kod}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800">
                        Yer: {space?.kod}
                      </span>
                      {car.kaynak === 'gorevli' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                          Walk-in
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-600 flex-wrap">
                      <span>Giriş: <strong>{formatIstanbulTime(car.giris || car.baslangic)}</strong></span>
                      <span>•</span>
                      <span>Bitiş: <strong>{formatIstanbulTime(car.bitis)}</strong></span>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Gecikmede (+{overdueMins} dk)</span>
                        </span>
                      )}
                    </div>

                    {activeCharge && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">
                        <Zap className="w-3.5 h-3.5 shrink-0" />
                        <span>Şarj devam ediyor (çıkıştan önce şarj bitirilmeli)</span>
                      </div>
                    )}
                  </div>

                  {/* Butonlar */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {car.soket_tipi && !activeCharge && (
                      <button
                        onClick={() => {
                          const charger = chargers.find(c => c.space_id === car.space_id);
                          if (charger) startCharging(car.id, charger.id);
                        }}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors cursor-pointer min-h-[38px]"
                      >
                        <Zap className="w-3.5 h-3.5 shrink-0" />
                        <span>Şarj Başlat</span>
                      </button>
                    )}

                    {activeCharge && (
                      <button
                        onClick={() => setStopChargeSessionId(activeCharge.id)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer min-h-[38px]"
                      >
                        <BatteryCharging className="w-3.5 h-3.5 shrink-0" />
                        <span>Şarjı Bitir</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCheckOut(car.id)}
                      className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer min-h-[38px]"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. SEKME: BEKLENEN REZERVASYONLAR */}
      {activeTab === 'araclar' && (
        <div className="space-y-2.5 sm:space-y-3">
          {todayExpected.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              Bu tesis için bekleyen onaylı rezervasyon bulunmamaktadır.
            </div>
          ) : (
            todayExpected.map((res) => {
              const space = spaces.find(s => s.id === res.space_id);
              return (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        #{res.kod}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">{res.user_ad || 'Sürücü'}</span>
                      <span className="text-[11px] font-semibold text-slate-500">Yer: {space?.kod}</span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span>Saat: <strong>{formatIstanbulTime(res.baslangic)} - {formatIstanbulTime(res.bitis)}</strong></span>
                      {res.plaka && <span>• Plaka: <strong className="font-mono">{res.plaka}</strong></span>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCheckIn(res.kod)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer min-h-[38px] shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Girişi Onayla</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. SEKME: ALAN KAPATMA & YERLER */}
      {activeTab === 'kapasite' && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Park Yeri Durum ve Bakım Kontrolü</h3>
            <p className="text-xs text-slate-500">
              * Aktif veya gelecekte rezervasyonu bulunan yerler kapatılamaz. Boş yerler kapatıldığında tesis uygun kapasitesi azalır.
            </p>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
            {lotSpaces.map((sp) => {
              const isInside = reservations.some(r => r.space_id === sp.id && r.durum === 'İÇERİDE');
              const hasFuture = reservations.some(
                r => r.space_id === sp.id && r.durum === 'ONAYLI' && new Date(r.bitis).getTime() > currentDemoTime.getTime()
              );

              return (
                <div
                  key={sp.id}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border flex flex-col justify-between transition-all ${
                    sp.kapali_mi
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : isInside
                      ? 'bg-teal-50/50 border-teal-300 text-teal-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs sm:text-sm">{sp.kod}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-500">{sp.tur.slice(0, 3)}</span>
                  </div>

                  <div className="my-2 text-[11px] font-semibold">
                    {sp.kapali_mi ? (
                      <span className="text-rose-700 flex items-center gap-1">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span>KAPALI</span>
                      </span>
                    ) : isInside ? (
                      <span className="text-teal-700 flex items-center gap-1">
                        <Car className="w-3 h-3 shrink-0" />
                        <span>İÇERİDE</span>
                      </span>
                    ) : hasFuture ? (
                      <span className="text-blue-700">Rezerve</span>
                    ) : (
                      <span className="text-emerald-700">BOŞ</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleSpace(sp.id)}
                    className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold transition-colors cursor-pointer min-h-[30px] ${
                      sp.kapali_mi
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    {sp.kapali_mi ? 'Alanı Aç' : 'Alanı Kapat'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SEKME: ŞARJ İSTASYONLARI */}
      {activeTab === 'sarj' && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Elektrikli Araç Şarj Üniteleri</h3>
            <p className="text-xs text-slate-500">
              * Şarj simülasyonu yalnızca ilgili rezervasyon İÇERİDE iken başlatılabilir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {lotChargers.map((ch) => {
              const activeSession = chargeSessions.find(cs => cs.charger_id === ch.id && cs.aktif_mi);
              const relatedRes = activeSession ? reservations.find(r => r.id === activeSession.reservation_id) : null;

              return (
                <div
                  key={ch.id}
                  className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 min-w-0 truncate">
                      <Zap className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="truncate">{ch.soket_tipi} - {ch.guc_kW} kW</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        ch.durum === 'HAZIR'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ch.durum === 'ŞARJ EDİYOR'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ch.durum}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>Birim Tarife: <strong>{formatKurusToTL(ch.kWh_bedeli_kurus)} / kWh</strong></div>
                    {activeSession && (
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
                        Aktif Oturum: Rezervasyon <strong>#{relatedRes?.kod}</strong> ({relatedRes?.plaka})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    {activeSession ? (
                      <button
                        onClick={() => setStopChargeSessionId(activeSession.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer min-h-[38px]"
                      >
                        Simülasyonu Bitir (Enerji Gir)
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleChargerOutage(ch.id)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer min-h-[38px] ${
                          ch.durum === 'ARIZALI'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                        }`}
                      >
                        {ch.durum === 'ARIZALI' ? 'Arızayı Gider' : 'Arızaya Al'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WALK-IN MODALI */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleWalkIn}
            className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Rezervasyonsuz Giriş (Walk-in)</h3>
              <button
                type="button"
                onClick={() => setShowWalkInModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Araç Plakası</label>
              <input
                type="text"
                required
                value={walkInPlate}
                onChange={(e) => setWalkInPlate(e.target.value.toUpperCase())}
                placeholder="34 KAPI 01"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-bold uppercase focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Park Türü</label>
              <select
                value={walkInTur}
                onChange={(e) => setWalkInTur(e.target.value as SpaceType)}
                aria-label="Rezervasyonsuz giriş park türü"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[42px]"
              >
                <option value="standart">Standart Park</option>
                <option value="erisilebilir">Erişilebilir Park</option>
                <option value="sarjli">Şarjlı Park (EV)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Beklenen Kalış Süresi
              </label>
              <select
                value={walkInHours}
                onChange={(e) => setWalkInHours(Number(e.target.value))}
                aria-label="Beklenen kalış süresi seçimi"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[42px]"
              >
                <option value={1}>1 Saat</option>
                <option value={2}>2 Saat</option>
                <option value={3}>3 Saat</option>
                <option value={4}>4 Saat</option>
                <option value={6}>6 Saat</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWalkInModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[42px]"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-xs min-h-[42px]"
              >
                Girişi Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ŞARJ BİTİRME MODALI */}
      {stopChargeSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Şarj Simülasyonunu Bitir</h3>
              <button
                onClick={() => setStopChargeSessionId(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tüketilen 0 - 100 kWh arası enerji miktarını girerek oturumu sonlandırın.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tüketilen Enerji (kWh)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={chargeKwhInput}
                onChange={(e) => setChargeKwhInput(Number(e.target.value))}
                placeholder="14.50"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[42px]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setStopChargeSessionId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[42px]"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  stopCharging(stopChargeSessionId, chargeKwhInput);
                  setStopChargeSessionId(null);
                  showFeedback(`Şarj başarıyla tamamlandı (${chargeKwhInput} kWh).`, 'success');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs min-h-[42px]"
              >
                Hesapla ve Bitir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
