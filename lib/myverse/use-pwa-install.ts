"use client";

// 전역 PWA 설치 헬퍼.
// - beforeinstallprompt 이벤트를 앱 어디서든 1번 캡처 (window 단일 전역에 보관)
// - 어떤 컴포넌트에서든 useState 로 동일 상태 구독
// - install() 호출 시 즉시 네이티브 설치 다이얼로그 호출 (Android/Chrome/Edge)
// - iOS Safari 등 프롬프트가 없는 환경은 canInstall=false 반환 → caller 가 fallback 선택

import { useCallback, useEffect, useState } from "react";

interface BIPEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
    interface Window {
        __myverse_bip__?: BIPEvent | null;
        __myverse_bip_listeners__?: Set<() => void>;
        __myverse_installed__?: boolean;
        __myverse_bip_inited__?: boolean;
    }
}

function notify() {
    if (typeof window === "undefined") return;
    window.__myverse_bip_listeners__?.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
}

function ensureGlobal() {
    if (typeof window === "undefined") return;
    if (window.__myverse_bip_inited__) return;
    window.__myverse_bip_inited__ = true;
    window.__myverse_bip_listeners__ = window.__myverse_bip_listeners__ || new Set();

    window.addEventListener("beforeinstallprompt", (e: Event) => {
        e.preventDefault();
        window.__myverse_bip__ = e as BIPEvent;
        notify();
    });
    window.addEventListener("appinstalled", () => {
        window.__myverse_installed__ = true;
        window.__myverse_bip__ = null;
        notify();
    });

    // 초기 standalone 감지
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches
        || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    window.__myverse_installed__ = standalone || window.__myverse_installed__;
}

export interface PwaInstallState {
    /** beforeinstallprompt 가 캡처되어 즉시 설치 가능한지 */
    canInstall: boolean;
    /** 이미 standalone (홈화면) 으로 실행 중인지 */
    isInstalled: boolean;
    /** iOS 등 OS 가 프롬프트 미지원 환경인지 (canInstall=false 이면서 isInstalled=false 일 때 true) */
    needsManual: boolean;
    /** 즉시 네이티브 설치 다이얼로그 호출. 성공/거절 outcome 반환 */
    install: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

export function usePwaInstall(): PwaInstallState {
    const [bip, setBip] = useState<BIPEvent | null>(null);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        ensureGlobal();
        const sync = () => {
            setBip(window.__myverse_bip__ ?? null);
            setInstalled(!!window.__myverse_installed__);
        };
        sync();
        window.__myverse_bip_listeners__?.add(sync);
        return () => { window.__myverse_bip_listeners__?.delete(sync); };
    }, []);

    const install = useCallback(async () => {
        if (typeof window === "undefined") return "unavailable" as const;
        const evt = window.__myverse_bip__;
        if (!evt) return "unavailable" as const;
        try {
            await evt.prompt();
            const choice = await evt.userChoice;
            // prompt 는 1회만 사용 가능 — 이후 비움
            window.__myverse_bip__ = null;
            notify();
            if (choice.outcome === "accepted") {
                window.__myverse_installed__ = true;
                notify();
            }
            return choice.outcome;
        } catch {
            return "unavailable" as const;
        }
    }, []);

    const canInstall = !!bip && !installed;
    const needsManual = !canInstall && !installed;
    return { canInstall, isInstalled: installed, needsManual, install };
}
