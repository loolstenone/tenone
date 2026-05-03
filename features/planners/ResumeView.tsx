"use client";

// 이력서 페이지 — /planners/app/identity/resume
// PDF 표준 이력서 구조 (인적사항·학력·병적·경력·수상·업무경험·브랜드·강의·심사·기타활동)
// IdentityView와 별도 페이지로 분리됨 (한 페이지에 다 넣지 않음).

import { useEffect, useState } from "react";
import { FileText, Loader2, Plus, Trash2, User } from "lucide-react";
import type { PlannerIdentity, ResumeData } from "@/lib/planners/types";
import { IdentitySubNav } from "./IdentitySubNav";

export function ResumeView() {
    const [data, setData] = useState<Partial<PlannerIdentity>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
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

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 md:px-10 py-12">
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            </div>
        );
    }

    const resume: ResumeData = data.resume ?? {};
    const updateResume = (patch: ResumeData) => save({ resume: { ...resume, ...patch } });

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12 space-y-6">
            {/* Header */}
            <div className="mb-2">
                <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-[#0F766E]" />
                    <h1 className="font-serif text-2xl md:text-3xl text-neutral-900">이력서</h1>
                    {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                </div>
                <p className="text-sm text-neutral-500 mt-2">
                    살아온 궤적 — 학력·경력·수상·강의·심사·활동. 비전·미션의 토대가 된다.
                </p>
            </div>

            <IdentitySubNav active="resume" />

            {/* ── 인적 사항 ────────────────────────────────────────── */}
            <Section badge="01" title="인적 사항" icon={<User className="h-4 w-4 text-[#0F766E]" />}>
                <PersonalBlock
                    value={resume.personal ?? {}}
                    onSave={(p) => updateResume({ personal: p })}
                />
            </Section>

            {/* ── 학력 ──────────────────────────────────────────── */}
            <Section badge="02" title="학력">
                <ListBlock
                    items={resume.education ?? []}
                    onChange={(arr) => updateResume({ education: arr })}
                    fields={["period", "school", "major", "status"]}
                    placeholders={{ period: "기간", school: "학교명", major: "전공", status: "졸업/재학/석사" }}
                    keyField="school"
                />
            </Section>

            {/* ── 병적 사항 ────────────────────────────────────── */}
            <Section badge="03" title="병적 사항">
                <MilitaryBlock
                    value={resume.military ?? {}}
                    onSave={(m) => updateResume({ military: m })}
                />
            </Section>

            {/* ── 경력 ────────────────────────────────────────── */}
            <Section badge="04" title="경력 사항">
                <ListBlock
                    items={resume.career ?? []}
                    onChange={(arr) => updateResume({ career: arr })}
                    fields={["period", "company", "role", "description"]}
                    placeholders={{ period: "기간 (예: 2022.01–현재)", company: "회사명", role: "직책·팀", description: "주요 클라이언트·업무" }}
                    keyField="company"
                    multilineField="description"
                />
            </Section>

            {/* ── 수상 경력 ──────────────────────────────────── */}
            <Section badge="05" title="수상 경력">
                <ListBlock
                    items={resume.awards ?? []}
                    onChange={(arr) => updateResume({ awards: arr })}
                    fields={["year", "title", "project", "client"]}
                    placeholders={{ year: "년도", title: "수상명", project: "캠페인·작품", client: "클라이언트" }}
                    keyField="title"
                />
            </Section>

            {/* ── 업무 경험 분야 ───────────────────────────── */}
            <Section badge="06" title="업무 경험 분야">
                <ListBlock
                    items={resume.experience_areas ?? []}
                    onChange={(arr) => updateResume({ experience_areas: arr })}
                    fields={["area", "description"]}
                    placeholders={{ area: "분야 (ATL/BTL/디지털/브랜드 컨설팅 등)", description: "구체 업무" }}
                    keyField="area"
                    multilineField="description"
                />
            </Section>

            {/* ── 브랜드 카테고리 경험 ──────────────────────── */}
            <Section badge="07" title="브랜드 카테고리 경험">
                <ListBlock
                    items={resume.brand_categories ?? []}
                    onChange={(arr) => updateResume({ brand_categories: arr })}
                    fields={["category", "brands"]}
                    placeholders={{ category: "카테고리 (금융/육아/헬스케어 등)", brands: "브랜드·클라이언트 목록" }}
                    keyField="category"
                    multilineField="brands"
                />
            </Section>

            {/* ── 강의 경력 ──────────────────────────────────── */}
            <Section badge="08" title="강의 경력">
                <ListBlock
                    items={resume.lectures ?? []}
                    onChange={(arr) => updateResume({ lectures: arr })}
                    fields={["year", "org", "topic"]}
                    placeholders={{ year: "년도", org: "기관·학교", topic: "주제·과목" }}
                    keyField="org"
                />
            </Section>

            {/* ── 심사 경력 ──────────────────────────────────── */}
            <Section badge="09" title="심사 경력">
                <ListBlock
                    items={resume.judging ?? []}
                    onChange={(arr) => updateResume({ judging: arr })}
                    fields={["period", "org", "role"]}
                    placeholders={{ period: "기간", org: "심사 기관", role: "역할·분야" }}
                    keyField="org"
                />
            </Section>

            {/* ── 기타 활동 (운영중·종료) ──────────────────── */}
            <Section badge="10" title="기타 활동">
                <ListBlock
                    items={resume.side_projects ?? []}
                    onChange={(arr) => updateResume({ side_projects: arr })}
                    fields={["status", "period", "name", "description"]}
                    placeholders={{ status: "active/ended", period: "기간", name: "프로젝트·사이트명 (URL)", description: "설명" }}
                    keyField="name"
                    multilineField="description"
                    selectField={{ key: "status", options: ["active", "ended"] }}
                />
            </Section>
        </div>
    );
}

