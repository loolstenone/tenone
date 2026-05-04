"use client";

import { useEffect, useState, useRef } from "react";
import { Bookmark, Plus, Trash2, Clock, Loader2, ChevronDown, ChevronUp } from "lucide-react";

type Place = {
    id: string;
    date: string;
    visited_at: string | null;
    place_name: string;
    address: string | null;
    category: string;
    duration_min: number | null;
    note: string | null;
};

// 방문 장소 전용 카테고리 — routines와 별개의 분류
// (이동 시간은 일과 기록의 transport 카테고리에서 관리하므로 여기서는 제외)
const PLACE_CATEGORIES: { key: string; label: string; color: string }[] = [
    { key: "general",   label: "일반",   color: "bg-neutral-400" },
    { key: "work",      label: "업무",   color: "bg-blue-500" },
    { key: "meal",      label: "식사",   color: "bg-orange-400" },
    { key: "exercise",  label: "운동",   color: "bg-green-500" },
    { key: "leisure",   label: "여가",   color: "bg-violet-400" },
    { key: "home",      label: "집",     color: "bg-teal-500" },
    { key: "shopping",  label: "쇼핑",   color: "bg-pink-400" },
    { key: "medical",   label: "의료",   color: "bg-red-400" },
    { key: "social",    label: "모임",   color: "bg-amber-400" },
];

function catMeta(key: string) {
    return PLACE_CATEGORIES.find(c => c.key === key) ?? PLACE_CATEGORIES[0];
}

function fmtTime(t: string | null) {
    if (!t) return "";
    return t.slice(0, 5);
}

