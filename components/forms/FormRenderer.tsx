"use client";

/**
 * 유니버스 공통 신청 폼 응답 화면 — 브랜드 페이지에서 <FormRenderer brand="madleague" slug="dam-student" />
 * 규칙: lib/forms.ts · API: /api/forms/{brand}/{slug}
 * - 로그인 필요 폼은 현재 페이지 위 LoginModal (§1.2.1 세부 원칙 A)
 * - 개인정보 수집·이용 동의(목적·항목·보관기간)를 질문에서 자동 생성 (개인정보보호법 제15조)
 * - 파일은 서명 업로드 URL로 브라우저가 Storage에 직접 올림 (Vercel 요청 한도 회피)
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { CaptchaWidget, useCaptcha, CAPTCHA_PENDING_MESSAGE } from "@/components/CaptchaWidget";
import { createClient } from "@/lib/supabase/client";
import { CONTACT_ATTACHMENT_ACCEPT, CONTACT_ATTACHMENT_BUCKET, CONTACT_ATTACHMENT_GUIDE } from "@/lib/contact-attachments";
import { AVAILABILITY_LABEL, consentItems, formNeedsLogin, OTHER_PREFIX, validateFormAnswers } from "@/lib/forms";
import type { FormAnswers, FormAnswerValue, FormAttachment, FormAvailability, FormDef, FormQuestion } from "@/types/forms";

interface Props {
    brand: string;
    slug: string;
    /** 브랜드 포인트 컬러 */
    accent?: string;
    /** 어두운 배경 브랜드 (MADLeague 등) */
    dark?: boolean;
}

interface MyResponse { id: string; answers: FormAnswers; attachments: FormAttachment[]; status: string; created_at: string }

const fmtDate = (s: string | null) => s ? new Date(s).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

