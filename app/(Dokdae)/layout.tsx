import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: '독대 — 열시일분',
  description: '텐원 × 열시일분 1:1 전용 채널',
  manifest: '/dokdae-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '독대',
    startupImage: [],
  },
  icons: {
    icon: '/dokdae-icon.svg',
    apple: '/dokdae-icon-192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#101018',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function DokdaeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#101018] text-white">
      {children}
    </div>
  );
}
