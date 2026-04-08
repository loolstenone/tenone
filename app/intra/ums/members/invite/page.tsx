"use client";

import { useState, useEffect } from "react";
import { Send, Mail, CheckCircle2, Clock, XCircle, RefreshCw, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";

const BRAND_CONFIG = {
    madleague: {
        label: "MAD League",
        color: "bg-violet-600",
        badge: "bg-violet-100 text-violet-700",
        logoText: "MAD League",
        defaultMessage: "MAD League OB 커뮤니티에 초대합니다. 아래 링크를 통해 가입해 주세요.",
    },
    madleap: {
        label: "MADLeap",
        color: "bg-indigo-600",
        badge: "bg-indigo-100 text-indigo-700",
        logoText: "MADLeap",
        defaultMessage: "MADLeap OB 커뮤니티에 초대합니다. 아래 링크를 통해 가입해 주세요.",
    },
} as const;

type Brand = keyof typeof BRAND_CONFIG;

interface Invite {
    id: string;
    email: string;
    name: string | null;
    brand: Brand;
    status: "pending" | "accepted" | "expired";
    invited_at: string;
    accepted_at: string | null;
    expires_at: string;
}

const StatusBadge = ({ status }: { status: Invite["status"] }) => {
    if (status === "accepted") return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            <CheckCircle2 size={11} /> 수락됨
        </span>
    );
    if (status === "expired") return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
            <XCircle size={11} /> 만료
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            <Clock size={11} /> 대기중
        </span>
    );
};

export default function MemberInvitePage() {
    const supabase = createClient();

    // 폼 상태
    const [brand, setBrand] = useState<Brand>("madleague");
    const [emails, setEmails] = useState("");
    const [message, setMessage] = useState(BRAND_CONFIG.madleague.defaultMessage);
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ ok: number; fail: number } | null>(null);

    // 목록 상태
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterBrand, setFilterBrand] = useState<Brand | "all">("all");
    const [filterStatus, setFilterStatus] = useState<Invite["status"] | "all">("all");

    const fetchInvites = async () => {
        setLoading(true);
        let q = supabase
            .from("member_invites")
            .select("id, email, name, brand, status, invited_at, accepted_at, expires_at")
            .order("invited_at", { ascending: false })
            .limit(100);
        if (filterBrand !== "all") q = q.eq("brand", filterBrand);
        if (filterStatus !== "all") q = q.eq("status", filterStatus);
        const { data } = await q;
        setInvites((data as Invite[]) || []);
        setLoading(false);
    };

    useEffect(() => { fetchInvites(); }, [filterBrand, filterStatus]);

    const handleBrandChange = (b: Brand) => {
        setBrand(b);
        setMessage(BRAND_CONFIG[b].defaultMessage);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const list = emails.split(/[\n,]/).map(s => s.trim()).filter(s => s.includes("@"));
        if (!list.length) return;
        setSending(true);
        setSendResult(null);

        const res = await fetch("/api/ums/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails: list, brand, message }),
        });
        const data = await res.json();
        setSendResult(data);
        setEmails("");
        setSending(false);
        fetchInvites();
    };

    const handleResend = async (invite: Invite) => {
        await fetch("/api/ums/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails: [invite.email], brand: invite.brand, message }),
        });
        fetchInvites();
    };

    const cfg = BRAND_CONFIG[brand];
    const filtered = invites.filter(i =>
        (filterBrand === "all" || i.brand === filterBrand) &&
        (filterStatus === "all" || i.status === filterStatus)
    );

    return (
        <div className="space-y-6">
            <PageHeader title="회원 초대" subtitle="MAD League · MADLeap OB를 초대합니다" />

            {/* 초대 폼 */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Plus size={16} className="text-neutral-400" />
                    <h2 className="text-sm font-semibold text-neutral-800">새 초대 발송</h2>
                </div>

                <form onSubmit={handleSend} className="space-y-4">
                    {/* 브랜드 선택 */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-2">브랜드</label>
                        <div className="flex gap-2">
                            {(Object.keys(BRAND_CONFIG) as Brand[]).map(b => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => handleBrandChange(b)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                        brand === b
                                            ? `${BRAND_CONFIG[b].color} text-white border-transparent`
                                            : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                                    }`}
                                >
                                    {BRAND_CONFIG[b].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 이메일 */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                            이메일 <span className="text-neutral-400 font-normal">(여러 명은 줄바꿈 또는 쉼표로 구분)</span>
                        </label>
                        <textarea
                            value={emails}
                            onChange={e => setEmails(e.target.value)}
                            placeholder={"hong@example.com\nkim@example.com"}
                            rows={3}
                            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 resize-none font-mono"
                        />
                    </div>

                    {/* 메시지 */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">초대 메시지</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={2}
                            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        {sendResult && (
                            <p className="text-sm text-neutral-600">
                                <span className="text-green-600 font-medium">{sendResult.ok}건</span> 발송 완료
                                {sendResult.fail > 0 && <span className="text-red-500 ml-2">{sendResult.fail}건 실패</span>}
                            </p>
                        )}
                        <div className="ml-auto">
                            <button
                                type="submit"
                                disabled={sending || !emails.trim()}
                                className="flex items-center gap-2 px-5 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-700 disabled:opacity-40 transition-all"
                            >
                                {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                                {sending ? "발송 중..." : "초대 발송"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* 초대 현황 */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Mail size={15} className="text-neutral-400" />
                        <h2 className="text-sm font-semibold text-neutral-800">발송 현황</h2>
                        <span className="text-xs text-neutral-400">({filtered.length}건)</span>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterBrand}
                            onChange={e => setFilterBrand(e.target.value as Brand | "all")}
                            className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none"
                        >
                            <option value="all">전체 브랜드</option>
                            <option value="madleague">MAD League</option>
                            <option value="madleap">MADLeap</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as Invite["status"] | "all")}
                            className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none"
                        >
                            <option value="all">전체 상태</option>
                            <option value="pending">대기중</option>
                            <option value="accepted">수락됨</option>
                            <option value="expired">만료</option>
                        </select>
                        <button onClick={fetchInvites} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
                            <RefreshCw size={13} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-sm text-neutral-400">불러오는 중...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-sm text-neutral-400">초대 내역이 없습니다</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500">이메일</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">브랜드</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">상태</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">발송일</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">만료일</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {filtered.map(inv => {
                                const bc = BRAND_CONFIG[inv.brand];
                                return (
                                    <tr key={inv.id} className="hover:bg-neutral-50/50">
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-neutral-800">{inv.email}</div>
                                            {inv.name && <div className="text-xs text-neutral-400">{inv.name}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bc.badge}`}>
                                                {bc.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={inv.status} />
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">
                                            {new Date(inv.invited_at).toLocaleDateString("ko-KR")}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">
                                            {new Date(inv.expires_at).toLocaleDateString("ko-KR")}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {inv.status === "pending" && (
                                                <button
                                                    onClick={() => handleResend(inv)}
                                                    className="text-xs text-neutral-400 hover:text-neutral-700 flex items-center gap-1 ml-auto"
                                                >
                                                    <RefreshCw size={11} /> 재발송
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
