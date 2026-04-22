"use client";

import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Role { id: string; member_id: string; role: string; context: Record<string, unknown> | null; valid_from: string; }

export default function YouInOneApplicationsPage() {
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState<Role[]>([]);

    useEffect(() => {
        createClient().from("member_capability_roles")
            .select("id, member_id, role, context, valid_from")
            .eq("brand_id", "youinone")
            .eq("capability_key", "membership")
            .eq("role", "applicant")
            .is("valid_until", null)
            .order("valid_from", { ascending: false })
            .limit(100)
            .then(res => { setPending((res.data ?? []) as Role[]); setLoading(false); });
    }, []);

    const handleApprove = async (id: string, memberId: string) => {
        const sb = createClient();
        const today = new Date().toISOString();
        await sb.from("member_capability_roles").update({ valid_until: today }).eq("id", id);
        await sb.from("member_capability_roles").insert({
            member_id: memberId, brand_id: "youinone", capability_key: "membership", role: "approved_member",
        });
        setPending(prev => prev.filter(r => r.id !== id));
    };

    const handleReject = async (id: string) => {
        const today = new Date().toISOString();
        await createClient().from("member_capability_roles").update({ valid_until: today }).eq("id", id);
        setPending(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-lg font-bold">심사 관리</h1>
                <p className="text-sm text-neutral-400 mt-0.5">YouInOne 크루 신청 심사 · 승인</p>
            </div>
            <div className="border border-neutral-200 rounded-lg p-4 mb-6">
                <p className="text-xs text-neutral-400 mb-1">심사 대기</p>
                <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
            </div>
            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : pending.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <ClipboardList className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">대기 중인 신청 없음</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pending.map(r => (
                        <div key={r.id} className="border border-neutral-200 rounded-lg p-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-neutral-800">회원 ID: {r.member_id.slice(0, 8)}…</p>
                                <p className="text-xs text-neutral-400 mt-0.5">신청일: {new Date(r.valid_from).toLocaleDateString("ko-KR")}</p>
                                {r.context && <p className="text-xs text-neutral-500 mt-1">{JSON.stringify(r.context)}</p>}
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => handleApprove(r.id, r.member_id)}
                                    className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition">승인</button>
                                <button onClick={() => handleReject(r.id)}
                                    className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 transition">거절</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
