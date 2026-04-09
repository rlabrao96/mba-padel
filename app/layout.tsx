import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, DM_Sans } from 'next/font/google';
import './globals.css';

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'Adidas MBA Padel Tournament',
  description:
    'Live results for the Adidas MBA Padel Tournament at PadelHub USA · April 11–12, 2026',
};

export const viewport: Viewport = {
  themeColor: '#05132e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${dmSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
