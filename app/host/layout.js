import { BASE } from '@/lib/utils';

export const metadata = {
  title: 'Host — YousCoin',
  manifest: BASE + '/host/host_manifest.json',
  appleWebApp: { capable: true, title: 'YousCoin Host', statusBarStyle: 'black-translucent' },
};

export default function HostLayout({ children }) {
  return children;
}
