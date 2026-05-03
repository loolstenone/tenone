"use client";

// 퍼스널 아이덴티티 — 단일 페이지 5섹션 (탭·중복 제거)
// SSOT: 비전 하우스 메타포 (Foundation → Walls → Roof) + 외부 환경 + 올해 실행
//
// 필드 매핑 (구 → 신, 데이터 손실 없이 우선순위로 fallback):
//  · Vision (Roof)    : vision_statement (1순위) → vision_roof → inside_vision
//  · Mission (Walls)  : mission_statement (1순위) → vision_walls
//  · 핵심 가치        : inside_values (1순위) → vision_foundation 파싱
//  · 강점             : inside_strengths
//  · 정체성 한 줄     : inside_who (선택)
//  · 시장 포지션      : outside_position
//  · 기회             : outside_opportunities
//  · 타인이 보는 나    : outside_perception
//  · Key Results       : key_results (실행 계획은 폐기 — KR과 중복)

import { useEffect, useMemo, useState } from "react";
import { Compass, Loader2, Plus, Trash2, FileText } from "lucide-react";
import type { PlannerIdentity, ResumeData } from "@/lib/planners/types";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";

const CATEGORIES = ["업무", "학업", "건강", "가족", "관계", "재무", "취미", "기타"];

const SKILL_LEVELS = ["초급", "중급", "고급", "전문"] as const;

export function IdentityView({ mode }: { mode: "weekly" | "all_in_one" }) {
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

    // 표시 우선순위로 단일 SSOT 값 도출
    const vision = useMemo(
        () => data.vision_statement ?? data.vision_roof ?? data.inside_vision ?? "",
        [data.vision_statement, data.vision_roof, data.inside_vision]
    );
    const mission = useMemo(
        () => data.mission_statement ?? data.vision_walls ?? "",
        [data.mission_statement, data.vision_walls]
    );

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 md:px-10 py-12">
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12 space-y-6">
            {/* Header */}
            <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Compass className="h-6 w-6 text-[#0F766E]" />
                        <h1 className="font-serif text-2xl md:text-3xl text-neutral-900">퍼스널 아이덴티티</h1>
                        {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                    </div>
                    <p className="text-sm text-neutral-500 mt-2">
                        나는 누구인가. 나는 무엇을 도모(圖謀)하고 있는가.
                    </p>
                </div>
                <PlannersUtilityLinks />
            </div>

            {/* 서브 네비게이션 — 페이지 내 앵커 점프 */}
            <nav className="sticky top-12 z-20 -mx-4 md:-mx-10 px-4 md:px-10 py-2 bg-[#FAFAF7]/95 backdrop-blur border-b border-neutral-200/70 flex items-center gap-1 overflow-x-auto">
                {[
                    { id: "vision", label: "비전" },
                    { id: "mission", label: "미션·역할" },
                    { id: "values", label: "가치·강점" },
                    ...(mode === "all_in_one" ? [{ id: "outside", label: "외부" }] : []),
                    { id: "kr", label: "Key Results" },
                    { id: "resume", label: "이력서" },
                ].map(s => (
                    <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="shrink-0 text-xs px-3 py-1.5 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                    >
                        {s.label}
                    </a>
                ))}
            </nav>

            {/* ① Roof — 비전 (한 줄) */}
            <Section
                id="vision"
                badge="ROOF"
                title="비전"
                hint="도달하고자 하는 최종 지점. 한 문장으로 적는다."
                accent
            >
                <Inline
                    value={vision}
                    onSave={(v) => save({ vision_statement: v })}
                    placeholder="예: 1만 명의 기획자에게 영감을 주는 플랫폼을 만든다"
                    serif
                />
            </Section>

            {/* ② Walls — 미션 / 역할 */}
            <Section
                id="mission"
                badge="WALLS"
                title="미션 · 역할"
                hint="비전을 떠받치는 역할들. 한 줄에 · 로 구분한다."
            >
                <Inline
                    value={mission}
                    onSave={(v) => save({ mission_statement: v })}
                    placeholder="예: 전략 기획력 · 크리에이티브 이해 · 클라이언트 신뢰"
                />
            </Section>

            {/* All in One 모드에서만 — 본질·환경 섹션 */}
            {mode === "all_in_one" && (
                <>
                    {/* ③ Foundation — 본질 (가치관·강점) */}
                    <Section
                        id="values"
                        badge="FOUNDATION"
                        title="본질"
                        hint="모든 것을 떠받치는 나의 가치관과 강점."
                    >
                        <FieldGrid>
                            <Field label="핵심 가치" hint="쉼표로 구분 (정직, 성장, 자유)">
                                <CommaInput
                                    items={data.inside_values ?? []}
                                    onSave={(arr) => save({ inside_values: arr })}
                                    placeholder="정직, 성장, 자유"
                                />
                            </Field>
                            <Field label="강점" hint="쉼표로 구분 (분석력, 공감, 끈기)">
                                <CommaInput
                                    items={data.inside_strengths ?? []}
                                    onSave={(arr) => save({ inside_strengths: arr })}
                                    placeholder="분석력, 공감, 끈기"
                                />
                            </Field>
                            <Field label="나는 누구인가" hint="한 줄로 자기 정의 (선택)" full>
                                <Inline
                                    value={data.inside_who ?? ""}
                                    onSave={(v) => save({ inside_who: v })}
                                    placeholder="예: 데이터와 직관을 잇는 광고 기획자"
                                />
                            </Field>
                        </FieldGrid>
                    </Section>

                    {/* ④ Context — 외부 환경 */}
                    <Section
                        id="outside"
                        badge="CONTEXT"
                        title="외부 환경"
                        hint="내가 서 있는 자리와 주변에 열려 있는 기회."
                    >
                        <FieldGrid>
                            <Field label="시장 포지션" hint="내가 속한 시장·커뮤니티에서의 위치">
                                <Inline
                                    value={data.outside_position ?? ""}
                                    onSave={(v) => save({ outside_position: v })}
                                    placeholder="예: 광고 대행사 시니어 AE / 브랜드 전략"
                                />
                            </Field>
                            <Field label="타인이 보는 나" hint="외부에서 인식되는 모습">
                                <Inline
                                    value={data.outside_perception ?? ""}
                                    onSave={(v) => save({ outside_perception: v })}
                                    placeholder="예: 신뢰할 수 있는 전략가"
                                />
                            </Field>
                            <Field label="기회" hint="지금 내게 열려 있는 기회들" full>
                                <MultiLine
                                    value={data.outside_opportunities ?? ""}
                                    onSave={(v) => save({ outside_opportunities: v })}
                                    placeholder="예: 신규 클라이언트 PT 2건 · 사외 강의 제안 · 글로벌 캠페인 합류"
                                />
                            </Field>
                        </FieldGrid>
                    </Section>
                </>
            )}

            {/* ⑤ Key Results — 올해 핵심 실행 */}
            <KeyResultsSection
                items={data.key_results ?? []}
                onSave={(arr) => save({ key_results: arr })}
            />

            {/* ⑥ Resume — 이력서 (학력·경력·자격증·기술·언어·수상) */}
            <ResumeSection
                value={data.resume ?? {}}
                onSave={(r) => save({ resume: r })}
            />
        </div>
    );
}

