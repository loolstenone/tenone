"use client";

import { useEffect, useState } from "react";
import { Loader2, Briefcase, GraduationCap, FlaskConical, Palette, Code2, Clapperboard, TrendingUp, Map, Dumbbell, Rocket } from "lucide-react";
import type { PlannerRole } from "@/lib/myverse/types";
import { PLANNER_ROLE_META } from "@/lib/myverse/types";
import { SettingsLayout } from "@/features/myverse/planner/SettingsLayout";
import { useSettingsSave } from "@/features/myverse/planner/settings/useSettingsSave";

const ROLE_ICONS: Record<PlannerRole, React.ElementType> = {
    office_worker: Briefcase, student: GraduationCap, researcher: FlaskConical,
    designer: Palette, developer: Code2, creator: Clapperboard,
    sales: TrendingUp, planner: Map, athlete: Dumbbell, entrepreneur: Rocket,
};

export default function SettingsStartPage() {
    const { save, saving, toastMsg } = useSettingsSave();
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<PlannerRole | null>(null);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/myverse/settings");
            if (res.ok) {
                const d = await res.json();
                if (d.user) {
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

                {/* 사용 수준(Easy·All in one·직접 설정)·시간 기록은 뺐다 — Planner's 앱 메뉴는 고정(features/planners/app/nav.ts)이라 골라도 달라지는 게 없었다 (2026-10-15 QA) */}
                {/* 나의 역할 */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-sm font-semibold text-neutral-900">나의 역할</h2>
                        {userRole && (
                            <button onClick={() => { setUserRole(null); save({ user_role: null }); }} className="text-[11px] text-neutral-400 hover:text-neutral-600">선택 해제</button>
                        )}
                    </div>
                    <p className="text-xs text-neutral-400 mb-4">역할에 맞는 템플릿과 인공지능 도움을 드립니다.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {(Object.keys(PLANNER_ROLE_META) as PlannerRole[]).map((r) => {
                            const Icon = ROLE_ICONS[r];
                            const active = userRole === r;
                            return (
                                <button
                                    key={r}
                                    onClick={() => { const next = active ? null : r; setUserRole(next); save({ user_role: next }); }}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 border-2 rounded-lg text-left transition-all ${active ? "border-[var(--pp-accent)] bg-[var(--pp-accent)]/5" : "border-neutral-200 hover:border-neutral-300 bg-white"}`}
                                >
                                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[var(--pp-accent)]" : "text-neutral-400"}`} />
                                    <div className="min-w-0">
                                        <p className={`text-xs font-semibold truncate ${active ? "text-[var(--pp-accent)]" : "text-neutral-700"}`}>{PLANNER_ROLE_META[r].label}</p>
                                        <p className="text-[10px] text-neutral-400 truncate">{PLANNER_ROLE_META[r].desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {saving && <p className="text-[11px] text-neutral-400 mt-3 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> 저장 중…</p>}
                </section>

            </div>
        </SettingsLayout>
    );
}
