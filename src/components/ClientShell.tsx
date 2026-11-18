'use client';

import React, { useState, Suspense } from 'react';
import DemoBanner from './DemoBanner';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import TimeSimulatorModal from './TimeSimulatorModal';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [timeModalOpen, setTimeModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <DemoBanner onOpenTimeModal={() => setTimeModalOpen(true)} />

      <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200" />}>
        <Navbar onOpenTimeModal={() => setTimeModalOpen(true)} />
      </Suspense>

      {/* 100% Doğal Responsive Gövde (Telefondan 1440px+ geniş ekrana kadar duyarlı) */}
      <main className="flex-1 pb-20 sm:pb-12">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Yükleniyor...</div>}>
          {children}
        </Suspense>
      </main>

      {/* Mobil Cihazlar için Alt Navigasyon Çubuğu */}
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>

      {/* Zaman İlerletme ve Veri Sıfırlama Modalı */}
      <TimeSimulatorModal
        isOpen={timeModalOpen}
        onClose={() => setTimeModalOpen(false)}
      />
    </div>
  );
}
