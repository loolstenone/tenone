"use client";

import { useEffect, useState } from "react";
import { Loader2, Plane, Plus, X, MapPin, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TravelEntry {
    id: string;
    date: string;
    activity: string;        // 여행 제목
    note: string | null;
    body_data?: Record<string, unknown> | null;
    visibility: string;
}

const TRAVEL_TAGS = ["국내", "해외", "당일", "1박", "2박 이상", "가족", "혼자", "친구", "커플", "출장"];

export const dynamic = "force-dynamic";

export default function TravelPage() {
    const [items, setItems] = useState<TravelEntry[]>([]);
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
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: member } = await supabase.from("members").select("id").eq("auth_id", user.id).maybeSingle();
            if (!member) return;
            const { data } = await supabase
                .from("myverse_daily_routines")
                .select("id, date, activity, note, body_data, visibility")
                .eq("member_id", (member as { id: string }).id)
                .eq("domain", "travel")
                .order("date", { ascending: false })
                .limit(100);
            setItems((data ?? []) as TravelEntry[]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    // Group into "trips" — consecutive entries or same body_data.trip_id
    function groupTrips(list: TravelEntry[]): TravelEntry[][] {
        const trips: TravelEntry[][] = [];
        const map: Record<string, TravelEntry[]> = {};
        for (const it of list) {
            const tripId = (it.body_data as Record<string, unknown> | null)?.trip_id as string | undefined ?? it.id;
            if (!map[tripId]) { map[tripId] = []; trips.push(map[tripId]); }
            map[tripId].push(it);
        }
        return trips;
    }

    const trips = groupTrips(items);
    const totalCountries = new Set(items.map(it => (it.body_data as Record<string, unknown> | null)?.country as string | undefined).filter(Boolean)).size;
    const totalCities = new Set(items.map(it => (it.body_data as Record<string, unknown> | null)?.destination as string | undefined).filter(Boolean)).size;

    return (
        <div>
            <header className="px-6 pt-6 pb-4 border-b border-neutral-200 bg-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Plane className="h-3 w-3 text-pink-500" />
                            <span className="text-[10px] uppercase tracking-widest text-pink-500">Travel</span>
                        </div>
                        <h1 className="text-2xl font-serif text-neutral-900">여행</h1>
                        <p className="text-xs text-neutral-500 mt-1">떠났던 모든 여행의 기록</p>
                    </div>
                    <button
                        onClick={() => setAddOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-pink-500 text-white hover:bg-pink-600 rounded-lg"
                    >
                        <Plus className="h-3.5 w-3.5" /> 여행 추가
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 pb-0">
                {[
                    { label: "여행 횟수", value: `${trips.length}회` },
                    { label: "방문 도시", value: `${totalCities}곳` },
                    { label: "방문 국가", value: `${totalCountries || "-"}` },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-neutral-500 mb-1">{s.label}</p>
                        <p className="text-lg font-bold text-neutral-900">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Trip list */}
            <div className="p-4">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                ) : trips.length === 0 ? (
                    <EmptyTravel onAdd={() => setAddOpen(true)} />
                ) : (
                    <div className="space-y-3">
                        {trips.map((trip, i) => <TripCard key={i} entries={trip} />)}
                    </div>
                )}
            </div>

            {addOpen && memberId && (
                <AddTravelModal memberId={memberId} onClose={() => setAddOpen(false)} onAdded={load} />
            )}
        </div>
    );
}

function TripCard({ entries }: { entries: TravelEntry[] }) {
    const [open, setOpen] = useState(false);
    const main = entries[0];
    const bd = main.body_data as Record<string, unknown> | null;
    const dest = bd?.destination as string | undefined;
    const country = bd?.country as string | undefined;
    const endDate = bd?.end_date as string | undefined;
    const tags = bd?.tags as string[] | undefined;
    const nights = (() => {
        if (!endDate) return 0;
        const d1 = new Date(main.date);
        const d2 = new Date(endDate);
        return Math.round((d2.getTime() - d1.getTime()) / 86400000);
    })();

    const dtStart = new Date(main.date + "T00:00:00+09:00");
    const fmtDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

    return (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <button className="w-full text-left p-4" onClick={() => setOpen(o => !o)}>
                <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                        <Plane className="h-5 w-5 text-pink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                            {main.activity}{dest && dest !== main.activity ? ` · ${dest}` : ""}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            {country && <span className="text-[10px] text-neutral-400">{country}</span>}
                            <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                                <Calendar className="h-2.5 w-2.5" />
                                {fmtDate(dtStart)}{endDate ? ` – ${fmtDate(new Date(endDate + "T00:00:00+09:00"))}` : ""}
                                {nights > 0 && ` (${nights}박)`}
                            </span>
                        </div>
                        {tags && tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {tags.map(t => (
                                    <span key={t} className="px-1.5 py-0.5 bg-pink-50 text-pink-600 text-[9px] rounded-full">{t}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    {open ? <ChevronUp className="h-4 w-4 text-neutral-300 shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-neutral-300 shrink-0 mt-1" />}
                </div>
            </button>
            {open && (
                <div className="border-t border-neutral-100 px-4 py-3 space-y-2">
                    {entries.map(e => (
                        <div key={e.id} className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 text-pink-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-neutral-700">{e.activity}</p>
                                {e.note && <p className="text-[11px] text-neutral-400 whitespace-pre-wrap mt-0.5">{e.note}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function EmptyTravel({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="text-center py-14">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-pink-50 mb-3">
                <Plane className="h-5 w-5 text-pink-400" />
            </div>
            <p className="text-sm text-neutral-500 mb-1">여행 기록이 없습니다</p>
            <p className="text-xs text-neutral-400 mb-4">떠났던 여행을 추가해보세요</p>
            <button onClick={onAdd} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                <Plus className="h-3.5 w-3.5" /> 첫 여행 기록
            </button>
        </div>
    );
}

function AddTravelModal({ memberId, onClose, onAdded }: { memberId: string; onClose: () => void; onAdded: () => void }) {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

    const [title, setTitle] = useState("");
    const [destination, setDestination] = useState("");
    const [country, setCountry] = useState("");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);

    function toggleTag(t: string) {
        setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    }

    async function submit() {
        if (!title.trim()) return;
        setSaving(true);
        try {
            const supabase = createClient();
            await supabase.from("myverse_daily_routines").insert({
                member_id: memberId,
                date: startDate,
                activity: title.trim(),
                note: note || null,
                domain: "travel",
                visibility: "private",
                body_data: {
                    destination: destination || null,
                    country: country || null,
                    end_date: endDate !== startDate ? endDate : null,
                    tags: selectedTags,
                },
            });
            onAdded();
            onClose();
        } finally {
            setSaving(false);
        }
    }

    const nights = (() => {
        const d1 = new Date(startDate);
        const d2 = new Date(endDate);
        const n = Math.round((d2.getTime() - d1.getTime()) / 86400000);
        return n;
    })();

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl flex flex-col md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:rounded-xl max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 sticky top-0 bg-white">
                    <h2 className="text-sm font-semibold text-neutral-900">여행 추가</h2>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
                </div>

                <div className="px-5 py-4 space-y-4">
                    <div>
                        <label className="text-[11px] text-neutral-500">여행 제목</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="예) 제주도 봄 여행, 도쿄 출장"
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] text-neutral-500">목적지</label>
                            <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
                                placeholder="예) 제주시, 도쿄"
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-400" />
                        </div>
                        <div>
                            <label className="text-[11px] text-neutral-500">국가 (해외여행)</label>
                            <input type="text" value={country} onChange={e => setCountry(e.target.value)}
                                placeholder="예) 일본, 태국"
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] text-neutral-500">출발일</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-400" />
                        </div>
                        <div>
                            <label className="text-[11px] text-neutral-500">
                                귀국·도착일 {nights > 0 && <span className="text-pink-500">({nights}박)</span>}
                            </label>
                            <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)}
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-400" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] text-neutral-500 block mb-1.5">태그</label>
                        <div className="flex flex-wrap gap-1.5">
                            {TRAVEL_TAGS.map(t => (
                                <button key={t} onClick={() => toggleTag(t)}
                                    className={`px-2.5 py-1 text-xs rounded-full border transition-all ${selectedTags.includes(t) ? "bg-pink-500 text-white border-pink-500" : "border-neutral-200 text-neutral-500 hover:border-pink-300"}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] text-neutral-500">메모</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)}
                            placeholder="여행에 대한 짧은 기록" rows={3}
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-pink-400" />
                    </div>
                </div>

                <div className="px-5 pb-5">
                    <button onClick={submit} disabled={saving || !title.trim()}
                        className="w-full py-2.5 bg-pink-500 text-white text-sm font-semibold rounded-lg hover:bg-pink-600 disabled:opacity-40 flex items-center justify-center gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        저장
                    </button>
                </div>
            </div>
        </>
    );
}
