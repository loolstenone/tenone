"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X } from "lucide-react";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader, PrimaryButton } from "@/components/intra/IntraUI";

interface Payment {
    id: string;
    vendor: string;
    description: string;
    amount: number;
    dueDate: string;
    type: "정발행" | "역발행";
    status: "지급완료" | "지급예정" | "미지급";
}


const statusColor: Record<string, string> = {
    "지급완료": "bg-green-50 text-green-600",
    "지급예정": "bg-blue-50 text-blue-600",
    "미지급": "bg-red-50 text-red-600",
};

const statusMap: Record<string, Payment["status"]> = {
    paid: "지급완료",
    scheduled: "지급예정",
    unpaid: "미지급",
    pending: "지급예정",
};

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

const inputCls = "w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white";

function PaymentModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Payment) => void }) {
    const [form, setForm] = useState({ vendor: "", description: "", amount: "", dueDate: "", type: "normal", status: "scheduled" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const amount = parseInt(form.amount.replace(/,/g, ""), 10);
        if (!form.vendor.trim()) { setError("거래처를 입력하세요."); return; }
        if (!form.description.trim()) { setError("내용을 입력하세요."); return; }
        if (isNaN(amount) || amount <= 0) { setError("유효한 금액을 입력하세요."); return; }
        setSaving(true);
        try {
            const row = await erpDb.createPayment({
                vendor_name: form.vendor.trim(),
                description: form.description.trim(),
                amount,
                due_date: form.dueDate || null,
                type: form.type,
                status: form.status,
                paid_at: form.status === "paid" ? new Date().toISOString() : null,
            });
            onCreated(dbRowToPayment(row as Record<string, unknown>));
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "저장 실패");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                    <h2 className="text-sm font-semibold">지급 등록</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">거래처 *</label>
                        <input value={form.vendor} onChange={e => set("vendor", e.target.value)} placeholder="예: 프리랜서 홍길동" className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">내용 *</label>
                        <input value={form.description} onChange={e => set("description", e.target.value)} placeholder="예: 영상 편집 용역" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">금액 (원) *</label>
                            <input value={form.amount} onChange={e => set("amount", e.target.value.replace(/[^\d,]/g, ""))} placeholder="예: 3000000" className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">지급일</label>
                            <input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">발행유형</label>
                            <select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls}>
                                <option value="normal">정발행</option>
                                <option value="reverse">역발행</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">상태</label>
                            <select value={form.status} onChange={e => set("status", e.target.value)} className={inputCls}>
                                <option value="scheduled">지급예정</option>
                                <option value="unpaid">미지급</option>
                                <option value="paid">지급완료</option>
                            </select>
                        </div>
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-neutral-600 border border-neutral-200 hover:bg-neutral-50">취소</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-40 flex items-center gap-1.5">
                            {saving && <Loader2 className="h-3 w-3 animate-spin" />} 등록
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function dbRowToPayment(r: Record<string, unknown>): Payment {
    return {
        id: r.id as string,
        vendor: (r.vendor_name as string) || (r.vendor as string) || "-",
        description: (r.description as string) || "-",
        amount: (r.amount as number) || 0,
        dueDate: ((r.due_date as string) || "-").slice(0, 10),
        type: (r.type as string) === "reverse" ? "역발행" : "정발행",
        status: statusMap[(r.status as string) || "unpaid"] || "미지급",
    };
}

export default function PaymentPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [markingId, setMarkingId] = useState<string | null>(null);

    const markPaid = async (id: string) => {
        if (!confirm("지급 완료로 처리할까요?")) return;
        setMarkingId(id);
        try {
            const row = await erpDb.updatePaymentStatus(id, "paid");
            setPayments(prev => prev.map(p => (p.id === id ? dbRowToPayment(row as Record<string, unknown>) : p)));
        } catch (err) {
            alert(err instanceof Error ? err.message : "처리 실패");
        } finally {
            setMarkingId(null);
        }
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const rows = await erpDb.fetchPayments({ limit: 50 });
                if (!cancelled) {
                    setPayments(rows.map((r: Record<string, unknown>) => dbRowToPayment(r)));
                }
            } catch {
                if (!cancelled) setPayments([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;
    }

    const unpaid = payments.filter(p => p.status !== "지급완료").reduce((s, p) => s + p.amount, 0);
    const paid = payments.filter(p => p.status === "지급완료").reduce((s, p) => s + p.amount, 0);

    return (
        <div>
            {showModal && <PaymentModal onClose={() => setShowModal(false)} onCreated={p => setPayments(prev => [p, ...prev])} />}
            <PageHeader title="지급관리" description="협력사 및 외주 지급 현황을 관리합니다.">
                <PrimaryButton onClick={() => setShowModal(true)}><Plus className="h-3 w-3" /> 지급 등록</PrimaryButton>
            </PageHeader>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "미지급 합계", value: formatKRW(unpaid) },
                    { label: "지급 완료", value: formatKRW(paid) },
                    { label: "미지급 건수", value: `${payments.filter(p => p.status !== "지급완료").length}건` },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="border border-neutral-200 bg-white">
                {payments.length === 0 ? (
                    <div className="py-12 text-center text-sm text-neutral-400">지급 내역이 없습니다</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                <th className="text-left p-3 font-medium">거래처</th>
                                <th className="text-left p-3 font-medium">내용</th>
                                <th className="text-right p-3 font-medium">금액</th>
                                <th className="text-center p-3 font-medium">발행유형</th>
                                <th className="text-left p-3 font-medium">지급일</th>
                                <th className="text-center p-3 font-medium">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    <td className="p-3 font-medium">{p.vendor}</td>
                                    <td className="p-3 text-neutral-600">{p.description}</td>
                                    <td className="p-3 text-right font-medium">{formatKRW(p.amount)}</td>
                                    <td className="p-3 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded ${p.type === "정발행" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>{p.type}</span>
                                    </td>
                                    <td className="p-3 text-neutral-500 text-xs">{p.dueDate}</td>
                                    <td className="p-3 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[p.status]}`}>{p.status}</span>
                                        {p.status !== "지급완료" && (
                                            <button onClick={() => markPaid(p.id)} disabled={markingId === p.id}
                                                className="ml-2 text-[11px] text-neutral-500 hover:text-neutral-900 underline disabled:opacity-40">
                                                지급 완료
                                            </button>
                                        )}
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
