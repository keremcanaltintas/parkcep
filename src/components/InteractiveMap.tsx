'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ParkingLot, LotOccupancySummary } from '@/types';
import { formatKurusToTL } from '@/lib/calculations';
import { Navigation, ExternalLink, RefreshCw } from 'lucide-react';

interface Props {
  lots: ParkingLot[];
  summaries: Record<string, LotOccupancySummary>;
  selectedLotId?: string;
  onSelectLot: (lotId: string) => void;
}

// Otoparklara özel şarj/özellik özet bilgisi
const LOT_SPECS: Record<string, { chargerInfo?: string; highlight: string }> = {
  merkez: {
    chargerInfo: '⚡ 120 kW Ultra DC (CCS2)',
    highlight: 'Rıhtım & Vapur İskelesi Yakını'
  },
  kampus: {
    chargerInfo: '🔌 22 kW AC Hızlı Şarj (Type 2)',
    highlight: 'Beşiktaş Meydan & Üniversiteler'
  },
  aktarma: {
    chargerInfo: '⚡ 60 kW DC Hızlı Şarj (CCS2)',
    highlight: 'Marmaray & Metro Entegre'
  },
  sisli: {
    chargerInfo: '⚡ 150 kW Ultra DC (CCS2)',
    highlight: 'Mecidiyeköy & Metrobüs Bağlantılı'
  },
  atasehir: {
    chargerInfo: '⚡ 180 kW Ultra DC + 22 kW AC',
    highlight: 'İstanbul Finans Merkezi'
  },
  bakirkoy: {
    chargerInfo: '⚡ 90 kW DC Hızlı Şarj (CCS2)',
    highlight: 'Sahil Yolu & Özgürlük Meydanı'
  },
  beyoglu: {
    chargerInfo: '🔌 22 kW AC (Type 2)',
    highlight: 'Taksim & İstiklal Caddesi Yakını'
  }
};

