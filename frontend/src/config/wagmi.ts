import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Baserock',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Replace with a real project ID later
  chains: [baseSepolia],
});
