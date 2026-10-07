"use client";

/**
 * 브랜드 고객 문의 인박스 — contact_submissions 기반 (공개 폼 → /api/contact 저장분)
 * brandId 지정 시 form_type이 `${brandId}_`로 시작하는 문의만, 미지정 시 전체. formType 지정 시 그 유형만(사이트 메뉴별 인박스).
 * 예: Badak 문의 = badak_inquiry, Jakka 광고 문의 = jakka_ad
 *
 * 행 클릭 → 상세(전체 내용·첨부·응대 기록). 답변/미답변 근거 = handling_log
 * 이메일·전화 등 인트라 밖에서 응대해도 "응대 기록 남기기"로 기록한다.
 */

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Search, X, Mail, Phone, Paperclip, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
    INQUIRY_STATUS, INQUIRY_STATUSES, OPEN_INQUIRY_STATUSES, REPLY_CHANNELS, REPLY_CHANNEL_LABEL,
    inquiryStatusOf, type HandlingLogEntry, type InquiryStatus, type ReplyChannel,
} from "@/lib/contact-inquiry";
import type { ContactAttachment } from "@/lib/contact-attachments";

interface Inquiry {
    id: string;
    form_type: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    message: string | null;
    portfolio_url: string | null;
    extra: unknown;
    attachments: ContactAttachment[] | null;
    handling_log: HandlingLogEntry[] | null;
    status: string | null;
    created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
    tenone_partner: "파트너 신청",
    tenone_crew: "크루 지원",
    tenone_business: "프로젝트 의뢰",
    badak_inquiry: "Badak 문의",
    madleague_inquiry: "MAD League 문의",
    rook_inquiry: "RooK 문의",
    rook_rookie: "RooKie 지원",
};