export default function InteractiveMap({
  lots,
  summaries,
  selectedLotId,
  onSelectLot
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const onSelectLotRef = useRef(onSelectLot);
  const lastFocusedLotIdRef = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // onSelectLot callback'ini ref'te sakla ki useEffect tetiklenmesin
  useEffect(() => {
    onSelectLotRef.current = onSelectLot;
  }, [onSelectLot]);

  // Leaflet HTML İkon Oluşturucu
  const createMarkerHtml = (
    lot: ParkingLot,
    bosYer: number,
    isSelected: boolean
  ) => {
    const priceStr = formatKurusToTL(lot.saatlik_ucret_kurus);
    const hasCharger = !!LOT_SPECS[lot.id]?.chargerInfo;
    const shortName = lot.ad.replace('ParkCep ', '');

    return `
      <div style="
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%) ${isSelected ? 'scale(1.08)' : 'scale(1)'};
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        cursor: pointer;
        user-select: none;
        z-index: ${isSelected ? 1000 : 100};
      ">
        <div style="
          background: ${isSelected ? '#0F172A' : '#FFFFFF'};
          color: ${isSelected ? '#FFFFFF' : '#0F172A'};
          border: 2px solid ${isSelected ? '#14B8A6' : '#E2E8F0'};
          box-shadow: ${
            isSelected
              ? '0 12px 28px -4px rgba(20, 184, 166, 0.45), 0 6px 12px -2px rgba(15, 23, 42, 0.25)'
              : '0 8px 20px -3px rgba(15, 23, 42, 0.15)'
          };
          border-radius: 9999px;
          padding: 5px 10px;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
            box-shadow: 0 0 0 2px ${bosYer > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'};
            display: inline-block;
            flex-shrink: 0;
          "></span>
          <span>${shortName}</span>
          ${
            hasCharger
              ? `<span style="
                  color: #0D9488;
                  font-size: 10px;
                  background: ${isSelected ? 'rgba(20, 184, 166, 0.2)' : '#F0FDFA'};
                  padding: 1px 4px;
                  border-radius: 4px;
                  font-weight: 800;
                ">⚡</span>`
              : ''
          }
          <span style="
            background: ${isSelected ? '#14B8A6' : '#F1F5F9'};
            color: ${isSelected ? '#042F2E' : '#0D9488'};
            padding: 1px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 800;
          ">${priceStr}/sa</span>
          <span style="
            color: ${bosYer > 0 ? (isSelected ? '#6EE7B7' : '#059669') : '#DC2626'};
            font-weight: 700;
          ">${bosYer > 0 ? bosYer + ' Boş' : 'Dolu'}</span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid ${isSelected ? '#14B8A6' : '#CBD5E1'};
          margin-top: -1px;
        "></div>
      </div>
    `;
  };

  // Leaflet Popup HTML İçeriği
  const createPopupHtml = (
    lot: ParkingLot,
    summary: LotOccupancySummary | undefined
  ) => {
    const priceStr = formatKurusToTL(lot.saatlik_ucret_kurus);
    const bosYer = summary ? summary.fiziksel_bos_yer : 0;
    const standartBos = summary ? summary.standart_bos : 0;
    const erisilebilirBos = summary ? summary.erisilebilir_bos : 0;
    const sarjliBos = summary ? summary.sarjli_bos : 0;
    const spec = LOT_SPECS[lot.id];

    return `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; padding: 4px; min-width: 220px; max-width: 260px;">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
          <div>
            <div style="font-size: 13px; font-weight: 800; color: #0F172A; line-height: 1.25;">${lot.ad}</div>
            <div style="font-size: 11px; color: #0D9488; font-weight: 600; margin-top: 2px;">📍 ${lot.ornek_bolge}</div>
          </div>
          <span style="
            background: #F0FDFA;
            color: #0F766E;
            border: 1px solid #CCFBF1;
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
          ">${priceStr}/sa</span>
        </div>

        ${
          spec?.highlight
            ? `<div style="font-size: 10px; color: #64748B; margin-top: 4px; font-style: italic;">
                ${spec.highlight}
              </div>`
            : ''
        }

        <div style="margin-top: 8px; padding: 7px 9px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="color: #64748B;">Fiziksel Boşluk:</span>
            <strong style="color: ${bosYer > 0 ? '#059669' : '#DC2626'};">${bosYer} Yer Boş</strong>
          </div>
          <div style="display: flex; gap: 4px; font-size: 10px; color: #475569; margin-top: 4px; flex-wrap: wrap;">
            <span style="background: #FFFFFF; padding: 1px 5px; border-radius: 4px; border: 1px solid #E2E8F0;">Standart: ${standartBos}</span>
            <span style="background: #EFF6FF; color: #1D4ED8; padding: 1px 5px; border-radius: 4px; border: 1px solid #DBEAFE;">Engelli: ${erisilebilirBos}</span>
            <span style="background: #F0FDF4; color: #15803D; padding: 1px 5px; border-radius: 4px; border: 1px solid #DCFCE7;">Şarj: ${sarjliBos}</span>
          </div>
          ${
            spec?.chargerInfo
              ? `<div style="margin-top: 5px; padding-top: 4px; border-top: 1px dashed #CBD5E1; font-size: 10px; font-weight: 700; color: #0D9488;">
                  ${spec.chargerInfo}
                </div>`
              : ''
          }
        </div>

        <div style="margin-top: 9px; display: flex; gap: 5px;">
          <a href="/rezervasyon/yeni?lot=${lot.id}" style="
            flex: 1;
            text-align: center;
            background: #0F172A;
            color: #FFFFFF;
            padding: 6px 10px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 11px;
            font-weight: 700;
            display: inline-block;
          ">Hemen Ayır</a>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${lot.lat},${lot.lng}" target="_blank" rel="noopener noreferrer" style="
            background: #F1F5F9;
            color: #1E293B;
            padding: 6px 10px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 11px;
            font-weight: 600;
            display: inline-block;
          ">Yol Tarifi</a>
        </div>
      </div>
    `;
  };

  // 1. Haritayı başlat (Mount anında tek sefer)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = mapContainerRef.current;
    if (!container) return;

    let cancelled = false;

    (async () => {
      try {
        const L = (await import('leaflet')).default;
        if (cancelled || !mapContainerRef.current) return;

        // Container zaten bir Leaflet instance'ına bağlıysa temizle
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (_) { /* noop */ }
          mapInstanceRef.current = null;
        }

        if ((container as any)._leaflet_id) {
          delete (container as any)._leaflet_id;
        }

        // Leaflet varsayılan marker görselleri
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
        });

        const map = L.map(container, {
          center: [41.0180, 29.0150],
          zoom: 12,
          zoomControl: false, // Kontrolü sağ alta alacağız
          attributionControl: true,
          scrollWheelZoom: false
        });

        // Sağ alt köşeye zoom kontrolü ekle (mobil üst/alt barlarla çakışmasın)
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Standart OpenStreetMap katmanı — Ücretsiz, API Key istemez, filigransızdır
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;

        if (!cancelled) {
          setIsReady(true);
        }
      } catch (err) {
        console.error('Leaflet harita başlatılamadı:', err);
      }
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) { /* noop */ }
        mapInstanceRef.current = null;
      }
      markersRef.current.clear();
      setIsReady(false);
    };
  }, []);

  // 2. Boyut Değişimlerini İzle (Sekme geçişinde veya mobil ekranda harita bozulmasın)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapContainerRef.current) return;
    const map = mapInstanceRef.current;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(mapContainerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [isReady]);

  // 3. Marker Yönetimi:
  // Marker'lar YALNIZCA `lots` listesi değiştiğinde yaratılır veya silinir.
  // Her saniye `summaries` veya `selectedLotId` değiştiğinde marker'lar SİLİNMEZ!
  // Yalnızca icon HTML'i ve popup içeriği güncellenir. Bu sayede harita ASLA sallanmaz/titremez.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isReady) return;

    import('leaflet').then(({ default: L }) => {
      const currentLotsMap = new Map(lots.map(l => [l.id, l]));

      // Artık listede olmayan marker'ları kaldır
      markersRef.current.forEach((marker, lotId) => {
        if (!currentLotsMap.has(lotId)) {
          marker.remove();
          markersRef.current.delete(lotId);
        }
      });

      // Her otopark için marker oluştur veya güncelle
      lots.forEach((lot) => {
        const summary = summaries[lot.id];
        const bosYer = summary ? summary.fiziksel_bos_yer : 0;
        const isSelected = selectedLotId === lot.id;

        const iconHtml = createMarkerHtml(lot, bosYer, isSelected);
        const icon = L.divIcon({
          html: iconHtml,
          className: `custom-map-pin lot-pin-${lot.id}`,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        const popupHtml = createPopupHtml(lot, summary);

        let marker = markersRef.current.get(lot.id);

        if (!marker) {
          // İlk kez oluştur
          marker = L.marker([lot.lat, lot.lng], { icon, riseOnHover: true }).addTo(map);

          marker.bindPopup(popupHtml, {
            offset: [0, -32],
            closeButton: true,
            autoPan: true,
            autoPanPadding: [30, 30]
          });

          // Tıklamada sadece üst bileşene bildir; flyTo'yu selectedLotId efekti yönetecek
          marker.on('click', () => {
            onSelectLotRef.current(lot.id);
          });

          markersRef.current.set(lot.id, marker);
        } else {
          // Var olan marker'ın ikonunu ve popup içeriğini sessizce güncelle (DOM yeniden çizilmez)
          marker.setIcon(icon);
          marker.setPopupContent(popupHtml);
        }
      });
    });
  }, [lots, summaries, selectedLotId, isReady]);

  // 4. Kamera Odaklanma & Animasyon (Titremeyi önlemek için mükerrer flyTo engellenir)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isReady) return;

    if (!selectedLotId) {
      lastFocusedLotIdRef.current = null;
      map.closePopup();
      return;
    }

    // Aynı otopark zaten odaklanmışsa tekrar flyTo yapma! (Titremenin kök nedeni buydu)
    if (lastFocusedLotIdRef.current === selectedLotId) return;

    const targetLot = lots.find(l => l.id === selectedLotId);
    const targetMarker = markersRef.current.get(selectedLotId);

    if (targetLot && targetMarker) {
      lastFocusedLotIdRef.current = selectedLotId;

      // Harita merkezini yumuşak şekilde otoparka kaydır
      map.flyTo([targetLot.lat, targetLot.lng], 14, {
        duration: 0.7,
        easeLinearity: 0.25
      });

      // Animasyon başlayınca popup'ı aç
      targetMarker.openPopup();
    }
  }, [selectedLotId, lots, isReady]);

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[540px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100 flex flex-col">
      {/* Harita DOM Konteyneri */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Üst Bilgi Rozeti */}
      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-slate-800">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="truncate">OpenStreetMap • Canlı İstasyon Konumları ({lots.length} Tesis)</span>
      </div>

      {/* Alt Bilgi & Hızlı Kontroller */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 z-20 bg-white/95 backdrop-blur-md px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-md flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
          <Navigation className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="text-[11px] font-medium hidden sm:inline truncate">
            {selectedLotId
              ? `${lots.find(l => l.id === selectedLotId)?.ad} seçildi`
              : 'Haritada bir istasyona tıklayarak detayları inceleyebilirsiniz.'}
          </span>
          <span className="text-[10px] font-medium sm:hidden truncate">
            {selectedLotId
              ? `${lots.find(l => l.id === selectedLotId)?.ad}`
              : 'Kadıköy, Beşiktaş, Şişli, Bakırköy...'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedLotId && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lots.find(l => l.id === selectedLotId)?.lat},${lots.find(l => l.id === selectedLotId)?.lng}`}
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
                lastFocusedLotIdRef.current = null;
                onSelectLotRef.current('');
                mapInstanceRef.current.flyTo([41.0180, 29.0150], 12, { duration: 0.6 });
              }
            }}
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="Tüm İstanbul'u göster ve seçimi sıfırla"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sıfırla</span>
          </button>
        </div>
      </div>
    </div>
  );
}