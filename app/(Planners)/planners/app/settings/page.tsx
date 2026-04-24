"use client";

import { useEffect, useState } from "react";
import { Settings, Loader2, Check, ExternalLink, Link as LinkIcon, Unplug, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import type { PlannerMode, AiTone } from "@/lib/planners/types";

interface Integration {
    id: string;
    provider: string;
    status: string;
    external_email: string | null;
    external_name: string | null;
    last_sync_at: string | null;
}

function IntegrationRow({
    name,
    desc,
    integration,
    connectHref,
    onConnectClick,
    onSync,
    onDisconnect,
    syncing,
}: {
    name: string;
    desc: string;
    integration: Integration | undefined;
    connectHref: string;
    onConnectClick?: () => void;
    onSync: () => void;
    onDisconnect: () => void;
    syncing: boolean;
}) {
    const connected = !!integration;
    return (
        <div className="flex items-center justify-between py-1">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-neutral-900 font-medium">{name}</p>
                    {connected && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#0F766E]/10 text-[#0F766E] rounded">
                            연결됨
                        </span>
                    )}
                </div>
                {connected && integration?.external_email ? (
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {integration.external_email}
                        {integration.last_sync_at && (
                            <span className="text-neutral-400 ml-2">
                                · 최근 동기화 {new Date(integration.last_sync_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </p>
                ) : (
                    <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                )}
            </div>
            <div className="flex items-center gap-2">
                {connected ? (
                    <>
                        <button
                            onClick={onSync}
                            disabled={syncing}
                            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-xs hover:bg-neutral-200 transition-colors disabled:opacity-50"
                        >
                            {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                            동기화
                        </button>
                        <button
                            onClick={onDisconnect}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-200 text-neutral-500 rounded-lg text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                            <Unplug className="h-3 w-3" /> 해제
                        </button>
                    </>
                ) : onConnectClick ? (
                    <button
                        onClick={onConnectClick}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs hover:bg-[#0d5e56] transition-colors"
                    >
                        <LinkIcon className="h-3 w-3" /> 연결
                    </button>
                ) : (
                    <a
                        href={connectHref}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs hover:bg-[#0d5e56] transition-colors"
                    >
                        <LinkIcon className="h-3 w-3" /> 연결
                    </a>
                )}
            </div>
        </div>
    );
}

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

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState<PlannerMode>("weekly");
    const [morning, setMorning] = useState("08:00");
    const [evening, setEvening] = useState("21:00");
    const [tone, setTone] = useState<AiTone>("friendly");
    const [sub, setSub] = useState<{ status: string; expires: string | null; is_pdf_buyer: boolean }>({ status: 'free', expires: null, is_pdf_buyer: false });
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifyPush, setNotifyPush] = useState(false);
    const [pushSupported, setPushSupported] = useState(false);
    const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [todoistModal, setTodoistModal] = useState(false);
    const [todoistToken, setTodoistToken] = useState("");
    const [todoistSubmit, setTodoistSubmit] = useState(false);
    const [notionModal, setNotionModal] = useState(false);
    const [notionToken, setNotionToken] = useState("");
    const [notionSubmit, setNotionSubmit] = useState(false);
    const [slackModal, setSlackModal] = useState(false);
    const [slackWebhook, setSlackWebhook] = useState("");
    const [slackSubmit, setSlackSubmit] = useState(false);
    const [icalModal, setIcalModal] = useState(false);
    const [icalUrl, setIcalUrl] = useState("");
    const [icalSubmit, setIcalSubmit] = useState(false);
    const [contextScope, setContextScope] = useState<string[]>(["identity", "weekly", "monthly", "projects"]);
    const [sampleLoading, setSampleLoading] = useState(false);
    const [sampleText, setSampleText] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/planners/settings`);
            if (res.ok) {
                const d = await res.json();
                if (d.user) {
                    setMode(d.user.mode);
                    setMorning(d.user.ai_morning_time?.slice(0, 5) || "08:00");
                    setEvening(d.user.ai_evening_time?.slice(0, 5) || "21:00");
                    setTone(d.user.ai_tone);
                    setNotifyEmail(d.user.notify_email_briefing !== false);
                    setNotifyPush(!!d.user.notify_push_briefing);
                    if (d.user.ai_context_scope?.length) setContextScope(d.user.ai_context_scope);
                    setSub({
                        status: d.user.subscription_status || 'free',
                        expires: d.user.subscription_expires_at || null,
                        is_pdf_buyer: !!d.user.is_pdf_buyer,
                    });
                }
            }
            // Push 지원 여부 확인
            if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
                setPushSupported(true);
                setPushPermission(Notification.permission);
            }
            // 연동 상태 로드
            const iRes = await fetch(`/api/planners/integrations`);
            if (iRes.ok) {
                const id = await iRes.json();
                setIntegrations(id.integrations || []);
            }
            // URL 쿼리 메시지
            if (typeof window !== "undefined") {
                const q = new URLSearchParams(window.location.search);
                if (q.get("google") === "connected") alert("Google Calendar 연결 완료");
                if (q.get("google_error")) alert(`Google 연결 실패: ${q.get("google_error")}`);
            }
            setLoading(false);
        })();
    }, []);

    async function syncGoogle() {
        setSyncing("google_calendar");
        try {
            const res = await fetch(`/api/planners/integrations/google/sync`, { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                alert(`${d.synced}개 이벤트 동기화 완료`);
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) {
                    const id = await iRes.json();
                    setIntegrations(id.integrations || []);
                }
            } else {
                const d = await res.json();
                alert(`동기화 실패: ${d.error}`);
            }
        } finally { setSyncing(null); }
    }

    async function syncTodoist() {
        setSyncing("todoist");
        try {
            const res = await fetch(`/api/planners/integrations/todoist/sync`, { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                alert(`${d.imported}개 태스크 import 완료`);
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) {
                    const id = await iRes.json();
                    setIntegrations(id.integrations || []);
                }
            } else {
                const d = await res.json();
                alert(`실패: ${d.error}`);
            }
        } finally { setSyncing(null); }
    }

    async function connectTodoist() {
        if (!todoistToken.trim()) return;
        setTodoistSubmit(true);
        try {
            const res = await fetch(`/api/planners/integrations/todoist/connect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: todoistToken.trim() }),
            });
            if (res.ok) {
                setTodoistModal(false);
                setTodoistToken("");
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) {
                    const id = await iRes.json();
                    setIntegrations(id.integrations || []);
                }
            } else {
                const d = await res.json();
                alert(`연결 실패: ${d.error}`);
            }
        } finally { setTodoistSubmit(false); }
    }

    async function syncNotion() {
        setSyncing("notion");
        try {
            const res = await fetch(`/api/planners/integrations/notion/sync`, { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                alert(`${d.imported}개 태스크 import 완료`);
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) setIntegrations((await iRes.json()).integrations || []);
            } else {
                const d = await res.json();
                alert(`실패: ${d.error}`);
            }
        } finally { setSyncing(null); }
    }

    async function connectNotion() {
        if (!notionToken.trim()) return;
        setNotionSubmit(true);
        try {
            const res = await fetch(`/api/planners/integrations/notion/connect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: notionToken.trim() }),
            });
            if (res.ok) {
                setNotionModal(false);
                setNotionToken("");
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) setIntegrations((await iRes.json()).integrations || []);
            } else {
                const d = await res.json();
                alert(`연결 실패: ${d.error}`);
            }
        } finally { setNotionSubmit(false); }
    }

    async function syncSlack() {
        setSyncing("slack");
        try {
            const res = await fetch(`/api/planners/integrations/slack/sync`, { method: "POST" });
            if (res.ok) {
                alert("Slack으로 브리핑 전송 완료");
            } else {
                const d = await res.json();
                alert(`실패: ${d.error}`);
            }
        } finally { setSyncing(null); }
    }

    async function connectSlack() {
        if (!slackWebhook.trim()) return;
        setSlackSubmit(true);
        try {
            const res = await fetch(`/api/planners/integrations/slack/connect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ webhook_url: slackWebhook.trim() }),
            });
            if (res.ok) {
                setSlackModal(false);
                setSlackWebhook("");
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) setIntegrations((await iRes.json()).integrations || []);
            } else {
                const d = await res.json();
                alert(`연결 실패: ${d.error}`);
            }
        } finally { setSlackSubmit(false); }
    }

    async function syncIcal() {
        setSyncing("ical");
        try {
            const res = await fetch(`/api/planners/integrations/ical/sync`, { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                alert(`${d.synced}개 이벤트 동기화 완료`);
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) setIntegrations((await iRes.json()).integrations || []);
            } else {
                const d = await res.json();
                alert(`실패: ${d.error}`);
            }
        } finally { setSyncing(null); }
    }

    async function connectIcal() {
        if (!icalUrl.trim()) return;
        setIcalSubmit(true);
        try {
            const res = await fetch(`/api/planners/integrations/ical/connect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feed_url: icalUrl.trim() }),
            });
            if (res.ok) {
                const d = await res.json();
                setIcalModal(false);
                setIcalUrl("");
                alert(`연결 완료. ${d.eventCount ?? 0}개 이벤트 확인됨`);
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) setIntegrations((await iRes.json()).integrations || []);
            } else {
                const d = await res.json();
                alert(`연결 실패: ${d.error}`);
            }
        } finally { setIcalSubmit(false); }
    }

    async function disconnectIntegration(provider: string) {
        if (!confirm(`${provider} 연결을 해제할까요? 캐시된 이벤트도 삭제됩니다.`)) return;
        setSaving(true);
        try {
            await fetch(`/api/planners/integrations`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider }),
            });
            setIntegrations(integrations.filter(i => i.provider !== provider));
        } finally { setSaving(false); }
    }

    async function save(patch: Record<string, unknown>) {
        setSaving(true);
        try {
            await fetch(`/api/planners/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
        } finally {
            setSaving(false);
        }
    }

    async function enablePush() {
        if (!pushSupported) return;
        setSaving(true);
        try {
            const permission = await Notification.requestPermission();
            setPushPermission(permission);
            if (permission !== "granted") return;

            const reg = await navigator.serviceWorker.ready;
            const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublic) {
                alert("Push 알림 서버 설정이 아직 준비되지 않았습니다. 이메일 알림을 이용해 주세요.");
                return;
            }

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublic) as BufferSource,
            });
            const json = sub.toJSON();
            await fetch("/api/planners/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(json),
            });
            setNotifyPush(true);
        } finally { setSaving(false); }
    }

    async function disablePush() {
        setSaving(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await fetch("/api/planners/push/subscribe", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            await save({ notify_push_briefing: false });
            setNotifyPush(false);
        } finally { setSaving(false); }
    }

    async function generateSample() {
        setSampleLoading(true);
        setSampleText(null);
        try {
            const res = await fetch(`/api/planners/briefing/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "morning" }),
            });
            if (res.ok) {
                const d = await res.json();
                setSampleText(d.content || d.briefing?.content || "샘플 생성 완료 (내용 없음)");
            } else {
                setSampleText("샘플 생성에 실패했습니다. API 키 설정을 확인해 주세요.");
            }
        } finally { setSampleLoading(false); }
    }

    if (loading) {
        return <div className="max-w-3xl mx-auto px-6 py-12 text-center text-neutral-400 text-sm">로딩 중…</div>;
    }

    return (
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 md:py-12">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="h-6 w-6 text-[#0F766E]" />
                <h1 className="font-serif text-3xl text-neutral-900">Settings</h1>
                {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
            </div>

            <div className="space-y-6">
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">모드</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {(["weekly", "all_in_one"] as PlannerMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); save({ mode: m }); }}
                                className={`py-3 rounded-lg text-sm transition-colors border-2 ${
                                    mode === m
                                        ? "border-[#0F766E] bg-[#0F766E]/5 text-[#0F766E] font-semibold"
                                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                                }`}
                            >
                                {m === "weekly" ? "Weekly 모드" : "All in One 모드"}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">AI 비서</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-2">아침 브리핑 시간</label>
                                <input
                                    type="time"
                                    value={morning}
                                    onChange={(e) => setMorning(e.target.value)}
                                    onBlur={() => save({ ai_morning_time: morning })}
                                    className="w-full text-base text-neutral-900 bg-neutral-50 rounded-lg px-3 py-2 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-2">저녁 정리 시간</label>
                                <input
                                    type="time"
                                    value={evening}
                                    onChange={(e) => setEvening(e.target.value)}
                                    onBlur={() => save({ ai_evening_time: evening })}
                                    className="w-full text-base text-neutral-900 bg-neutral-50 rounded-lg px-3 py-2 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-2">AI 톤</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["professional", "friendly", "brief"] as AiTone[]).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => { setTone(t); save({ ai_tone: t }); }}
                                        className={`py-2 text-sm rounded-lg transition-colors ${
                                            tone === t
                                                ? "bg-[#0F766E] text-white"
                                                : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                                        }`}
                                    >
                                        {t === "professional" ? "전문적" : t === "friendly" ? "친근함" : "간결함"}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="pt-2 border-t border-neutral-100">
                            <label className="block text-xs text-neutral-500 mb-1">컨텍스트 범위</label>
                            <p className="text-[10px] text-neutral-400 mb-3">브리핑 생성 시 참조할 정보를 선택하세요</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: "identity", label: "아이덴티티" },
                                    { key: "weekly", label: "이번 주" },
                                    { key: "monthly", label: "이번 달" },
                                    { key: "projects", label: "프로젝트" },
                                    { key: "daily", label: "오늘 할 일" },
                                ].map(({ key, label }) => {
                                    const on = contextScope.includes(key);
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                const next = on
                                                    ? contextScope.filter(s => s !== key)
                                                    : [...contextScope, key];
                                                setContextScope(next);
                                                save({ ai_context_scope: next });
                                            }}
                                            className={`px-3 py-1.5 text-xs rounded-full transition-colors border ${
                                                on
                                                    ? "border-[#0F766E] bg-[#0F766E]/5 text-[#0F766E]"
                                                    : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="pt-2 border-t border-neutral-100">
                            <button
                                onClick={generateSample}
                                disabled={sampleLoading}
                                className="flex items-center gap-1.5 text-xs text-[#0F766E] hover:underline disabled:opacity-50"
                            >
                                {sampleLoading
                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                    : <Sparkles className="h-3 w-3" />}
                                브리핑 샘플 미리보기
                            </button>
                            {sampleText && (
                                <div className="mt-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                                    {sampleText}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 알림 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">알림</h2>
                    <div className="space-y-3">
                        {/* 이메일 */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-900">이메일로 브리핑 받기</p>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    아침·저녁 브리핑을 이메일로 함께 전송
                                </p>
                            </div>
                            <button
                                onClick={() => { setNotifyEmail(!notifyEmail); save({ notify_email_briefing: !notifyEmail }); }}
                                className={`w-11 h-6 rounded-full transition-colors relative ${
                                    notifyEmail ? "bg-[#0F766E]" : "bg-neutral-300"
                                }`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                    notifyEmail ? "translate-x-5" : "translate-x-0.5"
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
                                    className={`w-11 h-6 rounded-full transition-colors relative ${
                                        notifyPush ? "bg-[#0F766E]" : "bg-neutral-300"
                                    }`}
                                >
                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                        notifyPush ? "translate-x-5" : "translate-x-0.5"
                                    }`} />
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* 외부 연동 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">외부 연동</h2>
                    <div className="space-y-3">
                        <IntegrationRow
                            name="Google Calendar"
                            desc="구글 캘린더 일정을 Monthly·Weekly·Today에 자동 유입"
                            integration={integrations.find(i => i.provider === 'google_calendar' && i.status === 'active')}
                            connectHref="/api/planners/integrations/google/connect"
                            onSync={syncGoogle}
                            onDisconnect={() => disconnectIntegration('google_calendar')}
                            syncing={syncing === 'google_calendar'}
                        />
                        <div className="pt-2 border-t border-neutral-100" />
                        <IntegrationRow
                            name="Todoist"
                            desc="오늘의 Todoist 태스크를 Daily로 import"
                            integration={integrations.find(i => i.provider === 'todoist' && i.status === 'active')}
                            connectHref="#"
                            onConnectClick={() => setTodoistModal(true)}
                            onSync={syncTodoist}
                            onDisconnect={() => disconnectIntegration('todoist')}
                            syncing={syncing === 'todoist'}
                        />
                        <div className="pt-2 border-t border-neutral-100" />
                        <IntegrationRow
                            name="Notion"
                            desc="Notion DB의 미완료 태스크를 Daily로 import"
                            integration={integrations.find(i => i.provider === 'notion' && i.status === 'active')}
                            connectHref="#"
                            onConnectClick={() => setNotionModal(true)}
                            onSync={syncNotion}
                            onDisconnect={() => disconnectIntegration('notion')}
                            syncing={syncing === 'notion'}
                        />
                        <div className="pt-2 border-t border-neutral-100" />
                        <IntegrationRow
                            name="Slack"
                            desc="아침·저녁 브리핑을 Slack 채널로 자동 전송"
                            integration={integrations.find(i => i.provider === 'slack' && i.status === 'active')}
                            connectHref="#"
                            onConnectClick={() => setSlackModal(true)}
                            onSync={syncSlack}
                            onDisconnect={() => disconnectIntegration('slack')}
                            syncing={syncing === 'slack'}
                        />
                        <div className="pt-2 border-t border-neutral-100" />
                        <IntegrationRow
                            name="Apple Calendar / Outlook (iCal)"
                            desc="iCal 구독 피드로 일정을 Monthly·Weekly·Today에 유입"
                            integration={integrations.find(i => i.provider === 'ical' && i.status === 'active')}
                            connectHref="#"
                            onConnectClick={() => setIcalModal(true)}
                            onSync={syncIcal}
                            onDisconnect={() => disconnectIntegration('ical')}
                            syncing={syncing === 'ical'}
                        />
                    </div>
                </section>

                {todoistModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-5">
                            <h3 className="font-semibold text-neutral-900 mb-2">Todoist 연결</h3>
                            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                                Todoist 웹 → Settings → Integrations → Developer → API 토큰 복사 후 붙여넣기
                            </p>
                            <input
                                type="text"
                                value={todoistToken}
                                onChange={(e) => setTodoistToken(e.target.value)}
                                placeholder="API 토큰 붙여넣기"
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0F766E]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => { setTodoistModal(false); setTodoistToken(""); }}
                                    className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={connectTodoist}
                                    disabled={todoistSubmit || !todoistToken.trim()}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0F766E] text-white text-sm rounded-lg hover:bg-[#0d5e56] disabled:opacity-50"
                                >
                                    {todoistSubmit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    연결
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {notionModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-5">
                            <h3 className="font-semibold text-neutral-900 mb-2">Notion 연결</h3>
                            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                                Notion 설정 → 연동 → API 통합 → 새 통합 만들기 → Internal Integration Token 복사 후 붙여넣기.
                                연결 후 원하는 DB 페이지에서 &quot;연결 추가&quot;로 통합을 허용해 주세요.
                            </p>
                            <input
                                type="text"
                                value={notionToken}
                                onChange={(e) => setNotionToken(e.target.value)}
                                placeholder="secret_..."
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0F766E]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => { setNotionModal(false); setNotionToken(""); }}
                                    className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={connectNotion}
                                    disabled={notionSubmit || !notionToken.trim()}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0F766E] text-white text-sm rounded-lg hover:bg-[#0d5e56] disabled:opacity-50"
                                >
                                    {notionSubmit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    연결
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {slackModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-5">
                            <h3 className="font-semibold text-neutral-900 mb-2">Slack 연결</h3>
                            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                                Slack 채널 → 앱 추가 → Incoming WebHooks 설치 → Webhook URL 복사 후 붙여넣기.
                                브리핑이 생성될 때마다 해당 채널로 자동 전송됩니다.
                            </p>
                            <input
                                type="url"
                                value={slackWebhook}
                                onChange={(e) => setSlackWebhook(e.target.value)}
                                placeholder="https://hooks.slack.com/services/..."
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0F766E]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => { setSlackModal(false); setSlackWebhook(""); }}
                                    className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={connectSlack}
                                    disabled={slackSubmit || !slackWebhook.trim()}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0F766E] text-white text-sm rounded-lg hover:bg-[#0d5e56] disabled:opacity-50"
                                >
                                    {slackSubmit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    연결
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {icalModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-5">
                            <h3 className="font-semibold text-neutral-900 mb-2">Apple Calendar / Outlook 연결</h3>
                            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                                Apple Calendar: 캘린더 우클릭 → 공유 → 공개 캘린더 → 링크 복사.<br />
                                Google Calendar: 설정 → 캘린더 → 비공개 iCal 주소 복사.<br />
                                Outlook: 캘린더 → 공유 → ICS 링크 복사.
                            </p>
                            <input
                                type="url"
                                value={icalUrl}
                                onChange={(e) => setIcalUrl(e.target.value)}
                                placeholder="webcal:// 또는 https://..."
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0F766E]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => { setIcalModal(false); setIcalUrl(""); }}
                                    className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={connectIcal}
                                    disabled={icalSubmit || !icalUrl.trim()}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0F766E] text-white text-sm rounded-lg hover:bg-[#0d5e56] disabled:opacity-50"
                                >
                                    {icalSubmit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    연결
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">구독</h2>

                    {sub.status === 'active' ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-[#0F766E]" />
                                <span className="text-sm font-semibold text-[#0F766E]">활성 구독</span>
                                {sub.is_pdf_buyer && (
                                    <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                                        PDF 구매자 혜택
                                    </span>
                                )}
                            </div>
                            {sub.expires && (
                                <p className="text-xs text-neutral-600">
                                    만료: {new Date(sub.expires).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            )}
                            <Link
                                href="/planners/purchase"
                                className="inline-flex items-center gap-1.5 text-xs text-[#0F766E] hover:underline"
                            >
                                구독 연장 <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-neutral-500">
                                {sub.status === 'expired' ? '구독이 만료되었습니다.' : '아직 구독하지 않으셨습니다.'}
                            </p>
                            <Link
                                href="/planners/purchase"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors"
                            >
                                연간 19,000원 구독 시작
                            </Link>
                            <p className="text-[10px] text-neutral-400">
                                종이 플래너 구매자 → lools@tenone.biz로 무료 활성화 요청
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
