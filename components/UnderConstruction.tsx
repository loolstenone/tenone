import Link from 'next/link';

interface Props {
  siteName: string;
  tagline?: string;
  accentColor?: string;
}

export default function UnderConstruction({
  siteName,
  tagline,
  accentColor = '#ffd93d',
}: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f0f17] px-6 text-center">
      {/* Ten:One Universe 로고 */}
      <Link href="/" className="mb-8 text-xs font-medium tracking-widest text-white/30 uppercase hover:text-white/50 transition-colors">
        Ten:One Universe
      </Link>

      {/* 사이트 이름 */}
      <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {siteName}
      </h1>

      {tagline && (
        <p className="mb-8 text-sm text-white/40">{tagline}</p>
      )}

      {/* 작업중 뱃지 */}
      <div
        className="mb-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
        style={{
          background: `${accentColor}15`,
          border: `1px solid ${accentColor}30`,
          color: accentColor,
        }}
      >
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ background: accentColor }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ background: accentColor }}
          />
        </span>
        준비 중
      </div>

      <p className="mb-10 max-w-sm text-sm leading-relaxed text-white/35">
        현재 서비스를 개발하고 있습니다.
        <br />
        곧 만날 수 있어요.
      </p>

      <Link
        href="/"
        className="rounded-full border border-white/10 px-6 py-2.5 text-sm text-white/50 transition-all hover:border-white/20 hover:text-white/70"
      >
        Ten:One 홈으로
      </Link>
    </div>
  );
}
