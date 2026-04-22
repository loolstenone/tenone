"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react";
import { Card, SectionTitle } from "@/components/intra/IntraUI";

interface Application {
    id: string; name: string; email: string; phone: string | null;
    university: string; major: string | null; year_in_school: number | null;
    motivation: string | null; portfolio_url: string | null;
    status: string; created_at: string;
    mad_clubs?: { slug: string; name: string; region: string; color: string | null } | null;
}

interface HeroApp {
    id: string; name: string; email: string; phone: string | null;
    interests: string[] | null; resume_url: string | null;
    portfolio_url: string | null; message: string | null;
    status: string; created_at: string;
}

type Tab = "applications" | "hero";

export default function MADLeagueApplicationsPage() {
    const [token, setToken] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>("applications");
    const [apps, setApps] = useState<Application[]>([]);
    const [heroApps, setHeroApps] = useState<HeroApp[]>([]);
    const [statusFilter, setStatusFilter] = useState("pending");
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        const { createClient } = require("@/lib/supabase/client");
        createClient().auth.getSession().then(({ data: { session } }: { data: { session: { access_token?: string } | null } }) => {
            if (session?.access_token) setToken(session.access_token);
        });
    }, []);

    const loadApps = useCallback(async (status: string) => {
        if (!token) return;
        setLoading(true);
        const res = await fetch(`/api/madleague/admin/applications?status=${status}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setApps(data.applications ?? []);
        setLoading(false);
    }, [token]);

    const loadHero = useCallback(async (status: string) => {
        if (!token) return;
        setLoading(true);
        const res = await fetch(`/api/madleague/admin/hero?status=${status}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setHeroApps(data.applications ?? []);
        setLoading(false);
    }, [token]);

    useEffect(() => {
        if (!token) return;
        if (tab === "applications") loadApps(statusFilter);
        else loadHero(statusFilter);
    }, [tab, statusFilter, token, loadApps, loadHero]);

    async function actApp(id: string, action: "accept" | "reject" | "reviewing") {
        if (!token) return;
        setProcessing(id);
        await fetch("/api/madleague/admin/applications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, action }),
        });
        setApps(prev => prev.filter(a => a.id !== id));
        setProcessing(null);
    }

    async function actHero(id: string, status: string) {
        if (!token) return;
        setProcessing(id);
        await fetch("/api/madleague/admin/hero", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, status }),
        });
        setHeroApps(prev => prev.filter(a => a.id !== id));
        setProcessing(null);
    }

    const STATUS_OPTIONS = ["pending", "reviewing", "accepted", "rejected"];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">심사 관리</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">MAD League 지원서 · HeRo 상담 신청 처리</p>
                </div>
            </div>

            {/* 타입 전환 */}
            <div className="flex items-center gap-1 mb-4">
                {(["applications", "hero"] as Tab[]).map(t => (
                    <button key={t} onClick={() => { setTab(t); setStatusFilter("pending"); }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${tab === t ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                        {t === "applications" ? "가입 지원서" : "HeRo 상담 신청"}
                    </button>
                ))}
                <div className="ml-auto flex gap-1">
                    {STATUS_OPTIONS.map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 text-xs rounded transition ${statusFilter === s ? "bg-neutral-900 text-white" : "border border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                            {s === "pending" ? "대기" : s === "reviewing" ? "검토중" : s === "accepted" ? "승인" : "반려"}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : tab === "applications" ? (
                <Card>
                    <SectionTitle title={`지원서 (${apps.length}건)`} />
                    {apps.length === 0 ? (
                        <div className="text-center py-10 text-sm text-neutral-400">해당 상태의 지원서가 없습니다.</div>
                    ) : (
                        <div className="space-y-3">
                            {apps.map(a => (
                                <div key={a.id} className="border border-neutral-200 p-4 rounded">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {a.mad_clubs && (
                                                    <span className="text-xs font-medium px-2 py-0.5 border rounded"
                                                        style={{ borderColor: a.mad_clubs.color ?? "#EC1D25", color: a.mad_clubs.color ?? "#EC1D25" }}>
                                                        {a.mad_clubs.name}
                                                    </span>
                                                )}
                                                <span className="text-xs text-neutral-400">{new Date(a.created_at).toLocaleDateString("ko-KR")}</span>
                                            </div>
                                            <div className="text-base font-semibold text-neutral-900">{a.name}</div>
                                            <div className="text-sm text-neutral-600 mt-0.5">
                                                {a.university}{a.major && ` · ${a.major}`}{a.year_in_school && ` · ${a.year_in_school}학년`}
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-1">{a.email}{a.phone && ` · ${a.phone}`}</div>
                                            {a.motivation && (
                                                <div className="mt-3 text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded">{a.motivation}</div>
                                            )}
                                            {a.portfolio_url && (
                                                <a href={a.portfolio_url} target="_blank" rel="noopener noreferrer"
                                                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                    포트폴리오 <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                        {statusFilter === "pending" && (
                                            <div className="flex flex-col gap-2 shrink-0">
                                                <button disabled={processing === a.id} onClick={() => actApp(a.id, "accept")}
                                                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white rounded transition">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> 승인
                                                </button>
                                                <button disabled={processing === a.id} onClick={() => actApp(a.id, "reject")}
                                                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-2 border border-neutral-300 hover:border-red-500 hover:text-red-600 text-neutral-600 rounded transition">
                                                    <XCircle className="h-3.5 w-3.5" /> 반려
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            ) : (
                <Card>
                    <SectionTitle title={`HeRo 상담 신청 (${heroApps.length}건)`} />
                    {heroApps.length === 0 ? (
                        <div className="text-center py-10 text-sm text-neutral-400">해당 상태의 신청이 없습니다.</div>
                    ) : (
                        <div className="space-y-3">
                            {heroApps.map(h => (
                                <div key={h.id} className="border border-neutral-200 p-4 rounded">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="text-base font-semibold text-neutral-900">{h.name}</div>
                                            <div className="text-xs text-neutral-500 mt-0.5">
                                                {h.email}{h.phone && ` · ${h.phone}`} · {new Date(h.created_at).toLocaleDateString("ko-KR")}
                                            </div>
                                            {h.interests && h.interests.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {h.interests.map(tag => (
                                                        <span key={tag} className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {h.message && <div className="mt-3 text-sm text-neutral-700 bg-neutral-50 p-3 rounded">{h.message}</div>}
                                            <div className="mt-2 flex gap-3">
                                                {h.resume_url && <a href={h.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">이력서 ↗</a>}
                                                {h.portfolio_url && <a href={h.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">포트폴리오 ↗</a>}
                                            </div>
                                        </div>
                                        {statusFilter === "pending" && (
                                            <div className="flex flex-col gap-2 shrink-0">
                                                {["contacted", "matched", "closed"].map(s => (
                                                    <button key={s} disabled={processing === h.id} onClick={() => actHero(h.id, s)}
                                                        className={`text-xs font-medium px-3 py-2 rounded transition ${
                                                            s === "matched" ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                                                            s === "contacted" ? "bg-amber-500 hover:bg-amber-600 text-white" :
                                                            "border border-neutral-300 hover:border-red-500 hover:text-red-600 text-neutral-600"
                                                        } disabled:opacity-50`}>
                                                        {s === "matched" ? "매칭 완료" : s === "contacted" ? "연락함" : "종료"}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