function dt(s: string) {
    return new Date(s).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function extraText(extra: unknown): string | null {
    if (!extra) return null;
    if (typeof extra === "string") return extra;
    if (typeof extra === "object" && Object.keys(extra as object).length) {
        return Object.entries(extra as Record<string, unknown>).map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`).join("\n");
    }
    return null;
}

export function BrandInquiryInbox({ brandId, brandName, formType }: { brandId?: string; brandName: string; formType?: string }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "open" | InquiryStatus>("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        let q = createClient().from("contact_submissions")
            .select("id, form_type, name, email, phone, company, message, portfolio_url, extra, attachments, handling_log, status, created_at")
            .order("created_at", { ascending: false })
            .limit(200);
        if (formType) q = q.eq("form_type", formType);
        else if (brandId) q = q.like("form_type", `${brandId}\\_%`);
        q.then((res: { data: unknown[] | null; error: unknown }) => {
            if (res.error) setError("문의 내역을 불러오지 못했습니다.");
            setInquiries((res.data ?? []) as Inquiry[]);
            setLoading(false);
        });
    }, [brandId, formType]);

    const term = search.trim();
    const filtered = inquiries
        .filter(i => statusFilter === "all"
            || (statusFilter === "open" ? OPEN_INQUIRY_STATUSES.has(i.status ?? "pending") : i.status === statusFilter))
        .filter(i => !term || [i.name, i.email, i.company, i.message].some(v => v?.includes(term)));
    const openCount = inquiries.filter(i => OPEN_INQUIRY_STATUSES.has(i.status ?? "pending")).length;
    const selected = inquiries.find(i => i.id === selectedId) ?? null;

    const onUpdated = (id: string, status: string, handling_log: HandlingLogEntry[]) =>
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status, handling_log } : i));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">고객 문의</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">{brandName} 문의 · 공개 폼 접수분 · 행을 누르면 내용과 응대 기록을 볼 수 있습니다</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 이메일, 내용..."
                        className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-52 focus:outline-none focus:border-neutral-400" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                    { l: "전체", v: inquiries.length, c: "", f: "all" as const },
                    { l: "미답변·처리 중", v: openCount, c: "text-amber-600", f: "open" as const },
                    { l: "답변 완료·종료", v: inquiries.length - openCount, c: "text-emerald-600", f: "resolved" as const },
                ].map(({ l, v, c, f }) => (
                    <button key={l} onClick={() => setStatusFilter(f)}
                        className={`text-left border rounded-lg p-4 ${statusFilter === f ? "border-neutral-900" : "border-neutral-200"}`}>
                        <p className="text-xs text-neutral-400 mb-1">{l}</p>
                        <p className={`text-2xl font-bold ${c}`}>{v}</p>
                    </button>
                ))}
            </div>
            <div className="flex gap-1.5 mb-4">
                {(["all", "open", ...INQUIRY_STATUSES] as const).map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                        className={`text-xs px-3 py-1.5 rounded-full ${statusFilter === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>
                        {s === "all" ? "전체" : s === "open" ? "미답변·처리 중" : INQUIRY_STATUS[s].label}
                    </button>
                ))}
            </div>
            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : error ? (
                <div className="border border-rose-200 bg-rose-50 rounded-lg p-6 text-center text-sm text-rose-700">{error}</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <MessageSquare className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{term ? "검색 결과 없음" : "문의 내역 없음"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left">
                                {["유형", "이름", "이메일", "내용", "상태", "접수일"].map(h => <th key={h} className="px-4 py-3 font-semibold text-neutral-500">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(i => {
                                const s = inquiryStatusOf(i.status);
                                const files = i.attachments?.length ?? 0;
                                return (
                                    <tr key={i.id} onClick={() => setSelectedId(i.id)}
                                        className={`border-t border-neutral-100 cursor-pointer hover:bg-neutral-50 ${selectedId === i.id ? "bg-neutral-50" : ""}`}>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{TYPE_LABEL[i.form_type] ?? i.form_type}</td>
                                        <td className="px-4 py-3 font-medium">{i.name || "-"}{i.company ? <span className="text-neutral-400 font-normal"> · {i.company}</span> : null}</td>
                                        <td className="px-4 py-3 text-neutral-500">{i.email || "-"}</td>
                                        <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">
                                            {files > 0 && <Paperclip className="inline h-3.5 w-3.5 mr-1 text-neutral-400" />}
                                            {i.message || "(없음)"}
                                        </td>
                                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${s.cls}`}>{s.label}</span></td>
                                        <td className="px-4 py-3 text-xs text-neutral-400">{new Date(i.created_at).toLocaleDateString("ko-KR")}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">총 {filtered.length}건</div>
                </div>
            )}

            {selected && <InquiryDetail inquiry={selected} onClose={() => setSelectedId(null)} onUpdated={onUpdated} />}
        </div>
    );
}

function InquiryDetail({ inquiry, onClose, onUpdated }: {
    inquiry: Inquiry;
    onClose: () => void;
    onUpdated: (id: string, status: string, log: HandlingLogEntry[]) => void;
}) {
    const [log, setLog] = useState<HandlingLogEntry[]>(inquiry.handling_log ?? []);
    const [channel, setChannel] = useState<ReplyChannel>("email");
    const [status, setStatus] = useState<InquiryStatus>("resolved");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    // 처리자 이름이 포함된 기록은 API에서 받음
    const loadLog = useCallback(async () => {
        const res = await fetch(`/api/intra/contact-submissions/${inquiry.id}`);
        if (res.ok) setLog((await res.json()).inquiry.handling_log ?? []);
    }, [inquiry.id]);
    useEffect(() => { setNote(""); setMsg(""); loadLog(); }, [loadLog]);

    const save = async () => {
        setSaving(true); setMsg("");
        const res = await fetch(`/api/intra/contact-submissions/${inquiry.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, channel, note }),
        });
        const data = await res.json().catch(() => ({}));
        setSaving(false);
        if (!res.ok) { setMsg(data.error || "저장하지 못했습니다."); return; }
        setLog(data.handling_log);
        setNote("");
        onUpdated(inquiry.id, data.status, data.handling_log);
    };

    const s = inquiryStatusOf(inquiry.status);
    const subject = encodeURIComponent(`[Ten:One™] ${TYPE_LABEL[inquiry.form_type] ?? "문의"} 회신드립니다`);
    const extra = extraText(inquiry.extra);

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
            <div className="w-full max-w-xl h-full bg-white overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-neutral-100 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">{TYPE_LABEL[inquiry.form_type] ?? inquiry.form_type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${s.cls}`}>{s.label}</span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100"><X className="h-5 w-5" /></button>
                </div>

                <div className="p-5 space-y-5 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="이름" value={inquiry.name} />
                        <Field label="회사·지원 분야" value={inquiry.company} />
                        <Field label="접수일" value={dt(inquiry.created_at)} />
                        <Field label="연락처" value={inquiry.phone} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {inquiry.email && (
                            <a href={`mailto:${inquiry.email}?subject=${subject}`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 text-white text-xs">
                                <Mail className="h-3.5 w-3.5" /> {inquiry.email} 에게 메일 쓰기
                            </a>
                        )}
                        {inquiry.phone && (
                            <a href={`tel:${inquiry.phone}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-xs">
                                <Phone className="h-3.5 w-3.5" /> 전화
                            </a>
                        )}
                    </div>

                    <div>
                        <p className="text-xs text-neutral-400 mb-1">내용</p>
                        <div className="bg-neutral-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">{inquiry.message || "(없음)"}</div>
                    </div>

                    {extra && (
                        <div>
                            <p className="text-xs text-neutral-400 mb-1">추가 항목</p>
                            <div className="bg-neutral-50 rounded-lg p-3 whitespace-pre-wrap text-xs">{extra}</div>
                        </div>
                    )}

                    {(inquiry.portfolio_url || (inquiry.attachments?.length ?? 0) > 0) && (
                        <div>
                            <p className="text-xs text-neutral-400 mb-1">포트폴리오·첨부</p>
                            <div className="space-y-1.5">
                                {inquiry.portfolio_url && /^https?:\/\//i.test(inquiry.portfolio_url) && (
                                    <a href={inquiry.portfolio_url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-indigo-600 hover:underline break-all">
                                        <ExternalLink className="h-3.5 w-3.5 shrink-0" /> {inquiry.portfolio_url}
                                    </a>
                                )}
                                {(inquiry.attachments ?? []).map((a, i) => (
                                    <a key={a.path} href={`/api/intra/contact-attachment?id=${inquiry.id}&i=${i}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                                        <Paperclip className="h-3.5 w-3.5 shrink-0" /> {a.name}
                                        <span className="text-neutral-400 text-xs">· {(a.size / 1024 / 1024).toFixed(1)}MB</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-neutral-100 pt-5">
                        <p className="text-xs font-semibold text-neutral-700 mb-2">응대 기록</p>
                        {log.length === 0 ? (
                            <p className="text-xs text-neutral-400 mb-4">아직 기록이 없습니다 — 미답변 상태입니다.</p>
                        ) : (
                            <ol className="space-y-2 mb-4">
                                {log.map((l, i) => (
                                    <li key={i} className="border border-neutral-100 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                                            <span>{dt(l.at)}</span>
                                            <span>· {l.by_name ?? "직원"}</span>
                                            <span>· {REPLY_CHANNEL_LABEL[l.channel] ?? l.channel}</span>
                                            <span className={`px-1.5 py-0.5 rounded ${inquiryStatusOf(l.status).cls}`}>{inquiryStatusOf(l.status).label}</span>
                                        </div>
                                        {l.note && <p className="whitespace-pre-wrap">{l.note}</p>}
                                    </li>
                                ))}
                            </ol>
                        )}

                        <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
                            <p className="text-xs text-neutral-500">이메일·전화 등으로 응대한 뒤 여기에 남겨 주세요. 이 기록이 답변 여부의 근거가 됩니다.</p>
                            <div className="grid grid-cols-2 gap-2">
                                <select value={channel} onChange={e => setChannel(e.target.value as ReplyChannel)}
                                    className="border border-neutral-200 rounded-lg px-2 py-2 text-xs bg-white">
                                    {REPLY_CHANNELS.map(c => <option key={c} value={c}>응대 방법: {REPLY_CHANNEL_LABEL[c]}</option>)}
                                </select>
                                <select value={status} onChange={e => setStatus(e.target.value as InquiryStatus)}
                                    className="border border-neutral-200 rounded-lg px-2 py-2 text-xs bg-white">
                                    {INQUIRY_STATUSES.map(st => <option key={st} value={st}>상태: {INQUIRY_STATUS[st].label}</option>)}
                                </select>
                            </div>
                            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                                placeholder="예) 10/5 전화로 미팅 일정 안내, 다음 주 화요일 미팅 확정"
                                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm resize-none bg-white" />
                            {msg && <p className="text-xs text-rose-600">{msg}</p>}
                            <button onClick={save} disabled={saving}
                                className="w-full py-2 rounded-lg bg-neutral-900 text-white text-xs font-medium disabled:opacity-50">
                                {saving ? "저장 중..." : "응대 기록 남기기"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string | null }) {
    return (
        <div>
            <p className="text-xs text-neutral-400">{label}</p>
            <p className="font-medium break-all">{value || "-"}</p>
        </div>
    );
}