/* ── 공통 카드 셸 ──────────────────────────────────────── */
function Section({ id, badge, title, hint, children, accent }: {
    id?: string; badge: string; title: string; hint?: string; children: React.ReactNode; accent?: boolean;
}) {
    return (
        <section id={id} className={`bg-white rounded-xl p-6 scroll-mt-28 ${accent ? "border-2 border-[#0F766E]/30" : "border border-neutral-200"}`}>
            <div className="mb-3">
                <div className="flex items-baseline gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#0F766E] font-semibold">{badge}</span>
                    <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
                </div>
                {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
            </div>
            {children}
        </section>
    );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, hint, children, full }: { label: string; hint?: string; children: React.ReactNode; full?: boolean }) {
    return (
        <div className={full ? "md:col-span-2" : ""}>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{label}</label>
            {hint && <p className="text-[11px] text-neutral-400 mb-1.5">{hint}</p>}
            {children}
        </div>
    );
}

/* ── 인라인 입력 (한 줄) ──────────────────────────────────── */
function Inline({ value, onSave, placeholder, serif }: {
    value: string; onSave: (v: string) => void; placeholder?: string; serif?: boolean;
}) {
    const [v, setV] = useState(value);
    useEffect(() => setV(value), [value]);
    return (
        <input
            type="text"
            value={v}
            onChange={(e) => setV(e.target.value)}
            onBlur={() => v !== value && onSave(v)}
            placeholder={placeholder}
            className={`w-full bg-transparent focus:outline-none border-b border-neutral-200 pb-1.5 placeholder:text-neutral-300 ${
                serif ? "text-lg font-serif text-neutral-900" : "text-sm text-neutral-900"
            }`}
        />
    );
}

function MultiLine({ value, onSave, placeholder }: { value: string; onSave: (v: string) => void; placeholder?: string }) {
    const [v, setV] = useState(value);
    useEffect(() => setV(value), [value]);
    return (
        <textarea
            value={v}
            onChange={(e) => setV(e.target.value)}
            onBlur={() => v !== value && onSave(v)}
            placeholder={placeholder}
            rows={2}
            className="w-full text-sm text-neutral-900 bg-transparent focus:outline-none resize-none border-b border-neutral-200 pb-1.5 placeholder:text-neutral-300"
        />
    );
}

