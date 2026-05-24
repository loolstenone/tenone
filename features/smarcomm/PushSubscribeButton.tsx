'use client';

// SmarComm — Web Push 구독 버튼
//
// 클라이언트가 하는 일:
//   1) 서비스 워커 (/smarcomm-sw.js) 등록
//   2) Notification 권한 요청
//   3) PushManager.subscribe(VAPID public key)
//   4) /api/smarcomm/push/subscribe 에 endpoint·keys 저장
//
// 사용: <PushSubscribeButton /> 를 대시보드·마이페이지에 배치
// 미지원 환경(iOS Safari 16 이하 등)에서는 "지원 안 됨" 라벨로 표시.

import { useEffect, useState } from 'react';
import { Bell, BellOff, AlertCircle, Check } from 'lucide-react';

type State = 'unknown' | 'unsupported' | 'denied' | 'unsubscribed' | 'subscribed' | 'busy';

export default function PushSubscribeButton({ accentColor = '#3b82f6' }: { accentColor?: string }) {
    const [state, setState] = useState<State>('unknown');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (typeof window === 'undefined') return;
            if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
                if (!cancelled) setState('unsupported');
                return;
            }
            if (Notification.permission === 'denied') {
                if (!cancelled) setState('denied');
                return;
            }
            try {
                const reg = await navigator.serviceWorker.getRegistration('/smarcomm-sw.js')
                    ?? await navigator.serviceWorker.ready;
                const sub = await reg.pushManager.getSubscription();
                if (!cancelled) setState(sub ? 'subscribed' : 'unsubscribed');
            } catch {
                if (!cancelled) setState('unsubscribed');
            }
        })();
        return () => { cancelled = true; };
    }, []);

    async function subscribe() {
        setError(null);
        setState('busy');
        try {
            const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublic) throw new Error('VAPID public key 미설정');

            const reg = await navigator.serviceWorker.register('/smarcomm-sw.js');
            await navigator.serviceWorker.ready;

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setState('denied');
                return;
            }

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublic),
            });

            const subJson = sub.toJSON();
            const res = await fetch('/api/smarcomm/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: subJson.endpoint, keys: subJson.keys }),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error ?? '구독 저장 실패');
            }
            setState('subscribed');
        } catch (e) {
            setError((e as Error).message);
            setState('unsubscribed');
        }
    }

    async function unsubscribe() {
        setError(null);
        setState('busy');
        try {
            const reg = await navigator.serviceWorker.getRegistration('/smarcomm-sw.js');
            const sub = await reg?.pushManager.getSubscription();
            if (sub) {
                await fetch('/api/smarcomm/push/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            setState('unsubscribed');
        } catch (e) {
            setError((e as Error).message);
            setState('subscribed');
        }
    }

    if (state === 'unknown') {
        return <div className="h-9 w-32 animate-pulse rounded-lg bg-surface" />;
    }

    if (state === 'unsupported') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-muted">
                <AlertCircle size={14} />
                이 브라우저는 푸시 미지원
            </span>
        );
    }

    if (state === 'denied') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
                <BellOff size={14} />
                알림 권한 차단됨 — 브라우저 설정에서 허용
            </span>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {state === 'subscribed' ? (
                <button
                    onClick={unsubscribe}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                    <Check size={14} />
                    푸시 구독 중 (해제)
                </button>
            ) : (
                <button
                    onClick={subscribe}
                    disabled={state === 'busy'}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: accentColor }}
                >
                    <Bell size={14} />
                    {state === 'busy' ? '처리 중...' : '푸시 알림 받기'}
                </button>
            )}
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const out = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
    return out;
}
