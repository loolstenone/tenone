"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, FileCheck, Loader2 } from "lucide-react";
import * as erpDb from "@/lib/supabase/erp";

interface CompletedApproval {
    docNo: string;
    title: string;
    drafter: string;
    draftDate: string;
    completedDate: string;
    type: string;
    result: "승인" | "반려";
}

const mockItems: CompletedApproval[] = [
    { docNo: "APR-2026-0036", title: "사무실 인테리어 리뉴얼 품의", drafter: "Sarah Kim", draftDate: "2026-03-10", completedDate: "2026-03-12", type: "품의", result: "승인" },
    { docNo: "APR-2026-0035", title: "2월 월간 업무보고", drafter: "김준호", draftDate: "2026-03-05", completedDate: "2026-03-07", type: "보고", result: "승인" },
    { docNo: "APR-2026-0034", title: "외부 강연료 지급 품의", drafter: "박영상", draftDate: "2026-03-03", completedDate: "2026-03-05", type: "품의", result: "반려" },
    { docNo: "APR-2026-0033", title: "신규 브랜드 런칭 기획안", drafter: "이수진", draftDate: "2026-02-28", completedDate: "2026-03-03", type: "기안", result: "승인" },
    { docNo: "APR-2026-0032", title: "AI 도구 라이선스 갱신 품의", drafter: "최민호", draftDate: "2026-02-25", completedDate: "2026-02-28", type: "품의", result: "승인" },
];

function dbRowToItem(r: Record<string, unknown>): CompletedApproval {
    const status = r.status as string;
    return {
        docNo: (r.doc_no as string) || (r.id as string)?.slice(0, 8).toUpperCase() || "-",
        title: (r.title as string) || "-",
        drafter: (r.drafter as { name?: string })?.name || (r.drafter_name as string) || "-",
        draftDate: ((r.created_at as string) || "").slice(0, 10),
        completedDate: ((r.updated_at as string) || "").slice(0, 10),
        type: (r.type as string) || "기안",
        result: status === "approved" ? "승인" : "반려",
    };
}

export default function ApprovalCompletedPage() {
    const [items, setItems] = useState<CompletedApproval[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [approvedRes, rejectedRes] = await Promise.all([
                    erpDb.fetchApprovals({ status: 'approved' }),
                    erpDb.fetchApprovals({ status: 'rejected' }),
                ]);
                const all = [
                    ...approvedRes.approvals.map((a: any) => dbRowToItem(a as Record<string, unknown>)),
                    ...rejectedRes.approvals.map((a: any) => dbRowToItem(a as Record<string, unknown>)),
                ].sort((a, b) => b.completedDate.localeCompare(a.completedDate));

                if (!cancelled) {
                    setItems(all.length > 0 ? all : mockItems);
                }
            } catch {
                if (!cancelled) setItems(mockItems);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
        );
    }

    const approved = items.filter((i) => i.result === "승인").length;
    const rejected = items.filter((i) => i.result === "반려").length;

    return (
        <div className="max-w-5xl">
            <div className="mb-2">
                <h1 className="text-xl font-semibold">결재 완료</h1>
                <p className="text-sm text-neutral-500">완료된 결재 문서</p>
            </div>

            <div className="flex gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200">
                    <FileCheck className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs text-neutral-600">전체</span>
                    <span className="text-sm font-semibold">{items.length}건</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-neutral-600">승인</span>
                    <span className="text-sm font-semibold text-green-600">{approved}건</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-neutral-600">반려</span>
                    <span className="text-sm font-semibold text-red-600">{rejected}건</span>
                </div>
            </div>

            <div className="bg-white border border-neutral-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50">
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">문서번호</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">제목</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">기안자</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">기안일</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">완료일</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">결재유형</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">결과</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-neutral-400">완료된 결재 문서가 없습니다</td></tr>
                        )}
                        {items.map((item) => (
                            <tr key={item.docNo} className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors">
                                <td className="px-4 py-2.5 text-xs text-neutral-400 font-mono">{item.docNo}</td>
                                <td className="px-4 py-2.5 text-sm text-neutral-800 font-medium">{item.title}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-600">{item.drafter}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-500">{item.draftDate}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-500">{item.completedDate}</td>
                                <td className="px-4 py-2.5">
                                    <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">{item.type}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                    {item.result === "승인" ? (
                                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-50 text-green-600 w-fit">
                                            <CheckCircle className="w-3 h-3" /> 승인
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 w-fit">
                                            <XCircle className="w-3 h-3" /> 반려
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
