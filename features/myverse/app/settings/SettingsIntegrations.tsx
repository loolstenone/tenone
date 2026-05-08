"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Check, Link as LinkIcon, Unplug, RefreshCw, MapPin, ChevronDown, Cloud, Sun, Clock, Navigation, Mic, MicOff, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GroupMarker } from "@/features/myverse/app/SettingsLayout";
import { PermissionGuideModal } from "@/features/myverse/app/PermissionGuideModal";

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface Integration {
    id: string;
    provider: string;
    status: string;
    external_email: string | null;
    external_name: string | null;
    last_sync_at: string | null;
}

// ── LocationServiceList ────────────────────────────────────────────────────────

const LOCATION_SERVICES = [
    {
        icon: Cloud,
        name: "날씨",
        desc: "오늘 날짜 상단에 현재 날씨 카드 자동 표시",
        stats: ["기온 / 체감온도", "날씨 아이콘 (맑음·흐림·비·눈)", "습도 · 풍속", "강수확률 · UV지수"],
        source: "Open-Meteo",
        status: "active" as const,
    },
    {
        icon: Sun,
        name: "일출 / 일몰",
        desc: "시간 트래킹 우측 패널에 오늘의 일출·일몰 시각 표시",
        stats: ["일출 시각 (현지 기준)", "일몰 시각 (현지 기준)"],
        source: "Open-Meteo",
        status: "active" as const,
    },
    {
        icon: Clock,
        name: "타임존 자동 감지",
        desc: "다른 지역 접속 시 일간 헤더에서 홈 타임존 변경 제안",
        stats: ["브라우저 Intl API 기반 감지", "변경 클릭 시 홈 타임존 저장"],
        source: "Intl API",
        status: "active" as const,
    },
    {
        icon: MapPin,
        name: "장소 태깅",
        desc: "시간 트래킹 입력 시 「장소」 버튼 → 현재 위치명·도로 자동 채움",
        stats: [
            "활동 입력란: 도로명+번지 또는 동/구 자동",
            "메모 입력란: 도시+도로 보강",
            "권한 거부 시 단계별 복구 가이드 모달 자동 안내",
            "장소별 통계 누적은 향후 단계",
        ],
        source: "OpenStreetMap (Nominatim)",
        status: "active" as const,
    },
] satisfies { icon: LucideIcon; name: string; desc: string; stats: string[]; source: string; status: "active" | "soon" | "planned" }[];

