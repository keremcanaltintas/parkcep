'use client';

import React, { useEffect, useRef } from 'react';

interface Car {
  x: number;
  y: number;
  speed: number;
  color: string;
  lane: number;
  direction: 1 | -1;
  type: 'ev' | 'car' | 'bus';
}

export default function SmartCityBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    window.addEventListener('resize', handleResize);

    // Otomobiller (3D perspektifte geçen elektrikli ve akıllı araçlar)
    const cars: Car[] = [];
    const carColors = ['#0D9488', '#06B6D4', '#38BDF8', '#F59E0B', '#10B981', '#6366F1'];

    // Şeritler (Yatay ve izometrik diagonal yollar)
    const numCars = 18;
    for (let i = 0; i < numCars; i++) {
      const lane = i % 4;
      const direction: 1 | -1 = lane % 2 === 0 ? 1 : -1;
      cars.push({
        x: Math.random() * width,
        y: height * 0.45 + lane * 32,
        speed: (1.2 + Math.random() * 1.5) * direction,
        color: carColors[Math.floor(Math.random() * carColors.length)],
        lane,
        direction,
        type: i % 3 === 0 ? 'ev' : 'car'
      });
    }

    let t = 0;

    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      // --- 3D İZOMETRİK VE DERİNLİK IZGARASI ---
      ctx.strokeStyle = 'rgba(13, 148, 136, 0.08)';
      ctx.lineWidth = 1;

      // Perspektif ufuk çizgisi ve grid
      const horizonY = height * 0.35;
      const centerX = width * 0.5;

      for (let x = -width * 0.5; x < width * 1.5; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(centerX + (x - centerX) * 0.25, horizonY);
        ctx.stroke();
      }

      for (let y = horizonY; y < height; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // --- ANA AKILLI ULAŞIM OTOYOLU ---
      const roadTop = height * 0.42;
      const roadBottom = height * 0.88;
      const roadHeight = roadBottom - roadTop;

      // Yol zemin dolgusu
      const roadGrad = ctx.createLinearGradient(0, roadTop, 0, roadBottom);
      roadGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
      roadGrad.addColorStop(1, 'rgba(30, 41, 59, 0.95)');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, roadTop, width, roadHeight);

      // Yol kenar neon şeritleri
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0D9488';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, roadTop);
      ctx.lineTo(width, roadTop);
      ctx.moveTo(0, roadBottom);
      ctx.lineTo(width, roadBottom);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Kesikli şerit çizgileri
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([14, 14]);
      for (let l = 1; l <= 3; l++) {
        const laneY = roadTop + (roadHeight / 4) * l;
        ctx.beginPath();
        ctx.moveTo(0, laneY);
        ctx.lineTo(width, laneY);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // --- AKILLI İSTASYON SİNYAL NOKTALARI (Kadıköy, Beşiktaş, Üsküdar Beacons) ---
      const stations = [
        { name: 'Merkez (Kadıköy)', x: width * 0.25, y: roadTop - 25, color: '#14B8A6' },
        { name: 'Kampüs (Beşiktaş)', x: width * 0.55, y: roadTop - 35, color: '#38BDF8' },
        { name: 'Aktarma (Üsküdar)', x: width * 0.82, y: roadTop - 20, color: '#10B981' }
      ];

      stations.forEach((st, idx) => {
        const pulse = Math.sin(t * 3 + idx) * 5 + 12;
        ctx.beginPath();
        ctx.arc(st.x, st.y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = st.color + '22';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(st.x, st.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = st.color;
        ctx.shadowColor = st.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // İstasyon anten çizgisi
        ctx.strokeStyle = st.color + '88';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(st.x, roadTop);
        ctx.stroke();
      });

      // --- HAREKET EDEN ARABALAR (CAR RENDERING WITH HEADLIGHTS & TAILLIGHTS) ---
      cars.forEach((car) => {
        car.x += car.speed;
        if (car.direction === 1 && car.x > width + 50) {
          car.x = -60;
          car.color = carColors[Math.floor(Math.random() * carColors.length)];
        } else if (car.direction === -1 && car.x < -60) {
          car.x = width + 50;
          car.color = carColors[Math.floor(Math.random() * carColors.length)];
        }

        const carY = roadTop + 18 + car.lane * 30;
        const carLen = car.type === 'ev' ? 36 : 30;
        const carWidth = 14;

        ctx.save();
        ctx.translate(car.x, carY);

        // Far ışığı konisi (Headlight beam)
        const lightLen = 50;
        const lightGrad = ctx.createRadialGradient(
          car.direction === 1 ? carLen * 0.5 : -carLen * 0.5,
          0,
          0,
          car.direction === 1 ? carLen * 0.5 + lightLen : -carLen * 0.5 - lightLen,
          0,
          lightLen
        );
        lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        lightGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        if (car.direction === 1) {
          ctx.moveTo(carLen * 0.5, -4);
          ctx.lineTo(carLen * 0.5 + lightLen, -12);
          ctx.lineTo(carLen * 0.5 + lightLen, 12);
          ctx.lineTo(carLen * 0.5, 4);
        } else {
          ctx.moveTo(-carLen * 0.5, -4);
          ctx.lineTo(-carLen * 0.5 - lightLen, -12);
          ctx.lineTo(-carLen * 0.5 - lightLen, 12);
          ctx.lineTo(-carLen * 0.5, 4);
        }
        ctx.fill();

        // Arka stop lambası izi (Taillight red glow)
        const backX = car.direction === 1 ? -carLen * 0.5 : carLen * 0.5;
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(backX - 2, -4, 3, 3);
        ctx.fillRect(backX - 2, 2, 3, 3);
        ctx.shadowBlur = 0;

        // Ön beyaz LED farlar
        const frontX = car.direction === 1 ? carLen * 0.5 - 2 : -carLen * 0.5 - 1;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(frontX, -4, 3, 2.5);
        ctx.fillRect(frontX, 2, 3, 2.5);
        ctx.shadowBlur = 0;

        // Araba gövdesi (3D metalik gölge ve hatlar)
        ctx.fillStyle = car.color;
        ctx.shadowColor = car.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(-carLen * 0.5, -carWidth * 0.5, carLen, carWidth, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Tavan camı (Cam kabin)
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.roundRect(-carLen * 0.25, -carWidth * 0.35, carLen * 0.5, carWidth * 0.7, 2);
        ctx.fill();

        // Elektrikli araç ise tavanda parlayan yeşil/turkuaz şarj göstergesi
        if (car.type === 'ev') {
          ctx.fillStyle = '#14B8A6';
          ctx.fillRect(-2, -2, 4, 4);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-90"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
