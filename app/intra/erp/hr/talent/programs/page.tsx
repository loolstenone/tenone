"use client";

import { GraduationCap, Users, Calendar, Plus, ArrowRight } from "lucide-react";

interface Program {
    id: string;
    name: string;
    type: "온보딩" | "멘토링" | "교육과정" | "리더십" | "인턴십";
    participants: number;
    capacity: number;
    startDate: string;
    endDate: string;
    status: "진행중" | "모집중" | "완료" | "예정";
    description: string;
}

const mockPrograms: Program[] = [
    { id: "1", name: "MADLeap 5기", type: "인턴십", participants: 12, capacity: 15, startDate: "2026-03-01", endDate: "2026-06-30", status: "진행중", description: "대학 연합 크리에이터 인턴십 프로그램" },
    { id: "2", name: "신입 온보딩 2026-Q1", type: "온보딩", participants: 3, capacity: 10, startDate: "2026-03-03", endDate: "2026-03-14", status: "진행중", description: "신규 입사자 2주 온보딩 프로그램" },
    { id: "3", name: "리더십 과정 4기", type: "리더십", participants: 0, capacity: 8, startDate: "2026-04-01", endDate: "2026-05-31", status: "모집중", description: "팀장급 리더십 역량 강화 과정" },
    { id: "4", name: "AI Creator 멘토링", type: "멘토링", participants: 5, capacity: 5, startDate: "2026-01-15", endDate: "2026-03-15", status: "완료", description: "AI 크리에이터 전문 멘토링" },
];

const typeColor: Record<string, string> = {
    "온보딩": "bg-blue-50 text-blue-600",
    "멘토링": "bg-purple-50 text-purple-600",
    "교육과정": "bg-green-50 text-green-600",
    "리더십": "bg-orange-50 text-orange-600",
    "인턴십": "bg-pink-50 text-pink-600",
};

const statusColor: Record<string, string> = {
    "진행중": "bg-green-50 text-green-600",
    "모집중": "bg-blue-50 text-blue-600",
    "완료": "bg-neutral-100 text-neutral-400",
    "예정": "bg-yellow-50 text-yellow-600",
};

export default function ProgramsPage() {
    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">인재 육성 Programs</h1>
                    <p className="text-sm text-neutral-500">온보딩, 멘토링, 교육, 인턴십 프로그램을 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 프로그램 등록
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "진행중", value: mockPrograms.filter(p => p.status === "진행중").length },
                    { label: "모집중", value: mockPrograms.filter(p => p.status === "모집중").length },
                    { label: "총 참여자", value: mockPrograms.reduce((s, p) => s + p.participants, 0) },
                    { label: "완료", value: mockPrograms.filter(p => p.status === "완료").length },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                {mockPrograms.map(p => (
                    <div key={p.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors group cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-bold">{p.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeColor[p.type]}`}>{p.type}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[p.status]}`}>{p.status}</span>
                                </div>
                                <p className="text-xs text-neutral-500">{p.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                        </div>
                        <div className="mt-3 flex items-center gap-6 text-xs text-neutral-400">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.startDate} ~ {p.endDate}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p.participants}/{p.capacity}명</span>
                        </div>
                        {p.capacity > 0 && (
                            <div className="mt-2 h-1.5 bg-neutral-100 rounded-full">
                                <div className="h-1.5 bg-neutral-900 rounded-full transition-all" style={{ width: `${(p.participants / p.capacity) * 100}%` }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
