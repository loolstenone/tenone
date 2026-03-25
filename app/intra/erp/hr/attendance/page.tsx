"use client";

import { useState, useEffect } from "react";
import {
  CalendarCheck, Clock, Users, AlertTriangle, Search,
  CheckCircle2, ChevronDown, ChevronUp, Filter, Palmtree, UserCheck,
} from "lucide-react";
import clsx from "clsx";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader, StatCard, Card, Spinner } from "@/components/intra/IntraUI";
import { useAuth } from "@/lib/auth-context";

/* ── Types ── */
type AttendanceStatus = "정상" | "지각" | "결근" | "재택" | "휴가";

interface AttendanceRecord {
  name: string;
  department: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
}

const statusColor: Record<AttendanceStatus, string> = {
  "정상": "bg-green-50 text-green-600",
  "지각": "bg-yellow-50 text-yellow-600",
  "결근": "bg-red-50 text-red-600",
  "재택": "bg-blue-50 text-blue-600",
  "휴가": "bg-violet-50 text-violet-600",
};

function mapDbStatus(type: string | null): AttendanceStatus {
  if (!type) return "정상";
  const map: Record<string, AttendanceStatus> = {
    normal: "정상", late: "지각", absent: "결근", remote: "재택", vacation: "휴가",
    "정상": "정상", "지각": "지각", "결근": "결근", "재택": "재택", "휴가": "휴가",
  };
  return map[type] || "정상";
}

/* ── Component ── */
export default function AttendancePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"attendance" | "vacation">("attendance");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    erpDb.fetchAttendance({ memberId: user.id, from: today, to: today })
      .then((data) => {
        setRecords(data.map((a: Record<string, unknown>) => ({
          name: (a.member_name as string) || user.name || '',
          department: (a.department as string) || '',
          checkIn: (a.check_in as string) || '-',
          checkOut: (a.check_out as string) || '-',
          status: mapDbStatus(a.type as string | null),
        })));
      })
      .catch(() => {
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, [user?.id, user?.name]);

  const present = records.filter(r => r.status === "정상").length;
  const absent = records.filter(r => r.status === "결근" || r.status === "지각").length;
  const remote = records.filter(r => r.status === "재택").length;
  const onVacation = records.filter(r => r.status === "휴가").length;

  const filteredAttendance = records.filter(r => {
    return !search || r.name.includes(search) || r.department.includes(search);
  });

  if (loading) return <div className="max-w-6xl"><Spinner /></div>;

  return (
    <div className="max-w-6xl">
      <PageHeader title="근태관리" description="출퇴근 · 휴가 관리" />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-6">
        {([
          ["attendance", "출퇴근 현황"],
          ["vacation", "휴가 관리"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key as typeof tab); setSearch(""); }}
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
            <StatCard label="출근" value={`${present}명`} icon={<CheckCircle2 className="h-3 w-3 text-green-500" />} />
            <StatCard label="미출근" value={`${absent}명`} icon={<AlertTriangle className="h-3 w-3 text-red-400" />} />
            <StatCard label="재택" value={`${remote}명`} icon={<Users className="h-3 w-3 text-blue-400" />} />
            <StatCard label="휴가" value={`${onVacation}명`} icon={<Palmtree className="h-3 w-3 text-violet-400" />} />
          </div>

          <Card padding={false}>
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
                {filteredAttendance.map((r, idx) => (
                  <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="p-3 font-medium text-sm">{r.name}</td>
                    <td className="p-3 text-neutral-500">{r.department}</td>
                    <td className="p-3 text-neutral-600">{r.checkIn}</td>
                    <td className="p-3 text-neutral-600">{r.checkOut}</td>
                    <td className="p-3 text-center">
                      <span className={clsx("text-xs px-2 py-0.5 rounded font-medium", statusColor[r.status])}>{r.status}</span>
                    </td>
                  </tr>
                ))}
                {filteredAttendance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-neutral-400">
                      데이터가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* ── Tab 2: 휴가 관리 ── */}
      {tab === "vacation" && (
        <Card>
          <div className="py-12 text-center text-sm text-neutral-400">
            데이터가 없습니다
          </div>
        </Card>
      )}
    </div>
  );
}
