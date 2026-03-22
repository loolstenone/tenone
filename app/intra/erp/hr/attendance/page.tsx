"use client";

import { useState } from "react";
import {
  CalendarCheck, Clock, Users, AlertTriangle, Search, Download,
  CheckCircle2, ChevronDown, ChevronUp, Filter, Palmtree, UserCheck,
} from "lucide-react";
import clsx from "clsx";

/* ── Types ── */
type AttendanceStatus = "정상" | "지각" | "결근" | "재택" | "휴가";
type VacationType = "연차" | "반차" | "병가" | "특별휴가";
type RequestStatus = "승인대기" | "승인" | "반려";

interface StaffAttendance {
  name: string;
  department: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
}

interface VacationHistory {
  date: string;
  type: VacationType;
  days: number;
  status: "승인" | "사용완료";
}

interface StaffVacation {
  id: string;
  name: string;
  department: string;
  position: string;
  totalAnnual: number;
  usedAnnual: number;
  remainAnnual: number;
  sickUsed: number;
  sickTotal: number;
  status: "정상" | "주의";
  history: VacationHistory[];
}

interface VacationRequest {
  id: string;
  name: string;
  department: string;
  type: VacationType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  requestDate: string;
  status: RequestStatus;
}

/* ── Mock Data ── */
const todayRecords: StaffAttendance[] = [
  { name: "전천일", department: "경영기획", checkIn: "08:55", checkOut: "-", status: "정상" },
  { name: "김사라", department: "브랜드관리", checkIn: "09:02", checkOut: "-", status: "정상" },
  { name: "김준호", department: "커뮤니티운영", checkIn: "09:35", checkOut: "-", status: "지각" },
  { name: "박영상", department: "콘텐츠제작", checkIn: "-", checkOut: "-", status: "휴가" },
  { name: "이수진", department: "디자인", checkIn: "08:45", checkOut: "-", status: "정상" },
  { name: "최민호", department: "AI크리에이티브", checkIn: "09:00", checkOut: "-", status: "재택" },
  { name: "정하늘", department: "마케팅", checkIn: "08:50", checkOut: "-", status: "정상" },
  { name: "한지우", department: "경영기획", checkIn: "-", checkOut: "-", status: "휴가" },
  { name: "오민수", department: "개발", checkIn: "09:10", checkOut: "-", status: "정상" },
  { name: "윤서연", department: "디자인", checkIn: "-", checkOut: "-", status: "결근" },
];

const staffVacations: StaffVacation[] = [
  { id: "v1", name: "전천일", department: "경영기획", position: "대표", totalAnnual: 25, usedAnnual: 5, remainAnnual: 20, sickUsed: 0, sickTotal: 3, status: "정상", history: [{ date: "2026-01-15", type: "연차", days: 1, status: "사용완료" }, { date: "2026-02-10~11", type: "연차", days: 2, status: "사용완료" }, { date: "2026-03-05", type: "반차", days: 0.5, status: "사용완료" }] },
  { id: "v2", name: "김사라", department: "브랜드관리", position: "팀장", totalAnnual: 20, usedAnnual: 8, remainAnnual: 12, sickUsed: 1, sickTotal: 3, status: "정상", history: [{ date: "2026-01-20~22", type: "연차", days: 3, status: "사용완료" }, { date: "2026-02-14", type: "병가", days: 1, status: "사용완료" }] },
  { id: "v3", name: "김준호", department: "커뮤니티운영", position: "매니저", totalAnnual: 15, usedAnnual: 12, remainAnnual: 3, sickUsed: 2, sickTotal: 3, status: "주의", history: [{ date: "2026-01-06~10", type: "연차", days: 5, status: "사용완료" }] },
  { id: "v4", name: "박영상", department: "콘텐츠제작", position: "PD", totalAnnual: 18, usedAnnual: 6, remainAnnual: 12, sickUsed: 0, sickTotal: 3, status: "정상", history: [{ date: "2026-03-21", type: "연차", days: 1, status: "승인" }] },
  { id: "v5", name: "이수진", department: "디자인", position: "디자이너", totalAnnual: 15, usedAnnual: 4, remainAnnual: 11, sickUsed: 0, sickTotal: 3, status: "정상", history: [] },
  { id: "v6", name: "최민호", department: "AI크리에이티브", position: "리드", totalAnnual: 20, usedAnnual: 7, remainAnnual: 13, sickUsed: 1, sickTotal: 3, status: "정상", history: [{ date: "2026-02-20", type: "병가", days: 1, status: "사용완료" }] },
  { id: "v7", name: "정하늘", department: "마케팅", position: "매니저", totalAnnual: 15, usedAnnual: 13, remainAnnual: 2, sickUsed: 0, sickTotal: 3, status: "주의", history: [] },
  { id: "v8", name: "한지우", department: "경영기획", position: "사원", totalAnnual: 15, usedAnnual: 10, remainAnnual: 5, sickUsed: 1, sickTotal: 3, status: "정상", history: [{ date: "2026-03-21~22", type: "연차", days: 2, status: "승인" }] },
  { id: "v9", name: "오민수", department: "개발", position: "개발자", totalAnnual: 15, usedAnnual: 3, remainAnnual: 12, sickUsed: 0, sickTotal: 3, status: "정상", history: [] },
  { id: "v10", name: "윤서연", department: "디자인", position: "주니어", totalAnnual: 15, usedAnnual: 11, remainAnnual: 4, sickUsed: 2, sickTotal: 3, status: "주의", history: [{ date: "2026-03-01", type: "병가", days: 1, status: "사용완료" }] },
];

