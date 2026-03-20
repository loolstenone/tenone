"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Calendar, Users, DollarSign, TrendingUp, Clock,
    Plus, Edit2, Trash2, FileSignature, ClipboardCheck, Receipt,
    Factory, User, Star, Check, AlertTriangle,
} from "lucide-react";

/* ─── Mock Data ─── */

interface ProjectDetail {
    code: string;
    name: string;
    client: string;
    category: "내부" | "외주" | "협업";
    pm: string;
    startDate: string;
    endDate: string;
    status: "진행중" | "계획" | "완료" | "보류";
    budget: number;
    spent: number;
    expectedRevenue: number;
    progress: number;
    description: string;
}

interface StaffAllocation {
    name: string;
    role: string;
    period: string;
    hoursPerWeek: number;
    totalHours: number;
    rate: number;
}

interface Production {
    name: string;
    type: string;
    assignee: string;
    deadline: string;
    progress: number;
    status: string;
}

interface ProcurementItem {
    poNo: string;
    vendor: string;
    description: string;
    amount: number;
    status: string;
    contractNo?: string;
    inspected: boolean;
}

interface SettlementItem {
    type: "청구" | "지급";
    target: string;
    amount: number;
    date: string;
    status: string;
}

const projectsDB: Record<string, ProjectDetail> = {
    "PRJ-2026-001": {
        code: "PRJ-2026-001", name: "LUKI 2nd Single", client: "내부", category: "내부",
        pm: "Cheonil Jeon", startDate: "2026-02-01", endDate: "2026-05-31", status: "진행중",
        budget: 50000000, spent: 22000000, expectedRevenue: 80000000, progress: 45,
        description: "LUKI 2번째 싱글 앨범 기획·제작·발매. MV 촬영, 앨범 디자인, 마케팅 포함.",
    },
    "PRJ-2026-002": {
        code: "PRJ-2026-002", name: "MADLeap 5기 운영", client: "내부", category: "내부",
        pm: "Sarah Kim", startDate: "2026-03-01", endDate: "2026-06-30", status: "진행중",
        budget: 30000000, spent: 8000000, expectedRevenue: 15000000, progress: 25,
        description: "대학 연합 크리에이터 인턴십 5기 운영. 커리큘럼, 멘토링, 결과물 제작.",
    },
    "PRJ-2026-003": {
        code: "PRJ-2026-003", name: "ABC엔터 브랜드 영상", client: "ABC엔터", category: "외주",
        pm: "김콘텐", startDate: "2026-03-10", endDate: "2026-04-30", status: "진행중",
        budget: 15000000, spent: 3000000, expectedRevenue: 15000000, progress: 15,
        description: "ABC엔터테인먼트 아티스트 브랜드 필름 제작 용역.",
    },
};

const staffDB: Record<string, StaffAllocation[]> = {
    "PRJ-2026-001": [
        { name: "Cheonil Jeon", role: "기획 총괄 / PM", period: "2026-02 ~ 2026-05", hoursPerWeek: 10, totalHours: 160, rate: 0 },
        { name: "김콘텐", role: "콘텐츠 디렉터", period: "2026-02 ~ 2026-05", hoursPerWeek: 20, totalHours: 320, rate: 0 },
        { name: "이영상", role: "영상 PD", period: "2026-03 ~ 2026-05", hoursPerWeek: 30, totalHours: 360, rate: 0 },
        { name: "박디자", role: "디자이너", period: "2026-03 ~ 2026-04", hoursPerWeek: 20, totalHours: 160, rate: 0 },
        { name: "박영상 (외부)", role: "편집 프리랜서", period: "2026-04 ~ 2026-05", hoursPerWeek: 40, totalHours: 320, rate: 50000 },
    ],
    "PRJ-2026-002": [
        { name: "Sarah Kim", role: "PM", period: "2026-03 ~ 2026-06", hoursPerWeek: 15, totalHours: 240, rate: 0 },
        { name: "이수진", role: "커뮤니티 매니저", period: "2026-03 ~ 2026-06", hoursPerWeek: 20, totalHours: 320, rate: 0 },
        { name: "한마케", role: "마케팅", period: "2026-03 ~ 2026-06", hoursPerWeek: 10, totalHours: 160, rate: 0 },
    ],
    "PRJ-2026-003": [
        { name: "김콘텐", role: "디렉터", period: "2026-03 ~ 2026-04", hoursPerWeek: 25, totalHours: 200, rate: 0 },
        { name: "이영상", role: "영상 PD", period: "2026-03 ~ 2026-04", hoursPerWeek: 30, totalHours: 240, rate: 0 },
    ],
};

