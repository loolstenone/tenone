"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader, Card, Badge, Spinner } from "@/components/intra/IntraUI";
import { useAuth } from "@/lib/auth-context";

interface PendingApproval {
    docNo: string;
    title: string;
    drafter: string;
    draftDate: string;
    type: string;
    status: string;
}

export default function ApprovalPendingPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<PendingApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    useEffect(() => {
        setLoading(true);
        erpDb.fetchApprovals({ status: 'pending' })
            .then(({ approvals }) => {
                setItems(approvals.map((a: Record<string, unknown>) => ({
                    docNo: (a.id as string) || '',
                    title: (a.title as string) || '',
                    drafter: ((a.requester as Record<string, unknown>)?.name as string) || '알 수 없음',
                    draftDate: ((a.created_at as string) || '').slice(0, 10),
                    type: (a.type as string) || '기안',
                    status: '승인대기',
                })));
            })
            .catch(() => {
                setItems([]);
            })
            .finally(() => setLoading(false));
    }, [user?.id]);

    const handleApprove = (docNo: string) => {
        setItems((prev) => prev.filter((item) => item.docNo !== docNo));
        erpDb.updateApprovalStatus(docNo, 'approved').catch(() => {});
    };

    const handleReject = (docNo: string) => {
        setItems((prev) => prev.filter((item) => item.docNo !== docNo));
        erpDb.updateApprovalStatus(docNo, 'rejected').catch(() => {});
    };

    if (loading) return <div className="max-w-5xl"><Spinner /></div>;

    return (
        <div className="max-w-5xl">
            <PageHeader title="결재 대기" description="승인 대기 중인 문서" />

            {/* 요약 */}
            <div className="flex gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-neutral-600">대기 문서</span>
                    <span className="text-sm font-semibold">{items.length}건</span>
                </div>
            </div>

            {/* 테이블 */}
            <Card padding={false}>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50">
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">문서번호</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">제목</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">기안자</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">기안일</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">결재유형</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">상태</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500 text-right">액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr
                                key={item.docNo}
                                className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors"
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            >
                                <td className="px-4 py-2.5 text-xs text-neutral-400 font-mono">{item.docNo}</td>
                                <td className="px-4 py-2.5 text-sm text-neutral-800 font-medium">{item.title}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-600">{item.drafter}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-500">{item.draftDate}</td>
                                <td className="px-4 py-2.5">
                                    <Badge label={item.type} />
                                </td>
                                <td className="px-4 py-2.5">
                                    <Badge label={item.status} variant="warning" />
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                    {hoveredIdx === idx && (
                                        <div className="flex gap-1.5 justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleApprove(item.docNo);
                                                }}
                                                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                                승인
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReject(item.docNo);
                                                }}
                                                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                            >
                                                <XCircle className="w-3 h-3" />
                                                반려
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-xs text-neutral-400">
                                    데이터가 없습니다
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
