"use client";

import { useState } from "react";
import { Clock, Plus, Calendar } from "lucide-react";

interface TimesheetEntry {
    id: string;
    date: string;
    project: string;
    job: string;
    hours: number;
    description: string;
}

const mockEntries: TimesheetEntry[] = [
    { id: "1", date: "2026-03-20", project: "LUKI 2nd Single", job: "MV 콘티 기획", hours: 4, description: "콘티 1차 초안 작성" },
    { id: "2", date: "2026-03-20", project: "MADLeap 5기", job: "운영 관리", hours: 2, description: "5기 멘티 상담" },
    { id: "3", date: "2026-03-20", project: "기타", job: "관리 업무", hours: 2, description: "주간 회의, 메일 처리" },
    { id: "4", date: "2026-03-19", project: "LUKI 2nd Single", job: "MV 콘티 기획", hours: 6, description: "레퍼런스 수집 및 분석" },
    { id: "5", date: "2026-03-19", project: "ABC엔터 영상", job: "기획", hours: 2, description: "클라이언트 미팅" },
    { id: "6", date: "2026-03-18", project: "LUKI 2nd Single", job: "MV 콘티 기획", hours: 5, description: "콘티 수정 및 피드백 반영" },
    { id: "7", date: "2026-03-18", project: "Badak 네트워크", job: "파트너십", hours: 3, description: "파트너 후보 리서치" },
];

const weekDays = ["월", "화", "수", "목", "금"];

export default function TimesheetPage() {
    const todayHours = mockEntries.filter(e => e.date === "2026-03-20").reduce((s, e) => s + e.hours, 0);
    const weekHours = mockEntries.reduce((s, e) => s + e.hours, 0);

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">타임시트</h1>
                    <p className="text-sm text-neutral-500">프로젝트별 업무 시간을 기록합니다.</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 시간 기록
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "오늘 근무", value: `${todayHours}h`, icon: Clock },
                    { label: "이번 주 합계", value: `${weekHours}h`, icon: Calendar },
                    { label: "주 목표", value: "40h", icon: Clock },
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

            {/* Today's entries */}
            <h2 className="text-sm font-bold mb-3">오늘 기록</h2>
            <div className="border border-neutral-200 bg-white mb-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">프로젝트</th>
                            <th className="text-left p-3 font-medium">Job</th>
                            <th className="text-center p-3 font-medium">시간</th>
                            <th className="text-left p-3 font-medium">내용</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockEntries.filter(e => e.date === "2026-03-20").map(e => (
                            <tr key={e.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 font-medium">{e.project}</td>
                                <td className="p-3 text-neutral-500">{e.job}</td>
                                <td className="p-3 text-center font-medium">{e.hours}h</td>
                                <td className="p-3 text-neutral-500">{e.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Previous days */}
            <h2 className="text-sm font-bold mb-3">이전 기록</h2>
            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">날짜</th>
                            <th className="text-left p-3 font-medium">프로젝트</th>
                            <th className="text-left p-3 font-medium">Job</th>
                            <th className="text-center p-3 font-medium">시간</th>
                            <th className="text-left p-3 font-medium">내용</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockEntries.filter(e => e.date !== "2026-03-20").map(e => (
                            <tr key={e.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 text-neutral-500">{e.date}</td>
                                <td className="p-3 font-medium">{e.project}</td>
                                <td className="p-3 text-neutral-500">{e.job}</td>
                                <td className="p-3 text-center font-medium">{e.hours}h</td>
                                <td className="p-3 text-neutral-500">{e.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
