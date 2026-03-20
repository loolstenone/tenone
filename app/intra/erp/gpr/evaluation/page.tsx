"use client";

import { useState } from "react";
import { Target, CheckCircle2, Clock, Users } from "lucide-react";

interface EvalRecord {
    name: string;
    department: string;
    position: string;
    selfRate: number;
    managerRate: number | null;
    finalGrade: string | null;
    status: "자기평가완료" | "매니저평가중" | "확정" | "미제출";
}

const mockEvals: EvalRecord[] = [
    { name: "Cheonil Jeon", department: "경영기획", position: "대표", selfRate: 75, managerRate: null, finalGrade: null, status: "자기평가완료" },
    { name: "Sarah Kim", department: "브랜드관리", position: "매니저", selfRate: 60, managerRate: 55, finalGrade: "C+", status: "확정" },
    { name: "김준호", department: "커뮤니티운영", position: "주임", selfRate: 0, managerRate: null, finalGrade: null, status: "미제출" },
    { name: "박영상", department: "콘텐츠제작", position: "선임", selfRate: 70, managerRate: 65, finalGrade: "B", status: "확정" },
    { name: "이수진", department: "디자인", position: "사원", selfRate: 50, managerRate: null, finalGrade: null, status: "매니저평가중" },
    { name: "최민호", department: "AI크리에이티브", position: "선임", selfRate: 0, managerRate: null, finalGrade: null, status: "미제출" },
];

const statusColor: Record<string, string> = {
    "자기평가완료": "bg-blue-50 text-blue-600",
    "매니저평가중": "bg-yellow-50 text-yellow-600",
    "확정": "bg-green-50 text-green-600",
    "미제출": "bg-red-50 text-red-600",
};

export default function GPREvaluationPage() {
    const [filter, setFilter] = useState("all");
    const confirmed = mockEvals.filter(e => e.status === "확정").length;
    const pending = mockEvals.filter(e => e.status !== "확정").length;

    const filtered = filter === "all" ? mockEvals : mockEvals.filter(e => e.status === filter);

    return (
        <div className="max-w-5xl">
            <h1 className="text-2xl font-bold mb-2">GPR 평가</h1>
            <p className="text-sm text-neutral-500 mb-6">분기별 자기평가 → 매니저평가 → 최종 등급 확정</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "전체 대상", value: `${mockEvals.length}명`, icon: Users },
                    { label: "평가 확정", value: `${confirmed}명`, icon: CheckCircle2 },
                    { label: "진행중", value: `${pending}명`, icon: Clock },
                    { label: "미제출", value: `${mockEvals.filter(e => e.status === "미제출").length}명`, icon: Target },
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

            <div className="flex gap-1 mb-4">
                {["all", "미제출", "자기평가완료", "매니저평가중", "확정"].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 text-xs rounded transition-all ${filter === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                        {s === "all" ? "전체" : s}
                    </button>
                ))}
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">이름</th>
                            <th className="text-left p-3 font-medium">부서</th>
                            <th className="text-left p-3 font-medium">직급</th>
                            <th className="text-center p-3 font-medium">자기평가</th>
                            <th className="text-center p-3 font-medium">매니저평가</th>
                            <th className="text-center p-3 font-medium">최종 등급</th>
                            <th className="text-center p-3 font-medium">상태</th>
                            <th className="text-center p-3 font-medium">액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(e => (
                            <tr key={e.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 font-medium">{e.name}</td>
                                <td className="p-3 text-neutral-500 text-xs">{e.department}</td>
                                <td className="p-3 text-neutral-500 text-xs">{e.position}</td>
                                <td className="p-3 text-center">{e.selfRate > 0 ? `${e.selfRate}%` : "-"}</td>
                                <td className="p-3 text-center">{e.managerRate !== null ? `${e.managerRate}%` : "-"}</td>
                                <td className="p-3 text-center font-bold">{e.finalGrade || "-"}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[e.status]}`}>{e.status}</span>
                                </td>
                                <td className="p-3 text-center">
                                    {e.status === "자기평가완료" && (
                                        <button className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">매니저 평가</button>
                                    )}
                                    {e.status === "매니저평가중" && (
                                        <button className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded hover:bg-green-100">등급 확정</button>
                                    )}
                                    {e.status === "미제출" && (
                                        <button className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded hover:bg-red-100">독촉</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