/* ── 카드 셸 ──────────────────────────────────────────── */
function Section({ badge, title, icon, children }: {
    badge: string; title: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                {icon}
                <span className="text-[10px] uppercase tracking-widest text-[#0F766E] font-semibold">{badge}</span>
                <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
            </div>
            {children}
        </section>
    );
}

/* ── 인적 사항 블록 ───────────────────────────────────── */
function PersonalBlock({ value, onSave }: {
    value: NonNullable<ResumeData["personal"]>;
    onSave: (v: NonNullable<ResumeData["personal"]>) => void;
}) {
    const [v, setV] = useState(value);
    useEffect(() => setV(value), [value]);
    const update = (k: keyof typeof v, val: string) => setV(prev => ({ ...prev, [k]: val }));
    const commit = () => onSave(v);

    const F = ({ label, k, placeholder, full }: { label: string; k: keyof typeof v; placeholder?: string; full?: boolean }) => (
        <div className={full ? "md:col-span-2" : ""}>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{label}</label>
            <input
                type="text"
                value={(v[k] as string) ?? ""}
                onChange={(e) => update(k, e.target.value)}
                onBlur={commit}
                placeholder={placeholder}
                className="w-full bg-transparent focus:outline-none border-b border-neutral-200 pb-1.5 text-sm text-neutral-900 placeholder:text-neutral-300"
            />
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F label="이름 (한글)" k="name_ko" placeholder="홍길동" />
            <F label="이름 (영문)" k="name_en" placeholder="Gildong Hong" />
            <F label="한자" k="name_hanja" placeholder="洪吉童" />
            <F label="생년월일" k="birth" placeholder="1990-01-01" />
            <F label="주소" k="address" placeholder="서울시…" full />
            <F label="휴대전화" k="phone" placeholder="010-…" />
            <F label="이메일" k="email" placeholder="you@example.com" />
            <F label="홈페이지" k="homepage" placeholder="https://…" full />
        </div>
    );
}

/* ── 병적 사항 블록 ───────────────────────────────────── */
function MilitaryBlock({ value, onSave }: {
    value: NonNullable<ResumeData["military"]>;
    onSave: (v: NonNullable<ResumeData["military"]>) => void;
}) {
    const [v, setV] = useState(value);
    useEffect(() => setV(value), [value]);
    const update = (k: keyof typeof v, val: string) => setV(prev => ({ ...prev, [k]: val }));
    const commit = () => onSave(v);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="기간">
                <input
                    type="text"
                    value={v.period ?? ""}
                    onChange={(e) => update("period", e.target.value)}
                    onBlur={commit}
                    placeholder="1997.07.01 ~ 1999.08.31"
                    className="w-full bg-transparent focus:outline-none border-b border-neutral-200 pb-1.5 text-sm text-neutral-900 placeholder:text-neutral-300"
                />
            </Field>
            <Field label="구분">
                <input
                    type="text"
                    value={v.status ?? ""}
                    onChange={(e) => update("status", e.target.value)}
                    onBlur={commit}
                    placeholder="만기 제대 / 면제 / 미필"
                    className="w-full bg-transparent focus:outline-none border-b border-neutral-200 pb-1.5 text-sm text-neutral-900 placeholder:text-neutral-300"
                />
            </Field>
            <Field label="비고">
                <input
                    type="text"
                    value={v.notes ?? ""}
                    onChange={(e) => update("notes", e.target.value)}
                    onBlur={commit}
                    placeholder="병과·계급 등"
                    className="w-full bg-transparent focus:outline-none border-b border-neutral-200 pb-1.5 text-sm text-neutral-900 placeholder:text-neutral-300"
                />
            </Field>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{label}</label>
            {children}
        </div>
    );
}

/* ── 반복 항목 블록 (학력/경력/수상/업무경험/등) ─────────── */
function ListBlock<T extends { id: string; status?: string }>({
    items, onChange, fields, placeholders, keyField, multilineField, selectField,
}: {
    items: T[];
    onChange: (arr: T[]) => void;
    fields: (keyof T)[];
    placeholders: Partial<Record<keyof T, string>>;
    keyField: keyof T;
    multilineField?: keyof T;
    selectField?: { key: keyof T; options: readonly string[] };
}) {
    const [list, setList] = useState<T[]>(items);
    useEffect(() => setList(items), [items]);

    function add() {
        const blank = { id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` } as T;
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

    const inlineFields = fields.filter(f => f !== multilineField);

    return (
        <div>
            <div className="flex justify-end mb-2">
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
                                <div className={`flex-1 grid gap-2 grid-cols-1 ${inlineFields.length === 2 ? "sm:grid-cols-2" : inlineFields.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
                                    {inlineFields.map(f => {
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
