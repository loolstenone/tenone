"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, CheckCircle, Lightbulb, Pointer } from "lucide-react";
import { INDUSTRIES, JOB_FUNCTIONS } from "@/lib/badak-constants";

const HERO_RED = "#E53935";

const sPowers = ["주도", "실행", "창의", "관계", "분석", "조화", "돌파", "수호"];

type Section0 = { industry: string; jobFunction: string };
type Section1 = { q1: string; q2: string; q3: string; q4: string };
type Section2 = { guardian: number; pioneer: number; connector: number };
type Section3 = { q1: string; q2_a: string; q2_b: string; q3: string; q4: string; q5: string; q6: string };
type Section4 = { q1: string; q2: string; q3: string; q4: string; q5: string; q6: string };
type Section5 = { q1: string };
type Section6 = { q1: string };

interface TIHData {
    s0: Section0;
    s1: Section1;
    s2: Section2;
    s3: Section3;
    s4: Section4;
    s5: Section5;
    s6: Section6;
    contactCompany: string;
    contactName: string;
    contactEmail: string;
}

const INIT: TIHData = {
    s0: { industry: "", jobFunction: "" },
    s1: { q1: "", q2: "", q3: "", q4: "" },
    s2: { guardian: 33, pioneer: 34, connector: 33 },
    s3: { q1: "", q2_a: "", q2_b: "", q3: "", q4: "", q5: "", q6: "" },
    s4: { q1: "", q2: "", q3: "", q4: "", q5: "", q6: "" },
    s5: { q1: "" },
    s6: { q1: "" },
    contactCompany: "",
    contactName: "",
    contactEmail: "",
};

const TOTAL_STEPS = 8;
const LS_KEY = "hero-tih-draft";

