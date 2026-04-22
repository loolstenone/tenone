"use client";

/**
 * 기업 신규 등록 페이지
 * POST /api/hero/company/register 호출
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Loader2, CheckCircle } from "lucide-react";
import { INDUSTRIES } from "@/lib/badak-constants";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

const HERO_RED = "#E53935";

const SIZE_OPTIONS = [
    { value: "solo", label: "1인·2~5명" },
    { value: "small", label: "6~30명" },
    { value: "medium", label: "31~100명" },
    { value: "large", label: "101~500명" },
    { value: "enterprise", label: "500명+" },
];

export default function CompanyRegisterPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [form, setForm] = useState({
        companyName: "",
        industry: "",
        sizeCategory: "",
        employeeCount: "",
        foundedYear: "",
        positionTitle: "",
        department: "",
        contactEmail: "",
        contactPhone: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ companyId: string; status: string; message?: string } | null>(null);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginModal isOpen={true} onClose={() => {}} accentColor={HERO_RED} /></div>;

    async function submit() {
        if (!user?.id) return;
        if (!form.companyName.trim()) { setError("기업명은 필수입니다."); return; }

        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/hero/company/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    memberId: user.id,
                    companyName: form.companyName.trim(),
                    industry: form.industry || undefined,
                    sizeCategory: form.sizeCategory || undefined,
                    employeeCount: form.employeeCount ? Number(form.employeeCount) : undefined,
                    foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
                    positionTitle: form.positionTitle || undefined,
                    department: form.department || undefined,
                    contactEmail: form.contactEmail || user.email,
                    contactPhone: form.contactPhone || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
            setResult(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "등록 실패");
            setSubmitting(false);
        }
    }

    if (result) {
        const isActive = result.status === "active";
        return (
            <div className="min-h-screen bg-neutral-50 pt-24 pb-20 flex items-center justify-center">
                <div className="max-w-md text-center px-6">
                    <CheckCircle className="h-16 w-16 mx-auto mb-6" style={{ color: HERO_RED }} />
                    <h1 className="text-2xl font-bold mb-3">
                        {isActive ? "등록 완료" : "가입 신청 완료"}
                    </h1>
                    <p className="text-neutral-500 mb-8">
                        {result.message || (isActive
                            ? "이제 TIH 제출과 JD 등록이 가능합니다."
                            : "기존 등록 기업이 있어 담당자 추가 요청이 접수되었습니다. 대표의 승인을 기다려주세요.")}
                    </p>
                    <button onClick={() => router.push("/hero/company")}
                        className="px-6 py-3 text-white font-semibold rounded-lg" style={{ backgroundColor: HERO_RED }}>
                        기업 허브로
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-xl mx-auto px-6">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-xs text-neutral-500 mb-4 hover:text-neutral-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> 뒤로
                </button>

                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-xs font-bold rounded-full mb-3" style={{ color: HERO_RED }}>
                        <Building2 className="h-3.5 w-3.5" /> 기업 신규 등록
                    </div>
                    <h1 className="text-2xl font-extrabold mb-2">우리 회사를 등록합니다</h1>
                    <p className="text-sm text-neutral-500">
                        등록 완료 후 TIH 제출·JD 등록으로 매칭 Tetrad 기업 측 입력을 채울 수 있습니다.
                    </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
                    <Section title="기업 정보">
                        <Field label="기업명" required>
                            <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
                                placeholder="예: Ten:One™" className={INPUT} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="산업">
                                <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className={INPUT}>
                                    <option value="">선택</option>
                                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </Field>
                            <Field label="규모">
                                <select value={form.sizeCategory} onChange={e => setForm({ ...form, sizeCategory: e.target.value })} className={INPUT}>
                                    <option value="">선택</option>
                                    {SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="직원 수 (명)">
                                <input type="number" value={form.employeeCount} onChange={e => setForm({ ...form, employeeCount: e.target.value })}
                                    placeholder="30" className={INPUT} />
                            </Field>
                            <Field label="설립연도">
                                <input type="number" value={form.foundedYear} onChange={e => setForm({ ...form, foundedYear: e.target.value })}
                                    placeholder="2020" className={INPUT} />
                            </Field>
                        </div>
                    </Section>

                    <Section title="담당자 정보 (당신)">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="직책">
                                <input value={form.positionTitle} onChange={e => setForm({ ...form, positionTitle: e.target.value })}
                                    placeholder="예: 인사팀장" className={INPUT} />
                            </Field>
                            <Field label="부서">
                                <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                                    placeholder="예: People" className={INPUT} />
                            </Field>
                        </div>
                        <Field label={`연락 이메일 (기본: ${user?.email})`}>
                            <input type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                                placeholder={user?.email} className={INPUT} />
                        </Field>
                        <Field label="연락처">
                            <input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                                placeholder="010-xxxx-xxxx" className={INPUT} />
                        </Field>
                    </Section>
                </div>

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                <button onClick={submit} disabled={submitting}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-4 text-white font-bold rounded-lg disabled:opacity-40"
                    style={{ backgroundColor: HERO_RED }}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? "등록 중..." : "등록하기"}
                </button>

                <p className="mt-3 text-xs text-neutral-400 text-center">
                    ℹ️ 동일 기업명이 이미 등록된 경우 · 담당자 추가 요청으로 진행됩니다 (대표 승인 필요)
                </p>
            </div>
        </div>
    );
}

const INPUT = "w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">{title}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-semibold text-neutral-600 mb-1 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}
