"use client";

import { GraduationCap, Users, Award, DollarSign, Search } from "lucide-react";
import { useState } from "react";

/* ── Stats ── */
const stats = [
    { label: "프로그램 수", value: "6개", icon: GraduationCap },
    { label: "수강생", value: "142명", icon: Users },
    { label: "수료율", value: "78%", icon: Award },
    { label: "교육 매출", value: "₩8,400,000", icon: DollarSign },
];

/* ── Programs ── */
const programs = [
    { id: "1", name: "AI 마케팅 실전반", brand: "SmarComm", type: "온라인", students: 34, completionRate: 82, price: 490000, status: "진행중" },
    { id: "2", name: "브랜드 전략 마스터", brand: "Evolution School", type: "오프라인", students: 22, completionRate: 91, price: 890000, status: "진행중" },
    { id: "3", name: "HIT 인재 진단 워크숍", brand: "HeRo", type: "블렌디드", students: 18, completionRate: 100, price: 290000, status: "완료" },
    { id: "4", name: "데이터 분석 기초", brand: "Evolution School", type: "온라인", students: 45, completionRate: 65, price: 190000, status: "진행중" },
    { id: "5", name: "크리에이티브 디렉팅", brand: "MADLeap", type: "오프라인", students: 12, completionRate: 50, price: 1200000, status: "진행중" },
    { id: "6", name: "스타트업 린 런칭", brand: "ChangeUp", type: "온라인", students: 11, completionRate: 72, price: 390000, status: "모집중" },
];

/* ── Students ── */
const students = [
    { id: "1", name: "김민지", program: "AI 마케팅 실전반", status: "수강중", progress: 68, cert: false },
    { id: "2", name: "이준혁", program: "브랜드 전략 마스터", status: "수강중", progress: 45, cert: false },
    { id: "3", name: "박서윤", program: "HIT 인재 진단 워크숍", status: "수료", progress: 100, cert: true },
    { id: "4", name: "정하은", program: "데이터 분석 기초", status: "수강중", progress: 30, cert: false },
    { id: "5", name: "최다운", program: "HIT 인재 진단 워크숍", status: "수료", progress: 100, cert: true },
    { id: "6", name: "송예린", program: "AI 마케팅 실전반", status: "수강중", progress: 85, cert: false },
    { id: "7", name: "한도윤", program: "크리에이티브 디렉팅", status: "수강중", progress: 20, cert: false },
    { id: "8", name: "오지호", program: "데이터 분석 기초", status: "중단", progress: 15, cert: false },
    { id: "9", name: "윤서아", program: "브랜드 전략 마스터", status: "수강중", progress: 72, cert: false },
    { id: "10", name: "임채원", program: "스타트업 린 런칭", status: "수강중", progress: 55, cert: false },
    { id: "11", name: "강현우", program: "AI 마케팅 실전반", status: "수료", progress: 100, cert: true },
    { id: "12", name: "배소현", program: "데이터 분석 기초", status: "수강중", progress: 42, cert: false },
];

const brandColor: Record<string, string> = {
    SmarComm: "bg-emerald-100 text-emerald-700",
    "Evolution School": "bg-orange-100 text-orange-700",
    HeRo: "bg-rose-100 text-rose-700",
    MADLeap: "bg-indigo-100 text-indigo-700",
    ChangeUp: "bg-lime-100 text-lime-700",
};

export default function UniverseEducation() {
    const [search, setSearch] = useState("");

    const filteredStudents = students.filter((s) =>
        !search || s.name.includes(search) || s.program.includes(search)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" /> 교육 관리
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">프로그램 및 수강생 통합 관리</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <s.icon className="h-4 w-4 text-neutral-400 mb-2" />
                        <p className="text-lg font-bold text-neutral-900">{s.value}</p>
                        <p className="text-[11px] text-neutral-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Programs */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">프로그램 목록</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">프로그램명</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">브랜드</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">형태</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500">수강생</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500">수료율</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500">가격</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">상태</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {programs.map((p) => (
                                    <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-neutral-900">{p.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${brandColor[p.brand] || "bg-neutral-100 text-neutral-600"}`}>
                                                {p.brand}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-600">{p.type}</td>
                                        <td className="px-4 py-3 text-right text-neutral-700">{p.students}명</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-12 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${p.completionRate >= 80 ? "bg-green-500" : p.completionRate >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                                                        style={{ width: `${p.completionRate}%` }} />
                                                </div>
                                                <span className="text-xs text-neutral-600">{p.completionRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-neutral-700">₩{p.price.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                                                p.status === "진행중" ? "bg-blue-100 text-blue-700" :
                                                p.status === "완료" ? "bg-green-100 text-green-700" :
                                                "bg-amber-100 text-amber-700"
                                            }`}>{p.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Students */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-neutral-900">수강생</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input type="text" placeholder="검색" value={search} onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 w-48" />
                    </div>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">이름</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">프로그램</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">상태</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">진도</th>
                                    <th className="text-center px-4 py-3 text-xs font-medium text-neutral-500">수료증</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {filteredStudents.map((s) => (
                                    <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-neutral-900">{s.name}</td>
                                        <td className="px-4 py-3 text-neutral-600">{s.program}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                                                s.status === "수강중" ? "bg-blue-100 text-blue-700" :
                                                s.status === "수료" ? "bg-green-100 text-green-700" :
                                                "bg-red-100 text-red-600"
                                            }`}>{s.status}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.progress}%` }} />
                                                </div>
                                                <span className="text-xs text-neutral-500">{s.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {s.cert ? <Award className="h-4 w-4 text-amber-500 mx-auto" /> : <span className="text-xs text-neutral-300">-</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