function fmtDuration(min: number | null) {
    if (!min) return "";
    if (min < 60) return `${min}분`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}시간 ${m}분` : `${h}시간`;
}

export function DailyPlacesCard({ date, bare = false, hideAdd = false }: { date: string; bare?: boolean; hideAdd?: boolean }) {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    // 입력 필드
    const [inputName, setInputName] = useState("");
    const [inputTime, setInputTime] = useState("");
    const [inputCat, setInputCat] = useState("general");
    const [inputDuration, setInputDuration] = useState("");
    const [inputNote, setInputNote] = useState("");
    const nameRef = useRef<HTMLInputElement>(null);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch(`/api/planners/places?date=${date}`);
            if (res.ok) {
                const d = await res.json();
                setPlaces(d.places ?? []);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [date]);

    async function addPlace() {
        if (!inputName.trim()) return;
        const res = await fetch("/api/planners/places", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date,
                place_name: inputName.trim(),
                visited_at: inputTime || null,
                category: inputCat,
                duration_min: inputDuration ? parseInt(inputDuration, 10) : null,
                note: inputNote.trim() || null,
            }),
        });
        if (res.ok) {
            const d = await res.json();
            setPlaces(prev => [...prev, d.place].sort((a, b) => {
                if (!a.visited_at) return 1;
                if (!b.visited_at) return -1;
                return a.visited_at.localeCompare(b.visited_at);
            }));
            setInputName("");
            setInputTime("");
            setInputCat("general");
            setInputDuration("");
            setInputNote("");
            setAdding(false);
        }
    }

    async function deletePlace(id: string) {
        const res = await fetch(`/api/planners/places?id=${id}`, { method: "DELETE" });
        if (res.ok) setPlaces(prev => prev.filter(p => p.id !== id));
    }

    const Wrapper = bare ? "div" : "section";
    return (
        <Wrapper
            className={bare ? "" : "bg-white planners-dark:bg-[#1C1C1C] border border-neutral-200 planners-dark:border-[#2A2A2A] rounded-xl"}
            style={{ color: "var(--planners-font, inherit)" }}
        >
            {/* 헤더 */}
            <div className={`flex items-center justify-between ${bare ? "px-5 pt-4 pb-2" : "px-5 py-3.5 border-b border-neutral-100 planners-dark:border-[#2A2A2A]"}`}>
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 planners-dark:text-neutral-500 hover:text-neutral-600 transition-colors"
                >
                    <Bookmark className="h-3.5 w-3.5" />
                    방문 장소
                    {collapsed
                        ? <ChevronDown className="h-3 w-3 ml-1" />
                        : <ChevronUp className="h-3 w-3 ml-1" />
                    }
                </button>
                {!hideAdd && (
                    <button
                        onClick={() => { setAdding(a => !a); setTimeout(() => nameRef.current?.focus(), 50); }}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 planners-dark:hover:text-neutral-200 hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] transition-colors"
                        title="방문 장소 추가"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {!collapsed && (
                <div className="p-4 space-y-2">
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                        </div>
                    ) : places.length === 0 && !adding ? (
                        hideAdd ? null : (
                            <p className="text-xs text-neutral-300 planners-dark:text-neutral-600 text-center py-4 italic">
                                오늘 방문한 장소를 기록하세요 (이동 시간은 일과 기록에서)
                            </p>
                        )
                    ) : (
                        <div className="space-y-1.5">
                            {places.map((p) => {
                                const meta = catMeta(p.category);
                                return (
                                    <div
                                        key={p.id}
                                        className="group flex items-start gap-3 py-2 px-1 rounded-lg hover:bg-neutral-50 planners-dark:hover:bg-[#252525] transition-colors"
                                    >
                                        {/* 카테고리 컬러 도트 */}
                                        <div className="mt-1.5 shrink-0">
                                            <div className={`h-2 w-2 rounded-full ${meta.color}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <span className="text-sm font-medium text-neutral-800 planners-dark:text-neutral-100 truncate">
                                                    {p.place_name}
                                                </span>
                                                <span className="text-[10px] text-neutral-400 planners-dark:text-neutral-500 shrink-0">
                                                    {meta.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                {p.visited_at && (
                                                    <span className="flex items-center gap-0.5 text-[11px] text-neutral-400">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {fmtTime(p.visited_at)}
                                                    </span>
                                                )}
                                                {p.duration_min && (
                                                    <span className="text-[11px] text-neutral-400">
                                                        {fmtDuration(p.duration_min)}
                                                    </span>
                                                )}
                                                {p.address && (
                                                    <span className="text-[11px] text-neutral-400 truncate max-w-[160px]">
                                                        {p.address}
                                                    </span>
                                                )}
                                            </div>
                                            {p.note && (
                                                <p className="text-xs text-neutral-500 planners-dark:text-neutral-400 mt-0.5 line-clamp-1 italic">
                                                    {p.note}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => deletePlace(p.id)}
                                            className="md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded text-neutral-300 hover:text-rose-400 transition-all shrink-0"
                                            title="삭제"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 입력 폼 */}
                    {adding && (
                        <div className="border border-neutral-200 planners-dark:border-[#333] rounded-xl p-3 space-y-2 mt-2">
                            <input
                                ref={nameRef}
                                type="text"
                                value={inputName}
                                onChange={e => setInputName(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") addPlace(); if (e.key === "Escape") setAdding(false); }}
                                placeholder="장소 이름"
                                className="w-full text-sm bg-transparent text-neutral-800 planners-dark:text-neutral-100 placeholder:text-neutral-300 focus:outline-none"
                            />

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-wide">방문 시각</label>
                                    <input
                                        type="time"
                                        value={inputTime}
                                        onChange={e => setInputTime(e.target.value)}
                                        className="w-full text-sm bg-transparent text-neutral-700 planners-dark:text-neutral-200 focus:outline-none mt-0.5"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-neutral-400 uppercase tracking-wide">체류(분)</label>
                                    <input
                                        type="number"
                                        value={inputDuration}
                                        onChange={e => setInputDuration(e.target.value)}
                                        placeholder="30"
                                        min={1}
                                        className="w-full text-sm bg-transparent text-neutral-700 planners-dark:text-neutral-200 placeholder:text-neutral-300 focus:outline-none mt-0.5"
                                    />
                                </div>
                            </div>

                            {/* 카테고리 pill 선택 */}
                            <div className="flex flex-wrap gap-1">
                                {PLACE_CATEGORIES.map(c => (
                                    <button
                                        key={c.key}
                                        onClick={() => setInputCat(c.key)}
                                        className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                                            inputCat === c.key
                                                ? "bg-[#0F766E] text-white"
                                                : "bg-neutral-100 planners-dark:bg-[#2A2A2A] text-neutral-500 hover:bg-neutral-200"
                                        }`}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>

                            <input
                                type="text"
                                value={inputNote}
                                onChange={e => setInputNote(e.target.value)}
                                placeholder="메모 (선택)"
                                className="w-full text-xs bg-transparent text-neutral-600 planners-dark:text-neutral-300 placeholder:text-neutral-300 focus:outline-none"
                            />

                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={addPlace}
                                    disabled={!inputName.trim()}
                                    className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-[#0F766E] text-white disabled:opacity-40 hover:bg-[#0d5e56] transition-colors"
                                >
                                    추가
                                </button>
                                <button
                                    onClick={() => setAdding(false)}
                                    className="px-3 py-1.5 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] transition-colors"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Wrapper>
    );
}
