'use client';

import React, { useState } from 'react';
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
      <Navbar onOpenTimeModal={() => setTimeModalOpen(true)} />

      {/* Ana içerik: Mobil Çerçeve Modu açıkken telefon içinde, değilse doğrudan tam ekranda */}
      <MobileFrame>
        <main className="flex-1 pb-16 sm:pb-8">
          {children}
        </main>
      </MobileFrame>

      <BottomNav />

      {/* Zaman İlerletme ve Veri Sıfırlama Modalı */}
      <TimeSimulatorModal
        isOpen={timeModalOpen}
        onClose={() => setTimeModalOpen(false)}
      />
    </>
  );
}
