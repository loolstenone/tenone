"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X } from "lucide-react";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader } from "@/components/intra/IntraUI";

interface Invoice {
    id: string;
    invoiceNo: string;
    client: string;
    project: string;
    amount: number;
    issueDate: string;
    dueDate: string;
    status: "발행" | "입금완료" | "미발행" | "연체";
}

const mockInvoices: Invoice[] = [
    { id: "1", invoiceNo: "INV-2026-032", client: "ABC엔터", project: "LUKI 2nd Single MV", amount: 15000000, issueDate: "2026-03-15", dueDate: "2026-04-15", status: "발행" },
    { id: "2", invoiceNo: "INV-2026-028", client: "XYZ미디어", project: "브랜드 영상 제작", amount: 8000000, issueDate: "2026-03-01", dueDate: "2026-03-31", status: "발행" },
    { id: "3", invoiceNo: "INV-2026-025", client: "DEF기획", project: "MADLeap 5기 협찬", amount: 5000000, issueDate: "2026-02-20", dueDate: "2026-03-20", status: "입금완료" },
    { id: "4", invoiceNo: "INV-2026-020", client: "GHI스튜디오", project: "콘텐츠 제작 용역", amount: 12000000, issueDate: "2026-02-10", dueDate: "2026-03-10", status: "연체" },
    { id: "5", invoiceNo: "-", client: "JKL커뮤니케이션", project: "Badak 네트워크 컨설팅", amount: 3000000, issueDate: "-", dueDate: "-", status: "미발행" },
];

const statusColor: Record<string, string> = {
    "발행": "bg-blue-50 text-blue-600",
    "입금완료": "bg-green-50 text-green-600",
    "미발행": "bg-neutral-100 text-neutral-400",
    "연체": "bg-red-50 text-red-600",
};

const statusMap: Record<string, Invoice["status"]> = {
    issued: "발행",
    paid: "입금완료",
    draft: "미발행",
    overdue: "연체",
};

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

function generateInvoiceNo(): string {
    const year = new Date().getFullYear();
    const seq = String(Math.floor(Math.random() * 900) + 100);
    return `INV-${year}-${seq}`;
}

function dbRowToInvoice(r: Record<string, unknown>): Invoice {
    return {
        id: r.id as string,
        invoiceNo: (r.invoice_no as string) || "-",
        client: (r.client_name as string) || (r.client as string) || "-",
        project: (r.project_name as string) || (r.project as string) || "-",
        amount: (r.amount as number) || 0,
        issueDate: ((r.issue_date as string) || "-").slice(0, 10),
        dueDate: ((r.due_date as string) || "-").slice(0, 10),
        status: statusMap[(r.status as string) || "draft"] || "미발행",
    };
}

interface InvoiceFormData {
    client: string;
    project: string;
    amount: string;
    issueDate: string;
    dueDate: string;
    status: string;
}

const EMPTY_FORM: InvoiceFormData = {
    client: "",
    project: "",
    amount: "",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    status: "issued",
};

function InvoiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: (inv: Invoice) => void }) {
    const [form, setForm] = useState<InvoiceFormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const set = (key: keyof InvoiceFormData, value: string) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const amount = parseInt(form.amount.replace(/,/g, ""), 10);
        if (!form.client.trim()) { setError("거래처를 입력하세요."); return; }
        if (!form.project.trim()) { setError("프로젝트를 입력하세요."); return; }
        if (isNaN(amount) || amount <= 0) { setError("유효한 금액을 입력하세요."); return; }
        if (!form.dueDate) { setError("만기일을 입력하세요."); return; }

        setSaving(true);
        try {
            const invoiceNo = generateInvoiceNo();
            const row = await erpDb.createInvoice({
                invoice_no: invoiceNo,
                client_name: form.client.trim(),
                project_name: form.project.trim(),
                amount,
                issue_date: form.status === "draft" ? null : form.issueDate,
                due_date: form.dueDate,
                status: form.status,
                tenant_id: "tenone",
            });
            onCreated(dbRowToInvoice(row as Record<string, unknown>));
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
                    <h2 className="text-sm font-semibold">청구서 발행</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs text-neutral-500 mb-1">거래처 *</label>
                            <input
                                type="text"
                                value={form.client}
                                onChange={e => set("client", e.target.value)}
                                placeholder="예: ABC엔터"
                                className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-neutral-500 mb-1">프로젝트 *</label>
                            <input
                                type="text"
                                value={form.project}
                                onChange={e => set("project", e.target.value)}
                                placeholder="예: LUKI 2nd Single MV"
                                className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-neutral-500 mb-1">금액 (원) *</label>
                            <input
                                type="text"
                                value={form.amount}
                                onChange={e => set("amount", e.target.value.replace(/[^\d,]/g, ""))}
                                placeholder="예: 15000000"
                                className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">발행일</label>
                            <input
                                type="date"
                                value={form.issueDate}
                                onChange={e => set("issueDate", e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">만기일 *</label>
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={e => set("dueDate", e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-neutral-500 mb-1">상태</label>
                            <select
                                value={form.status}
                                onChange={e => set("status", e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white"
                            >
                                <option value="issued">발행</option>
                                <option value="draft">미발행 (초안)</option>
                            </select>
                        </div>
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                        >
                            {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                            발행하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const rows = await erpDb.fetchInvoices({ limit: 50 });
                if (!cancelled) {
                    setInvoices(rows.length > 0 ? rows.map((r: any) => dbRowToInvoice(r as Record<string, unknown>)) : mockInvoices);
                }
            } catch {
                if (!cancelled) setInvoices(mockInvoices);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;
    }

    const totalOutstanding = invoices.filter(i => i.status === "발행" || i.status === "연체").reduce((s, i) => s + i.amount, 0);
    const thisMonthPaid = invoices.filter(i => i.status === "입금완료").reduce((s, i) => s + i.amount, 0);

    return (
        <div className="space-y-6">
            {showModal && (
                <InvoiceModal
                    onClose={() => setShowModal(false)}
                    onCreated={inv => setInvoices(prev => [inv, ...prev])}
                />
            )}

            <PageHeader title="청구관리" description="청구서 발행 및 입금 현황을 관리합니다.">
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                    <Plus className="h-3 w-3" /> 청구서 발행
                </button>
            </PageHeader>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "미수금 합계", value: formatKRW(totalOutstanding) },
                    { label: "발행 건", value: `${invoices.filter(i => i.status === "발행").length}건` },
                    { label: "연체 건", value: `${invoices.filter(i => i.status === "연체").length}건` },
                    { label: "입금 완료", value: formatKRW(thisMonthPaid) },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="border border-neutral-200 bg-white">
                {invoices.length === 0 ? (
                    <div className="py-12 text-center text-sm text-neutral-400">청구서가 없습니다</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                <th className="text-left p-3 font-medium">청구번호</th>
                                <th className="text-left p-3 font-medium">거래처</th>
                                <th className="text-left p-3 font-medium">프로젝트</th>
                                <th className="text-right p-3 font-medium">금액</th>
                                <th className="text-left p-3 font-medium">발행일</th>
                                <th className="text-left p-3 font-medium">만기일</th>
                                <th className="text-center p-3 font-medium">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer">
                                    <td className="p-3 font-mono text-xs">{inv.invoiceNo}</td>
                                    <td className="p-3 font-medium">{inv.client}</td>
                                    <td className="p-3 text-neutral-500">{inv.project}</td>
                                    <td className="p-3 text-right font-medium">{formatKRW(inv.amount)}</td>
                                    <td className="p-3 text-neutral-500 text-xs">{inv.issueDate}</td>
                                    <td className="p-3 text-neutral-500 text-xs">{inv.dueDate}</td>
                                    <td className="p-3 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[inv.status]}`}>{inv.status}</span>
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
