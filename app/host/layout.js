import { BASE } from '@/lib/utils';

export const metadata = {
  title: 'Banca — YousCoin',
  manifest: BASE + '/host/host_manifest.json',
  appleWebApp: { capable: true, title: 'YousCoin Banca', statusBarStyle: 'black-translucent' },
};

export default function HostLayout({ children }) {
  return children;
}
