import { BASE } from '@/lib/utils';
import BankGate from '@/components/BankGate';

export const metadata = {
  title: 'Banca — YousCoin',
  manifest: BASE + '/host/host_manifest.json',
  appleWebApp: { capable: true, title: 'YousCoin Banca', statusBarStyle: 'black-translucent' },
};

export default function HostLayout({ children }) {
  return <BankGate>{children}</BankGate>;
}