function LocationServiceList() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="divide-y divide-neutral-100">
            {LOCATION_SERVICES.map((s, i) => {
                const open = openIndex === i;
                return (
                    <div key={s.name}>
                        <button
                            onClick={() => setOpenIndex(open ? null : i)}
                            className="w-full flex items-center gap-3 py-3 text-left"
                        >
                            {(() => { const Icon = s.icon; return <Icon className="h-4 w-4 text-neutral-400 shrink-0" />; })()}
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-900">{s.name}</span>
                                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
                                    s.status === "active"
                                        ? "bg-[#6366F1]/10 text-[#6366F1]"
                                        : s.status === "soon"
                                        ? "bg-neutral-100 text-neutral-500"
                                        : "bg-neutral-100 text-neutral-400"
                                }`}>
                                    {s.status === "active" ? "활성" : s.status === "soon" ? "개발 중" : "예정"}
                                </span>
                            </div>
                            <ChevronDown
                                className={`h-3.5 w-3.5 text-neutral-300 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                            />
                        </button>
                        {open && (
                            <div className="pb-3 pl-9">
                                <p className="text-xs text-neutral-500 mb-2">{s.desc}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-2">
                                    {s.stats.map(stat => (
                                        <span key={stat} className="text-[11px] text-neutral-400 flex items-center gap-1">
                                            <span className="inline-block w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
                                            {stat}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[10px] text-neutral-300">데이터: {s.source}</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── IntegrationRow ─────────────────────────────────────────────────────────────

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
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#6366F1]/10 text-[#6366F1] rounded">
                            Connected
                        </span>
                    )}
                </div>
                {connected && integration?.external_email ? (
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {integration.external_email}
                        {integration.last_sync_at && (
                            <span className="text-neutral-400 ml-2">
                                · Last synced{" "}
                                {new Date(integration.last_sync_at).toLocaleString("ko-KR", {
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
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
                            {syncing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <RefreshCw className="h-3 w-3" />
                            )}
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
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg text-xs hover:bg-[#4F46E5] transition-colors"
                    >
                        <LinkIcon className="h-3 w-3" /> Connect
                    </button>
                ) : (
                    <a
                        href={connectHref}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg text-xs hover:bg-[#4F46E5] transition-colors"
                    >
                        <LinkIcon className="h-3 w-3" /> Connect
                    </a>
                )}
            </div>
        </div>
    );
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
    showToast: (text: string, ok?: boolean) => void;
    /** 위치 서비스 섹션 직후에 인접 렌더할 콘텐츠 (예: 활동 거점) */
    afterLocationSlot?: React.ReactNode;
}

// ── SettingsIntegrations ───────────────────────────────────────────────────────

export function SettingsIntegrations({ showToast, afterLocationSlot }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 연동 목록
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [syncing, setSyncing]           = useState<string | null>(null);
    const [pendingDisconnect, setPendingDisconnect] = useState<string | null>(null);
    const [disconnecting, setDisconnecting]         = useState(false);

    // 위치 서비스
    const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);
    const [locationEnabled, setLocationEnabled]       = useState(false);
    const [locationLoading, setLocationLoading]       = useState(false);

    // 마이크 권한 (음성 메모·노트 녹음 기능에서 사용)
    const [micPermission, setMicPermission] = useState<PermissionState | null>(null);
    const [micLoading, setMicLoading]       = useState(false);
    const [micSupported, setMicSupported]   = useState<boolean | null>(null);

    // 권한 복구 가이드 모달 — denied 상태에서 사용자가 다시 켜도록 안내
    const [permGuide, setPermGuide] = useState<null | "geolocation" | "microphone">(null);

    // 모달 상태
    const [todoistModal, setTodoistModal] = useState(false);
    const [todoistToken, setTodoistToken] = useState("");
    const [todoistSubmit, setTodoistSubmit] = useState(false);

    const [notionModal, setNotionModal] = useState(false);
    const [notionToken, setNotionToken] = useState("");
    const [notionSubmit, setNotionSubmit] = useState(false);

    const [slackModal, setSlackModal]     = useState(false);
    const [slackWebhook, setSlackWebhook] = useState("");
    const [slackSubmit, setSlackSubmit]   = useState(false);

    const [icalModal, setIcalModal] = useState(false);
    const [icalUrl, setIcalUrl]     = useState("");
    const [icalSubmit, setIcalSubmit] = useState(false);

    // ── 초기화: 연동 목록 + URL 쿼리 토스트 ──────────────────────────────────

    useEffect(() => {
        // 위치 권한 상태 초기화
        if (typeof navigator !== "undefined" && navigator.permissions) {
            navigator.permissions.query({ name: "geolocation" as PermissionName }).then(result => {
                setLocationPermission(result.state);
                result.onchange = () => setLocationPermission(result.state as PermissionState);
            }).catch(() => {});
        }

        // 마이크 — Web Speech API & getUserMedia 지원 여부
        if (typeof window !== "undefined") {
            const speechOK = !!(window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
                || !!(window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
            const mediaOK = !!navigator.mediaDevices?.getUserMedia;
            setMicSupported(speechOK || mediaOK);
        }
        // 마이크 권한 상태 — 일부 브라우저(Firefox)는 microphone permission API 미지원
        if (typeof navigator !== "undefined" && navigator.permissions) {
            navigator.permissions.query({ name: "microphone" as PermissionName }).then(result => {
                setMicPermission(result.state);
                result.onchange = () => setMicPermission(result.state as PermissionState);
            }).catch(() => {});
        }

        // 위치 서비스 선호도 로드
        fetch("/api/myverse/settings")
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.user?.location_enabled) setLocationEnabled(true); });

        // 연동 목록 로드
        fetch("/api/myverse/integrations")
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setIntegrations(d.integrations || []); });

        // Google OAuth 콜백 결과 토스트
        const googleStatus = searchParams.get("google");
        if (googleStatus === "connected") {
            showToast("Google Calendar 연결 완료");
            // URL 쿼리 제거
            const url = new URL(window.location.href);
            url.searchParams.delete("google");
            router.replace(url.pathname + (url.search || ""), { scroll: false });
        } else if (googleStatus === "error") {
            showToast("Google Calendar 연결 실패", false);
            const url = new URL(window.location.href);
            url.searchParams.delete("google");
            router.replace(url.pathname + (url.search || ""), { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── 헬퍼: 연동 목록 새로고침 ──────────────────────────────────────────────

    async function reloadIntegrations() {
        const r = await fetch("/api/myverse/integrations");
        if (r.ok) {
            const d = await r.json();
            setIntegrations(d.integrations || []);
        }
    }

    // ── 위치 서비스 ───────────────────────────────────────────────────────────────

    async function requestLocation() {
        setLocationLoading(true);
        try {
            await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            setLocationPermission("granted");
            await fetch("/api/myverse/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ location_enabled: true }),
            });
            setLocationEnabled(true);
            showToast("위치 서비스 허용됨");
        } catch {
            if (locationPermission !== "granted") setLocationPermission("denied");
            showToast("위치 접근이 거부되었습니다", false);
        } finally {
            setLocationLoading(false);
        }
    }

    async function toggleLocation(next: boolean) {
        await fetch("/api/myverse/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ location_enabled: next }),
        });
        setLocationEnabled(next);
        showToast(next ? "위치 서비스 활성화됨" : "위치 서비스 비활성화됨");
    }

    // ── 마이크 권한 ────────────────────────────────────────────────────────────────

    async function requestMicrophone() {
        if (!navigator.mediaDevices?.getUserMedia) {
            showToast("이 브라우저는 마이크 접근을 지원하지 않습니다", false);
            return;
        }
        setMicLoading(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // 권한 확인 즉시 stream을 닫음 — 실제 녹음은 음성 버튼에서 다시 요청
            stream.getTracks().forEach(t => t.stop());
            setMicPermission("granted");
            showToast("마이크 권한 허용됨");
        } catch (e: unknown) {
            const err = e as { name?: string };
            if (err.name === "NotAllowedError") {
                setMicPermission("denied");
                showToast("마이크 권한이 거부되었습니다", false);
            } else if (err.name === "NotFoundError") {
                showToast("마이크를 찾을 수 없습니다", false);
            } else {
                showToast("마이크 접근 오류", false);
            }
        } finally {
            setMicLoading(false);
        }
    }

    // ── Google Calendar ────────────────────────────────────────────────────────

    async function syncGoogle() {
        setSyncing("google_calendar");
        try {
            const res = await fetch("/api/myverse/integrations/google/sync", { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                showToast(`${d.synced}개 이벤트 동기화 완료`);
                await reloadIntegrations();
            } else {
                const d = await res.json();
                showToast(`동기화 실패: ${d.error}`, false);
            }
        } finally { setSyncing(null); }
    }

    // ── Todoist ───────────────────────────────────────────────────────────────

    async function syncTodoist() {
        setSyncing("todoist");
        try {
            const res = await fetch("/api/myverse/integrations/todoist/sync", { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                showToast(`${d.imported}개 할 일 가져오기 완료`);
                await reloadIntegrations();
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
            const res = await fetch("/api/myverse/integrations/todoist/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: todoistToken.trim() }),
            });
            if (res.ok) {
                setTodoistModal(false);
                setTodoistToken("");
                await reloadIntegrations();
            } else {
                const d = await res.json();
                showToast(`연결 실패: ${d.error}`, false);
            }
        } finally { setTodoistSubmit(false); }
    }

    // ── Notion ────────────────────────────────────────────────────────────────

    async function syncNotion() {
        setSyncing("notion");
        try {
            const res = await fetch("/api/myverse/integrations/notion/sync", { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                showToast(`${d.imported}개 할 일 가져오기 완료`);
                await reloadIntegrations();
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
            const res = await fetch("/api/myverse/integrations/notion/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: notionToken.trim() }),
            });
            if (res.ok) {
                setNotionModal(false);
                setNotionToken("");
                await reloadIntegrations();
            } else {
                const d = await res.json();
                showToast(`연결 실패: ${d.error}`, false);
            }
        } finally { setNotionSubmit(false); }
    }

    // ── Slack ─────────────────────────────────────────────────────────────────

    async function syncSlack() {
        setSyncing("slack");
        try {
            const res = await fetch("/api/myverse/integrations/slack/sync", { method: "POST" });
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
            const res = await fetch("/api/myverse/integrations/slack/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ webhook_url: slackWebhook.trim() }),
            });
            if (res.ok) {
                setSlackModal(false);
                setSlackWebhook("");
                await reloadIntegrations();
            } else {
                const d = await res.json();
                showToast(`연결 실패: ${d.error}`, false);
            }
        } finally { setSlackSubmit(false); }
    }

    // ── iCal ──────────────────────────────────────────────────────────────────

    async function syncIcal() {
        setSyncing("ical");
        try {
            const res = await fetch("/api/myverse/integrations/ical/sync", { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                showToast(`${d.synced}개 이벤트 동기화 완료`);
                await reloadIntegrations();
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
            const res = await fetch("/api/myverse/integrations/ical/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feed_url: icalUrl.trim() }),
            });
            if (res.ok) {
                const d = await res.json();
                setIcalModal(false);
                setIcalUrl("");
                showToast(`연결 완료. ${d.eventCount ?? 0}개 이벤트 확인됨`);
                await reloadIntegrations();
            } else {
                const d = await res.json();
                showToast(`연결 실패: ${d.error}`, false);
            }
        } finally { setIcalSubmit(false); }
    }

    // ── Disconnect ────────────────────────────────────────────────────────────

    function disconnectIntegration(provider: string) {
        setPendingDisconnect(provider);
    }

    async function confirmDisconnect(provider: string) {
        setPendingDisconnect(null);
        setDisconnecting(true);
        try {
            await fetch("/api/myverse/integrations", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider }),
            });
            setIntegrations(prev => prev.filter(i => i.provider !== provider));
            showToast("연결 해제 완료");
        } finally { setDisconnecting(false); }
    }

    // ── JSX ───────────────────────────────────────────────────────────────────

    return (
        <>
            <GroupMarker group="tech" no="04" label="기술" />

            {/* 외부 연동 */}
            <section id="sec-integrations" className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-neutral-900 mb-4">
                    외부 연동
                    {disconnecting && (
                        <Loader2 className="inline-block ml-2 h-3.5 w-3.5 animate-spin text-neutral-400" />
                    )}
                </h2>
                <div className="space-y-3">
                    <IntegrationRow
                        name="Google Calendar"
                        desc="구글 캘린더 일정을 Monthly·Weekly·Today에 자동 유입"
                        integration={integrations.find(i => i.provider === "google_calendar" && i.status === "active")}
                        connectHref="/api/myverse/integrations/google/connect"
                        onSync={syncGoogle}
                        onDisconnect={() => disconnectIntegration("google_calendar")}
                        syncing={syncing === "google_calendar"}
                        pendingConfirm={pendingDisconnect === "google_calendar"}
                        onConfirm={() => confirmDisconnect("google_calendar")}
                        onCancel={() => setPendingDisconnect(null)}
                    />
                    <div className="pt-2 border-t border-neutral-100" />
                    <IntegrationRow
                        name="Todoist"
                        desc="오늘의 Todoist 할 일을 플래너로 가져오기"
                        integration={integrations.find(i => i.provider === "todoist" && i.status === "active")}
                        connectHref="#"
                        onConnectClick={() => setTodoistModal(true)}
                        onSync={syncTodoist}
                        onDisconnect={() => disconnectIntegration("todoist")}
                        syncing={syncing === "todoist"}
                        pendingConfirm={pendingDisconnect === "todoist"}
                        onConfirm={() => confirmDisconnect("todoist")}
                        onCancel={() => setPendingDisconnect(null)}
                    />
                    <div className="pt-2 border-t border-neutral-100" />
                    <IntegrationRow
                        name="Notion"
                        desc="Notion의 미완료 할 일을 플래너로 가져오기"
                        integration={integrations.find(i => i.provider === "notion" && i.status === "active")}
                        connectHref="#"
                        onConnectClick={() => setNotionModal(true)}
                        onSync={syncNotion}
                        onDisconnect={() => disconnectIntegration("notion")}
                        syncing={syncing === "notion"}
                        pendingConfirm={pendingDisconnect === "notion"}
                        onConfirm={() => confirmDisconnect("notion")}
                        onCancel={() => setPendingDisconnect(null)}
                    />
                    <div className="pt-2 border-t border-neutral-100" />
                    <IntegrationRow
                        name="Slack"
                        desc="아침·저녁 브리핑을 Slack 채널로 자동 전송"
                        integration={integrations.find(i => i.provider === "slack" && i.status === "active")}
                        connectHref="#"
                        onConnectClick={() => setSlackModal(true)}
                        onSync={syncSlack}
                        onDisconnect={() => disconnectIntegration("slack")}
                        syncing={syncing === "slack"}
                        pendingConfirm={pendingDisconnect === "slack"}
                        onConfirm={() => confirmDisconnect("slack")}
                        onCancel={() => setPendingDisconnect(null)}
                    />
                    <div className="pt-2 border-t border-neutral-100" />
                    <IntegrationRow
                        name="Apple Calendar / Outlook (iCal)"
                        desc="iCal 구독 피드로 일정을 Monthly·Weekly·Today에 유입"
                        integration={integrations.find(i => i.provider === "ical" && i.status === "active")}
                        connectHref="#"
                        onConnectClick={() => setIcalModal(true)}
                        onSync={syncIcal}
                        onDisconnect={() => disconnectIntegration("ical")}
                        syncing={syncing === "ical"}
                        pendingConfirm={pendingDisconnect === "ical"}
                        onConfirm={() => confirmDisconnect("ical")}
                        onCancel={() => setPendingDisconnect(null)}
                    />
                </div>
            </section>

            {/* 위치 서비스 */}
            <section id="sec-location" className="bg-white border border-neutral-200 rounded-xl p-6 mt-4">
                <div className="flex items-start gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                        <h2 className="text-sm font-semibold text-neutral-900">위치 서비스</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            현재 위치를 기반으로 날씨·일출일몰·타임존을 자동 설정합니다
                        </p>
                    </div>
                </div>

                {/* 권한 상태 + 컨트롤 */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-neutral-900">위치 접근</p>
                        {locationPermission === "denied" ? (
                            <p className="text-xs text-rose-500 mt-0.5">
                                브라우저에서 위치 권한이 차단됨 — 가이드를 따라 다시 허용해 주세요
                            </p>
                        ) : locationPermission === "granted" ? (
                            <p className="text-xs text-[#6366F1] mt-0.5">✓ 브라우저 권한 허용됨</p>
                        ) : (
                            <p className="text-xs text-neutral-500 mt-0.5">
                                허용 시 날씨·일출·타임존이 자동으로 채워집니다
                            </p>
                        )}
                    </div>

                    {locationPermission === "denied" ? (
                        <button
                            onClick={() => setPermGuide("geolocation")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg text-xs hover:bg-[#4F46E5] transition-colors"
                        >
                            <ShieldAlert className="h-3 w-3 text-rose-200" />
                            권한 다시 켜기
                        </button>
                    ) : locationPermission === "granted" ? (
                        <button
                            onClick={() => toggleLocation(!locationEnabled)}
                            className={`shrink-0 relative w-10 h-6 rounded-full transition-colors ${
                                locationEnabled ? "bg-[#6366F1]" : "bg-neutral-300 myverse-dark:bg-white/15"
                            }`}
                        >
                            <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] !bg-white rounded-full shadow-sm transition-transform ${
                                locationEnabled ? "translate-x-4" : "translate-x-0"
                            }`} />
                        </button>
                    ) : (
                        <button
                            onClick={requestLocation}
                            disabled={locationLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg text-xs hover:bg-[#4F46E5] transition-colors disabled:opacity-50"
                        >
                            {locationLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <MapPin className="h-3 w-3" />
                            )}
                            위치 허용하기
                        </button>
                    )}
                </div>

                {/* 서비스 목록 — 항상 노출 (미허용 시 미리보기) */}
                <div className={`mt-5 pt-4 border-t border-neutral-100 ${
                    !(locationPermission === "granted" && locationEnabled) ? "opacity-50" : ""
                }`}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                            제공 데이터
                        </p>
                        {!(locationPermission === "granted" && locationEnabled) && (
                            <span className="text-[10px] text-neutral-400">위치 허용 후 활성화</span>
                        )}
                    </div>
                    <LocationServiceList />
                </div>
            </section>

            {afterLocationSlot}

            {/* ── 마이크 / 음성 녹음 ───────────────────────────────────────── */}
            <section id="sec-microphone" className="bg-white border border-neutral-200 rounded-xl p-6 mt-4">
                <div className="flex items-start gap-2 mb-4">
                    <Mic className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                        <h2 className="text-sm font-semibold text-neutral-900">마이크 / 음성 녹음</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            음성 메모와 노트 녹음 기능에서 사용. 일간 페이지의 「녹음」 버튼·노트 카드 🎤 아이콘
                        </p>
                    </div>
                </div>

                {/* 권한 상태 + 컨트롤 */}
                <div className="flex items-start justify-between">
                    <div className="min-w-0">
                        <p className="text-sm text-neutral-900">마이크 접근</p>
                        {micSupported === false ? (
                            <p className="text-xs text-red-500 mt-0.5">
                                이 브라우저는 음성 녹음을 지원하지 않습니다
                                <br />
                                <span className="text-neutral-400">Chrome · Edge · Safari 권장 (Firefox는 미지원)</span>
                            </p>
                        ) : micPermission === "denied" ? (
                            <p className="text-xs text-rose-500 mt-0.5">
                                브라우저에서 마이크 권한이 차단됨 — 가이드를 따라 다시 허용해 주세요
                            </p>
                        ) : micPermission === "granted" ? (
                            <p className="text-xs text-[#6366F1] mt-0.5">✓ 브라우저 권한 허용됨</p>
                        ) : (
                            <p className="text-xs text-neutral-500 mt-0.5">
                                녹음 시작 시 브라우저가 권한을 요청합니다
                            </p>
                        )}
                    </div>

                    {micSupported === false ? (
                        <span className="shrink-0 text-[10px] px-2 py-1 bg-red-50 text-red-500 rounded-lg flex items-center gap-1">
                            <MicOff className="h-3 w-3" />
                            지원 안 됨
                        </span>
                    ) : micPermission === "denied" ? (
                        <button
                            onClick={() => setPermGuide("microphone")}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg text-xs hover:bg-[#4F46E5] transition-colors"
                        >
                            <ShieldAlert className="h-3 w-3 text-rose-200" />
                            권한 다시 켜기
                        </button>
                    ) : micPermission === "granted" ? (
                        <span className="shrink-0 text-[10px] px-2 py-1 bg-[#6366F1]/10 text-[#6366F1] rounded-lg flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            허용됨
                        </span>
                    ) : (
                        <button
                            onClick={requestMicrophone}
                            disabled={micLoading}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg text-xs hover:bg-[#4F46E5] transition-colors disabled:opacity-50"
                        >
                            {micLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3 w-3" />}
                            마이크 허용하기
                        </button>
                    )}
                </div>

                {/* 사용처 */}
                <div className="mt-5 pt-4 border-t border-neutral-100">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-2">사용처</p>
                    <ul className="space-y-1 text-xs text-neutral-600">
                        <li className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-neutral-400" />
                            <span>일간 노트 도구 — 「녹음」 버튼 (새 음성 메모 노트 생성)</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-neutral-400" />
                            <span>각 노트 카드 헤더 🎤 — 기존 노트에 음성 텍스트 추가</span>
                        </li>
                    </ul>
                    <p className="text-[10px] text-neutral-400 mt-3 leading-relaxed">
                        Web Speech API(ko-KR)로 음성을 텍스트로 변환합니다. 오디오 파일은 저장하지 않으며 텍스트만 노트에 보관됩니다.
                    </p>
                </div>
            </section>

            {/* ── Todoist 모달 ── */}
            {todoistModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-5">
                        <h3 className="font-semibold text-neutral-900 mb-2">Todoist 연결</h3>
                        <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                            Todoist 앱 → 설정 → 연동 → 개발자 → API 토큰을 복사해 아래에 붙여넣기
                        </p>
                        <input
                            type="text"
                            value={todoistToken}
                            onChange={e => setTodoistToken(e.target.value)}
                            placeholder="API 토큰을 여기에 붙여넣기"
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#6366F1]"
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
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6366F1] text-white text-sm rounded-lg hover:bg-[#4F46E5] disabled:opacity-50"
                            >
                                {todoistSubmit ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                                연결
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Notion 모달 ── */}
            {notionModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-5">
                        <h3 className="font-semibold text-neutral-900 mb-2">Notion 연결</h3>
                        <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                            Notion 설정 → 연동 → API 통합 → 새 통합 만들기 → Internal Integration Token 복사 후
                            붙여넣기. 연결 후 원하는 DB 페이지에서 &quot;연결 추가&quot;로 통합을 허용해 주세요.
                        </p>
                        <input
                            type="text"
                            value={notionToken}
                            onChange={e => setNotionToken(e.target.value)}
                            placeholder="secret_..."
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#6366F1]"
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
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6366F1] text-white text-sm rounded-lg hover:bg-[#4F46E5] disabled:opacity-50"
                            >
                                {notionSubmit ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                                연결
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Slack 모달 ── */}
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
                            onChange={e => setSlackWebhook(e.target.value)}
                            placeholder="https://hooks.slack.com/services/..."
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#6366F1]"
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
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6366F1] text-white text-sm rounded-lg hover:bg-[#4F46E5] disabled:opacity-50"
                            >
                                {slackSubmit ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                                연결
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── iCal 모달 ── */}
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
                            onChange={e => setIcalUrl(e.target.value)}
                            placeholder="webcal:// 또는 https://..."
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#6366F1]"
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
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6366F1] text-white text-sm rounded-lg hover:bg-[#4F46E5] disabled:opacity-50"
                            >
                                {icalSubmit ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                                연결
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 권한 복구 가이드 — denied 상태에서 사용자가 직접 허용하도록 단계별 안내 */}
            <PermissionGuideModal
                open={permGuide !== null}
                onClose={() => setPermGuide(null)}
                permission={permGuide ?? "geolocation"}
                onRetry={async () => {
                    if (permGuide === "geolocation") await requestLocation();
                    else if (permGuide === "microphone") await requestMicrophone();
                }}
                onGranted={() => {
                    if (permGuide === "geolocation") {
                        setLocationPermission("granted");
                        showToast("위치 권한이 허용되었습니다");
                    } else if (permGuide === "microphone") {
                        setMicPermission("granted");
                        showToast("마이크 권한이 허용되었습니다");
                    }
                }}
            />
        </>
    );
}