export function FormRenderer({ brand, slug, accent = "#EC1D25", dark = false }: Props) {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const captcha = useCaptcha();
    const [form, setForm] = useState<FormDef | null>(null);
    const [availability, setAvailability] = useState<FormAvailability>("open");
    const [myResponse, setMyResponse] = useState<MyResponse | null>(null);
    const [loadError, setLoadError] = useState("");
    const [answers, setAnswers] = useState<FormAnswers>({});
    const [files, setFiles] = useState<Record<string, File[]>>({});
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState<string | null>(null);
    const [loginOpen, setLoginOpen] = useState(false);
    const [editing, setEditing] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/forms/${brand}/${slug}`, { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) { setLoadError(data.error ?? "신청서를 불러오지 못했습니다."); return; }
            setForm(data.form);
            setAvailability(data.availability);
            setMyResponse(data.myResponse ?? null);
        } catch {
            setLoadError("신청서를 불러오지 못했습니다.");
        }
    }, [brand, slug]);

    // 로그인 상태가 바뀌면 다시 불러온다 (내 응답·로그인 필요 여부)
    useEffect(() => { if (!authLoading) load(); }, [load, authLoading, isAuthenticated]);

    const t = useMemo(() => dark ? {
        text: "text-white", sub: "text-neutral-400", muted: "text-neutral-500", box: "bg-neutral-950 border-neutral-800",
        input: "w-full bg-black border border-neutral-800 px-[14px] py-[10px] text-white outline-none transition [color-scheme:dark]",
        line: "border-neutral-800",
    } : {
        text: "text-neutral-900", sub: "text-neutral-600", muted: "text-neutral-500", box: "bg-neutral-50 border-neutral-200",
        input: "w-full bg-white border border-neutral-300 px-[14px] py-[10px] text-neutral-900 outline-none transition",
        line: "border-neutral-200",
    }, [dark]);

    if (loadError) return <p className={`py-16 text-center text-sm ${t.muted}`}>{loadError}</p>;
    if (!form) return <p className={`py-16 text-center text-sm ${t.muted}`}>불러오는 중…</p>;

    const settings = form.settings ?? {};
    const needsLogin = formNeedsLogin(form);
    const canEdit = !!(settings.allow_edit && myResponse);
    const alreadyDone = !!(myResponse && settings.one_per_user && !settings.allow_edit);
    const items = consentItems(form.questions);

    const setAnswer = (id: string, v: FormAnswerValue) => {
        setAnswers(a => ({ ...a, [id]: v }));
        setErrors(e => { const { [id]: _, ...rest } = e; void _; return rest; });
    };

    const startEdit = () => {
        if (!myResponse) return;
        setAnswers(myResponse.answers ?? {});
        setAgreed(true);
        setEditing(true);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");
        const fileCounts: Record<string, number> = {};
        for (const q of form.questions.filter(x => x.type === "file")) {
            const kept = editing && !files[q.id]?.length ? (myResponse?.attachments ?? []).filter(a => a.questionId === q.id).length : 0;
            fileCounts[q.id] = (files[q.id]?.length ?? 0) + kept;
        }
        const errs = validateFormAnswers(form.questions, answers, fileCounts);
        setErrors(errs);
        if (Object.keys(errs).length) { setSubmitError("빨간 표시 항목을 확인해 주세요."); return; }
        if (!agreed) { setSubmitError("개인정보 수집·이용에 동의해 주세요."); return; }
        if (!captcha.ready) { setSubmitError(CAPTCHA_PENDING_MESSAGE); return; }

        setSubmitting(true);
        try {
            const fileList = Object.entries(files).flatMap(([questionId, fs]) => fs.map(f => ({ questionId, file: f })));
            const res = await fetch(`/api/forms/${brand}/${slug}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answers, agreed, captchaToken: captcha.token,
                    responseId: editing ? myResponse?.id : undefined,
                    files: fileList.map(f => ({ questionId: f.questionId, name: f.file.name, size: f.file.size, type: f.file.type })),
                }),
            });
            captcha.reset();
            const data = await res.json();
            if (!res.ok) {
                if (data.errors) setErrors(data.errors);
                setSubmitError(data.error ?? "제출에 실패했습니다.");
                return;
            }
            const uploads: { path: string; token: string }[] = data.uploads ?? [];
            const storage = createClient().storage.from(CONTACT_ATTACHMENT_BUCKET);
            const results = await Promise.all(uploads.map((u, i) =>
                storage.uploadToSignedUrl(u.path, u.token, fileList[i].file, { contentType: fileList[i].file.type || "application/octet-stream" })));
            const failed = results.filter(r => r.error).length;
            setDone(failed
                ? `${data.confirmation} (첨부파일 ${failed}개를 올리지 못했습니다. 문의하기로 보내 주세요.)`
                : data.confirmation);
        } catch {
            setSubmitError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── 헤더 ──
    const header = (
        <div className="mb-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-widest">
                <span style={{ color: availability === "open" ? accent : undefined }} className={availability === "open" ? "" : t.muted}>
                    {AVAILABILITY_LABEL[availability]}
                </span>
                {(form.opens_at || form.closes_at) && (
                    <span className={t.muted}>· {form.opens_at ? `${fmtDate(form.opens_at)} ~ ` : "~ "}{fmtDate(form.closes_at)}</span>
                )}
                {form.status === "draft" && <span className="text-amber-500">· 초안 미리보기 (직원)</span>}
            </div>
            <h2 className={`mt-3 text-3xl sm:text-4xl font-black ${t.text}`}>{form.title}</h2>
            {form.description && <p className={`mt-4 whitespace-pre-line leading-relaxed ${t.sub}`}>{form.description}</p>}
        </div>
    );

    if (done) {
        return (
            <div className={`border p-10 text-center ${t.box}`}>
                <div className="text-xs font-bold tracking-widest" style={{ color: accent }}>접수 완료</div>
                <p className={`mt-4 text-lg leading-relaxed whitespace-pre-line ${t.text}`}>{done}</p>
            </div>
        );
    }

    const closedBox = (msg: string) => (<div>{header}<div className={`border p-8 text-center ${t.box} ${t.sub}`}>{msg}</div></div>);
    if (availability !== "open" && form.status !== "draft") {
        return closedBox(availability === "upcoming" ? `${fmtDate(form.opens_at)}부터 신청할 수 있습니다.` : availability === "full" ? "정원이 마감되었습니다." : "신청이 마감되었습니다.");
    }
    if (needsLogin && !isAuthenticated) {
        return (
            <div>
                {header}
                <div className={`border p-8 text-center ${t.box}`}>
                    <p className={t.sub}>Ten:One ID로 로그인한 뒤 신청할 수 있습니다.</p>
                    <button type="button" onClick={() => setLoginOpen(true)} className="mt-5 px-8 py-3 font-bold text-white" style={{ background: accent }}>
                        로그인하고 신청하기
                    </button>
                </div>
                <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor={accent} />
            </div>
        );
    }
    if (myResponse && !editing) {
        if (alreadyDone || canEdit) {
            return (
                <div>
                    {header}
                    <div className={`border p-8 text-center ${t.box}`}>
                        <p className={t.text}>{fmtDate(myResponse.created_at)}에 신청하셨습니다.</p>
                        {canEdit
                            ? <button type="button" onClick={startEdit} className="mt-5 px-8 py-3 font-bold text-white" style={{ background: accent }}>신청 내용 수정</button>
                            : <p className={`mt-2 text-sm ${t.muted}`}>이 신청서는 1인 1회만 제출할 수 있습니다.</p>}
                    </div>
                </div>
            );
        }
    }

    return (
        <form onSubmit={submit} noValidate>
            {header}
            <div className="space-y-8">
                {form.questions.map(q => (
                    <QuestionField key={q.id} q={q} value={answers[q.id]} error={errors[q.id]} onChange={v => setAnswer(q.id, v)}
                        files={files[q.id] ?? []} onFiles={fs => { setFiles(f => ({ ...f, [q.id]: fs })); setErrors(e => { const { [q.id]: _, ...r } = e; void _; return r; }); }}
                        keptFiles={editing ? (myResponse?.attachments ?? []).filter(a => a.questionId === q.id) : []}
                        t={t} accent={accent} />
                ))}
            </div>

            {/* 개인정보 수집·이용 동의 (개인정보보호법 제15조) */}
            <div className={`mt-12 border p-6 text-sm leading-relaxed ${t.box} ${t.sub}`}>
                <div className={`font-bold mb-3 ${t.text}`}>개인정보 수집·이용 동의 (필수)</div>
                <dl className="grid grid-cols-[88px_1fr] gap-y-1.5">
                    <dt className={t.muted}>목적</dt><dd>{form.privacy?.purpose || "신청 접수·결과 안내"}</dd>
                    <dt className={t.muted}>항목</dt><dd>{items.join(", ") || "-"}</dd>
                    <dt className={t.muted}>보관 기간</dt><dd>{form.privacy?.retention || "목적 달성 후 지체 없이 파기"}</dd>
                </dl>
                <p className={`mt-3 text-xs ${t.muted}`}>동의를 거부할 수 있으나, 거부 시 신청이 제한됩니다. 자세한 내용은 개인정보처리방침을 따릅니다.</p>
                <label className={`mt-4 flex items-center gap-2 cursor-pointer ${t.text}`}>
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: accent }} />
                    위 내용에 동의합니다
                </label>
            </div>

            <div className="mt-6"><CaptchaWidget {...captcha.widgetProps} /></div>
            {submitError && <p className="mt-4 text-sm text-red-500">{submitError}</p>}
            <button type="submit" disabled={submitting} className="mt-6 w-full py-4 text-lg font-bold text-white disabled:opacity-50" style={{ background: accent }}>
                {submitting ? "제출 중…" : editing ? "수정 내용 저장" : "신청하기"}
            </button>
        </form>
    );
}

