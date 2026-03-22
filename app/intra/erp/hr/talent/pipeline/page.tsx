"use client";

import { GitBranch, Plus, User } from "lucide-react";

interface Candidate {
    id: string;
    name: string;
    position: string;
    stage: string;
    appliedDate: string;
    source: string;
}

const stages = ["서류접수", "서류심사", "1차면접", "2차면접", "처우협의", "합격"];

const mockCandidates: Candidate[] = [
    { id: "1", name: "김지원", position: "콘텐츠 디렉터", stage: "2차면접", appliedDate: "2026-03-10", source: "직접지원" },
    { id: "2", name: "이서준", position: "AI 엔지니어", stage: "1차면접", appliedDate: "2026-03-12", source: "추천" },
    { id: "3", name: "박하늘", position: "마케팅 매니저", stage: "서류심사", appliedDate: "2026-03-18", source: "채용사이트" },
    { id: "4", name: "최민수", position: "영상 PD", stage: "서류접수", appliedDate: "2026-03-19", source: "직접지원" },
    { id: "5", name: "정다은", position: "디자이너", stage: "처우협의", appliedDate: "2026-02-28", source: "헤드헌팅" },
];

const stageColor: Record<string, string> = {
    "서류접수": "border-neutral-300 bg-neutral-50",
    "서류심사": "border-blue-300 bg-blue-50",
    "1차면접": "border-yellow-300 bg-yellow-50",
    "2차면접": "border-orange-300 bg-orange-50",
    "처우협의": "border-purple-300 bg-purple-50",
    "합격": "border-green-300 bg-green-50",
};

export default function PipelinePage() {
    return (
        <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">채용 Pipeline</h1>
                    <p className="text-sm text-neutral-500">채용 단계별 후보자 현황을 관리합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 후보자 등록
                </button>
            </div>

            {/* Kanban */}
            <div className="flex gap-3 overflow-x-auto pb-4">
                {stages.map(stage => {
                    const candidates = mockCandidates.filter(c => c.stage === stage);
                    return (
                        <div key={stage} className="min-w-[220px] flex-shrink-0">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <h3 className="text-xs font-bold text-neutral-600">{stage}</h3>
                                <span className="text-xs text-neutral-400">{candidates.length}</span>
                            </div>
                            <div className="space-y-2">
                                {candidates.map(c => (
                                    <div key={c.id} className={`border rounded p-3 ${stageColor[stage]} hover:shadow-sm transition-shadow cursor-pointer`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center">
                                                <User className="h-3 w-3 text-neutral-500" />
                                            </div>
                                            <span className="text-sm font-medium">{c.name}</span>
                                        </div>
                                        <p className="text-xs text-neutral-500 mb-1">{c.position}</p>
                                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                                            <span>{c.source}</span>
                                            <span>{c.appliedDate}</span>
                                        </div>
                                    </div>
                                ))}
                                {candidates.length === 0 && (
                                    <div className="border border-dashed border-neutral-200 rounded p-4 text-center text-xs text-neutral-300">
                                        후보자 없음
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
