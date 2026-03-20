"use client";

import { useState } from "react";
import { FolderKanban, Plus, Search, Calendar, Users, ArrowRight } from "lucide-react";

interface Project {
    id: string;
    name: string;
    client: string;
    pm: string;
    startDate: string;
    endDate: string;
    budget: number;
    spent: number;
    progress: number;
    status: "진행중" | "계획" | "완료" | "보류";
    team: string[];
}

const mockProjects: Project[] = [
    { id: "1", name: "LUKI 2nd Single", client: "내부", pm: "Cheonil Jeon", startDate: "2026-02-01", endDate: "2026-05-31", budget: 50000000, spent: 22000000, progress: 45, status: "진행중", team: ["김콘텐", "이영상", "박디자"] },
    { id: "2", name: "MADLeap 5기 운영", client: "내부", pm: "Sarah Kim", startDate: "2026-03-01", endDate: "2026-06-30", budget: 30000000, spent: 8000000, progress: 25, status: "진행중", team: ["이수진", "한마케"] },
    { id: "3", name: "ABC엔터 브랜드 영상", client: "ABC엔터", pm: "김콘텐", startDate: "2026-03-10", endDate: "2026-04-30", budget: 15000000, spent: 3000000, progress: 15, status: "진행중", team: ["이영상", "박디자"] },
    { id: "4", name: "Badak 네트워크 확장", client: "내부", pm: "김준호", startDate: "2026-04-01", endDate: "2026-08-31", budget: 20000000, spent: 0, progress: 0, status: "계획", team: ["김준호"] },
    { id: "5", name: "RooK 데뷔 프로젝트", client: "내부", pm: "Cheonil Jeon", startDate: "2025-10-01", endDate: "2026-02-28", budget: 40000000, spent: 38000000, progress: 100, status: "완료", team: ["김콘텐", "이영상", "조에이"] },
];

const statusColor: Record<string, string> = {
    "진행중": "bg-blue-50 text-blue-600",
    "계획": "bg-neutral-100 text-neutral-500",
    "완료": "bg-green-50 text-green-600",
    "보류": "bg-yellow-50 text-yellow-600",
};

function formatKRW(n: number) { return (n / 10000).toFixed(0) + "만원"; }

export default function ProjectsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filtered = mockProjects.filter(p => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (search && !p.name.includes(search) && !p.client.includes(search)) return false;
        return true;
    });

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">프로젝트 관리</h1>
                    <p className="text-sm text-neutral-500">전사 프로젝트 현황을 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 프로젝트 등록
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "진행중", value: mockProjects.filter(p => p.status === "진행중").length },
                    { label: "계획", value: mockProjects.filter(p => p.status === "계획").length },
                    { label: "완료", value: mockProjects.filter(p => p.status === "완료").length },
                    { label: "총 프로젝트", value: mockProjects.length },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <p className="text-[10px] text-neutral-400 mb-1">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400" placeholder="프로젝트명, 클라이언트 검색..." />
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

            <div className="space-y-3">
                {filtered.map(p => (
                    <div key={p.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-bold">{p.name}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[p.status]}`}>{p.status}</span>
                                    {p.client !== "내부" && <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded">{p.client}</span>}
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-neutral-400 mt-1">
                                    <span>PM: {p.pm}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.startDate} ~ {p.endDate}</span>
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p.team.length}명</span>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-neutral-400">진행률 {p.progress}%</span>
                                    <span className="text-neutral-400">예산: {formatKRW(p.spent)} / {formatKRW(p.budget)}</span>
                                </div>
                                <div className="h-1.5 bg-neutral-100 rounded-full">
                                    <div className="h-1.5 bg-neutral-900 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
