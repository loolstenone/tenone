"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { FolderKanban, Plus, Search, Calendar, Users, Briefcase, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

/* ─── Types ─── */

type ProjectType = "커뮤니티" | "클라이언트" | "내부";
type ProjectStatus = "기획" | "진행" | "완료" | "보류" | "취소";
type ProjectSubType = "동아리 운영" | "경쟁 PT" | "네트워킹" | "교육" | "캠페인" | "브랜딩" | "콘텐츠" | "컨설팅" | "서비스 개발" | "브랜드 운영" | "인프라";

interface Project {
    code: string;
    name: string;
    type: ProjectType;
    subType: ProjectSubType;
    status: ProjectStatus;
    pm: string;
    startDate: string;
    endDate: string;
    memberCount: number;
    jobCount: number;
    estimatedHours: number;
    billing: number;
    grossProfit: number;
}

/* ─── Mock Data ─── */

const mockProjects: Project[] = [
    {
        code: "PRJ-2026-0001", name: "LUKI 2nd Single", type: "클라이언트", subType: "캠페인", status: "진행",
        pm: "Sarah Kim", startDate: "2026-02-01", endDate: "2026-05-31",
        memberCount: 5, jobCount: 5, estimatedHours: 115, billing: 20000, grossProfit: 7000,
    },
    {
        code: "PRJ-2026-0002", name: "MADLeap 5기 운영", type: "커뮤니티", subType: "동아리 운영", status: "진행",
        pm: "김준호", startDate: "2026-03-01", endDate: "2026-06-30",
        memberCount: 3, jobCount: 3, estimatedHours: 60, billing: 5000, grossProfit: 2000,
    },
    {
        code: "PRJ-2026-0003", name: "리제로스 시즌2", type: "커뮤니티", subType: "경쟁 PT", status: "기획",
        pm: "마리그", startDate: "2026-04-01", endDate: "2026-09-30",
        memberCount: 4, jobCount: 2, estimatedHours: 80, billing: 10000, grossProfit: 3500,
    },
    {
        code: "PRJ-2026-0004", name: "Brand Gravity 컨설팅", type: "클라이언트", subType: "브랜딩", status: "진행",
        pm: "조브랜", startDate: "2026-03-15", endDate: "2026-06-15",
        memberCount: 3, jobCount: 4, estimatedHours: 90, billing: 8000, grossProfit: 3000,
    },
    {
        code: "PRJ-2026-0005", name: "Badak 네트워크 확장", type: "내부", subType: "네트워킹", status: "기획",
        pm: "이수진", startDate: "2026-05-01", endDate: "2026-10-31",
        memberCount: 2, jobCount: 1, estimatedHours: 30, billing: 3000, grossProfit: 1500,
    },
    // 완료 프로젝트 (히스토리)
    {
        code: "PRJ-2025-0001", name: "LUKI 1st Single 데뷔", type: "클라이언트" as ProjectType, subType: "캠페인" as ProjectSubType, status: "완료" as ProjectStatus,
        pm: "Sarah Kim", startDate: "2025-06-01", endDate: "2025-12-31",
        memberCount: 4, jobCount: 6, estimatedHours: 200, billing: 15000, grossProfit: 5500,
    },
    {
        code: "PRJ-2025-0002", name: "리제로스 시즌1", type: "커뮤니티" as ProjectType, subType: "경쟁 PT" as ProjectSubType, status: "완료" as ProjectStatus,
        pm: "마리그", startDate: "2025-03-01", endDate: "2025-09-30",
        memberCount: 6, jobCount: 4, estimatedHours: 150, billing: 8000, grossProfit: 3000,
    },
    {
        code: "PRJ-2025-0003", name: "Badak 밋업 런칭", type: "내부" as ProjectType, subType: "네트워킹" as ProjectSubType, status: "완료" as ProjectStatus,
        pm: "이수진", startDate: "2025-01-01", endDate: "2025-06-30",
        memberCount: 2, jobCount: 3, estimatedHours: 80, billing: 2000, grossProfit: 1000,
    },
    {
        code: "PRJ-2025-0004", name: "MADLeap 4기 운영", type: "커뮤니티" as ProjectType, subType: "동아리 운영" as ProjectSubType, status: "완료" as ProjectStatus,
        pm: "김준호", startDate: "2025-03-01", endDate: "2025-08-31",
        memberCount: 3, jobCount: 3, estimatedHours: 60, billing: 4000, grossProfit: 1500,
    },
];

/* ─── Helpers ─── */

function formatMoney(manwon: number): string {
    if (manwon >= 10000) return `${(manwon / 10000).toFixed(0)}억`;
    return `${manwon.toLocaleString("ko-KR")}만`;
}

const typeBadge: Record<ProjectType, string> = {
    "커뮤니티": "bg-violet-50 text-violet-600",
    "클라이언트": "bg-blue-50 text-blue-600",
    "내부": "bg-neutral-100 text-neutral-500",
};

