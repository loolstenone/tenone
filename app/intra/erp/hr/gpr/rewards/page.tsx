"use client";

import { useState, useEffect } from "react";
import { Award, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import * as erpDb from "@/lib/supabase/erp";
import { useAuth } from "@/lib/auth-context";

interface RewardRecord {
    period: string;
    grade: string;
    bonusRate: string;
    amount: string;
    type: "성과급" | "인센티브" | "특별보상";
}

const mockRewards: RewardRecord[] = [
    { period: "2025 하반기", grade: "S", bonusRate: "200%", amount: "10,000,000원", type: "성과급" },
    { period: "2025 상반기", grade: "A", bonusRate: "150%", amount: "7,500,000원", type: "성과급" },
    { period: "2025 Q3", grade: "-", bonusRate: "-", amount: "2,000,000원", type: "특별보상" },
    { period: "2024 하반기", grade: "A", bonusRate: "150%", amount: "7,000,000원", type: "성과급" },
];

const gradeColor: Record<string, string> = {
    "S": "bg-yellow-50 text-yellow-700",
    "A": "bg-green-50 text-green-600",
    "B": "bg-blue-50 text-blue-600",
    "C": "bg-neutral-100 text-neutral-500",
};

function dbRowToReward(r: Record<string, unknown>): RewardRecord {
    const typeMap: Record<string, RewardRecord["type"]> = {
        bonus: "성과급",
        incentive: "인센티브",
        special: "특별보상",
    };
    return {
        period: (r.period as string) || "-",
        grade: (r.grade as string) || "-",
        bonusRate: r.bonus_rate ? `${r.bonus_rate}%` : "-",
        amount: r.amount ? `${Number(r.amount).toLocaleString("ko-KR")}원` : "-",
        type: typeMap[(r.type as string) || "bonus"] || "성과급",
    };
}

export default function RewardsPage() {
    const { user } = useAuth();
    const [rewards, setRewards] = useState<RewardRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const rows = await erpDb.fetchIncentives({ memberId: user?.id, limit: 20 });
                if (!cancelled) {
                    setRewards(rows.length > 0 ? rows.map((r: any) => dbRowToReward(r as Record<string, unknown>)) : mockRewards);
                }
            } catch {
                if (!cancelled) setRewards(mockRewards);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [user?.id]);

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;
    }

    const totalAmount = rewards
        .map(r => parseInt(r.amount.replace(/[^0-9]/g, "")) || 0)
        .reduce((s, n) => s + n, 0);

    return (
        <div className="max-w-4xl">
            <h1 className="text-xl font-semibold mb-2">보상 관리</h1>
            <p className="text-sm text-neutral-500 mb-6">성과급, 인센티브, 특별보상 이력을 확인합니다.</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "누적 보상 총액", value: totalAmount > 0 ? `${totalAmount.toLocaleString("ko-KR")}원` : "-", icon: DollarSign },
                    { label: "최근 성과 등급", value: rewards[0]?.grade || "-", icon: Award },
                    { label: "보상 횟수", value: `${rewards.length}회`, icon: TrendingUp },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-xs text-neutral-400">{s.label}</span>
                        </div>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="border border-neutral-200 bg-white">
                <div className="p-4 border-b border-neutral-100">
                    <h2 className="text-sm font-semibold">보상 이력</h2>
                </div>
                {rewards.length === 0 ? (
                    <div className="py-12 text-center text-sm text-neutral-400">보상 이력이 없습니다</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                <th className="text-left p-3 font-medium">기간</th>
                                <th className="text-center p-3 font-medium">등급</th>
                                <th className="text-center p-3 font-medium">지급률</th>
                                <th className="text-right p-3 font-medium">금액</th>
                                <th className="text-center p-3 font-medium">유형</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rewards.map((r, i) => (
                                <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    <td className="p-3 font-medium">{r.period}</td>
                                    <td className="p-3 text-center">
                                        {r.grade !== "-" ? (
                                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${gradeColor[r.grade] || ""}`}>{r.grade}</span>
                                        ) : "-"}
                                    </td>
                                    <td className="p-3 text-center text-neutral-500">{r.bonusRate}</td>
                                    <td className="p-3 text-right font-medium">{r.amount}</td>
                                    <td className="p-3 text-center">
                                        <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">{r.type}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
