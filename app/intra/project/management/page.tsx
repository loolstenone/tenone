"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Search, Calendar, Users, DollarSign, TrendingUp, ArrowRight } from "lucide-react";

interface Project {
    code: string;
    name: string;
    client: string;
    category: "내부" | "외주" | "협업";
    pm: string;
    startDate: string;
    endDate: string;
    budget: number;
    spent: number;
    expectedRevenue: number;
    progress: number;
    status: "진행중" | "계획" | "완료" | "보류";
    staffCount: number;
}

const mockProjects: Project[] = [
    { code: "PRJ-2026-001", name: "LUKI 2nd Single", client: "내부", category: "내부", pm: "Cheonil Jeon", startDate: "2026-02-01", endDate: "2026-05-31", budget: 50000000, spent: 22000000, expectedRevenue: 80000000, progress: 45, status: "진행중", staffCount: 5 },
    { code: "PRJ-2026-002", name: "MADLeap 5기 운영", client: "내부", category: "내부", pm: "Sarah Kim", startDate: "2026-03-01", endDate: "2026-06-30", budget: 30000000, spent: 8000000, expectedRevenue: 15000000, progress: 25, status: "진행중", staffCount: 3 },
    { code: "PRJ-2026-003", name: "ABC엔터 브랜드 영상", client: "ABC엔터", category: "외주", pm: "김콘텐", startDate: "2026-03-10", endDate: "2026-04-30", budget: 15000000, spent: 3000000, expectedRevenue: 15000000, progress: 15, status: "진행중", staffCount: 2 },
    { code: "PRJ-2026-004", name: "Badak 네트워크 확장", client: "내부", category: "내부", pm: "김준호", startDate: "2026-04-01", endDate: "2026-08-31", budget: 20000000, spent: 0, expectedRevenue: 0, progress: 0, status: "계획", staffCount: 1 },
    { code: "PRJ-2025-018", name: "RooK 데뷔 프로젝트", client: "내부", category: "내부", pm: "Cheonil Jeon", startDate: "2025-10-01", endDate: "2026-02-28", budget: 40000000, spent: 38000000, expectedRevenue: 60000000, progress: 100, status: "완료", staffCount: 4 },
];

const statusColor: Record<string, string> = {
    "진행중": "bg-blue-50 text-blue-600",
    "계획": "bg-neutral-100 text-neutral-500",
    "완료": "bg-green-50 text-green-600",
    "보류": "bg-yellow-50 text-yellow-600",
};

const categoryColor: Record<string, string> = {
    "내부": "bg-neutral-100 text-neutral-600",
    "외주": "bg-orange-50 text-orange-600",
    "협업": "bg-purple-50 text-purple-600",
};

function formatShort(n: number) { return n === 0 ? "-" : (n / 10000).toFixed(0) + "만"; }

export default function ProjectListPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filtered = mockProjects.filter(p => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (search && !p.name.includes(search) && !p.code.includes(search) && !p.client.includes(search)) return false;
        return true;
    });

    const active = mockProjects.filter(p => p.status === "진행중");
    const totalBudget = active.reduce((s, p) => s + p.budget, 0);
    const totalRevenue = active.reduce((s, p) => s + p.expectedRevenue, 0);

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">프로젝트</h1>
                    <p className="text-sm text-neutral-500">전사 프로젝트를 관리합니다. 프로젝트를 선택하면 상세 정보를 확인할 수 있습니다.</p>
                </div>
                <Link href="/intra/project/management/new"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 프로젝트 등록
                </Link>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "진행중", value: active.length, icon: FolderKanban },
                    { label: "총 투입 인력", value: `${active.reduce((s, p) => s + p.staffCount, 0)}명`, icon: Users },
                    { label: "진행중 예산", value: formatShort(totalBudget) + "원", icon: DollarSign },
                    { label: "예상 매출", value: formatShort(totalRevenue) + "원", icon: TrendingUp },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-[10px] text-neutral-400">{s.label}</span>
                        </div>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400"
                        placeholder="프로젝트명, 코드, 클라이언트 검색..." />
                </div>
                <div className="flex gap-1">
                    {["all", "진행중", "계획", "완료", "보류"].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 text-xs rounded transition-all ${statusFilter === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                            {s === "all" ? "전체" : s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Cards */}
            <div className="space-y-3">
                {filtered.map(p => (
                    <Link key={p.code} href={`/intra/project/management/${p.code}`}
                        className="block border border-neutral-200 bg-white p-5 hover:border-neutral-400 transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-[10px] text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">{p.code}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[p.status]}`}>{p.status}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${categoryColor[p.category]}`}>{p.category}</span>
                                </div>
                                <h3 className="text-sm font-bold">{p.name}</h3>
                                <div className="flex items-center gap-4 text-[10px] text-neutral-400 mt-1">
                                    <span>PM: {p.pm}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.startDate} ~ {p.endDate}</span>
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p.staffCount}명</span>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-600 transition-colors mt-1" />
                        </div>
                        <div className="mt-3 flex items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-neutral-400">진행률 {p.progress}%</span>
                                    <span className="text-neutral-400">
                                        예산 {formatShort(p.spent)} / {formatShort(p.budget)}
                                        {p.expectedRevenue > 0 && <> · 매출 {formatShort(p.expectedRevenue)}</>}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-neutral-100 rounded-full">
                                    <div className="h-1.5 bg-neutral-900 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