/* ── Radio component ── */
function Radio({ name, value, label, selected, onChange }: { name: string; value: string; label: string; selected: string; onChange: (v: string) => void }) {
    return (
        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected === value ? "border-red-500 bg-red-50" : "border-neutral-200 hover:border-neutral-300"}`}>
            <input type="radio" name={name} value={value} checked={selected === value} onChange={() => onChange(value)} className="mt-0.5 accent-red-600 shrink-0" />
            <span className="text-sm text-neutral-700">{label}</span>
        </label>
    );
}

/* ── Progress bar ── */
function Progress({ step }: { step: number }) {
    const pct = Math.round((step / TOTAL_STEPS) * 100);
    return (
        <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-2">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: HERO_RED }} />
        </div>
    );
}

export default function TIHTestPage() {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<TIHData>(() => {
        if (typeof window === "undefined") return INIT;
        try {
            const saved = localStorage.getItem(LS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...INIT, ...parsed.data };
            }
        } catch { /* 무시 */ }
        return INIT;
    });
    const [done, setDone] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // 진행률 자동 저장
    useEffect(() => {
        if (done) return;
        try { localStorage.setItem(LS_KEY, JSON.stringify({ step, data })); } catch { /* 무시 */ }
    }, [step, data, done]);

    // step 복원
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed.step === "number") setStep(parsed.step);
            }
        } catch { /* 무시 */ }
    }, []);

    const update = <K extends keyof TIHData>(section: K, partial: Partial<TIHData[K]>) =>
        setData((prev) => ({ ...prev, [section]: { ...(prev[section] as object), ...partial } }));

    const s2Total = data.s2.guardian + data.s2.pioneer + data.s2.connector;

    const canNext = (): boolean => {
        if (step === 0) return !!(data.s0.industry && data.s0.jobFunction);
        if (step === 1) return !!(data.s1.q1 && data.s1.q2 && data.s1.q3 && data.s1.q4);
        if (step === 2) return s2Total === 100;
        if (step === 3) return !!(data.s3.q1 && data.s3.q2_a && data.s3.q2_b && data.s3.q3 && data.s3.q4 && data.s3.q5 && data.s3.q6);
        if (step === 4) return !!(data.s4.q1 && data.s4.q2 && data.s4.q3 && data.s4.q4 && data.s4.q5 && data.s4.q6);
        if (step === 5) return !!data.s5.q1;
        if (step === 6) return true; // Section 6 선택
        if (step === 7) return !!(data.contactCompany && data.contactName && data.contactEmail);
        return false;
    };

    async function handleSubmit() {
        setSubmitting(true);
        setSubmitError(null);
        try {
            const res = await fetch("/api/hero/tih", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
            localStorage.removeItem(LS_KEY);
            setDone(true);
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : "제출에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setSubmitting(false);
        }
    }

    if (done) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="max-w-md text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-6" style={{ color: HERO_RED }} />
                    <h1 className="text-2xl font-bold mb-3">TIH 검사가 완료되었습니다</h1>
                    <p className="text-neutral-500 mb-8">
                        HeRo 팀이 검토 후 인재 풀에서 맞닿는 영웅을 조용히 연결합니다.<br />
                        1~2 영업일 내에 이메일로 연락 드리겠습니다.
                    </p>
                    <a href="/hero/search-light" className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-lg" style={{ backgroundColor: HERO_RED }}>
                        Search Light로 돌아가기
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-2xl px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="h-5 w-5" style={{ color: HERO_RED }} />
                        <span className="text-sm font-bold uppercase tracking-wider" style={{ color: HERO_RED }}>TIH · Trust, Intent, Hiring</span>
                    </div>
                    <Progress step={step + 1} />
                    <p className="text-xs text-neutral-400">{step + 1} / {TOTAL_STEPS} 단계</p>
                </div>

                {/* ── Step 0: 포지션 분류 ── */}
                {step === 0 && (
                    <div>
                        <h2 className="text-xl font-bold mb-1">포지션 분류</h2>
                        <p className="text-sm text-neutral-500 mb-8">어떤 자리를 찾고 계신가요?</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">산업</label>
                                <select value={data.s0.industry} onChange={(e) => update("s0", { industry: e.target.value })}
                                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30">
                                    <option value="">선택해 주세요</option>
                                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">직무</label>
                                <select value={data.s0.jobFunction} onChange={(e) => update("s0", { jobFunction: e.target.value })}
                                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30">
                                    <option value="">선택해 주세요</option>
                                    {JOB_FUNCTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 1: 고민의 지형 ── */}
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-bold mb-1">고민의 지형</h2>
                        <p className="text-sm text-neutral-500 mb-8">지금 조직이 서 있는 지점을 솔직하게 골라 주세요.</p>

                        <div className="space-y-8">
                            <div>
                                <p className="text-sm font-semibold mb-3">지금 조직이 서 있는 지점에 가장 가까운 것은?</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "지키는 국면 — 있는 것을 흔들림 없이 돌려야 한다" },
                                        { v: "b", l: "여는 국면 — 새로운 영역·시장·제품으로 나아가야 한다" },
                                        { v: "c", l: "묶는 국면 — 흩어진 팀·문화·속도를 다시 정렬해야 한다" },
                                        { v: "d", l: "버티는 국면 — 어려운 시기를 함께 넘어야 한다" },
                                    ].map((o) => <Radio key={o.v} name="s1q1" value={o.v} label={o.l} selected={data.s1.q1} onChange={(v) => update("s1", { q1: v })} />)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">이 자리를 열게 만든 실제 고민을 한 줄로 고른다면?</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "일이 안 돌아간다" },
                                        { v: "b", l: "일이 돌아가긴 하는데 더 크게 못 간다" },
                                        { v: "c", l: "사람이 자꾸 바뀐다" },
                                        { v: "d", l: "방향은 보이는데 밀고 갈 손이 없다" },
                                        { v: "e", l: "내부가 계속 어긋난다" },
                                        { v: "f", l: "창업·확장 타이밍에 누군가 필요하다" },
                                    ].map((o) => <Radio key={o.v} name="s1q2" value={o.v} label={o.l} selected={data.s1.q2} onChange={(v) => update("s1", { q2: v })} />)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">이 자리에 오는 사람이 팀에 미칠 영향을 어떻게 상상하시나요?</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "조용히 자리를 채워주길 바란다" },
                                        { v: "b", l: "팀 전체의 기준을 올려주길 바란다" },
                                        { v: "c", l: "팀의 분위기·관계를 바꿔주길 바란다" },
                                        { v: "d", l: "팀이 보지 못하던 가능성을 열어주길 바란다" },
                                    ].map((o) => <Radio key={o.v} name="s1q3" value={o.v} label={o.l} selected={data.s1.q3} onChange={(v) => update("s1", { q3: v })} />)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">이 사람과 함께하고 싶은 시간의 길이는?</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "당면한 문제 해결까지 (프로젝트성)" },
                                        { v: "b", l: "한 챕터의 완성까지 (2~3년)" },
                                        { v: "c", l: "조직의 성장과 함께 오래 (5년+)" },
                                        { v: "d", l: "아직 모른다 — 서로 보면서 정하고 싶다" },
                                    ].map((o) => <Radio key={o.v} name="s1q4" value={o.v} label={o.l} selected={data.s1.q4} onChange={(v) => update("s1", { q4: v })} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 2: 3축 배분 ── */}
                {step === 2 && (
                    <div>
                        <h2 className="text-xl font-bold mb-1">3축 배분</h2>
                        <p className="text-sm text-neutral-500 mb-2">이 자리에 오는 사람에게 100점을 나눠 담는다면?</p>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-6">
                            <Pointer className="h-3.5 w-3.5" />
                            <span>슬라이더를 좌우로 드래그해 조절하세요 · 세 축의 합이 자동으로 100점 유지됩니다</span>
                        </div>

                        {/* 분배 시각화 바 */}
                        <div className="flex rounded-full overflow-hidden h-4 mb-8 gap-0.5">
                            <div className="transition-all duration-200" style={{ width: `${data.s2.guardian}%`, backgroundColor: "#E53935" }} />
                            <div className="transition-all duration-200" style={{ width: `${data.s2.pioneer}%`, backgroundColor: "#FF7043" }} />
                            <div className="transition-all duration-200" style={{ width: `${data.s2.connector}%`, backgroundColor: "#FFA726" }} />
                        </div>
                        <div className="flex text-xs mb-6 gap-4">
                            {[
                                { key: "guardian" as const, label: "수호자", color: "#E53935" },
                                { key: "pioneer" as const, label: "개척자", color: "#FF7043" },
                                { key: "connector" as const, label: "결속자", color: "#FFA726" },
                            ].map(({ key, label, color }) => (
                                <div key={key} className="flex items-center gap-1">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="text-neutral-500">{label} <span className="font-bold text-neutral-700">{data.s2[key]}점</span></span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-7">
                            {[
                                { key: "guardian" as const, label: "수호자", desc: "맡은 일에 충실하고 기준을 지킨다", color: "#E53935" },
                                { key: "pioneer" as const, label: "개척자", desc: "없던 것을 만들고 뚫어낸다", color: "#FF7043" },
                                { key: "connector" as const, label: "결속자", desc: "사람과 관계를 잇고 팀을 묶는다", color: "#FFA726" },
                            ].map(({ key, label, desc, color }) => (
                                <div key={key}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span className="font-semibold text-sm">{label}</span>
                                            <span className="text-xs text-neutral-400 ml-2">{desc}</span>
                                        </div>
                                        <span className="text-xl font-black tabular-nums" style={{ color }}>{data.s2[key]}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={data.s2[key]}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            const others = Object.keys(data.s2).filter((k) => k !== key) as (keyof Section2)[];
                                            const remaining = 100 - val;
                                            const sum = others.reduce((a, k) => a + data.s2[k], 0);
                                            const ratio = sum > 0 ? remaining / sum : 0.5;
                                            const updated = { ...data.s2, [key]: val };
                                            others.forEach((k, i) => {
                                                updated[k] = i === others.length - 1
                                                    ? Math.max(0, remaining - others.slice(0, -1).reduce((a, ok) => a + updated[ok], 0))
                                                    : Math.max(0, Math.round(data.s2[k] * ratio));
                                            });
                                            const diff = 100 - (updated.guardian + updated.pioneer + updated.connector);
                                            if (diff !== 0) updated[others[others.length - 1]] += diff;
                                            update("s2", updated);
                                        }}
                                        className="w-full"
                                        style={{ accentColor: color }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Step 3: 자리의 구체 ── */}
                {step === 3 && (
                    <div>
                        <h2 className="text-xl font-bold mb-1">자리의 구체</h2>
                        <p className="text-sm text-neutral-500 mb-8">이 자리에서 원하는 역할의 구체적인 모습</p>

                        <div className="space-y-8">
                            <div>
                                <p className="text-sm font-semibold mb-3">이 자리의 결정 권한 범위는?</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "주어진 일의 실행" },
                                        { v: "b", l: "팀 내 방법 결정" },
                                        { v: "c", l: "팀 간 조율·협상" },
                                        { v: "d", l: "부서·조직 방향 결정" },
                                    ].map((o) => <Radio key={o.v} name="s3q1" value={o.v} label={o.l} selected={data.s3.q1} onChange={(v) => update("s3", { q1: v })} />)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">가장 필요한 힘 (S-Power 8축 중 택2)</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {sPowers.map((sp) => {
                                        const sel = data.s3.q2_a === sp || data.s3.q2_b === sp;
                                        return (
                                            <button
                                                key={sp}
                                                type="button"
                                                onClick={() => {
                                                    if (sel) {
                                                        if (data.s3.q2_a === sp) update("s3", { q2_a: "" });
                                                        else update("s3", { q2_b: "" });
                                                    } else if (!data.s3.q2_a) {
                                                        update("s3", { q2_a: sp });
                                                    } else if (!data.s3.q2_b) {
                                                        update("s3", { q2_b: sp });
                                                    }
                                                }}
                                                className={`py-2 text-sm rounded-lg border font-medium transition-colors ${sel ? "text-white border-transparent" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}
                                                style={sel ? { backgroundColor: HERO_RED } : undefined}
                                            >
                                                {sp}
                                            </button>
                                        );
                                    })}
                                </div>
                                {(data.s3.q2_a || data.s3.q2_b) && (
                                    <p className="text-xs text-neutral-500 mt-2">선택: {[data.s3.q2_a, data.s3.q2_b].filter(Boolean).join(", ")}</p>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">반대로 과하면 곤란한 축</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {[...sPowers, "없음"].map((sp) => (
                                        <button key={sp} type="button" onClick={() => update("s3", { q3: sp })}
                                            className={`py-2 text-sm rounded-lg border font-medium transition-colors ${data.s3.q3 === sp ? "text-white border-transparent" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}
                                            style={data.s3.q3 === sp ? { backgroundColor: HERO_RED } : undefined}>
                                            {sp}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">반응 스타일</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "빠르게 판단하고 돌파" },
                                        { v: "b", l: "에너지로 사람을 움직임" },
                                        { v: "c", l: "안정적으로 오래 감" },
                                        { v: "d", l: "정확하고 꼼꼼함" },
                                    ].map((o) => <Radio key={o.v} name="s3q4" value={o.v} label={o.l} selected={data.s3.q4} onChange={(v) => update("s3", { q4: v })} />)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">일을 풀어가는 방식</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "구체적 사실·데이터 중심" },
                                        { v: "b", l: "전체 그림·가능성·패턴 중심" },
                                    ].map((o) => <Radio key={o.v} name="s3q5" value={o.v} label={o.l} selected={data.s3.q5} onChange={(v) => update("s3", { q5: v })} />)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">직속 리더 스타일</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "지시 명확·성과 지향" },
                                        { v: "b", l: "위임·자율 존중" },
                                        { v: "c", l: "코칭·육성" },
                                        { v: "d", l: "수평·협업" },
                                    ].map((o) => <Radio key={o.v} name="s3q6" value={o.v} label={o.l} selected={data.s3.q6} onChange={(v) => update("s3", { q6: v })} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 4: 일하는 결 ── */}
                {step === 4 && (
                    <div>
                        <h2 className="text-xl font-bold mb-1">일하는 결</h2>
                        <p className="text-sm text-neutral-500 mb-8">조직 환경을 솔직하게 묘사해 주세요.</p>

                        <div className="space-y-8">
                            <div>
                                <p className="text-sm font-semibold mb-3">이 팀에서 일하는 리듬</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "단거리 스프린트가 반복된다" },
                                        { v: "b", l: "마라톤처럼 길게 끌고 간다" },
                                        { v: "c", l: "파도처럼 집중기와 회복기가 나뉜다" },
                                        { v: "d", l: "안정적이고 예측 가능하다" },
                                    ].map((o) => <Radio key={o.v} name="s4q1" value={o.v} label={o.l} selected={data.s4.q1} onChange={(v) => update("s4", { q1: v })} />)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">이 자리에 먼저 있던 분은 지금 어떻게 지내시는지?</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "내부 다른 역할로 이동" },
                                        { v: "b", l: "승진·확장" },
                                        { v: "c", l: "외부로 이직 (좋은 관계)" },
                                        { v: "d", l: "개인 사정으로 이탈" },
                                        { v: "e", l: "신설 포지션" },
                                        { v: "f", l: "여러 명이 거쳐 감" },
                                    ].map((o) => <Radio key={o.v} name="s4q2" value={o.v} label={o.l} selected={data.s4.q2} onChange={(v) => update("s4", { q2: v })} />)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">의사결정이 이 조직에서 움직이는 속도는?</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "사안에 따라 다르지만 필요시 즉시" },
                                        { v: "b", l: "며칠 안에 정리됨" },
                                        { v: "c", l: "주·월 단위 회의에서 결정" },
                                        { v: "d", l: "상부 판단을 기다림" },
                                    ].map((o) => <Radio key={o.v} name="s4q3" value={o.v} label={o.l} selected={data.s4.q3} onChange={(v) => update("s4", { q3: v })} />)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">구성원이 개인 시간을 쓰는 방식</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "자유롭다" },
                                        { v: "b", l: "서로 배려한다" },
                                        { v: "c", l: "정해진 규칙이 있다" },
                                        { v: "d", l: "바쁘다 보니 여유가 많지는 않다" },
                                    ].map((o) => <Radio key={o.v} name="s4q4" value={o.v} label={o.l} selected={data.s4.q4} onChange={(v) => update("s4", { q4: v })} />)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">리더와 구성원 사이의 거리감</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "수평·친구 같다" },
                                        { v: "b", l: "존중하되 격의 없다" },
                                        { v: "c", l: "명확한 역할 구분" },
                                        { v: "d", l: "공식적·위계적" },
                                    ].map((o) => <Radio key={o.v} name="s4q5" value={o.v} label={o.l} selected={data.s4.q5} onChange={(v) => update("s4", { q5: v })} />)}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">실수가 생겼을 때 팀이 반응하는 첫 움직임</p>
                                <div className="space-y-2">
                                    {[
                                        { v: "a", l: "원인을 함께 복기한다" },
                                        { v: "b", l: "빠르게 수습하고 다음으로 간다" },
                                        { v: "c", l: "책임 소재를 먼저 확인한다" },
                                        { v: "d", l: "사안 규모에 따라 다르다" },
                                    ].map((o) => <Radio key={o.v} name="s4q6" value={o.v} label={o.l} selected={data.s4.q6} onChange={(v) => update("s4", { q6: v })} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 5: 피하고 싶은 유형 ── */}
                {step === 5 && (
                    <div>
                        <h2 className="text-xl font-bold mb-1">피하고 싶은 유형</h2>
                        <p className="text-sm text-neutral-500 mb-8">솔직할수록 매칭의 정확도가 높아집니다.</p>
                        <div className="space-y-2">
                            {[
                                { v: "a", l: "지나친 개인주의 (팀 조율 실패)" },
                                { v: "b", l: "지나친 의존성 (스스로 결정 못함)" },
                                { v: "c", l: "지나친 공격성 (관계 파괴)" },
                                { v: "d", l: "지나친 회피성 (책임 기피)" },
                            ].map((o) => <Radio key={o.v} name="s5q1" value={o.v} label={o.l} selected={data.s5.q1} onChange={(v) => update("s5", { q1: v })} />)}
                        </div>
                    </div>
                )}

                {/* ── Step 6: 한 줄 묘사 (선택) ── */}
                {step === 6 && (
                    <div>
                        <h2 className="text-xl font-bold mb-1">한 줄 묘사 <span className="text-sm font-normal text-neutral-400">(선택)</span></h2>
                        <p className="text-sm text-neutral-500 mb-8">
                            이 사람을 한 줄로 묘사한다면? AI가 위 구조에 덧입혀 미세 가중치를 조정합니다.
                        </p>
                        <textarea
                            rows={4}
                            placeholder="예: '조직의 혼란 속에서 방향을 잡고, 사람들을 이끌어 결과를 만드는 사람'"
                            value={data.s6.q1}
                            onChange={(e) => update("s6", { q1: e.target.value })}
                            className="w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
                        />
                        <p className="text-xs text-neutral-400 mt-2">이 항목은 건너뛰어도 됩니다.</p>
                    </div>
                )}

                {/* ── Step 7: 연락처 ── */}
                {step === 7 && (
                    <div>
                        <h2 className="text-xl font-bold mb-1">마지막 단계 · 연락처</h2>
                        <p className="text-sm text-neutral-500 mb-8">검사 결과와 매칭 큐레이션을 전달할 정보를 입력해 주세요.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">기업명 *</label>
                                <input type="text" required value={data.contactCompany}
                                    onChange={(e) => setData((p) => ({ ...p, contactCompany: e.target.value }))}
                                    className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">담당자명 *</label>
                                <input type="text" required value={data.contactName}
                                    onChange={(e) => setData((p) => ({ ...p, contactName: e.target.value }))}
                                    className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">이메일 *</label>
                                <input type="email" required value={data.contactEmail}
                                    onChange={(e) => setData((p) => ({ ...p, contactEmail: e.target.value }))}
                                    className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-neutral-50 rounded-lg text-xs text-neutral-500">
                            <p className="font-semibold text-neutral-700 mb-1">개인정보 안내</p>
                            <p>입력하신 정보는 HeRo 인재 매칭 큐레이션에만 사용되며, 외부에 공개되지 않습니다.</p>
                        </div>
                    </div>
                )}

                {/* 제출 오류 */}
                {submitError && (
                    <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {submitError}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-neutral-200">
                    <button
                        onClick={() => setStep((s) => s - 1)}
                        disabled={step === 0}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="h-4 w-4" /> 이전
                    </button>

                    {step < TOTAL_STEPS - 1 ? (
                        <button
                            onClick={() => setStep((s) => s + 1)}
                            disabled={!canNext()}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: HERO_RED }}
                        >
                            다음 <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canNext() || submitting}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: HERO_RED }}
                        >
                            {submitting ? "제출 중..." : "검사 완료 →"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
