import Link from 'next/link';

interface Props {
  siteName: string;
  tagline?: string;
  accentColor?: string;
}

/**
 * 브랜드 기본 랜딩 — 아직 전용 콘텐츠가 없는 사이트의 홈페이지.
 * 정식 브랜드 소개 페이지로 표시한다 ("준비 중" 아님).
 * 사이트 차단은 SiteClosedOverlay가 전담.
 */
export default function UnderConstruction({
  siteName,
  tagline,
  accentColor = '#ffffff',
}: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0f0f17]">
      {/* 히어로 섹션 */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-[11px] font-medium tracking-widest text-white/40 uppercase">Ten:One Universe</span>
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-7xl">
          {siteName}
        </h1>

        {tagline && (
          <p className="mb-10 max-w-md text-lg leading-relaxed text-white/40">
            {tagline}
          </p>
        )}

        <div className="flex items-center gap-4">
          <a
            href="mailto:lools@tenone.biz"
            className="rounded-full px-7 py-3 text-sm font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: accentColor, color: '#0f0f17' }}
          >
            문의하기
          </a>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-7 py-3 text-sm text-white/50 transition-all hover:border-white/30 hover:text-white/70"
          >
            Universe 홈
          </Link>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="border-t border-white/5 py-6 px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <p className="text-[11px] text-white/20">
            © {new Date().getFullYear()} {siteName}. Powered by{' '}
            <Link href="/" className="text-white/30 hover:text-white/50 transition-colors">Ten:One™</Link>
          </p>
          <div className="flex items-center gap-4 text-[11px] text-white/20">
            <a href="mailto:lools@tenone.biz" className="hover:text-white/40 transition-colors">Contact</a>
            <Link href="/" className="hover:text-white/40 transition-colors">Ten:One™</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
