"use client";

import { useState, useEffect } from "react";
import { Target, CheckCircle2, Clock, Users, Loader2 } from "lucide-react";
import { fetchStaffGprData } from "@/lib/supabase/erp";

interface EvalRecord {
    name: string;
    department: string;
    position: string;
    selfRate: string;
    managerRate: string | null;
    finalGrade: string | null;
    status: "자기평가완료" | "매니저평가중" | "확정" | "미제출";
}

const mockEvals: EvalRecord[] = [
    { name: "Cheonil Jeon", department: "경영기획", position: "대표", selfRate: "75%", managerRate: null, finalGrade: null, status: "자기평가완료" },
    { name: "Sarah Kim", department: "브랜드관리", position: "매니저", selfRate: "60%", managerRate: "55%", finalGrade: "C+", status: "확정" },
    { name: "김준호", department: "커뮤니티운영", position: "주임", selfRate: "-", managerRate: null, finalGrade: null, status: "미제출" },
    { name: "박영상", department: "콘텐츠제작", position: "선임", selfRate: "70%", managerRate: "65%", finalGrade: "B", status: "확정" },
    { name: "이수진", department: "디자인", position: "사원", selfRate: "50%", managerRate: null, finalGrade: null, status: "매니저평가중" },
    { name: "최민호", department: "AI크리에이티브", position: "선임", selfRate: "-", managerRate: null, finalGrade: null, status: "미제출" },
];

const statusColor: Record<string, string> = {
    "자기평가완료": "bg-blue-50 text-blue-600",
    "매니저평가중": "bg-yellow-50 text-yellow-600",
    "확정": "bg-green-50 text-green-600",
    "미제출": "bg-red-50 text-red-600",
};

function deriveStatus(goals: Record<string, unknown>[]): EvalRecord["status"] {
    if (!goals.length) return "미제출";
    const g = goals[0];
    if (g.agreed_at || g.evaluated_at) return "확정";
    if (g.supervisor_rating) return "매니저평가중";
    if (g.self_evaluated_at || g.self_rating) return "자기평가완료";
    return "미제출";
}

function dbRowToEval(m: Record<string, unknown>): EvalRecord {
    const goals = (m.goals as Record<string, unknown>[]) || [];
    const g = goals[0] || {};
    const status = deriveStatus(goals);
    const finalGrade = (g.supervisor_rating as string) || null;
    return {
        name: (m.name as string) || "-",
        department: (m.department as string) || "-",
        position: (m.position as string) || "-",
        selfRate: g.self_rating ? `${g.self_rating}%` : "-",
        managerRate: g.supervisor_rating ? `${g.supervisor_rating}` : null,
        finalGrade,
        status,
    };
}

export default function GPREvaluationPage() {
    const [filter, setFilter] = useState("all");
    const [evals, setEvals] = useState<EvalRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const rows = await fetchStaffGprData();
                if (!cancelled) {
                    setEvals(rows.length > 0 ? rows.map(r => dbRowToEval(r)) : mockEvals);
                }
            } catch {
                if (!cancelled) setEvals(mockEvals);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;
    }

    const confirmed = evals.filter(e => e.status === "확정").length;
    const pending = evals.filter(e => e.status !== "확정").length;
    const filtered = filter === "all" ? evals : evals.filter(e => e.status === filter);

    return (
        <div className="max-w-5xl">
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900 mb-1">GPR 평가</h1>
            <p className="text-sm text-neutral-400 mb-6">분기별 자기평가 → 매니저평가 → 최종 등급 확정</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "전체 대상", value: `${evals.length}명`, icon: Users },
                    { label: "평가 확정", value: `${confirmed}명`, icon: CheckCircle2 },
                    { label: "진행중", value: `${pending}명`, icon: Clock },
                    { label: "미제출", value: `${evals.filter(e => e.status === "미제출").length}명`, icon: Target },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-xs text-neutral-400">{s.label}</span>
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
                                <td className="p-3 text-center text-neutral-600">{e.selfRate}</td>
                                <td className="p-3 text-center text-neutral-600">{e.managerRate ?? "-"}</td>
                                <td className="p-3 text-center font-bold">{e.finalGrade || "-"}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[e.status]}`}>{e.status}</span>
                                </td>
                                <td className="p-3 text-center">
                                    {e.status === "자기평가완료" && (
                                        <button className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">매니저 평가</button>
                                    )}
                                    {e.status === "매니저평가중" && (
                                        <button className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded hover:bg-green-100">등급 확정</button>
                                    )}
                                    {e.status === "미제출" && (
                                        <button className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded hover:bg-red-100">독촉</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-sm text-neutral-400">해당하는 평가 항목이 없습니다</div>
                )}
            </div>
        </div>
    );
}
