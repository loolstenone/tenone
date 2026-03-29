"use client";

import { Calendar, Users, CheckCircle, XCircle, DollarSign, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/* ── 타입 ── */
interface StatItem { label: string; value: string; icon: React.ComponentType<{ className?: string }> }
interface BookingRow {
    id: string; name: string; memberType: string; brand: string;
    event: string; date: string; location: string; amount: number; status: string;
}

/* ── Mock (fallback) ── */
const mockStats: StatItem[] = [
    { label: "이번달 예약", value: "47건", icon: Calendar },
    { label: "확정", value: "38건", icon: CheckCircle },
    { label: "취소율", value: "8.5%", icon: XCircle },
    { label: "예약 매출", value: "₩3,200,000", icon: DollarSign },
];

const mockBookings: BookingRow[] = [
    { id: "1", name: "김민지", memberType: "회원", brand: "MADLeap", event: "MADLeap 5기 OT", date: "2026-04-05", location: "강남 센터", amount: 0, status: "확정" },
    { id: "2", name: "이준혁", memberType: "회원", brand: "Evolution School", event: "브랜드 전략 특강", date: "2026-04-08", location: "온라인", amount: 50000, status: "확정" },
    { id: "3", name: "박서윤", memberType: "회원", brand: "SmarComm", event: "AI 마케팅 세미나", date: "2026-04-10", location: "삼성 컨벤션", amount: 30000, status: "대기" },
    { id: "4", name: "장민호", memberType: "게스트", brand: "MADLeague", event: "DAM Party Season 4", date: "2026-04-12", location: "홍대 라운지", amount: 15000, status: "확정" },
    { id: "5", name: "최다운", memberType: "회원", brand: "HeRo", event: "커리어 멘토링 데이", date: "2026-04-15", location: "역삼 오피스", amount: 0, status: "확정" },
    { id: "6", name: "안소희", memberType: "게스트", brand: "ChangeUp", event: "스타트업 네트워킹", date: "2026-04-12", location: "판교 허브", amount: 20000, status: "대기" },
    { id: "7", name: "홍진우", memberType: "게스트", brand: "Badak", event: "CEO 라운드테이블", date: "2026-04-18", location: "강남 센터", amount: 100000, status: "확정" },
    { id: "8", name: "강현우", memberType: "회원", brand: "MADLeague", event: "DAM Party Season 4", date: "2026-04-12", location: "홍대 라운지", amount: 15000, status: "취소" },
    { id: "9", name: "나연수", memberType: "게스트", brand: "Evolution School", event: "데이터 분석 체험", date: "2026-04-20", location: "온라인", amount: 0, status: "확정" },
    { id: "10", name: "유하늘", memberType: "회원", brand: "SmarComm", event: "AI 마케팅 세미나", date: "2026-04-10", location: "삼성 컨벤션", amount: 30000, status: "완료" },
];

/* ── 상태 매핑 ── */
function mapStatus(status: string): string {
    const map: Record<string, string> = {
        confirmed: "확정", pending: "대기", cancelled: "취소",
        completed: "완료", active: "확정",
    };
    return map[status] || status;
}

const brandColor: Record<string, string> = {
    MADLeap: "bg-indigo-100 text-indigo-700",
    "Evolution School": "bg-orange-100 text-orange-700",
    SmarComm: "bg-emerald-100 text-emerald-700",
    MADLeague: "bg-violet-100 text-violet-700",
    HeRo: "bg-rose-100 text-rose-700",
    ChangeUp: "bg-lime-100 text-lime-700",
    Badak: "bg-amber-100 text-amber-700",
};

export default function UniverseBookings() {
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatItem[]>(mockStats);
    const [bookings, setBookings] = useState<BookingRow[]>(mockBookings);
    const [eventDays, setEventDays] = useState<Set<number>>(new Set([5, 8, 10, 12, 15, 18, 20]));

    useEffect(() => {
        async function loadData() {
            try {
                const supabase = createClient();

                const { data: rawBookings, error } = await supabase
                    .from("bookings")
                    .select("id, name, member_type, brand, event, event_date, location, amount, status, member_id, guest_id")
                    .order("event_date", { ascending: true });

                if (error) throw error;
                if (!rawBookings || rawBookings.length === 0) {
                    setLoading(false);
                    return;
                }

                // 예약 리스트 변환
                const bookingList: BookingRow[] = rawBookings.map((b: {
                    id: string; name: string; member_type?: string; brand: string;
                    event: string; event_date: string; location: string;
                    amount: number; status: string; member_id?: string; guest_id?: string;
                }) => ({
                    id: b.id,
                    name: b.name || "-",
                    memberType: b.member_type || (b.guest_id ? "게스트" : "회원"),
                    brand: b.brand || "-",
                    event: b.event || "-",
                    date: b.event_date?.split("T")[0] || "-",
                    location: b.location || "-",
                    amount: b.amount || 0,
                    status: mapStatus(b.status),
                }));

                // Stats 계산
                const thisMonth = new Date();
                const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
                const monthBookings = bookingList.filter((b) => new Date(b.date) >= monthStart);
                const confirmed = monthBookings.filter((b) => b.status === "확정" || b.status === "완료").length;
                const cancelled = monthBookings.filter((b) => b.status === "취소").length;
                const cancelRate = monthBookings.length > 0 ? ((cancelled / monthBookings.length) * 100).toFixed(1) : "0";
                const bookingRevenue = monthBookings.reduce((s, b) => s + b.amount, 0);

                setStats([
                    { label: "이번달 예약", value: `${monthBookings.length}건`, icon: Calendar },
                    { label: "확정", value: `${confirmed}건`, icon: CheckCircle },
                    { label: "취소율", value: `${cancelRate}%`, icon: XCircle },
                    { label: "예약 매출", value: `₩${bookingRevenue.toLocaleString()}`, icon: DollarSign },
                ]);

                // 캘린더 이벤트 날짜 (다음 달)
                const days = new Set<number>();
                bookingList.forEach((b) => {
                    const d = new Date(b.date);
                    if (d.getMonth() === thisMonth.getMonth() + 1 || d.getMonth() === thisMonth.getMonth()) {
                        days.add(d.getDate());
                    }
                });
                if (days.size > 0) setEventDays(days);

                setBookings(bookingList);
            } catch (err) {
                console.error("Bookings fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const filtered = bookings.filter((b) => !statusFilter || b.status === statusFilter);

    /* ── Mini Calendar (April 2026) ── */
    const calDays = Array.from({ length: 30 }, (_, i) => i + 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> 예약/이벤트
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">이벤트 예약 현황 및 캘린더</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bookings Table */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-neutral-900">예약 목록</h2>
                        <div className="flex gap-1">
                            {["", "대기", "확정", "취소", "완료"].map((s) => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className={`px-2.5 py-1 text-[11px] rounded ${statusFilter === s ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                                    {s || "전체"}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50">
                                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">예약자</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">유형</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">브랜드</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">이벤트</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">날짜</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500">금액</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">상태</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {filtered.map((b) => (
                                        <tr key={b.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-neutral-900">{b.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                    b.memberType === "게스트" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                                                }`}>{b.memberType}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${brandColor[b.brand] || "bg-neutral-100 text-neutral-600"}`}>
                                                    {b.brand}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-neutral-700">{b.event}</td>
                                            <td className="px-4 py-3 text-xs text-neutral-500">{b.date}</td>
                                            <td className="px-4 py-3 text-right text-neutral-700">
                                                {b.amount > 0 ? `₩${b.amount.toLocaleString()}` : "무료"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                                                    b.status === "확정" ? "bg-green-100 text-green-700" :
                                                    b.status === "대기" ? "bg-amber-100 text-amber-700" :
                                                    b.status === "완료" ? "bg-blue-100 text-blue-700" :
                                                    "bg-red-100 text-red-600"
                                                }`}>{b.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Mini Calendar */}
                <div>
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">4월 캘린더</h2>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="text-center mb-3">
                            <p className="text-sm font-medium text-neutral-900">2026년 4월</p>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-neutral-400 mb-1">
                            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                                <span key={d}>{d}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {/* April 2026 starts on Wednesday (offset 3) */}
                            {Array.from({ length: 3 }).map((_, i) => <div key={`e${i}`} />)}
                            {calDays.map((d) => (
                                <div key={d} className={`h-8 flex items-center justify-center text-xs rounded ${
                                    eventDays.has(d) ? "bg-blue-500 text-white font-medium" : "text-neutral-600 hover:bg-neutral-50"
                                }`}>{d}</div>
                            ))}
                        </div>
                        <div className="mt-3 space-y-1.5">
                            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">이벤트</p>
                            {bookings.slice(0, 5).map((b) => (
                                <div key={b.id} className="flex items-center gap-2 text-xs">
                                    <span className="text-neutral-400 w-12 shrink-0">{b.date.substring(5)}</span>
                                    <span className="text-neutral-700 truncate">{b.event}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
