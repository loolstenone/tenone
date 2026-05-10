"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Layers, Compass, Briefcase, GraduationCap, FlaskConical, Palette, Code2, Clapperboard, TrendingUp, Map, Dumbbell, Rocket, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { MyverseMode, AiTone, MyverseRole } from "@/lib/myverse/types";
import { MYVERSE_ROLE_META } from "@/lib/myverse/types";
import { trackMyverse } from "@/lib/myverse/analytics";

type Step = "welcome" | "mode" | "role" | "ai" | "identity_lite" | "first_trace" | "done";

const STEPS: Step[] = ["welcome", "mode", "role", "ai", "identity_lite", "first_trace"];

const ROLE_ICONS: Record<MyverseRole, React.ElementType> = {
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
    const [mode, setMode] = useState<MyverseMode>("weekly");
    const [role, setRole] = useState<MyverseRole | null>(null);
    const [morningTime] = useState("08:00");
    const [eveningTime] = useState("21:00");
    const [tone, setTone] = useState<AiTone>("friendly");
    const [visionStatement, setVisionStatement] = useState("");
    const [missionStatement, setMissionStatement] = useState("");
    const [saving, setSaving] = useState(false);
    const [firstTrace, setFirstTrace] = useState("");
    const [tracePosting, setTracePosting] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login?redirect=/myverse/app");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated || isLoading) return;
        fetch("/api/myverse/settings")
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.user?.onboarding_completed) {
                    window.location.replace("/myverse/app/today");
                }
            })
            .catch(() => {});
    }, [isAuthenticated, isLoading]);

    useEffect(() => {
        if (step !== "done") trackMyverse("myverse_onboarding_step", { step });
    }, [step]);

    async function handleFirstTraceSubmit() {
        const text = firstTrace.trim();
        if (text) {
            setTracePosting(true);
            try {
                const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
                await fetch("/api/myverse/routines", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date: today,
                        activity: text.slice(0, 100),
                        note: text.length > 100 ? text : null,
                        category: "general",
                    }),
                });
                trackMyverse("myverse_onboarding_first_trace", { length: text.length });
            } catch (e) {
                console.warn("first trace post failed", e);
            } finally {
                setTracePosting(false);
            }
        }
        await handleFinish();
    }

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
            trackMyverse("myverse_onboarding_complete", { mode, ai_tone: tone });
            window.location.assign("/myverse/app/today");
        } catch (e) {
            console.error("onboarding fetch error", e);
            alert(`네트워크 오류: ${(e as Error).message}\n다시 시도해 주세요.`);
            setSaving(false);
        }
    }

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#08080E]">
                <div className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" />
            </div>
        );
    }

    const currentIndex = STEPS.indexOf(step);

    return (
        <div className="min-h-screen bg-[#08080E] flex flex-col">
            {/* 배경 빛 효과 */}
            <div
                className="pointer-events-none fixed inset-0"
                style={{
                    background: "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%)",
                }}
            />

            {/* 진행 바 */}
            {step !== "welcome" && (
                <div className="relative z-10 flex gap-1 px-6 pt-6">
                    {STEPS.slice(1).map((s, i) => {
                        const adjustedIndex = currentIndex - 1;
                        const done = i < adjustedIndex;
                        const active = i === adjustedIndex;
                        return (
                            <div
                                key={s}
                                className="h-[2px] flex-1 rounded-full overflow-hidden bg-white/10"
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: done || active ? "100%" : "0%",
                                        background: done
                                            ? "rgba(99,102,241,0.7)"
                                            : active
                                                ? "linear-gradient(90deg, #818CF8, #6366F1)"
                                                : "transparent",
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 콘텐츠 */}
            <div className="relative z-10 flex-1 flex items-start justify-center px-6 pt-12 pb-16">
                <div className="w-full max-w-xl">

                    {/* ── WELCOME ── */}
                    {step === "welcome" && (
                        <div className="min-h-[70vh] flex flex-col justify-between">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                    <span className="text-[11px] tracking-widest text-white/40 uppercase">Myverse</span>
                                </div>

                                <div className="space-y-3">
                                    <h1 className="text-4xl md:text-5xl font-light text-white leading-tight tracking-tight">
                                        여기에<br />
                                        <span className="text-transparent bg-clip-text"
                                            style={{ backgroundImage: "linear-gradient(135deg, #A5B4FC 0%, #818CF8 50%, #6366F1 100%)" }}>
                                            내가 있다.
                                        </span>
                                    </h1>
                                    <p className="text-white/40 text-base leading-relaxed max-w-sm">
                                        디지털 속 나를 하나로 모아 키워가는<br />
                                        퍼스널 블랙박스.
                                    </p>
                                </div>

                                <div className="space-y-3 border-l border-white/10 pl-4">
                                    {[
                                        "나를 모은다 — 흩어진 조각 구출",
                                        "나를 쌓는다 — 현재 기록 자동 축적",
                                        "나를 알아간다 — AI가 패턴·맥락 이해",
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <span className="text-[10px] text-indigo-400/60 mt-0.5 tabular-nums">0{i + 1}</span>
                                            <p className="text-white/50 text-sm">{text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-12 flex flex-col gap-3">
                                <button
                                    onClick={() => setStep("mode")}
                                    className="group flex items-center justify-between px-6 py-4 rounded-xl text-white text-sm font-medium transition-all"
                                    style={{
                                        background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                                        boxShadow: "0 0 32px rgba(99,102,241,0.25)",
                                    }}
                                >
                                    <span>시작하기</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                                <button
                                    onClick={handleFinish}
                                    disabled={saving}
                                    className="text-sm text-white/25 hover:text-white/50 transition-colors text-center py-2 disabled:opacity-30"
                                >
                                    기본 설정으로 바로 시작
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── MODE ── */}
                    {step === "mode" && (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <p className="text-[11px] text-white/25 tracking-widest uppercase">1 / 5</p>
                                <h2 className="text-2xl font-light text-white">어떤 모드로 시작할까요?</h2>
                                <p className="text-sm text-white/40 leading-relaxed">
                                    언제든 설정에서 바꿀 수 있습니다.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                                <button
                                    onClick={() => setMode("weekly")}
                                    className="group text-left p-5 rounded-xl border transition-all duration-200"
                                    style={{
                                        borderColor: mode === "weekly" ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)",
                                        background: mode === "weekly"
                                            ? "rgba(99,102,241,0.08)"
                                            : "rgba(255,255,255,0.03)",
                                        boxShadow: mode === "weekly" ? "0 0 20px rgba(99,102,241,0.1)" : "none",
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 rounded border border-indigo-400/40 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40">추천</span>
                                    </div>
                                    <p className="text-white text-sm font-medium mb-1">Easy mode</p>
                                    <p className="text-xs text-white/35 leading-relaxed">
                                        일간·주간·월간·연간 스케줄 중심으로 가볍게
                                    </p>
                                </button>

                                <button
                                    onClick={() => setMode("all_in_one")}
                                    className="group text-left p-5 rounded-xl border transition-all duration-200"
                                    style={{
                                        borderColor: mode === "all_in_one" ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)",
                                        background: mode === "all_in_one"
                                            ? "rgba(99,102,241,0.08)"
                                            : "rgba(255,255,255,0.03)",
                                        boxShadow: mode === "all_in_one" ? "0 0 20px rgba(99,102,241,0.1)" : "none",
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Layers className="h-4 w-4 text-indigo-400/70" />
                                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40">고급</span>
                                    </div>
                                    <p className="text-white text-sm font-medium mb-1">All in one mode</p>
                                    <p className="text-xs text-white/35 leading-relaxed">
                                        프로젝트·캔버스·템플릿까지 모든 기능 사용
                                    </p>
                                </button>
                            </div>

                            <Nav
                                onBack={() => setStep("welcome")}
                                onNext={() => setStep("role")}
                                nextLabel="다음"
                            />
                        </div>
                    )}

                    {/* ── ROLE ── */}
                    {step === "role" && (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <p className="text-[11px] text-white/25 tracking-widest uppercase">2 / 5</p>
                                <h2 className="text-2xl font-light text-white">주로 어떤 일을 하시나요?</h2>
                                <p className="text-sm text-white/40 leading-relaxed">
                                    선택한 역할에 맞는 AI 브리핑과 템플릿을 제공합니다.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                {(Object.keys(MYVERSE_ROLE_META) as MyverseRole[]).map((r) => {
                                    const Icon = ROLE_ICONS[r];
                                    const meta = MYVERSE_ROLE_META[r];
                                    const active = role === r;
                                    return (
                                        <button
                                            key={r}
                                            onClick={() => setRole(active ? null : r)}
                                            className="text-left p-4 rounded-xl border transition-all duration-200"
                                            style={{
                                                borderColor: active ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)",
                                                background: active ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)",
                                                boxShadow: active ? "0 0 16px rgba(99,102,241,0.1)" : "none",
                                            }}
                                        >
                                            <Icon className={`h-4 w-4 mb-3 transition-colors ${active ? "text-indigo-400" : "text-white/25"}`} />
                                            <p className={`text-sm font-medium transition-colors ${active ? "text-white" : "text-white/60"}`}>
                                                {meta.label}
                                            </p>
                                            <p className="text-[11px] text-white/25 mt-0.5 leading-relaxed line-clamp-2">
                                                {meta.desc}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            <Nav
                                onBack={() => setStep("mode")}
                                onNext={() => setStep("ai")}
                                nextLabel={role ? "다음" : "건너뛰기"}
                            />
                        </div>
                    )}

                    {/* ── AI ── */}
                    {step === "ai" && (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <p className="text-[11px] text-white/25 tracking-widest uppercase">3 / 5</p>
                                <h2 className="text-2xl font-light text-white">AI 파트너 설정</h2>
                                <p className="text-sm text-white/40 leading-relaxed">
                                    매일 아침 브리핑하고, 하루를 함께 정리하는 AI입니다.
                                </p>
                            </div>

                            <div className="p-5 rounded-xl border border-white/8 bg-white/[0.03] space-y-4">
                                <p className="text-xs text-white/30 tracking-wide uppercase">AI 톤</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {([
                                        { key: "professional" as AiTone, label: "전문적", desc: "정확하고 간결하게" },
                                        { key: "friendly" as AiTone, label: "친근함", desc: "편하게 대화하듯" },
                                        { key: "brief" as AiTone, label: "간결함", desc: "핵심만 짧게" },
                                    ]).map((t) => (
                                        <button
                                            key={t.key}
                                            onClick={() => setTone(t.key)}
                                            className="py-3 px-3 rounded-lg text-left transition-all duration-200"
                                            style={{
                                                background: tone === t.key ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                                                border: `1px solid ${tone === t.key ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}`,
                                            }}
                                        >
                                            <p className={`text-sm font-medium mb-0.5 ${tone === t.key ? "text-indigo-300" : "text-white/60"}`}>
                                                {t.label}
                                            </p>
                                            <p className="text-[10px] text-white/25">{t.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                <p className="text-xs text-white/20 leading-relaxed">
                                    AI는 비서가 아니라 영혼의 단짝입니다.<br />
                                    참견 아닌 배려, 훈계 아닌 관찰.
                                </p>
                            </div>

                            <Nav
                                onBack={() => setStep("role")}
                                onNext={() => setStep("identity_lite")}
                                nextLabel="다음"
                            />
                        </div>
                    )}

                    {/* ── IDENTITY ── */}
                    {step === "identity_lite" && (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <p className="text-[11px] text-white/25 tracking-widest uppercase">4 / 5</p>
                                <h2 className="text-2xl font-light text-white flex items-center gap-3">
                                    <Compass className="h-5 w-5 text-indigo-400/60 flex-shrink-0" />
                                    당신이 도모하는 것은 무엇입니까?
                                </h2>
                                <p className="text-sm text-white/35 leading-relaxed">
                                    나중에 상세히 작성할 수 있습니다. 지금은 한 줄씩만.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs text-white/30 tracking-wide">Vision — 되고 싶은 것</label>
                                    <input
                                        type="text"
                                        value={visionStatement}
                                        onChange={(e) => setVisionStatement(e.target.value)}
                                        placeholder="예: 1만 명의 기획자에게 영감을 주는 플랫폼을 만든다"
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs text-white/30 tracking-wide">Mission — 비전을 실현할 방법</label>
                                    <input
                                        type="text"
                                        value={missionStatement}
                                        onChange={(e) => setMissionStatement(e.target.value)}
                                        placeholder="예: 매일 한 명의 기획자와 깊은 대화를 나눈다"
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>
                                <p className="text-xs text-white/20">비워두고 진행해도 됩니다.</p>
                            </div>

                            <Nav
                                onBack={() => setStep("ai")}
                                onNext={() => setStep("first_trace")}
                                nextLabel="다음"
                            />
                        </div>
                    )}

                    {/* ── FIRST TRACE — 첫 흔적 남기기 ── */}
                    {step === "first_trace" && (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <p className="text-[11px] text-white/25 tracking-widest uppercase">5 / 5</p>
                                <h2 className="text-2xl font-light text-white flex items-center gap-3">
                                    <Sparkles className="h-5 w-5 text-indigo-400/60 flex-shrink-0" />
                                    오늘의 첫 흔적을 남겨볼까요?
                                </h2>
                                <p className="text-sm text-white/35 leading-relaxed">
                                    한 줄이면 충분해요. 오늘 있었던 일·기분·만난 사람, 무엇이든.<br />
                                    이 한 줄이 당신 Verse의 첫 발자국이 됩니다.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <textarea
                                    value={firstTrace}
                                    onChange={(e) => setFirstTrace(e.target.value.slice(0, 200))}
                                    placeholder="예: 오랜만에 햇살 받으며 한강 산책. 마음이 가라앉았다."
                                    rows={4}
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                                />
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-white/25">길게 쓰지 않아도 돼요. 비워둬도 괜찮아요.</span>
                                    <span className="text-white/30 tabular-nums">{firstTrace.length}/200</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                <p className="text-xs text-white/30 leading-relaxed">
                                    <span className="text-indigo-300/80">기본은 비공개</span> — 모든 흔적은 처음엔 나만 봅니다. 공개는 나중에 직접 선택해요.
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <button
                                    onClick={() => setStep("identity_lite")}
                                    className="flex items-center gap-2 px-4 py-2 text-white/30 hover:text-white/60 transition-colors text-sm"
                                >
                                    <ArrowLeft className="h-4 w-4" /> 뒤로
                                </button>
                                <button
                                    onClick={handleFirstTraceSubmit}
                                    disabled={saving || tracePosting}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-40"
                                    style={{
                                        background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                                        boxShadow: "0 0 24px rgba(99,102,241,0.3)",
                                    }}
                                >
                                    {(saving || tracePosting) ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            시작 중
                                        </>
                                    ) : firstTrace.trim() ? (
                                        <>남기고 시작하기 <Check className="h-4 w-4" /></>
                                    ) : (
                                        <>그냥 시작하기 <ArrowRight className="h-4 w-4" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

function Nav({
    onBack,
    onNext,
    nextLabel,
}: {
    onBack: () => void;
    onNext: () => void;
    nextLabel: string;
}) {
    return (
        <div className="flex items-center justify-between pt-2">
            <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-white/30 hover:text-white/60 transition-colors text-sm"
            >
                <ArrowLeft className="h-4 w-4" /> 뒤로
            </button>
            <button
                onClick={onNext}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-medium transition-all"
                style={{
                    background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                    boxShadow: "0 0 24px rgba(99,102,241,0.25)",
                }}
            >
                {nextLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
        </div>
    );
}
