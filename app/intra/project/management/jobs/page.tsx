"use client";

import { Briefcase, Plus, Clock, User } from "lucide-react";

interface Job {
    id: string;
    code: string;
    name: string;
    project: string;
    assignee: string;
    startDate: string;
    endDate: string;
    hours: number;
    status: "진행중" | "완료" | "대기" | "검토중";
}

const mockJobs: Job[] = [
    { id: "1", code: "J-2026-045", name: "MV 콘티 기획", project: "LUKI 2nd Single", assignee: "김콘텐", startDate: "2026-03-15", endDate: "2026-03-25", hours: 40, status: "진행중" },
    { id: "2", code: "J-2026-044", name: "안무 영상 촬영", project: "LUKI 2nd Single", assignee: "이영상", startDate: "2026-03-20", endDate: "2026-03-28", hours: 24, status: "대기" },
    { id: "3", code: "J-2026-043", name: "앨범 아트워크 디자인", project: "LUKI 2nd Single", assignee: "박디자", startDate: "2026-03-10", endDate: "2026-03-22", hours: 32, status: "검토중" },
    { id: "4", code: "J-2026-040", name: "5기 커리큘럼 기획", project: "MADLeap 5기", assignee: "Sarah Kim", startDate: "2026-03-01", endDate: "2026-03-15", hours: 20, status: "완료" },
    { id: "5", code: "J-2026-038", name: "마케팅 콘텐츠 제작", project: "ABC엔터 영상", assignee: "한마케", startDate: "2026-03-12", endDate: "2026-03-20", hours: 16, status: "진행중" },
];

const statusColor: Record<string, string> = {
    "진행중": "bg-blue-50 text-blue-600",
    "완료": "bg-green-50 text-green-600",
    "대기": "bg-neutral-100 text-neutral-500",
    "검토중": "bg-yellow-50 text-yellow-600",
};

export default function JobsPage() {
    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Job 관리</h1>
                    <p className="text-sm text-neutral-500">프로젝트 하위 작업(Job)을 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> Job 등록
                </button>
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">Job 코드</th>
                            <th className="text-left p-3 font-medium">작업명</th>
                            <th className="text-left p-3 font-medium">프로젝트</th>
                            <th className="text-left p-3 font-medium">담당자</th>
                            <th className="text-left p-3 font-medium">기간</th>
                            <th className="text-center p-3 font-medium">공수(h)</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockJobs.map(j => (
                            <tr key={j.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer">
                                <td className="p-3 font-mono text-xs text-neutral-400">{j.code}</td>
                                <td className="p-3 font-medium">{j.name}</td>
                                <td className="p-3 text-neutral-500">{j.project}</td>
                                <td className="p-3">
                                    <span className="flex items-center gap-1.5">
                                        <User className="h-3 w-3 text-neutral-400" />
                                        {j.assignee}
                                    </span>
                                </td>
                                <td className="p-3 text-xs text-neutral-500">{j.startDate} ~ {j.endDate}</td>
                                <td className="p-3 text-center">{j.hours}h</td>
                                <td className="p-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[j.status]}`}>{j.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
