"use client";

import { useState, useEffect } from "react";
import { UserPlus, Users, Trash2, ArrowRightCircle, AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";

/* ── 타입 ── */
interface StatItem { label: string; value: string; icon: React.ComponentType<{ className?: string }> }
interface GuestRow {
    id: string; name: string; contact: string; brand: string;
    purpose: string; marketing: boolean; created: string; autoDelete: string;
}

/* 데이터가 없으면 0 — 목업을 실제처럼 보이게 두지 않는다 (2026-10-10 통합 관리 점검) */
const EMPTY_STATS: StatItem[] = [
    { label: "전체 게스트", value: "0명", icon: UserPlus },
    { label: "삭제 예정 (7일 이내)", value: "0명", icon: Trash2 },
    { label: "회원 전환율", value: "-", icon: ArrowRightCircle },
];

const brandColor: Record<string, string> = {
    MADLeague: "bg-violet-100 text-violet-700", MADLeap: "bg-indigo-100 text-indigo-700",
    ChangeUp: "bg-lime-100 text-lime-700", Badak: "bg-amber-100 text-amber-700",
    "Evolution School": "bg-orange-100 text-orange-700", SmarComm: "bg-emerald-100 text-emerald-700",
    HeRo: "bg-rose-100 text-rose-700", Mindle: "bg-cyan-100 text-cyan-700",
    "Planner's": "bg-teal-100 text-teal-700", RooK: "bg-pink-100 text-pink-700",
};

export default function UniverseGuests() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatItem[]>(EMPTY_STATS);
    const [guests, setGuests] = useState<GuestRow[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const supabase = createClient();

                const { data: rawGuests, error } = await supabase
                    .from("guests")
                    .select("id, name, contact, brand, purpose, marketing_consent, created_at, auto_delete_at")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                if (!rawGuests || rawGuests.length === 0) {
                    setLoading(false);
                    return;
                }

                const now = new Date();
                const guestList: GuestRow[] = rawGuests.map((g: {
                    id: string; name: string; contact: string; brand: string;
                    purpose: string; marketing_consent: boolean;
                    created_at: string; auto_delete_at: string;
                }) => ({
                    id: g.id,
                    name: g.name || "-",
                    contact: g.contact || "-",
                    brand: g.brand || "-",
                    purpose: g.purpose || "-",
                    marketing: g.marketing_consent ?? false,
                    created: g.created_at?.split("T")[0] || "-",
                    autoDelete: g.auto_delete_at?.split("T")[0] || "-",
                }));

                // 7일 이내 삭제 예정
                const soonDelete = guestList.filter((g) => {
                    const deleteDate = new Date(g.autoDelete);
                    const diff = (deleteDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                    return diff >= 0 && diff <= 7;
                });

                setStats([
                    { label: "전체 게스트", value: `${guestList.length}명`, icon: UserPlus },
                    { label: "삭제 예정 (7일 이내)", value: `${soonDelete.length}명`, icon: Trash2 },
                    { label: "회원 전환율", value: "-", icon: ArrowRightCircle }, // 게스트→회원 연결 기록이 생기면 계산
                ]);

                setGuests(guestList);
            } catch (err) {
                console.error("Guests fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // 7일 이내 자동삭제 대상
    const aboutToDelete = guests.filter((g) => {
        const deleteDate = new Date(g.autoDelete);
        const now = new Date();
        const diff = (deleteDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title="게스트 관리" description="비회원 게스트 관리 및 자동삭제" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <s.icon className="h-4 w-4 text-neutral-400 mb-2" />
                        <p className="text-lg font-bold text-neutral-900">{s.value}</p>
                        <p className="text-[11px] text-neutral-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Auto-delete warning */}
            {aboutToDelete.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <h3 className="text-sm font-medium text-amber-800">자동삭제 예정 ({aboutToDelete.length}명)</h3>
                    </div>
                    <p className="text-xs text-amber-700 mb-3">7일 이내에 자동 삭제될 게스트입니다. 회원 전환이 필요한 경우 조치하세요.</p>
                    <div className="space-y-1">
                        {aboutToDelete.map((g) => (
                            <div key={g.id} className="flex items-center justify-between py-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-amber-900">{g.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${brandColor[g.brand] || "bg-neutral-100 text-neutral-600"}`}>{g.brand}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-amber-600">삭제일: {g.autoDelete}</span>
                                    <button className="text-[10px] px-2 py-0.5 bg-amber-600 text-white rounded hover:bg-amber-700">회원 전환</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Guests Table */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">게스트 목록</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">이름</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">연락처</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">브랜드</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">목적</th>
                                    <th className="text-center px-4 py-3 text-xs font-medium text-neutral-500">마케팅 동의</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">생성일</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">자동삭제일</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">액션</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {guests.map((g) => (
                                    <tr key={g.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-neutral-900">{g.name}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{g.contact}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${brandColor[g.brand] || "bg-neutral-100 text-neutral-600"}`}>
                                                {g.brand}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-700">{g.purpose}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-[11px] ${g.marketing ? "text-green-600" : "text-neutral-400"}`}>
                                                {g.marketing ? "동의" : "미동의"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{g.created}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{g.autoDelete}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">전환</button>
                                                <button className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">삭제</button>
                                            </div>
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
