// SmarComm — Service Worker v1
// Web Push 수신 + 오프라인 캐시

const CACHE_NAME = "smarcomm-app-v1";
const OFFLINE_URL = "/smarcomm/offline";

const PRECACHE_URLS = [OFFLINE_URL];

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
    const title = data.title || "SmarComm";
    const body = data.body || "";
    const url = data.url || "/smarcomm/dashboard";

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: "/android-icon-192x192.png",
            badge: "/android-icon-192x192.png",
            tag: "smarcomm-push",
            data: { url },
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "/smarcomm/dashboard";
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
    if (!url.pathname.startsWith("/smarcomm/")) return;

    const isPrefetch =
        request.headers.get("next-router-prefetch") === "1" ||
        request.headers.get("rsc") === "1" ||
        request.headers.get("purpose") === "prefetch" ||
        url.searchParams.has("_rsc");
    if (isPrefetch) return;

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
