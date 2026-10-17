"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Compass, Briefcase, GraduationCap, FlaskConical, Palette, Code2, Clapperboard, TrendingUp, Map, Dumbbell, Rocket } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import type { MyverseMode, AiTone, MyverseRole } from "@/lib/myverse/types";
import { MYVERSE_ROLE_META } from "@/lib/myverse/types";
import { trackMyverse } from "@/lib/myverse/analytics";

type Step = "letter" | "welcome" | "role" | "ai" | "identity_lite" | "done";

// Planner's 앱: MyVerse '첫 흔적' 단계(개인 OS) 제외 — 정체성 단계에서 바로 시작 (2026-10-14)
// '쓰는 방식'(mode) 단계는 뺐다 — Planner's 메뉴는 고정이라 골라도 달라지는 게 없었다 (2026-10-15 QA). 저장은 all_in_one
const STEPS: Step[] = ["welcome", "role", "ai", "identity_lite"];
// 처음 가입한 사람에게 먼저 베타 편지 한 장 (2026-10-18 사용자) - 진행 바에는 넣지 않는다. 의견은 앱 상단 '의견 보내기'(PlannersFeedback)

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
    const { isAuthenticated, isLoading } = useAuth();

    const [step, setStep] = useState<Step>("letter");
    const mode: MyverseMode = "all_in_one";
    const [role, setRole] = useState<MyverseRole | null>(null);
    const [morningTime] = useState("08:00");
    const [eveningTime] = useState("21:00");
    const [tone, setTone] = useState<AiTone>("friendly");
    const [visionStatement, setVisionStatement] = useState("");
    const [missionStatement, setMissionStatement] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || isLoading) return;
        fetch("/api/myverse/settings")
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.user?.onboarding_completed) {
                    window.location.replace("/planners/app/daily");
                }
            })
            .catch(() => {});
    }, [isAuthenticated, isLoading]);

    useEffect(() => {
        if (step !== "done") trackMyverse("myverse_onboarding_step", { step });
    }, [step]);

    async function handleFinish() {
        if (saving) return; // 두 번 눌러 두 번 저장되지 않게 (2026-10-15 QA)
        setSaving(true); setSaveError(null);
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
                setSaveError(res.status === 403 ? "회원가입을 마친 뒤 설정할 수 있습니다. 새로고침해 가입 창을 확인해 주세요." : "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
                setSaving(false);
                return;
            }
            trackMyverse("myverse_onboarding_complete", { mode, ai_tone: tone });
            window.location.assign("/planners/app/daily");
        } catch (e) {
            console.error("onboarding fetch error", e);
            setSaveError("연결이 불안정합니다. 잠시 후 다시 시도해 주세요.");
            setSaving(false);
        }
    }

    // 비로그인 → 이 화면 위에 로그인 창 (§1.2.1 — /login 페이지로 보내지 않는다)
    if (!isLoading && !isAuthenticated) {
        return (
            <div className="min-h-screen bg-white">
                <LoginRequired accentColor="#0F766E" message="플래너'스 AI는 로그인한 뒤 쓸 수 있습니다." />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#08080E]">
                <div className="w-1 h-1 rounded-full bg-teal-400 animate-ping" />
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
                    background: "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(20,184,166,0.12) 0%, transparent 70%)",
                }}
            />

            {/* 진행 바 */}
            {step !== "welcome" && step !== "letter" && (
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
                                            ? "rgba(20,184,166,0.7)"
                                            : active
                                                ? "linear-gradient(90deg, #2DD4BF, #0F766E)"
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

                    {/* ── LETTER (베타 · 함께 만들기) ── */}
                    {step === "letter" && (
                        <div className="min-h-[70vh] flex flex-col justify-between">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                    <span className="text-[11px] tracking-widest text-white/40">베타 · 함께 만드는 중</span>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-light text-white leading-snug tracking-tight break-keep">
                                    제대로 된 플래너를,<br />
                                    같이 만들어 보려 합니다.
                                </h1>

                                <div className="space-y-5 text-white/55 text-[15px] leading-relaxed break-keep">
                                    <p>
                                        프랭클린 플래너를 비롯해 많은 플래너가 디지털로 넘어오려 했습니다.
                                        그런데 대부분은 종이 한 장을 화면에 옮겨 놓는 데서 멈췄습니다.
                                        종이처럼 손에 붙지도 않고, 앱처럼 나를 도와주지도 않았습니다.
                                        그래서 많은 사람이 다시 종이로 돌아갔습니다.
                                    </p>
                                    <p>
                                        플래너&apos;스 AI는 그 자리에서 다시 시작합니다.
                                        밀린 일을 다시 옮겨 적지 않게, 손으로 쓴 것을 그대로 살리게, 하루를 혼자 돌아보지 않게.
                                    </p>
                                    <p>
                                        지금은 베타입니다. 아직 서툰 곳이 있고, 매일 고치고 있습니다.
                                        인공지능 기능은 베타 테스터부터 차례로 열고 있어요.
                                    </p>
                                    <p className="text-white/75">
                                        쓰다가 불편했던 것, 있었으면 하는 것, 플래너&apos;스 AI가 틀린 순간을 알려 주세요.
                                        앱 위쪽 &apos;의견 보내기&apos;로 보내 주시면 직접 읽고 다음 버전에 담겠습니다.
                                    </p>
                                    <p className="text-white/40 text-sm">플래너&apos;스 드림</p>
                                </div>
                            </div>

                            <div className="mt-12">
                                <button
                                    onClick={() => setStep("welcome")}
                                    className="group flex w-full items-center justify-between px-6 py-4 rounded-xl bg-[#0F766E] text-white text-sm font-medium transition-colors hover:bg-[#115E59]"
                                >
                                    <span>함께 만들어 보기</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── WELCOME ── */}
                    {step === "welcome" && (
                        <div className="min-h-[70vh] flex flex-col justify-between">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                    <span className="text-[11px] tracking-widest text-white/40">플래너&apos;스 AI 처음 설정</span>
                                </div>

                                <div className="space-y-3">
                                    <h1 className="text-4xl md:text-5xl font-light text-white leading-tight tracking-tight">
                                        내 플래너를<br />
                                        <span className="text-transparent bg-clip-text"
                                            style={{ backgroundImage: "linear-gradient(135deg, #5EEAD4 0%, #2DD4BF 50%, #0F766E 100%)" }}>
                                            준비할게요.
                                        </span>
                                    </h1>
                                    <p className="text-white/40 text-base leading-relaxed max-w-sm break-keep">
                                        세 가지만 고르면 바로 쓸 수 있어요. 1분이면 끝나고, 나중에 설정에서 언제든 바꿀 수 있습니다.
                                    </p>
                                </div>

                                <div className="space-y-3 border-l border-white/10 pl-4">
                                    {[
                                        // 무엇을 시작하는지 = 아래 설정 세 단계 (2026-10-15 사용자 "뭘 시작하자는 것인지 알려 달라") — MyVerse 문구 쓰지 않기
                                        "하는 일 · 직장인·학생 등, 알맞은 틀을 추천합니다",
                                        "AI 말투 · 전문적·친근함·간결함 중에서",
                                        "비전과 미션 · 모든 계획의 기준 (비워 둬도 됩니다)",
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <span className="text-[10px] text-teal-400/60 mt-0.5 tabular-nums">0{i + 1}</span>
                                            <p className="text-white/50 text-sm">{text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-12 flex flex-col gap-3">
                                <button
                                    onClick={() => setStep("role")}
                                    className="group flex items-center justify-between px-6 py-4 rounded-xl text-white text-sm font-medium transition-all"
                                    style={{
                                        background: "linear-gradient(135deg, #0F766E 0%, #134E4A 100%)",
                                        boxShadow: "0 0 32px rgba(20,184,166,0.25)",
                                    }}
                                >
                                    <span>설정 시작하기</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                                <button
                                    onClick={handleFinish}
                                    disabled={saving}
                                    className="text-sm text-white/25 hover:text-white/50 transition-colors text-center py-2 disabled:opacity-30"
                                >
                                    설정 없이 기본값으로 바로 쓰기
                                </button>
                                {saveError && <p role="alert" className="text-center text-sm text-rose-300">{saveError}</p>}
                            </div>
                        </div>
                    )}

                    {/* ── ROLE ── */}
                    {step === "role" && (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <p className="text-[11px] text-white/25 tracking-widest uppercase">1 / 3</p>
                                <h2 className="text-2xl font-light text-white">주로 어떤 일을 하시나요?</h2>
                                <p className="text-sm text-white/40 leading-relaxed">
                                    선택한 역할에 맞는 템플릿과 인공지능 도움을 드립니다.
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
                                                borderColor: active ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.07)",
                                                background: active ? "rgba(20,184,166,0.08)" : "rgba(255,255,255,0.03)",
                                                boxShadow: active ? "0 0 16px rgba(20,184,166,0.1)" : "none",
                                            }}
                                        >
                                            <Icon className={`h-4 w-4 mb-3 transition-colors ${active ? "text-teal-400" : "text-white/25"}`} />
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
                                onBack={() => setStep("welcome")}
                                onNext={() => setStep("ai")}
                                nextLabel={role ? "다음" : "건너뛰기"}
                            />
                        </div>
                    )}

                    {/* ── AI ── */}
                    {step === "ai" && (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <p className="text-[11px] text-white/25 tracking-widest uppercase">2 / 3</p>
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
                                                background: tone === t.key ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.04)",
                                                border: `1px solid ${tone === t.key ? "rgba(20,184,166,0.4)" : "rgba(255,255,255,0.07)"}`,
                                            }}
                                        >
                                            <p className={`text-sm font-medium mb-0.5 ${tone === t.key ? "text-teal-300" : "text-white/60"}`}>
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
                                <p className="text-[11px] text-white/25 tracking-widest uppercase">3 / 3</p>
                                <h2 className="text-2xl font-light text-white flex items-center gap-3">
                                    <Compass className="h-5 w-5 text-teal-400/60 flex-shrink-0" />
                                    당신이 도모하는 것은 무엇입니까?
                                </h2>
                                <p className="text-sm text-white/35 leading-relaxed">
                                    나중에 상세히 작성할 수 있습니다. 지금은 한 줄씩만.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs text-white/30 tracking-wide">비전 · 되고 싶은 것</label>
                                    <input
                                        type="text"
                                        value={visionStatement}
                                        onChange={(e) => setVisionStatement(e.target.value)}
                                        placeholder="예: 1만 명의 기획자에게 영감을 주는 플랫폼을 만든다"
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs text-white/30 tracking-wide">미션 · 비전을 이루는 방법</label>
                                    <input
                                        type="text"
                                        value={missionStatement}
                                        onChange={(e) => setMissionStatement(e.target.value)}
                                        placeholder="예: 매일 한 명의 기획자와 깊은 대화를 나눈다"
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 transition-colors"
                                    />
                                </div>
                                <p className="text-xs text-white/20">비워두고 진행해도 됩니다.</p>
                            </div>

                            <Nav
                                onBack={() => setStep("ai")}
                                onNext={handleFinish}
                                nextLabel={saving ? "저장 중…" : "내 플래너 열기"}
                                disabled={saving}
                            />
                            {saveError && <p role="alert" className="text-sm text-rose-300">{saveError}</p>}
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
    disabled = false,
}: {
    onBack: () => void;
    onNext: () => void;
    nextLabel: string;
    disabled?: boolean;
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
                disabled={disabled}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
                style={{
                    background: "linear-gradient(135deg, #0F766E 0%, #134E4A 100%)",
                    boxShadow: "0 0 24px rgba(20,184,166,0.25)",
                }}
            >
                {nextLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
        </div>
    );
}
