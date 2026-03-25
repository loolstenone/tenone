"use client";

import { useState } from "react";
import {
  Clock,
  CalendarDays,
  Palmtree,
  LogIn,
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type LeaveStatus = "승인" | "대기" | "반려";
type DayType = "work" | "leave" | "half" | "holiday" | "weekend" | "none";

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  status: LeaveStatus;
  reason: string;
}

const leaveRequests: LeaveRequest[] = [
  { id: "l1", startDate: "2026-03-28", endDate: "2026-03-28", type: "연차", status: "대기", reason: "개인 사유" },
  { id: "l2", startDate: "2026-02-14", endDate: "2026-02-14", type: "반차", status: "승인", reason: "병원 방문" },
  { id: "l3", startDate: "2026-01-20", endDate: "2026-01-21", type: "연차", status: "승인", reason: "가족 행사" },
];

const statusStyle: Record<LeaveStatus, string> = {
  승인: "bg-green-50 text-green-600",
  대기: "bg-amber-50 text-amber-600",
  반려: "bg-red-50 text-red-600",
};

// March 2026 calendar data
const marchDays: { day: number; type: DayType }[] = (() => {
  const days: { day: number; type: DayType }[] = [];
  const leaveDays = [20, 21]; // two days used this month as example
  for (let d = 1; d <= 31; d++) {
    const date = new Date(2026, 2, d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) {
      days.push({ day: d, type: "weekend" });
    } else if (leaveDays.includes(d)) {
      days.push({ day: d, type: "leave" });
    } else if (d <= 21) {
      days.push({ day: d, type: "work" });
    } else {
      days.push({ day: d, type: "none" });
    }
  }
  return days;
})();

const dayColor: Record<DayType, string> = {
  work: "bg-neutral-700 text-white",
  leave: "bg-amber-100 text-amber-700",
  half: "bg-amber-50 text-amber-600",
  holiday: "bg-red-50 text-red-500",
  weekend: "bg-neutral-50 text-neutral-300",
  none: "bg-white text-neutral-300",
};

export default function MyAttendancePage() {
  const [clockedIn, setClockedIn] = useState(true);
  const todayIn = "08:55";
  const todayOut = "-";
  const todayStatus = "정상";

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-neutral-700" />
          <h1 className="text-base font-semibold text-neutral-800">내 근태</h1>
        </div>

        {/* Today Status */}
        <div className="mb-6 border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700">오늘</h2>
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
              {todayStatus}
            </span>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                <LogIn className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">출근</p>
                <p className="text-sm font-semibold text-neutral-800">
                  {todayIn}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
                <LogOut className="h-4 w-4 text-neutral-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">퇴근</p>
                <p className="text-sm font-semibold text-neutral-800">
                  {todayOut}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setClockedIn(!clockedIn)}
            className={`w-full rounded-md py-2 text-xs font-medium transition-colors ${
              clockedIn
                ? "bg-neutral-800 text-white hover:bg-neutral-700"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            {clockedIn ? "퇴근하기" : "출근하기"}
          </button>
        </div>

        {/* Monthly Summary */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="border border-neutral-200 bg-white p-4">
            <p className="mb-1 text-xs text-neutral-400">이번 달 근무일</p>
            <p className="text-xl font-bold text-neutral-800">14일</p>
          </div>
          <div className="border border-neutral-200 bg-white p-4">
            <p className="mb-1 text-xs text-neutral-400">평균 근무시간</p>
            <p className="text-xl font-bold text-neutral-800">9h 12m</p>
          </div>
          <div className="border border-neutral-200 bg-white p-4">
            <p className="mb-1 text-xs text-neutral-400">초과근무</p>
            <p className="text-xl font-bold text-neutral-800">4h 30m</p>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="mb-6 border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700">
              <Palmtree className="mr-1.5 inline h-4 w-4" />
              잔여 휴가
            </h2>
            <button className="flex items-center gap-1 rounded-md bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700">
              <Plus className="h-3.5 w-3.5" />
              휴가 신청
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs text-neutral-500">연차</span>
                <span className="text-xs text-neutral-400">15일 중 3일 사용</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full w-[20%] rounded-full bg-neutral-600" />
              </div>
              <p className="mt-1 text-right text-xs font-semibold text-neutral-700">
                잔여 12일
              </p>
            </div>
            <div>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs text-neutral-500">병가</span>
                <span className="text-xs text-neutral-400">3일 중 0일 사용</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full w-[0%] rounded-full bg-neutral-600" />
              </div>
              <p className="mt-1 text-right text-xs font-semibold text-neutral-700">
                잔여 3일
              </p>
            </div>
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="mb-6 border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            최근 휴가 신청
          </h2>
          <div className="space-y-2">
            {leaveRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">
                    {req.startDate === req.endDate
                      ? req.startDate
                      : `${req.startDate} ~ ${req.endDate}`}
                  </span>
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                    {req.type}
                  </span>
                  <span className="text-xs text-neutral-500">{req.reason}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[req.status]}`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Calendar */}
        <div className="border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            <CalendarDays className="mr-1.5 inline h-4 w-4" />
            2026년 3월
          </h2>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-neutral-400">
            <span>일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span>토</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* March 2026 starts on Sunday (0) */}
            {marchDays.map((d) => (
              <div
                key={d.day}
                className={`flex h-8 items-center justify-center rounded text-[11px] font-medium ${dayColor[d.type]}`}
              >
                {d.day}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded bg-neutral-700" />
              근무
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded bg-amber-100" />
              휴가
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded bg-neutral-50 border border-neutral-200" />
              주말
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
