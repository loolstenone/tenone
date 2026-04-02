"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileText, X } from "lucide-react";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader, Card, StatCard, Badge, Spinner } from "@/components/intra/IntraUI";
import { useAuth } from "@/lib/auth-context";

interface Expense {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
    payMethod: string;
    status: string;
    submitter: string;
    receipt: boolean;
}

const statusColor: Record<string, string> = {
    "승인": "bg-green-50 text-green-600",
    "대기": "bg-yellow-50 text-yellow-600",
    "반려": "bg-red-50 text-red-600",
    "처리완료": "bg-neutral-100 text-neutral-500",
    "approved": "bg-green-50 text-green-600",
    "pending": "bg-yellow-50 text-yellow-600",
    "rejected": "bg-red-50 text-red-600",
};

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

export default function ExpensesPage() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formDate, setFormDate] = useState("");
    const [formCategory, setFormCategory] = useState("교통");
    const [formDesc, setFormDesc] = useState("");
    const [formAmount, setFormAmount] = useState("");
    const [formPayMethod, setFormPayMethod] = useState("법인카드");
    const [formSubmitter, setFormSubmitter] = useState("");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        setLoading(true);
        erpDb.fetchExpenses()
            .then((data) => {
                setExpenses(data.map((e: Record<string, unknown>) => ({
                    id: (e.id as string) || '',
                    date: ((e.expense_date as string) || (e.created_at as string) || '').slice(0, 10),
                    category: (e.category as string) || '기타',
                    description: (e.description as string) || '',
                    amount: (e.amount as number) || 0,
                    payMethod: (e.pay_method as string) || '법인카드',
                    status: (e.status as string) || '대기',
                    submitter: (e.submitter_name as string) || (e.member_id as string) || '',
                    receipt: !!(e.receipt_url || e.receipt),
                })));
            })
            .catch(() => {
                setExpenses([]);
            })
            .finally(() => setLoading(false));
    }, [user?.id]);

    const totalPending = expenses.filter(e => e.status === "대기" || e.status === "pending").reduce((s, e) => s + e.amount, 0);
    const totalMonth = expenses.reduce((s, e) => s + e.amount, 0);
    const pendingCount = expenses.filter(e => e.status === "대기" || e.status === "pending").length;

    const filtered = search
        ? expenses.filter(e => e.description.includes(search) || e.submitter.includes(search) || e.category.includes(search))
        : expenses;

    const handleCreate = async () => {
        if (!formDate) { setFormError("날짜를 입력하세요."); return; }
        if (!formDesc.trim()) { setFormError("내용을 입력하세요."); return; }
        const amt = Number(formAmount);
        if (!amt || amt <= 0) { setFormError("금액을 입력하세요."); return; }
        setSaving(true);
        setFormError("");
        try {
            const created = await erpDb.createExpense({
                member_id: user?.id || "",
                expense_date: formDate,
                description: formDesc.trim(),
                amount: amt,
                category: formCategory,
                pay_method: formPayMethod,
                submitter_name: formSubmitter.trim() || undefined,
                status: "pending",
            });
            setExpenses(prev => [{
                id: (created as any).id || String(Date.now()),
                date: formDate,
                category: formCategory,
                description: formDesc.trim(),
                amount: amt,
                payMethod: formPayMethod,
                status: "pending",
                submitter: formSubmitter.trim(),
                receipt: false,
            }, ...prev]);
            setShowModal(false);
            setFormDate(""); setFormDesc(""); setFormAmount(""); setFormCategory("교통");
            setFormPayMethod("법인카드"); setFormSubmitter("");
        } catch {
            setFormError("저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <PageHeader title="경비처리" description="경비 사용 내역을 관리하고 정산합니다.">
                <button onClick={() => { setShowModal(true); setFormError(""); }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    <Plus className="h-3 w-3" /> 경비 등록
                </button>
            </PageHeader>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="이번 달 총 경비" value={formatKRW(totalMonth)} />
                <StatCard label="미처리 금액" value={formatKRW(totalPending)} />
                <StatCard label="미처리 건수" value={`${pendingCount}건`} />
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400" placeholder="경비 내역 검색..." />
            </div>

            <Card padding={false}>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">날짜</th>
                            <th className="text-left p-3 font-medium">분류</th>
                            <th className="text-left p-3 font-medium">내용</th>
                            <th className="text-right p-3 font-medium">금액</th>
                            <th className="text-center p-3 font-medium">결제수단</th>
                            <th className="text-left p-3 font-medium">신청자</th>
                            <th className="text-center p-3 font-medium">영수증</th>
                            <th className="text-center p-3 font-medium">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(e => (
                            <tr key={e.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                <td className="p-3 text-neutral-500">{e.date}</td>
                                <td className="p-3"><Badge label={e.category} /></td>
                                <td className="p-3 font-medium">{e.description}</td>
                                <td className="p-3 text-right font-medium">{formatKRW(e.amount)}</td>
                                <td className="p-3 text-center text-xs text-neutral-500">{e.payMethod}</td>
                                <td className="p-3 text-neutral-500">{e.submitter}</td>
                                <td className="p-3 text-center">{e.receipt ? <FileText className="h-3.5 w-3.5 text-green-500 mx-auto" /> : <span className="text-neutral-300">-</span>}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[e.status] || "bg-neutral-100 text-neutral-500"}`}>{e.status}</span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-xs text-neutral-400">
                                    데이터가 없습니다
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            {/* 경비 등록 모달 */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md bg-white shadow-xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                            <h2 className="text-sm font-semibold">경비 등록</h2>
                            <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">날짜 *</label>
                                    <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">분류</label>
                                    <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400">
                                        <option>교통</option><option>식비</option><option>사무용품</option><option>기타</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">내용 *</label>
                                <input type="text" value={formDesc} onChange={e => setFormDesc(e.target.value)}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="경비 사용 내용" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">금액 (원) *</label>
                                    <input type="number" min="0" value={formAmount} onChange={e => setFormAmount(e.target.value)}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                        placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">결제수단</label>
                                    <select value={formPayMethod} onChange={e => setFormPayMethod(e.target.value)}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400">
                                        <option>법인카드</option><option>개인카드</option><option>현금</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">신청자</label>
                                <input type="text" value={formSubmitter} onChange={e => setFormSubmitter(e.target.value)}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="이름" />
                            </div>
                            {formError && <p className="text-xs text-red-500">{formError}</p>}
                        </div>
                        <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-100">
                            <button onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-xs text-neutral-500 border border-neutral-200 hover:bg-neutral-50">취소</button>
                            <button onClick={handleCreate} disabled={saving}
                                className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50">
                                {saving ? "저장 중..." : "등록"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
