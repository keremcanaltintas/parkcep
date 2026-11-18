'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatIstanbulTime } from '@/lib/calculations';
import {
  Car,
  Compass,
  CalendarCheck,
  Building2,
  Landmark,
  Sliders,
  ChevronDown,
  UserCheck,
  Clock,
  Menu,
  X,
  Zap,
  LogIn
} from 'lucide-react';

interface Props {
  onOpenTimeModal: () => void;
}

export default function Navbar({ onOpenTimeModal }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    users,
    switchUserById,
    currentDemoTime,
    clockOffsetSeconds
  } = useStore();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/kesfet', label: 'Keşfet & Harita', icon: Compass, roles: ['surucu', 'gorevli', 'belediye', 'demo_yoneticisi'] },
    { href: '/rezervasyonlarim', label: 'Rezervasyonlarım', icon: CalendarCheck, roles: ['surucu', 'demo_yoneticisi'] },
    { href: '/isletme', label: 'İşletme Paneli', icon: Building2, roles: ['gorevli', 'demo_yoneticisi'] },
    { href: '/belediye', label: 'Belediye Raporu', icon: Landmark, roles: ['belediye', 'demo_yoneticisi'] },
    { href: '/demo', label: 'Demo Kontrol', icon: Sliders, roles: ['demo_yoneticisi'] }
  ];

  const handleSelectUser = (userId: string) => {
    switchUserById(userId);
    setRoleDropdownOpen(false);
    // İlgili role göre ana ekrana yönlendir
    const selected = users.find(u => u.id === userId);
    if (selected) {
      if (selected.rol === 'gorevli') {
        router.push('/isletme');
      } else if (selected.rol === 'belediye') {
        router.push('/belediye');
      } else if (selected.rol === 'demo_yoneticisi') {
        router.push('/demo');
      } else {
        router.push('/kesfet');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400 shadow-md group-hover:scale-105 transition-transform">
                <Car className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    Park<span className="text-teal-600">Cep</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                    Akıllı Şehir
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 -mt-0.5">Rezervasyonlu Otopark Sistemi</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                const isRelevantForRole = link.roles.includes(currentUser.rol);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : isRelevantForRole
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-600'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sağ Bölüm: Saat & Rol Değiştirici */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hızlı Demo Saat Düğmesi */}
            <button
              onClick={onOpenTimeModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
              title="Demo saatini ayarla veya sıfırla"
            >
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-mono font-bold text-slate-900">
                {formatIstanbulTime(currentDemoTime)}
              </span>
              {clockOffsetSeconds !== 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>

            {/* Hızlı Rol Değiştirici Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-900 border border-teal-200 text-xs font-medium transition-all shadow-2xs cursor-pointer"
              >
                <span className="text-base leading-none">{currentUser.avatar || '👤'}</span>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-900 leading-tight flex items-center gap-1">
                    {currentUser.ad.split(' ')[0]}
                    <span className="text-[10px] text-teal-700 font-bold uppercase">
                      ({currentUser.rol === 'surucu' ? 'Sürücü' : currentUser.rol === 'gorevli' ? 'Görevli' : currentUser.rol === 'belediye' ? 'Belediye' : 'Yönetici'})
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              </button>

              {/* Rol Menüsü */}
              {roleDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setRoleDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Demo Rolünü Değiştir
                      </p>
                      <p className="text-xs text-slate-600">
                        Farklı kullanıcı gözünden sistemi test edin.
                      </p>
                    </div>

                    <div className="max-h-80 overflow-y-auto py-1">
                      {users.map((u) => {
                        const isSelected = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => handleSelectUser(u.id)}
                            className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                              isSelected ? 'bg-teal-50/70 text-teal-900 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg">{u.avatar || '👤'}</span>
                              <div>
                                <div className="font-medium text-slate-900">{u.ad}</div>
                                <div className="text-[11px] text-slate-500">
                                  {u.rol === 'surucu' && 'Sürücü Hesabı'}
                                  {u.rol === 'gorevli' && `${u.assigned_lot_id === 'merkez' ? 'Merkez' : u.assigned_lot_id === 'kampus' ? 'Kampüs' : 'Aktarma'} Görevlisi`}
                                  {u.rol === 'belediye' && 'Ulaşım Daire Bşk. (Belediye)'}
                                  {u.rol === 'demo_yoneticisi' && 'Sistem Demo Yöneticisi'}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <Link
                        href="/giris"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="text-teal-700 font-medium hover:underline inline-flex items-center gap-1"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Giriş Ekranına Git
                      </Link>
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onOpenTimeModal();
                        }}
                        className="text-slate-500 hover:text-slate-800"
                      >
                        Sıfırla
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobil Menü Butonu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobil Hamburger Açılır Menü */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-1 animate-in slide-in-from-top duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-600'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
              <span className="text-xs text-slate-500">Mevcut Rol:</span>
              <span className="text-xs font-bold text-slate-800">{currentUser.ad}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
