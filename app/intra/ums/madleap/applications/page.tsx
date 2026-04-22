"use client";

import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Application { id: string; name: string; email: string; university: string | null; major: string | null; cohort: string | null; status: string; created_at: string; }

const STATUS_MAP: Record<string, { l: string; c: string }> = {
    pending:  { l: "대기",   c: "bg-amber-50 text-amber-700" },
    accepted: { l: "승인",   c: "bg-emerald-50 text-emerald-700" },
    rejected: { l: "거절",   c: "bg-red-50 text-red-600" },
    reviewing:{ l: "검토 중", c: "bg-blue-50 text-blue-700" },
};

export default function MadleapApplicationsPage() {
    const [loading, setLoading] = useState(true);
    const [apps, setApps] = useState<Application[]>([]);
    const [filter, setFilter] = useState("pending");

    useEffect(() => {
        createClient().from("mad_applications")
            .select("id, name, email, university, major, cohort, status, created_at")
            .eq("brand_id", "madleap")
            .order("created_at", { ascending: false })
            .limit(300)
            .then(res => { setApps((res.data ?? []) as Application[]); setLoading(false); });
    }, []);

    const handleAction = async (id: string, newStatus: string) => {
        await createClient().from("mad_applications").update({ status: newStatus }).eq("id", id);
        setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    };

    const filtered = apps.filter(a => filter === "all" || a.status === filter);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-lg font-bold">심사 관리</h1>
                <p className="text-sm text-neutral-400 mt-0.5">MADLeap 가입 신청 심사 · 승인</p>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-6">
                {[{ l: "대기", k: "pending", c: "text-amber-600" }, { l: "검토 중", k: "reviewing", c: "text-blue-600" }, { l: "승인", k: "accepted", c: "text-emerald-600" }, { l: "거절", k: "rejected", c: "text-red-500" }].map(({ l, k, c }) => (
                    <div key={k} className="border border-neutral-200 rounded-lg p-3">
                        <p className="text-xs text-neutral-400 mb-1">{l}</p>
                        <p className={`text-xl font-bold ${c}`}>{apps.filter(a => a.status === k).length}</p>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mb-4">
                {[{ l: "대기", v: "pending" }, { l: "검토 중", v: "reviewing" }, { l: "승인", v: "accepted" }, { l: "거절", v: "rejected" }, { l: "전체", v: "all" }].map(({ l, v }) => (
                    <button key={v} onClick={() => setFilter(v)}
                        className={`text-xs px-3 py-1.5 border rounded transition ${filter === v ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                        {l}
                    </button>
                ))}
            </div>
            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <ClipboardList className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">신청 내역 없음</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(a => {
                        const s = STATUS_MAP[a.status] ?? { l: a.status, c: "bg-neutral-100 text-neutral-500" };
                        return (
                            <div key={a.id} className="border border-neutral-200 rounded-lg p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-semibold">{a.name}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${s.c}`}>{s.l}</span>
                                        </div>
                                        <p className="text-xs text-neutral-500">{a.email}</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">{[a.university, a.major, a.cohort].filter(Boolean).join(" · ")}</p>
                                    </div>
                                    {a.status === "pending" && (
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => handleAction(a.id, "reviewing")}
                                                className="text-xs px-3 py-1.5 border border-blue-200 text-blue-600 rounded hover:bg-blue-50 transition">검토</button>
                                            <button onClick={() => handleAction(a.id, "accepted")}
                                                className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition">승인</button>
                                            <button onClick={() => handleAction(a.id, "rejected")}
                                                className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 transition">거절</button>
                                        </div>
                                    )}
                                    {a.status === "reviewing" && (
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => handleAction(a.id, "accepted")}
                                                className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition">승인</button>
                                            <button onClick={() => handleAction(a.id, "rejected")}
                                                className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 transition">거절</button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-neutral-300 mt-2">{new Date(a.created_at).toLocaleDateString("ko-KR")}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
