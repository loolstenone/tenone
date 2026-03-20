"use client";

import { Factory, Plus, Calendar, User, ArrowRight } from "lucide-react";

interface Production {
    id: string;
    name: string;
    project: string;
    type: "영상" | "음원" | "디자인" | "콘텐츠" | "기타";
    assignee: string;
    startDate: string;
    deadline: string;
    progress: number;
    status: "제작중" | "검수대기" | "완료" | "수정중";
}

const mockProductions: Production[] = [
    { id: "1", name: "LUKI 2nd MV 본편", project: "LUKI 2nd Single", type: "영상", assignee: "이영상", startDate: "2026-03-15", deadline: "2026-04-15", progress: 30, status: "제작중" },
    { id: "2", name: "앨범 자켓 디자인", project: "LUKI 2nd Single", type: "디자인", assignee: "박디자", startDate: "2026-03-10", deadline: "2026-03-28", progress: 80, status: "검수대기" },
    { id: "3", name: "MADLeap 홍보 영상", project: "MADLeap 5기", type: "영상", assignee: "이영상", startDate: "2026-03-05", deadline: "2026-03-20", progress: 100, status: "완료" },
    { id: "4", name: "ABC엔터 브랜드 필름", project: "ABC엔터 영상", type: "영상", assignee: "김콘텐", startDate: "2026-03-12", deadline: "2026-04-10", progress: 15, status: "제작중" },
];

const typeColor: Record<string, string> = { "영상": "bg-purple-50 text-purple-600", "음원": "bg-pink-50 text-pink-600", "디자인": "bg-blue-50 text-blue-600", "콘텐츠": "bg-green-50 text-green-600", "기타": "bg-neutral-100 text-neutral-500" };
const statusColor: Record<string, string> = { "제작중": "bg-blue-50 text-blue-600", "검수대기": "bg-yellow-50 text-yellow-600", "완료": "bg-green-50 text-green-600", "수정중": "bg-orange-50 text-orange-600" };

export default function ProductionPage() {
    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">제작관리</h1>
                    <p className="text-sm text-neutral-500">콘텐츠 제작 현황을 추적합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 제작 등록
                </button>
            </div>

            <div className="space-y-3">
                {mockProductions.map(p => (
                    <div key={p.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-bold">{p.name}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${typeColor[p.type]}`}>{p.type}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[p.status]}`}>{p.status}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-neutral-400 mt-1">
                                    <span>{p.project}</span>
                                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {p.assignee}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> ~ {p.deadline}</span>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                        </div>
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                                <span>진행률</span>
                                <span>{p.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-neutral-100 rounded-full">
                                <div className="h-1.5 bg-neutral-900 rounded-full" style={{ width: `${p.progress}%` }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
