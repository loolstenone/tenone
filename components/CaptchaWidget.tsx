"use client";

/**
 * Cloudflare Turnstile CAPTCHA — Supabase Auth 봇 차단 (가입·로그인·비밀번호 재설정)
 *
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY 미설정 시 위젯을 그리지 않고 token 없이 통과한다.
 * → 코드 배포 후 Supabase Auth > Bot Protection 을 켜야 순서가 안전하다.
 *
 * 사용:
 *   const captcha = useCaptcha();
 *   if (!captcha.ready) { setError(CAPTCHA_PENDING_MESSAGE); return; }
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

    const reset = useCallback(() => {
        setToken(undefined);
        setResetKey(k => k + 1);
    }, []);

    return {
        token,
        ready: !CAPTCHA_ENABLED || !!token,
        reset,
        widgetProps: { onToken: setToken, resetKey },
    };
}

export function CaptchaWidget({ onToken, resetKey }: { onToken: (t: string | undefined) => void; resetKey: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);

    useEffect(() => {
        if (!SITE_KEY) return;
        let cancelled = false;
        loadTurnstile()
            .then(() => {
                if (cancelled || !ref.current || !window.turnstile) return;
                widgetId.current = window.turnstile.render(ref.current, {
                    sitekey: SITE_KEY,
                    appearance: "interaction-only", // 의심스러울 때만 체크박스 노출
                    callback: (t: string) => onToken(t),
                    "expired-callback": () => onToken(undefined),
                    "error-callback": () => onToken(undefined),
                });
            })
            .catch(() => onToken(undefined));
        return () => {
            cancelled = true;
            if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
            widgetId.current = null;
        };
        // resetKey 변경 시 위젯 재생성 → 새 토큰 발급
    }, [onToken, resetKey]);

    if (!SITE_KEY) return null;
    return <div ref={ref} className="flex justify-center" />;
}
