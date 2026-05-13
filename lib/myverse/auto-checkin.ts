// Myverse — 자동 체크인 훅
// 앱이 foreground일 때 일정 간격으로 위치를 폴링해 places row를 자동 생성.
// 진짜 백그라운드(앱 종료/탭 hidden)는 Service Worker만으로는 위치 접근이 안 되므로 제외 — Visibility API로 hidden 시 일시정지.
//
// 동작 요약
// 1) enabled=true 일 때 POLL_INTERVAL_MS 마다 navigator.geolocation 폴링
// 2) 마지막 좌표 대비 MOVE_THRESHOLD_M 이상 이동했을 때만 onCheckin 호출
// 3) 시간 슬롯(SLOT_MINUTES)당 최대 1회만 — 같은 슬롯에 들어가면 스킵
// 4) localStorage에 enabled / lastSlot / lastCoord 영속화 — 페이지 reload 후에도 즉시 이어감
// 5) document.visibilityState === "hidden" 동안에는 폴링 정지, visible 복귀 시 즉시 1회 폴링

import { useCallback, useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 10 * 60 * 1000;   // 10 min
const MOVE_THRESHOLD_M = 300;              // 300 m
const SLOT_MINUTES = 30;                   // 30 min 슬롯

const LS_ENABLED   = "myverse_auto_checkin_enabled";
const LS_LAST_SLOT = "myverse_auto_checkin_last_slot";
const LS_LAST_LAT  = "myverse_auto_checkin_last_lat";
const LS_LAST_LNG  = "myverse_auto_checkin_last_lng";

export interface AutoCheckinPayload {
    latitude: number;
    longitude: number;
    /** "HH:MM" 형식 — 시간 슬롯에 스냅됨 */
    timeSlot: string;
    /** ISO date — UTC 기준 오늘 */
    date: string;
}

interface AutoCheckinState {
    enabled: boolean;
    toggle: () => void;
    /** 마지막 체크인 시각 (현재 세션 기준, 페이지 reload 시 초기화) */
    lastCheckinAt: Date | null;
    /** 마지막으로 폴링을 시도한 시각 (성공 여부 무관) */
    lastPollAt: Date | null;
    /** 마지막 알려진 좌표 */
    lastCoord: { lat: number; lng: number } | null;
    /** 권한 거부 등 오류 — UI 안내용 */
    error: string | null;
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

function currentSlotKey(d = new Date()): string {
    // YYYY-MM-DDTHH:MM (SLOT 단위 floor)
    const minutes = d.getMinutes();
    const slotStart = Math.floor(minutes / SLOT_MINUTES) * SLOT_MINUTES;
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(slotStart).padStart(2, "0");
    return `${d.toISOString().slice(0, 10)}T${hh}:${mm}`;
}

function slotToTimeOfDay(slotKey: string): string {
    return slotKey.slice(11, 16); // "HH:MM"
}

function slotToDate(slotKey: string): string {
    return slotKey.slice(0, 10);
}

function readLastCoord(): { lat: number; lng: number } | null {
    try {
        const lat = Number(localStorage.getItem(LS_LAST_LAT));
        const lng = Number(localStorage.getItem(LS_LAST_LNG));
        if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
            return { lat, lng };
        }
    } catch { /* ignore */ }
    return null;
}

export function useAutoCheckin(onCheckin: (p: AutoCheckinPayload) => Promise<void> | void): AutoCheckinState {
    const [enabled, setEnabled] = useState(false);
    const [lastCheckinAt, setLastCheckinAt] = useState<Date | null>(null);
    const [lastPollAt, setLastPollAt] = useState<Date | null>(null);
    const [lastCoord, setLastCoord] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 콜백을 ref에 보관 — useEffect deps에 묶지 않아 interval 재설치 방지
    const onCheckinRef = useRef(onCheckin);
    useEffect(() => { onCheckinRef.current = onCheckin; }, [onCheckin]);

    // 마운트 시 영속 상태 복원
    useEffect(() => {
        try {
            const persisted = localStorage.getItem(LS_ENABLED);
            if (persisted === "1") setEnabled(true);
            setLastCoord(readLastCoord());
        } catch { /* ignore */ }
    }, []);

    const toggle = useCallback(() => {
        setEnabled(prev => {
            const next = !prev;
            try { localStorage.setItem(LS_ENABLED, next ? "1" : "0"); } catch { /* ignore */ }
            if (!next) setError(null);
            return next;
        });
    }, []);

    const poll = useCallback(() => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setError("이 브라우저는 위치 권한을 지원하지 않아요");
            return;
        }
        setLastPollAt(new Date());
        navigator.geolocation.getCurrentPosition(
            async pos => {
                setError(null);
                const coord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setLastCoord(coord);
                try {
                    localStorage.setItem(LS_LAST_LAT, String(coord.lat));
                    localStorage.setItem(LS_LAST_LNG, String(coord.lng));
                } catch { /* ignore */ }

                // 슬롯 dedup
                const slot = currentSlotKey();
                let lastSlot: string | null = null;
                try { lastSlot = localStorage.getItem(LS_LAST_SLOT); } catch { /* ignore */ }
                if (lastSlot === slot) return;

                // 이동 dedup — 이전 좌표와 비교 (slot은 다르더라도 같은 위치면 의미 없음)
                const prevCoord = readLastCoord();
                if (prevCoord && haversineMeters(prevCoord, coord) < MOVE_THRESHOLD_M && lastSlot) {
                    // 같은 위치이면 slot 갱신만 — 다음 이동을 기다림
                    try { localStorage.setItem(LS_LAST_SLOT, slot); } catch { /* ignore */ }
                    return;
                }

                try {
                    await onCheckinRef.current({
                        latitude: coord.lat,
                        longitude: coord.lng,
                        timeSlot: slotToTimeOfDay(slot),
                        date: slotToDate(slot),
                    });
                    try { localStorage.setItem(LS_LAST_SLOT, slot); } catch { /* ignore */ }
                    setLastCheckinAt(new Date());
                } catch {
                    /* 상위에서 toast 노출 */
                }
            },
            err => {
                if (err.code === err.PERMISSION_DENIED) setError("위치 권한이 거부됐어요 — 브라우저 설정에서 허용해 주세요");
                else if (err.code === err.POSITION_UNAVAILABLE) setError("위치 정보를 가져올 수 없어요");
                else if (err.code === err.TIMEOUT) setError("위치 요청 시간이 초과됐어요");
                else setError("위치 요청 실패");
            },
            { enableHighAccuracy: false, maximumAge: 60_000, timeout: 15_000 },
        );
    }, []);

    // enabled 변경 / mount 시 — interval + visibility 핸들러 설치
    useEffect(() => {
        if (!enabled) return;

        // 첫 폴 즉시 (visible일 때만)
        if (typeof document === "undefined" || document.visibilityState !== "hidden") {
            poll();
        }

        const id = window.setInterval(() => {
            if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
            poll();
        }, POLL_INTERVAL_MS);

        const onVis = () => {
            if (document.visibilityState === "visible") {
                // 복귀 즉시 1회 (interval 동기화는 다음 tick에 자동)
                poll();
            }
        };
        document.addEventListener("visibilitychange", onVis);

        return () => {
            window.clearInterval(id);
            document.removeEventListener("visibilitychange", onVis);
        };
    }, [enabled, poll]);

    return { enabled, toggle, lastCheckinAt, lastPollAt, lastCoord, error };
}
