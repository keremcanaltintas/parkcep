'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Role } from '@/types';
import {
  Car,
  LogIn,
  KeyRound,
  Mail,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function GirisPage() {
  const router = useRouter();
  const { users, currentUser, setCurrentUser, switchUserById } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setError('Bu e-posta adresiyle kayıtlı demo kullanıcısı bulunamadı.');
      return;
    }

    if (password !== user.parola_hash) {
      setError('Hatalı parola (Demo parolası: demo123).');
      return;
    }

    setCurrentUser(user);
    navigateForRole(user.rol);
  };

  const handleQuickLogin = (userId: string) => {
    switchUserById(userId);
    const user = users.find(u => u.id === userId);
    if (user) {
      navigateForRole(user.rol);
    }
  };

  const navigateForRole = (rol: Role) => {
    if (rol === 'gorevli') {
      router.push('/isletme');
    } else if (rol === 'belediye') {
      router.push('/belediye');
    } else if (rol === 'demo_yoneticisi') {
      router.push('/demo');
    } else {
      router.push('/kesfet');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Başlık */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center mx-auto shadow-md">
          <Car className="w-6 h-6 sm:w-7 sm:h-7 text-teal-400" />
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
          ParkCep Demo Oturum Yönetimi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Aşağıdaki hazır demo rollerinden birini seçerek anında oturum açabilir veya form ile giriş yapabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* SOL: 1-TIKLA HAZIR DEMO ROLLERİ */}
        <div className="md:col-span-7 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <div>
              <h2 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Tek Tıkla Demo Rolünü Seç</span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500">Müşteriye sunum yaparken hızlı rol geçişi sağlar.</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
              7 Profil
            </span>
          </div>

          <div className="space-y-2">
            {users.map((u) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u.id)}
                  className={`w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between cursor-pointer min-h-[48px] ${
                    isCurrent
                      ? 'bg-teal-50/70 border-teal-400 ring-2 ring-teal-500/20 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <span className="text-xl sm:text-2xl shrink-0">{u.avatar || '👤'}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{u.ad}</span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold text-teal-700 bg-white px-1.5 py-0.2 rounded border border-teal-200 shrink-0">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                        {u.rol === 'surucu' && 'Sürücü (Yer arar, rezerve eder)'}
                        {u.rol === 'gorevli' && `${u.assigned_lot_id === 'merkez' ? 'Merkez' : u.assigned_lot_id === 'kampus' ? 'Kampüs' : 'Aktarma'} Görevlisi`}
                        {u.rol === 'belediye' && 'Belediye Yetkilisi (Raporlar, doluluk)'}
                        {u.rol === 'demo_yoneticisi' && 'Sistem Yöneticisi (Sıfırlama, zaman)'}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </button>
              );
            })}
          </div>
        </div>

        {/* SAĞ: MANUEL GİRİŞ FORMU */}
        <div className="md:col-span-5 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-slate-700 shrink-0" />
              <span>Geleneksel Giriş Formu</span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500">Parola tüm demo hesaplarında <strong>demo123</strong>'tür.</p>
          </div>

          <form onSubmit={handleManualLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-Posta Adresi</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmet@parkcep.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[42px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parola</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo123"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden min-h-[42px]"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <LogIn className="w-3.5 h-3.5 text-teal-400" />
              <span>Oturum Aç</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Örnek Demo Hesapları:</div>
            <div>• Sürücü: <code>ahmet@parkcep.com</code></div>
            <div>• Görevli: <code>merkez.gorevli@parkcep.com</code></div>
            <div>• Belediye: <code>belediye@ulasim.gov.tr</code></div>
            <div>• Yönetici: <code>admin@parkcep.com</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
