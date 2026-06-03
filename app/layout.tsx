import type { Metadata } from 'next';
import { Roboto_Mono, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AgroTech Digital Twin | Poultry Farm Monitor',
  description:
    'Real-time digital twin simulation dashboard for automated poultry farm monitoring — sensors, PLC machines, alarms, and fault detection.',
  keywords: ['digital twin', 'poultry farm', 'IoT', 'SCADA', 'PLC', 'monitoring', 'automation'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
