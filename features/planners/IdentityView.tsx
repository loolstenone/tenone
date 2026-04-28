"use client";

import { useEffect, useState } from "react";
import { Compass, Loader2, Plus, Trash2 } from "lucide-react";
import type { PlannerIdentity } from "@/lib/planners/types";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { useSwipeNav } from "./useSwipeNav";

type Tab = "vision" | "inside" | "outside" | "house";

export function IdentityView({ mode }: { mode: "weekly" | "all_in_one" }) {
    const [tab, setTab] = useState<Tab>("vision");
    const [data, setData] = useState<Partial<PlannerIdentity>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/planners/identity`);
            if (cancelled) return;
            if (res.ok) {
                const d = await res.json();
                setData(d.identity || {});
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, []);

    async function save(patch: Partial<PlannerIdentity>) {
        const next = { ...data, ...patch };
        setData(next);
        setSaving(true);
        try {
            await fetch(`/api/planners/identity`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
        } finally {
            setSaving(false);
        }
    }

    const tabs: Array<{ key: Tab; label: string; showInWeekly: boolean }> = [
        { key: "vision", label: "Vision & Mission", showInWeekly: true },
        { key: "inside", label: "Inside-Out (나)", showInWeekly: false },
        { key: "outside", label: "Outside-In (세상)", showInWeekly: false },
        { key: "house", label: "Vision House", showInWeekly: false },
    ];
    const visibleTabs = mode === "weekly" ? tabs.filter(t => t.showInWeekly) : tabs;

    const tabIdx = visibleTabs.findIndex(t => t.key === tab);
    const swipeRef = useSwipeNav(
        () => { if (tabIdx < visibleTabs.length - 1) setTab(visibleTabs[tabIdx + 1].key); },
        () => { if (tabIdx > 0) setTab(visibleTabs[tabIdx - 1].key); },
    );

    return (
        <div ref={swipeRef} className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Compass className="h-6 w-6 text-[#0F766E]" />
                        <h1 className="font-serif text-3xl text-neutral-900">Personal Identity</h1>
                        {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                    </div>
                    <p className="text-sm text-neutral-500 mt-2">
                        나는 누구인가. 나는 무엇을 도모(圖謀)하고 있는가.
                    </p>
                </div>
                <PlannersUtilityLinks />
            </div>

            {/* Tabs */}
            {visibleTabs.length > 1 && (
                <div className="border-b border-neutral-200 mb-8">
                    <div className="flex gap-1">
                        {visibleTabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
                                    tab === t.key
                                        ? "border-[#0F766E] text-[#0F766E] font-semibold"
                                        : "border-transparent text-neutral-500 hover:text-neutral-900"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="space-y-6">
                    {tab === "vision" && <VisionTab data={data} save={save} />}
                    {tab === "inside" && mode === "all_in_one" && <InsideTab data={data} save={save} />}
                    {tab === "outside" && mode === "all_in_one" && <OutsideTab data={data} save={save} />}
                    {tab === "house" && mode === "all_in_one" && <HouseTab data={data} save={save} />}
                </div>
            )}
        </div>
    );
}

function VisionTab({ data, save }: { data: Partial<PlannerIdentity>; save: (p: Partial<PlannerIdentity>) => void }) {
    const [vision, setVision] = useState(data.vision_statement || "");
    const [mission, setMission] = useState(data.mission_statement || "");
    const [plan, setPlan] = useState(data.execution_plan || "");
    const [krs, setKrs] = useState(data.key_results || []);

    useEffect(() => {
        setVision(data.vision_statement || "");
        setMission(data.mission_statement || "");
        setPlan(data.execution_plan || "");
        setKrs(data.key_results || []);
    }, [data.vision_statement, data.mission_statement, data.execution_plan, data.key_results]);

    function addKR() {
        const next = [...krs, { id: `kr_${Date.now()}`, category: "업무", text: "" }];
        setKrs(next);
        save({ key_results: next });
    }

    function updateKR(id: string, patch: Partial<{ category: string; text: string }>) {
        const next = krs.map(k => k.id === id ? { ...k, ...patch } : k);
        setKrs(next);
    }

    function removeKR(id: string) {
        const next = krs.filter(k => k.id !== id);
        setKrs(next);
        save({ key_results: next });
    }

    const CATEGORIES = ["업무", "학업", "건강", "가족", "관계", "재무", "취미", "기타"];

    return (
        <>
            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Vision</label>
                <p className="text-xs text-neutral-500 mb-3">나의 지향점, 되고 싶은 것</p>
                <textarea
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    onBlur={() => save({ vision_statement: vision })}
                    placeholder="예: 1만 명의 기획자에게 영감을 주는 플랫폼을 만든다"
                    rows={2}
                    className="w-full text-lg font-serif text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none border-b border-neutral-200 pb-2"
                />
            </section>

            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Mission</label>
                <p className="text-xs text-neutral-500 mb-3">비전을 실현하기 위해 해야 하는 것</p>
                <textarea
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    onBlur={() => save({ mission_statement: mission })}
                    placeholder="예: 매일 한 명의 기획자와 깊은 대화를 나눈다"
                    rows={2}
                    className="w-full text-lg font-serif text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none border-b border-neutral-200 pb-2"
                />
            </section>

            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Key Results</label>
                        <p className="text-xs text-neutral-500">목표를 달성하기 위한 구체적 실행 항목</p>
                    </div>
                    <button
                        onClick={addKR}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#0F766E] text-white text-xs rounded hover:bg-[#0d5e56] transition-colors"
                    >
                        <Plus className="h-3 w-3" /> 추가
                    </button>
                </div>
                <div className="space-y-2">
                    {krs.length === 0 && (
                        <p className="text-sm text-neutral-400 py-4 text-center">아직 Key Result가 없습니다.</p>
                    )}
                    {krs.map((kr) => (
                        <div key={kr.id} className="group flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-2">
                            <select
                                value={kr.category}
                                onChange={(e) => updateKR(kr.id, { category: e.target.value })}
                                onBlur={() => save({ key_results: krs })}
                                className="text-xs bg-white border border-neutral-200 rounded px-2 py-1 text-neutral-700 focus:outline-none"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input
                                type="text"
                                value={kr.text}
                                onChange={(e) => updateKR(kr.id, { text: e.target.value })}
                                onBlur={() => save({ key_results: krs })}
                                placeholder="Key Result"
                                className="flex-1 text-sm bg-transparent focus:outline-none"
                            />
                            <button
                                onClick={() => removeKR(kr.id)}
                                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">실행 계획</label>
                <textarea
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    onBlur={() => save({ execution_plan: plan })}
                    placeholder="구체적인 실행 계획을 적어보세요"
                    rows={5}
                    className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none"
                />
            </section>
        </>
    );
}

function InsideTab({ data, save }: { data: Partial<PlannerIdentity>; save: (p: Partial<PlannerIdentity>) => void }) {
    const [who, setWho] = useState(data.inside_who || "");
    const [vision, setVision] = useState(data.inside_vision || "");
    const [values, setValues] = useState((data.inside_values || []).join(", "));
    const [strengths, setStrengths] = useState((data.inside_strengths || []).join(", "));

    return (
        <>
            <BlockTextarea
                label="나는 누구인가"
                hint="내가 생각하는 나의 본질"
                value={who}
                onChange={setWho}
                onBlur={() => save({ inside_who: who })}
            />
            <BlockTextarea
                label="핵심 가치"
                hint="쉼표로 구분 (예: 정직, 성장, 자유)"
                value={values}
                onChange={setValues}
                onBlur={() => save({ inside_values: values.split(",").map(s => s.trim()).filter(Boolean) })}
                rows={2}
            />
            <BlockTextarea
                label="강점"
                hint="쉼표로 구분 (예: 분석력, 공감, 끈기)"
                value={strengths}
                onChange={setStrengths}
                onBlur={() => save({ inside_strengths: strengths.split(",").map(s => s.trim()).filter(Boolean) })}
                rows={2}
            />
            <BlockTextarea
                label="개인 비전"
                hint="내면에서 출발한 나의 비전"
                value={vision}
                onChange={setVision}
                onBlur={() => save({ inside_vision: vision })}
            />
        </>
    );
}

function OutsideTab({ data, save }: { data: Partial<PlannerIdentity>; save: (p: Partial<PlannerIdentity>) => void }) {
    const [position, setPosition] = useState(data.outside_position || "");
    const [perception, setPerception] = useState(data.outside_perception || "");
    const [opportunities, setOpportunities] = useState(data.outside_opportunities || "");

    return (
        <>
            <BlockTextarea label="시장 포지션" hint="내가 속한 시장·커뮤니티에서의 위치" value={position} onChange={setPosition} onBlur={() => save({ outside_position: position })} />
            <BlockTextarea label="타인이 보는 나" hint="외부에서 나를 어떻게 인식하는가" value={perception} onChange={setPerception} onBlur={() => save({ outside_perception: perception })} />
            <BlockTextarea label="기회" hint="지금 내게 열려 있는 기회들" value={opportunities} onChange={setOpportunities} onBlur={() => save({ outside_opportunities: opportunities })} />
        </>
    );
}

function HouseTab({ data, save }: { data: Partial<PlannerIdentity>; save: (p: Partial<PlannerIdentity>) => void }) {
    const [foundation, setFoundation] = useState(data.vision_foundation || "");
    const [walls, setWalls] = useState(data.vision_walls || "");
    const [roof, setRoof] = useState(data.vision_roof || "");

    return (
        <>
            <BlockTextarea label="Roof — 비전 / 목적지" hint="도달하고자 하는 최종 지점" value={roof} onChange={setRoof} onBlur={() => save({ vision_roof: roof })} />
            <BlockTextarea label="Walls — 미션 / 역할" hint="비전을 떠받치는 역할들" value={walls} onChange={setWalls} onBlur={() => save({ vision_walls: walls })} />
            <BlockTextarea label="Foundation — 가치관 / 기초" hint="모든 것을 떠받치는 기반" value={foundation} onChange={setFoundation} onBlur={() => save({ vision_foundation: foundation })} />
        </>
    );
}

function BlockTextarea({ label, hint, value, onChange, onBlur, rows = 3 }: {
    label: string; hint?: string; value: string; onChange: (v: string) => void; onBlur: () => void; rows?: number;
}) {
    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-6">
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{label}</label>
            {hint && <p className="text-xs text-neutral-500 mb-3">{hint}</p>}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                rows={rows}
                className="w-full text-sm text-neutral-900 focus:outline-none bg-transparent resize-none"
            />
        </section>
    );
}
