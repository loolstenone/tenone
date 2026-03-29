"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, Clock, AlertTriangle, Trash2, Users, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ── 타입 ── */
interface ConsentStat { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string }

/* ── Mock (fallback) ── */
const mockConsentStats: ConsentStat[] = [
    { label: "마케팅 동의율", value: "68.4%", icon: Users, color: "text-blue-600" },
    { label: "개인정보 처리 동의", value: "100%", icon: Shield, color: "text-green-600" },
    { label: "삭제 요청", value: "3건", icon: Trash2, color: "text-red-500" },
    { label: "처리 완료", value: "12건", icon: CheckCircle, color: "text-neutral-600" },
];

/* ── Delete Requests (mock — 테이블 미존재) ── */
const deleteRequests = [
    { id: "1", name: "정하은", type: "회원", requestDate: "2026-03-25", deadline: "2026-04-24", status: "처리중", reason: "서비스 탈퇴" },
    { id: "2", name: "양현지", type: "게스트", requestDate: "2026-03-27", deadline: "2026-04-26", status: "대기", reason: "정보 삭제 요청" },
    { id: "3", name: "서준호", type: "게스트", requestDate: "2026-03-28", deadline: "2026-04-27", status: "대기", reason: "마케팅 수신 거부 및 삭제" },
];

/* ── Auto Delete Log (mock — 테이블 미존재) ── */
const autoDeleteLog = [
    { date: "2026-03-28", name: "김태형", type: "게스트", brand: "MADLeague", reason: "30일 경과 자동삭제" },
    { date: "2026-03-27", name: "이소영", type: "게스트", brand: "Badak", reason: "30일 경과 자동삭제" },
    { date: "2026-03-26", name: "박진수", type: "게스트", brand: "SmarComm", reason: "30일 경과 자동삭제" },
    { date: "2026-03-25", name: "최유나", type: "게스트", brand: "HeRo", reason: "본인 요청 즉시삭제" },
    { date: "2026-03-24", name: "정민우", type: "게스트", brand: "Evolution School", reason: "30일 경과 자동삭제" },
];

/* ── Compliance Checklist ── */
const complianceItems = [
    { label: "개인정보 처리방침 고지", done: true },
    { label: "수집 목적 및 항목 명시", done: true },
    { label: "제3자 제공 동의 절차", done: true },
    { label: "마케팅 수신 동의 분리", done: true },
    { label: "게스트 자동삭제 (30일)", done: true },
    { label: "삭제 요청 처리 (30일 이내)", done: true },
    { label: "접근 권한 최소화", done: false },
    { label: "개인정보 암호화 저장", done: true },
];

export default function UniversePrivacy() {
    const [loading, setLoading] = useState(true);
    const [consentStats, setConsentStats] = useState<ConsentStat[]>(mockConsentStats);

    useEffect(() => {
        async function loadData() {
            try {
                const supabase = createClient();

                // members에서 마케팅 동의율 계산 (newsletter_subscribed 필드 활용)
                const { data: members, error } = await supabase
                    .from("members")
                    .select("newsletter_subscribed");

                if (error) throw error;
                if (!members || members.length === 0) {
                    setLoading(false);
                    return;
                }

                const total = members.length;
                const marketingConsent = members.filter((m: { newsletter_subscribed: boolean }) => m.newsletter_subscribed).length;
                const consentRate = total > 0 ? ((marketingConsent / total) * 100).toFixed(1) : "0";

                setConsentStats([
                    { label: "마케팅 동의율", value: `${consentRate}%`, icon: Users, color: "text-blue-600" },
                    { label: "개인정보 처리 동의", value: "100%", icon: Shield, color: "text-green-600" },
                    { label: "삭제 요청", value: `${deleteRequests.length}건`, icon: Trash2, color: "text-red-500" },
                    { label: "처리 완료", value: "12건", icon: CheckCircle, color: "text-neutral-600" },
                ]);
            } catch (err) {
                console.error("Privacy fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

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
                    <Shield className="h-5 w-5" /> 개인정보
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">개인정보 관리 및 컴플라이언스</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {consentStats.map((s) => (
                    <div key={s.label} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <s.icon className={`h-4 w-4 ${s.color} mb-2`} />
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[11px] text-neutral-500">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Delete Requests (mock — 삭제 요청 테이블 미존재) */}
                <div>
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">삭제 요청 목록</h2>
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">요청자</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">유형</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">요청일</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">처리기한</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">상태</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {deleteRequests.map((r) => (
                                    <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-neutral-900">{r.name}</p>
                                            <p className="text-[10px] text-neutral-400">{r.reason}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                r.type === "회원" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                                            }`}>{r.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{r.requestDate}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{r.deadline}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${
                                                r.status === "처리중" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                                            }`}>
                                                {r.status === "처리중" ? <Clock className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Compliance Checklist */}
                <div>
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">컴플라이언스 체크리스트</h2>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-neutral-500">완료 {complianceItems.filter((c) => c.done).length}/{complianceItems.length}</p>
                            <div className="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${(complianceItems.filter((c) => c.done).length / complianceItems.length) * 100}%` }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            {complianceItems.map((c, i) => (
                                <div key={i} className="flex items-center gap-3 py-1.5">
                                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                                        c.done ? "bg-green-100" : "bg-neutral-100"
                                    }`}>
                                        {c.done ? (
                                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                        ) : (
                                            <div className="h-2 w-2 rounded-full bg-neutral-300" />
                                        )}
                                    </div>
                                    <span className={`text-xs ${c.done ? "text-neutral-700" : "text-neutral-400"}`}>
                                        {c.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto Delete Log (mock) */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">게스트 자동삭제 로그</h2>
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50">
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">날짜</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">이름</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">유형</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">브랜드</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">사유</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {autoDeleteLog.map((l, i) => (
                                <tr key={i} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-4 py-3 text-xs text-neutral-500">{l.date}</td>
                                    <td className="px-4 py-3 font-medium text-neutral-900">{l.name}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">{l.type}</span>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-700">{l.brand}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-500">{l.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
