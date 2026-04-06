export default function UnsubscribeDonePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 inline-block bg-black text-white text-xs font-bold tracking-widest px-3 py-1.5">
        TEN:ONE™
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-3">수신거부 완료</h1>
      <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
        뉴스레터 수신이 해지되었습니다.<br/>
        언제든지 다시 구독하실 수 있습니다.
      </p>
      <a href="/"
        className="mt-8 inline-block bg-black text-white text-sm font-medium px-6 py-3 hover:bg-neutral-800 transition-colors">
        홈으로 →
      </a>
    </div>
  );
}
