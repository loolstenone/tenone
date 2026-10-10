"use client";

/**
 * 인트라 신청 폼 편집 — 질문(구글 폼처럼 추가·순서·필수) · 설정(기간·로그인·수정·1인 1회·정원) · 개인정보 · 응답
 * 저장 = PATCH /api/intra/forms/{id}. 열기(open) 전 서버가 질문·수집 목적·보관 기간을 확인한다.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronLeft, Copy, Download, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { AVAILABILITY_LABEL, CHOICE_TYPES, consentItems, FORM_FILE_MAX, FORM_QUESTION_TYPES, formatAnswer, formAvailability, newQuestionId } from "@/lib/forms";
import { brandSiteUrl } from "@/lib/domain-registry";
import type { FormAttachment, FormDef, FormQuestion, FormQuestionType, FormResponse } from "@/types/forms";

interface Props {
    formId: string;
    listPath: string;
    programs?: Record<string, string>;
}

type Tab = "questions" | "settings" | "responses";
type ResponseRow = FormResponse & { member: { name: string | null; email: string | null } | null };

const toLocalInput = (iso: string | null) => iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
const inputCls = "w-full border border-neutral-300 rounded px-3 py-2 text-sm";
const RESPONSE_STATUS: Record<string, { label: string; tone: string }> = {
    pending: { label: "대기", tone: "bg-amber-50 text-amber-700" },
    accepted: { label: "확정", tone: "bg-emerald-50 text-emerald-700" },
    rejected: { label: "반려", tone: "bg-neutral-100 text-neutral-500" },
    cancelled: { label: "취소", tone: "bg-neutral-100 text-neutral-400" },
};

export function FormEditor({ formId, listPath, programs = {} }: Props) {
    const [form, setForm] = useState<FormDef | null>(null);
    const [tab, setTab] = useState<Tab>("questions");
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [responses, setResponses] = useState<ResponseRow[] | null>(null);

    const load = useCallback(async () => {
        const res = await fetch(`/api/intra/forms/${formId}`);
        const data = await res.json();
        if (res.ok) setForm(data.form); else setMsg({ ok: false, text: data.error ?? "불러오지 못했습니다." });
    }, [formId]);
    const loadResponses = useCallback(async () => {
        const res = await fetch(`/api/intra/forms/${formId}/responses`);
        const data = await res.json();
        if (res.ok) setResponses(data.responses);
    }, [formId]);
    useEffect(() => { load(); loadResponses(); }, [load, loadResponses]);

    // 저장 안 한 변경이 있으면 나가기 경고
    useEffect(() => {
        const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
        window.addEventListener("beforeunload", h);
        return () => window.removeEventListener("beforeunload", h);
    }, [dirty]);

    const update = (patch: Partial<FormDef>) => { setForm(f => f ? { ...f, ...patch } : f); setDirty(true); setMsg(null); };
    const setQuestions = (fn: (qs: FormQuestion[]) => FormQuestion[]) => { if (form) update({ questions: fn(form.questions) }); };

    const save = async (extra: Partial<FormDef> = {}) => {
        if (!form) return false;
        setSaving(true);
        const body = { ...form, ...extra };
        const res = await fetch(`/api/intra/forms/${formId}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: body.title, description: body.description, slug: body.slug, program: body.program, status: body.status,
                opens_at: body.opens_at, closes_at: body.closes_at, questions: body.questions, settings: body.settings, privacy: body.privacy,
            }),
        });
        const data = await res.json();
        setSaving(false);
        if (!res.ok) { setMsg({ ok: false, text: data.error ?? "저장하지 못했습니다." }); return false; }
        setDirty(false);
        setMsg({ ok: true, text: "저장했습니다." });
        await load();
        return true;
    };

    const responseCount = useMemo(() => (responses ?? []).filter(r => r.status !== "cancelled").length, [responses]);

    if (!form) return <p className="text-sm text-neutral-400">{msg?.text ?? "불러오는 중…"}</p>;
    const availability = formAvailability(form, responseCount);
    const siteUrl = brandSiteUrl(form.brand_id, `/${form.brand_id}/forms/${form.slug}`);

    return (
        <div className="space-y-5">
            <Link href={listPath} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"><ChevronLeft className="h-4 w-4" /> 신청서 목록</Link>

            <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-[260px]">
                    <input value={form.title} onChange={e => update({ title: e.target.value })} className="w-full text-xl font-bold text-neutral-900 border-0 border-b border-transparent focus:border-neutral-300 outline-none px-0 py-1" />
                    <div className="mt-1 text-xs text-neutral-500">
                        {AVAILABILITY_LABEL[availability]} · 응답 {responseCount}
                        {form.status !== "draft" && <> · <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 hover:underline">사이트에서 보기 <ExternalLink className="h-3 w-3" /></a></>}
                        {form.status === "draft" && <> · <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">미리보기(직원)</a></>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {form.status !== "open" && <button onClick={() => save({ status: "open" })} disabled={saving} className="bg-emerald-600 text-white text-sm px-4 py-2 rounded disabled:opacity-40">저장하고 열기</button>}
                    {form.status === "open" && <button onClick={() => save({ status: "closed" })} disabled={saving} className="bg-neutral-700 text-white text-sm px-4 py-2 rounded disabled:opacity-40">마감</button>}
                    <button onClick={() => save()} disabled={saving || !dirty} className="inline-flex items-center gap-1 bg-neutral-900 text-white text-sm px-4 py-2 rounded disabled:opacity-40">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />} 저장
                    </button>
                </div>
            </div>
            {msg && <p className={`text-sm ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>}

            <div className="flex gap-1 border-b border-neutral-200">
                {([["questions", `질문 ${form.questions.length}`], ["settings", "설정"], ["responses", `응답 ${responseCount}`]] as [Tab, string][]).map(([k, l]) => (
                    <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm border-b-2 -mb-px ${tab === k ? "border-neutral-900 text-neutral-900 font-semibold" : "border-transparent text-neutral-500"}`}>{l}</button>
                ))}
            </div>

            {tab === "questions" && <QuestionsEditor form={form} update={update} setQuestions={setQuestions} />}
            {tab === "settings" && <SettingsEditor form={form} update={update} programs={programs} />}
            {tab === "responses" && <ResponsesView form={form} responses={responses} reload={loadResponses} />}
        </div>
    );
}

// ── 질문 ─────────────────────────────────────────────────────────
function QuestionsEditor({ form, update, setQuestions }: {
    form: FormDef; update: (p: Partial<FormDef>) => void; setQuestions: (fn: (qs: FormQuestion[]) => FormQuestion[]) => void;
}) {
    const [addType, setAddType] = useState<FormQuestionType>("short");
    const patchQ = (i: number, p: Partial<FormQuestion>) => setQuestions(qs => qs.map((q, j) => j === i ? { ...q, ...p } : q));
    const move = (i: number, d: number) => setQuestions(qs => {
        const j = i + d; if (j < 0 || j >= qs.length) return qs;
        const next = [...qs]; [next[i], next[j]] = [next[j], next[i]]; return next;
    });
    const add = () => setQuestions(qs => [...qs, {
        id: newQuestionId(qs), type: addType, label: "",
        ...(CHOICE_TYPES.includes(addType) ? { options: ["선택지 1"] } : {}),
        ...(addType === "file" ? { maxFiles: 1 } : {}),
    }]);

    return (
        <div className="space-y-3">
            <textarea value={form.description ?? ""} onChange={e => update({ description: e.target.value })} rows={3}
                placeholder="신청서 설명 (일시·장소·참가비·입금 안내 등 이번 행사 안내)" className={inputCls} />
            {form.questions.map((q, i) => (
                <div key={q.id} className="border border-neutral-200 rounded-lg p-4 space-y-2 bg-white">
                    <div className="flex flex-wrap items-center gap-2">
                        <select value={q.type} onChange={e => {
                            const type = e.target.value as FormQuestionType;
                            patchQ(i, { type, ...(CHOICE_TYPES.includes(type) && !q.options?.length ? { options: ["선택지 1"] } : {}), ...(type === "file" ? { maxFiles: q.maxFiles ?? 1 } : {}) });
                        }} className="border border-neutral-300 rounded px-2 py-1.5 text-sm">
                            {FORM_QUESTION_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
                        </select>
                        <input value={q.label} onChange={e => patchQ(i, { label: e.target.value })}
                            placeholder={q.type === "section" ? "구분 제목" : q.type === "agree" ? "확인 문장 (예: 성실한 참여를 약속합니다)" : "질문"}
                            className="flex-1 min-w-[200px] border border-neutral-300 rounded px-3 py-1.5 text-sm font-medium" />
                        {q.type !== "section" && (
                            <label className="flex items-center gap-1 text-xs text-neutral-600"><input type="checkbox" checked={!!q.required} onChange={e => patchQ(i, { required: e.target.checked })} /> 필수</label>
                        )}
                        <div className="flex items-center gap-1 text-neutral-400">
                            <button onClick={() => move(i, -1)} title="위로"><ArrowUp className="h-4 w-4" /></button>
                            <button onClick={() => move(i, 1)} title="아래로"><ArrowDown className="h-4 w-4" /></button>
                            <button onClick={() => setQuestions(qs => { const c = { ...q, id: newQuestionId(qs), label: `${q.label} (복제)` }; const n = [...qs]; n.splice(i + 1, 0, c); return n; })} title="복제"><Copy className="h-4 w-4" /></button>
                            <button onClick={() => setQuestions(qs => qs.filter((_, j) => j !== i))} title="삭제" className="hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    </div>
                    <input value={q.help ?? ""} onChange={e => patchQ(i, { help: e.target.value })} placeholder="설명 (선택)" className="w-full border border-neutral-200 rounded px-3 py-1.5 text-xs text-neutral-600" />
                    {CHOICE_TYPES.includes(q.type) && (
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-start">
                            <textarea value={(q.options ?? []).join("\n")} onChange={e => patchQ(i, { options: e.target.value.split("\n") })} rows={Math.max(3, (q.options ?? []).length)}
                                placeholder="선택지를 한 줄에 하나씩" className="border border-neutral-200 rounded px-3 py-1.5 text-sm" />
                            {q.type !== "select" && (
                                <label className="flex items-center gap-1 text-xs text-neutral-600"><input type="checkbox" checked={!!q.allowOther} onChange={e => patchQ(i, { allowOther: e.target.checked })} /> &quot;기타&quot; 직접 입력</label>
                            )}
                        </div>
                    )}
                    {(q.type === "short" || q.type === "long") && (
                        <label className="flex items-center gap-2 text-xs text-neutral-600">최대 글자 수
                            <input type="number" min={1} max={5000} value={q.maxLength ?? ""} placeholder="제한 없음"
                                onChange={e => patchQ(i, { maxLength: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-24 border border-neutral-300 rounded px-2 py-1" />
                            <span className="text-neutral-400">비우면 제한 없음 (최대 5,000자)</span>
                        </label>
                    )}
                    {q.type === "file" && (
                        <label className="flex items-center gap-2 text-xs text-neutral-600">최대 파일 수
                            <select value={q.maxFiles ?? 1} onChange={e => patchQ(i, { maxFiles: Number(e.target.value) })} className="border border-neutral-300 rounded px-2 py-1">
                                {Array.from({ length: FORM_FILE_MAX }, (_, k) => k + 1).map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span className="text-neutral-400">PDF·PPT·Word·한글·ZIP·이미지, 파일당 10MB</span>
                        </label>
                    )}
                </div>
            ))}
            <div className="flex items-center gap-2">
                <select value={addType} onChange={e => setAddType(e.target.value as FormQuestionType)} className="border border-neutral-300 rounded px-2 py-2 text-sm">
                    {FORM_QUESTION_TYPES.map(t => <option key={t.type} value={t.type}>{t.label} — {t.hint}</option>)}
                </select>
                <button onClick={add} className="inline-flex items-center gap-1 border border-neutral-300 rounded px-3 py-2 text-sm hover:bg-neutral-50"><Plus className="h-4 w-4" /> 질문 추가</button>
            </div>
        </div>
    );
}

// ── 설정 ─────────────────────────────────────────────────────────
function SettingsEditor({ form, update, programs }: { form: FormDef; update: (p: Partial<FormDef>) => void; programs: Record<string, string> }) {
    const s = form.settings ?? {};
    const setS = (p: Partial<typeof s>) => update({ settings: { ...s, ...p } });
    const p = form.privacy ?? {};
    const toggle = (key: "require_login" | "allow_edit" | "one_per_user", label: string, desc: string) => (
        <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5" checked={!!s[key]} onChange={e => setS({ [key]: e.target.checked })} />
            <span><b className="text-neutral-800">{label}</b><span className="block text-xs text-neutral-500">{desc}</span></span>
        </label>
    );
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-800">기간·주소</h3>
                <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-neutral-600">시작<input type="datetime-local" className={inputCls} value={toLocalInput(form.opens_at)} onChange={e => update({ opens_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></label>
                    <label className="text-xs text-neutral-600">마감<input type="datetime-local" className={inputCls} value={toLocalInput(form.closes_at)} onChange={e => update({ closes_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></label>
                </div>
                <p className="text-xs text-neutral-500">비우면 &quot;열기&quot;부터 &quot;마감&quot;까지 받습니다. 시작 전·마감 후에는 사이트에 &quot;신청 예정 / 신청 마감&quot;으로 보입니다.</p>
                <label className="block text-xs text-neutral-600">주소 (영문·숫자·하이픈)
                    <input className={inputCls} value={form.slug} onChange={e => update({ slug: e.target.value })} />
                    <span className="text-neutral-400">/{form.brand_id}/forms/{form.slug}</span>
                </label>
                <label className="block text-xs text-neutral-600">연결 프로그램 (해당 프로그램 페이지에 신청 버튼 자동 노출)
                    <select className={inputCls} value={form.program ?? ""} onChange={e => update({ program: e.target.value || null })}>
                        <option value="">없음 (주소로만 공유)</option>
                        {Object.entries(programs).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                </label>
                <label className="block text-xs text-neutral-600">선착순 정원 (비우면 제한 없음)
                    <input type="number" min={1} className={inputCls} value={s.max_responses ?? ""} onChange={e => setS({ max_responses: e.target.value ? Number(e.target.value) : null })} />
                </label>
                <label className="block text-xs text-neutral-600">제출 완료 문구
                    <textarea rows={2} className={inputCls} value={s.confirmation ?? ""} onChange={e => setS({ confirmation: e.target.value })} placeholder="신청이 접수되었습니다." />
                </label>
            </section>

            <section className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-800">응답 규칙</h3>
                {toggle("require_login", "로그인한 사람만", "Ten:One ID 로그인 후 신청 — 응답이 회원 계정에 연결됩니다")}
                {toggle("allow_edit", "제출 후 수정 허용", "본인이 신청 내용을 다시 고칠 수 있습니다 (로그인 필요)")}
                {toggle("one_per_user", "1인 1회", "같은 계정으로 한 번만 신청 (로그인 필요)")}
                {(s.allow_edit || s.one_per_user) && !s.require_login && <p className="text-xs text-amber-600">수정 허용·1인 1회는 로그인이 있어야 동작해 응답자에게 로그인을 요구합니다.</p>}

                <h3 className="pt-2 text-sm font-semibold text-neutral-800">개인정보 수집·이용 고지 (필수 — 열기 전 확인)</h3>
                <label className="block text-xs text-neutral-600">수집·이용 목적
                    <input className={inputCls} value={p.purpose ?? ""} onChange={e => update({ privacy: { ...p, purpose: e.target.value } })} placeholder="예: DAM 파티 참가자 선정·행사 운영 연락" />
                </label>
                <label className="block text-xs text-neutral-600">보관 기간
                    <input className={inputCls} value={p.retention ?? ""} onChange={e => update({ privacy: { ...p, retention: e.target.value } })} placeholder="예: 행사 종료 후 1년" />
                </label>
                <div className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded p-3">
                    <b className="text-neutral-700">수집 항목 (질문에서 자동)</b>: {consentItems(form.questions).join(", ") || "-"}
                    <p className="mt-1">응답자는 제출 전 목적·항목·보관 기간을 보고 동의합니다. 꼭 필요한 항목만 질문하세요 (개인정보보호법 제16조 최소 수집). 주민등록번호·계좌번호는 받지 않습니다.</p>
                </div>
            </section>
        </div>
    );
}

// ── 응답 ─────────────────────────────────────────────────────────
function ResponsesView({ form, responses, reload }: { form: FormDef; responses: ResponseRow[] | null; reload: () => void }) {
    const [open, setOpen] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("all");
    const questions = form.questions.filter(q => q.type !== "section");
    const nameQ = questions.find(q => q.type === "short");
    const emailQ = questions.find(q => q.type === "email");

    const setStatus = async (r: ResponseRow, status: string, staff_note?: string) => {
        await fetch(`/api/intra/forms/${form.id}/responses`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ responseId: r.id, status, ...(staff_note !== undefined ? { staff_note } : {}) }),
        });
        reload();
    };

    if (!responses) return <p className="text-sm text-neutral-400">불러오는 중…</p>;
    const list = responses.filter(r => filter === "all" || r.status === filter);
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                {["all", "pending", "accepted", "rejected", "cancelled"].map(k => (
                    <button key={k} onClick={() => setFilter(k)} className={`text-xs px-3 py-1 rounded border ${filter === k ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600"}`}>
                        {k === "all" ? `전체 ${responses.length}` : `${RESPONSE_STATUS[k].label} ${responses.filter(r => r.status === k).length}`}
                    </button>
                ))}
                <a href={`/api/intra/forms/${form.id}/responses?format=csv`} className="ml-auto inline-flex items-center gap-1 text-sm border border-neutral-300 rounded px-3 py-1.5 hover:bg-neutral-50"><Download className="h-4 w-4" /> 엑셀(CSV)</a>
            </div>
            {list.length === 0 ? <p className="text-sm text-neutral-400 py-10 text-center">응답이 없습니다.</p> : (
                <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                    {list.map(r => {
                        const who = r.member?.name ?? (nameQ ? formatAnswer(r.answers?.[nameQ.id]) : "") ?? "";
                        const mail = r.member?.email ?? (emailQ ? formatAnswer(r.answers?.[emailQ.id]) : "") ?? "";
                        return (
                            <div key={r.id}>
                                <button onClick={() => setOpen(open === r.id ? null : r.id)} className="w-full flex flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50">
                                    <span className={`text-[11px] px-2 py-0.5 rounded ${RESPONSE_STATUS[r.status].tone}`}>{RESPONSE_STATUS[r.status].label}</span>
                                    <span className="font-medium text-neutral-900">{who || "(이름 없음)"}</span>
                                    <span className="text-xs text-neutral-500">{mail}</span>
                                    {r.member && <span className="text-[10px] text-sky-600">회원</span>}
                                    <span className="ml-auto text-xs text-neutral-400">{new Date(r.created_at).toLocaleString("ko-KR")}</span>
                                </button>
                                {open === r.id && (
                                    <div className="px-4 pb-4 space-y-3 bg-neutral-50/50">
                                        <dl className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-x-4 gap-y-2 text-sm pt-2">
                                            {questions.map(q => (
                                                <div key={q.id} className="contents">
                                                    <dt className="text-neutral-500">{q.label}</dt>
                                                    <dd className="text-neutral-900 whitespace-pre-line">
                                                        {q.type === "file"
                                                            ? ((r.attachments ?? []) as FormAttachment[]).map((a, idx) => a.questionId === q.id && (
                                                                <a key={a.path} href={`/api/intra/forms/attachment?r=${r.id}&i=${idx}`} target="_blank" rel="noopener noreferrer" className="mr-3 text-sky-700 hover:underline">{a.name}</a>
                                                            ))
                                                            : formatAnswer(r.answers?.[q.id]) || <span className="text-neutral-300">-</span>}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                        <p className="text-xs text-neutral-400">동의 {new Date(r.consent?.agreed_at).toLocaleString("ko-KR")} · 보관 {r.consent?.retention}</p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {(["pending", "accepted", "rejected", "cancelled"] as const).map(st => (
                                                <button key={st} onClick={() => setStatus(r, st)} disabled={r.status === st}
                                                    className={`text-xs px-3 py-1 rounded border ${r.status === st ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600 hover:bg-white"}`}>{RESPONSE_STATUS[st].label}</button>
                                            ))}
                                            <input defaultValue={r.staff_note ?? ""} placeholder="직원 메모 (엔터로 저장)" className="flex-1 min-w-[200px] border border-neutral-300 rounded px-2 py-1 text-xs"
                                                onKeyDown={e => { if (e.key === "Enter") setStatus(r, r.status, (e.target as HTMLInputElement).value); }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
