"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coins, ArrowRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface UcRule {
    action_key: string;
    action_label: string | null;
    amount: number;
    monthly_cap: number | null;
    is_active: boolean;
    brand_id: string | null;
    category: string | null;
}

const PRINCIPLES = [
    { title: "1 UC = 1 KRW", desc: "환산 기준 · 현금 환급 불가" },
    { title: "탈퇴 시 소멸", desc: "재가입해도 0에서 재시작" },
    { title: "최대 10% 차감", desc: "결제 건별 상한, 나머지 현금 결제" },
    { title: "월별 상한 (monthly_cap)", desc: "전 액션 공통 적용, 남용 방지" },
    { title: "일회성 구분", desc: "GLOBAL 1회 vs PER_BRAND 1회" },
];

export default function UcStandardPage() {
    const [rules, setRules] = useState<UcRule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("uc_earn_rules").select("action_key, action_label, amount, monthly_cap, is_active, brand_id, category").order("category").order("amount", { ascending: false });
            setRules(data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader title="Universe Coin 표준" description="UC 정책 · 단가 · 지급 규칙 (docs/Universe_Coin_Policy.md)" />

            {/* 5 Principles */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {PRINCIPLES.map((p) => (
                    <div key={p.title} className="bg-white border border-neutral-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-neutral-900 mb-1">{p.title}</p>
                        <p className="text-[10px] text-neutral-500 leading-relaxed">{p.desc}</p>
                    </div>
                ))}
            </div>

            {/* Earn Rules */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">지급 규칙 ({rules.length})</h2>
                {loading ? (
                    <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
                ) : rules.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">등록된 지급 규칙이 없습니다.</div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">카테고리</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">action_key</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">설명</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">브랜드</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">지급액</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">월상한</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules.map((r) => (
                                    <tr key={r.action_key} className="border-b border-neutral-100 last:border-0">
                                        <td className="px-3 py-2 text-neutral-700">{r.category || "-"}</td>
                                        <td className="px-3 py-2 font-mono text-[10px] text-neutral-900">{r.action_key}</td>
                                        <td className="px-3 py-2 text-neutral-600 truncate max-w-[240px]">{r.action_label || "-"}</td>
                                        <td className="px-3 py-2 text-neutral-500">{r.brand_id || "GLOBAL"}</td>
                                        <td className="px-3 py-2 text-right font-semibold text-neutral-900">+{r.amount.toLocaleString()}</td>
                                        <td className="px-3 py-2 text-right text-neutral-500">{r.monthly_cap ? r.monthly_cap.toLocaleString() : "-"}</td>
                                        <td className="px-3 py-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${r.is_active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                                                {r.is_active ? "활성" : "정지"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <Link href="/intra/ums/uc" className="flex-1 bg-amber-600 text-white px-4 py-2 text-xs rounded hover:bg-amber-700 flex items-center justify-center gap-1 font-semibold">
                    <Coins className="h-4 w-4" /> 잔액 현황 관리 <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/intra/ums/uc/transactions" className="flex-1 bg-neutral-900 text-white px-4 py-2 text-xs rounded hover:bg-neutral-700 flex items-center justify-center gap-1 font-semibold">
                    거래 내역 <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}
