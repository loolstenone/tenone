// 마이버스 — Service Worker v3
// v3: planners-sw(v1/v2) + myverse-sw(v2) 캐시 모두 삭제. 즉시 활성화.

const CACHE_NAME = "myverse-app-v3";
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
                names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "마이버스";
    const body = data.body || "";
    const url = data.url || "/myverse/app";

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: "/myverse-icon-192.png",
            badge: "/myverse-icon-192.png",
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

    if (!url.pathname.startsWith("/myverse/")) return;

    const isPrefetch =
        request.headers.get("next-router-prefetch") === "1" ||
        request.headers.get("rsc") === "1" ||
        request.headers.get("purpose") === "prefetch" ||
        url.searchParams.has("_rsc");
    if (isPrefetch) return;

    if (url.pathname === "/api/myverse/briefing" && request.method === "GET") {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cached = await cache.match(request);
                const fetchPromise = fetch(request)
                    .then((res) => {
                        if (res.ok) cache.put(request, res.clone());
                        return res;
                    })
                    .catch(() => cached);
                return cached || fetchPromise;
            })
        );
        return;
    }

    event.respondWith(
        fetch(request)
            .then((res) => {
                if (res.ok && request.destination === "document") {
                    const resClone = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
                }
                return res;
            })
            .catch(async () => {
                const cached = await caches.match(request);
                if (cached) return cached;
                if (request.destination === "document") {
                    return caches.match(OFFLINE_URL);
                }
                return new Response("Offline", { status: 503 });
            })
    );
});
