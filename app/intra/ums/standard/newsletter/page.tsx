"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Send, Users, Gauge, ArrowRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Sender {
    id: string;
    email: string;
    name: string;
    purpose: string | null;
    is_active: boolean;
}

interface Stats {
    subscribersActive: number;
    subscribersTotal: number;
    issuesTotal: number;
    issuesSent: number;
    sends24h: number;
}

const STANDARDS = [
    { title: "발신자 표준", desc: "noreply(인증) · news(뉴스레터) · hello(마케팅) · ceo(개인)" },
    { title: "수신자 표준", desc: "newsletter_subscribers — site_id별 세분화 · bounce/complain 자동 비활성" },
    { title: "발송 표준", desc: "Resend SMTP · RFC 2047 Subject · One-Click Unsubscribe (RFC 8058)" },
    { title: "한도 표준", desc: "Free 100/일 · Pro 50k/월 · 바운스 3회 자동 비활성" },
    { title: "템플릿 표준", desc: "Ten:One 로고 상단 · 브랜드×Ten:One 듀얼 브랜딩 · 수신거부 푸터 필수" },
];

export default function NewsletterStandardPage() {
    const [loading, setLoading] = useState(true);
    const [senders, setSenders] = useState<Sender[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const [sendersRes, subsActive, subsTotal, issuesTotal, issuesSent, sends24h] = await Promise.all([
                sb.from("email_senders").select("id, email, name, purpose, is_active"),
                sb.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true),
                sb.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
                sb.from("newsletter_issues").select("*", { count: "exact", head: true }),
                sb.from("newsletter_issues").select("*", { count: "exact", head: true }).eq("status", "sent"),
                sb.from("email_sends").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 86400000).toISOString()),
            ]);
            setSenders(sendersRes.data ?? []);
            setStats({
                subscribersActive: subsActive.count ?? 0,
                subscribersTotal: subsTotal.count ?? 0,
                issuesTotal: issuesTotal.count ?? 0,
                issuesSent: issuesSent.count ?? 0,
                sends24h: sends24h.count ?? 0,
            });
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                title="News Letter 표준"
                description="유니버스 공통 발송 인프라 · 발신자 레지스트리 · 한도 정책"
            />

            {/* 스냅샷 */}
            {loading ? (
                <div className="flex items-center justify-center h-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
            ) : stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <Users className="h-4 w-4 text-violet-600 mb-1" />
                        <p className="text-lg font-bold">{stats.subscribersActive.toLocaleString()}</p>
                        <p className="text-[10px] text-neutral-500">활성 구독자</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <Mail className="h-4 w-4 text-cyan-600 mb-1" />
                        <p className="text-lg font-bold">{stats.issuesTotal.toLocaleString()}</p>
                        <p className="text-[10px] text-neutral-500">전체 이슈</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <Send className="h-4 w-4 text-emerald-600 mb-1" />
                        <p className="text-lg font-bold">{stats.issuesSent.toLocaleString()}</p>
                        <p className="text-[10px] text-neutral-500">발송됨</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <Gauge className="h-4 w-4 text-amber-600 mb-1" />
                        <p className="text-lg font-bold">{stats.sends24h.toLocaleString()}</p>
                        <p className="text-[10px] text-neutral-500">24h 발송</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <Mail className="h-4 w-4 text-blue-600 mb-1" />
                        <p className="text-lg font-bold">{senders.filter(s => s.is_active).length} / {senders.length}</p>
                        <p className="text-[10px] text-neutral-500">활성 발신자</p>
                    </div>
                </div>
            )}

            {/* 5 Standards */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">5대 표준</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {STANDARDS.map((s) => (
                        <div key={s.title} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <p className="text-xs font-semibold text-neutral-900 mb-1">{s.title}</p>
                            <p className="text-[10px] text-neutral-600 leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 발신자 레지스트리 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">발신자 레지스트리 ({senders.length})</h2>
                {senders.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">등록된 발신자가 없습니다.</div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">이름</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">이메일</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">용도</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {senders.map((s) => (
                                    <tr key={s.id} className="border-b border-neutral-100 last:border-0">
                                        <td className="px-3 py-2 font-medium text-neutral-900">{s.name}</td>
                                        <td className="px-3 py-2 font-mono text-[10px] text-neutral-700">{s.email}</td>
                                        <td className="px-3 py-2 text-neutral-500">{s.purpose || "-"}</td>
                                        <td className="px-3 py-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                                                {s.is_active ? "활성" : "정지"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 관리 링크 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/intra/ums/newsletter/issues" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">이슈 관리</p>
                    <p className="text-[10px] text-neutral-500">Mindle 발송 <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
                <Link href="/intra/ums/newsletter/subscribers" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">구독자</p>
                    <p className="text-[10px] text-neutral-500">실데이터 <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
                <Link href="/intra/ums/email/senders" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">발신자 설정</p>
                    <p className="text-[10px] text-neutral-500">CRUD <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
                <Link href="/intra/ums/email/usage" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">사용량 · 한도</p>
                    <p className="text-[10px] text-neutral-500">대시보드 <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
            </div>
        </div>
    );
}
