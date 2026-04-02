"use client";

import { useState, useEffect } from "react";
import { FileText, ArrowRight, User, Loader2 } from "lucide-react";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader } from "@/components/intra/IntraUI";

interface ProgressApproval {
    docNo: string;
    title: string;
    drafter: string;
    draftDate: string;
    type: string;
    currentStep: string;
    approvalLine: string[];
    currentApprover: number;
}

const mockItems: ProgressApproval[] = [
    {
        docNo: "APR-2026-0039",
        title: "콘텐츠 제작 외주 계약 품의",
        drafter: "이수진",
        draftDate: "2026-03-15",
        type: "품의",
        currentStep: "2차 결재",
        approvalLine: ["팀장 박영상", "부장 Sarah Kim", "대표 Cheonil Jeon"],
        currentApprover: 1,
    },
    {
        docNo: "APR-2026-0038",
        title: "AI 크리에이터 도구 도입 기안",
        drafter: "최민호",
        draftDate: "2026-03-14",
        type: "기안",
        currentStep: "1차 결재",
        approvalLine: ["팀장 이수진", "대표 Cheonil Jeon"],
        currentApprover: 0,
    },
    {
        docNo: "APR-2026-0037",
        title: "2월 커뮤니티 운영 실적 보고",
        drafter: "김준호",
        draftDate: "2026-03-13",
        type: "보고",
        currentStep: "최종 결재",
        approvalLine: ["팀장 Sarah Kim", "대표 Cheonil Jeon"],
        currentApprover: 1,
    },
];

function dbRowToItem(r: Record<string, unknown>): ProgressApproval {
    const steps = (r.approval_steps as { role: string; name?: string }[]) || [];
    const currentIdx = (r.current_step as number) || 0;
    return {
        docNo: (r.doc_no as string) || (r.id as string)?.slice(0, 8).toUpperCase() || "-",
        title: (r.title as string) || "-",
        drafter: (r.drafter as { name?: string })?.name || (r.drafter_name as string) || "-",
        draftDate: ((r.created_at as string) || "").slice(0, 10),
        type: (r.type as string) || "기안",
        currentStep: steps[currentIdx]?.role || `${currentIdx + 1}차 결재`,
        approvalLine: steps.map(s => s.name ? `${s.role} ${s.name}` : s.role),
        currentApprover: currentIdx,
    };
}

export default function ApprovalProgressPage() {
    const [items, setItems] = useState<ProgressApproval[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { approvals } = await erpDb.fetchApprovals({ status: 'pending' });
                if (!cancelled && approvals.length > 0) {
                    setItems(approvals.map((a: any) => dbRowToItem(a as Record<string, unknown>)));
                } else if (!cancelled) {
                    setItems(mockItems);
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

    return (
        <div className="space-y-6">
            <PageHeader title="결재 진행" description="진행 중인 결재 문서" />

            <div className="flex gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-neutral-600">진행 중</span>
                    <span className="text-sm font-semibold">{items.length}건</span>
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
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">결재유형</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">현재 단계</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">결재라인</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-neutral-400">진행 중인 결재 문서가 없습니다</td></tr>
                        )}
                        {items.map((item) => (
                            <tr key={item.docNo} className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors">
                                <td className="px-4 py-2.5 text-xs text-neutral-400 font-mono">{item.docNo}</td>
                                <td className="px-4 py-2.5 text-sm text-neutral-800 font-medium">{item.title}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-600">{item.drafter}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-500">{item.draftDate}</td>
                                <td className="px-4 py-2.5">
                                    <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">{item.type}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600">{item.currentStep}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        {item.approvalLine.map((approver, aIdx) => (
                                            <div key={aIdx} className="flex items-center gap-1">
                                                <span className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded ${
                                                    aIdx < item.currentApprover
                                                        ? "bg-green-50 text-green-600"
                                                        : aIdx === item.currentApprover
                                                        ? "bg-blue-50 text-blue-600 font-medium"
                                                        : "bg-neutral-50 text-neutral-400"
                                                }`}>
                                                    <User className="w-2.5 h-2.5" />
                                                    {approver}
                                                </span>
                                                {aIdx < item.approvalLine.length - 1 && (
                                                    <ArrowRight className="w-3 h-3 text-neutral-300" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
