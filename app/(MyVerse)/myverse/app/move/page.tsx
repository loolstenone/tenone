"use client";

import { useEffect, useState } from "react";
import { Loader2, Navigation, Plus, X, MapPin, Train, Car, Bus, Bike, Footprints, Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DomainBackLink } from "@/features/myverse/app/DomainBackLink";

interface MoveEntry {
    id: string;
    date: string;
    start_time: string | null;
    activity: string;
    note: string | null;
    body_data?: Record<string, unknown> | null;
}

const TRANSPORT_MODES = [
    { key: "walk",   label: "도보",   icon: Footprints, color: "#10B981" },
    { key: "subway", label: "지하철", icon: Train,       color: "#6366F1" },
    { key: "bus",    label: "버스",   icon: Bus,         color: "#0EA5E9" },
    { key: "car",    label: "자동차", icon: Car,         color: "#F59E0B" },
    { key: "bike",   label: "자전거", icon: Bike,        color: "#A855F7" },
    { key: "plane",  label: "항공",   icon: Plane,       color: "#EC4899" },
] as const;
type ModeKey = typeof TRANSPORT_MODES[number]["key"];

export const dynamic = "force-dynamic";

export default function MovePage() {
    const [items, setItems] = useState<MoveEntry[]>([]);
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
                .select("id, date, start_time, activity, note, body_data")
                .eq("member_id", (member as { id: string }).id)
                .eq("domain", "move")
                .order("date", { ascending: false })
                .order("start_time", { ascending: false })
                .limit(100);
            setItems((data ?? []) as MoveEntry[]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const weekAgo = new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

    const todayItems = items.filter(it => it.date === today);
    const weekItems = items.filter(it => it.date >= weekAgo);

    function sumKm(list: MoveEntry[]) {
        return list.reduce((acc, it) => acc + ((it.body_data as Record<string, unknown> | null)?.distance_km as number | undefined ?? 0), 0);
    }

    const todayKm = sumKm(todayItems);
    const weekKm = sumKm(weekItems);
    const totalPlaces = new Set(items.map(it => it.activity)).size;

    function groupByDate(list: MoveEntry[]) {
        const g: Record<string, MoveEntry[]> = {};
        for (const it of list) {
            if (!g[it.date]) g[it.date] = [];
            g[it.date].push(it);
        }
        return g;
    }

    const grouped = groupByDate(items);
    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return (
        <div>
            <header className="px-6 pt-6 pb-4 border-b border-neutral-200 bg-white">
                <div className="flex items-center justify-between">
                    <div>
                        <DomainBackLink domain="move" />
                        <div className="flex items-center gap-2 mb-1 mt-2">
                            <Navigation className="h-3 w-3 text-gray-500" />
                            <span className="text-[10px] uppercase tracking-widest text-gray-500">Move</span>
                        </div>
                        <h1 className="text-2xl font-serif text-neutral-900">이동</h1>
                        <p className="text-xs text-neutral-500 mt-1">동선·체크인·이동 기록</p>
                    </div>
                    <button
                        onClick={() => setAddOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-600 text-white hover:bg-gray-700 rounded-lg"
                    >
                        <Plus className="h-3.5 w-3.5" /> 체크인
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 pb-0">
                {[
                    { label: "오늘 이동", value: `${todayKm.toFixed(1)}km`, sub: `${todayItems.length}건` },
                    { label: "이번 주",   value: `${weekKm.toFixed(1)}km`,  sub: `${weekItems.length}건` },
                    { label: "방문 장소", value: `${totalPlaces}곳`,        sub: "누계" },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-neutral-500 mb-1">{s.label}</p>
                        <p className="text-lg font-bold text-neutral-900">{s.value}</p>
                        <p className="text-[10px] text-neutral-400">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Move log */}
            <div className="p-4">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                ) : dates.length === 0 ? (
                    <EmptyMove onAdd={() => setAddOpen(true)} />
                ) : (
                    <div className="space-y-6">
                        {dates.map(date => (
                            <DateGroup key={date} date={date} items={grouped[date]} />
                        ))}
                    </div>
                )}
            </div>

            {addOpen && memberId && (
                <AddMoveModal memberId={memberId} onClose={() => setAddOpen(false)} onAdded={load} />
            )}
        </div>
    );
}

function DateGroup({ date, items }: { date: string; items: MoveEntry[] }) {
    const dt = new Date(date + "T00:00:00+09:00");
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const label = `${dt.getMonth() + 1}월 ${dt.getDate()}일 (${dayNames[dt.getDay()]})`;
    const totalKm = items.reduce((acc, it) => acc + ((it.body_data as Record<string, unknown> | null)?.distance_km as number | undefined ?? 0), 0);

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-neutral-500">{label}</span>
                {totalKm > 0 && <span className="text-[10px] text-gray-400">{totalKm.toFixed(1)}km</span>}
                <div className="flex-1 h-px bg-neutral-100" />
            </div>
            <div className="space-y-2">
                {items.map(it => <MoveCard key={it.id} item={it} />)}
            </div>
        </div>
    );
}

