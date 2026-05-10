"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, Coffee, Plus, X, Smile, Frown, Meh, SmilePlus, Angry, Image as ImageIcon, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CoachInsightCard } from "@/features/myverse/app/CoachInsightCard";
import { DomainBackLink } from "@/features/myverse/app/DomainBackLink";
import { LaneHeader } from "@/features/myverse/app/LaneHeader";

type Mood = 1 | 2 | 3 | 4 | 5;

interface DiaryEntry {
    id: string;
    date: string;
    happened_at: string | null;
    caption: string | null;
    media_url: string | null;
    media_type: string | null;
    visibility: string;
    body_data?: Record<string, unknown> | null;
}

interface RoutineEntry {
    id: string;
    date: string;
    start_time: string | null;
    activity: string;
    note: string | null;
    body_data?: Record<string, unknown> | null;
    visibility: string;
}

type FeedItem =
    | { _kind: "diary"; entry: DiaryEntry }
    | { _kind: "routine"; entry: RoutineEntry };

const MOOD_META: Record<Mood, { icon: typeof Smile; label: string; color: string }> = {
    5: { icon: SmilePlus, label: "최고",   color: "#10B981" },
    4: { icon: Smile,     label: "좋음",   color: "#6366F1" },
    3: { icon: Meh,       label: "보통",   color: "#F59E0B" },
    2: { icon: Frown,     label: "나쁨",   color: "#F97316" },
    1: { icon: Angry,     label: "최악",   color: "#EF4444" },
};

export const dynamic = "force-dynamic";

export default function LifestylePage() {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [memberId, setMemberId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from("members").select("id").eq("auth_id", user.id).maybeSingle();
            setMemberId((data as { id: string } | null)?.id ?? null);
        })();
    }, []);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch("/api/myverse/feed?domain=daily&days=60");
            if (!res.ok) return;
            const json = await res.json();
            const feed: FeedItem[] = (json.items ?? []).map((it: Record<string, unknown>) => {
                if (it.type === "moment") return { _kind: "diary" as const, entry: it as unknown as DiaryEntry };
                return { _kind: "routine" as const, entry: it as unknown as RoutineEntry };
            });
            setItems(feed);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    function groupByDate(items: FeedItem[]): Record<string, FeedItem[]> {
        const g: Record<string, FeedItem[]> = {};
        for (const it of items) {
            const d = it._kind === "diary" ? it.entry.date : it.entry.date;
            if (!g[d]) g[d] = [];
            g[d].push(it);
        }
        return g;
    }

    const grouped = groupByDate(items);
    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <header className="px-5 sm:px-10 pt-8 pb-4 border-b border-neutral-200 bg-white">
                <LaneHeader
                    icon="coffee"
                    label="DAILY"
                    title="일상"
                    subtitle="일기·기분·자유 기록"
                    accent="#F59E0B"
                    backLink={<DomainBackLink domain="daily" />}
                    actions={
                        <button
                            onClick={() => setAddOpen(true)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-500 text-white hover:bg-amber-600 rounded-lg"
                        >
                            <Plus className="h-3.5 w-3.5" /> 기록
                        </button>
                    }
                />
            </header>

            <div className="p-4">
                <div className="mb-4">
                    <CoachInsightCard autoGenerate={false} />
                </div>
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                ) : dates.length === 0 ? (
                    <EmptyDaily onAdd={() => setAddOpen(true)} />
                ) : (
                    <div className="space-y-6">
                        {dates.map(date => (
                            <DateGroup key={date} date={date} items={grouped[date]} />
                        ))}
                    </div>
                )}
            </div>

            {addOpen && memberId && (
                <AddDiaryModal memberId={memberId} onClose={() => setAddOpen(false)} onAdded={load} />
            )}
        </div>
    );
}

function DateGroup({ date, items }: { date: string; items: FeedItem[] }) {
    const dt = new Date(date + "T00:00:00+09:00");
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const label = `${dt.getMonth() + 1}월 ${dt.getDate()}일 (${dayNames[dt.getDay()]})`;

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-neutral-500">{label}</span>
                <div className="flex-1 h-px bg-neutral-100" />
            </div>
            <div className="space-y-2">
                {items.map((it, i) => (
                    <FeedCard key={i} item={it} />
                ))}
            </div>
        </div>
    );
}

