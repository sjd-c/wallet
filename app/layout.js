import { Nunito } from 'next/font/google';
import '@tabler/icons-webfont/dist/tabler-icons.min.css';
import './globals.css';
import { BASE } from '@/lib/utils';

const nunito = Nunito({ subsets: ['latin'], weight: ['400', '700', '800', '900'], variable: '--font-nunito' });

export const metadata = {
  title: 'YousCoin',
  manifest: BASE + '/manifest.json',
  appleWebApp: { capable: true, title: 'YousCoin' },
  icons: { apple: BASE + '/icons/icon-192.png' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  themeColor: '#1D9E75',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={nunito.variable}>
      <body>{children}</body>
    </html>
  );
}
