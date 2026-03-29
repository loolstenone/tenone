"use client";

import { useState, useMemo } from "react";
import { Users, Search, Filter, ChevronDown, MoreHorizontal } from "lucide-react";

/* ── Level 정의 ── */
const levels = [
    { id: 0, label: "Level 0 · 게스트", color: "bg-neutral-400", count: 234 },
    { id: 1, label: "Level 1 · 무료", color: "bg-blue-400", count: 5120 },
    { id: 2, label: "Level 2 · 활동", color: "bg-green-400", count: 2680 },
    { id: 3, label: "Level 3 · 구독", color: "bg-violet-400", count: 487 },
    { id: 4, label: "Level 4 · VIP", color: "bg-amber-400", count: 198 },
    { id: 5, label: "Level 5 · 파트너", color: "bg-rose-400", count: 528 },
];
const totalMembers = levels.reduce((s, l) => s + l.count, 0);

/* ── 브랜드 목록 ── */
const brandOptions = ["MADLeague", "MADLeap", "Badak", "SmarComm", "WIO Orbi", "HeRo", "Planner's", "Evolution School", "Mindle", "RooK", "ChangeUp", "YouInOne"];
const brandColors: Record<string, string> = {
    MADLeague: "bg-violet-100 text-violet-700",
    MADLeap: "bg-indigo-100 text-indigo-700",
    Badak: "bg-amber-100 text-amber-700",
    SmarComm: "bg-emerald-100 text-emerald-700",
    "WIO Orbi": "bg-blue-100 text-blue-700",
    HeRo: "bg-rose-100 text-rose-700",
    "Planner's": "bg-teal-100 text-teal-700",
    "Evolution School": "bg-orange-100 text-orange-700",
    Mindle: "bg-cyan-100 text-cyan-700",
    RooK: "bg-pink-100 text-pink-700",
    ChangeUp: "bg-lime-100 text-lime-700",
    YouInOne: "bg-purple-100 text-purple-700",
};

/* ── Mock Members ── */
const mockMembers = [
    { id: "1", name: "김민지", email: "minji@example.com", level: 4, brands: ["MADLeap", "SmarComm"], subs: [{ service: "SmarComm", plan: "Pro" }], lastActive: "2026-03-29", cross: null },
    { id: "2", name: "이준혁", email: "junhyuk@example.com", level: 3, brands: ["WIO Orbi"], subs: [{ service: "WIO Orbi", plan: "Business" }], lastActive: "2026-03-29", cross: "SmarComm 미구독" },
    { id: "3", name: "박서윤", email: "seoyoon@example.com", level: 3, brands: ["Evolution School", "HeRo"], subs: [{ service: "Evolution School", plan: "Standard" }], lastActive: "2026-03-28", cross: "Orbi 미구독" },
    { id: "4", name: "정하은", email: "haeun@example.com", level: 2, brands: ["Mindle"], subs: [], lastActive: "2026-03-27", cross: null },
    { id: "5", name: "최다운", email: "dawoon@example.com", level: 2, brands: ["HeRo", "Badak"], subs: [], lastActive: "2026-03-28", cross: null },
    { id: "6", name: "송예린", email: "yerin@example.com", level: 3, brands: ["Badak", "SmarComm"], subs: [{ service: "SmarComm", plan: "Starter" }], lastActive: "2026-03-26", cross: "Orbi 미구독" },
    { id: "7", name: "한도윤", email: "doyoon@example.com", level: 5, brands: ["MADLeague", "MADLeap", "SmarComm"], subs: [{ service: "SmarComm", plan: "Pro" }], lastActive: "2026-03-29", cross: null },
    { id: "8", name: "오지호", email: "jiho@example.com", level: 1, brands: ["MADLeague"], subs: [], lastActive: "2026-03-20", cross: null },
    { id: "9", name: "윤서아", email: "seoa@example.com", level: 3, brands: ["WIO Orbi", "YouInOne"], subs: [{ service: "WIO Orbi", plan: "Pro" }, { service: "YouInOne", plan: "Team" }], lastActive: "2026-03-29", cross: null },
    { id: "10", name: "임채원", email: "chaewon@example.com", level: 2, brands: ["Planner's"], subs: [], lastActive: "2026-03-25", cross: null },
    { id: "11", name: "강현우", email: "hyunwoo@example.com", level: 4, brands: ["SmarComm", "Mindle"], subs: [{ service: "SmarComm", plan: "Business" }, { service: "Mindle", plan: "Premium" }], lastActive: "2026-03-29", cross: null },
    { id: "12", name: "배소현", email: "sohyun@example.com", level: 0, brands: ["RooK"], subs: [], lastActive: "2026-03-22", cross: null },
    { id: "13", name: "신유진", email: "yujin@example.com", level: 1, brands: ["ChangeUp"], subs: [], lastActive: "2026-03-18", cross: null },
    { id: "14", name: "조민서", email: "minseo@example.com", level: 3, brands: ["Evolution School"], subs: [{ service: "Evolution School", plan: "Premium" }], lastActive: "2026-03-28", cross: "SmarComm 미구독" },
    { id: "15", name: "유하늘", email: "haneul@example.com", level: 5, brands: ["MADLeague", "SmarComm", "WIO Orbi", "HeRo"], subs: [{ service: "SmarComm", plan: "Enterprise" }, { service: "WIO Orbi", plan: "Business" }], lastActive: "2026-03-29", cross: null },
];