const statusBadge: Record<ProjectStatus, string> = {
    "기획": "bg-neutral-100 text-neutral-500",
    "진행": "bg-emerald-50 text-emerald-600",
    "완료": "bg-blue-50 text-blue-600",
    "보류": "bg-yellow-50 text-yellow-600",
    "취소": "bg-red-50 text-red-500",
};

const typeOptions: ("전체" | ProjectType)[] = ["전체", "커뮤니티", "클라이언트", "내부"];
const statusOptions: ("전체" | ProjectStatus)[] = ["전체", "기획", "진행", "완료", "보류", "취소"];

const subTypeBadge: Record<string, string> = {
    "동아리 운영": "bg-violet-50 text-violet-500",
    "경쟁 PT": "bg-violet-50 text-violet-500",
    "네트워킹": "bg-violet-50 text-violet-500",
    "교육": "bg-violet-50 text-violet-500",
    "캠페인": "bg-blue-50 text-blue-500",
    "브랜딩": "bg-blue-50 text-blue-500",
    "콘텐츠": "bg-blue-50 text-blue-500",
    "컨설팅": "bg-blue-50 text-blue-500",
    "서비스 개발": "bg-neutral-50 text-neutral-500",
    "브랜드 운영": "bg-neutral-50 text-neutral-500",
    "인프라": "bg-neutral-50 text-neutral-500",
};

type SortKey = "code" | "name" | "pm" | "status" | "startDate" | "grossProfit";

/* ─── Component ─── */

