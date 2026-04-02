"use client";

import { useState } from "react";
import { Send, Upload, User, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createApproval } from "@/lib/supabase/erp";
import { createClient } from "@/lib/supabase/client";

const approvalLine = [
    { role: "기안자", name: "나" },
    { role: "1차 결재", name: "Sarah Kim" },
    { role: "최종 결재", name: "대표" },
];

export default function ReportDraftPage() {
    const router = useRouter();
    const [reportType, setReportType] = useState("일일보고");
    const [title, setTitle] = useState("");
    const [periodFrom, setPeriodFrom] = useState("");
    const [periodTo, setPeriodTo] = useState("");
    const [achievements, setAchievements] = useState("");
    const [issues, setIssues] = useState("");
    const [nextPlan, setNextPlan] = useState("");
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
                type: "report",
                subtype: reportType,
                title,
                period_from: periodFrom || null,
                period_to: periodTo || null,
                description: JSON.stringify({ achievements, issues, nextPlan }),
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
        <div className="max-w-3xl">
            <div className="mb-4">
                <h1 className="text-lg font-semibold tracking-tight text-neutral-900">업무보고 작성</h1>
                <p className="text-sm text-neutral-400">업무 보고서를 작성합니다</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 보고 유형 */}
                <div className="bg-white border border-neutral-200 p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">보고 유형</label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    >
                        <option value="일일보고">일일보고</option>
                        <option value="주간보고">주간보고</option>
                        <option value="월간보고">월간보고</option>
                        <option value="프로젝트보고">프로젝트보고</option>
                    </select>
                </div>

                {/* 제목 */}
                <div className="bg-white border border-neutral-200 p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="보고서 제목을 입력하세요"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    />
                </div>

                {/* 기간 */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-neutral-200 p-4">
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">기간 (시작)</label>
                        <input
                            type="date"
                            value={periodFrom}
                            onChange={(e) => setPeriodFrom(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-300"
                        />
                    </div>
                    <div className="bg-white border border-neutral-200 p-4">
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">기간 (종료)</label>
                        <input
                            type="date"
                            value={periodTo}
                            onChange={(e) => setPeriodTo(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-300"
                        />
                    </div>
                </div>

                {/* 주요성과 */}
                <div className="bg-white border border-neutral-200 p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">주요성과</label>
                    <textarea
                        value={achievements}
                        onChange={(e) => setAchievements(e.target.value)}
                        rows={4}
                        placeholder="이번 기간 주요 성과를 입력하세요"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    />
                </div>

                {/* 이슈사항 */}
                <div className="bg-white border border-neutral-200 p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">이슈사항</label>
                    <textarea
                        value={issues}
                        onChange={(e) => setIssues(e.target.value)}
                        rows={3}
                        placeholder="이슈 및 리스크 사항을 입력하세요"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-neutral-300"
                    />
                </div>

                {/* 다음 계획 */}
                <div className="bg-white border border-neutral-200 p-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">다음 계획</label>
                    <textarea
                        value={nextPlan}
                        onChange={(e) => setNextPlan(e.target.value)}
                        rows={3}
                        placeholder="다음 기간 계획을 입력하세요"
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
                        <span className="text-xs text-neutral-400">클릭하여 파일을 첨부하세요</span>
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
                        보고서 제출
                    </button>
                </div>
            </form>
        </div>
    );
}
