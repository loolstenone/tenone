"use client";

import { useState, useEffect } from "react";
import { FileCheck, Download, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

interface Certificate {
    id: string;
    type: string;
    description: string;
    lastIssued?: string;
    issueCount: number;
}

interface HistoryItem {
    type: string;
    date: string;
    purpose: string;
}

const CERT_TYPES: Certificate[] = [
    { id: "1", type: "재직증명서", description: "현재 재직 상태를 증명하는 서류", issueCount: 0 },
    { id: "2", type: "경력증명서", description: "재직 기간 및 업무 경력을 증명하는 서류", issueCount: 0 },
    { id: "3", type: "급여확인서", description: "월 급여 내역을 확인하는 서류", issueCount: 0 },
    { id: "4", type: "퇴직금 중간정산 확인서", description: "퇴직금 중간정산 내역 확인", issueCount: 0 },
    { id: "5", type: "원천징수영수증", description: "소득세 원천징수 내역 확인", issueCount: 0 },
    { id: "6", type: "4대보험 가입확인서", description: "국민연금, 건강보험, 고용보험, 산재보험 가입 확인", issueCount: 0 },
];

const mockHistory: HistoryItem[] = [
    { type: "재직증명서", date: "2026-01-15", purpose: "은행 제출용" },
    { type: "경력증명서", date: "2025-12-20", purpose: "외부 제출" },
    { type: "원천징수영수증", date: "2026-02-01", purpose: "연말정산" },
];

export default function CertificatesPage() {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState<Certificate[]>(CERT_TYPES);
    const [recentHistory, setRecentHistory] = useState<HistoryItem[]>(mockHistory);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                const email = session?.user?.email;
                if (!email) return;
                // 발급 이력 조회 (certificates 테이블 = 외부 증명서 시스템과 다름, approvals 테이블에서 type=certificate 찾기)
                const { data: rows } = await supabase
                    .from('approvals')
                    .select('subtype, created_at, description')
                    .eq('type', 'certificate')
                    .order('created_at', { ascending: false })
                    .limit(20);
                if (!cancelled && rows && rows.length > 0) {
                    // 유형별 카운트
                    const countMap: Record<string, { count: number; last: string }> = {};
                    rows.forEach((r: Record<string, unknown>) => {
                        const t = (r.subtype as string) || "";
                        if (!countMap[t]) countMap[t] = { count: 0, last: "" };
                        countMap[t].count++;
                        if (!countMap[t].last) countMap[t].last = (r.created_at as string)?.slice(0, 10) || "";
                    });
                    setCertificates(CERT_TYPES.map(c => ({
                        ...c,
                        issueCount: countMap[c.type]?.count || 0,
                        lastIssued: countMap[c.type]?.last || undefined,
                    })));
                    setRecentHistory(rows.slice(0, 5).map((r: Record<string, unknown>) => ({
                        type: (r.subtype as string) || "",
                        date: (r.created_at as string)?.slice(0, 10) || "",
                        purpose: (r.description as string) || "",
                    })));
                }
            } catch { /* mock 유지 */ } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

    return (
        <div className="max-w-4xl">
            <h1 className="text-xl font-semibold mb-2">제증명서 관리</h1>
            <p className="text-sm text-neutral-500 mb-8">각종 증명서를 발급하고 이력을 확인합니다.</p>

            {/* Certificate types */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {certificates.map(cert => (
                    <div key={cert.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors group">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <FileCheck className="h-5 w-5 text-neutral-400" />
                                <div>
                                    <h3 className="text-sm font-semibold">{cert.type}</h3>
                                    <p className="text-xs text-neutral-400 mt-0.5">{cert.description}</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all opacity-0 group-hover:opacity-100">
                                <Download className="h-3 w-3" /> 발급
                            </button>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400">
                            {cert.lastIssued && <span>최근 발급: {cert.lastIssued}</span>}
                            <span>발급 횟수: {cert.issueCount}회</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent history */}
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutral-400" /> 최근 발급 이력
            </h2>
            <div className="border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">증명서 유형</th>
                            <th className="text-left p-3 font-medium">발급일</th>
                            <th className="text-left p-3 font-medium">용도</th>
                            <th className="text-center p-3 font-medium">재발급</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentHistory.map((h, i) => (
                            <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 font-medium">{h.type}</td>
                                <td className="p-3 text-neutral-500">{h.date}</td>
                                <td className="p-3 text-neutral-500">{h.purpose}</td>
                                <td className="p-3 text-center">
                                    <button className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
                                        <Download className="h-3.5 w-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
