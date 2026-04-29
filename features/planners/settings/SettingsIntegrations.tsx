"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Check, Link as LinkIcon, Unplug, RefreshCw } from "lucide-react";
import { GroupMarker } from "@/features/planners/SettingsLayout";

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface Integration {
    id: string;
    provider: string;
    status: string;
    external_email: string | null;
    external_name: string | null;
    last_sync_at: string | null;
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

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
    showToast: (text: string, ok?: boolean) => void;
}

// ── SettingsIntegrations ───────────────────────────────────────────────────────

export function SettingsIntegrations({ showToast }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 연동 목록
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [syncing, setSyncing]           = useState<string | null>(null);
    const [pendingDisconnect, setPendingDisconnect] = useState<string | null>(null);
    const [disconnecting, setDisconnecting]         = useState(false);

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
        // 연동 목록 로드
        fetch("/api/planners/integrations")
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
        const r = await fetch("/api/planners/integrations");
        if (r.ok) {
            const d = await r.json();
            setIntegrations(d.integrations || []);
        }
    }

    // ── Google Calendar ────────────────────────────────────────────────────────

    async function syncGoogle() {
        setSyncing("google_calendar");
        try {
            const res = await fetch("/api/planners/integrations/google/sync", { method: "POST" });
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
            const res = await fetch("/api/planners/integrations/todoist/sync", { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                showToast(`${d.imported}개 태스크 import 완료`);
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
            const res = await fetch("/api/planners/integrations/todoist/connect", {
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
            const res = await fetch("/api/planners/integrations/notion/sync", { method: "POST" });
            if (res.ok) {
                const d = await res.json();
                showToast(`${d.imported}개 태스크 import 완료`);
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
            const res = await fetch("/api/planners/integrations/notion/connect", {
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
            const res = await fetch("/api/planners/integrations/slack/sync", { method: "POST" });
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
            const res = await fetch("/api/planners/integrations/slack/connect", {
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
            const res = await fetch("/api/planners/integrations/ical/sync", { method: "POST" });
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
            const res = await fetch("/api/planners/integrations/ical/connect", {
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
            await fetch("/api/planners/integrations", {
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
                        connectHref="/api/planners/integrations/google/connect"
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
                        desc="오늘의 Todoist 태스크를 Daily로 import"
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
                        desc="Notion DB의 미완료 태스크를 Daily로 import"
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

            {/* ── Todoist 모달 ── */}
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
                            onChange={e => setTodoistToken(e.target.value)}
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
        </>
    );
}
