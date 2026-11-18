'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, ShieldCheck, Clock } from 'lucide-react';
import { Reservation, ParkingLot } from '@/types';
import { formatIstanbulDateTime } from '@/lib/calculations';

interface Props {
  reservation: Reservation;
  lot?: ParkingLot;
}

export default function QRCodeCard({ reservation, lot }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reservation.kod);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 text-center flex flex-col items-center max-w-sm mx-auto">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full mb-3 border border-teal-200">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Giriş Doğrulama Kodu</span>
      </div>

      {/* QR Kod Çerçevesi */}
      <div className="p-3.5 bg-white rounded-2xl border-2 border-slate-900 shadow-md inline-block">
        <QRCodeSVG
          value={`PARKCEP:${reservation.kod}:${reservation.lot_id}`}
          size={160}
          level="H"
          includeMargin={false}
        />
      </div>

      {/* Okunabilir Kod */}
      <div className="mt-4">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Rezervasyon Kodu
        </span>
        <div className="flex items-center justify-center gap-2 mt-0.5">
          <span className="font-mono text-2xl font-extrabold text-slate-900 tracking-wider">
            {reservation.kod}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Kodu Kopyala"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Otopark ve Saat Bilgisi */}
      <div className="mt-4 pt-3 border-t border-slate-100 w-full text-xs text-slate-600 space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-500">Tesis:</span>
          <span className="font-semibold text-slate-900">{lot?.ad || reservation.lot_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Başlangıç:</span>
          <span className="font-medium text-slate-800">{formatIstanbulDateTime(reservation.baslangic)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Bitiş:</span>
          <span className="font-medium text-slate-800">{formatIstanbulDateTime(reservation.bitis)}</span>
        </div>
        {reservation.plaka && (
          <div className="flex justify-between">
            <span className="text-slate-500">Plaka:</span>
            <span className="font-mono font-bold text-slate-800">{reservation.plaka}</span>
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] text-slate-600 leading-tight">
        * Görevli giriş kapısında QR kodu okutabilir veya yukarıdaki kodu manuel girerek girişinizi onaylayabilir.
      </p>
    </div>
  );
}