function MoveCard({ item }: { item: MoveEntry }) {
    const bd = item.body_data as Record<string, unknown> | null;
    const modeKey = bd?.transport as ModeKey | undefined;
    const mode = TRANSPORT_MODES.find(m => m.key === modeKey);
    const km = bd?.distance_km as number | undefined;
    const min = bd?.duration_min as number | undefined;
    const Icon = mode?.icon ?? MapPin;

    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: mode ? mode.color + "20" : "#F3F4F6" }}>
                    <Icon className="h-4 w-4" style={{ color: mode?.color ?? "#6B7280" }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">{item.activity}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        {mode && <span className="text-[10px] text-neutral-400">{mode.label}</span>}
                        {km !== undefined && km > 0 && <span className="text-[10px] text-neutral-400">{km.toFixed(1)}km</span>}
                        {min !== undefined && min > 0 && <span className="text-[10px] text-neutral-400">{min}분</span>}
                    </div>
                    {item.note && <p className="text-xs text-neutral-500 mt-1">{item.note}</p>}
                </div>
                {item.start_time && (
                    <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">{item.start_time.slice(0, 5)}</span>
                )}
            </div>
        </div>
    );
}

function EmptyMove({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="text-center py-14">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-3">
                <Navigation className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-neutral-500 mb-1">이동 기록이 없습니다</p>
            <p className="text-xs text-neutral-400 mb-4">방문 장소나 이동 경로를 체크인하세요</p>
            <button onClick={onAdd} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <Plus className="h-3.5 w-3.5" /> 첫 체크인
            </button>
        </div>
    );
}

function AddMoveModal({ memberId, onClose, onAdded }: { memberId: string; onClose: () => void; onAdded: () => void }) {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const nowHHMM = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" });

    const [date, setDate] = useState(today);
    const [time, setTime] = useState(nowHHMM);
    const [place, setPlace] = useState("");
    const [transport, setTransport] = useState<ModeKey>("walk");
    const [km, setKm] = useState("");
    const [minutes, setMinutes] = useState("");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);

    async function submit() {
        if (!place.trim()) return;
        setSaving(true);
        try {
            const supabase = createClient();
            await supabase.from("myverse_daily_routines").insert({
                member_id: memberId,
                date,
                start_time: time || null,
                activity: place.trim(),
                note: note || null,
                domain: "move",
                visibility: "private",
                body_data: {
                    transport,
                    distance_km: km ? parseFloat(km) : 0,
                    duration_min: minutes ? parseInt(minutes) : 0,
                },
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
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl flex flex-col md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:rounded-xl max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 sticky top-0 bg-white">
                    <h2 className="text-sm font-semibold text-neutral-900">이동 체크인</h2>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
                </div>

                <div className="px-5 py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] text-neutral-500">날짜</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
                        </div>
                        <div>
                            <label className="text-[11px] text-neutral-500">시간</label>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)}
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] text-neutral-500">장소·경로</label>
                        <input type="text" value={place} onChange={e => setPlace(e.target.value)}
                            placeholder="예) 강남역, 회사, 스타벅스"
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
                    </div>

                    <div>
                        <label className="text-[11px] text-neutral-500 block mb-1.5">이동 수단</label>
                        <div className="grid grid-cols-3 gap-2">
                            {TRANSPORT_MODES.map(m => {
                                const Icon = m.icon;
                                return (
                                    <button key={m.key} onClick={() => setTransport(m.key)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${transport === m.key ? "border-current" : "border-neutral-100 text-neutral-400 hover:border-neutral-200"}`}
                                        style={transport === m.key ? { color: m.color, borderColor: m.color } : {}}>
                                        <Icon className="h-3.5 w-3.5" />
                                        {m.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] text-neutral-500">거리 (km)</label>
                            <input type="number" min="0" step="0.1" value={km} onChange={e => setKm(e.target.value)}
                                placeholder="0.0"
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
                        </div>
                        <div>
                            <label className="text-[11px] text-neutral-500">소요 시간 (분)</label>
                            <input type="number" min="0" value={minutes} onChange={e => setMinutes(e.target.value)}
                                placeholder="0"
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] text-neutral-500">메모 (선택)</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)}
                            placeholder="오늘 이동에 대한 메모" rows={2}
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-gray-400" />
                    </div>
                </div>

                <div className="px-5 pb-5">
                    <button onClick={submit} disabled={saving || !place.trim()}
                        className="w-full py-2.5 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-40 flex items-center justify-center gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        체크인 저장
                    </button>
                </div>
            </div>
        </>
    );
}
