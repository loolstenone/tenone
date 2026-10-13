"use client";

/**
 * HeRo 기업 서비스 페이지 틀 (2026-10-13) — 팀 진단 · 인재 풀 리포트 · 헤드헌팅이 같은 구조를 쓴다
 * 첫 화면(PageHero) → 받는 것 → 진행 순서 → 원칙 → 자주 묻는 질문 → 신청 폼(#apply)
 * ❌ 가격 문구 · 예시 숫자를 실제처럼 쓰기
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ShieldCheck, Loader2, CheckCircle2, type LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { loginHref } from "@/lib/login-href";
import { PageHero } from "@/features/hero/PageHero";
import { BUSINESS_SERVICES, type BusinessServiceKey } from "@/lib/hero/business-services";

export interface ServiceDeliverable { icon: LucideIcon; title: string; desc: string }

export function BusinessServicePage({
    service, title, desc, deliverables, steps, principles, faq, note,
}: {
    service: BusinessServiceKey;
    title: ReactNode;
    desc: string;
    deliverables: ServiceDeliverable[];
    steps: { title: string; desc: string }[];
    principles: { title: string; desc: string }[];
    faq: { q: string; a: string }[];
    note?: ReactNode;
}) {
    const s = BUSINESS_SERVICES[service];
    return (
        <div className="bg-white">
            <PageHero label={s.label} title={title} desc={desc} cta={{ label: `${s.label} 신청`, href: "#apply" }}
                secondary={{ label: "인재 찾기", href: "/hero/company" }} note={note} />

            <section className="border-b border-neutral-100">
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-10">무엇을 받나요</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {deliverables.map(d => (
                            <div key={d.title} className="border border-neutral-200 rounded-xl p-6">
                                <d.icon className="h-6 w-6 text-neutral-400 mb-4" />
                                <p className="font-bold mb-2">{d.title}</p>
                                <p className="text-sm text-neutral-600 leading-relaxed break-keep">{d.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-b border-neutral-100 bg-neutral-50">
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-10">진행 순서</h2>
                    <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {steps.map((st, i) => (
                            <li key={st.title} className="bg-white border border-neutral-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-7 h-7 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                    <p className="font-bold">{st.title}</p>
                                </div>
                                <p className="text-sm text-neutral-600 leading-relaxed break-keep">{st.desc}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="border-b border-neutral-100">
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
                    <div className="flex items-center gap-2 mb-10">
                        <ShieldCheck className="h-6 w-6 text-neutral-400" />
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">이렇게 지킵니다</h2>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {principles.map(p => (
                            <li key={p.title} className="border border-neutral-200 rounded-xl p-6">
                                <p className="font-bold mb-2">{p.title}</p>
                                <p className="text-sm text-neutral-600 leading-relaxed break-keep">{p.desc}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="border-b border-neutral-100 bg-neutral-50">
                <div className="mx-auto max-w-3xl px-6 lg:px-8 py-20">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-8">자주 묻는 질문</h2>
                    <div className="divide-y divide-neutral-200 border-y border-neutral-200 bg-white">
                        {faq.map(f => (
                            <details key={f.q} className="group px-5 py-4">
                                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold">
                                    {f.q}
                                    <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-open:rotate-180" />
                                </summary>
                                <p className="mt-3 text-sm text-neutral-600 leading-relaxed break-keep">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <BusinessRequestForm service={service} />
        </div>
    );
}

function BusinessRequestForm({ service }: { service: BusinessServiceKey }) {
    const s = BUSINESS_SERVICES[service];
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();
    const [form, setForm] = useState({ company: "", contact: "", phone: "", role: "" });
    const [detail, setDetail] = useState<Record<string, string>>({});
    const [consent, setConsent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const input = "w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white";

    async function submit() {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch("/api/hero/business-requests", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ service, ...form, detail, consent }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || "신청하지 못했습니다.");
            setDone(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "신청하지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <section id="apply" className="scroll-mt-20">
            <div className="mx-auto max-w-2xl px-6 lg:px-8 py-20">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">{s.label} 신청</h2>
                <p className="text-sm text-neutral-600 mb-8">신청을 남겨 주시면 HeRo 담당자가 이메일로 연락드려 진행 방식과 일정을 함께 정합니다.</p>

                {!isAuthenticated ? (
                    <div className="border border-neutral-200 rounded-xl p-6 text-sm text-neutral-600">
                        신청은 로그인 후 할 수 있습니다.{" "}
                        <Link href={loginHref(pathname)} className="font-semibold underline">로그인</Link>
                    </div>
                ) : done ? (
                    <div className="border border-neutral-200 rounded-xl p-6 flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                        <div>
                            <p className="font-bold">신청을 받았습니다</p>
                            <p className="text-sm text-neutral-600 mt-1">{user?.email}로 연락드리겠습니다.</p>
                        </div>
                    </div>
                ) : (
                    <div className="border border-neutral-200 rounded-xl p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Labeled label="회사명 *"><input className={input} value={form.company} maxLength={100} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></Labeled>
                            <Labeled label="담당자 이름 *"><input className={input} value={form.contact} maxLength={50} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></Labeled>
                            <Labeled label="직책"><input className={input} value={form.role} maxLength={50} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></Labeled>
                            <Labeled label="연락처"><input className={input} value={form.phone} maxLength={30} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></Labeled>
                        </div>
                        {s.fields.map(f => (
                            <Labeled key={f.key} label={f.label}>
                                {f.type === "textarea" ? (
                                    <textarea className={input} rows={4} maxLength={2000} placeholder={f.placeholder}
                                        value={detail[f.key] ?? ""} onChange={e => setDetail(d => ({ ...d, [f.key]: e.target.value }))} />
                                ) : (
                                    <input className={input} type={f.type === "number" ? "number" : "text"} placeholder={f.placeholder}
                                        value={detail[f.key] ?? ""} onChange={e => setDetail(d => ({ ...d, [f.key]: e.target.value }))} />
                                )}
                            </Labeled>
                        ))}
                        <div className="text-xs text-neutral-600 bg-neutral-50 rounded-lg p-3 space-y-1">
                            <p className="font-semibold text-neutral-900">개인정보 수집·이용 동의 (필수)</p>
                            <p>목적: {s.label} 상담·진행 연락 · 항목: 회사명, 담당자 이름·직책·연락처, 계정 이메일 · 보유 기간: 상담 종료 후 1년</p>
                            <label className="flex items-center gap-2 pt-1 text-sm text-neutral-900 cursor-pointer">
                                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> 동의합니다
                            </label>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button onClick={submit} disabled={busy || !consent || !form.company.trim() || !form.contact.trim()}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E53935] text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            {busy && <Loader2 className="h-4 w-4 animate-spin" />} 신청하기
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="text-xs font-semibold text-neutral-600 mb-1 block">{label}</span>
            {children}
        </label>
    );
}
