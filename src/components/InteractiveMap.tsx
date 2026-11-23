'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ParkingLot, LotOccupancySummary } from '@/types';
import { formatKurusToTL } from '@/lib/calculations';
import { Navigation, ExternalLink } from 'lucide-react';

interface Props {
  lots: ParkingLot[];
  summaries: Record<string, LotOccupancySummary>;
  selectedLotId?: string;
  onSelectLot: (lotId: string) => void;
}

export default function InteractiveMap({
  lots,
  summaries,
  selectedLotId,
  onSelectLot
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [isReady, setIsReady] = useState(false);
  const [mountKey, setMountKey] = useState(0);
  const initInProgress = useRef(false);

  // Haritayı başlat — tek sefer çalışır
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;
    if (initInProgress.current) return;

    initInProgress.current = true;
    let cancelled = false;

    (async () => {
      try {
        const L = (await import('leaflet')).default;

        if (cancelled || !mapContainerRef.current) return;

        // Eğer container zaten Leaflet tarafından alınmışsa, yeni key ile remount et
        if ((mapContainerRef.current as any)._leaflet_id) {
          initInProgress.current = false;
          if (!cancelled) setMountKey(k => k + 1);
          return;
        }

        // Leaflet default icon fix
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const map = L.map(mapContainerRef.current, {
          center: [41.0150, 29.0150],
          zoom: 12,
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: false,
        });

        // OpenStreetMap tiles — ücretsiz, API anahtarı gerekmez
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
        initInProgress.current = false;
        if (!cancelled) setIsReady(true);
      } catch (err) {
        console.error('Leaflet başlatma hatası:', err);
        initInProgress.current = false;
      }
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) { /* ignore */ }
        mapInstanceRef.current = null;
      }
      markersRef.current = {};
      setIsReady(false);
      initInProgress.current = false;
    };
  }, [mountKey]);

  // Marker'ları güncelle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isReady) return;

    import('leaflet').then(({ default: L }) => {
      // Eski marker'ları temizle
      Object.values(markersRef.current).forEach((m: any) => {
        try { m.remove(); } catch (_) { /* */ }
      });
      markersRef.current = {};

      lots.forEach((lot) => {
        const summary = summaries[lot.id];
        const bosYer = summary ? summary.fiziksel_bos_yer : 0;
        const isSelected = selectedLotId === lot.id;
        const priceStr = formatKurusToTL(lot.saatlik_ucret_kurus);

        const customHtml = `
          <div style="
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
            cursor: pointer;
            user-select: none;
          ">
            <div style="
              background: ${isSelected ? '#0F172A' : '#FFFFFF'};
              color: ${isSelected ? '#FFFFFF' : '#0F172A'};
              border: 2px solid ${isSelected ? '#14B8A6' : '#CBD5E1'};
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
              border-radius: 9999px;
              padding: 6px 12px;
              font-family: inherit;
              display: flex;
              align-items: center;
              gap: 6px;
              white-space: nowrap;
              font-size: 11px;
              font-weight: 700;
            ">
              <span style="
                width: 8px;
                height: 8px;
                border-radius: 9999px;
                background: ${bosYer > 0 ? '#10B981' : '#EF4444'};
                display: inline-block;
              "></span>
              <span>${lot.ad.replace('ParkCep ', '')}</span>
              <span style="
                background: ${isSelected ? '#14B8A6' : '#F1F5F9'};
                color: ${isSelected ? '#0F172A' : '#0D9488'};
                padding: 1px 6px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 800;
              ">${priceStr}/sa</span>
              <span style="
                color: ${bosYer > 0 ? (isSelected ? '#6EE7B7' : '#059669') : '#DC2626'};
              ">${bosYer > 0 ? bosYer + ' Boş' : 'Dolu'}</span>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 7px solid ${isSelected ? '#14B8A6' : '#CBD5E1'};
            "></div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-map-pin',
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        const marker = L.marker([lot.lat, lot.lng], { icon }).addTo(map);

        marker.on('click', () => {
          onSelectLot(lot.id);
          map.flyTo([lot.lat, lot.lng], 14, { duration: 0.8 });
        });

        const popupContent = `
          <div style="font-family: inherit; padding: 4px; min-width: 180px;">
            <div style="font-size: 13px; font-weight: 800; color: #0F172A;">${lot.ad}</div>
            <div style="font-size: 11px; color: #0D9488; font-weight: 600; margin-top: 2px;">📍 ${lot.ornek_bolge}</div>
            <div style="margin-top: 6px; padding: 6px; background: #F8FAFC; border-radius: 8px; font-size: 11px;">
              <div>Ücret: <strong>${priceStr} / saat</strong></div>
              <div>Fiziksel Boş: <strong style="color: ${bosYer > 0 ? '#059669' : '#DC2626'};">${bosYer} Yer</strong></div>
              <div>Çalışma: <strong>24 Saat Açık</strong></div>
            </div>
            <div style="margin-top: 8px; display: flex; gap: 4px;">
              <a href="/rezervasyon/yeni?lot=${lot.id}" style="
                flex: 1;
                text-align: center;
                background: #0F172A;
                color: #FFFFFF;
                padding: 5px 8px;
                border-radius: 8px;
                text-decoration: none;
                font-size: 11px;
                font-weight: 700;
              ">Rezervasyon</a>
              <a href="https://maps.google.com/?q=${lot.lat},${lot.lng}" target="_blank" style="
                background: #F1F5F9;
                color: #0F172A;
                padding: 5px 8px;
                border-radius: 8px;
                text-decoration: none;
                font-size: 11px;
                font-weight: 600;
              ">Yol Tarifi</a>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);

        markersRef.current[lot.id] = marker;
      });
    });
  }, [lots, summaries, selectedLotId, isReady, onSelectLot]);

  // Seçilen otoparka odaklan
  useEffect(() => {
    if (!selectedLotId || !mapInstanceRef.current || !markersRef.current[selectedLotId]) return;
    const lot = lots.find(l => l.id === selectedLotId);
    if (lot) {
      mapInstanceRef.current.flyTo([lot.lat, lot.lng], 14, { duration: 0.8 });
      markersRef.current[selectedLotId].openPopup();
    }
  }, [selectedLotId, lots]);

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[540px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100 flex flex-col">
      {/* Harita Konteyneri — mountKey değişince DOM node yeniden oluşur */}
      <div key={mountKey} ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Üst Bilgi Rozeti */}
      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-800">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="truncate">OpenStreetMap • Canlı İstasyon Konumları</span>
      </div>

      {/* Alt Bilgi */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 z-20 bg-white/95 backdrop-blur-md px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-md flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
          <Navigation className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="text-[11px] font-medium hidden sm:inline truncate">
            İstasyon pini seçtiğinizde harita otomatik odaklanır.
          </span>
          <span className="text-[10px] font-medium sm:hidden truncate">
            Kadıköy, Beşiktaş, Üsküdar
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedLotId && (
            <a
              href={`https://maps.google.com/?q=${lots.find(l => l.id === selectedLotId)?.lat},${lots.find(l => l.id === selectedLotId)?.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200 transition-colors"
            >
              <span>Haritada Aç</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([41.0150, 29.0150], 12);
              }
            }}
            className="text-[10px] sm:text-[11px] text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="Tüm İstanbul'u göster"
          >
            Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
}
