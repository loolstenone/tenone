// SmarComm — Service Worker 오프라인 폴백 페이지
// public/smarcomm-sw.js 의 OFFLINE_URL = "/smarcomm/offline"

export const dynamic = 'force-static';

export default function OfflinePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
            <div className="max-w-md text-center">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">Offline</p>
                <h1 className="mb-3 text-2xl font-bold text-text">네트워크 연결이 끊겼습니다</h1>
                <p className="mb-6 text-sm text-text-sub">
                    인터넷에 다시 연결되면 자동으로 새로고침할 수 있습니다.
                    그때까지는 캐시된 일부 페이지만 열람할 수 있습니다.
                </p>
                <a
                    href="/smarcomm"
                    className="inline-block rounded-lg bg-text px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                    홈으로
                </a>
            </div>
        </main>
    );
}
