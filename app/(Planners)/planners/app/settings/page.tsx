"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Settings, Loader2, Check, ExternalLink, Link as LinkIcon, Unplug, RefreshCw, Sparkles, Download, X, AlertCircle, FolderOpen, Plus, Sun, Moon, Monitor, Briefcase, GraduationCap, FlaskConical, Palette, Code2, Clapperboard, TrendingUp, Map, Dumbbell, Rocket } from "lucide-react";
import Link from "next/link";
import type { PlannerMode, AiTone, PlannerRole } from "@/lib/planners/types";
import { PLANNER_ROLE_META } from "@/lib/planners/types";
import { applyPlannersTheme, applyPlannersFont, applyPlannersUserFont, applyPlannersThemeMode, applyPlannersRadius, type PlannersThemeMode, type PlannersRadius } from "@/features/planners/PlannersThemeProvider";
import { InstallButton } from "@/features/planners/InstallButton";
import { ALL_NAV_OPTIONS, MOBILE_NAV_STORAGE_KEY, MOBILE_NAV_DEFAULT } from "@/features/planners/MobileBottomNav";

const ROLE_ICONS: Record<PlannerRole, React.ElementType> = {
    office_worker: Briefcase,
    student:       GraduationCap,
    researcher:    FlaskConical,
    designer:      Palette,
    developer:     Code2,
    creator:       Clapperboard,
    sales:         TrendingUp,
    planner:       Map,
    athlete:       Dumbbell,
    entrepreneur:  Rocket,
};

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
    const [sampleLoading, setSampleLoading] = useState(false);
    const [sampleText, setSampleText] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<PlannerRole | null>(null);
    const [colorTheme, setColorTheme] = useState("teal");
    const [radiusTheme, setRadiusTheme] = useState<PlannersRadius>("soft");
    const [fontFamily, setFontFamily] = useState("sans");
    const [themeMode, setThemeMode] = useState<PlannersThemeMode>("system");
    const [userFontFamily, setUserFontFamily] = useState("serif");
    const [customFonts, setCustomFonts] = useState<string[]>(["", "", "", "", "", ""]);
    const [exporting, setExporting] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [pendingDisconnect, setPendingDisconnect] = useState<string | null>(null);
    const [projectLinks, setProjectLinks] = useState<Record<string, string | null>>(() => {
        if (typeof window === "undefined") return {};
        try { return JSON.parse(localStorage.getItem("planners_tracking_projects") || "{}"); }
        catch { return {}; }
    });
    const [projectPickerMetric, setProjectPickerMetric] = useState<string | null>(null);
    const [projects, setProjects] = useState<Array<{ id: string; title: string; status?: string }>>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState("");
    const [creatingProject, setCreatingProject] = useState(false);

    const showToast = useCallback((text: string, ok = true) => {
        setToastMsg({ text, ok });
        setTimeout(() => setToastMsg(null), 3000);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedTheme = localStorage.getItem("planners_color_theme");
            const savedFont = localStorage.getItem("planners_font_family");
            const savedUserFont = localStorage.getItem("planners_user_font");
            if (savedTheme) setColorTheme(savedTheme);
            if (savedFont) setFontFamily(savedFont);
            if (savedUserFont) setUserFontFamily(savedUserFont);
            const savedMode = localStorage.getItem("planners_theme_mode") as PlannersThemeMode | null;
            if (savedMode === "light" || savedMode === "dark" || savedMode === "system") setThemeMode(savedMode);
            const savedRadius = localStorage.getItem("planners_radius_theme") as PlannersRadius | null;
            if (savedRadius === "sharp" || savedRadius === "subtle" || savedRadius === "soft") setRadiusTheme(savedRadius);
            try {
                const savedCustom = localStorage.getItem("planners_custom_fonts");
                if (savedCustom) setCustomFonts(JSON.parse(savedCustom));
            } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/planners/settings`);
            if (res.ok) {
                const d = await res.json();
                if (d.user) {
                    setMode(d.user.mode);
                    if (d.user.user_role) setUserRole(d.user.user_role as PlannerRole);
                    setMorning(d.user.ai_morning_time?.slice(0, 5) || "08:00");
                    setEvening(d.user.ai_evening_time?.slice(0, 5) || "21:00");
                    setTone(d.user.ai_tone);
                    setNotifyEmail(!!d.user.notify_email_briefing);
                    setNotifyPush(!!d.user.notify_push_briefing);
                    if (d.user.ai_context_scope?.length) setContextScope(d.user.ai_context_scope);
                    setTrackingMetrics(Array.isArray(d.user.daily_tracking_metrics) ? d.user.daily_tracking_metrics : []);
                    setCountryPref(Array.isArray(d.user.country_pref) && d.user.country_pref.length > 0 ? d.user.country_pref : ["KR"]);
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

    const METRIC_LABELS: Record<string, string> = {
        energy: "에너지", satisfaction: "만족도", mood: "기분",
        study: "공부", faith: "신앙", exercise: "운동", health: "건강",
    };

    async function openProjectPicker(metricKey: string) {
        setProjectPickerMetric(metricKey);
        setProjectsLoading(true);
        try {
            const res = await fetch("/api/planners/projects");
            if (res.ok) {
                const d = await res.json();
                setProjects((d.projects || []).filter((p: { id: string; title: string; status?: string }) => p.status !== "completed"));
            }
        } finally { setProjectsLoading(false); }
    }

    function linkProject(metricKey: string, projectId: string | null) {
        const next = { ...projectLinks, [metricKey]: projectId };
        setProjectLinks(next);
        if (typeof window !== "undefined") localStorage.setItem("planners_tracking_projects", JSON.stringify(next));
        setProjectPickerMetric(null);
        setNewProjectTitle("");
    }

    async function createAndLinkProject(metricKey: string) {
        if (!newProjectTitle.trim()) return;
        setCreatingProject(true);
        try {
            const res = await fetch("/api/planners/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newProjectTitle.trim(), description: `${METRIC_LABELS[metricKey] ?? metricKey} 트래킹 프로젝트` }),
            });
            if (res.ok) {
                const d = await res.json();
                const proj = d.project ?? d;
                linkProject(metricKey, proj.id);
                showToast(`"${proj.title}" 프로젝트 연결 완료`);
            } else {
                showToast("프로젝트 생성 실패", false);
            }
        } finally { setCreatingProject(false); }
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
        { key: "mono",     label: "Mono",     hex: "#171717" },
        { key: "charcoal", label: "Charcoal", hex: "#374151" },
        { key: "teal",     label: "Teal",     hex: "#0F766E" },
        { key: "navy",     label: "Navy",     hex: "#1E40AF" },
        { key: "indigo",   label: "Indigo",   hex: "#4338CA" },
        { key: "violet",   label: "Violet",   hex: "#7C3AED" },
        { key: "plum",     label: "Plum",     hex: "#86198F" },
        { key: "rose",     label: "Rose",     hex: "#BE185D" },
        { key: "crimson",  label: "Crimson",  hex: "#DC2626" },
        { key: "coral",    label: "Coral",    hex: "#C2553D" },
        { key: "amber",    label: "Amber",    hex: "#B45309" },
        { key: "brown",    label: "Brown",    hex: "#92400E" },
        { key: "sky",      label: "Sky",      hex: "#0369A1" },
        { key: "slate",    label: "Slate",    hex: "#475569" },
    ];

    const RADIUS_THEMES: { key: PlannersRadius; label: string; desc: string; preview: string }[] = [
        { key: "sharp",  label: "Sharp",  desc: "각진 모서리",   preview: "0px" },
        { key: "subtle", label: "Subtle", desc: "살짝 둥근",     preview: "4px" },
        { key: "soft",   label: "Soft",   desc: "기본 (둥근)",   preview: "12px" },
    ];

    const PP_FONT_OPTIONS = [
        { key: "serif",        label: "Serif",      desc: "클래식 · 종이 감성",      fontClass: "font-serif" },
        { key: "strong-serif", label: "강한 세리프", desc: "묵직 · 고급 (Playfair)",  fontClass: "font-serif font-bold" },
        { key: "sans",         label: "Sans",       desc: "모던 · 깔끔",            fontClass: "font-sans" },
        { key: "gothic",       label: "고딕",       desc: "나눔고딕 · 한국어",       fontClass: "font-sans" },
        { key: "mono",         label: "Mono",       desc: "정밀 · 코드",            fontClass: "font-mono" },
        { key: "round",        label: "둥근",       desc: "부드러움 · 친근함",       fontClass: "font-sans" },
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

    function applyMode(mode: PlannersThemeMode) {
        setThemeMode(mode);
        localStorage.setItem("planners_theme_mode", mode);
        applyPlannersThemeMode(mode);
        window.dispatchEvent(new CustomEvent("pp-theme-mode-change", { detail: { mode } }));
    }

    function applyFont(key: string) {
        setFontFamily(key);
        localStorage.setItem("planners_font_family", key);
        applyPlannersFont(key);
    }

    function applyUserFont(key: string) {
        setUserFontFamily(key);
        localStorage.setItem("planners_user_font", key);
        applyPlannersUserFont(key);
    }

    function applyRadius(key: PlannersRadius) {
        setRadiusTheme(key);
        localStorage.setItem("planners_radius_theme", key);
        applyPlannersRadius(key);
    }

    async function changeRole(key: PlannerRole | null) {
        setUserRole(key);
        await save({ user_role: key });
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
                                className={`py-3 px-2 rounded-lg text-sm transition-colors border-2 text-left ${
                                    mode === m
                                        ? "border-[#0F766E] bg-[#0F766E]/5 text-[#0F766E] font-semibold"
                                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                                }`}
                            >
                                {m === "weekly" ? (
                                    <span>
                                        <span className="block font-semibold">Weekly</span>
                                        <span className="block text-[11px] font-normal opacity-60">간단 모드</span>
                                    </span>
                                ) : (
                                    <span>
                                        <span className="block font-semibold">All in One</span>
                                        <span className="block text-[11px] font-normal opacity-60">전문가 모드</span>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 역할 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-sm font-semibold text-neutral-900">나의 역할</h2>
                        {userRole && (
                            <button
                                onClick={() => changeRole(null)}
                                className="text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                                선택 해제
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-neutral-400 mb-4">역할에 맞는 템플릿과 AI 브리핑을 추천합니다.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {(Object.keys(PLANNER_ROLE_META) as PlannerRole[]).map((r) => {
                            const Icon = ROLE_ICONS[r];
                            const meta = PLANNER_ROLE_META[r];
                            const active = userRole === r;
                            return (
                                <button
                                    key={r}
                                    onClick={() => changeRole(active ? null : r)}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 border-2 rounded-lg text-left transition-all ${
                                        active
                                            ? "border-[#0F766E] bg-[#0F766E]/5"
                                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#0F766E]" : "text-neutral-400"}`} />
                                    <div className="min-w-0">
                                        <p className={`text-xs font-semibold truncate ${active ? "text-[#0F766E]" : "text-neutral-700"}`}>
                                            {meta.label}
                                        </p>
                                        <p className="text-[10px] text-neutral-400 truncate">{meta.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
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

                {/* Display Mode — 라이트 / 다크 / 시스템 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-900">표시 모드</h2>
                            <p className="text-[11px] text-neutral-400 mt-0.5">라이트 · 다크 · 시스템 자동 (Phase 1 인프라 — 컴포넌트별 다크 적용은 점진 마이그레이션)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {([
                            { key: "light",  label: "라이트", icon: Sun },
                            { key: "system", label: "시스템", icon: Monitor },
                            { key: "dark",   label: "다크",   icon: Moon },
                        ] as const).map((m) => {
                            const active = themeMode === m.key;
                            const Icon = m.icon;
                            return (
                                <button
                                    key={m.key}
                                    onClick={() => applyMode(m.key)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                                        active
                                            ? "border-[#0F766E] text-[#0F766E] bg-[#0F766E]/5"
                                            : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>
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

                {/* Radius Theme */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">모서리</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {RADIUS_THEMES.map((r) => {
                            const active = radiusTheme === r.key;
                            return (
                                <button
                                    key={r.key}
                                    onClick={() => applyRadius(r.key)}
                                    className={`flex flex-col items-center gap-2 p-3 border-2 transition-colors ${
                                        active
                                            ? "border-[#0F766E] bg-[#0F766E]/5"
                                            : "border-neutral-200 hover:border-neutral-300"
                                    }`}
                                >
                                    <div className="w-8 h-8 bg-neutral-900" style={{ borderRadius: r.preview }} />
                                    <span className={`text-xs font-semibold ${active ? "text-[#0F766E]" : "text-neutral-600"}`}>
                                        {r.label}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">{r.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Font Selection */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">폰트</h2>
                    <div className="space-y-6">
                        {/* 시스템 폰트 */}
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-0.5">시스템 폰트</p>
                            <p className="text-[10px] text-neutral-400 mb-3">메뉴·버튼·라벨 등 앱 UI에 적용</p>
                            <div className="grid grid-cols-3 gap-2">
                                {PP_FONT_OPTIONS.map((f) => {
                                    const active = fontFamily === f.key;
                                    return (
                                        <button
                                            key={f.key}
                                            onClick={() => applyFont(f.key)}
                                            className={`flex flex-col py-3 px-3 rounded-lg text-left border-2 transition-colors ${
                                                active ? "border-[#0F766E] bg-[#0F766E]/5" : "border-neutral-200 hover:border-neutral-300"
                                            }`}
                                        >
                                            <span className={`text-xl mb-1 ${f.fontClass} ${active ? "text-[#0F766E]" : "text-neutral-900"}`}>Aa</span>
                                            <span className={`text-xs font-semibold leading-tight ${active ? "text-[#0F766E]" : "text-neutral-600"}`}>{f.label}</span>
                                            <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">{f.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {/* 사용자 폰트 */}
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-0.5">사용자 폰트</p>
                            <p className="text-[10px] text-neutral-400 mb-3">노트·할 일 등 직접 입력한 내용에 적용</p>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {PP_FONT_OPTIONS.map((f) => {
                                    const active = userFontFamily === f.key;
                                    return (
                                        <button
                                            key={f.key}
                                            onClick={() => applyUserFont(f.key)}
                                            className={`flex flex-col py-3 px-3 rounded-lg text-left border-2 transition-colors ${
                                                active ? "border-[#0F766E] bg-[#0F766E]/5" : "border-neutral-200 hover:border-neutral-300"
                                            }`}
                                        >
                                            <span className={`text-xl mb-1 ${f.fontClass} ${active ? "text-[#0F766E]" : "text-neutral-900"}`}>Aa</span>
                                            <span className={`text-xs font-semibold leading-tight ${active ? "text-[#0F766E]" : "text-neutral-600"}`}>{f.label}</span>
                                            <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">{f.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-neutral-400 mb-2">커스텀 — CSS font-family 이름을 직접 입력하세요. 예: &apos;Noto Sans KR&apos;, Georgia</p>
                            <div className="grid grid-cols-3 gap-2">
                                {customFonts.map((cf, idx) => {
                                    const key = `custom_${idx}`;
                                    const active = userFontFamily === key;
                                    return (
                                        <div
                                            key={idx}
                                            className={`rounded-lg border-2 transition-colors overflow-hidden ${
                                                active ? "border-[#0F766E]" : "border-neutral-200"
                                            }`}
                                        >
                                            <button
                                                onClick={() => { if (cf.trim()) applyUserFont(key); }}
                                                disabled={!cf.trim()}
                                                className={`w-full py-3 px-3 text-left transition-colors disabled:opacity-40 ${
                                                    active ? "bg-[#0F766E]/5" : "hover:bg-neutral-50"
                                                }`}
                                            >
                                                <span
                                                    className={`block text-xl mb-1 ${active ? "text-[#0F766E]" : "text-neutral-900"}`}
                                                    style={{ fontFamily: cf.trim() || undefined }}
                                                >
                                                    Aa
                                                </span>
                                                <span className={`block text-xs font-semibold leading-tight ${active ? "text-[#0F766E]" : "text-neutral-400"}`}>
                                                    커스텀 {idx + 1}
                                                </span>
                                            </button>
                                            <div className="px-2 pb-2">
                                                <input
                                                    type="text"
                                                    value={cf}
                                                    placeholder="font-family"
                                                    onChange={(e) => {
                                                        const next = [...customFonts];
                                                        next[idx] = e.target.value;
                                                        setCustomFonts(next);
                                                        localStorage.setItem("planners_custom_fonts", JSON.stringify(next));
                                                        if (userFontFamily === key) applyUserFont(key);
                                                    }}
                                                    className="w-full text-[10px] border border-neutral-200 rounded px-1.5 py-1 focus:outline-none focus:border-[#0F766E] bg-white text-neutral-700 placeholder:text-neutral-300"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">AI 비서</h2>
                    <div className="space-y-4">
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
                            const linkedProjectId = projectLinks[m.key];
                            const linkedProject = projects.find(p => p.id === linkedProjectId);
                            return (
                                <div
                                    key={m.key}
                                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                                        checked ? "border-neutral-200 hover:border-neutral-300" : "border-neutral-100 bg-neutral-50"
                                    }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${checked ? "text-neutral-900" : "text-neutral-400"}`}>{m.label}</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">{m.hint}</p>
                                        {checked && linkedProjectId && (
                                            <button
                                                onClick={() => linkProject(m.key, null)}
                                                className="mt-1 flex items-center gap-1 text-[10px] text-[#0F766E] hover:text-red-500 transition-colors"
                                                title="프로젝트 연결 해제"
                                            >
                                                <FolderOpen className="h-2.5 w-2.5" />
                                                {linkedProject ? linkedProject.title : "연결됨"} ×
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {checked && (
                                            <button
                                                onClick={() => openProjectPicker(m.key)}
                                                title="프로젝트와 연결"
                                                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                                                    linkedProjectId
                                                        ? "bg-[#0F766E]/10 text-[#0F766E] hover:bg-[#0F766E]/20"
                                                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                                                }`}
                                            >
                                                <FolderOpen className="h-3 w-3" />
                                                프로젝트화
                                            </button>
                                        )}
                                        <label className="cursor-pointer">
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
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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

                {/* 프로젝트화 모달 */}
                {projectPickerMetric && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-5 max-h-[80vh] flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-neutral-900">
                                    {METRIC_LABELS[projectPickerMetric] ?? projectPickerMetric} 프로젝트화
                                </h3>
                                <button onClick={() => { setProjectPickerMetric(null); setNewProjectTitle(""); }} className="p-1 rounded hover:bg-neutral-100">
                                    <X className="h-4 w-4 text-neutral-400" />
                                </button>
                            </div>
                            <p className="text-xs text-neutral-500 mb-4">
                                이 트래킹 항목을 연결할 프로젝트를 선택하거나 새로 만드세요.
                                Daily 트래킹 데이터가 해당 프로젝트 컨텍스트로 관리됩니다.
                            </p>

                            {/* 새 프로젝트 만들기 */}
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newProjectTitle}
                                    onChange={(e) => setNewProjectTitle(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") createAndLinkProject(projectPickerMetric); }}
                                    placeholder="새 프로젝트 이름 입력"
                                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0F766E]"
                                    autoFocus
                                />
                                <button
                                    onClick={() => createAndLinkProject(projectPickerMetric)}
                                    disabled={creatingProject || !newProjectTitle.trim()}
                                    className="flex items-center gap-1 px-3 py-2 bg-[#0F766E] text-white text-sm rounded-lg hover:bg-[#0d5e56] disabled:opacity-50 shrink-0"
                                >
                                    {creatingProject ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                                    만들기
                                </button>
                            </div>

                            {/* 기존 프로젝트 목록 */}
                            <div className="overflow-y-auto flex-1">
                                {projectsLoading ? (
                                    <div className="flex items-center justify-center py-6 text-neutral-400 text-sm">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> 불러오는 중…
                                    </div>
                                ) : projects.length === 0 ? (
                                    <p className="text-xs text-neutral-400 text-center py-4">
                                        진행 중인 프로젝트가 없습니다.<br />위에서 새로 만드세요.
                                    </p>
                                ) : (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2">기존 프로젝트 선택</p>
                                        {projects.map((p) => {
                                            const isLinked = projectLinks[projectPickerMetric] === p.id;
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => linkProject(projectPickerMetric, p.id)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors border ${
                                                        isLinked
                                                            ? "border-[#0F766E] bg-[#0F766E]/5 text-[#0F766E] font-medium"
                                                            : "border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                                                    }`}
                                                >
                                                    <FolderOpen className="h-4 w-4 shrink-0 text-neutral-400" />
                                                    <span className="flex-1 truncate">{p.title}</span>
                                                    {isLinked && <Check className="h-3.5 w-3.5 shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
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

                {/* 모바일 하단 메뉴 */}
                <MobileNavSection />

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
                <div className={`fixed bottom-20 md:bottom-6 right-6 z-[9000] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm transition-all ${
                    toastMsg.ok ? "bg-[#0F766E] text-white" : "bg-red-600 text-white"
                }`}>
                    {toastMsg.ok ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
                    {toastMsg.text}
                </div>
            )}
        </div>
    );
}

function MobileNavSection() {
    const [selected, setSelected] = useState<string[]>(MOBILE_NAV_DEFAULT);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(MOBILE_NAV_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length === 5) setSelected(parsed);
            }
        } catch {}
    }, []);

    function toggle(id: string) {
        setSelected(prev => {
            let next: string[];
            if (prev.includes(id)) {
                next = prev.filter(i => i !== id);
            } else {
                if (prev.length >= 5) return prev;
                next = [...prev, id];
            }
            localStorage.setItem(MOBILE_NAV_STORAGE_KEY, JSON.stringify(next));
            window.dispatchEvent(new CustomEvent("planners-mobile-nav-change"));
            return next;
        });
    }

    const full = selected.length >= 5;

    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-5 md:hidden">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xs uppercase tracking-widest text-neutral-400">하단 메뉴</h2>
                    <p className="text-[11px] text-neutral-400 mt-0.5">5개 선택 ({selected.length}/5)</p>
                </div>
                <button
                    onClick={() => {
                        setSelected(MOBILE_NAV_DEFAULT);
                        localStorage.setItem(MOBILE_NAV_STORAGE_KEY, JSON.stringify(MOBILE_NAV_DEFAULT));
                        window.dispatchEvent(new CustomEvent("planners-mobile-nav-change"));
                    }}
                    className="text-[11px] text-neutral-400 hover:text-[#0F766E] transition-colors"
                >
                    기본값으로
                </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {ALL_NAV_OPTIONS.map((opt: { id: string; label: string }) => {
                    const on = selected.includes(opt.id);
                    return (
                        <button
                            key={opt.id}
                            onClick={() => toggle(opt.id)}
                            disabled={!on && full}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                                on
                                    ? "bg-[#0F766E] text-white border-[#0F766E]"
                                    : full
                                    ? "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed"
                                    : "bg-white text-neutral-600 border-neutral-200 hover:border-[#0F766E] hover:text-[#0F766E]"
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${on ? "bg-white" : "bg-neutral-300"}`} />
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </section>
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
