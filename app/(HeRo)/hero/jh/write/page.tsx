"use client";

/**
 * JH 작성 페이지 — 개인(인재)이 12문항 + 실무 필드 작성
 * Matching Tetrad 4요소 중 인재 측 "자리의 바람"
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { JH_QUESTIONS } from "@/lib/hero/jh-questions";

const HERO_RED = "#E53935";
const LS_KEY = "hero-jh-draft";

interface JHForm {
    responses: Record<string, string | string[]>;
    practicalFilters: {
        companySizeRanges: string[];
        workMode: string;
        locations: string[];
        compensationFloor: string;
        compensationFloorPublic: boolean;
    };
}

const INIT: JHForm = {
    responses: {},
    practicalFilters: {
        companySizeRanges: [],
        workMode: "",
        locations: [],
        compensationFloor: "",
        compensationFloorPublic: true,
    },
};

export default function JHWritePage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [form, setForm] = useState<JHForm>(INIT);
    const [hydrated, setHydrated] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hydrate from localStorage + server
    useEffect(() => {
        if (!user?.id) { setHydrated(true); return; }
        (async () => {
            try {
                const ls = localStorage.getItem(LS_KEY);
                if (ls) {
                    const parsed = JSON.parse(ls);
                    if (parsed && parsed.responses) setForm(parsed);
                }
                const res = await fetch(`/api/hero/jh?memberId=${user.id}`);
                const data = await res.json();
                if (data.jh) {
                    setForm({
                        responses: data.jh.responses ?? {},
                        practicalFilters: data.jh.practical_filters ?? INIT.practicalFilters,
                    });
                }
            } catch { /* ignore */ }
            setHydrated(true);
        })();
    }, [user?.id]);

    // Auto-save draft
    useEffect(() => {
        if (!hydrated) return;
        try { localStorage.setItem(LS_KEY, JSON.stringify(form)); } catch { /* ignore */ }
    }, [form, hydrated]);

    if (isLoading || !hydrated) {
        return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    }
    if (!isAuthenticated) {
        return <div className="min-h-screen bg-neutral-50"><LoginModal isOpen={true} onClose={() => {}} accentColor={HERO_RED} /></div>;
    }

    function setResp(key: string, val: string | string[]) {
        setForm(f => ({ ...f, responses: { ...f.responses, [key]: val } }));
    }

    function togglePick(key: string, val: string, max: number) {
        const cur = (form.responses[key] as string[]) ?? [];
        if (cur.includes(val)) {
            setResp(key, cur.filter(v => v !== val));
        } else if (cur.length < max) {
            setResp(key, [...cur, val]);
        }
    }

    const required = JH_QUESTIONS.filter(q => q.required);
    const completedCount = required.filter(q => {
        const v = form.responses[q.key];
        if (v === undefined || v === null || v === "") return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
    }).length;
    const pct = Math.round((completedCount / required.length) * 100);

    async function submit() {
        if (!user?.id) return;
        if (completedCount < required.length) {
            setError("필수 문항을 모두 답해주세요.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/hero/jh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    memberId: user.id,
                    responses: form.responses,
                    practicalFilters: form.practicalFilters,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || `서버 오류 (${res.status})`);
            }
            localStorage.removeItem(LS_KEY);
            setDone(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "제출 실패");
            setSubmitting(false);
        }
    }

    if (done) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 pt-24">
                <div className="max-w-md text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-6" style={{ color: HERO_RED }} />
                    <h1 className="text-2xl font-bold mb-3">JH 작성 완료</h1>
                    <p className="text-neutral-500 mb-6">
                        당신의 "자리의 바람"이 매칭 엔진에 등록되었습니다.
                        HeRo 팀이 맞닿는 자리를 찾으면 조용히 연락드립니다.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={() => router.push("/hero/my")} className="px-5 py-2.5 text-white font-semibold rounded-lg" style={{ backgroundColor: HERO_RED }}>
                            마이페이지로
                        </button>
                        <button onClick={() => setDone(false)} className="px-5 py-2.5 text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                            다시 검토
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-2xl mx-auto px-6">
                {/* 헤더 */}
                <button onClick={() => router.back()} className="flex items-center gap-1 text-xs text-neutral-500 mb-4 hover:text-neutral-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> 뒤로
                </button>

                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-xs font-bold rounded-full mb-3" style={{ color: HERO_RED }}>
                        <Sparkles className="h-3.5 w-3.5" /> Job Hope — 자리의 바람
                    </div>
                    <h1 className="text-2xl font-extrabold mb-2">당신은 어떤 문제를 풀러 왔고, 어디로 가고 싶은가</h1>
                    <p className="text-sm text-neutral-500">
                        구직 조건(규모·연봉·근무형태)은 뒤의 실무 필드에서 따로 받습니다.
                        이 12문항은 영웅의 좌표를 그립니다. 4~7분 소요.
                    </p>
                </div>

                {/* 진행률 */}
                <div className="mb-6 sticky top-20 bg-neutral-50 py-2 z-10">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-neutral-500">필수 {completedCount}/{required.length}</span>
                        <span className="text-xs font-semibold" style={{ color: HERO_RED }}>{pct}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: HERO_RED }} />
                    </div>
                </div>

                {/* 12문항 */}
                <div className="space-y-10">
                    {JH_QUESTIONS.map((q, i) => {
                        const val = form.responses[q.key];
                        return (
                            <div key={q.key}>
                                <div className="mb-3">
                                    <h3 className="text-base font-bold mb-1">
                                        <span className="text-neutral-400 font-mono mr-2">JH{i + 1}.</span>
                                        {q.label}
                                    </h3>
                                    {q.type === "pick2" && <p className="text-xs text-neutral-400">택 2개</p>}
                                    {q.type === "pick3" && <p className="text-xs text-neutral-400">택 3개</p>}
                                    {!q.required && <p className="text-xs text-neutral-400">스킵 가능</p>}
                                </div>

                                {q.type === "text" ? (
                                    <textarea value={(val as string) ?? ""} onChange={e => setResp(q.key, e.target.value)}
                                        placeholder={q.placeholder} rows={3}
                                        className="w-full px-4 py-3 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 resize-none" />
                                ) : q.type === "single" ? (
                                    <div className="space-y-2">
                                        {q.options!.map(opt => (
                                            <label key={opt.value}
                                                className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    val === opt.value ? "border-red-500 bg-red-50" : "border-neutral-200 hover:border-neutral-300 bg-white"
                                                }`}>
                                                <input type="radio" name={q.key} value={opt.value} checked={val === opt.value}
                                                    onChange={() => setResp(q.key, opt.value)} className="sr-only" />
                                                <p className="text-sm text-neutral-800 font-medium">{opt.label}</p>
                                                {opt.hint && <p className="text-xs text-neutral-400 mt-0.5">{opt.hint}</p>}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {q.options!.map(opt => {
                                            const arr = (val as string[]) ?? [];
                                            const checked = arr.includes(opt.value);
                                            const max = q.type === "pick2" ? 2 : 3;
                                            const disabled = !checked && arr.length >= max;
                                            return (
                                                <label key={opt.value}
                                                    className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                                                        checked ? "border-red-500 bg-red-50"
                                                            : disabled ? "border-neutral-100 bg-neutral-50 opacity-50 cursor-not-allowed"
                                                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                                                    }`}>
                                                    <input type="checkbox" checked={checked} disabled={disabled}
                                                        onChange={() => togglePick(q.key, opt.value, max)} className="sr-only" />
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm text-neutral-800 font-medium">{opt.label}</p>
                                                            {opt.hint && <p className="text-xs text-neutral-400 mt-0.5">{opt.hint}</p>}
                                                        </div>
                                                        {checked && <CheckCircle className="h-4 w-4 shrink-0" style={{ color: HERO_RED }} />}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 실무 매칭 필드 (JH와 분리) */}
                <div className="mt-14 pt-8 border-t border-neutral-200">
                    <h2 className="text-lg font-bold mb-1">실무 매칭 필드</h2>
                    <p className="text-xs text-neutral-500 mb-6">구직 조건 — 하드 필터로만 작동합니다 (큐레이션 서술에는 등장 안 함).</p>

                    <div className="space-y-6">
                        <FilterPick label="수용 가능한 조직 규모 (복수)"
                            values={form.practicalFilters.companySizeRanges}
                            options={[
                                { v: "solo", l: "1인·2~5명" },
                                { v: "small", l: "6~30명" },
                                { v: "medium", l: "31~100명" },
                                { v: "large", l: "101~500명" },
                                { v: "enterprise", l: "500명+" },
                            ]}
                            onChange={arr => setForm(f => ({ ...f, practicalFilters: { ...f.practicalFilters, companySizeRanges: arr } }))}
                        />

                        <FilterSingle label="근무 형태"
                            value={form.practicalFilters.workMode}
                            options={[
                                { v: "remote", l: "재택" },
                                { v: "hybrid", l: "하이브리드" },
                                { v: "onsite", l: "출근" },
                                { v: "any", l: "무관" },
                            ]}
                            onChange={v => setForm(f => ({ ...f, practicalFilters: { ...f.practicalFilters, workMode: v } }))}
                        />

                        <FilterPick label="지리 범위 (복수)"
                            values={form.practicalFilters.locations}
                            options={[
                                { v: "seoul", l: "서울" },
                                { v: "gyeonggi", l: "경기" },
                                { v: "incheon", l: "인천" },
                                { v: "busan", l: "부산" },
                                { v: "daegu", l: "대구" },
                                { v: "other", l: "기타 지역" },
                                { v: "any", l: "지역 무관" },
                            ]}
                            onChange={arr => setForm(f => ({ ...f, practicalFilters: { ...f.practicalFilters, locations: arr } }))}
                        />

                        <div>
                            <p className="text-sm font-semibold mb-2">처우 하한 (연봉 기준, 만원)</p>
                            <div className="flex items-center gap-3">
                                <input type="number" value={form.practicalFilters.compensationFloor}
                                    onChange={e => setForm(f => ({ ...f, practicalFilters: { ...f.practicalFilters, compensationFloor: e.target.value } }))}
                                    placeholder="예: 6000" className="w-40 px-3 py-2 text-sm border border-neutral-200 rounded" />
                                <label className="flex items-center gap-1.5 text-xs text-neutral-600">
                                    <input type="checkbox" checked={form.practicalFilters.compensationFloorPublic}
                                        onChange={e => setForm(f => ({ ...f, practicalFilters: { ...f.practicalFilters, compensationFloorPublic: e.target.checked } }))} />
                                    기업에 공개
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 제출 */}
                <div className="mt-10 space-y-3">
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <button onClick={submit} disabled={submitting || completedCount < required.length}
                        className="w-full flex items-center justify-center gap-2 py-4 text-white font-bold rounded-lg transition-opacity disabled:opacity-40"
                        style={{ backgroundColor: HERO_RED }}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                        {submitting ? "제출 중..." : "제출하기"}
                    </button>
                    <p className="text-xs text-neutral-400 text-center">
                        초안은 자동 저장됩니다 · 제출 후 언제든 수정 가능
                    </p>
                </div>
            </div>
        </div>
    );
}

function FilterPick({ label, values, options, onChange }: {
    label: string;
    values: string[];
    options: { v: string; l: string }[];
    onChange: (arr: string[]) => void;
}) {
    const toggle = (v: string) => onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);
    return (
        <div>
            <p className="text-sm font-semibold mb-2">{label}</p>
            <div className="flex flex-wrap gap-2">
                {options.map(o => {
                    const on = values.includes(o.v);
                    return (
                        <button key={o.v} onClick={() => toggle(o.v)}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                on ? "border-red-500 bg-red-50 text-red-700" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                            }`}>
                            {o.l}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function FilterSingle({ label, value, options, onChange }: {
    label: string;
    value: string;
    options: { v: string; l: string }[];
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <p className="text-sm font-semibold mb-2">{label}</p>
            <div className="flex flex-wrap gap-2">
                {options.map(o => (
                    <button key={o.v} onClick={() => onChange(o.v)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                            value === o.v ? "border-red-500 bg-red-50 text-red-700" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                        }`}>
                        {o.l}
                    </button>
                ))}
            </div>
        </div>
    );
}