function CommaInput({ items, onSave, placeholder }: { items: string[]; onSave: (arr: string[]) => void; placeholder?: string }) {
    const [v, setV] = useState(items.join(", "));
    useEffect(() => setV(items.join(", ")), [items]);
    return (
        <input
            type="text"
            value={v}
            onChange={(e) => setV(e.target.value)}
            onBlur={() => {
                const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
                if (arr.join(",") !== items.join(",")) onSave(arr);
            }}
            placeholder={placeholder}
            className="w-full text-sm text-neutral-900 bg-transparent focus:outline-none border-b border-neutral-200 pb-1.5 placeholder:text-neutral-300"
        />
    );
}

/* ── Key Results 섹션 ───────────────────────────────────── */
function KeyResultsSection({ items, onSave }: {
    items: Array<{ id: string; category: string; text: string }>;
    onSave: (arr: Array<{ id: string; category: string; text: string }>) => void;
}) {
    const [krs, setKrs] = useState(items);
    useEffect(() => setKrs(items), [items]);

    function add() {
        const next = [...krs, { id: `kr_${Date.now()}`, category: "업무", text: "" }];
        setKrs(next);
        onSave(next);
    }
    function update(id: string, patch: Partial<{ category: string; text: string }>) {
        setKrs((prev) => prev.map((k) => (k.id === id ? { ...k, ...patch } : k)));
    }
    function commit() { onSave(krs); }
    function remove(id: string) {
        const next = krs.filter((k) => k.id !== id);
        setKrs(next);
        onSave(next);
    }

    return (
        <section id="kr" className="bg-white border border-neutral-200 rounded-xl p-6 scroll-mt-28">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-[#0F766E] font-semibold">KEY RESULTS</span>
                        <h2 className="text-sm font-semibold text-neutral-800">올해 핵심 실행</h2>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">비전·미션을 구체 행동으로 끌어내리는 항목.</p>
                </div>
                <button
                    onClick={add}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#0F766E] text-white text-xs rounded hover:bg-[#0d5e56] transition-colors"
                >
                    <Plus className="h-3 w-3" /> 추가
                </button>
            </div>
            <div className="space-y-2">
                {krs.length === 0 && (
                    <p className="text-sm text-neutral-400 py-6 text-center">아직 Key Result가 없습니다.</p>
                )}
                {krs.map((kr) => (
                    <div key={kr.id} className="group flex items-center gap-2 bg-neutral-50 rounded-lg px-3 py-2">
                        <select
                            value={kr.category}
                            onChange={(e) => update(kr.id, { category: e.target.value })}
                            onBlur={commit}
                            className="text-xs bg-white border border-neutral-200 rounded px-2 py-1 text-neutral-700 focus:outline-none"
                        >
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                            type="text"
                            value={kr.text}
                            onChange={(e) => update(kr.id, { text: e.target.value })}
                            onBlur={commit}
                            placeholder="Key Result"
                            className="flex-1 text-sm bg-transparent focus:outline-none"
                        />
                        <button
                            onClick={() => remove(kr.id)}
                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ── 이력서 섹션 ───────────────────────────────────────── */
function ResumeSection({ value, onSave }: {
    value: ResumeData;
    onSave: (r: ResumeData) => void;
}) {
    const update = (patch: Partial<ResumeData>) => onSave({ ...value, ...patch });

    return (
        <section id="resume" className="bg-white border border-neutral-200 rounded-xl p-6 scroll-mt-28">
            <div className="flex items-baseline gap-2 mb-1">
                <FileText className="h-4 w-4 text-[#0F766E]" />
                <span className="text-[10px] uppercase tracking-widest text-[#0F766E] font-semibold">RESUME</span>
                <h2 className="text-sm font-semibold text-neutral-800">이력서</h2>
            </div>
            <p className="text-xs text-neutral-500 mb-5">살아온 궤적 — 학력·경력·자격·기술·언어·수상. 비전·미션의 토대가 된다.</p>

            <div className="space-y-5">
                <ResumeListBlock
                    title="학력"
                    items={value.education ?? []}
                    onChange={(arr) => update({ education: arr })}
                    placeholders={{ school: "학교명", major: "전공", period: "기간 (예: 2018.03–2022.02)", status: "졸업/재학" }}
                    fields={["school", "major", "period", "status"]}
                    keyField="school"
                />
                <ResumeListBlock
                    title="경력"
                    items={value.career ?? []}
                    onChange={(arr) => update({ career: arr })}
                    placeholders={{ company: "회사명", role: "직무·직책", period: "기간", description: "주요 업무·성과" }}
                    fields={["company", "role", "period", "description"]}
                    keyField="company"
                    multilineField="description"
                />
                <ResumeListBlock
                    title="자격증"
                    items={value.certifications ?? []}
                    onChange={(arr) => update({ certifications: arr })}
                    placeholders={{ name: "자격명", issuer: "발급기관", year: "취득년도" }}
                    fields={["name", "issuer", "year"]}
                    keyField="name"
                />
                <ResumeListBlock
                    title="기술"
                    items={value.skills ?? []}
                    onChange={(arr) => update({ skills: arr })}
                    placeholders={{ name: "기술·도구명", level: "수준" }}
                    fields={["name", "level"]}
                    keyField="name"
                    selectField={{ key: "level", options: SKILL_LEVELS }}
                />
                <ResumeListBlock
                    title="언어"
                    items={value.languages ?? []}
                    onChange={(arr) => update({ languages: arr })}
                    placeholders={{ name: "언어 (예: 영어)", level: "수준 (예: 비즈니스 수준)" }}
                    fields={["name", "level"]}
                    keyField="name"
                />
                <ResumeListBlock
                    title="수상"
                    items={value.awards ?? []}
                    onChange={(arr) => update({ awards: arr })}
                    placeholders={{ title: "수상명", org: "기관", year: "년도" }}
                    fields={["title", "org", "year"]}
                    keyField="title"
                />
            </div>
        </section>
    );
}

/* 이력서 항목 1블록 — 학력/경력/자격/기술/언어/수상 공통 패턴 */
function ResumeListBlock<T extends { id: string }>({
    title, items, onChange, placeholders, fields, keyField, multilineField, selectField,
}: {
    title: string;
    items: T[];
    onChange: (arr: T[]) => void;
    placeholders: Partial<Record<keyof T, string>>;
    fields: (keyof T)[];
    keyField: keyof T;
    multilineField?: keyof T;
    selectField?: { key: keyof T; options: readonly string[] };
}) {
    const [list, setList] = useState<T[]>(items);
    useEffect(() => setList(items), [items]);

    function add() {
        const blank = { id: `r_${Date.now()}` } as T;
        const next = [...list, blank];
        setList(next);
        onChange(next);
    }
    function patch(id: string, p: Partial<T>) {
        setList(prev => prev.map(it => it.id === id ? { ...it, ...p } : it));
    }
    function commit() { onChange(list); }
    function remove(id: string) {
        const next = list.filter(it => it.id !== id);
        setList(next);
        onChange(next);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-neutral-700">{title}</h3>
                <button onClick={add} className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#0F766E] hover:bg-[#0F766E]/10 rounded transition-colors">
                    <Plus className="h-3 w-3" /> 추가
                </button>
            </div>
            {list.length === 0 ? (
                <p className="text-xs text-neutral-400 py-3 text-center bg-neutral-50 rounded">아직 항목이 없습니다.</p>
            ) : (
                <div className="space-y-1.5">
                    {list.map(item => (
                        <div key={item.id} className="group bg-neutral-50 rounded-lg px-3 py-2 space-y-1.5">
                            <div className="flex items-start gap-2">
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {fields.filter(f => f !== multilineField).map(f => {
                                        if (selectField && f === selectField.key) {
                                            return (
                                                <select
                                                    key={String(f)}
                                                    value={(item[f] as string) ?? ""}
                                                    onChange={(e) => patch(item.id, { [f]: e.target.value || undefined } as Partial<T>)}
                                                    onBlur={commit}
                                                    className="text-xs bg-white border border-neutral-200 rounded px-2 py-1 text-neutral-700 focus:outline-none"
                                                >
                                                    <option value="">선택</option>
                                                    {selectField.options.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            );
                                        }
                                        const isKey = f === keyField;
                                        return (
                                            <input
                                                key={String(f)}
                                                type="text"
                                                value={(item[f] as string) ?? ""}
                                                onChange={(e) => patch(item.id, { [f]: e.target.value } as Partial<T>)}
                                                onBlur={commit}
                                                placeholder={placeholders[f]}
                                                className={`bg-transparent focus:outline-none border-b border-neutral-200 pb-1 text-xs placeholder:text-neutral-300 ${
                                                    isKey ? "font-medium text-neutral-900" : "text-neutral-700"
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => remove(item.id)}
                                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity shrink-0 mt-1"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            {multilineField && (
                                <textarea
                                    value={(item[multilineField] as string) ?? ""}
                                    onChange={(e) => patch(item.id, { [multilineField]: e.target.value } as Partial<T>)}
                                    onBlur={commit}
                                    placeholder={placeholders[multilineField]}
                                    rows={2}
                                    className="w-full text-xs text-neutral-700 bg-transparent focus:outline-none resize-none border-t border-neutral-200/70 pt-1.5 placeholder:text-neutral-300"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
