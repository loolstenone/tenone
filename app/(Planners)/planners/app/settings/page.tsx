"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Settings, Loader2, Check, X, Briefcase, GraduationCap, FlaskConical, Palette, Code2, Clapperboard, TrendingUp, Map, Dumbbell, Rocket } from "lucide-react";
import type { PlannerMode, AiTone, PlannerRole } from "@/lib/planners/types";
import { PLANNER_ROLE_META } from "@/lib/planners/types";
import { ALL_NAV_OPTIONS, MOBILE_NAV_STORAGE_KEY, MOBILE_NAV_DEFAULT } from "@/features/planners/MobileBottomNav";
import { SettingsLayout, GroupMarker } from "@/features/planners/SettingsLayout";
import { SettingsTheme } from "@/features/planners/settings/SettingsTheme";
import { SettingsAi } from "@/features/planners/settings/SettingsAi";
import { SettingsNotifications } from "@/features/planners/settings/SettingsNotifications";
import { SettingsIntegrations } from "@/features/planners/settings/SettingsIntegrations";
import { SettingsExport } from "@/features/planners/settings/SettingsExport";

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

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState<PlannerMode>("weekly");
    const [morning, setMorning] = useState("08:00");
    const [evening, setEvening] = useState("21:00");
    const [sub, setSub] = useState<{ status: string; expires: string | null; is_pdf_buyer: boolean }>({ status: "free", expires: null, is_pdf_buyer: false });
    const [userRole, setUserRole] = useState<PlannerRole | null>(null);
    const [timeTracking, setTimeTracking] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ text: string; ok: boolean } | null>(null);

    // 자식 컴포넌트 초기값 — API 응답 후 loading guard 통과 시 이미 설정됨
    const [initialTone, setInitialTone] = useState<AiTone>("friendly");
    const [initialContextScope, setInitialContextScope] = useState<string[]>(["identity", "weekly", "monthly", "projects"]);
    const [initialTrackingMetrics, setInitialTrackingMetrics] = useState<string[]>([]);
    const [initialCountryPref, setInitialCountryPref] = useState<string[]>(["KR"]);
    const [initialEmail, setInitialEmail] = useState(true);
    const [initialPush, setInitialPush] = useState(false);
    const [initialPushSupported, setInitialPushSupported] = useState(false);
    const [initialPushPermission, setInitialPushPermission] = useState<NotificationPermission>("default");
    const [initialProjectLinks] = useState<Record<string, string | null>>(() => {
        if (typeof window === "undefined") return {};
        try { return JSON.parse(localStorage.getItem("planners_tracking_projects") || "{}"); }
        catch { return {}; }
    });

    const showToast = useCallback((text: string, ok = true) => {
        setToastMsg({ text, ok });
        setTimeout(() => setToastMsg(null), 3000);
    }, []);

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/planners/settings`);
            if (res.ok) {
                const d = await res.json();
                if (d.user) {
                    setMode(d.user.mode);
                    setTimeTracking(!!d.user.time_tracking);
                    if (d.user.user_role) setUserRole(d.user.user_role as PlannerRole);
                    setMorning(d.user.ai_morning_time?.slice(0, 5) || "08:00");
                    setEvening(d.user.ai_evening_time?.slice(0, 5) || "21:00");
                    setInitialTone(d.user.ai_tone || "friendly");
                    setInitialEmail(!!d.user.notify_email_briefing);
                    setInitialPush(!!d.user.notify_push_briefing);
                    if (d.user.ai_context_scope?.length) setInitialContextScope(d.user.ai_context_scope);
                    setInitialTrackingMetrics(Array.isArray(d.user.daily_tracking_metrics) ? d.user.daily_tracking_metrics : []);
                    setInitialCountryPref(Array.isArray(d.user.country_pref) && d.user.country_pref.length > 0 ? d.user.country_pref : ["KR"]);
                    setSub({
                        status: d.user.subscription_status || "free",
                        expires: d.user.subscription_expires_at || null,
                        is_pdf_buyer: !!d.user.is_pdf_buyer,
                    });
                }
            }
            // Push 지원 여부 확인
            if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
                setInitialPushSupported(true);
                setInitialPushPermission(Notification.permission);
            }
            setLoading(false);
        })();
    }, []);

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

    async function changeRole(key: PlannerRole | null) {
        setUserRole(key);
        await save({ user_role: key });
    }

    if (loading) {
        return <div className="max-w-3xl mx-auto px-6 py-12 text-center text-neutral-400 text-sm">로딩 중…</div>;
    }

    return (
        <SettingsLayout>
            <div className="flex items-center gap-3 mb-6">
                <Settings className="h-6 w-6 text-[#0F766E]" />
                <h1 className="font-serif text-3xl text-neutral-900">설정</h1>
                {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
            </div>

            {/* ── 전체 섹션 — SettingsLayout의 3열 그리드(사이드바+메인+Live Preview)가 처리 ── */}
            <div className="space-y-5 [&_section]:scroll-mt-32 [&_section]:lg:scroll-mt-24">

                {/* 01 시작 */}
                <GroupMarker group="start" no="01" label="시작" />

                {/* 사용 수준 */}
                <section id="sec-mode" className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">사용 수준</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {(["weekly", "all_in_one"] as PlannerMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={async () => { setMode(m); await save({ mode: m }); router.refresh(); }}
                                className={`py-3 px-3 rounded-lg text-sm transition-colors border-2 text-left ${
                                    mode === m
                                        ? "border-[#0F766E] bg-[#0F766E]/5 text-[#0F766E] font-semibold planners-dark:!bg-[#0F766E]/20 planners-dark:!text-[#5EEAD4] planners-dark:!border-[#5EEAD4]"
                                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 planners-dark:!bg-[#252525] planners-dark:!border-[#444] planners-dark:!text-neutral-300"
                                }`}
                            >
                                {m === "weekly" ? (
                                    <span>
                                        <span className="block font-semibold">Easy mode</span>
                                        <span className="block text-[11px] font-normal opacity-70 leading-snug mt-0.5">일간, 주간, 월간, 연간 스케줄 중심</span>
                                    </span>
                                ) : (
                                    <span>
                                        <span className="block font-semibold">All in one mode</span>
                                        <span className="block text-[11px] font-normal opacity-70 leading-snug mt-0.5">모든 기능 + 프로젝트, 캔버스, 템플릿까지 모두 사용</span>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-neutral-700">+ Time Tracking</p>
                                <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                                    시간 단위로 행동 데이터를 기록합니다.
                                    <br />
                                    ON 시 상단 메뉴에 <span className="font-medium text-[#0F766E]">「시간」</span> 탭이 노출됩니다.
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const next = !timeTracking;
                                    setTimeTracking(next);
                                    // 즉시 클라이언트 동기화 — AppTopNav가 listen
                                    localStorage.setItem("pp-time-tracking", next ? "1" : "0");
                                    window.dispatchEvent(new CustomEvent("pp-time-tracking-change", { detail: { enabled: next } }));
                                    await save({ time_tracking: next });
                                    router.refresh();
                                }}
                                className={`shrink-0 w-10 h-6 rounded-full transition-colors ${timeTracking ? "bg-[#0F766E]" : "bg-neutral-300 planners-dark:bg-[#3a3a3a]"}`}
                            >
                                <span className={`block w-4 h-4 !bg-white rounded-full shadow transition-transform mx-1 ${timeTracking ? "translate-x-4" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* 나의 역할 */}
                <section id="sec-role" className="bg-white border border-neutral-200 rounded-xl p-6">
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

                {/* 02 스타일 */}
                <SettingsTheme save={save} showToast={showToast} />

                {/* 03 기능 — AI + 알림 */}
                <SettingsAi
                    initialTone={initialTone}
                    initialContextScope={initialContextScope}
                    initialTrackingMetrics={initialTrackingMetrics}
                    initialCountryPref={initialCountryPref}
                    initialProjectLinks={initialProjectLinks}
                    save={save}
                    showToast={showToast}
                />
                <SettingsNotifications
                    initialEmail={initialEmail}
                    initialPush={initialPush}
                    initialPushSupported={initialPushSupported}
                    initialPushPermission={initialPushPermission}
                    save={save}
                    showToast={showToast}
                />

                {/* 04 기술 — 연동 */}
                <SettingsIntegrations showToast={showToast} />

                {/* 05 내보내기·구독 */}
                <SettingsExport sub={sub} showToast={showToast} />

                {/* 모바일 하단 메뉴 */}
                <MobileNavSection />

                {/* 변경사항 일괄 저장 */}
                <SaveAllBar
                    onSave={async () => {
                        await save({
                            mode,
                            ai_morning_time: morning + ":00",
                            ai_evening_time: evening + ":00",
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
        </SettingsLayout>
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
        } catch { /* ignore */ }
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
                    <h2 className="text-xs uppercase tracking-widest text-neutral-400">스마트폰 하단 메뉴</h2>
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
