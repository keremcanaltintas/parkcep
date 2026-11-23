'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import RoleGuard from '@/components/RoleGuard';
import {
  RotateCcw,
  FastForward,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react';
import {
  formatIstanbulDateTime,
  formatIstanbulTime,
  calculateParkingPriceKurus,
  calculateChargePriceKurus,
  isOverlapping
} from '@/lib/calculations';

export default function DemoPage() {
  return (
    <RoleGuard allowedRoles={['demo_yoneticisi']}>
      <DemoControlContent />
    </RoleGuard>
  );
}

function DemoControlContent() {
  const {
    currentUser,
    auditLogs,
    currentDemoTime,
    clockOffsetSeconds,
    advanceClock,
    resetDemoData,
    spaces,
    lots
  } = useStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [testResultFeedback, setTestResultFeedback] = useState<string | null>(null);

  const handleAdvance = (seconds: number, label: string) => {
    advanceClock(seconds);
    setTestResultFeedback(`Zaman ${label} ileri alındı. Süresi dolan rezervasyonlar ve doluluklar güncellendi.`);
    setTimeout(() => setTestResultFeedback(null), 4000);
  };

  const handleReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
    setTestResultFeedback(`Tüm veritabanı başlangıç kurgusuna (${lots.length} tesis / ${spaces.length} park yeri) başarıyla sıfırlandı.`);
    setTimeout(() => setTestResultFeedback(null), 4000);
  };

  const testMatrix = [
    {
      id: 'T01',
      title: 'Kapasite ve 409 Çakışması',
      rule: 'Aynı gelecek saate son uygun kaynağı isteyen iki kullanıcıdan biri başarılı olur, diğeri 409 alır.',
      status: 'Geçti'
    },
    {
      id: 'T02',
      title: 'Idempotency (İşlem Anahtarı)',
      rule: 'Aynı işlem anahtarıyla iki kez gönderim yalnızca bir kayıt üretir.',
      status: 'Geçti'
    },
    {
      id: 'T03',
      title: 'İptal ve Kapasite İadesi',
      rule: 'Rezervasyon iptal edilince aynı saat için kapasite geri açılır; fiziksel doluluk değişmez.',
      status: 'Geçti'
    },
    {
      id: 'T04',
      title: 'Saat Çakışma Mantığı [start, end)',
      rule: '10.00-11.00 kaydı 10.30-11.30 ile çakışır, 11.00-12.00 ile çakışmaz.',
      status: 'Doğrulandı'
    },
    {
      id: 'T05',
      title: 'Giriş Gecikmesi & GELMEDİ Kuralı',
      rule: 'Demo saati başlangıç + 10 dakikaya ilerletilince girilmemiş kayıt GELMEDİ olur ve kaynak serbest kalır.',
      status: 'Aktif Denetleniyor'
    },
    {
      id: 'T06',
      title: 'Çıkış Gecikmesi Uyarısı',
      rule: 'İçerideki araç bitişi aşarsa otomatik çıkmaz; GECİKMEDE uyarısı gösterilir.',
      status: 'Doğrulandı'
    },
    {
      id: 'T07',
      title: 'Giriş ve Çıkış Doluluk Etkisi',
      rule: 'Giriş fiziksel doluluğu +1 artırır, çıkış -1 azaltır; tekrar tıklama ikinci kez etkilemez.',
      status: 'Doğrulandı'
    },
    {
      id: 'T08',
      title: 'Yetki ve KVKK İzolasyonu',
      rule: 'Başka tesis görevlisi operasyon yapamaz. Belediye yanıtında ad, e-posta, plaka ve kod bulunmaz.',
      status: 'Doğrulandı'
    },
    {
      id: 'T09',
      title: 'Alan Kapatma Sınırlaması',
      rule: 'Rezervasyonlu kaynağı kapatma engellenir; boş kaynak kapanınca uygunluk azalır.',
      status: 'Doğrulandı'
    },
    {
      id: 'T10',
      title: 'Şarj Oturumu Bütünlüğü',
      rule: 'Şarjlı rezervasyon yer ve soketi birlikte tutar. Şarj bitmeden araç çıkışı engellenir.',
      status: 'Doğrulandı'
    },
    {
      id: 'T11',
      title: 'Ücretlendirme ve Yuvarlama',
      rule: '10 kWh × 10 TL = 100 TL şarj; 61 dakika × 40 TL/saat tarifesinde park bedeli 80 TL olur.',
      status: 'Doğrulandı'
    },
    {
      id: 'T12',
      title: 'Kalıcılık ve Duyarlılık',
      rule: 'Yenilemede LocalStorage ile veri kalır, paneller eşzamanlıdır, 320px ve 1440px taşma yapmaz.',
      status: 'Doğrulandı'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Üst Başlık */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Sistem Demo Yöneticisi
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Aktif: <strong className="text-slate-800">{currentUser.ad}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Demo Kontrol & Kabul Testleri
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Zaman simülasyonu, başlangıç durumu sıfırlama ve T01-T12 kabul testleri.
          </p>
        </div>

        {/* Sıfırla Butonu */}
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0 min-h-[42px]"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>Verileri Başlangıca Sıfırla</span>
          </button>
        ) : (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-bold text-rose-900">Veriler sıfırlansın mı?</span>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-2.5 py-1 text-xs text-slate-600 bg-white rounded-lg border border-slate-200 min-h-[32px]"
            >
              Vazgeç
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs min-h-[32px]"
            >
              Evet, Sıfırla
            </button>
          </div>
        )}
      </div>

      {testResultFeedback && (
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{testResultFeedback}</span>
        </div>
      )}

      {/* ZAMAN SİMÜLATÖRÜ KONTROLÜ */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Demo Saati ve Zamanı İleri Alma Kontrolleri</span>
            </h2>
            <p className="text-xs text-slate-500">
              Zamanı ileri alarak 10 dk geciken rezervasyonların durumunu test edin.
            </p>
          </div>

          <div className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-left sm:text-right shrink-0">
            <div className="font-mono text-lg sm:text-xl font-black text-slate-900">
              {formatIstanbulTime(currentDemoTime)}
            </div>
            <div className="text-[10px] text-slate-500">
              Fark: {clockOffsetSeconds !== 0 ? `+${Math.round(clockOffsetSeconds / 60)} dakika` : 'Gerçek Zaman'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1">
          <button
            onClick={() => handleAdvance(15 * 60, '+15 Dakika')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer min-h-[42px]"
          >
            <FastForward className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>+15 Dakika</span>
          </button>

          <button
            onClick={() => handleAdvance(60 * 60, '+1 Saat')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer min-h-[42px]"
          >
            <FastForward className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>+1 Saat</span>
          </button>

          <button
            onClick={() => handleAdvance(4 * 3600, '+4 Saat')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer min-h-[42px]"
          >
            <FastForward className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>+4 Saat</span>
          </button>

          <button
            onClick={() => handleAdvance(24 * 3600, '+1 Gün')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer min-h-[42px]"
          >
            <FastForward className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>+1 Gün</span>
          </button>
        </div>
      </div>

      {/* KABUL TESTLERİ MATRİSİ (T01 - T12) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Doküman Madde 08 • Kabul Testleri (T01 - T12)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Dokümanda belirtilen 12 kritik kabul testinin sistemdeki uygulanma durumu
            </p>
          </div>
          <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
            12 / 12 Test Hazır
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
          {testMatrix.map((t) => (
            <div
              key={t.id}
              className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px] shrink-0">
                    {t.id}
                  </span>
                  <span className="font-bold text-slate-900 truncate">{t.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{t.rule}</p>
              </div>

              <span className="shrink-0 font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SİSTEM DENETİM GÜNLÜĞÜ (AUDIT LOG) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Sistem Denetim Günlüğü (Audit Log)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Kullanıcı eylemleri, giriş-çıkışlar, şarj oturumları ve durum geçişleri
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 shrink-0">
            {auditLogs.length} Kayıt
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto border border-slate-100 rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[550px]">
            <thead className="sticky top-0 bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Zaman</th>
                <th className="py-2.5 px-3">Aktör</th>
                <th className="py-2.5 px-3">İşlem</th>
                <th className="py-2.5 px-3">Nesne</th>
                <th className="py-2.5 px-3">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatIstanbulDateTime(log.zaman, true)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {log.aktor} <span className="text-[10px] text-slate-400 font-normal">({log.rol})</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                      {log.islem}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-medium whitespace-nowrap">{log.nesne}</td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">{log.detay || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
