"use client";

// AI 일기 — 오늘의 흔적·일과·장소를 합성해 1-2 문장 일기 초안을 받고, 편집·저장.
// 저장 위치: myverse_daily.note (요약 노트). 후속 별도 ai_diary 컬럼 분리 검토.

import { useEffect, useState } from "react";
import { Sparkles, Loader2, ChevronLeft, ChevronRight, Calendar, Save, RefreshCw } from "lucide-react";

function todayKST(): string {
    return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function shiftDate(d: string, delta: number): string {
    const dt = new Date(d + "T00:00:00");
    dt.setDate(dt.getDate() + delta);
    return dt.toISOString().slice(0, 10);
}

function fmtDate(d: string): string {
    return new Date(d + "T00:00:00").toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}

export function AiDiaryView() {
    const [date, setDate] = useState<string>(todayKST());
    const [draft, setDraft] = useState<string>("");
    const [text, setText] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<string | null>(null);
    const [sources, setSources] = useState<{ moments: number; routines: number; places: number } | null>(null);
    const [empty, setEmpty] = useState(false);

    // 진입 시 저장된 노트 + 최초 초안 로드
    useEffect(() => {
        let cancelled = false;
        (async () => {
            // 기존 myverse_daily.note 가져오기 (이미 작성한 경우)
            try {
                const r = await fetch(`/api/myverse/daily?date=${date}`);
                if (r.ok && !cancelled) {
                    const d = await r.json();
                    if (d.daily?.note) {
                        setText(d.daily.note);
                        setSavedAt(d.daily.updated_at ?? null);
                    } else {
                        setText("");
                        setSavedAt(null);
                    }
                }
            } catch { /* daily route may not exist; ignore */ }
            setDraft("");
            setSources(null);
            setEmpty(false);
        })();
        return () => { cancelled = true; };
    }, [date]);

    async function generate() {
        setLoading(true);
        try {
            const res = await fetch("/api/myverse/daily/ai-diary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                alert(`AI 호출 실패: ${d.error || res.status}`);
                return;
            }
            const d = await res.json();
            setDraft(d.draft);
            setSources(d.sources ?? null);
            setEmpty(!!d.empty);
            // 본문이 비어 있을 때만 초안으로 채워줌 (사용자가 작성 중인 글 보호)
            if (!text.trim()) setText(d.draft);
        } finally {
            setLoading(false);
        }
    }

    async function save() {
        setSaving(true);
        try {
            const res = await fetch("/api/myverse/daily", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, note: text }),
            });
            if (res.ok) {
                setSavedAt(new Date().toISOString());
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
            {/* 헤더 */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI DIARY
                </div>
                <h1 className="text-3xl font-semibold text-neutral-900">하루를 한 줄로</h1>
                <p className="text-sm text-neutral-500 mt-1">
                    오늘의 흔적·일과·장소를 모아 AI가 한 문장으로 묶어줍니다 — 그 위에 내 말을 더하세요
                </p>
            </div>

            {/* 날짜 네비 */}
            <div className="flex items-center justify-between mb-4 bg-white border border-neutral-200 rounded-xl px-3 py-2">
                <button
                    onClick={() => setDate(shiftDate(date, -1))}
                    className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    <input
                        type="date"
                        value={date}
                        max={todayKST()}
                        onChange={(e) => setDate(e.target.value)}
                        className="text-sm bg-transparent text-neutral-800 focus:outline-none"
                    />
                </div>
                <button
                    onClick={() => setDate(shiftDate(date, 1))}
                    disabled={date >= todayKST()}
                    className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            <p className="text-xs text-neutral-500 mb-3">{fmtDate(date)}</p>

            {/* AI 초안 카드 */}
            <div className="bg-gradient-to-br from-[#6366F1]/[0.04] via-white to-[#6366F1]/[0.04] border border-[#6366F1]/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] uppercase tracking-widest text-[#6366F1] flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        AI 초안
                        {sources && (
                            <span className="text-neutral-400 normal-case tracking-normal ml-2">
                                흔적 {sources.moments} · 일과 {sources.routines} · 장소 {sources.places}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={generate}
                        disabled={loading}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#6366F1] hover:bg-[#6366F1]/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        {draft ? "다시 만들기" : "초안 만들기"}
                    </button>
                </div>
                {draft ? (
                    <p className={`text-sm leading-relaxed ${empty ? "text-neutral-400 italic" : "text-neutral-800"}`}>
                        {draft}
                    </p>
                ) : (
                    <p className="text-xs text-neutral-400 italic">
                        버튼을 눌러 AI에게 오늘을 요약해 달라고 해보세요
                    </p>
                )}
            </div>

            {/* 일기 본문 */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] uppercase tracking-widest text-neutral-500">
                        내 일기
                    </div>
                    {savedAt && (
                        <span className="text-[10px] text-neutral-400">
                            {new Date(savedAt).toLocaleString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 저장됨
                        </span>
                    )}
                </div>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    placeholder="AI 초안을 그대로 두거나, 내 말로 다시 써도 좋아요"
                    maxLength={5000}
                    className="w-full text-sm text-neutral-800 placeholder:text-neutral-400 bg-transparent focus:outline-none resize-y leading-relaxed"
                />
                <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-neutral-400">{text.length} / 5000</span>
                    <button
                        onClick={save}
                        disabled={saving || !text.trim()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium rounded-lg disabled:opacity-40"
                    >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}
