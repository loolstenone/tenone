"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Briefcase, GraduationCap, FlaskConical, Palette, Code2, Clapperboard, TrendingUp, Map, Dumbbell, Rocket } from "lucide-react";
import type { PlannerMode, PlannerRole, CustomMenuKey } from "@/lib/myverse/types";
import { PLANNER_ROLE_META, CUSTOM_TOGGLE_KEYS } from "@/lib/myverse/types";
import { SettingsLayout } from "@/features/myverse/planner/SettingsLayout";
import { useSettingsSave } from "@/features/myverse/planner/settings/useSettingsSave";

const ROLE_ICONS: Record<PlannerRole, React.ElementType> = {
    office_worker: Briefcase, student: GraduationCap, researcher: FlaskConical,
    designer: Palette, developer: Code2, creator: Clapperboard,
    sales: TrendingUp, planner: Map, athlete: Dumbbell, entrepreneur: Rocket,
};

export default function SettingsStartPage() {
    const router = useRouter();
    const { save, saving, showToast, toastMsg } = useSettingsSave();
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<PlannerMode>("weekly");
    const [timeTracking, setTimeTracking] = useState(false);
    const [customMenus, setCustomMenus] = useState<CustomMenuKey[]>(["weekly","monthly","yearly","contacts","canvas"]);
    const [userRole, setUserRole] = useState<PlannerRole | null>(null);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/myverse/settings");
            if (res.ok) {
                const d = await res.json();
                if (d.user) {
                    setMode(d.user.mode || "weekly");
                    setTimeTracking(!!d.user.time_tracking);
                    if (Array.isArray(d.user.custom_menus)) setCustomMenus(d.user.custom_menus);
                    if (d.user.user_role) setUserRole(d.user.user_role);
                }
            }
            setLoading(false);
        })();
    }, []);

    if (loading) return <div className="py-16 text-center text-neutral-400 text-sm"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>;

    return (
        <SettingsLayout toast={toastMsg}>
            <div className="space-y-5">

                {/* 사용 수준 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
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
                                        ? "border-[#6366F1] bg-[#6366F1]/5 text-[#6366F1] font-semibold"
                                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
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
                                상단 메뉴에 노출할 항목을 선택하세요.<br />
                                <span className="text-neutral-500">필수: 인덱스 · 일간 · 퍼스널 · 템플릿 · 커뮤니티</span>
                            </p>
                            {CUSTOM_TOGGLE_KEYS.map((k) => {
                                const META: Record<CustomMenuKey, { label: string; desc: string }> = {
                                    weekly:   { label: "주간",   desc: "7일 세로 목록" },
                                    monthly:  { label: "월간",   desc: "월 그리드 + 공휴일" },
                                    yearly:   { label: "연간",   desc: "12개월 + 분기 목표" },
                                    time:     { label: "시간",   desc: "시간 단위 행동 데이터 기록" },
                                    contacts: { label: "연락처", desc: "연락처 목록·그룹·검색" },
                                    canvas:   { label: "캔버스", desc: "자유 손글씨·도형·이미지" },
                                };
                                const isTime = k === "time";
                                const enabled = isTime ? timeTracking : customMenus.includes(k);
                                return (
                                    <div key={k} className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-neutral-700">{META[k].label}</p>
                                            <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{META[k].desc}</p>
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
                                                    const next = enabled ? customMenus.filter(x => x !== k) : [...customMenus, k];
                                                    setCustomMenus(next);
                                                    localStorage.setItem("pp-custom-menus", JSON.stringify(next));
                                                    window.dispatchEvent(new CustomEvent("pp-custom-menus-change", { detail: { menus: next } }));
                                                    await save({ custom_menus: next });
                                                    router.refresh();
                                                }
                                            }}
                                            className={`shrink-0 w-10 h-6 rounded-full transition-colors ${enabled ? "bg-[#6366F1]" : "bg-neutral-300"}`}
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
                                        시간 단위로 행동 데이터를 기록합니다.<br />
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
                                    className={`shrink-0 w-10 h-6 rounded-full transition-colors ${timeTracking ? "bg-[#6366F1]" : "bg-neutral-300"}`}
                                >
                                    <span className={`block w-4 h-4 !bg-white rounded-full shadow transition-transform mx-1 ${timeTracking ? "translate-x-4" : "translate-x-0"}`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {saving && <p className="text-[11px] text-neutral-400 mt-3 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> 저장 중…</p>}
                </section>

                {/* 나의 역할 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-sm font-semibold text-neutral-900">나의 역할</h2>
                        {userRole && (
                            <button onClick={() => { setUserRole(null); save({ user_role: null }); }} className="text-[11px] text-neutral-400 hover:text-neutral-600">선택 해제</button>
                        )}
                    </div>
                    <p className="text-xs text-neutral-400 mb-4">역할에 맞는 템플릿과 AI 브리핑을 추천합니다.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {(Object.keys(PLANNER_ROLE_META) as PlannerRole[]).map((r) => {
                            const Icon = ROLE_ICONS[r];
                            const active = userRole === r;
                            return (
                                <button
                                    key={r}
                                    onClick={() => { const next = active ? null : r; setUserRole(next); save({ user_role: next }); }}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 border-2 rounded-lg text-left transition-all ${active ? "border-[#6366F1] bg-[#6366F1]/5" : "border-neutral-200 hover:border-neutral-300 bg-white"}`}
                                >
                                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#6366F1]" : "text-neutral-400"}`} />
                                    <div className="min-w-0">
                                        <p className={`text-xs font-semibold truncate ${active ? "text-[#6366F1]" : "text-neutral-700"}`}>{PLANNER_ROLE_META[r].label}</p>
                                        <p className="text-[10px] text-neutral-400 truncate">{PLANNER_ROLE_META[r].desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

            </div>
        </SettingsLayout>
    );
}