const productionDB: Record<string, Production[]> = {
    "PRJ-2026-001": [
        { name: "MV 본편", type: "영상", assignee: "이영상", deadline: "2026-04-15", progress: 30, status: "제작중" },
        { name: "앨범 자켓 디자인", type: "디자인", assignee: "박디자", deadline: "2026-03-28", progress: 80, status: "검수대기" },
        { name: "음원 마스터링", type: "음원", assignee: "외부", deadline: "2026-04-01", progress: 50, status: "제작중" },
        { name: "티저 영상 (15s)", type: "영상", assignee: "이영상", deadline: "2026-04-05", progress: 0, status: "대기" },
    ],
};

const procurementDB: Record<string, ProcurementItem[]> = {
    "PRJ-2026-001": [
        { poNo: "PO-2026-018", vendor: "스튜디오 ABC", description: "촬영장 임대 (3일)", amount: 5000000, status: "발주완료", contractNo: "CT-2026-008", inspected: false },
        { poNo: "PO-2026-017", vendor: "음향스튜디오", description: "녹음실 사용 (2일)", amount: 1500000, status: "납품완료", inspected: true },
        { poNo: "PO-2026-020", vendor: "프리랜서 박영상", description: "MV 편집 용역", amount: 3000000, status: "진행중", contractNo: "CT-2026-010", inspected: false },
    ],
};

const settlementDB: Record<string, SettlementItem[]> = {
    "PRJ-2026-001": [
        { type: "지급", target: "음향스튜디오", amount: 1500000, date: "2026-03-18", status: "지급완료" },
        { type: "지급", target: "스튜디오 ABC", amount: 2500000, date: "2026-03-25", status: "지급예정" },
        { type: "지급", target: "프리랜서 박영상", amount: 1500000, date: "2026-04-20", status: "미지급" },
        { type: "청구", target: "ABC엔터 (제휴 수익)", amount: 10000000, date: "2026-05-15", status: "미청구" },
    ],
};

/* ─── Helpers ─── */

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }
function formatShort(n: number) { return (n / 10000).toFixed(0) + "만"; }

const statusColor: Record<string, string> = {
    "진행중": "bg-blue-50 text-blue-600", "계획": "bg-neutral-100 text-neutral-500",
    "완료": "bg-green-50 text-green-600", "보류": "bg-yellow-50 text-yellow-600",
    "제작중": "bg-blue-50 text-blue-600", "검수대기": "bg-yellow-50 text-yellow-600",
    "대기": "bg-neutral-100 text-neutral-400", "발주완료": "bg-blue-50 text-blue-600",
    "납품완료": "bg-green-50 text-green-600", "지급완료": "bg-green-50 text-green-600",
    "지급예정": "bg-blue-50 text-blue-600", "미지급": "bg-red-50 text-red-600",
    "미청구": "bg-neutral-100 text-neutral-400",
};

const tabs = ["개요", "인력", "제작", "발주·계약", "정산"] as const;
type Tab = typeof tabs[number];

/* ─── Component ─── */