export default function UniverseMembers() {
    const [search, setSearch] = useState("");
    const [levelFilter, setLevelFilter] = useState<number | null>(null);
    const [brandFilter, setBrandFilter] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return mockMembers.filter((m) => {
            if (search && !m.name.includes(search) && !m.email.includes(search)) return false;
            if (levelFilter !== null && m.level !== levelFilter) return false;
            if (brandFilter && !m.brands.includes(brandFilter)) return false;
            return true;
        });
    }, [search, levelFilter, brandFilter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <Users className="h-5 w-5" /> 통합 회원
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">전체 브랜드 통합 회원 관리</p>
            </div>

            {/* Level Bar */}
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-neutral-900">Level별 분포</p>
                    <p className="text-xs text-neutral-500">전체 {totalMembers.toLocaleString()}명</p>
                </div>
                <div className="flex h-6 rounded-full overflow-hidden">
                    {levels.map((l) => (
                        <div key={l.id} className={`${l.color} relative group`}
                            style={{ width: `${(l.count / totalMembers) * 100}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {l.label}: {l.count.toLocaleString()}명
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                    {levels.map((l) => (
                        <button key={l.id} onClick={() => setLevelFilter(levelFilter === l.id ? null : l.id)}
                            className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded ${levelFilter === l.id ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                            <span className={`h-2 w-2 rounded-full ${l.color}`} />
                            Lv{l.id} ({l.count.toLocaleString()})
                        </button>
                    ))}
                </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input type="text" placeholder="이름, 이메일 검색"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400" />
                </div>
                <div className="relative">
                    <select value={brandFilter || ""} onChange={(e) => setBrandFilter(e.target.value || null)}
                        className="appearance-none pl-3 pr-8 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 bg-white">
                        <option value="">브랜드 전체</option>
                        {brandOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                </div>
                {(levelFilter !== null || brandFilter || search) && (
                    <button onClick={() => { setLevelFilter(null); setBrandFilter(null); setSearch(""); }}
                        className="text-xs text-neutral-500 hover:text-neutral-700 px-3 py-2 border border-neutral-200 rounded-lg">
                        <Filter className="h-3.5 w-3.5 inline mr-1" />초기화
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50">
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">이름</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">이메일</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">Level</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">소속 브랜드</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">구독</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">마지막 활동</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {filtered.map((m) => (
                                <tr key={m.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-[10px] font-medium shrink-0">
                                                {m.name[0]}
                                            </div>
                                            <span className="font-medium text-neutral-900">{m.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500 text-xs">{m.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
                                            m.level >= 4 ? "bg-amber-100 text-amber-700" :
                                            m.level === 3 ? "bg-violet-100 text-violet-700" :
                                            m.level === 2 ? "bg-green-100 text-green-700" :
                                            m.level === 1 ? "bg-blue-100 text-blue-700" :
                                            "bg-neutral-100 text-neutral-600"
                                        }`}>
                                            Lv.{m.level}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {m.brands.map((b) => (
                                                <span key={b} className={`text-[10px] px-1.5 py-0.5 rounded ${brandColors[b] || "bg-neutral-100 text-neutral-600"}`}>
                                                    {b}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-0.5">
                                            {m.subs.length > 0 ? m.subs.map((s, i) => (
                                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                                                    {s.service} · {s.plan}
                                                </span>
                                            )) : <span className="text-[10px] text-neutral-400">-</span>}
                                            {m.cross && (
                                                <span className="text-[10px] text-orange-500">{m.cross}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-neutral-400">{m.lastActive}</td>
                                    <td className="px-4 py-3">
                                        <button className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-sm text-neutral-400">검색 결과가 없습니다</div>
                )}
            </div>
        </div>
    );
}
