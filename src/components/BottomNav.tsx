'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Compass, CalendarCheck, Building2, Landmark, Sliders } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { currentUser } = useStore();

  const tabs = [
    { href: '/kesfet', label: 'Keşfet', icon: Compass },
    { href: '/rezervasyonlarim', label: 'Rezervasyon', icon: CalendarCheck },
    { href: '/isletme', label: 'İşletme', icon: Building2, badge: currentUser.rol === 'gorevli' ? 'Aktif' : undefined },
    { href: '/belediye', label: 'Belediye', icon: Landmark },
    { href: '/demo', label: 'Demo', icon: Sliders }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1 shadow-lg pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative min-h-[46px] min-w-0 ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5px] scale-105 text-teal-700' : 'text-slate-500'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-teal-600 text-[8px] font-bold text-white uppercase leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight leading-none truncate max-w-full">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-teal-600 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
