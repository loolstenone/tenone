// 마이버스 — Service Worker
// 네트워크 우선 + 오프라인 캐시(AI 브리핑 이력)
//
// v2: /planners/* 경로를 /myverse/*로 전환. 이전 캐시 강제 삭제 + 즉시 활성화로
// 사용자 브라우저가 다음 방문 시 무한 prefetch 루프(308 cascade)에서 빠져나오게 한다.

const CACHE_NAME = "myverse-app-v2";
const OFFLINE_URL = "/myverse/offline";

const PRECACHE_URLS = [
    "/myverse/app",
    "/myverse/app/today",
    OFFLINE_URL,
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            cache.addAll(PRECACHE_URLS).catch(() => {})
        )
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(
                // 모든 옛 캐시(pp-ai-v1, myverse-app-v1 등)를 삭제. 현재 버전만 유지.
                names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
            )
        ).then(() => self.clients.claim())
    );
});

// ── Web Push 수신 ────────────────────────────────────────────
self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "마이버스";
    const body = data.body || "";
    const url = data.url || "/myverse/app";

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: "/planners-icon-192.png",
            badge: "/planners-icon-192.png",
            tag: "myverse-briefing",
            data: { url },
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "/myverse/app";
    event.waitUntil(
        self.clients.matchAll({ type: "window" }).then((clients) => {
            for (const client of clients) {
                if (client.url.includes(url) && "focus" in client) return client.focus();
            }
            if (self.clients.openWindow) return self.clients.openWindow(url);
        })
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // 경로가 /myverse/*가 아니면 SW가 손대지 않는다.
    // 기존 /planners/* 캐싱 로직은 제거 — middleware 308 redirect 응답을
    // SW가 캐시하면 무한 prefetch chain의 원인이 된다.
    if (!url.pathname.startsWith("/myverse/")) return;

    // RSC prefetch 요청은 SW가 처리하지 않는다 (router cache가 직접 관리).
    // SW가 prefetch 응답을 캐시하면 stale entry로 무한 retry 큐에 박힐 수 있다.
    const isPrefetch = request.headers.get("next-router-prefetch") === "1"
        || request.headers.get("rsc") === "1"
        || request.headers.get("purpose") === "prefetch"
        || url.searchParams.has("_rsc");
    if (isPrefetch) return;

    // AI 브리핑 이력은 cache-first 후 백그라운드 갱신
    if (url.pathname === "/api/myverse/briefing" && request.method === "GET") {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cached = await cache.match(request);
                const fetchPromise = fetch(request).then((res) => {
                    if (res.ok) cache.put(request, res.clone());
                    return res;
                }).catch(() => cached);
                return cached || fetchPromise;
            })
        );
        return;
    }

    // 페이지는 network-first, 실패 시 캐시/오프라인
    event.respondWith(
        fetch(request).then((res) => {
            if (res.ok && request.destination === "document") {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
            }
            return res;
        }).catch(async () => {
            const cached = await caches.match(request);
            if (cached) return cached;
            if (request.destination === "document") {
                return caches.match(OFFLINE_URL);
            }
            return new Response("Offline", { status: 503 });
        })
    );
});
