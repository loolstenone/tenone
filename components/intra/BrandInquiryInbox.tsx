"use client";

/**
 * 브랜드 고객 문의 인박스 — contact_submissions 기반 (공개 폼 → /api/contact 저장분)
 * brandId 지정 시 form_type이 `${brandId}_`로 시작하는 문의만, 미지정 시 전체.
 * 예: Badak 문의 = badak_inquiry, Jakka 광고 문의 = jakka_ad
 */

import { useState, useEffect } from "react";
import { MessageSquare, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Inquiry {
    id: string;
    form_type: string;
    name: string | null;
    email: string | null;
    company: string | null;
    message: string | null;
    status: string | null;
    created_at: string;
}

const STATUS: Record<string, { l: string; c: string }> = {
    new: { l: "미답변", c: "bg-amber-50 text-amber-700" },
    pending: { l: "미답변", c: "bg-amber-50 text-amber-700" },
    answered: { l: "완료", c: "bg-emerald-50 text-emerald-700" },
    closed: { l: "종료", c: "bg-neutral-100 text-neutral-500" },
};
const OPEN = new Set(["new", "pending"]);

export function BrandInquiryInbox({ brandId, brandName }: { brandId?: string; brandName: string }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let q = createClient().from("contact_submissions")
            .select("id, form_type, name, email, company, message, status, created_at")
            .order("created_at", { ascending: false })
            .limit(200);
        if (brandId) q = q.like("form_type", `${brandId}\\_%`);
        q.then((res: { data: unknown[] | null; error: unknown }) => {
            if (res.error) setError("문의 내역을 불러오지 못했습니다.");
            setInquiries((res.data ?? []) as Inquiry[]);
            setLoading(false);
        });
    }, [brandId]);

    const term = search.trim();
    const filtered = inquiries.filter(i => !term || [i.name, i.email, i.company, i.message].some(v => v?.includes(term)));
    const openCount = inquiries.filter(i => OPEN.has(i.status ?? "")).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">고객 문의</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">{brandName} 문의 · 공개 폼 접수분</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 이메일, 내용..."
                        className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-52 focus:outline-none focus:border-neutral-400" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { l: "전체", v: inquiries.length, c: "" },
                    { l: "미답변", v: openCount, c: "text-amber-600" },
                    { l: "처리", v: inquiries.length - openCount, c: "text-emerald-600" },
                ].map(({ l, v, c }) => (
                    <div key={l} className="border border-neutral-200 rounded-lg p-4">
                        <p className="text-xs text-neutral-400 mb-1">{l}</p>
                        <p className={`text-2xl font-bold ${c}`}>{v}</p>
                    </div>
                ))}
            </div>
            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : error ? (
                <div className="border border-rose-200 bg-rose-50 rounded-lg p-6 text-center text-sm text-rose-700">{error}</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <MessageSquare className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{term ? "검색 결과 없음" : "문의 내역 없음"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left">
                                {["유형", "이름", "이메일", "내용", "상태", "일시"].map(h => <th key={h} className="px-4 py-3 font-semibold text-neutral-500">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(i => {
                                const s = STATUS[i.status ?? ""] ?? { l: i.status ?? "-", c: "bg-neutral-100 text-neutral-500" };
                                return (
                                    <tr key={i.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-xs font-mono text-neutral-500">{i.form_type}</td>
                                        <td className="px-4 py-3 font-medium">{i.name || "-"}{i.company ? <span className="text-neutral-400 font-normal"> · {i.company}</span> : null}</td>
                                        <td className="px-4 py-3 text-neutral-500">{i.email || "-"}</td>
                                        <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">{i.message || "(없음)"}</td>
                                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${s.c}`}>{s.l}</span></td>
                                        <td className="px-4 py-3 text-xs text-neutral-400">{new Date(i.created_at).toLocaleDateString("ko-KR")}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">총 {filtered.length}건</div>
                </div>
            )}
        </div>
    );
}
