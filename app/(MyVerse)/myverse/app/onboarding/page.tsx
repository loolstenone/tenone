"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Sun, Moon, Layers, Compass, Briefcase, GraduationCap, FlaskConical, Palette, Code2, Clapperboard, TrendingUp, Map, Dumbbell, Rocket } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { PlannerMode, AiTone, PlannerRole } from "@/lib/myverse/types";
import { PLANNER_ROLE_META } from "@/lib/myverse/types";
import { trackPlanners } from "@/lib/myverse/analytics";

type Step = "welcome" | "mode" | "role" | "ai" | "identity_lite" | "done";

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

export default function OnboardingPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    const [step, setStep] = useState<Step>("welcome");
    const [mode, setMode] = useState<PlannerMode>("weekly");
    const [role, setRole] = useState<PlannerRole | null>(null);
    const [morningTime, setMorningTime] = useState("08:00");
    const [eveningTime, setEveningTime] = useState("21:00");
    const [tone, setTone] = useState<AiTone>("friendly");
    const [visionStatement, setVisionStatement] = useState("");
    const [missionStatement, setMissionStatement] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login?redirect=/myverse/app/onboarding");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (step !== "done") trackPlanners("myverse_onboarding_step", { step });
    }, [step]);

    async function handleFinish() {
        setSaving(true);
        try {
            const res = await fetch("/api/myverse/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode,
                    user_role: role,
                    ai_morning_time: morningTime,
                    ai_evening_time: eveningTime,
                    ai_tone: tone,
                    vision_statement: visionStatement,
                    mission_statement: missionStatement,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error("onboarding save failed", err);
                alert(`온보딩 저장 실패: ${err.error || res.status}\n다시 시도하거나 페이지를 새로고침해 주세요.`);
                setSaving(false);
                return;
            }
            trackPlanners("myverse_onboarding_complete", { mode, ai_tone: tone });
            window.location.assign("/myverse/app/today");
        } catch (e) {
            console.error("onboarding fetch error", e);
            alert(`네트워크 오류: ${(e as Error).message}\n다시 시도해 주세요.`);
            setSaving(false);
        }
    }

    if (isLoading || !isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
            <p className="text-neutral-400 text-sm">로딩 중…</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl">
                <div className="flex items-center gap-2 mb-10">
                    {(["welcome", "mode", "role", "ai", "identity_lite"] as Step[]).map((s, i) => {
                        const order = ["welcome", "mode", "role", "ai", "identity_lite"];
                        const current = order.indexOf(step);
                        const done = i < current;
                        const active = i === current;
                        return (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                    done ? "bg-[#6366F1]" : active ? "bg-[#6366F1]" : "bg-neutral-200"
                                }`}
                            />
                        );
                    })}
                </div>

                {step === "welcome" && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-[#6366F1] mb-3">Ten:One™</p>
                            <h1 className="font-serif text-3xl md:text-4xl text-neutral-900 leading-tight">
                                우리는 모두 기획자다.<br />적어도 자기 인생에서 만큼은.
                            </h1>
                        </div>
                        <div className="space-y-3 text-neutral-600 leading-relaxed">
                            <p>
                                마이버스 AI는 단순 일정 관리가 아닙니다.
                            </p>
                            <p>
                                나의 정체성을 정립하고, 목표를 세우고, 매일의 실행으로 연결하는 <strong className="text-neutral-900">자기 성취 플랫폼</strong>입니다.
                            </p>
                            <p>
                                AI 비서가 매일 아침 브리핑하고 저녁에 정리합니다.<br />
                                당신은 방향만 잡으세요.
                            </p>
                            <p className="font-serif text-neutral-900 pt-4 border-t border-neutral-200 mt-4 italic">
                                생각한대로 살지 않으면,<br />
                                사는대로 생각하게 된다.
                            </p>
                        </div>
                        <button
                            onClick={() => setStep("mode")}
                            className="mt-8 flex items-center gap-2 px-6 py-3 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors"
                        >
                            시작하기 <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {step === "mode" && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">1 / 4</p>
                            <h2 className="font-serif text-2xl text-neutral-900">어떤 모드로 시작할까요?</h2>
                            <p className="text-sm text-neutral-500 mt-2">언제든 설정에서 바꿀 수 있습니다.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setMode("weekly")}
                                className={`text-left p-6 border-2 rounded-xl transition-all ${
                                    mode === "weekly"
                                        ? "border-[#6366F1] bg-[#6366F1]/5"
                                        : "border-neutral-200 bg-white hover:border-neutral-300"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <CalendarMini />
                                    <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider">Weekly</span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">추천</span>
                                </div>
                                <p className="font-semibold text-neutral-900">주간 단위 실행</p>
                                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                                    Weekly + Daily + Project + Identity(간소)<br />
                                    빠른 진입, 부담 없음
                                </p>
                            </button>

                            <button
                                onClick={() => setMode("all_in_one")}
                                className={`text-left p-6 border-2 rounded-xl transition-all ${
                                    mode === "all_in_one"
                                        ? "border-[#6366F1] bg-[#6366F1]/5"
                                        : "border-neutral-200 bg-white hover:border-neutral-300"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Layers className="h-4 w-4 text-[#6366F1]" />
                                    <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider">All in One</span>
                                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">고급</span>
                                </div>
                                <p className="font-semibold text-neutral-900">전체 구조 활용</p>
                                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                                    Yearly + Monthly + Weekly + Daily + Project + Identity + Templates<br />
                                    기획자·경영자·대학원생
                                </p>
                            </button>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep("welcome")}
                                className="flex items-center gap-2 px-4 py-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" /> 뒤로
                            </button>
                            <button
                                onClick={() => setStep("role")}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors"
                            >
                                다음 <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === "role" && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">2 / 4</p>
                            <h2 className="font-serif text-2xl text-neutral-900">나는 주로 어떤 역할인가요?</h2>
                            <p className="text-sm text-neutral-500 mt-2">
                                선택한 역할에 맞는 템플릿과 AI 브리핑을 추천합니다.
                                <span className="text-neutral-400"> 언제든 설정에서 바꿀 수 있습니다.</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(Object.keys(PLANNER_ROLE_META) as PlannerRole[]).map((r) => {
                                const Icon = ROLE_ICONS[r];
                                const meta = PLANNER_ROLE_META[r];
                                const active = role === r;
                                return (
                                    <button
                                        key={r}
                                        onClick={() => setRole(active ? null : r)}
                                        className={`text-left p-4 border-2 rounded-xl transition-all ${
                                            active
                                                ? "border-[#6366F1] bg-[#6366F1]/5"
                                                : "border-neutral-200 bg-white hover:border-neutral-300"
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 mb-2 ${active ? "text-[#6366F1]" : "text-neutral-400"}`} />
                                        <p className={`text-sm font-semibold ${active ? "text-[#6366F1]" : "text-neutral-900"}`}>
                                            {meta.label}
                                        </p>
                                        <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                                            {meta.desc}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-between pt-2">
                            <button
                                onClick={() => setStep("mode")}
                                className="flex items-center gap-2 px-4 py-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" /> 뒤로
                            </button>
                            <button
                                onClick={() => setStep("ai")}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors"
                            >
                                {role ? "다음" : "건너뛰기"} <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === "ai" && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">3 / 4</p>
                            <h2 className="font-serif text-2xl text-neutral-900">AI 비서 설정</h2>
                            <p className="text-sm text-neutral-500 mt-2">아침 브리핑과 저녁 정리 시간을 정하세요.</p>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                                    <label className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                                        <Sun className="h-3.5 w-3.5" /> 아침 브리핑
                                    </label>
                                    <input
                                        type="time"
                                        value={morningTime}
                                        onChange={(e) => setMorningTime(e.target.value)}
                                        className="w-full text-lg font-medium text-neutral-900 focus:outline-none"
                                    />
                                </div>
                                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                                    <label className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                                        <Moon className="h-3.5 w-3.5" /> 저녁 정리
                                    </label>
                                    <input
                                        type="time"
                                        value={eveningTime}
                                        onChange={(e) => setEveningTime(e.target.value)}
                                        className="w-full text-lg font-medium text-neutral-900 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="bg-white border border-neutral-200 rounded-lg p-4">
                                <p className="text-xs text-neutral-500 mb-3">AI 톤</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["professional", "friendly", "brief"] as AiTone[]).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTone(t)}
                                            className={`py-2 text-sm rounded-lg transition-colors ${
                                                tone === t
                                                    ? "bg-[#6366F1] text-white"
                                                    : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                                            }`}
                                        >
                                            {t === "professional" ? "전문적" : t === "friendly" ? "친근함" : "간결함"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep("role")}
                                className="flex items-center gap-2 px-4 py-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" /> 뒤로
                            </button>
                            <button
                                onClick={() => setStep("identity_lite")}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors"
                            >
                                다음 <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === "identity_lite" && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">4 / 4</p>
                            <h2 className="font-serif text-2xl text-neutral-900 flex items-center gap-2">
                                <Compass className="h-5 w-5 text-[#6366F1]" /> 당신이 도모(圖謀)하는 것은 무엇입니까?
                            </h2>
                            <p className="text-sm text-neutral-500 mt-2">
                                나중에 Identity 탭에서 상세히 작성할 수 있습니다. 지금은 한 줄씩만.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-2">Vision — 되고 싶은 것, 지향점</label>
                                <input
                                    type="text"
                                    value={visionStatement}
                                    onChange={(e) => setVisionStatement(e.target.value)}
                                    placeholder="예: 1만 명의 기획자에게 영감을 주는 플랫폼을 만든다"
                                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#6366F1]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-2">Mission — 비전을 실현하기 위해 해야 할 것</label>
                                <input
                                    type="text"
                                    value={missionStatement}
                                    onChange={(e) => setMissionStatement(e.target.value)}
                                    placeholder="예: 매일 한 명의 기획자와 깊은 대화를 나눈다"
                                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#6366F1]"
                                />
                            </div>
                            <p className="text-xs text-neutral-400 italic">비워두고 진행해도 됩니다.</p>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep("ai")}
                                className="flex items-center gap-2 px-4 py-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" /> 뒤로
                            </button>
                            <button
                                onClick={handleFinish}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors disabled:opacity-50"
                            >
                                {saving ? "저장 중…" : <>시작하기 <Check className="h-4 w-4" /></>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function CalendarMini() {
    return (
        <div className="w-4 h-4 rounded border-2 border-[#6366F1] flex items-center justify-center">
            <div className="w-1 h-1 bg-[#6366F1] rounded-full" />
        </div>
    );
}