function FeedCard({ item }: { item: FeedItem }) {
    if (item._kind === "diary") {
        const e = item.entry;
        const mood = (e.body_data as Record<string, unknown> | null)?.mood as Mood | undefined;
        const m = mood ? MOOD_META[mood] : null;
        return (
            <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-2">
                    {m && (
                        <div className="shrink-0 flex items-center gap-1 text-xs font-medium" style={{ color: m.color }}>
                            <m.icon className="h-4 w-4" />
                            <span>{m.label}</span>
                        </div>
                    )}
                    {e.happened_at && (
                        <span className="ml-auto text-[10px] text-neutral-400 tabular-nums shrink-0">
                            {new Date(e.happened_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" })}
                        </span>
                    )}
                </div>
                {e.media_url && e.media_type === "image" && (
                    <img src={e.media_url} alt="" className="w-full rounded-lg object-cover max-h-48" />
                )}
                {e.caption && <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">{e.caption}</p>}
            </div>
        );
    }

    const e = item.entry;
    const mood = (e.body_data as Record<string, unknown> | null)?.mood as Mood | undefined;
    const m = mood ? MOOD_META[mood] : null;
    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
                {m && <m.icon className="h-4 w-4 shrink-0 mt-0.5" style={{ color: m.color }} />}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-800">{e.activity}</p>
                    {e.note && <p className="text-xs text-neutral-500 mt-1 whitespace-pre-wrap">{e.note}</p>}
                </div>
                {e.start_time && (
                    <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">{e.start_time.slice(0, 5)}</span>
                )}
            </div>
        </div>
    );
}

function EmptyDaily({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="text-center py-14">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-50 mb-3">
                <Coffee className="h-5 w-5 text-amber-400" />
            </div>
            <p className="text-sm text-neutral-500 mb-3">아직 일상 기록이 없습니다</p>
            <button onClick={onAdd} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                <Plus className="h-3.5 w-3.5" /> 첫 기록 남기기
            </button>
        </div>
    );
}

/* ── 다이어리 추가 모달 ── */
function AddDiaryModal({ memberId, onClose, onAdded }: { memberId: string; onClose: () => void; onAdded: () => void }) {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const nowISO = new Date().toISOString();

    const [date, setDate] = useState(today);
    const [text, setText] = useState("");
    const [mood, setMood] = useState<Mood>(3);
    const [saving, setSaving] = useState(false);
    const textRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { textRef.current?.focus(); }, []);

    async function submit() {
        if (!text.trim() && mood === 3) return;
        setSaving(true);
        try {
            const supabase = createClient();
            await supabase.from("myverse_daily_routines").insert({
                member_id: memberId,
                date,
                activity: text.slice(0, 50) || "일상 기록",
                note: text,
                domain: "daily",
                visibility: "private",
                body_data: { mood },
                happened_at: nowISO,
            });
            onAdded();
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl flex flex-col md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                    <h2 className="text-sm font-semibold text-neutral-900">오늘 기록</h2>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
                </div>

                <div className="px-5 py-4 space-y-4">
                    {/* 날짜 */}
                    <div>
                        <label className="text-[11px] text-neutral-500">날짜</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400" />
                    </div>

                    {/* 기분 */}
                    <div>
                        <label className="text-[11px] text-neutral-500 block mb-1.5">기분</label>
                        <div className="flex gap-2">
                            {([5, 4, 3, 2, 1] as Mood[]).map(n => {
                                const m = MOOD_META[n];
                                return (
                                    <button key={n} onClick={() => setMood(n)}
                                        className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${mood === n ? "border-current" : "border-neutral-100 opacity-50 hover:opacity-80"}`}
                                        style={{ color: m.color }}>
                                        <m.icon className="h-5 w-5" />
                                        <span className="text-[10px] font-medium">{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 텍스트 */}
                    <div>
                        <label className="text-[11px] text-neutral-500">내용</label>
                        <textarea ref={textRef} value={text} onChange={e => setText(e.target.value)}
                            placeholder="오늘 어떤 하루였나요?" rows={5}
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-amber-400" />
                    </div>
                </div>

                <div className="px-5 pb-5">
                    <button onClick={submit} disabled={saving || (!text.trim())}
                        className="w-full py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-40 flex items-center justify-center gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        저장
                    </button>
                </div>
            </div>
        </>
    );
}
