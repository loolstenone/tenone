"use client";

/**
 * JD 7블록 에디터 — 재사용 컴포넌트
 * 신규/편집 모두 사용
 */

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Send, Archive, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const HERO_RED = "#E53935";

export interface JDInitialValues {
    id?: string;
    positionTitle: string;
    summary: string;
    blocks: Record<string, unknown>;
    employmentType: string;
    experienceRange: string;
    status: string;
}

const EMPTY: JDInitialValues = {
    positionTitle: "",
    summary: "",
    blocks: {},
    employmentType: "",
    experienceRange: "",
    status: "draft",
};

const EMPLOYMENT_OPTIONS = [
    { value: "full_time", label: "정규직" },
    { value: "contract", label: "계약직" },
    { value: "freelance", label: "프리랜서" },
    { value: "intern", label: "인턴" },
];

export default function JDEditor({
    companyId,
    initial,
    onSaved,
}: {
    companyId: string;
    initial?: JDInitialValues;
    onSaved: (id: string) => void;
}) {
    const { user } = useAuth();
    const [form, setForm] = useState<JDInitialValues>(initial ?? EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function setBlock(key: string, value: string | string[]) {
        setForm(f => ({ ...f, blocks: { ...f.blocks, [key]: value } }));
    }

    async function save(nextStatus: "draft" | "published" | "archived") {
        if (!user?.id) return;
        if (!form.positionTitle.trim()) { setError("포지션 타이틀은 필수입니다."); return; }

        setSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/hero/jd", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: form.id,
                    memberId: user.id,
                    companyId,
                    positionTitle: form.positionTitle.trim(),
                    summary: form.summary.trim() || undefined,
                    blocks: form.blocks,
                    employmentType: form.employmentType || undefined,
                    experienceRange: form.experienceRange || undefined,
                    status: nextStatus,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
            onSaved(data.id);
        } catch (e) {
            setError(e instanceof Error ? e.message : "저장 실패");
            setSaving(false);
        }
    }

    const block = (key: string): string => (form.blocks[key] as string) ?? "";

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-2xl mx-auto px-6">
                <Link href={`/hero/company/${companyId}/jd`} className="flex items-center gap-1 text-xs text-neutral-500 mb-4 hover:text-neutral-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> JD 목록
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold mb-1">
                        {form.id ? "JD 편집" : "새 JD 작성"}
                    </h1>
                    <p className="text-sm text-neutral-500">
                        HeRo 권장: 500~800자 · 스펙 나열이 아닌 서사 · 영웅이 읽고 "내 문제다"라고 느끼게
                    </p>
                </div>

                <div className="space-y-6">
                    {/* 블록 1: 타이틀 */}
                    <Card title="① 포지션 타이틀과 한 줄 요약" hint="무엇을 풀 사람을 찾는지 한 문장으로">
                        <input value={form.positionTitle} onChange={e => setForm({ ...form, positionTitle: e.target.value })}
                            placeholder='예: "D2C 브랜드 리더"' className={H3_INPUT} />
                        <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })}
                            placeholder='예: "중소 제조업 브랜드팀을 맡아 D2C 채널을 새로 엽니다."'
                            rows={2} className={`${TEXT_INPUT} mt-3`} />
                    </Card>

                    {/* 블록 2 */}
                    <Card title="② 우리는 지금" hint="TIH 국면·고민을 2~3문장으로 솔직하게">
                        <textarea value={block("block2_now")} onChange={e => setBlock("block2_now", e.target.value)}
                            placeholder="창업 5년차, 직원 30명 규모입니다..." rows={4} className={TEXT_INPUT} />
                    </Card>

                    {/* 블록 3 */}
                    <Card title="③ 풀어야 하는 문제" hint="TIH의 고민을 이 자리의 과제로 변환 · bullet 3~5개">
                        <ArrayInput value={(form.blocks["block3_problems"] as string[]) ?? []}
                            onChange={arr => setBlock("block3_problems", arr)}
                            placeholder="예: 브랜드 아이덴티티 부재에서 D2C 시작" />
                    </Card>

                    {/* 블록 4 */}
                    <Card title="④ 실제로 하게 되는 일">
                        <Field label="6개월 내 주 업무">
                            <textarea value={block("block4_work_6m")} onChange={e => setBlock("block4_work_6m", e.target.value)}
                                rows={3} className={TEXT_INPUT} />
                        </Field>
                        <Field label="1~3년 중기 업무">
                            <textarea value={block("block4_work_mid")} onChange={e => setBlock("block4_work_mid", e.target.value)}
                                rows={3} className={TEXT_INPUT} />
                        </Field>
                        <Field label="JD 외 업무 (솔직 공개)" hint="운영·관계·정치·잡일 비중. 덮을수록 의심받습니다.">
                            <textarea value={block("block4_non_jd")} onChange={e => setBlock("block4_non_jd", e.target.value)}
                                placeholder='예: "초기 6개월은 팀 세팅과 외부 파트너 미팅에 50% 이상 시간이 갑니다."'
                                rows={3} className={TEXT_INPUT} />
                        </Field>
                    </Card>

                    {/* 블록 5 */}
                    <Card title="⑤ 이 자리에 어울리는 사람">
                        <Field label="3축 요약" hint="TIH-2-1 배분을 한 문장으로">
                            <input value={block("block5_axes_summary")} onChange={e => setBlock("block5_axes_summary", e.target.value)}
                                placeholder='예: "개척자 60 : 결속자 30 : 수호자 10"' className={TEXT_INPUT} />
                        </Field>
                        <Field label="필요 역량 (3~5개)">
                            <ArrayInput value={(form.blocks["block5_competencies"] as string[]) ?? []}
                                onChange={arr => setBlock("block5_competencies", arr)}
                                placeholder="예: 브랜드 전략 수립" />
                        </Field>
                        <Field label="경험의 결" hint="스펙이 아니라 결로. 업계는 달라도 됩니다.">
                            <textarea value={block("block5_experience_texture")} onChange={e => setBlock("block5_experience_texture", e.target.value)}
                                rows={3} className={TEXT_INPUT} />
                        </Field>
                    </Card>

                    {/* 블록 6 */}
                    <Card title="⑥ 함께 일하게 될 사람들">
                        <Field label="직속 리더">
                            <textarea value={block("block6_leader")} onChange={e => setBlock("block6_leader", e.target.value)}
                                placeholder="스타일·배경·의사결정 방식" rows={2} className={TEXT_INPUT} />
                        </Field>
                        <Field label="팀 구성">
                            <textarea value={block("block6_team")} onChange={e => setBlock("block6_team", e.target.value)}
                                placeholder="현재 몇 명, 어떤 사람들, 어떤 분위기" rows={2} className={TEXT_INPUT} />
                        </Field>
                        <Field label="협업 인터페이스">
                            <textarea value={block("block6_interface")} onChange={e => setBlock("block6_interface", e.target.value)}
                                placeholder="주로 누구와 일하는지" rows={2} className={TEXT_INPUT} />
                        </Field>
                    </Card>

                    {/* 블록 7 */}
                    <Card title="⑦ 조건과 환경">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="고용 형태">
                                <select value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })} className={TEXT_INPUT}>
                                    <option value="">선택</option>
                                    {EMPLOYMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </Field>
                            <Field label="경력 요건">
                                <input value={form.experienceRange} onChange={e => setForm({ ...form, experienceRange: e.target.value })}
                                    placeholder='예: "5년+ 또는 결 중심"' className={TEXT_INPUT} />
                            </Field>
                        </div>
                        <Field label="근무지·근무 형태·유연성">
                            <input value={block("block7_location")} onChange={e => setBlock("block7_location", e.target.value)}
                                placeholder='예: "서울 강남 · 하이브리드(주2재택)"' className={TEXT_INPUT} />
                        </Field>
                        <Field label="처우 범위" hint="숫자 범위 공개 권장">
                            <input value={block("block7_compensation_range")} onChange={e => setBlock("block7_compensation_range", e.target.value)}
                                placeholder='예: "5,500~7,000만원 · 스톡옵션 별도"' className={TEXT_INPUT} />
                        </Field>
                        <Field label="문화 포인트" hint="우리 조직만의 한 가지를 한 줄로. 흔한 복지 나열 금지.">
                            <input value={block("block7_culture_point")} onChange={e => setBlock("block7_culture_point", e.target.value)}
                                placeholder='예: "목요일은 리더십 회고 · 수직 1:1 주 1회"' className={TEXT_INPUT} />
                        </Field>
                    </Card>
                </div>

                {/* 제출 버튼 */}
                {error && <p className="mt-6 text-sm text-red-500">{error}</p>}
                <div className="mt-8 flex items-center gap-2 flex-wrap">
                    <button onClick={() => save("draft")} disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border border-neutral-300 rounded-lg hover:bg-neutral-100 disabled:opacity-40">
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        초안 저장
                    </button>
                    <button onClick={() => save("published")} disabled={saving}
                        className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white rounded-lg disabled:opacity-40"
                        style={{ backgroundColor: HERO_RED }}>
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        발행
                    </button>
                    {form.id && form.status !== "archived" && (
                        <button onClick={() => save("archived")} disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-100 ml-auto">
                            <Archive className="h-3.5 w-3.5" /> 보관
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const H3_INPUT = "w-full px-3 py-2.5 text-lg font-bold border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400";
const TEXT_INPUT = "w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 resize-none";

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="mb-3">
                <h3 className="text-sm font-bold">{title}</h3>
                {hint && <p className="text-xs text-neutral-400 mt-0.5">{hint}</p>}
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-semibold text-neutral-600 block mb-1">{label}</label>
            {hint && <p className="text-[11px] text-neutral-400 mb-1.5">{hint}</p>}
            {children}
        </div>
    );
}

function ArrayInput({ value, onChange, placeholder }: { value: string[]; onChange: (arr: string[]) => void; placeholder?: string }) {
    const [input, setInput] = useState("");
    function add() {
        if (!input.trim()) return;
        onChange([...value, input.trim()]);
        setInput("");
    }
    return (
        <div>
            <div className="flex gap-2 mb-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                    placeholder={placeholder} className={TEXT_INPUT} />
                <button onClick={add} className="px-3 py-2 text-xs text-white rounded-lg shrink-0" style={{ backgroundColor: HERO_RED }}>
                    추가
                </button>
            </div>
            {value.length > 0 && (
                <ul className="space-y-1">
                    {value.map((v, i) => (
                        <li key={i} className="flex items-center justify-between text-sm bg-neutral-50 px-3 py-1.5 rounded">
                            <span>• {v}</span>
                            <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-xs text-neutral-400 hover:text-red-500">삭제</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
