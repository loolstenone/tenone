"use client";

import { useState } from "react";
import {
    FileSignature, Plus, CheckCircle2, XCircle, Clock, FileText, ChevronRight, ChevronDown,
    User, Check, X, Circle,
} from "lucide-react";
import Link from "next/link";
import { PageHeader, PrimaryButton, Badge, Card } from "@/components/intra/IntraUI";

type ApprovalStatus = "대기" | "진행중" | "완료" | "반려";
type ApprovalFactor = "일반" | "프로젝트" | "타임시트" | "경비" | "구매" | "인사" | "계약";
type TabKey = "pending" | "drafted" | "completed";

interface ApprovalStep {
    role: string;
    name: string;
    status: "완료" | "현재" | "대기" | "반려";
    date?: string;
    comment?: string;
}

interface ApprovalItem {
    id: string;
    docNo: string;
    title: string;
    drafter: string;
    approver: string;
    date: string;
    status: ApprovalStatus;
    type: string;
    factor: ApprovalFactor;
    approvalLine: ApprovalStep[];
}

const factorBadge: Record<ApprovalFactor, string> = {
    "일반": "bg-neutral-100 text-neutral-500",
    "프로젝트": "bg-violet-50 text-violet-600",
    "타임시트": "bg-blue-50 text-blue-600",
    "경비": "bg-amber-50 text-amber-600",
    "구매": "bg-green-50 text-green-600",
    "인사": "bg-pink-50 text-pink-600",
    "계약": "bg-slate-100 text-slate-600",
};

const pendingItems: ApprovalItem[] = [
    {
        id: "a1", docNo: "APR-2026-0042", title: "MADLeap 5기 운영비 집행 요청",
        drafter: "김준호", approver: "전천일", date: "2026-03-20", status: "대기", type: "품의", factor: "경비",
        approvalLine: [
            { role: "기안자", name: "김준호", status: "완료", date: "2026-03-20" },
            { role: "팀장", name: "Sarah Kim", status: "완료", date: "2026-03-20" },
            { role: "최종결재", name: "전천일", status: "현재" },
        ],
    },
    {
        id: "a2", docNo: "APR-2026-0041", title: "LUKI 2nd Single 프로모션 계획",
        drafter: "Sarah Kim", approver: "전천일", date: "2026-03-19", status: "대기", type: "기안", factor: "프로젝트",
        approvalLine: [
            { role: "기안자", name: "Sarah Kim", status: "완료", date: "2026-03-19" },
            { role: "최종결재", name: "전천일", status: "현재" },
        ],
    },
    {
        id: "a3", docNo: "APR-2026-0043", title: "3월 3주차 타임시트 마감 승인",
        drafter: "이수진", approver: "전천일", date: "2026-03-21", status: "대기", type: "보고", factor: "타임시트",
        approvalLine: [
            { role: "기안자", name: "이수진", status: "완료", date: "2026-03-21" },
            { role: "PM", name: "전천일", status: "현재" },
        ],
    },
    {
        id: "a4", docNo: "APR-2026-0039", title: "3월 법인카드 사용 내역 보고",
        drafter: "강회계", approver: "전천일", date: "2026-03-18", status: "대기", type: "보고", factor: "경비",
        approvalLine: [
            { role: "기안자", name: "강회계", status: "완료", date: "2026-03-18" },
            { role: "CFO", name: "전천일", status: "현재" },
        ],
    },
];

const draftedItems: ApprovalItem[] = [
    {
        id: "d1", docNo: "APR-2026-0038", title: "Q2 사업계획서",
        drafter: "전천일", approver: "이사회", date: "2026-03-17", status: "진행중", type: "기안", factor: "일반",
        approvalLine: [
            { role: "기안자", name: "전천일", status: "완료", date: "2026-03-17" },
            { role: "이사회", name: "이사회", status: "현재" },
        ],
    },
    {
        id: "d2", docNo: "APR-2026-0030", title: "Badak 파트너십 MOU 체결 건",
        drafter: "전천일", approver: "법무팀", date: "2026-03-10", status: "완료", type: "기안", factor: "계약",
        approvalLine: [
            { role: "기안자", name: "전천일", status: "완료", date: "2026-03-10" },
            { role: "법무검토", name: "법무팀", status: "완료", date: "2026-03-12" },
            { role: "최종결재", name: "전천일", status: "완료", date: "2026-03-12" },
        ],
    },
    {
        id: "d3", docNo: "APR-2026-0044", title: "신규 인턴 채용 요청",
        drafter: "전천일", approver: "HR팀", date: "2026-03-21", status: "진행중", type: "기안", factor: "인사",
        approvalLine: [
            { role: "기안자", name: "전천일", status: "완료", date: "2026-03-21" },
            { role: "HR 검토", name: "박채용", status: "현재" },
            { role: "최종결재", name: "전천일", status: "대기" },
        ],
    },
];

