import { BASE } from '@/lib/utils';

export const metadata = {
  title: 'Nuovo giocatore — YousCoin',
  manifest: BASE + '/manifest.json',
};

export default function SetupLayout({ children }) {
  return children;
}
