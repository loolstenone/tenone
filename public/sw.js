// Myverse — 백그라운드 GPS 체크인 Service Worker
// Background Periodic Sync API (Android Chrome 80+) 전용.
// 포그라운드 페이지가 좌표를 postMessage로 전달 → IndexedDB 저장.
// periodicsync 이벤트 시 저장된 좌표로 /api/myverse/places 호출.

const DB_NAME = "myverse-sw-db";
const STORE   = "myverse-bg-checkin";
const COORDS_KEY   = "coords";
const LAST_SLOT_KEY = "lastSlot";
const SLOT_MINUTES  = 30;
const PERIODIC_TAG  = "myverse-auto-checkin";

// ── IndexedDB 헬퍼 ──────────────────────────────────────────────────────────

function openIDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(STORE);
        };
        req.onsuccess  = (e) => resolve(e.target.result);
        req.onerror    = () => reject(req.error);
    });
}

async function idbGet(key) {
    const db = await openIDB();
    return new Promise((resolve) => {
        const tx  = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror   = () => resolve(null);
    });
}

async function idbPut(key, value) {
    const db = await openIDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror    = () => resolve();
    });
}

// ── SW 수명주기 ──────────────────────────────────────────────────────────────

self.addEventListener("install",  ()  => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// ── 포그라운드 → SW 좌표 전달 ───────────────────────────────────────────────

self.addEventListener("message", (e) => {
    if (e.data?.type === "MYVERSE_COORDS_UPDATE") {
        idbPut(COORDS_KEY, e.data.coords); // { lat, lng }
    }
});

// ── 백그라운드 주기 체크인 ────────────────────────────────────────────────────

self.addEventListener("periodicsync", (e) => {
    if (e.tag === PERIODIC_TAG) {
        e.waitUntil(doBackgroundCheckin());
    }
});

async function doBackgroundCheckin() {
    const coords = await idbGet(COORDS_KEY);
    if (!coords?.lat || !coords?.lng) return;

    const now      = new Date();
    const slotStart = Math.floor(now.getMinutes() / SLOT_MINUTES) * SLOT_MINUTES;
    const hh       = String(now.getHours()).padStart(2, "0");
    const mm       = String(slotStart).padStart(2, "0");
    const timeSlot = `${hh}:${mm}`;
    const date     = now.toISOString().slice(0, 10);
    const slotKey  = `${date}T${hh}:${mm}`;

    // 같은 슬롯 중복 방지
    const lastSlot = await idbGet(LAST_SLOT_KEY);
    if (lastSlot === slotKey) return;

    try {
        const res = await fetch("/api/myverse/places", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                date,
                place_name: "자동 기록",
                visited_at: timeSlot,
                address: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
                category: "general",
                note: "백그라운드 자동 체크인 (GPS)",
            }),
        });
        if (res.ok) await idbPut(LAST_SLOT_KEY, slotKey);
    } catch {
        // silent — 다음 sync에서 재시도
    }
}
