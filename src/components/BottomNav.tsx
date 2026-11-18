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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] scale-110 text-teal-700' : 'text-slate-500'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-teal-600 text-[8px] font-bold text-white uppercase">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