const initialRequests: VacationRequest[] = [
  { id: "r1", name: "김준호", department: "커뮤니티운영", type: "연차", startDate: "2026-03-28", endDate: "2026-03-28", days: 1, reason: "개인 사유", requestDate: "2026-03-18", status: "승인대기" },
  { id: "r2", name: "이수진", department: "디자인", type: "연차", startDate: "2026-04-01", endDate: "2026-04-02", days: 2, reason: "가족 행사", requestDate: "2026-03-19", status: "승인대기" },
  { id: "r3", name: "정하늘", department: "마케팅", type: "반차", startDate: "2026-03-25", endDate: "2026-03-25", days: 0.5, reason: "병원 방문", requestDate: "2026-03-20", status: "승인대기" },
  { id: "r4", name: "오민수", department: "개발", type: "병가", startDate: "2026-03-24", endDate: "2026-03-24", days: 1, reason: "감기 증상", requestDate: "2026-03-20", status: "승인대기" },
  { id: "r5", name: "윤서연", department: "디자인", type: "특별휴가", startDate: "2026-04-05", endDate: "2026-04-07", days: 3, reason: "결혼 (본인)", requestDate: "2026-03-15", status: "승인대기" },
  // History
  { id: "r6", name: "박영상", department: "콘텐츠제작", type: "연차", startDate: "2026-03-21", endDate: "2026-03-21", days: 1, reason: "개인 사유", requestDate: "2026-03-14", status: "승인" },
  { id: "r7", name: "한지우", department: "경영기획", type: "연차", startDate: "2026-03-21", endDate: "2026-03-22", days: 2, reason: "여행", requestDate: "2026-03-12", status: "승인" },
  { id: "r8", name: "최민호", department: "AI크리에이티브", type: "반차", startDate: "2026-03-10", endDate: "2026-03-10", days: 0.5, reason: "개인 사유", requestDate: "2026-03-07", status: "반려" },
];

const statusColor: Record<AttendanceStatus, string> = {
  "정상": "bg-green-50 text-green-600",
  "지각": "bg-yellow-50 text-yellow-600",
  "결근": "bg-red-50 text-red-600",
  "재택": "bg-blue-50 text-blue-600",
  "휴가": "bg-violet-50 text-violet-600",
};

const reqStatusColor: Record<RequestStatus, string> = {
  "승인대기": "bg-yellow-50 text-yellow-600",
  "승인": "bg-green-50 text-green-600",
  "반려": "bg-red-50 text-red-600",
};

const typeColor: Record<VacationType, string> = {
  "연차": "bg-blue-50 text-blue-600",
  "반차": "bg-sky-50 text-sky-600",
  "병가": "bg-orange-50 text-orange-600",
  "특별휴가": "bg-violet-50 text-violet-600",
};

