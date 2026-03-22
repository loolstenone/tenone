"use client";

import { FileText, ArrowRight, User } from "lucide-react";

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

const progressItems: ProgressApproval[] = [
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

export default function ApprovalProgressPage() {
    return (
        <div className="max-w-5xl">
            <div className="mb-2">
                <h1 className="text-2xl font-bold">결재 진행</h1>
                <p className="text-sm text-neutral-500">진행 중인 결재 문서</p>
            </div>

            {/* 요약 */}
            <div className="flex gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-neutral-600">진행 중</span>
                    <span className="text-sm font-semibold">{progressItems.length}건</span>
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
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">결재유형</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">현재 단계</th>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500">결재라인</th>
                        </tr>
                    </thead>
                    <tbody>
                        {progressItems.map((item) => (
                            <tr
                                key={item.docNo}
                                className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-2.5 text-xs text-neutral-400 font-mono">{item.docNo}</td>
                                <td className="px-4 py-2.5 text-sm text-neutral-800 font-medium">{item.title}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-600">{item.drafter}</td>
                                <td className="px-4 py-2.5 text-xs text-neutral-500">{item.draftDate}</td>
                                <td className="px-4 py-2.5">
                                    <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                                        {item.currentStep}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        {item.approvalLine.map((approver, aIdx) => (
                                            <div key={aIdx} className="flex items-center gap-1">
                                                <span
                                                    className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded ${
                                                        aIdx < item.currentApprover
                                                            ? "bg-green-50 text-green-600"
                                                            : aIdx === item.currentApprover
                                                            ? "bg-blue-50 text-blue-600 font-medium"
                                                            : "bg-neutral-50 text-neutral-400"
                                                    }`}
                                                >
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
