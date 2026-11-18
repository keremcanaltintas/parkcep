'use client';

import React, { useState, Suspense } from 'react';
import DemoBanner from './DemoBanner';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import MobileFrame from './MobileFrame';
import TimeSimulatorModal from './TimeSimulatorModal';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [timeModalOpen, setTimeModalOpen] = useState(false);

  return (
    <>
      <DemoBanner onOpenTimeModal={() => setTimeModalOpen(true)} />

      <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200" />}>
        <Navbar onOpenTimeModal={() => setTimeModalOpen(true)} />
      </Suspense>

      {/* Ana içerik: Mobil Çerçeve Modu açıkken telefon içinde, değilse doğrudan tam ekranda */}
      <MobileFrame>
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Yükleniyor...</div>}>
          <main className="flex-1 pb-16 sm:pb-8">
            {children}
          </main>
        </Suspense>
      </MobileFrame>

      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>

      {/* Zaman İlerletme ve Veri Sıfırlama Modalı */}
      <TimeSimulatorModal
        isOpen={timeModalOpen}
        onClose={() => setTimeModalOpen(false)}
      />
    </>
  );
}
