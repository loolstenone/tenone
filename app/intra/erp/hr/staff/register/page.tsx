"use client";

/**
 * ERP › HR › 구성원 등록 (입사) — 2026-10-10 초대 방식으로 재작성
 *   계정 초대 메일(비밀번호는 본인이 설정) + 직원 정보 + 권한 묶음 + 담당 브랜드를 한 번에 (lib/staff-lifecycle.ts)
 *   직무 권한(인사·급여·재무·회계)은 여기서 주지 않는다 — Standard › 권한 체계 (마스터)
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";
import { EMPLOYMENT_TYPES, STAFF_PRESETS } from "@/lib/staff-presets";

const input = "w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";
const label = "mb-1 block text-xs text-neutral-500";

export default function StaffRegisterPage() {
    const [form, setForm] = useState({
        name: "", email: "", employeeId: "", department: "", position: "",
        employmentType: "정규직", hireDate: new Date().toISOString().slice(0, 10), preset: "staff", brands: [] as string[],
    });
    const [sites, setSites] = useState<{ slug: string; name: string }[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState<{ existingAccount: boolean } | null>(null);

    useEffect(() => {
        createClient().from("ums_sites").select("slug, name").in("tier", ["core", "focus"]).order("slug")
            .then(({ data }: { data: { slug: string; name: string }[] | null }) => setSites(data ?? []));
    }, []);

    const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
    const toggleBrand = (slug: string) =>
        setForm(f => ({ ...f, brands: f.brands.includes(slug) ? f.brands.filter(b => b !== slug) : [...f.brands, slug] }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true); setError("");
        const res = await fetch("/api/intra/staff", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        }).catch(() => null);
        const d = await res?.json().catch(() => null);
        if (!res?.ok) setError(d?.error ?? "등록하지 못했습니다.");
        else setDone({ existingAccount: d.existingAccount });
        setBusy(false);
    };

    if (done) {
        return (
            <div className="mx-auto max-w-lg space-y-4 py-10 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="text-lg font-semibold text-neutral-900">{form.name}님 입사 등록 완료</p>
                <p className="text-sm text-neutral-600">
                    {done.existingAccount
                        ? "이미 Ten:One ID가 있어 그 계정에 직원 권한을 더했습니다. 안내 메일을 보냈습니다."
                        : `${form.email}로 초대 메일을 보냈습니다. 링크(24시간 유효)에서 본인이 비밀번호를 정합니다.`}
                    <br />첫 로그인 때 인사 정보 처리 안내 확인과 보안 서약을 마치면 재직 상태가 됩니다.
                </p>
                <div className="flex justify-center gap-3 pt-2 text-sm">
                    <Link href="/intra/erp/hr/staff/lifecycle" className="border border-neutral-200 px-4 py-2 hover:border-neutral-900">입·퇴사 현황</Link>
                    <button onClick={() => { setDone(null); setForm(f => ({ ...f, name: "", email: "", employeeId: "", brands: [] })); }}
                        className="bg-neutral-900 px-4 py-2 text-white">한 명 더 등록</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">
            <Link href="/intra/erp/hr/staff/lifecycle" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900">
                <ArrowLeft className="h-3 w-3" /> 입·퇴사 현황
            </Link>
            <PageHeader title="구성원 등록 (입사)" description="초대 메일로 계정을 열고, 직원 정보와 권한 묶음을 한 번에 부여합니다 — 인사 담당 또는 마스터" />

            <form onSubmit={submit} className="space-y-6">
                <section className="grid grid-cols-1 gap-4 rounded-lg border border-neutral-200 bg-white p-5 sm:grid-cols-2">
                    <div><label className={label}>이름 *</label><input required value={form.name} onChange={e => set("name", e.target.value)} className={input} /></div>
                    <div><label className={label}>이메일 * (로그인 ID)</label><input required type="email" value={form.email} onChange={e => set("email", e.target.value)} className={input} /></div>
                    <div><label className={label}>사번</label><input value={form.employeeId} onChange={e => set("employeeId", e.target.value)} placeholder="2026-0001" className={input} /></div>
                    <div><label className={label}>입사일</label><input type="date" value={form.hireDate} onChange={e => set("hireDate", e.target.value)} className={input} /></div>
                    <div><label className={label}>부서</label><input value={form.department} onChange={e => set("department", e.target.value)} className={input} /></div>
                    <div><label className={label}>직위</label><input value={form.position} onChange={e => set("position", e.target.value)} className={input} /></div>
                    <div>
                        <label className={label}>고용형태</label>
                        <select value={form.employmentType} onChange={e => set("employmentType", e.target.value)} className={input}>
                            {EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                </section>

                <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
                    <p className="text-sm font-semibold text-neutral-900">권한 묶음 *</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {STAFF_PRESETS.map(p => (
                            <label key={p.key} className={`cursor-pointer rounded border p-3 ${form.preset === p.key ? "border-neutral-900" : "border-neutral-200"}`}>
                                <input type="radio" name="preset" className="sr-only" checked={form.preset === p.key} onChange={() => set("preset", p.key)} />
                                <p className="text-sm font-medium text-neutral-900">{p.label}</p>
                                <p className="text-[11px] text-neutral-500">{p.desc}</p>
                            </label>
                        ))}
                    </div>
                    <p className="pt-2 text-sm font-semibold text-neutral-900">담당 브랜드 <span className="text-xs font-normal text-neutral-400">(선택 — 인트라 브랜드 관리 메뉴)</span></p>
                    <div className="flex flex-wrap gap-2">
                        {sites.map(s => (
                            <button type="button" key={s.slug} onClick={() => toggleBrand(s.slug)}
                                className={`rounded border px-3 py-1 text-xs ${form.brands.includes(s.slug) ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600"}`}>
                                {s.name}
                            </button>
                        ))}
                    </div>
                    <p className="text-[11px] text-neutral-400">인사·급여·재무·회계 직무 권한은 마스터가 Standard › 권한 체계에서 따로 부여합니다.</p>
                </section>

                {error && <p className="text-sm text-rose-600">{error}</p>}
                <button disabled={busy} className="flex items-center gap-2 bg-neutral-900 px-5 py-2.5 text-sm text-white disabled:opacity-50">
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} 초대 메일 보내고 등록
                </button>
            </form>
        </div>
    );
}
