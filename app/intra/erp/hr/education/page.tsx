"use client";

import { useState } from "react";
import { GraduationCap, Award, Clock, Plus, BookOpen, Users, AlertCircle, Search, Download } from "lucide-react";

interface StaffEducation {
    name: string;
    department: string;
    courseName: string;
    category: "필수" | "리더십" | "직무" | "AI/기술" | "어학" | "자격증";
    hours: number;
    status: "수료" | "진행중" | "미수료" | "예정";
    mandatory?: boolean;
}

const mockData: StaffEducation[] = [
    { name: "Cheonil Jeon", department: "경영기획", courseName: "VRIEF Orientation", category: "필수", hours: 4, status: "수료", mandatory: true },
    { name: "Cheonil Jeon", department: "경영기획", courseName: "GPR 프레임워크 이해", category: "필수", hours: 6, status: "수료", mandatory: true },
    { name: "Cheonil Jeon", department: "경영기획", courseName: "Mind Set: 본질·속도·이행", category: "필수", hours: 4, status: "진행중", mandatory: true },
    { name: "Sarah Kim", department: "브랜드관리", courseName: "VRIEF Orientation", category: "필수", hours: 4, status: "수료", mandatory: true },
    { name: "Sarah Kim", department: "브랜드관리", courseName: "GPR 프레임워크 이해", category: "필수", hours: 6, status: "예정", mandatory: true },
    { name: "Sarah Kim", department: "브랜드관리", courseName: "리더십 과정 3기", category: "리더십", hours: 20, status: "수료" },
    { name: "김준호", department: "커뮤니티운영", courseName: "VRIEF Orientation", category: "필수", hours: 4, status: "미수료", mandatory: true },
    { name: "김준호", department: "커뮤니티운영", courseName: "AI 활용 실무", category: "AI/기술", hours: 16, status: "진행중" },
    { name: "박영상", department: "콘텐츠제작", courseName: "VRIEF Orientation", category: "필수", hours: 4, status: "수료", mandatory: true },
    { name: "박영상", department: "콘텐츠제작", courseName: "프로젝트 매니지먼트 심화", category: "직무", hours: 30, status: "진행중" },
    { name: "이수진", department: "디자인", courseName: "VRIEF Orientation", category: "필수", hours: 4, status: "수료", mandatory: true },
    { name: "이수진", department: "디자인", courseName: "비즈니스 영어 회화", category: "어학", hours: 48, status: "예정" },
];

// 필수과정 이수 현황
const mandatoryCourses = ["VRIEF Orientation", "GPR 프레임워크 이해", "Mind Set: 본질·속도·이행", "Ten:One™ Universe 세계관 입문", "정보보안 & 개인정보보호", "직장 내 괴롭힘 예방 교육"];
const staffNames = [...new Set(mockData.map(d => d.name))];

const categoryColor: Record<string, string> = {
    "필수": "bg-red-50 text-red-600",
    "리더십": "bg-purple-50 text-purple-600",
    "직무": "bg-blue-50 text-blue-600",
    "AI/기술": "bg-green-50 text-green-600",
    "어학": "bg-orange-50 text-orange-600",
    "자격증": "bg-yellow-50 text-yellow-600",
};

const statusColor: Record<string, string> = {
    "수료": "bg-green-50 text-green-600",
    "진행중": "bg-blue-50 text-blue-600",
    "미수료": "bg-red-50 text-red-600",
    "예정": "bg-neutral-100 text-neutral-500",
};

export default function EducationAdminPage() {
    const [tab, setTab] = useState<"all" | "mandatory">("all");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<string>("all");

    const totalCompleted = mockData.filter(e => e.status === "수료").length;
    const totalInProgress = mockData.filter(e => e.status === "진행중").length;
    const mandatoryIncomplete = staffNames.filter(name => {
        const completed = mockData.filter(d => d.name === name && d.mandatory && d.status === "수료");
        return completed.length < mandatoryCourses.length;
    }).length;

    const filtered = mockData
        .filter(e => tab === "mandatory" ? e.mandatory : true)
        .filter(e => filter === "all" || e.category === filter)
        .filter(e => !search || e.name.includes(search) || e.department.includes(search) || e.courseName.includes(search));

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">교육 관리</h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-neutral-200 hover:border-neutral-400 transition-colors">
                        <Download className="h-3 w-3" /> 이수 현황 다운로드
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                        <Plus className="h-3 w-3" /> 교육 과정 등록
                    </button>
                </div>
            </div>
            <p className="text-sm text-neutral-500 mb-6">전체 구성원의 교육 이수 현황을 관리합니다.</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "전체 이수 건", value: `${totalCompleted}건`, icon: Award },
                    { label: "진행중", value: `${totalInProgress}건`, icon: BookOpen },
                    { label: "필수과정 미이수 인원", value: `${mandatoryIncomplete}명`, icon: AlertCircle, highlight: mandatoryIncomplete > 0 },
                    { label: "총 교육 인원", value: `${staffNames.length}명`, icon: Users },
                ].map(s => (
                    <div key={s.label} className={`border bg-white p-4 ${s.highlight ? 'border-red-200' : 'border-neutral-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon className={`h-3.5 w-3.5 ${s.highlight ? 'text-red-500' : 'text-neutral-400'}`} />
                            <span className="text-xs text-neutral-400">{s.label}</span>
                        </div>
                        <p className={`text-lg font-bold ${s.highlight ? 'text-red-600' : ''}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4">
                {([["all", "전체 교육 현황"], ["mandatory", `필수과정 이수 현황`]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key as typeof tab)}
                        className={`px-4 py-2 text-sm rounded-t border-b-2 transition-all ${tab === key ? "border-neutral-900 font-medium" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full border border-neutral-200 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-neutral-400"
                        placeholder="이름, 부서, 교육명 검색..." />
                </div>
                {tab === "all" && (
                    <div className="flex gap-1">
                        {["all", "필수", "리더십", "직무", "AI/기술", "어학"].map(cat => (
                            <button key={cat} onClick={() => setFilter(cat)}
                                className={`px-3 py-1.5 text-xs rounded transition-all ${filter === cat ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                                {cat === "all" ? "전체" : cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">이름</th>
                            <th className="text-left p-3 font-medium">부서</th>
                            <th className="text-left p-3 font-medium">교육명</th>
                            <th className="text-center p-3 font-medium">분류</th>
                            <th className="text-center p-3 font-medium">시간</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((e, i) => (
                            <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 font-medium">{e.name}</td>
                                <td className="p-3 text-neutral-500 text-xs">{e.department}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <span>{e.courseName}</span>
                                        {e.mandatory && <span className="text-[11px] px-1 py-0.5 bg-red-50 text-red-500 rounded">필수</span>}
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${categoryColor[e.category]}`}>{e.category}</span>
                                </td>
                                <td className="p-3 text-center text-neutral-600">{e.hours}h</td>
                                <td className="p-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[e.status]}`}>{e.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
