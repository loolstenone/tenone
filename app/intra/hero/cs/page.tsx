"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Search } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Inquiry {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
}

export default function HeroCsPage() {
    const [loading, setLoading] = useState(true);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const sb = createClient();
        sb.from("inquiries")
            .select("id, name, email, subject, message, status, created_at")
            .eq("brand_id", "hero")
            .order("created_at", { ascending: false })
            .limit(200)
            .then(({ data }) => {
                setInquiries((data ?? []) as Inquiry[]);
                setLoading(false);
            });
    }, []);

    const filtered = inquiries.filter(i =>
        !search ||
        i.name?.includes(search) ||
        i.email?.includes(search) ||
        i.subject?.includes(search)
    );

    const statusLabel = (s: string) => ({
        pending: { label: "미답변", cls: "bg-amber-50 text-amber-700" },
        answered: { label: "답변완료", cls: "bg-emerald-50 text-emerald-700" },
        closed: { label: "종료", cls: "bg-neutral-100 text-neutral-500" },
    }[s] ?? { label: s, cls: "bg-neutral-100 text-neutral-500" });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">고객 문의</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">HeRo 서비스 문의 · CS 관리</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 이메일, 제목..."
                        className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-56 focus:outline-none focus:border-neutral-400" />
                </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">전체 문의</p>
                    <p className="text-2xl font-bold">{inquiries.length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">미답변</p>
                    <p className="text-2xl font-bold text-amber-600">{inquiries.filter(i => i.status === "pending").length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">답변 완료</p>
                    <p className="text-2xl font-bold text-emerald-600">{inquiries.filter(i => i.status === "answered").length}</p>
                </div>
            </div>

            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <MessageSquare className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{search ? "검색 결과가 없습니다" : "문의 내역이 없습니다"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left">
                                <th className="px-4 py-3 font-semibold text-neutral-500">이름</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">이메일</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">제목</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">상태</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">일시</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(i => {
                                const st = statusLabel(i.status);
                                return (
                                    <tr key={i.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                        <td className="px-4 py-3 font-medium">{i.name || "-"}</td>
                                        <td className="px-4 py-3 text-neutral-500">{i.email || "-"}</td>
                                        <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">{i.subject || "(제목 없음)"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${st.cls}`}>{st.label}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-400">
                                            {new Date(i.created_at).toLocaleDateString("ko-KR")}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">
                        총 {filtered.length}건
                    </div>
                </div>
            )}
        </div>
    );
}
