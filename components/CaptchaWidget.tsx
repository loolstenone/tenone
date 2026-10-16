"use client";

/**
 * Cloudflare Turnstile CAPTCHA — Supabase Auth 봇 차단 (가입·로그인·비밀번호 재설정)
 *
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY 미설정 시 위젯을 그리지 않고 token 없이 통과한다.
 * → 코드 배포 후 Supabase Auth > Bot Protection 을 켜야 순서가 안전하다.
 *
 * 사용:
 *   const captcha = useCaptcha();
 *   if (!captcha.ready) { captcha.waitThenSubmit(e); return; }   // 확인 중이면 "보안 확인 중…" 표시 → 끝나는 순간 자동 제출
 *   (e가 없는 곳은 기존처럼 setError(CAPTCHA_PENDING_MESSAGE))
 *   await login(email, pw, captcha.token);
 *   captcha.reset();               // 토큰은 1회용 — 시도마다 재발급
 *   ...
 *   <CaptchaWidget {...captcha.widgetProps} />
 */
import { useCallback, useEffect, useRef, useState } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const CAPTCHA_ENABLED = !!SITE_KEY;
export const CAPTCHA_PENDING_MESSAGE = "보안 확인 중입니다. 잠시 후 다시 시도해주세요.";

interface TurnstileApi {
    render: (el: HTMLElement, opts: Record<string, unknown>) => string;
    reset: (id: string) => void;
    remove: (id: string) => void;
}

declare global {
    interface Window { turnstile?: TurnstileApi }
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
    if (window.turnstile) return Promise.resolve();
    if (!scriptPromise) {
        scriptPromise = new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = SCRIPT_SRC;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => { scriptPromise = null; reject(new Error("turnstile load failed")); };
            document.head.appendChild(s);
        });
    }
    return scriptPromise;
}

export function useCaptcha() {
    const [token, setToken] = useState<string | undefined>(undefined);
    const [resetKey, setResetKey] = useState(0);
    /** 확인 중에 누른 제출 — 토큰이 오면 다시 누른다 (그 사이 다시 그려진 최신 핸들러가 받는다) */
    const pendingRef = useRef<HTMLElement | null>(null);
    const [waiting, setWaiting] = useState(false);
    const [stalled, setStalled] = useState(false);

    const reset = useCallback(() => {
        setToken(undefined);
        setResetKey(k => k + 1);
    }, []);

    /** 제출 이벤트를 받아 두었다가 보안 확인이 끝나면 자동으로 다시 제출 */
    const waitThenSubmit = useCallback((e?: { currentTarget?: EventTarget | null; target?: EventTarget | null }) => {
        const el = (e?.currentTarget ?? e?.target) as HTMLElement | null | undefined;
        pendingRef.current = el ? (el.closest?.("form") ?? el) : null;
        setWaiting(true);
        setStalled(false);
    }, []);

    useEffect(() => {
        if (!waiting) return;
        const t = setTimeout(() => setStalled(true), 10000);
        return () => clearTimeout(t);
    }, [waiting]);

    useEffect(() => {
        if (!token || !waiting) return;
        const el = pendingRef.current;
        pendingRef.current = null;
        setWaiting(false);
        setStalled(false);
        if (el instanceof HTMLFormElement) el.requestSubmit();
        else el?.click();
    }, [token, waiting]);

    return {
        token,
        ready: !CAPTCHA_ENABLED || !!token,
        /** 확인 중에 제출을 눌러 기다리는 중 */
        waiting,
        reset,
        waitThenSubmit,
        widgetProps: { onToken: setToken, resetKey, waiting, stalled },
    };
}

/**
 * 디자인 (2026-10-16 사용자 지시 — 입력칸과 버튼 사이 캡차가 어색):
 * - 평소(자동 통과)에는 자리를 차지하지 않는다 — 화면 밖에 숨겨 렌더만
 * - 사람 확인이 필요할 때만 입력칸과 같은 폭의 카드(방패 + "보안 확인" + 안내)로 나타난다 (before-interactive-callback)
 * - 캡차는 칸 폭에 맞춰 늘린다 (size flexible) · theme은 화면 바탕에 맞춘다 (인트라 dark, 흰 로그인 창 light)
 * - 확인 중에 제출하면 도는 표시 + "끝나면 자동으로 진행" (useCaptcha.waitThenSubmit)
 */
export function CaptchaWidget({ onToken, resetKey, waiting = false, stalled = false, theme = "auto", hideStatus = false }: {
    onToken: (t: string | undefined) => void;
    resetKey: number;
    waiting?: boolean;
    stalled?: boolean;
    theme?: "light" | "dark" | "auto";
    /** 제출 버튼이 직접 "보안 확인 중…"을 보여 주면 아래 안내 줄은 숨긴다 */
    hideStatus?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const [interactive, setInteractive] = useState(false);

    useEffect(() => {
        if (!SITE_KEY) return;
        let cancelled = false;
        loadTurnstile()
            .then(() => {
                if (cancelled || !ref.current || !window.turnstile) return;
                widgetId.current = window.turnstile.render(ref.current, {
                    sitekey: SITE_KEY,
                    appearance: "interaction-only", // 의심스러울 때만 체크박스 노출
                    size: "flexible",
                    theme,
                    language: "ko",
                    callback: (t: string) => { setInteractive(false); onToken(t); },
                    "expired-callback": () => onToken(undefined),
                    "error-callback": () => onToken(undefined),
                    "before-interactive-callback": () => setInteractive(true),
                    "after-interactive-callback": () => setInteractive(false),
                });
            })
            .catch(() => onToken(undefined));
        return () => {
            cancelled = true;
            if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
            widgetId.current = null;
        };
        // resetKey 변경 시 위젯 재생성 → 새 토큰 발급
    }, [onToken, resetKey, theme]);

    if (!SITE_KEY) return null;
    // 바깥 페이지 글자색을 물려받으면 흰 창 안에서 흐려진다 (검정 사이트 위 흰 로그인 창) → 테마로 직접 정한다
    const tone = theme === "light" ? "text-neutral-700 border-neutral-200 bg-neutral-50"
        : theme === "dark" ? "text-neutral-300 border-neutral-800 bg-neutral-900/60"
        : "";
    const line = theme === "auto" ? { borderColor: "color-mix(in srgb, currentColor 15%, transparent)" } : undefined;
    return (
        <>
            {/* 위젯 자리 — 평소엔 흐름 밖(0×0)이라 틈이 생기지 않는다 */}
            <div
                className={interactive ? `rounded-xl border px-4 pt-3 pb-4 ${tone}` : "absolute w-0 h-0 overflow-hidden"}
                style={interactive ? line : undefined}
                aria-hidden={!interactive}
            >
                {interactive && (
                    <div className="flex items-center gap-2 mb-2.5 text-xs">
                        <ShieldIcon />
                        <span className="font-semibold">보안 확인</span>
                        <span className="opacity-60">사람인지 한 번만 확인할게요</span>
                    </div>
                )}
                <div ref={ref} className="w-full" />
            </div>
            {waiting && !interactive && !hideStatus && (
                <p role="status" aria-live="polite" className={`flex items-center justify-center gap-2 text-xs opacity-80 ${tone.split(" ")[0]}`}>
                    <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />
                    {stalled ? "보안 확인이 오래 걸리고 있어요. 잠시 뒤 다시 눌러 주세요." : "보안 확인 중… 끝나면 자동으로 진행합니다"}
                </p>
            )}
        </>
    );
}

function ShieldIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