export default function ProjectListPage() {
    const { isStaff } = useAuth();
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"전체" | ProjectType>("전체");
    const [statusFilter, setStatusFilter] = useState<"전체" | ProjectStatus>("전체");
    const [sortKey, setSortKey] = useState<SortKey>("code");
    const [sortAsc, setSortAsc] = useState(false);
    const [showLegend, setShowLegend] = useState(false);

    /*
     * Visibility rules (mock):
     * - Crew/Partner: 자기가 참여한 프로젝트만
     * - Staff: 자기 조직 프로젝트 (부서 기준)
     * - 사업부장: 사업부 전체
     * - CEO/Admin: 전체
     * 현재는 모든 프로젝트 표시 (mock)
     */

    const filtered = mockProjects
        .filter((p) => {
            if (typeFilter !== "전체" && p.type !== typeFilter) return false;
            if (statusFilter !== "전체" && p.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q) && !p.pm.toLowerCase().includes(q)) return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortKey === 'grossProfit') {
                return sortAsc ? a.grossProfit - b.grossProfit : b.grossProfit - a.grossProfit;
            }
            const va = a[sortKey] as string;
            const vb = b[sortKey] as string;
            return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
        });

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortAsc(!sortAsc);
        else { setSortKey(key); setSortAsc(true); }
    };

    const activeCount = mockProjects.filter((p) => p.status === "진행").length;
    const completedCount = mockProjects.filter((p) => p.status === "완료").length;
    const totalMembers = mockProjects.filter((p) => p.status === "진행").reduce((s, p) => s + p.memberCount, 0);
    const totalJobs = mockProjects.filter((p) => p.status === "진행").reduce((s, p) => s + p.jobCount, 0);

    return (
        <div className="max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">프로젝트 관리</h1>
                    <p className="text-sm text-neutral-500 mt-1">프로젝트 선택 → Job 등록 · 상세 관리</p>
                </div>
                <Link
                    href="/intra/project/management/new"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
                >
                    <Plus className="h-4 w-4" /> 프로젝트 등록
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                    { label: "전체 프로젝트", value: `${mockProjects.length}건`, icon: FolderKanban },
                    { label: "진행중", value: `${activeCount}건`, icon: Briefcase },
                    { label: "완료", value: `${completedCount}건`, icon: FolderKanban },
                    { label: "진행중 투입 인원", value: `${totalMembers}명`, icon: Users },
                ].map((s) => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-3.5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <s.icon className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-xs text-neutral-400">{s.label}</span>
                        </div>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-neutral-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-neutral-400"
                        placeholder="프로젝트명, 코드, PM 검색..."
                    />
                </div>
                <div className="flex gap-1">
                    {typeOptions.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={clsx(
                                "px-2.5 py-2 text-xs transition-all",
                                typeFilter === t ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1">
                    {statusOptions.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={clsx(
                                "px-2.5 py-2 text-xs transition-all",
                                statusFilter === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* 범례 + 정렬 + 결과 수 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowLegend(!showLegend)} className="text-xs text-neutral-400 hover:text-neutral-700 underline">
                        {showLegend ? "범례 닫기" : "범례 보기"}
                    </button>
                    <span className="text-xs text-neutral-400">{filtered.length}건 표시 / 전체 {mockProjects.length}건</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <span>정렬:</span>
                    {([["code", "코드"], ["name", "이름"], ["status", "상태"], ["startDate", "시작일"], ["grossProfit", "매총이익"]] as [SortKey, string][]).map(([key, label]) => (
                        <button key={key} onClick={() => toggleSort(key)}
                            className={`px-1.5 py-0.5 rounded ${sortKey === key ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}>
                            {label} {sortKey === key && (sortAsc ? "↑" : "↓")}
                        </button>
                    ))}
                </div>
            </div>

            {showLegend && (
                <div className="border border-neutral-200 bg-white p-4 mb-4 grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs font-bold mb-2">프로젝트 유형</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded">커뮤니티</span><span className="text-xs text-neutral-500">MADLeague, 리제로스 등 크루 참여 프로젝트</span></div>
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">클라이언트</span><span className="text-xs text-neutral-500">외부 기업 수주 프로젝트 (수익 사업)</span></div>
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">내부</span><span className="text-xs text-neutral-500">사내 프로젝트 (네트워크 확장, 시스템 구축 등)</span></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold mb-2">Job 유형</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">PR (제작)</span><span className="text-xs text-neutral-500">콘텐츠, 디자인, 영상 등 제작물</span></div>
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">ME (Media)</span><span className="text-xs text-neutral-500">매체 집행, 미디어 플래닝</span></div>
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">PT</span><span className="text-xs text-neutral-500">프레젠테이션, 경쟁 PT</span></div>
                        </div>
                        <p className="text-xs font-bold mt-3 mb-2">Job 세부 유형</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-50 text-neutral-400 rounded">PL (기획)</span><span className="text-xs text-neutral-500">전략 수립, 컨셉 기획, 리서치</span></div>
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-50 text-neutral-400 rounded">DO (실행)</span><span className="text-xs text-neutral-500">제작, 촬영, 디자인, 개발, 집행</span></div>
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-50 text-neutral-400 rounded">RE (Report)</span><span className="text-xs text-neutral-500">성과 분석, 리포트 작성, 회고</span></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold mb-2">매체 유형</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-sky-50 text-sky-600 rounded">TV/OTT</span><span className="text-xs px-1.5 py-0.5 bg-sky-50 text-sky-600 rounded">디지털</span><span className="text-xs px-1.5 py-0.5 bg-sky-50 text-sky-600 rounded">SNS</span></div>
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-sky-50 text-sky-600 rounded">옥외</span><span className="text-xs px-1.5 py-0.5 bg-sky-50 text-sky-600 rounded">홍보/PR</span><span className="text-xs px-1.5 py-0.5 bg-sky-50 text-sky-600 rounded">이벤트</span></div>
                        </div>
                        <p className="text-xs font-bold mt-3 mb-2">제작 유형</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">영상</span><span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">그래픽</span><span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">웹/앱</span></div>
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">카피</span><span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">AI 생성</span><span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">편집</span></div>
                        </div>
                        <p className="text-xs font-bold mt-3 mb-2">프로젝트 단계</p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">기획</span><span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded">진행</span><span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">완료</span><span className="text-xs px-1.5 py-0.5 bg-yellow-50 text-yellow-600 rounded">보류</span><span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-500 rounded">취소</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Project List */}
            <div className="space-y-2">
                {filtered.length === 0 && (
                    <div className="border border-neutral-200 bg-white p-12 text-center">
                        <FolderKanban className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                        <p className="text-xs text-neutral-400">조건에 맞는 프로젝트가 없습니다.</p>
                    </div>
                )}

                {filtered.map((p) => (
                    <Link
                        key={p.code}
                        href={`/intra/project/management/${p.code}`}
                        className="block border border-neutral-200 bg-white p-4 hover:border-neutral-400 transition-all group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                {/* Row 1: badges */}
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="font-mono text-xs text-neutral-400 bg-neutral-50 px-1.5 py-0.5">{p.code}</span>
                                    <span className={clsx("text-xs px-1.5 py-0.5 font-medium", typeBadge[p.type])}>{p.type}</span>
                                    <span className={clsx("text-xs px-1.5 py-0.5 font-medium", statusBadge[p.status])}>{p.status}</span>
                                    <span className="text-xs px-1.5 py-0.5 bg-neutral-50 text-neutral-400 border border-neutral-100">{p.subType}</span>
                                </div>
                                {/* Row 2: name */}
                                <h3 className="text-sm font-bold truncate">{p.name}</h3>
                                {/* Row 3: meta */}
                                <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400">
                                    <span>PM: {p.pm}</span>
                                    <span className="flex items-center gap-0.5">
                                        <Calendar className="h-3 w-3" /> {p.startDate} ~ {p.endDate}
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                        <Users className="h-3 w-3" /> {p.memberCount}명
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                        <Briefcase className="h-3 w-3" /> Job {p.jobCount}건
                                    </span>
                                    <span>{p.estimatedHours}h 예상</span>
                                </div>
                            </div>

                            {/* Right: P&L summary (isStaff only) */}
                            {isStaff && (
                                <div className="ml-4 text-right shrink-0">
                                    <div className="flex items-center gap-1 justify-end mb-0.5">
                                        <TrendingUp className="h-3 w-3 text-neutral-400" />
                                        <span className="text-xs text-neutral-400">손익 요약</span>
                                    </div>
                                    <p className="text-xs text-neutral-500">
                                        취급 <span className="font-bold text-neutral-900">{formatMoney(p.billing)}</span>
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        매총 <span className="font-bold text-emerald-600">{formatMoney(p.grossProfit)}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
