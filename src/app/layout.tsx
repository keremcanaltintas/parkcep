import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import ClientShell from '@/components/ClientShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ParkCep • Rezervasyonlu Otopark ve Şarj Sistemi Demo',
  description: 'Akıllı şehir kapsamında otopark doluluğu, rezervasyon ve şarj yönetimi Türkçe web uygulaması demosu.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
        <StoreProvider>
          <ClientShell>{children}</ClientShell>
        </StoreProvider>
      </body>
    </html>
  );
}
