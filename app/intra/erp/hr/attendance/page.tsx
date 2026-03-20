"use client";

import { useState } from "react";
import { CalendarCheck, Clock, Users, AlertTriangle, Search, Download, CheckCircle2 } from "lucide-react";

interface StaffAttendance {
    name: string;
    department: string;
    checkIn: string;
    checkOut: string;
    workHours: string;
    status: "정상" | "지각" | "조퇴" | "결근" | "휴가" | "출장";
}

const todayRecords: StaffAttendance[] = [
    { name: "Cheonil Jeon", department: "경영기획", checkIn: "08:55", checkOut: "-", workHours: "-", status: "정상" },
    { name: "Sarah Kim", department: "브랜드관리", checkIn: "09:02", checkOut: "-", workHours: "-", status: "정상" },
    { name: "김준호", department: "커뮤니티운영", checkIn: "09:30", checkOut: "-", workHours: "-", status: "지각" },
    { name: "박영상", department: "콘텐츠제작", checkIn: "-", checkOut: "-", workHours: "-", status: "휴가" },
    { name: "이수진", department: "디자인", checkIn: "08:45", checkOut: "-", workHours: "-", status: "정상" },
    { name: "최민호", department: "AI크리에이티브", checkIn: "-", checkOut: "-", workHours: "-", status: "출장" },
];

interface LeaveRequest {
    id: string;
    name: string;
    department: string;
    type: "연차" | "반차" | "병가" | "경조" | "출장";
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: "승인대기" | "승인" | "반려";
}

const leaveRequests: LeaveRequest[] = [
    { id: "1", name: "박영상", department: "콘텐츠제작", type: "연차", startDate: "2026-03-17", endDate: "2026-03-17", days: 1, reason: "개인 사유", status: "승인" },
    { id: "2", name: "김준호", department: "커뮤니티운영", type: "반차", startDate: "2026-03-21", endDate: "2026-03-21", days: 0.5, reason: "병원 방문", status: "승인대기" },
    { id: "3", name: "이수진", department: "디자인", type: "연차", startDate: "2026-03-24", endDate: "2026-03-25", days: 2, reason: "가족 행사", status: "승인대기" },
    { id: "4", name: "최민호", department: "AI크리에이티브", type: "출장", startDate: "2026-03-20", endDate: "2026-03-21", days: 2, reason: "파트너사 미팅", status: "승인" },
];

const statusColor: Record<string, string> = {
    "정상": "bg-green-50 text-green-600",
    "지각": "bg-yellow-50 text-yellow-600",
    "조퇴": "bg-orange-50 text-orange-600",
    "결근": "bg-red-50 text-red-600",
    "휴가": "bg-blue-50 text-blue-600",
    "출장": "bg-purple-50 text-purple-600",
};

const reqStatusColor: Record<string, string> = {
    "승인대기": "bg-yellow-50 text-yellow-600",
    "승인": "bg-green-50 text-green-600",
    "반려": "bg-red-50 text-red-600",
};

