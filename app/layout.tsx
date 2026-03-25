import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";

import { SiteProvider } from "@/lib/site-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ten:One™ — Value Connector | 가치로 연결된 브랜드 유니버스",
    template: "%s | Ten:One™",
  },
  description: "Ten:One™ Universe는 기업과 사회의 문제를 해결하는 다양한 프로젝트를 기획·운영하는 멀티 브랜드 생태계입니다. LUKI, MAD League, RooK, Badak 등 19개 브랜드를 운영합니다.",
  keywords: ["Ten:One", "텐원", "멀티브랜드", "마케팅", "광고", "AI", "크리에이티브", "MAD League", "LUKI", "RooK", "Badak"],
  authors: [{ name: "Cheonil Jeon", url: "https://tenone.biz" }],
  creator: "Ten:One™",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://tenone.biz",
    siteName: "Ten:One™",
    title: "Ten:One™ — Value Connector",
    description: "가치로 연결된 거대한 세계관을 만들기로 했다. 기업과 사회의 문제를 해결하는 다양한 프로젝트.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ten:One™ — Value Connector",
    description: "가치로 연결된 거대한 세계관을 만들기로 했다.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon-180x180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Ten:One™",
              alternateName: "텐원",
              url: "https://tenone.biz",
              logo: "https://tenone.biz/icon.png",
              description: "기업과 사회의 문제를 해결하는 다양한 프로젝트를 기획·운영하는 멀티 브랜드 생태계",
              founder: {
                "@type": "Person",
                name: "Cheonil Jeon",
                alternateName: "전천일",
                jobTitle: "Founder / Value Connector",
              },
              sameAs: [],
              knowsAbout: ["마케팅", "광고", "AI", "크리에이티브", "브랜딩", "교육"],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <SiteProvider>
          <AuthProvider>
              {children}
          </AuthProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
