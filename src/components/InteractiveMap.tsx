'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ParkingLot, LotOccupancySummary } from '@/types';
import { formatKurusToTL } from '@/lib/calculations';
import { MapPin, Navigation, ExternalLink, Zap, Layers, RefreshCw } from 'lucide-react';

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
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (leafletMapRef.current) return; // Zaten başlatıldı

      try {
        const L = (await import('leaflet')).default;

        // Leaflet default icon fix
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // İstanbul Boğazı Merkezli Koordinat (Beşiktaş, Üsküdar ve Kadıköy'ü kapsar)
        const centerLat = 41.0150;
        const centerLng = 29.0150;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 12,
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: false, // Sayfa kaydırmasını engellememek için
        });

        // OpenStreetMap CartoDB Voyager Tile Katmanı (Ultra-temiz, modern akıllı şehir teması)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        leafletMapRef.current = map;
        if (isMounted) setIsMapReady(true);
      } catch (err) {
        console.error('Leaflet OpenStreetMap başlatma hatası:', err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Marker'ları güncelleme
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !isMapReady) return;

    import('leaflet').then(({ default: L }) => {
      // Eski marker'ları temizle
      Object.values(markersRef.current).forEach((m: any) => m.remove());
      markersRef.current = {};

      lots.forEach((lot) => {
        const summary = summaries[lot.id];
        const bosYer = summary ? summary.fiziksel_bos_yer : 0;
        const isSelected = selectedLotId === lot.id;
        const priceStr = formatKurusToTL(lot.saatlik_ucret_kurus);

        // Özel HTML DivIcon
        const customHtml = `
          <div class="group cursor-pointer select-none" style="transform: translate(-50%, -100%);">
            <div style="
              background: ${isSelected ? '#0F172A' : '#FFFFFF'};
              color: ${isSelected ? '#FFFFFF' : '#0F172A'};
              border: 2px solid ${isSelected ? '#14B8A6' : '#CBD5E1'};
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
              border-radius: 14px;
              padding: 5px 9px;
              font-family: inherit;
              display: flex;
              align-items: center;
              gap: 6px;
              white-space: nowrap;
              font-size: 11px;
              font-weight: 700;
              transition: all 0.2s ease;
            ">
              <span style="
                width: 7px;
                height: 7px;
                border-radius: 9999px;
                background: ${bosYer > 0 ? '#10B981' : '#EF4444'};
                display: inline-block;
              "></span>
              <span>${lot.ad.replace('ParkCep ', '')}</span>
              <span style="
                background: ${isSelected ? '#14B8A6' : '#F1F5F9'};
                color: ${isSelected ? '#0F172A' : '#0D9488'};
                padding: 1px 5px;
                border-radius: 6px;
                font-size: 10px;
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
              border-top: 7px solid ${isSelected ? '#14B8A6' : '#FFFFFF'};
              margin: 0 auto;
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

        // Marker tıklama
        marker.on('click', () => {
          onSelectLot(lot.id);
          map.flyTo([lot.lat, lot.lng], 14, { duration: 0.8 });
        });

        // Popup içeriği
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
  }, [lots, summaries, selectedLotId, isMapReady, onSelectLot]);

  // Seçilen otopark değişince haritayı oraya odakla
  useEffect(() => {
    if (!selectedLotId || !leafletMapRef.current || !markersRef.current[selectedLotId]) return;
    const lot = lots.find(l => l.id === selectedLotId);
    if (lot) {
      leafletMapRef.current.flyTo([lot.lat, lot.lng], 14, { duration: 0.8 });
      markersRef.current[selectedLotId].openPopup();
    }
  }, [selectedLotId, lots]);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[560px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100 flex flex-col">
      {/* Harita Konteyneri */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Üst Bilgi Rozeti */}
      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 text-xs font-semibold text-slate-800">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>OpenStreetMap • Canlı İstasyon Konumları</span>
      </div>

      {/* Harita Dış Bağlantı ve Hızlı Butonlar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Navigation className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="text-[11px] font-medium hidden sm:inline">
            İstasyon pini seçtiğinizde harita otomatik odaklanır.
          </span>
          <span className="text-[11px] font-medium sm:hidden">
            Kadıköy, Beşiktaş ve Üsküdar
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedLotId && (
            <a
              href={`https://maps.google.com/?q=${lots.find(l => l.id === selectedLotId)?.lat},${lots.find(l => l.id === selectedLotId)?.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors"
            >
              <span>Dış Haritada Aç</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={() => {
              if (leafletMapRef.current) {
                leafletMapRef.current.flyTo([41.0150, 29.0150], 12);
              }
            }}
            className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="Tüm İstanbul'u göster"
          >
            Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
}
