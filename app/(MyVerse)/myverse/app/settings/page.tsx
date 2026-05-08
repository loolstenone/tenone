"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Settings, Loader2, Check, X, Briefcase, GraduationCap, FlaskConical, Palette, Code2, Clapperboard, TrendingUp, Map, Dumbbell, Rocket } from "lucide-react";
import type { PlannerMode, AiTone, PlannerRole, ActivityBase, CustomMenuKey } from "@/lib/myverse/types";
import { PLANNER_ROLE_META, CUSTOM_TOGGLE_KEYS } from "@/lib/myverse/types";
import { ALL_NAV_OPTIONS, MOBILE_NAV_STORAGE_KEY, MOBILE_NAV_DEFAULT } from "@/features/myverse/planner/MobileBottomNav";
import { SettingsLayout, GroupMarker } from "@/features/myverse/planner/SettingsLayout";
import { SettingsTheme } from "@/features/myverse/planner/settings/SettingsTheme";
import { SettingsAi } from "@/features/myverse/planner/settings/SettingsAi";
import { SettingsNotifications } from "@/features/myverse/planner/settings/SettingsNotifications";
import { SettingsIntegrations } from "@/features/myverse/planner/settings/SettingsIntegrations";
import { SettingsExport } from "@/features/myverse/planner/settings/SettingsExport";
import { SettingsBases } from "@/features/myverse/planner/settings/SettingsBases";

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
    const [customMenus, setCustomMenus] = useState<CustomMenuKey[]>(["weekly","monthly","yearly","contacts","canvas"]);
    const [toastMsg, setToastMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const [initialTone, setInitialTone] = useState<AiTone>("friendly");
    const [initialContextScope, setInitialContextScope] = useState<string[]>(["identity", "weekly", "monthly", "projects"]);
    const [initialTrackingMetrics, setInitialTrackingMetrics] = useState<string[]>([]);
    const [initialNoteShortcuts, setInitialNoteShortcuts] = useState<string[]>(["gratitude", "emotion"]);
    const [initialCountryPref, setInitialCountryPref] = useState<string[]>(["KR"]);
    const [initialEmail, setInitialEmail] = useState(true);
    const [initialPush, setInitialPush] = useState(false);
    const [initialPushSupported, setInitialPushSupported] = useState(false);
    const [initialPushPermission, setInitialPushPermission] = useState<NotificationPermission>("default");
    const [initialProjectLinks] = useState<Record<string, string | null>>(() => {
        if (typeof window === "undefined") return {};
        try { return JSON.parse(localStorage.getItem("myverse_tracking_projects") || "{}"); }
        catch { return {}; }
    });
    const [initialBases, setInitialBases] = useState<ActivityBase[]>([]);

    const showToast = useCallback((text: string, ok = true) => {
        setToastMsg({ text, ok });
        setTimeout(() => setToastMsg(null), 3000);
    }, []);

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/myverse/settings`);
            if (res.ok) {
                const d = await res.json();
                if (d.user) {
                    setMode(d.user.mode);
                    setTimeTracking(!!d.user.time_tracking);
                    if (Array.isArray(d.user.custom_menus)) setCustomMenus(d.user.custom_menus as CustomMenuKey[]);
                    if (d.user.user_role) setUserRole(d.user.user_role as PlannerRole);
                    setMorning(d.user.ai_morning_time?.slice(0, 5) || "08:00");
                    setEvening(d.user.ai_evening_time?.slice(0, 5) || "21:00");
                    setInitialTone(d.user.ai_tone || "friendly");
                    setInitialEmail(!!d.user.notify_email_briefing);
                    setInitialPush(!!d.user.notify_push_briefing);
                    if (d.user.ai_context_scope?.length) setInitialContextScope(d.user.ai_context_scope);
                    setInitialTrackingMetrics(Array.isArray(d.user.daily_tracking_metrics) ? d.user.daily_tracking_metrics : []);
                    setInitialNoteShortcuts(Array.isArray(d.user.daily_note_shortcuts) ? d.user.daily_note_shortcuts : ["gratitude", "emotion"]);
                    setInitialCountryPref(Array.isArray(d.user.country_pref) && d.user.country_pref.length > 0 ? d.user.country_pref : ["KR"]);
                    if (Array.isArray(d.user.activity_bases)) setInitialBases(d.user.activity_bases);
                    setSub({
                        status: d.user.subscription_status || "free",
                        expires: d.user.subscription_expires_at || null,
                        is_pdf_buyer: !!d.user.is_pdf_buyer,
                    });
                }
            }
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
            const res = await fetch(`/api/myverse/settings`, {
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
                <Settings className="h-6 w-6 text-[#6366F1]" />
                <h1 className="font-serif text-3xl text-neutral-900">설정</h1>
                {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
            </div>

            <div className="space-y-5 [&_section]:scroll-mt-32 [&_section]:lg:scroll-mt-24">

                <GroupMarker group="start" no="01" label="시작" />

                <section id="sec-mode" className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">사용 수준</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(["weekly", "all_in_one", "custom"] as PlannerMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={async () => {
                                    setMode(m);
                                    localStorage.setItem("pp-mode", m);
                                    window.dispatchEvent(new CustomEvent("pp-mode-change", { detail: { mode: m } }));
                                    await save({ mode: m });
                                    router.refresh();
                                }}
                                className={`py-3 px-3 rounded-lg text-sm transition-colors border-2 text-left ${
                                    mode === m
                                        ? "border-[#6366F1] bg-[#6366F1]/5 text-[#6366F1] font-semibold myverse-dark:!bg-[#6366F1]/20 myverse-dark:!text-[#A5B4FC] myverse-dark:!border-[#A5B4FC]"
                                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 myverse-dark:!bg-[#252525] myverse-dark:!border-[#444] myverse-dark:!text-neutral-300"
                                }`}
                            >
                                {m === "weekly" ? (
                                    <span>
                                        <span className="block font-semibold">Easy mode</span>
                                        <span className="block text-[11px] font-normal opacity-70 leading-snug mt-0.5">일간, 주간, 월간, 연간 스케줄 중심</span>
                                    </span>
                                ) : m === "all_in_one" ? (
                                    <span>
                                        <span className="block font-semibold">All in one mode</span>
                                        <span className="block text-[11px] font-normal opacity-70 leading-snug mt-0.5">모든 기능 + 프로젝트, 캔버스, 템플릿까지 모두 사용</span>
                                    </span>
                                ) : (
                                    <span>
                                        <span className="block font-semibold">직접 설정</span>
                                        <span className="block text-[11px] font-normal opacity-70 leading-snug mt-0.5">필요한 메뉴만 켜고 끄기</span>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    {mode === "custom" && (
                        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
                            <p className="text-[11px] text-neutral-400 leading-snug">
                                상단 메뉴에 노출할 항목을 선택하세요.
                                <br />
                                <span className="text-neutral-500">필수: 인덱스 · 일간 · 퍼스널 · 템플릿 · 커뮤니티</span>
                            </p>
                            {(CUSTOM_TOGGLE_KEYS).map((k) => {
                                const META: Record<CustomMenuKey, { label: string; desc: string }> = {
                                    weekly:   { label: "주간",   desc: "7일 세로 목록 + 좌 정보 패널 / 우 노트" },
                                    monthly:  { label: "월간",   desc: "월 그리드 + 공휴일 + 주차 링크 + 분석" },
                                    yearly:   { label: "연간",   desc: "12개월 + 분기 목표 + Anniversary" },
                                    time:     { label: "시간",   desc: "시간 단위 행동 데이터 기록 (Time Tracking)" },
                                    contacts: { label: "연락처", desc: "연락처 목록·그룹·검색·vCard 가져오기" },
                                    canvas:   { label: "캔버스", desc: "자유 손글씨·도형·이미지 무한 캔버스" },
                                };
                                const meta = META[k];
                                const isTime = k === "time";
                                const enabled = isTime ? timeTracking : customMenus.includes(k);
                                return (
                                    <div key={k} className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-neutral-700">{meta.label}</p>
                                            <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{meta.desc}</p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (isTime) {
                                                    const next = !timeTracking;
                                                    setTimeTracking(next);
                                                    localStorage.setItem("pp-time-tracking", next ? "1" : "0");
                                                    window.dispatchEvent(new CustomEvent("pp-time-tracking-change", { detail: { enabled: next } }));
                                                    await save({ time_tracking: next });
                                                    router.refresh();
                                                } else {
                                                    const next = enabled
                                                        ? customMenus.filter(x => x !== k)
                                                        : [...customMenus, k];
                                                    setCustomMenus(next);
                                                    localStorage.setItem("pp-custom-menus", JSON.stringify(next));
                                                    window.dispatchEvent(new CustomEvent("pp-custom-menus-change", { detail: { menus: next } }));
                                                    await save({ custom_menus: next });
                                                    router.refresh();
                                                }
                                            }}
                                            className={`shrink-0 w-10 h-6 rounded-full transition-colors ${enabled ? "bg-[#6366F1]" : "bg-neutral-300 myverse-dark:bg-[#3a3a3a]"}`}
                                        >
                                            <span className={`block w-4 h-4 !bg-white rounded-full shadow transition-transform mx-1 ${enabled ? "translate-x-4" : "translate-x-0"}`} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {mode !== "custom" && (
                        <div className="mt-4 pt-4 border-t border-neutral-100">
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-neutral-700">+ Time Tracking</p>
                                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                                        시간 단위로 행동 데이터를 기록합니다.
                                        <br />
                                        ON 시 상단 메뉴에 <span className="font-medium text-[#6366F1]">「시간」</span> 탭이 노출됩니다.
                                    </p>
                                </div>
                                <button
                                    onClick={async () => {
                                        const next = !timeTracking;
                                        setTimeTracking(next);
                                        localStorage.setItem("pp-time-tracking", next ? "1" : "0");
                                        window.dispatchEvent(new CustomEvent("pp-time-tracking-change", { detail: { enabled: next } }));
                                        await save({ time_tracking: next });
                                        router.refresh();
                                    }}
                                    className={`shrink-0 w-10 h-6 rounded-full transition-colors ${timeTracking ? "bg-[#6366F1]" : "bg-neutral-300 myverse-dark:bg-[#3a3a3a]"}`}
                                >
                                    <span className={`block w-4 h-4 !bg-white rounded-full shadow transition-transform mx-1 ${timeTracking ? "translate-x-4" : "translate-x-0"}`} />
                                </button>
                            </div>
                        </div>
                    )}
                </section>

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
                                            ? "border-[#6366F1] bg-[#6366F1]/5"
                                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#6366F1]" : "text-neutral-400"}`} />
                                    <div className="min-w-0">
                                        <p className={`text-xs font-semibold truncate ${active ? "text-[#6366F1]" : "text-neutral-700"}`}>
                                            {meta.label}
                                        </p>
                                        <p className="text-[10px] text-neutral-400 truncate">{meta.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <SettingsTheme save={save} showToast={showToast} />

                <SettingsAi
                    initialTone={initialTone}
                    initialContextScope={initialContextScope}
                    initialTrackingMetrics={initialTrackingMetrics}
                    initialNoteShortcuts={initialNoteShortcuts}
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

                <SettingsIntegrations
                    showToast={showToast}
                    afterLocationSlot={
                        <SettingsBases
                            initialBases={initialBases}
                            save={save}
                            showToast={showToast}
                        />
                    }
                />

                <SettingsExport sub={sub} showToast={showToast} />

                <MobileNavSection />

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

            {toastMsg && (
                <div className={`fixed bottom-20 md:bottom-6 right-6 z-[9000] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm transition-all ${
                    toastMsg.ok ? "bg-[#6366F1] text-white" : "bg-red-600 text-white"
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
            window.dispatchEvent(new CustomEvent("myverse-mobile-nav-change"));
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
                        window.dispatchEvent(new CustomEvent("myverse-mobile-nav-change"));
                    }}
                    className="text-[11px] text-neutral-400 hover:text-[#6366F1] transition-colors"
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
                                    ? "bg-[#6366F1] text-white border-[#6366F1]"
                                    : full
                                    ? "bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed"
                                    : "bg-white text-neutral-600 border-neutral-200 hover:border-[#6366F1] hover:text-[#6366F1]"
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
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-sm font-medium hover:bg-[#4F46E5] disabled:opacity-50"
            >
                {saving ? "저장 중…" : "전체 저장"}
            </button>
        </div>
    );
}