export default function AttendanceAdminPage() {
    const [tab, setTab] = useState<"today" | "requests" | "overtime">("today");
    const [search, setSearch] = useState("");

    const present = todayRecords.filter(r => r.status === "정상" || r.status === "지각").length;
    const absent = todayRecords.filter(r => r.status === "결근").length;
    const onLeave = todayRecords.filter(r => r.status === "휴가" || r.status === "출장").length;
    const pending = leaveRequests.filter(r => r.status === "승인대기").length;

    const filteredToday = search
        ? todayRecords.filter(r => r.name.includes(search) || r.department.includes(search))
        : todayRecords;

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">근태 관리</h1>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs border border-neutral-200 hover:border-neutral-400 transition-colors">
                    <Download className="h-3 w-3" /> 리포트 다운로드
                </button>
            </div>
            <p className="text-sm text-neutral-500 mb-6">전체 구성원의 출퇴근, 휴가, 초과근무를 관리합니다.</p>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "오늘 출근", value: `${present}명`, sub: `전체 ${todayRecords.length}명`, icon: CheckCircle2 },
                    { label: "휴가/출장", value: `${onLeave}명`, icon: CalendarCheck },
                    { label: "승인 대기", value: `${pending}건`, icon: AlertTriangle, highlight: pending > 0 },
                    { label: "이번 달 지각", value: "2건", icon: Clock },
                ].map(s => (
                    <div key={s.label} className={`border bg-white p-4 ${s.highlight ? 'border-yellow-300' : 'border-neutral-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon className={`h-3.5 w-3.5 ${s.highlight ? 'text-yellow-500' : 'text-neutral-400'}`} />
                            <span className="text-[10px] text-neutral-400">{s.label}</span>
                        </div>
                        <p className="text-lg font-bold">{s.value}</p>
                        {'sub' in s && s.sub && <p className="text-[10px] text-neutral-400 mt-0.5">{s.sub}</p>}
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4">
                {([["today", "오늘 현황"], ["requests", `휴가/출장 신청 ${pending > 0 ? `(${pending})` : ''}`], ["overtime", "초과근무 현황"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key as typeof tab)}
                        className={`px-4 py-2 text-sm rounded-t border-b-2 transition-all ${tab === key ? "border-neutral-900 font-medium" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === "today" && (
                <div className="border border-neutral-200 bg-white">
                    <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                        <h2 className="text-sm font-bold">오늘 출퇴근 현황</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-3 py-1.5 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400 w-48"
                                placeholder="이름, 부서 검색..." />
                        </div>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                <th className="text-left p-3 font-medium">이름</th>
                                <th className="text-left p-3 font-medium">부서</th>
                                <th className="text-left p-3 font-medium">출근</th>
                                <th className="text-left p-3 font-medium">퇴근</th>
                                <th className="text-left p-3 font-medium">근무시간</th>
                                <th className="text-center p-3 font-medium">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredToday.map(r => (
                                <tr key={r.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    <td className="p-3 font-medium">{r.name}</td>
                                    <td className="p-3 text-neutral-500 text-xs">{r.department}</td>
                                    <td className="p-3 text-neutral-600">{r.checkIn}</td>
                                    <td className="p-3 text-neutral-600">{r.checkOut}</td>
                                    <td className="p-3 text-neutral-600">{r.workHours}</td>
                                    <td className="p-3 text-center">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[r.status]}`}>{r.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === "requests" && (
                <div className="border border-neutral-200 bg-white">
                    <div className="p-4 border-b border-neutral-100">
                        <h2 className="text-sm font-bold">휴가/출장 신청 목록</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                <th className="text-left p-3 font-medium">신청자</th>
                                <th className="text-left p-3 font-medium">부서</th>
                                <th className="text-center p-3 font-medium">유형</th>
                                <th className="text-left p-3 font-medium">기간</th>
                                <th className="text-center p-3 font-medium">일수</th>
                                <th className="text-left p-3 font-medium">사유</th>
                                <th className="text-center p-3 font-medium">상태</th>
                                <th className="text-center p-3 font-medium">액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRequests.map(r => (
                                <tr key={r.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    <td className="p-3 font-medium">{r.name}</td>
                                    <td className="p-3 text-neutral-500 text-xs">{r.department}</td>
                                    <td className="p-3 text-center">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">{r.type}</span>
                                    </td>
                                    <td className="p-3 text-xs text-neutral-500">
                                        {r.startDate === r.endDate ? r.startDate : `${r.startDate} ~ ${r.endDate}`}
                                    </td>
                                    <td className="p-3 text-center">{r.days}</td>
                                    <td className="p-3 text-neutral-500 text-xs">{r.reason}</td>
                                    <td className="p-3 text-center">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${reqStatusColor[r.status]}`}>{r.status}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        {r.status === "승인대기" && (
                                            <div className="flex gap-1 justify-center">
                                                <button className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors">승인</button>
                                                <button className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">반려</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === "overtime" && (
                <div className="border border-neutral-200 bg-white">
                    <div className="p-4 border-b border-neutral-100">
                        <h2 className="text-sm font-bold">이번 달 초과근무 현황</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                <th className="text-left p-3 font-medium">이름</th>
                                <th className="text-left p-3 font-medium">부서</th>
                                <th className="text-right p-3 font-medium">이번 주</th>
                                <th className="text-right p-3 font-medium">이번 달 누적</th>
                                <th className="text-right p-3 font-medium">주 52시간 여유</th>
                                <th className="text-center p-3 font-medium">경고</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: "Cheonil Jeon", dept: "경영기획", weekly: "4h 30m", monthly: "18h", remain: "7h 30m", warn: false },
                                { name: "Sarah Kim", dept: "브랜드관리", weekly: "2h", monthly: "8h", remain: "10h", warn: false },
                                { name: "박영상", dept: "콘텐츠제작", weekly: "6h", monthly: "24h", remain: "6h", warn: true },
                                { name: "이수진", dept: "디자인", weekly: "1h", monthly: "5h", remain: "11h", warn: false },
                            ].map(r => (
                                <tr key={r.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    <td className="p-3 font-medium">{r.name}</td>
                                    <td className="p-3 text-neutral-500 text-xs">{r.dept}</td>
                                    <td className="p-3 text-right text-neutral-600">{r.weekly}</td>
                                    <td className="p-3 text-right text-neutral-600">{r.monthly}</td>
                                    <td className="p-3 text-right text-neutral-600">{r.remain}</td>
                                    <td className="p-3 text-center">
                                        {r.warn && <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-600 font-medium">주의</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
