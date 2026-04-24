// Planner's Planner AI — Service Worker
// 네트워크 우선 + 오프라인 캐시(AI 브리핑 이력)

const CACHE_NAME = "pp-ai-v1";
const OFFLINE_URL = "/planners/offline";

const PRECACHE_URLS = [
    "/planners/app",
    "/planners/app/today",
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
                names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
            )
        )
    );
    self.clients.claim();
});

// ── Web Push 수신 ────────────────────────────────────────────
self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "Planner's Planner AI";
    const body = data.body || "";
    const url = data.url || "/planners/app";

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: "/planners-icon-192.png",
            badge: "/planners-icon-192.png",
            tag: "pp-briefing",
            data: { url },
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "/planners/app";
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
    if (!url.pathname.startsWith("/planners/")) return;

    // AI 브리핑 이력은 cache-first 후 백그라운드 갱신
    if (url.pathname === "/api/planners/briefing" && request.method === "GET") {
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