const departments = ["전체", "경영기획", "브랜드관리", "커뮤니티운영", "콘텐츠제작", "디자인", "AI크리에이티브", "마케팅", "개발"];

/* ── Component ── */
export default function AttendancePage() {
  const [tab, setTab] = useState<"attendance" | "vacation" | "requests">("attendance");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("전체");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [requests, setRequests] = useState<VacationRequest[]>(initialRequests);
  const [toast, setToast] = useState<string | null>(null);

  // Tab 1 stats
  const present = todayRecords.filter(r => r.status === "정상").length;
  const absent = todayRecords.filter(r => r.status === "결근" || r.status === "지각").length;
  const remote = todayRecords.filter(r => r.status === "재택").length;
  const onVacation = todayRecords.filter(r => r.status === "휴가").length;

  // Tab 2 stats
  const totalRemainAnnual = staffVacations.reduce((s, v) => s + v.remainAnnual, 0);
  const thisMonthVacations = 12;
  const warningCount = staffVacations.filter(v => v.remainAnnual < 5).length;

  // Tab 3 stats
  const pendingRequests = requests.filter(r => r.status === "승인대기");
  const historyRequests = requests.filter(r => r.status !== "승인대기");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "승인" as RequestStatus } : r));
    showToast("승인 완료 — 전체 일정에 자동 등록됩니다");
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "반려" as RequestStatus } : r));
    showToast("반려 처리되었습니다");
  };

  const filteredAttendance = todayRecords.filter(r => {
    const matchSearch = !search || r.name.includes(search) || r.department.includes(search);
    return matchSearch;
  });

  const filteredVacations = staffVacations.filter(v => {
    const matchDept = deptFilter === "전체" || v.department === deptFilter;
    const matchSearch = !search || v.name.includes(search) || v.department.includes(search);
    return matchDept && matchSearch;
  });

  return (
    <div className="max-w-6xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-xs shadow-sm flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">근태관리</h1>
        <p className="text-sm text-neutral-500 mt-1">출퇴근 · 휴가 관리</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-6">
        {([
          ["attendance", "출퇴근 현황"],
          ["vacation", "휴가 관리"],
          ["requests", `휴가 신청${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ""}`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key as typeof tab); setSearch(""); setDeptFilter("전체"); }}
            className={clsx(
              "px-4 py-2 text-xs border-b-2 -mb-px transition-all",
              tab === key
                ? "border-neutral-900 font-semibold text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: 출퇴근 현황 ── */}
      {tab === "attendance" && (
        <>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "출근", value: `${present}명`, icon: CheckCircle2, color: "text-green-500" },
              { label: "미출근", value: `${absent}명`, icon: AlertTriangle, color: "text-red-400" },
              { label: "재택", value: `${remote}명`, icon: Users, color: "text-blue-400" },
              { label: "휴가", value: `${onVacation}명`, icon: Palmtree, color: "text-violet-400" },
            ].map(s => (
              <div key={s.label} className="border border-neutral-200 bg-white p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon className={clsx("h-3 w-3", s.color)} />
                  <span className="text-xs text-neutral-400">{s.label}</span>
                </div>
                <p className="text-base font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="border border-neutral-200 bg-white">
            <div className="flex items-center justify-between p-3 border-b border-neutral-100">
              <h2 className="text-xs font-semibold">오늘 출퇴근 현황</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400 w-44"
                  placeholder="이름, 부서 검색..."
                />
              </div>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                  <th className="text-left p-3 font-medium">이름</th>
                  <th className="text-left p-3 font-medium">부서</th>
                  <th className="text-left p-3 font-medium">출근시간</th>
                  <th className="text-left p-3 font-medium">퇴근시간</th>
                  <th className="text-center p-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map(r => (
                  <tr key={r.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="p-3 font-medium text-sm">{r.name}</td>
                    <td className="p-3 text-neutral-500">{r.department}</td>
                    <td className="p-3 text-neutral-600">{r.checkIn}</td>
                    <td className="p-3 text-neutral-600">{r.checkOut}</td>
                    <td className="p-3 text-center">
                      <span className={clsx("text-xs px-2 py-0.5 rounded font-medium", statusColor[r.status])}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Tab 2: 휴가 관리 ── */}
      {tab === "vacation" && (
        <>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "전체 인원", value: "50명", icon: Users },
              { label: "오늘 휴가", value: `${onVacation}명`, icon: Palmtree },
              { label: "이번 달 휴가", value: `${thisMonthVacations}건`, icon: CalendarCheck },
              { label: "미사용 연차 합계", value: `${totalRemainAnnual}일`, icon: Clock },
            ].map(s => (
              <div key={s.label} className="border border-neutral-200 bg-white p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon className="h-3 w-3 text-neutral-400" />
                  <span className="text-xs text-neutral-400">{s.label}</span>
                </div>
                <p className="text-base font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-neutral-400" />
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="text-xs border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-neutral-400 bg-white"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400 w-44"
                placeholder="이름 검색..."
              />
            </div>
            {warningCount > 0 && (
              <span className="text-xs text-orange-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> 잔여 5일 미만: {warningCount}명
              </span>
            )}
          </div>

          <div className="border border-neutral-200 bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                  <th className="text-left p-3 font-medium">이름</th>
                  <th className="text-left p-3 font-medium">부서</th>
                  <th className="text-left p-3 font-medium">직급</th>
                  <th className="text-center p-3 font-medium">총 연차</th>
                  <th className="text-center p-3 font-medium">사용</th>
                  <th className="text-center p-3 font-medium">잔여</th>
                  <th className="text-center p-3 font-medium">병가</th>
                  <th className="text-center p-3 font-medium">상태</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {filteredVacations.map(v => (
                  <>
                    <tr
                      key={v.id}
                      onClick={() => setExpandedRow(expandedRow === v.id ? null : v.id)}
                      className={clsx(
                        "border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer",
                        expandedRow === v.id && "bg-neutral-50"
                      )}
                    >
                      <td className="p-3 font-medium text-sm">{v.name}</td>
                      <td className="p-3 text-neutral-500">{v.department}</td>
                      <td className="p-3 text-neutral-500">{v.position}</td>
                      <td className="p-3 text-center">{v.totalAnnual}일</td>
                      <td className="p-3 text-center">{v.usedAnnual}일</td>
                      <td className={clsx("p-3 text-center font-medium", v.remainAnnual < 5 ? "text-orange-500" : "text-neutral-900")}>
                        {v.remainAnnual}일
                      </td>
                      <td className="p-3 text-center text-neutral-500">{v.sickUsed}/{v.sickTotal}</td>
                      <td className="p-3 text-center">
                        <span className={clsx(
                          "text-xs px-2 py-0.5 rounded font-medium",
                          v.status === "주의" ? "bg-orange-50 text-orange-500" : "bg-green-50 text-green-600"
                        )}>{v.status}</span>
                      </td>
                      <td className="p-3 text-center">
                        {expandedRow === v.id
                          ? <ChevronUp className="h-3 w-3 text-neutral-400 inline" />
                          : <ChevronDown className="h-3 w-3 text-neutral-400 inline" />
                        }
                      </td>
                    </tr>
                    {expandedRow === v.id && (
                      <tr key={`${v.id}-detail`}>
                        <td colSpan={9} className="bg-neutral-50 p-0">
                          <div className="px-6 py-3">
                            <p className="text-xs text-neutral-400 mb-2 font-medium">휴가 사용 내역</p>
                            {v.history.length > 0 ? (
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-xs text-neutral-400">
                                    <th className="text-left pb-1.5 font-medium">날짜</th>
                                    <th className="text-left pb-1.5 font-medium">유형</th>
                                    <th className="text-center pb-1.5 font-medium">일수</th>
                                    <th className="text-center pb-1.5 font-medium">상태</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {v.history.map((h, i) => (
                                    <tr key={i} className="border-t border-neutral-100">
                                      <td className="py-1.5 text-neutral-600">{h.date}</td>
                                      <td className="py-1.5">
                                        <span className={clsx("text-xs px-1.5 py-0.5 rounded", typeColor[h.type])}>{h.type}</span>
                                      </td>
                                      <td className="py-1.5 text-center">{h.days}일</td>
                                      <td className="py-1.5 text-center">
                                        <span className={clsx(
                                          "text-xs px-1.5 py-0.5 rounded",
                                          h.status === "사용완료" ? "bg-neutral-100 text-neutral-500" : "bg-green-50 text-green-600"
                                        )}>{h.status}</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-xs text-neutral-400">사용 내역이 없습니다.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Tab 3: 휴가 신청 ── */}
      {tab === "requests" && (
        <>
          {/* Pending */}
          <div className="border border-neutral-200 bg-white mb-6">
            <div className="flex items-center justify-between p-3 border-b border-neutral-100">
              <h2 className="text-xs font-semibold">승인 대기 ({pendingRequests.length}건)</h2>
            </div>
            {pendingRequests.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                    <th className="text-left p-3 font-medium">신청자</th>
                    <th className="text-left p-3 font-medium">부서</th>
                    <th className="text-center p-3 font-medium">유형</th>
                    <th className="text-left p-3 font-medium">기간</th>
                    <th className="text-center p-3 font-medium">일수</th>
                    <th className="text-left p-3 font-medium">사유</th>
                    <th className="text-left p-3 font-medium">신청일</th>
                    <th className="text-center p-3 font-medium">상태</th>
                    <th className="text-center p-3 font-medium">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map(r => (
                    <tr key={r.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                      <td className="p-3 font-medium text-sm">{r.name}</td>
                      <td className="p-3 text-neutral-500">{r.department}</td>
                      <td className="p-3 text-center">
                        <span className={clsx("text-xs px-2 py-0.5 rounded font-medium", typeColor[r.type])}>{r.type}</span>
                      </td>
                      <td className="p-3 text-neutral-600">
                        {r.startDate === r.endDate ? r.startDate : `${r.startDate} ~ ${r.endDate}`}
                      </td>
                      <td className="p-3 text-center">{r.days}일</td>
                      <td className="p-3 text-neutral-500">{r.reason}</td>
                      <td className="p-3 text-neutral-400">{r.requestDate}</td>
                      <td className="p-3 text-center">
                        <span className={clsx("text-xs px-2 py-0.5 rounded font-medium", reqStatusColor[r.status])}>{r.status}</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="text-xs px-2.5 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors font-medium"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors font-medium"
                          >
                            반려
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-xs text-neutral-400">
                대기 중인 신청이 없습니다.
              </div>
            )}
          </div>

          {/* Note */}
          <div className="bg-blue-50 border border-blue-100 px-4 py-3 mb-6 text-xs text-blue-600 flex items-start gap-2">
            <CalendarCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>승인된 휴가는 Townity &gt; 전체 일정에 자동으로 표시됩니다.</span>
          </div>

          {/* History */}
          <div className="border border-neutral-200 bg-white">
            <div className="p-3 border-b border-neutral-100">
              <h2 className="text-xs font-semibold">처리 완료 내역</h2>
            </div>
            {historyRequests.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                    <th className="text-left p-3 font-medium">신청자</th>
                    <th className="text-left p-3 font-medium">부서</th>
                    <th className="text-center p-3 font-medium">유형</th>
                    <th className="text-left p-3 font-medium">기간</th>
                    <th className="text-center p-3 font-medium">일수</th>
                    <th className="text-left p-3 font-medium">사유</th>
                    <th className="text-center p-3 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRequests.map(r => (
                    <tr key={r.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                      <td className="p-3 font-medium text-sm">{r.name}</td>
                      <td className="p-3 text-neutral-500">{r.department}</td>
                      <td className="p-3 text-center">
                        <span className={clsx("text-xs px-2 py-0.5 rounded font-medium", typeColor[r.type])}>{r.type}</span>
                      </td>
                      <td className="p-3 text-neutral-600">
                        {r.startDate === r.endDate ? r.startDate : `${r.startDate} ~ ${r.endDate}`}
                      </td>
                      <td className="p-3 text-center">{r.days}일</td>
                      <td className="p-3 text-neutral-500">{r.reason}</td>
                      <td className="p-3 text-center">
                        <span className={clsx("text-xs px-2 py-0.5 rounded font-medium", reqStatusColor[r.status])}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-xs text-neutral-400">
                처리된 내역이 없습니다.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
