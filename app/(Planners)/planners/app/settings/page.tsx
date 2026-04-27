"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Settings, Loader2, Check, ExternalLink, Link as LinkIcon, Unplug, RefreshCw, Sparkles, Download, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { PlannerMode, AiTone } from "@/lib/planners/types";
import { applyPlannersTheme } from "@/features/planners/PlannersThemeProvider";
import { InstallButton } from "@/features/planners/InstallButton";

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
    pendingConfirm,
    onConfirm,
    onCancel,
}: {
    name: string;
    desc: string;
    integration: Integration | undefined;
    connectHref: string;
    onConnectClick?: () => void;
    onSync: () => void;
    onDisconnect: () => void;
    syncing: boolean;
    pendingConfirm?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
}) {
    const connected = !!integration;
    return (
        <div className="flex items-center justify-between py-1">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-neutral-900 font-medium">{name}</p>
                    {connected && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#0F766E]/10 text-[#0F766E] rounded">
                            Connected
                        </span>
                    )}
                </div>
                {connected && integration?.external_email ? (
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {integration.external_email}
                        {integration.last_sync_at && (
                            <span className="text-neutral-400 ml-2">
                                · Last synced {new Date(integration.last_sync_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </p>
                ) : (
                    <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                )}
            </div>
            <div className="flex items-center gap-2">
                {pendingConfirm ? (
                    <>
                        <span className="text-xs text-neutral-500">Disconnect?</span>
                        <button
                            onClick={onConfirm}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"
                        >
                            Yes
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-xs hover:bg-neutral-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </>
                ) : connected ? (
                    <>
                        <button
                            onClick={onSync}
                            disabled={syncing}
                            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-xs hover:bg-neutral-200 transition-colors disabled:opacity-50"
                        >
                            {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                            Sync
                        </button>
                        <button
                            onClick={onDisconnect}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-200 text-neutral-500 rounded-lg text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                            <Unplug className="h-3 w-3" /> Disconnect
                        </button>
                    </>
                ) : onConnectClick ? (
                    <button
                        onClick={onConnectClick}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs hover:bg-[#0d5e56] transition-colors"
                    >
                        <LinkIcon className="h-3 w-3" /> Connect
                    </button>
                ) : (
                    <a
                        href={connectHref}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs hover:bg-[#0d5e56] transition-colors"
                    >
                        <LinkIcon className="h-3 w-3" /> Connect
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
    const router = useRouter();
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
    const [trackingMetrics, setTrackingMetrics] = useState<string[]>([]);
    const [countryPref, setCountryPref] = useState<string[]>(["KR"]);
    const [yearStartMonth, setYearStartMonth] = useState<number>(1);
    const [sampleLoading, setSampleLoading] = useState(false);
    const [sampleText, setSampleText] = useState<string | null>(null);
    const [colorTheme, setColorTheme] = useState("teal");
    const [fontFamily, setFontFamily] = useState("serif");
    const [exporting, setExporting] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [pendingDisconnect, setPendingDisconnect] = useState<string | null>(null);

    const showToast = useCallback((text: string, ok = true) => {
        setToastMsg({ text, ok });
        setTimeout(() => setToastMsg(null), 3000);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedTheme = localStorage.getItem("planners_color_theme");
            const savedFont = localStorage.getItem("planners_font_family");
            if (savedTheme) setColorTheme(savedTheme);
            if (savedFont) setFontFamily(savedFont);
        }
    }, []);

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
                    setNotifyEmail(!!d.user.notify_email_briefing);
                    setNotifyPush(!!d.user.notify_push_briefing);
                    if (d.user.ai_context_scope?.length) setContextScope(d.user.ai_context_scope);
                    setTrackingMetrics(Array.isArray(d.user.daily_tracking_metrics) ? d.user.daily_tracking_metrics : []);
                    setCountryPref(Array.isArray(d.user.country_pref) && d.user.country_pref.length > 0 ? d.user.country_pref : ["KR"]);
                    if (typeof d.user.year_start_month === "number") setYearStartMonth(d.user.year_start_month);
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
                if (q.get("google") === "connected") showToast("Google Calendar 연결 완료");
                if (q.get("google_error")) showToast(`Google 연결 실패: ${q.get("google_error")}`, false);
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
                showToast(`${d.synced}개 이벤트 동기화 완료`);
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) {
                    const id = await iRes.json();
                    setIntegrations(id.integrations || []);
                }
            } else {
                const d = await res.json();
                showToast(`동기화 실패: ${d.error}`, false);
            }
        } finally { setSyncing(null); }
    }

    async function syncTodoist() {
        setSyncing("todoist");
        try {
            const res = await fetch(`/api/planners/integrations/todoist/sync`, { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                showToast(`${d.imported}개 태스크 import 완료`);
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) {
                    const id = await iRes.json();
                    setIntegrations(id.integrations || []);
                }
            } else {
                const d = await res.json();
                showToast(`실패: ${d.error}`, false);
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
                showToast(`연결 실패: ${d.error}`, false);
            }
        } finally { setTodoistSubmit(false); }
    }

    async function syncNotion() {
        setSyncing("notion");
        try {
            const res = await fetch(`/api/planners/integrations/notion/sync`, { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                showToast(`${d.imported}개 태스크 import 완료`);
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) setIntegrations((await iRes.json()).integrations || []);
            } else {
                const d = await res.json();
                showToast(`실패: ${d.error}`, false);
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
                showToast(`연결 실패: ${d.error}`, false);
            }
        } finally { setNotionSubmit(false); }
    }

    async function syncSlack() {
        setSyncing("slack");
        try {
            const res = await fetch(`/api/planners/integrations/slack/sync`, { method: "POST" });
            if (res.ok) {
                showToast("Slack으로 브리핑 전송 완료");
            } else {
                const d = await res.json();
                showToast(`실패: ${d.error}`, false);
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
                showToast(`연결 실패: ${d.error}`, false);
            }
        } finally { setSlackSubmit(false); }
    }

    async function syncIcal() {
        setSyncing("ical");
        try {
            const res = await fetch(`/api/planners/integrations/ical/sync`, { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                showToast(`${d.synced}개 이벤트 동기화 완료`);
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) setIntegrations((await iRes.json()).integrations || []);
            } else {
                const d = await res.json();
                showToast(`실패: ${d.error}`, false);
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
                showToast(`연결 완료. ${d.eventCount ?? 0}개 이벤트 확인됨`);
                const iRes = await fetch(`/api/planners/integrations`);
                if (iRes.ok) setIntegrations((await iRes.json()).integrations || []);
            } else {
                const d = await res.json();
                showToast(`연결 실패: ${d.error}`, false);
            }
        } finally { setIcalSubmit(false); }
    }

    function disconnectIntegration(provider: string) {
        setPendingDisconnect(provider);
    }

    async function confirmDisconnect(provider: string) {
        setPendingDisconnect(null);
        setSaving(true);
        try {
            await fetch(`/api/planners/integrations`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider }),
            });
            setIntegrations(prev => prev.filter(i => i.provider !== provider));
            showToast("연결 해제 완료");
        } finally { setSaving(false); }
    }

    async function save(patch: Record<string, unknown>) {
        setSaving(true);
        try {
            const res = await fetch(`/api/planners/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
            if (res.ok) {
                showToast("저장되었습니다");
            } else {
                const err = await res.json().catch(() => ({}));
                showToast(`저장 실패: ${err.error || res.status}`, false);
            }
        } catch (e) {
            showToast(`네트워크 오류: ${(e as Error).message}`, false);
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
                showToast("Push 알림 서버 설정이 아직 준비되지 않았습니다. 이메일 알림을 이용해 주세요.", false);
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

    const COLOR_THEMES = [
        { key: "teal",   label: "Teal",   hex: "#0F766E" },
        { key: "sage",   label: "Sage",   hex: "#4D7C6F" },
        { key: "slate",  label: "Slate",  hex: "#475569" },
        { key: "rose",   label: "Rose",   hex: "#BE185D" },
        { key: "amber",  label: "Amber",  hex: "#B45309" },
        { key: "indigo", label: "Indigo", hex: "#4338CA" },
    ];

    const FONT_OPTIONS = [
        { key: "serif", label: "Serif", desc: "클래식 · 종이 감성" },
        { key: "sans",  label: "Sans",  desc: "모던 · 깔끔" },
        { key: "mono",  label: "Mono",  desc: "정밀 · 코드" },
    ];

    async function exportBackup() {
        setExporting(true);
        try {
            const [settingsRes, dailyRes, weeklyRes, monthlyRes, yearlyRes, identityRes, projectsRes] = await Promise.all([
                fetch("/api/planners/settings"),
                fetch("/api/planners/daily"),
                fetch("/api/planners/weekly"),
                fetch("/api/planners/monthly"),
                fetch("/api/planners/yearly"),
                fetch("/api/planners/identity"),
                fetch("/api/planners/projects"),
            ]);
            const backup = {
                exported_at: new Date().toISOString(),
                version: "1.0",
                settings: settingsRes.ok ? await settingsRes.json() : null,
                daily: dailyRes.ok ? await dailyRes.json() : null,
                weekly: weeklyRes.ok ? await weeklyRes.json() : null,
                monthly: monthlyRes.ok ? await monthlyRes.json() : null,
                yearly: yearlyRes.ok ? await yearlyRes.json() : null,
                identity: identityRes.ok ? await identityRes.json() : null,
                projects: projectsRes.ok ? await projectsRes.json() : null,
            };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const d = new Date();
            const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
            a.href = url;
            a.download = `planners-backup-${dateStr}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    }

    function applyTheme(key: string) {
        setColorTheme(key);
        localStorage.setItem("planners_color_theme", key);
        applyPlannersTheme(key);
    }

    function applyFont(key: string) {
        setFontFamily(key);
        localStorage.setItem("planners_font_family", key);
        document.documentElement.setAttribute("data-planners-font", key);
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
                                onClick={async () => { setMode(m); await save({ mode: m }); router.refresh(); }}
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

                {/* 앱 설치 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-2">앱 설치</h2>
                    <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                        홈 화면에 PP AI 아이콘을 추가하면 브라우저 주소창 없이 앱처럼 빠르게 열 수 있습니다.
                        Android · iPhone · iPad · PC 모두 지원하며, 모든 기능은 웹과 동일하게 작동합니다.
                    </p>
                    <InstallButton
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white rounded-lg text-sm font-medium hover:bg-[#0d5e56] transition-colors"
                    >
                        <Download className="h-3.5 w-3.5" />
                        앱 설치
                    </InstallButton>
                </section>

                {/* Color Theme */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">컬러 테마</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        {COLOR_THEMES.map((t) => {
                            const active = colorTheme === t.key;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => applyTheme(t.key)}
                                    title={t.label}
                                    className="flex flex-col items-center gap-1.5 group"
                                >
                                    <span
                                        className={`h-8 w-8 rounded-full transition-all ${
                                            active ? "scale-110" : "group-hover:scale-105"
                                        }`}
                                        style={{
                                            backgroundColor: t.hex,
                                            outline: active ? `3px solid ${t.hex}` : "none",
                                            outlineOffset: "3px",
                                        }}
                                    />
                                    <span className={`text-[10px] font-mono ${active ? "text-neutral-900 font-semibold" : "text-neutral-400"}`}>
                                        {t.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Font Selection */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">폰트</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {FONT_OPTIONS.map((f) => {
                            const active = fontFamily === f.key;
                            return (
                                <button
                                    key={f.key}
                                    onClick={() => applyFont(f.key)}
                                    className={`py-3 px-4 rounded-lg text-left border-2 transition-colors ${
                                        active
                                            ? "border-[#0F766E] bg-[#0F766E]/5"
                                            : "border-neutral-200 hover:border-neutral-300"
                                    }`}
                                >
                                    <span className={`block text-base mb-0.5 ${
                                        f.key === "serif" ? "font-serif" :
                                        f.key === "mono" ? "font-mono" :
                                        "font-sans"
                                    } ${active ? "text-[#0F766E]" : "text-neutral-900"}`}>
                                        Aa
                                    </span>
                                    <span className={`text-[10px] font-semibold ${active ? "text-[#0F766E]" : "text-neutral-600"}`}>
                                        {f.label}
                                    </span>
                                    <span className="block text-[9px] text-neutral-400 mt-0.5">{f.desc}</span>
                                </button>
                            );
                        })}
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

                {/* 데일리 트래킹 */}
                <section id="tracking" className="bg-white border border-neutral-200 rounded-xl p-6 scroll-mt-16">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-1">데일리 트래킹</h2>
                    <p className="text-xs text-neutral-500 mb-4">
                        Daily 페이지에 노출할 자기 점검 항목을 선택하세요. 모두 끄면 섹션이 숨겨집니다.
                    </p>
                    <div className="space-y-2">
                        {[
                            { key: "energy",       label: "에너지",   hint: "컨디션·체력 1~5" },
                            { key: "satisfaction", label: "만족도",   hint: "오늘 하루 만족 1~5" },
                            { key: "mood",         label: "기분",     hint: "감정 상태 1~5" },
                            { key: "study",        label: "공부",     hint: "학습 집중도 1~5 + 메모" },
                            { key: "faith",        label: "신앙",     hint: "영적 충만도 1~5 + 메모" },
                            { key: "exercise",     label: "운동",     hint: "종류·시간(분)·거리(km)" },
                            { key: "health",       label: "건강",     hint: "혈압·혈당·체중·체온" },
                        ].map((m) => {
                            const checked = trackingMetrics.includes(m.key);
                            return (
                                <label
                                    key={m.key}
                                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 cursor-pointer"
                                >
                                    <div>
                                        <p className="text-sm text-neutral-900">{m.label}</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">{m.hint}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? [...trackingMetrics, m.key]
                                                : trackingMetrics.filter((k) => k !== m.key);
                                            setTrackingMetrics(next);
                                            save({ daily_tracking_metrics: next });
                                        }}
                                        className="w-4 h-4 accent-[#0F766E]"
                                    />
                                </label>
                            );
                        })}
                    </div>
                </section>

                {/* Yearly 시작월 — 플래너 중간 시작자 대응 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-1">한 해 시작월</h2>
                    <p className="text-xs text-neutral-500 mb-4">
                        Yearly 페이지의 분기·반기 보기는 이 달부터 시작합니다. 플래너를 중간에 시작했다면 그 달로 설정하세요.
                    </p>
                    <select
                        value={yearStartMonth}
                        onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            setYearStartMonth(v);
                            save({ year_start_month: v });
                        }}
                        className="w-full md:w-48 text-sm border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:border-[#0F766E] bg-white"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>{m}월부터 시작</option>
                        ))}
                    </select>
                </section>

                {/* 공휴일·절기 국가 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-1">공휴일·절기 국가</h2>
                    <p className="text-xs text-neutral-500 mb-4">
                        선택한 국가의 법정공휴일·절기가 일/주/월/연 캘린더에 자동 반영됩니다.
                    </p>
                    <div className="space-y-2">
                        {[
                            { code: "KR", label: "🇰🇷 한국", hint: "법정공휴일 + 24절기" },
                            { code: "US", label: "🇺🇸 미국", hint: "Federal Holidays" },
                            { code: "JP", label: "🇯🇵 일본", hint: "国民の祝日" },
                            { code: "CN", label: "🇨🇳 중국", hint: "法定节假日" },
                        ].map((c) => {
                            const checked = countryPref.includes(c.code);
                            return (
                                <label
                                    key={c.code}
                                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 cursor-pointer"
                                >
                                    <div>
                                        <p className="text-sm text-neutral-900">{c.label}</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">{c.hint}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? [...countryPref, c.code]
                                                : countryPref.filter((k) => k !== c.code);
                                            // 최소 한 국가는 유지 (한국 default)
                                            const final = next.length === 0 ? ["KR"] : next;
                                            setCountryPref(final);
                                            save({ country_pref: final });
                                        }}
                                        className="w-4 h-4 accent-[#0F766E]"
                                    />
                                </label>
                            );
                        })}
                    </div>
                </section>

                {/* 알림 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">알림</h2>
                    <div className="space-y-3">
                        {/* 이메일 */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-900">이메일로도 받기 <span className="text-[10px] text-neutral-400 ml-1">선택</span></p>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    앱 안에서 보는 게 기본. 이메일 전송이 추가로 필요하면 켜기
                                </p>
                            </div>
                            <button
                                onClick={() => { setNotifyEmail(!notifyEmail); save({ notify_email_briefing: !notifyEmail }); }}
                                className={`w-11 h-6 rounded-full transition-colors relative ${
                                    notifyEmail ? "bg-[#0F766E]" : "bg-neutral-300"
                                }`}
                            >
                                <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform ${
                                    notifyEmail ? "translate-x-[18px]" : "translate-x-0"
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
                                    <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform ${
                                        notifyPush ? "translate-x-[18px]" : "translate-x-0"
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
                            pendingConfirm={pendingDisconnect === 'google_calendar'}
                            onConfirm={() => confirmDisconnect('google_calendar')}
                            onCancel={() => setPendingDisconnect(null)}
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
                            pendingConfirm={pendingDisconnect === 'todoist'}
                            onConfirm={() => confirmDisconnect('todoist')}
                            onCancel={() => setPendingDisconnect(null)}
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
                            pendingConfirm={pendingDisconnect === 'notion'}
                            onConfirm={() => confirmDisconnect('notion')}
                            onCancel={() => setPendingDisconnect(null)}
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
                            pendingConfirm={pendingDisconnect === 'slack'}
                            onConfirm={() => confirmDisconnect('slack')}
                            onCancel={() => setPendingDisconnect(null)}
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
                            pendingConfirm={pendingDisconnect === 'ical'}
                            onConfirm={() => confirmDisconnect('ical')}
                            onCancel={() => setPendingDisconnect(null)}
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

                {/* 데이터 백업 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-1">데이터 백업</h2>
                    <p className="text-xs text-neutral-500 mb-4">설정·일별·주별·월별·연간·아이덴티티·프로젝트 데이터를 JSON 파일로 내보냅니다.</p>
                    <button
                        onClick={exportBackup}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        {exporting ? "내보내는 중…" : "JSON으로 내보내기"}
                    </button>
                </section>

                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">구독 현황</h2>

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
                            <div className="bg-neutral-50 rounded-lg p-3 space-y-1">
                                <p className="text-[10px] uppercase tracking-widest text-neutral-400">이용 중</p>
                                <p className="text-sm font-medium text-neutral-900">Planner&apos;s Planner AI · 무제한</p>
                                <p className="text-[11px] text-neutral-500">능동 AI 비서 · 모든 템플릿 · Calendar/Notion/Slack 연동</p>
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
                            <div className="bg-gradient-to-br from-[#0F766E]/5 to-amber-50 border border-[#0F766E]/20 rounded-lg p-4">
                                <p className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold mb-1">🎉 런칭 프로모션</p>
                                <p className="text-sm font-semibold text-neutral-900 mb-2">첫 1년 19,000원</p>
                                <ul className="text-[11px] text-neutral-600 space-y-0.5 mb-3">
                                    <li>• 능동 AI 비서 · 매일 아침 브리핑</li>
                                    <li>• 59종 시각 템플릿 무제한</li>
                                    <li>• Google Calendar / Notion / Slack 연동</li>
                                    <li>• PDF 플래너 구매자 → 무료 1년</li>
                                </ul>
                                <Link
                                    href="/planners/purchase"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors"
                                >
                                    구독 시작
                                </Link>
                            </div>
                            <p className="text-[10px] text-neutral-400">
                                종이 플래너 구매자 → lools@tenone.biz 로 무료 활성화 요청
                            </p>
                        </div>
                    )}
                </section>

                {/* 변경사항 일괄 저장 — 자동 저장이 안 되는 경우 마지막 보루 */}
                <SaveAllBar
                    onSave={async () => {
                        await save({
                            mode,
                            ai_morning_time: morning + ':00',
                            ai_evening_time: evening + ':00',
                            ai_tone: tone,
                            ai_context_scope: contextScope,
                            notify_email_briefing: notifyEmail,
                            daily_tracking_metrics: trackingMetrics,
                            country_pref: countryPref,
                        });
                    }}
                    saving={saving}
                />
            </div>

            {/* Toast */}
            {toastMsg && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm transition-all ${
                    toastMsg.ok ? "bg-[#0F766E] text-white" : "bg-red-600 text-white"
                }`}>
                    {toastMsg.ok ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
                    {toastMsg.text}
                </div>
            )}
        </div>
    );
}

function SaveAllBar({ onSave, saving }: { onSave: () => Promise<void>; saving: boolean }) {
    return (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
                <p className="text-sm text-neutral-900 font-medium">변경사항 일괄 저장</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                    각 항목은 변경 즉시 자동 저장됩니다. 저장이 안 된 것 같으면 이 버튼으로 한 번에 다시 저장하세요.
                </p>
            </div>
            <button
                onClick={onSave}
                disabled={saving}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white rounded-lg text-sm font-medium hover:bg-[#0d5e56] disabled:opacity-50"
            >
                {saving ? "저장 중…" : "전체 저장"}
            </button>
        </div>
    );
}
