'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Role } from '@/types';
import { ShieldAlert, ArrowLeft, LogIn, UserCheck } from 'lucide-react';

interface Props {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: Props) {
  const { currentUser, switchUserById, users } = useStore();

  const isAllowed = allowedRoles.includes(currentUser.rol);

  if (isAllowed) {
    return <>{children}</>;
  }

  // Yetkisiz erişim durumunda bu role uygun hazır demo kullanıcısını öner
  const recommendedUser = users.find(u => allowedRoles.includes(u.rol));

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
          403 • Yetkisiz Erişim
        </span>
        <h1 className="text-2xl font-black text-slate-900">Bu Sayfaya Erişim Yetkiniz Yok</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Şu an <strong>{currentUser.ad}</strong> ({currentUser.rol}) rolü ile oturum açtınız. Bu panel yalnızca{' '}
          <strong>{allowedRoles.join(' / ')}</strong> rollerine açıktır.
        </p>
      </div>

      {recommendedUser && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 max-w-md mx-auto text-left shadow-2xs space-y-3">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Demo Hızlı Rol Değiştirici
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{recommendedUser.avatar || '👤'}</span>
              <div>
                <div className="text-xs font-bold text-slate-900">{recommendedUser.ad}</div>
                <div className="text-[11px] text-teal-700 font-medium">
                  {recommendedUser.rol === 'gorevli'
                    ? `${recommendedUser.assigned_lot_id} Görevlisi`
                    : recommendedUser.rol === 'belediye'
                    ? 'Belediye Yetkilisi'
                    : 'Sistem Yöneticisi'}
                </div>
              </div>
            </div>
            <button
              onClick={() => switchUserById(recommendedUser.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Bu Role Geç</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-2 max-w-md mx-auto">
        <Link
          href="/kesfet"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold min-h-[42px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Keşfet Sayfasına Dön</span>
        </Link>
        <Link
          href="/giris"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs min-h-[42px]"
        >
          <LogIn className="w-4 h-4" />
          <span>Farklı Hesapla Giriş</span>
        </Link>
      </div>
    </div>
  );
}
