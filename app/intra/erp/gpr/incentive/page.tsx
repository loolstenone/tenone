"use client";

import { DollarSign, Users, TrendingUp, Award } from "lucide-react";

interface IncentiveRecord {
    name: string;
    department: string;
    position: string;
    gprGrade: string;
    baseSalary: number;
    incentiveRate: number;
    incentiveAmount: number;
    status: "확정" | "산정중" | "미평가";
}

const gradeToRate: Record<string, number> = {
    "S": 200, "A+": 150, "A": 130, "B+": 110, "B": 100,
    "C+": 80, "C": 60, "D+": 30, "D": 0,
};

const mockIncentives: IncentiveRecord[] = [
    { name: "Cheonil Jeon", department: "경영기획", position: "대표", gprGrade: "-", baseSalary: 5000000, incentiveRate: 0, incentiveAmount: 0, status: "미평가" },
    { name: "Sarah Kim", department: "브랜드관리", position: "매니저", gprGrade: "C+", baseSalary: 3500000, incentiveRate: 80, incentiveAmount: 2800000, status: "확정" },
    { name: "김준호", department: "커뮤니티운영", position: "주임", gprGrade: "-", baseSalary: 2800000, incentiveRate: 0, incentiveAmount: 0, status: "미평가" },
    { name: "박영상", department: "콘텐츠제작", position: "선임", gprGrade: "B", baseSalary: 3200000, incentiveRate: 100, incentiveAmount: 3200000, status: "확정" },
    { name: "이수진", department: "디자인", position: "사원", gprGrade: "-", baseSalary: 2600000, incentiveRate: 0, incentiveAmount: 0, status: "산정중" },
    { name: "최민호", department: "AI크리에이티브", position: "선임", gprGrade: "-", baseSalary: 3400000, incentiveRate: 0, incentiveAmount: 0, status: "미평가" },
];

function formatKRW(n: number) { return n === 0 ? "-" : new Intl.NumberFormat("ko-KR").format(n) + "원"; }

function gradeColor(grade: string) {
    if (grade === "-") return "text-neutral-400";
    if (grade.startsWith("A") || grade.startsWith("S")) return "text-green-600 bg-green-50";
    if (grade.startsWith("B")) return "text-blue-600 bg-blue-50";
    if (grade.startsWith("C")) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
}

const statusColor: Record<string, string> = {
    "확정": "bg-green-50 text-green-600",
    "산정중": "bg-blue-50 text-blue-600",
    "미평가": "bg-neutral-100 text-neutral-400",
};

export default function GPRIncentivePage() {
    const confirmed = mockIncentives.filter(i => i.status === "확정");
    const totalIncentive = confirmed.reduce((s, i) => s + i.incentiveAmount, 0);

    return (
        <div className="max-w-5xl">
            <h1 className="text-2xl font-bold mb-2">인센티브</h1>
            <p className="text-sm text-neutral-500 mb-6">GPR 평가 결과에 기반한 인센티브 산정 및 지급 관리</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "전체 대상", value: `${mockIncentives.length}명`, icon: Users },
                    { label: "확정", value: `${confirmed.length}명`, icon: Award },
                    { label: "총 인센티브", value: formatKRW(totalIncentive), icon: DollarSign },
                    { label: "평균 지급률", value: confirmed.length > 0 ? `${Math.round(confirmed.reduce((s, i) => s + i.incentiveRate, 0) / confirmed.length)}%` : "-", icon: TrendingUp },
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

            {/* Grade → Rate table */}
            <div className="border border-neutral-200 bg-white p-5 mb-6">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">등급별 인센티브 지급률</h3>
                <div className="flex gap-2">
                    {Object.entries(gradeToRate).map(([grade, rate]) => (
                        <div key={grade} className="flex-1 text-center bg-neutral-50 rounded p-2">
                            <p className="text-sm font-bold">{grade}</p>
                            <p className="text-[10px] text-neutral-500">{rate}%</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">이름</th>
                            <th className="text-left p-3 font-medium">부서</th>
                            <th className="text-left p-3 font-medium">직급</th>
                            <th className="text-center p-3 font-medium">GPR 등급</th>
                            <th className="text-right p-3 font-medium">기본급</th>
                            <th className="text-center p-3 font-medium">지급률</th>
                            <th className="text-right p-3 font-medium">인센티브</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockIncentives.map(i => (
                            <tr key={i.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 font-medium">{i.name}</td>
                                <td className="p-3 text-neutral-500 text-xs">{i.department}</td>
                                <td className="p-3 text-neutral-500 text-xs">{i.position}</td>
                                <td className="p-3 text-center">
                                    {i.gprGrade !== "-" ? (
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${gradeColor(i.gprGrade)}`}>{i.gprGrade}</span>
                                    ) : <span className="text-neutral-300">-</span>}
                                </td>
                                <td className="p-3 text-right text-neutral-600">{formatKRW(i.baseSalary)}</td>
                                <td className="p-3 text-center">{i.incentiveRate > 0 ? `${i.incentiveRate}%` : "-"}</td>
                                <td className="p-3 text-right font-medium">{formatKRW(i.incentiveAmount)}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[i.status]}`}>{i.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-neutral-200 bg-neutral-50">
                            <td colSpan={6} className="p-3 text-xs font-bold text-neutral-500">합계</td>
                            <td className="p-3 text-right font-bold text-xs">{formatKRW(totalIncentive)}</td>
                            <td className="p-3" />
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