const completedItems: ApprovalItem[] = [
    {
        id: "c1", docNo: "APR-2026-0035", title: "2월 급여 지급 승인",
        drafter: "박인사", approver: "전천일", date: "2026-03-05", status: "완료", type: "기안", factor: "인사",
        approvalLine: [
            { role: "기안자", name: "박인사", status: "완료", date: "2026-03-05" },
            { role: "CFO", name: "강회계", status: "완료", date: "2026-03-05" },
            { role: "최종결재", name: "전천일", status: "완료", date: "2026-03-05" },
        ],
    },
    {
        id: "c2", docNo: "APR-2026-0033", title: "MADLeague 스폰서 계약 검토",
        drafter: "Sarah Kim", approver: "전천일", date: "2026-03-03", status: "완료", type: "기안", factor: "계약",
        approvalLine: [
            { role: "기안자", name: "Sarah Kim", status: "완료", date: "2026-03-03" },
            { role: "법무검토", name: "법무팀", status: "완료", date: "2026-03-04" },
            { role: "최종결재", name: "전천일", status: "완료", date: "2026-03-04" },
        ],
    },
    {
        id: "c3", docNo: "APR-2026-0028", title: "신규 장비 구매 요청",
        drafter: "조에이", approver: "전천일", date: "2026-02-28", status: "완료", type: "품의", factor: "구매",
        approvalLine: [
            { role: "기안자", name: "조에이", status: "완료", date: "2026-02-28" },
            { role: "팀장", name: "Sarah Kim", status: "완료", date: "2026-02-28" },
            { role: "CFO", name: "강회계", status: "완료", date: "2026-03-01" },
            { role: "최종결재", name: "전천일", status: "완료", date: "2026-03-01" },
        ],
    },
    {
        id: "c4", docNo: "APR-2026-0025", title: "리제로스 시즌2 예산 품의 반려",
        drafter: "마리그", approver: "전천일", date: "2026-02-25", status: "반려", type: "품의", factor: "프로젝트",
        approvalLine: [
            { role: "기안자", name: "마리그", status: "완료", date: "2026-02-25" },
            { role: "팀장", name: "Sarah Kim", status: "완료", date: "2026-02-25" },
            { role: "최종결재", name: "전천일", status: "반려", date: "2026-02-26", comment: "예산 상세 내역 보완 필요" },
        ],
    },
];

const statusBadge: Record<ApprovalStatus, "default" | "success" | "warning" | "danger" | "info"> = {
    대기: "warning",
    진행중: "info",
    완료: "success",
    반려: "danger",
};

const tabs: { key: TabKey; label: string }[] = [
    { key: "pending", label: "결재 대기" },
    { key: "drafted", label: "내가 기안한 것" },
    { key: "completed", label: "결재 완료" },
];

