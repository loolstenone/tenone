"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

interface Props {
    initialEmail: boolean;
    initialPush: boolean;
    initialPushSupported: boolean;
    initialPushPermission: NotificationPermission;
    save: (patch: Record<string, unknown>) => Promise<void>;
    showToast: (text: string, ok?: boolean) => void;
}

export function SettingsNotifications({
    initialEmail,
    initialPush,
    initialPushSupported,
    initialPushPermission,
    save,
    showToast,
}: Props) {
    const [notifyEmail, setNotifyEmail] = useState(initialEmail);
    const [notifyPush, setNotifyPush] = useState(initialPush);
    const [pushSupported] = useState(initialPushSupported);
    const [pushPermission, setPushPermission] = useState<NotificationPermission>(initialPushPermission);
    const [pushLoading, setPushLoading] = useState(false);

    async function enablePush() {
        if (!pushSupported) return;
        setPushLoading(true);
        try {
            const permission = await Notification.requestPermission();
            setPushPermission(permission);
            if (permission !== "granted") return;

            const reg = await navigator.serviceWorker.ready;
            const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublic) {
                showToast("Push 알림 서버 설정이 아직 준비되지 않았습니다. 이메일 알림을 이용해 주세요.", false);
                return;
            }

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublic) as BufferSource,
            });
            const json = sub.toJSON();
            await fetch("/api/myverse/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(json),
            });
            setNotifyPush(true);
        } finally { setPushLoading(false); }
    }

    async function disablePush() {
        setPushLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await fetch("/api/myverse/push/subscribe", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            await save({ notify_push_briefing: false });
            setNotifyPush(false);
        } finally { setPushLoading(false); }
    }

    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">알림</h2>
            <div className="space-y-3">
                {/* 이메일 */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-neutral-900">
                            이메일로도 받기{" "}
                            <span className="text-[10px] text-neutral-400 ml-1">선택</span>
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            앱 안에서 보는 게 기본. 이메일 전송이 추가로 필요하면 켜기
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setNotifyEmail(!notifyEmail);
                            save({ notify_email_briefing: !notifyEmail });
                        }}
                        className={`shrink-0 relative w-10 h-6 rounded-full transition-colors ${
                            notifyEmail ? "bg-[#6366F1]" : "bg-neutral-300 myverse-dark:bg-white/15"
                        }`}
                    >
                        <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] !bg-white rounded-full shadow-sm transition-transform ${
                            notifyEmail ? "translate-x-4" : "translate-x-0"
                        }`} />
                    </button>
                </div>

                {/* 푸시 */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div>
                        <p className="text-sm text-neutral-900">푸시 알림 받기</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            {pushSupported
                                ? pushPermission === "denied"
                                    ? "브라우저 알림 권한이 거부됨 (브라우저 설정에서 허용해 주세요)"
                                    : "이 기기에서 브리핑 완료 시 즉시 알림"
                                : "이 브라우저는 푸시 알림을 지원하지 않습니다"}
                        </p>
                    </div>
                    {pushSupported && pushPermission !== "denied" && (
                        <button
                            onClick={() => notifyPush ? disablePush() : enablePush()}
                            disabled={pushLoading}
                            className={`shrink-0 relative w-10 h-6 rounded-full transition-colors disabled:opacity-60 ${
                                notifyPush ? "bg-[#6366F1]" : "bg-neutral-300 myverse-dark:bg-white/15"
                            }`}
                        >
                            <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] !bg-white rounded-full shadow-sm transition-transform ${
                                notifyPush ? "translate-x-4" : "translate-x-0"
                            }`} />
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
