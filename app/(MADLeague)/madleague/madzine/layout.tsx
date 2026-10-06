import { Playfair_Display, Noto_Serif_KR } from 'next/font/google';

// MADzine 전용 에디토리얼 서체 — 이 경로 안에서만 로드 (사이트 다른 화면 영향 없음)
const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-mz-display',
  display: 'swap',
});

const serifKr = Noto_Serif_KR({
  weight: ['400', '700', '900'],
  variable: '--font-mz-serif',
  display: 'swap',
  preload: false,
});

export default function MadzineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${serifKr.variable} bg-black text-neutral-100`}>
      {children}
    </div>
  );
}