/* ── 결재라인 스텝퍼 컴포넌트 ── */
function ApprovalStepper({ steps }: { steps: ApprovalStep[] }) {
    return (
        <div className="mt-3 pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-0">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex items-center">
                        {/* Step circle + info */}
                        <div className="flex flex-col items-center min-w-[80px]">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center ${step.status === '완료' ? 'bg-green-100' : step.status === '현재' ? 'bg-blue-100 ring-2 ring-blue-300' : step.status === '반려' ? 'bg-red-100' : 'bg-neutral-100'}`}>
                                {step.status === '완료' && <Check className="h-3.5 w-3.5 text-green-600" />}
                                {step.status === '현재' && <Circle className="h-3 w-3 text-blue-600 fill-blue-600" />}
                                {step.status === '반려' && <X className="h-3.5 w-3.5 text-red-600" />}
                                {step.status === '대기' && <Circle className="h-3 w-3 text-neutral-300" />}
                            </div>
                            <p className="text-[10px] font-medium text-neutral-600 mt-1">{step.role}</p>
                            <p className="text-[10px] text-neutral-400">{step.name}</p>
                            {step.date && <p className="text-[9px] text-neutral-300">{step.date}</p>}
                            {step.comment && <p className="text-[9px] text-red-400 mt-0.5 max-w-[100px] text-center">{step.comment}</p>}
                        </div>
                        {/* Connector line */}
                        {idx < steps.length - 1 && (
                            <div className={`h-[2px] w-8 mx-0.5 ${step.status === '완료' ? 'bg-green-300' : 'bg-neutral-200'}`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MyApprovalPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("pending");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [items, setItems] = useState({
        pending: pendingItems,
        drafted: draftedItems,
        completed: completedItems,
    });

    const handleApprove = (id: string) => {
        setItems((prev) => ({
            ...prev,
            pending: prev.pending.filter((i) => i.id !== id),
            completed: [{ ...prev.pending.find((i) => i.id === id)!, status: "완료" as ApprovalStatus }, ...prev.completed],
        }));
    };

    const handleReject = (id: string) => {
        setItems((prev) => ({
            ...prev,
            pending: prev.pending.filter((i) => i.id !== id),
            completed: [{ ...prev.pending.find((i) => i.id === id)!, status: "반려" as ApprovalStatus }, ...prev.completed],
        }));
    };

    const currentItems = activeTab === "pending" ? items.pending : activeTab === "drafted" ? items.drafted : items.completed;

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <PageHeader title="내 결재" description="결재 대기 · 기안 · 처리 내역">
                <PrimaryButton href="/intra/erp/approval/draft">
                    <Plus className="h-4 w-4" />새 기안
                </PrimaryButton>
            </PageHeader>

            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded bg-neutral-100 p-1">
                {tabs.map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 rounded px-3 py-2 text-xs font-medium transition-colors ${activeTab === tab.key ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
                        {tab.label}
                        <span className={`ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-xs ${activeTab === tab.key ? "bg-neutral-800 text-white" : "bg-neutral-200 text-neutral-500"}`}>
                            {tab.key === "pending" ? items.pending.length : tab.key === "drafted" ? items.drafted.length : items.completed.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Items */}
            <div className="space-y-2">
                {currentItems.length === 0 ? (
                    <Card className="text-center text-xs text-neutral-400">결재 항목이 없습니다.</Card>
                ) : (
                    currentItems.map((item) => {
                        const isExpanded = expandedId === item.id;
                        return (
                            <Card key={item.id} padding={false} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <button className="min-w-0 flex-1 text-left" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                                        <div className="mb-1 flex items-center gap-2 flex-wrap">
                                            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-mono text-neutral-500">{item.docNo}</span>
                                            <span className="rounded bg-neutral-50 px-1.5 py-0.5 text-xs text-neutral-400">{item.type}</span>
                                            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${factorBadge[item.factor]}`}>{item.factor}</span>
                                        </div>
                                        <p className="mb-1.5 text-sm font-medium text-neutral-800">{item.title}</p>
                                        <div className="flex items-center gap-3 text-xs text-neutral-400">
                                            <span>기안자: <span className="text-neutral-600">{item.drafter}</span></span>
                                            <span>{item.date}</span>
                                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge label={item.status} variant={statusBadge[item.status]} />
                                        {activeTab === "pending" && (
                                            <div className="flex gap-1">
                                                <button onClick={() => handleApprove(item.id)} className="flex items-center gap-0.5 rounded bg-green-50 px-2 py-1 text-[11px] font-medium text-green-600 hover:bg-green-100">
                                                    <CheckCircle2 className="h-3 w-3" />승인
                                                </button>
                                                <button onClick={() => handleReject(item.id)} className="flex items-center gap-0.5 rounded bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100">
                                                    <XCircle className="h-3 w-3" />반려
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* 결재라인 스텝퍼 (확장 시) */}
                                {isExpanded && <ApprovalStepper steps={item.approvalLine} />}
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
