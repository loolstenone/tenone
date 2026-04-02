"use client";

import { useState } from "react";
import { Send, Upload, User, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createApproval } from "@/lib/supabase/erp";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";

const approvalLine = [
    { role: "기안자", name: "나" },
    { role: "1차 결재", name: "Sarah Kim" },
    { role: "최종 결재", name: "대표" },
];

export default function ExpenditureDraftPage() {
    const router = useRouter();
    const [expType, setExpType] = useState("구매");
    const [subject, setSubject] = useState("");
    const [amount, setAmount] = useState("");
    const [vendor, setVendor] = useState("");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const email = session?.user?.email;
            let drafterId: string | null = null;
            if (email) {
                const { data: m } = await supabase.from("members").select("id").eq("email", email).single();
                drafterId = m?.id || null;
            }
            await createApproval({
                type: "expenditure",
                subtype: expType,
                title: subject,
                amount: Number(amount.replace(/,/g, "")) || 0,
                vendor,
                description: reason,
                status: "pending",
                drafter_id: drafterId,
            });
            router.push("/intra/erp/approval");
        } catch {
            alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <PageHeader title="품의서 작성" description="구매, 경비, 청구 등 품의서를 작성합니다" />

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 품의 유형 */}
                <div className="bg-white border border-neutral-200 p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">품의 유형</label>
                    <select
                        value={expType}
                        onChange={(e) => setExpType(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    >
                        <option value="구매">구매</option>
                        <option value="경비지출">경비지출</option>
                        <option value="청구">청구</option>
                        <option value="지급">지급</option>
                    </select>
                </div>

                {/* 건명 */}
                <div className="bg-white border border-neutral-200 p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">건명</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="품의 건명을 입력하세요"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    />
                </div>

                {/* 금액 + 거래처 */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-neutral-200 p-4">
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">금액 (원)</label>
                        <input
                            type="text"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-300"
                        />
                    </div>
                    <div className="bg-white border border-neutral-200 p-4">
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">거래처</label>
                        <input
                            type="text"
                            value={vendor}
                            onChange={(e) => setVendor(e.target.value)}
                            placeholder="거래처명"
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-300"
                        />
                    </div>
                </div>

                {/* 사유 */}
                <div className="bg-white border border-neutral-200 p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">사유</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={5}
                        placeholder="품의 사유를 상세히 입력하세요"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    />
                </div>

                {/* 결재라인 */}
                <div className="bg-white border border-neutral-200 p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-2">결재라인</label>
                    <div className="flex items-center gap-1.5">
                        {approvalLine.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                                    <User className="w-3.5 h-3.5 text-neutral-400" />
                                    <div>
                                        <div className="text-xs text-neutral-400">{step.role}</div>
                                        <div className="text-xs text-neutral-700">{step.name}</div>
                                    </div>
                                </div>
                                {idx < approvalLine.length - 1 && (
                                    <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 첨부파일 */}
                <div className="bg-white border border-neutral-200 p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">첨부파일</label>
                    <div className="flex items-center gap-2 px-3 py-2 border border-dashed border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                        <Upload className="w-4 h-4 text-neutral-400" />
                        <span className="text-xs text-neutral-400">클릭하여 파일을 첨부하세요 (견적서, 영수증 등)</span>
                    </div>
                </div>

                {/* 제출 */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        품의서 제출
                    </button>
                </div>
            </form>
        </div>
    );
}
