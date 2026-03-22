"use client";

import { CheckCircle, XCircle, FileCheck } from "lucide-react";

interface CompletedApproval {
    docNo: string;
    title: string;
    drafter: string;
    draftDate: string;
    completedDate: string;
    type: string;
    result: "승인" | "반려";
}

const completedItems: CompletedApproval[] = [
    {
        docNo: "APR-2026-0036",
        title: "사무실 인테리어 리뉴얼 품의",
        drafter: "Sarah Kim",
        draftDate: "2026-03-10",
        completedDate: "2026-03-12",
        type: "품의",
        result: "승인",
    },
    {
        docNo: "APR-2026-0035",
        title: "2월 월간 업무보고",
        drafter: "김준호",
        draftDate: "2026-03-05",
        completedDate: "2026-03-07",
        type: "보고",
        result: "승인",
    },
    {
        docNo: "APR-2026-0034",
        title: "외부 강연료 지급 품의",
        drafter: "박영상",
        draftDate: "2026-03-03",
        completedDate: "2026-03-05",
        type: "품의",
        result: "반려",
    },
    {
        docNo: "APR-2026-0033",
        title: "신규 브랜드 런칭 기획안",
        drafter: "이수진",
        draftDate: "2026-02-28",
        completedDate: "2026-03-03",
        type: "기안",
        result: "승인",
    },
    {
        docNo: "APR-2026-0032",
        title: "AI 도구 라이선스 갱신 품의",
        drafter: "최민호",
        draftDate: "2026-02-25",
        completedDate: "2026-02-28",
        type: "품의",
        result: "승인",
    },
];

export default function ApprovalCompletedPage() {
    const approved = completedItems.filter((i) => i.result === "승인").length;
    const rejected = completedItems.filter((i) => i.result === "반려").length;

    return (
        <div className="max-w-5xl">
            <div className="mb-2">
                <h1 className="text-2xl font-bold">결재 완료</h1>
                <p className="text-sm text-neutral-500">완료된 결재 문서</p>
            </div>

            {/* 요약 */}
            <div className="flex gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg">
                    <FileCheck className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs text-neutral-600">전체</span>
                    <span className="text-sm font-semibold">{completedItems.length}건</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-neutral-600">승인</span>
                    <span className="text-sm font-semibold text-green-600">{approved}건</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-neutral-600">반려</span>
                    <span className="text-sm font-semibold text-red-600">{rejected}건</span>
                </div>
            </div>

            {/* 테이블 */}
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
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
                        {completedItems.map((item) => (
                            <tr
                                key={item.docNo}
                                className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-2.5 text-xs text-neutral-400 font-mono">{item.docNo}</td>
                                <td className="px-4 py-2.5 text-sm text-neutral-800 font-medium">{item.title}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-600">{item.drafter}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-500">{item.draftDate}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-500">{item.completedDate}</td>
                                <td className="px-4 py-2.5">
                                    <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5">
                                    {item.result === "승인" ? (
                                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-50 text-green-600 w-fit">
                                            <CheckCircle className="w-3 h-3" />
                                            승인
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 w-fit">
                                            <XCircle className="w-3 h-3" />
                                            반려
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
