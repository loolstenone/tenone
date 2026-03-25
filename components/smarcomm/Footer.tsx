import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="text-lg tracking-[-0.03em]">
              <span className="font-light text-text">Smar</span>
              <span className="font-semibold text-text">Comm</span>
              <span className="font-semibold text-text">.</span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              AI 기반 올인원 마케팅 커뮤니케이션 플랫폼
            </p>
          </div>
          <div className="flex gap-6 text-xs text-text-muted">
            <Link href="/login" className="transition-colors hover:text-text-sub">로그인</Link>
            <Link href="/signup" className="transition-colors hover:text-text-sub">회원가입</Link>
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-4 text-xs text-text-muted">
          &copy; SmarComm. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors underline">Ten:One&trade; Universe</a>.
        </div>
      </div>
    </footer>
  );
}