export default function ProjectDetailPage() {
    const params = useParams();
    const code = (params.code as string) || "";
    const [activeTab, setActiveTab] = useState<Tab>("개요");

    const project = projectsDB[code];
    if (!project) {
        return (
            <div className="max-w-4xl py-20 text-center">
                <p className="text-neutral-400 text-sm">프로젝트를 찾을 수 없습니다.</p>
                <Link href="/intra/project/management" className="text-xs text-neutral-400 hover:text-neutral-900 mt-2 inline-block">← 목록으로</Link>
            </div>
        );
    }

    const staff = staffDB[code] || [];
    const productions = productionDB[code] || [];
    const procurement = procurementDB[code] || [];
    const settlement = settlementDB[code] || [];
    const profitMargin = project.expectedRevenue > 0
        ? Math.round(((project.expectedRevenue - project.budget) / project.expectedRevenue) * 100) : 0;

    return (
        <div className="max-w-5xl">
            {/* Header */}
            <div className="mb-6">
                <Link href="/intra/project/management" className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 transition-colors mb-3">
                    <ArrowLeft className="h-3 w-3" /> 프로젝트 목록
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">{project.code}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[project.status]}`}>{project.status}</span>
                            {project.client !== "내부" && <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded">{project.client}</span>}
                        </div>
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <p className="text-sm text-neutral-500 mt-1">PM: {project.pm} · {project.startDate} ~ {project.endDate}</p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 text-neutral-500 hover:border-neutral-400 transition-colors">
                        <Edit2 className="h-3 w-3" /> 수정
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-5 gap-3 mb-6">
                {[
                    { label: "예산", value: formatShort(project.budget), icon: DollarSign },
                    { label: "집행", value: formatShort(project.spent), icon: DollarSign },
                    { label: "예상 매출", value: formatShort(project.expectedRevenue), icon: TrendingUp },
                    { label: "수익률", value: `${profitMargin}%`, icon: TrendingUp },
                    { label: "진행률", value: `${project.progress}%`, icon: Clock },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <s.icon className="h-3 w-3 text-neutral-400" />
                            <span className="text-[9px] text-neutral-400">{s.label}</span>
                        </div>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-neutral-200 mb-6">
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 text-sm transition-all border-b-2 -mb-px ${activeTab === tab
                            ? "border-neutral-900 font-medium text-neutral-900"
                            : "border-transparent text-neutral-400 hover:text-neutral-600"
                        }`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "개요" && (
                <div className="grid grid-cols-2 gap-6">
                    <div className="border border-neutral-200 bg-white p-5">
                        <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">프로젝트 정보</h3>
                        <div className="space-y-2.5">
                            {[
                                { label: "프로젝트 코드", value: project.code },
                                { label: "프로젝트명", value: project.name },
                                { label: "분류", value: project.category },
                                { label: "클라이언트", value: project.client },
                                { label: "PM", value: project.pm },
                                { label: "시작일", value: project.startDate },
                                { label: "종료일", value: project.endDate },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <span className="text-xs text-neutral-400">{item.label}</span>
                                    <span className="text-sm font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="border border-neutral-200 bg-white p-5">
                            <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">프로젝트 개요</h3>
                            <p className="text-sm text-neutral-600 leading-relaxed">{project.description}</p>
                        </div>
                        <div className="border border-neutral-200 bg-white p-5">
                            <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">예산 현황</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-neutral-400">예산 집행률</span>
                                        <span>{Math.round((project.spent / project.budget) * 100)}%</span>
                                    </div>
                                    <div className="h-2 bg-neutral-100 rounded-full">
                                        <div className="h-2 bg-neutral-900 rounded-full" style={{ width: `${(project.spent / project.budget) * 100}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                                        <span>집행 {formatShort(project.spent)}</span>
                                        <span>예산 {formatShort(project.budget)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                                    <span className="text-xs text-neutral-400">예상 수익</span>
                                    <span className="text-sm font-bold text-green-600">+{formatShort(project.expectedRevenue - project.budget)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "인력" && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-neutral-500">투입 인력 <span className="font-bold text-neutral-900">{staff.length}명</span></p>
                            <p className="text-sm text-neutral-500">총 공수 <span className="font-bold text-neutral-900">{staff.reduce((s, m) => s + m.totalHours, 0)}h</span></p>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                            <Plus className="h-3 w-3" /> 인력 배치
                        </button>
                    </div>
                    <div className="border border-neutral-200 bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                    <th className="text-left p-3 font-medium">이름</th>
                                    <th className="text-left p-3 font-medium">역할</th>
                                    <th className="text-left p-3 font-medium">투입 기간</th>
                                    <th className="text-center p-3 font-medium">주당(h)</th>
                                    <th className="text-center p-3 font-medium">총 공수(h)</th>
                                    <th className="text-right p-3 font-medium">단가(/h)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((m, i) => (
                                    <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3.5 w-3.5 text-neutral-400" />
                                                <span className="font-medium">{m.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-neutral-500">{m.role}</td>
                                        <td className="p-3 text-xs text-neutral-500">{m.period}</td>
                                        <td className="p-3 text-center">{m.hoursPerWeek}h</td>
                                        <td className="p-3 text-center font-medium">{m.totalHours}h</td>
                                        <td className="p-3 text-right text-neutral-500">{m.rate > 0 ? formatKRW(m.rate) : "내부"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "제작" && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-neutral-500">제작물 <span className="font-bold text-neutral-900">{productions.length}건</span></p>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                            <Plus className="h-3 w-3" /> 제작물 등록
                        </button>
                    </div>
                    {productions.length === 0 ? (
                        <div className="border border-neutral-200 bg-white p-12 text-center text-neutral-400">
                            <Factory className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">등록된 제작물이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {productions.map((p, i) => (
                                <div key={i} className="border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold">{p.name}</h4>
                                            <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">{p.type}</span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${statusColor[p.status] || ""}`}>{p.status}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                                            <span>{p.assignee}</span>
                                            <span>마감 {p.deadline}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-neutral-100 rounded-full">
                                        <div className="h-1.5 bg-neutral-900 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                                    </div>
                                    <p className="text-[10px] text-neutral-400 mt-1 text-right">{p.progress}%</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "발주·계약" && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-neutral-500">발주 <span className="font-bold text-neutral-900">{procurement.length}건</span></p>
                            <p className="text-sm text-neutral-500">총액 <span className="font-bold text-neutral-900">{formatShort(procurement.reduce((s, p) => s + p.amount, 0))}</span></p>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                            <Plus className="h-3 w-3" /> 발주 등록
                        </button>
                    </div>
                    {procurement.length === 0 ? (
                        <div className="border border-neutral-200 bg-white p-12 text-center text-neutral-400">
                            <FileSignature className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">등록된 발주/계약이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="border border-neutral-200 bg-white">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                        <th className="text-left p-3 font-medium">발주번호</th>
                                        <th className="text-left p-3 font-medium">거래처</th>
                                        <th className="text-left p-3 font-medium">내용</th>
                                        <th className="text-right p-3 font-medium">금액</th>
                                        <th className="text-center p-3 font-medium">계약</th>
                                        <th className="text-center p-3 font-medium">검수</th>
                                        <th className="text-center p-3 font-medium">상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {procurement.map((p, i) => (
                                        <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                            <td className="p-3 font-mono text-xs text-neutral-400">{p.poNo}</td>
                                            <td className="p-3 font-medium">{p.vendor}</td>
                                            <td className="p-3 text-neutral-600">{p.description}</td>
                                            <td className="p-3 text-right font-medium">{formatKRW(p.amount)}</td>
                                            <td className="p-3 text-center">
                                                {p.contractNo
                                                    ? <span className="text-[9px] font-mono text-blue-600">{p.contractNo}</span>
                                                    : <span className="text-neutral-300">-</span>}
                                            </td>
                                            <td className="p-3 text-center">
                                                {p.inspected
                                                    ? <Check className="h-3.5 w-3.5 text-green-500 mx-auto" />
                                                    : <span className="text-neutral-300">-</span>}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[p.status] || ""}`}>{p.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "정산" && (
                <div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {(() => {
                            const totalOut = settlement.filter(s => s.type === "지급").reduce((sum, s) => sum + s.amount, 0);
                            const totalIn = settlement.filter(s => s.type === "청구").reduce((sum, s) => sum + s.amount, 0);
                            const paid = settlement.filter(s => s.type === "지급" && s.status === "지급완료").reduce((sum, s) => sum + s.amount, 0);
                            return [
                                { label: "총 지급 예정", value: formatShort(totalOut) },
                                { label: "지급 완료", value: formatShort(paid) },
                                { label: "총 청구 예정", value: formatShort(totalIn) },
                            ];
                        })().map(s => (
                            <div key={s.label} className="border border-neutral-200 bg-white p-4">
                                <p className="text-[10px] text-neutral-400 mb-1">{s.label}</p>
                                <p className="text-lg font-bold">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {settlement.length === 0 ? (
                        <div className="border border-neutral-200 bg-white p-12 text-center text-neutral-400">
                            <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">정산 내역이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="border border-neutral-200 bg-white">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                        <th className="text-center p-3 font-medium">구분</th>
                                        <th className="text-left p-3 font-medium">대상</th>
                                        <th className="text-right p-3 font-medium">금액</th>
                                        <th className="text-left p-3 font-medium">예정일</th>
                                        <th className="text-center p-3 font-medium">상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {settlement.map((s, i) => (
                                        <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                            <td className="p-3 text-center">
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${s.type === "청구" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>{s.type}</span>
                                            </td>
                                            <td className="p-3 font-medium">{s.target}</td>
                                            <td className="p-3 text-right font-medium">{formatKRW(s.amount)}</td>
                                            <td className="p-3 text-xs text-neutral-500">{s.date}</td>
                                            <td className="p-3 text-center">
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[s.status] || ""}`}>{s.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