interface FieldProps {
    q: FormQuestion;
    value: FormAnswerValue | undefined;
    error?: string;
    onChange: (v: FormAnswerValue) => void;
    files: File[];
    onFiles: (fs: File[]) => void;
    keptFiles: FormAttachment[];
    t: { text: string; sub: string; muted: string; input: string; line: string };
    accent: string;
}

function QuestionField({ q, value, error, onChange, files, onFiles, keptFiles, t, accent }: FieldProps) {
    if (q.type === "section") {
        return (
            <div className={`pt-6 border-t ${t.line}`}>
                <div className={`text-xl font-black ${t.text}`}>{q.label}</div>
                {q.help && <p className={`mt-2 text-sm whitespace-pre-line ${t.sub}`}>{q.help}</p>}
            </div>
        );
    }
    const inputCls = `${t.input} ${error ? "border-red-500" : ""}`;
    const label = (
        <div className="mb-2">
            <span className={`font-bold ${t.text}`}>{q.label}</span>
            {q.required && <span className="ml-1" style={{ color: accent }}>*</span>}
            {q.help && <p className={`mt-1 text-xs whitespace-pre-line ${t.muted}`}>{q.help}</p>}
        </div>
    );
    const str = typeof value === "string" ? value : "";
    const arr = Array.isArray(value) ? value : [];
    const otherOf = (v: string | undefined) => v?.startsWith(OTHER_PREFIX) ? v.slice(OTHER_PREFIX.length) : "";

    let field: React.ReactNode;
    switch (q.type) {
        case "long":
            field = <textarea rows={5} className={`${inputCls} resize-y`} value={str} maxLength={q.maxLength} onChange={e => onChange(e.target.value)} />;
            break;
        case "short":
            field = <input type="text" className={inputCls} value={str} maxLength={q.maxLength} onChange={e => onChange(e.target.value)} />;
            break;
        case "radio": {
            const isOther = str.startsWith(OTHER_PREFIX);
            field = (
                <div className="space-y-2">
                    {(q.options ?? []).map(o => (
                        <label key={o} className={`flex items-center gap-2 cursor-pointer ${t.sub}`}>
                            <input type="radio" name={q.id} checked={str === o} onChange={() => onChange(o)} style={{ accentColor: accent }} /> {o}
                        </label>
                    ))}
                    {q.allowOther && (
                        <label className={`flex items-center gap-2 ${t.sub}`}>
                            <input type="radio" name={q.id} checked={isOther} onChange={() => onChange(OTHER_PREFIX)} style={{ accentColor: accent }} /> 기타:
                            <input className={`${t.input} py-1`} value={otherOf(str)} onFocus={() => !isOther && onChange(OTHER_PREFIX)} onChange={e => onChange(OTHER_PREFIX + e.target.value)} />
                        </label>
                    )}
                </div>
            );
            break;
        }
        case "checkbox": {
            const other = arr.find(v => v.startsWith(OTHER_PREFIX));
            const toggle = (o: string) => onChange(arr.includes(o) ? arr.filter(x => x !== o) : [...arr, o]);
            field = (
                <div className="space-y-2">
                    {(q.options ?? []).map(o => (
                        <label key={o} className={`flex items-center gap-2 cursor-pointer ${t.sub}`}>
                            <input type="checkbox" checked={arr.includes(o)} onChange={() => toggle(o)} style={{ accentColor: accent }} /> {o}
                        </label>
                    ))}
                    {q.allowOther && (
                        <label className={`flex items-center gap-2 ${t.sub}`}>
                            <input type="checkbox" checked={!!other} onChange={() => onChange(other ? arr.filter(x => x !== other) : [...arr, OTHER_PREFIX])} style={{ accentColor: accent }} /> 기타:
                            <input className={`${t.input} py-1`} value={otherOf(other)} onChange={e => onChange([...arr.filter(x => !x.startsWith(OTHER_PREFIX)), OTHER_PREFIX + e.target.value])} />
                        </label>
                    )}
                </div>
            );
            break;
        }
        case "select":
            field = (
                <select className={inputCls} value={str} onChange={e => onChange(e.target.value)}>
                    <option value="">선택하세요</option>
                    {(q.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            );
            break;
        case "agree":
            field = (
                <label className={`flex items-center gap-2 cursor-pointer ${t.sub}`}>
                    <input type="checkbox" checked={value === true} onChange={e => onChange(e.target.checked)} style={{ accentColor: accent }} /> 네
                </label>
            );
            // agree는 라벨이 곧 문장
            return (
                <div>
                    <div className={`mb-2 font-bold ${t.text}`}>{q.label}{q.required && <span className="ml-1" style={{ color: accent }}>*</span>}</div>
                    {field}
                    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                </div>
            );
        case "file": {
            const max = q.maxFiles ?? 1;
            field = (
                <div>
                    <input type="file" accept={CONTACT_ATTACHMENT_ACCEPT} multiple={max > 1}
                        onChange={e => onFiles(Array.from(e.target.files ?? []).slice(0, max))}
                        className={`block text-sm ${t.sub} file:mr-3 file:border-0 file:px-4 file:py-2 file:font-bold file:text-white`}
                        style={{ ["--tw-file-bg" as string]: accent }} />
                    <p className={`mt-1 text-xs ${t.muted}`}>{CONTACT_ATTACHMENT_GUIDE.replace(/최대 \d개/, `최대 ${max}개`)}</p>
                    {files.length === 0 && keptFiles.length > 0 && (
                        <p className={`mt-1 text-xs ${t.sub}`}>올린 파일: {keptFiles.map(f => f.name).join(", ")} (새로 고르면 교체)</p>
                    )}
                </div>
            );
            break;
        }
        default: {
            const type = q.type === "email" ? "email" : q.type === "phone" ? "tel" : q.type === "number" ? "number" : q.type === "date" ? "date" : q.type === "url" ? "url" : "text";
            field = <input type={type} className={inputCls} value={str} placeholder={q.type === "url" ? "https://" : q.type === "phone" ? "010-0000-0000" : undefined} onChange={e => onChange(e.target.value)} />;
        }
    }
    return (
        <div>
            {label}
            {field}
            {q.maxLength && (q.type === "short" || q.type === "long") && (
                <p className={`mt-1 text-right text-xs ${t.muted}`}>{str.length.toLocaleString()} / {q.maxLength.toLocaleString()}자</p>
            )}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
