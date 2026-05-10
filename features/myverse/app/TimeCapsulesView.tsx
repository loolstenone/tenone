"use client";

// 타임 캡슐 — 미래의 나에게 보내는 잠긴 메시지

import { useEffect, useState } from "react";
import { Lock, Unlock, Mail, Plus, X, Calendar, Loader2, Trash2 } from "lucide-react";
import { LaneHeader } from "@/features/myverse/app/LaneHeader";

interface Capsule {
    id: string;
    created_at: string;
    open_at: string;
    opened_at: string | null;
    title: string;
    image_urls: string[];
    note_after_open: string | null;
    status: "pending" | "ready" | "opened";
}

interface CapsuleDetail extends Capsule {
    message: string | null;
}

const QUICK_PRESETS: { label: string; days: number }[] = [
    { label: "1개월 후",  days: 31 },
    { label: "100일 후",  days: 100 },
    { label: "1년 후",    days: 365 },
    { label: "3년 후",    days: 365 * 3 },
    { label: "10년 후",   days: 365 * 10 },
];

function fmt(iso: string) {
    return new Date(iso + (iso.includes("T") ? "" : "T00:00:00")).toLocaleDateString("ko-KR", {
        year: "numeric", month: "long", day: "numeric",
    });
}

function daysUntil(open_at: string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(open_at + "T00:00:00");
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function dateAfter(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

export function TimeCapsulesView() {
    const [capsules, setCapsules] = useState<Capsule[]>([]);
    const [loading, setLoading] = useState(true);
    const [composing, setComposing] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch("/api/myverse/capsules");
            if (res.ok) {
                const d = await res.json();
                setCapsules(d.capsules ?? []);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const ready = capsules.filter(c => c.status === "ready");
    const opened = capsules.filter(c => c.status === "opened");
    const pending = capsules.filter(c => c.status === "pending");

    return (
        <div className="max-w-4xl mx-auto px-5 py-8 sm:px-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <LaneHeader
                icon="redeem"
                label="TIME CAPSULE"
                title="타임 캡슐"
                subtitle="미래의 나에게 보내는 잠긴 메시지 — 정해진 날에 다시 만나요"
                status="phase2"
                actions={
                    <button
                        onClick={() => setComposing(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg text-xs font-medium transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        새 캡슐
                    </button>
                }
            />

            {loading ? (
                <div className="text-sm text-neutral-400 italic">불러오는 중…</div>
            ) : capsules.length === 0 ? (
                <EmptyState onCreate={() => setComposing(true)} />
            ) : (
                <div className="space-y-6">
                    {ready.length > 0 && (
                        <Section title="열 수 있는 캡슐" subtitle="잠금이 해제됐어요" highlight>
                            {ready.map(c => <CapsuleCard key={c.id} c={c} onOpen={() => setActiveId(c.id)} onChange={load} />)}
                        </Section>
                    )}
                    {opened.length > 0 && (
                        <Section title="열어본 캡슐">
                            {opened.map(c => <CapsuleCard key={c.id} c={c} onOpen={() => setActiveId(c.id)} onChange={load} />)}
                        </Section>
                    )}
                    {pending.length > 0 && (
                        <Section title="대기 중인 캡슐">
                            {pending.map(c => <CapsuleCard key={c.id} c={c} onOpen={() => setActiveId(c.id)} onChange={load} />)}
                        </Section>
                    )}
                </div>
            )}

            {composing && (
                <ComposeModal onClose={() => setComposing(false)} onCreated={() => { setComposing(false); load(); }} />
            )}
            {activeId && (
                <CapsuleDetailModal id={activeId} onClose={() => setActiveId(null)} onChanged={load} />
            )}
        </div>
    );
}

function Section({ title, subtitle, highlight, children }: { title: string; subtitle?: string; highlight?: boolean; children: React.ReactNode }) {
    return (
        <section>
            <div className="flex items-baseline gap-2 mb-2">
                <h2 className={`text-sm font-semibold ${highlight ? "text-[#6366F1]" : "text-neutral-700"}`}>{title}</h2>
                {subtitle && <span className="text-xs text-neutral-400">{subtitle}</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
        </section>
    );
}

function CapsuleCard({ c, onOpen, onChange }: { c: Capsule; onOpen: () => void; onChange: () => void }) {
    const days = daysUntil(c.open_at);
    const Icon = c.status === "ready" ? Unlock : c.status === "opened" ? Mail : Lock;
    const tone =
        c.status === "ready"
            ? "border-[#6366F1] bg-[#6366F1]/5 hover:bg-[#6366F1]/10"
            : c.status === "opened"
                ? "border-neutral-200 bg-white hover:bg-neutral-50"
                : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100";

    async function del(e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm("이 캡슐을 삭제할까요? 복구할 수 없어요.")) return;
        const res = await fetch(`/api/myverse/capsules/${c.id}`, { method: "DELETE" });
        if (res.ok) onChange();
    }

    return (
        <button
            onClick={onOpen}
            className={`group text-left rounded-xl border p-4 transition-colors ${tone}`}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${c.status === "ready" ? "text-[#6366F1]" : "text-neutral-400"}`} />
                <button
                    onClick={del}
                    className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-rose-500 p-0.5"
                    title="삭제"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>
            <h3 className="text-sm font-medium text-neutral-900 line-clamp-2">{c.title}</h3>
            <div className="text-[11px] text-neutral-500 mt-1.5 space-y-0.5">
                <div className="flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    {fmt(c.open_at)}
                </div>
                <div>
                    {c.status === "pending" && `${days}일 남음 · 보낸 날 ${fmt(c.created_at)}`}
                    {c.status === "ready" && "지금 열어보세요"}
                    {c.status === "opened" && c.opened_at && `${fmt(c.opened_at)}에 열어봄`}
                </div>
            </div>
        </button>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="border border-dashed border-neutral-300 rounded-xl py-16 px-6 text-center">
            <div className="h-12 w-12 rounded-full bg-[#6366F1]/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-5 w-5 text-[#6366F1]" />
            </div>
            <h3 className="text-base font-medium text-neutral-800 mb-1">아직 보낸 캡슐이 없어요</h3>
            <p className="text-sm text-neutral-500 mb-5 max-w-md mx-auto">
                지금 이 순간을 글로 남겨 두고, 정해진 미래에 다시 만나 보세요.<br className="hidden sm:inline" />
                과거의 내가 미래의 나에게 보내는 편지가 됩니다.
            </p>
            <button
                onClick={onCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg text-sm font-medium transition-colors"
            >
                <Plus className="h-4 w-4" />
                첫 캡슐 보내기
            </button>
        </div>
    );
}

function ComposeModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [openAt, setOpenAt] = useState(dateAfter(365));
    const [saving, setSaving] = useState(false);

    async function save() {
        if (!title.trim() || !message.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/myverse/capsules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message, open_at: openAt }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                alert(`저장 실패: ${d.error || res.status}`);
                return;
            }
            onCreated();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[9000] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
            <div className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 pb-3 border-b border-neutral-100">
                    <h2 className="text-base font-semibold text-neutral-900">미래의 나에게 보내기</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="예: 30살의 나에게"
                            maxLength={200}
                            className="w-full text-sm border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:border-[#6366F1] placeholder:text-neutral-400"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">언제 열까요</label>
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            {QUICK_PRESETS.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => setOpenAt(dateAfter(p.days))}
                                    className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                                        openAt === dateAfter(p.days)
                                            ? "bg-[#6366F1] border-[#6366F1] text-white"
                                            : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <input
                            type="date"
                            value={openAt}
                            min={dateAfter(1)}
                            onChange={e => setOpenAt(e.target.value)}
                            className="w-full text-sm border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:border-[#6366F1]"
                        />
                        <p className="text-[11px] text-neutral-500 mt-1">
                            {fmt(openAt)} · {daysUntil(openAt)}일 후
                        </p>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">메시지</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="지금의 나에 대해, 미래의 나에게 들려주고 싶은 이야기…"
                            rows={10}
                            maxLength={5000}
                            className="w-full text-sm border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:border-[#6366F1] placeholder:text-neutral-400 resize-y"
                        />
                        <p className="text-[10px] text-neutral-400 mt-1 text-right">{message.length} / 5000</p>
                    </div>
                </div>
                <div className="border-t border-neutral-100 p-4 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-900">
                        취소
                    </button>
                    <button
                        onClick={save}
                        disabled={!title.trim() || !message.trim() || saving}
                        className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-lg disabled:opacity-40 inline-flex items-center gap-1.5"
                    >
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        잠금 저장
                    </button>
                </div>
            </div>
        </div>
    );
}

function CapsuleDetailModal({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
    const [data, setData] = useState<CapsuleDetail | null>(null);
    const [opening, setOpening] = useState(false);
    const [note, setNote] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await fetch(`/api/myverse/capsules/${id}`);
            if (!res.ok || cancelled) return;
            const d = await res.json();
            if (!cancelled) {
                setData(d.capsule);
                setNote(d.capsule.note_after_open ?? "");
            }
        })();
        return () => { cancelled = true; };
    }, [id]);

    async function openCapsule() {
        if (!data) return;
        setOpening(true);
        try {
            const res = await fetch(`/api/myverse/capsules/${id}/open`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note_after_open: note }),
            });
            if (res.ok) {
                // 다시 조회 (message가 보이게)
                const r = await fetch(`/api/myverse/capsules/${id}`);
                if (r.ok) setData((await r.json()).capsule);
                onChanged();
            }
        } finally {
            setOpening(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[9000] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
            <div className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 pb-3 border-b border-neutral-100">
                    <h2 className="text-base font-semibold text-neutral-900 truncate">
                        {data?.title ?? "불러오는 중…"}
                    </h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 shrink-0">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                    {!data ? (
                        <p className="text-sm text-neutral-400 italic">불러오는 중…</p>
                    ) : data.status === "pending" ? (
                        <div className="text-center py-10">
                            <Lock className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                            <p className="text-sm text-neutral-700 font-medium mb-1">아직 잠겨 있어요</p>
                            <p className="text-xs text-neutral-500">
                                {fmt(data.open_at)} · {daysUntil(data.open_at)}일 후 열 수 있어요
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-3">
                                보낸 날: {fmt(data.created_at)}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {fmt(data.created_at)} → {fmt(data.open_at)}
                                {data.opened_at && ` · ${fmt(data.opened_at)} 열람`}
                            </div>
                            <div className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed bg-[#6366F1]/[0.03] border border-[#6366F1]/15 rounded-lg p-4">
                                {data.message}
                            </div>
                            {data.status === "ready" && !data.opened_at && (
                                <div className="border-t border-neutral-100 pt-4">
                                    <p className="text-[11px] text-neutral-500 mb-2">
                                        지금 이 캡슐을 열며 한 줄을 더해보세요 (선택)
                                    </p>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        rows={3}
                                        placeholder="그때의 나에게 답장…"
                                        maxLength={1000}
                                        className="w-full text-sm border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:border-[#6366F1] placeholder:text-neutral-400 resize-none"
                                    />
                                </div>
                            )}
                            {data.note_after_open && data.opened_at && (
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">열며 적은 한 줄</div>
                                    <p className="text-sm text-neutral-700 italic">{data.note_after_open}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {data?.status === "ready" && !data.opened_at && (
                    <div className="border-t border-neutral-100 p-4 flex justify-end gap-2">
                        <button
                            onClick={openCapsule}
                            disabled={opening}
                            className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-lg inline-flex items-center gap-1.5 disabled:opacity-40"
                        >
                            {opening ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
                            영구 열림으로 표시
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
