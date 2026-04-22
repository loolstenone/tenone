"use client";

import { useState, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Meetup { id: string; title: string; host_name: string | null; location: string | null; date: string | null; participants_count: number | null; created_at: string; }

export default function TownityMeetupsPage() {
    const [loading, setLoading] = useState(true);
    const [meetups, setMeetups] = useState<Meetup[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        createClient().from("meetups")
            .select("id, title, host_name, location, date, participants_count, created_at")
            .eq("brand_id", "townity")
            .order("created_at", { ascending: false })
            .limit(100)
            .then(res => { setMeetups((res.data ?? []) as Meetup[]); setLoading(false); });
    }, []);

    const filtered = meetups.filter(m => !search || m.title?.includes(search) || m.host_name?.includes(search) || m.location?.includes(search));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">모임 관리</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">Townity 로컬 모임 · 이벤트 관리</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="제목, 주최자, 장소..."
                        className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-52 focus:outline-none focus:border-neutral-400" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">전체 모임</p>
                    <p className="text-2xl font-bold">{meetups.length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">검색 결과</p>
                    <p className="text-2xl font-bold">{filtered.length}</p>
                </div>
            </div>
            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <MapPin className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{search ? "검색 결과 없음" : "모임이 없습니다"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-neutral-50 text-left">{["모임명","주최자","장소","날짜","참가자"].map(h => <th key={h} className="px-4 py-3 font-semibold text-neutral-500">{h}</th>)}</tr></thead>
                        <tbody>
                            {filtered.map(m => (
                                <tr key={m.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium max-w-xs truncate">{m.title || "(제목 없음)"}</td>
                                    <td className="px-4 py-3 text-neutral-500">{m.host_name || "-"}</td>
                                    <td className="px-4 py-3 text-neutral-500">{m.location || "-"}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-400">{m.date ? new Date(m.date).toLocaleDateString("ko-KR") : "-"}</td>
                                    <td className="px-4 py-3 text-neutral-500">{m.participants_count ?? 0}명</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">총 {filtered.length}건</div>
                </div>
            )}
        </div>
    );
}
