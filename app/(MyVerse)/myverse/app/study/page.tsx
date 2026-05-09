"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, BookOpen, Plus, X, Play, Square, Clock, Target, Flame, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DomainBackLink } from "@/features/myverse/app/DomainBackLink";
import { LaneHeader } from "@/features/myverse/app/LaneHeader";

interface StudySession {
    id: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    activity: string;
    note: string | null;
    body_data: Record<string, unknown> | null;
}

const SUBJECTS = ["수학", "영어", "국어", "과학", "사회", "프로그래밍", "디자인", "외국어", "자격증", "독서", "강의", "기타"];

export const dynamic = "force-dynamic";

export default function StudyPage() {
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [loading, setLoading] = useState(true);
    const [memberId, setMemberId] = useState<string | null>(null);
    const [addOpen, setAddOpen] = useState(false);

    // 타이머 상태
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerSubject, setTimerSubject] = useState(SUBJECTS[0]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerStartRef = useRef<string | null>(null);

    useEffect(() => {
        (async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from("members").select("id").eq("auth_id", user.id).maybeSingle();
            setMemberId((data as { id: string } | null)?.id ?? null);
            await loadSessions(supabase, (data as { id: string } | null)?.id ?? null);
        })();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    async function loadSessions(supabase: ReturnType<typeof createClient>, mid: string | null) {
        if (!mid) { setLoading(false); return; }
        setLoading(true);
        try {
            const { data } = await supabase
                .from("myverse_daily_routines")
                .select("id, date, start_time, end_time, activity, note, body_data")
                .eq("member_id", mid)
                .eq("domain", "study")
                .order("date", { ascending: false })
                .order("start_time", { ascending: false, nullsFirst: false })
                .limit(100);
            setSessions((data ?? []) as StudySession[]);
        } finally {
            setLoading(false);
        }
    }

    function reload() {
        const supabase = createClient();
        loadSessions(supabase, memberId);
    }

    const startTimer = useCallback(() => {
        setTimerRunning(true);
        setTimerSeconds(0);
        timerStartRef.current = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" });
        timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }, []);

    const stopTimer = useCallback(async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimerRunning(false);
        if (!memberId || timerSeconds < 60) { setTimerSeconds(0); return; }

        const dur = Math.round(timerSeconds / 60);
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
        const endTime = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" });

        const supabase = createClient();
        await supabase.from("myverse_daily_routines").insert({
            member_id: memberId,
            date: today,
            start_time: timerStartRef.current,
            end_time: endTime,
            activity: timerSubject,
            domain: "study",
            visibility: "private",
            body_data: { duration_min: dur, source: "timer" },
        });
        setTimerSeconds(0);
        reload();
    }, [memberId, timerSeconds, timerSubject]);

    const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    // 통계 계산
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const todayMin = sessions.filter(s => s.date === today)
        .reduce((sum, s) => sum + ((s.body_data?.duration_min as number) ?? 0), 0);
    const weekMin = sessions.filter(s => {
        const d = new Date(s.date + "T00:00:00");
        const now = new Date();
        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
    }).reduce((sum, s) => sum + ((s.body_data?.duration_min as number) ?? 0), 0);
    const totalMin = sessions.reduce((sum, s) => sum + ((s.body_data?.duration_min as number) ?? 0), 0);
    const streak = (() => {
        const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
        let count = 0;
        let cur = new Date();
        for (const d of dates) {
            const dDate = new Date(d + "T00:00:00");
            const diff = Math.round((cur.getTime() - dDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diff > 1) break;
            count++;
            cur = dDate;
        }
        return count;
    })();

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <header className="px-5 sm:px-10 pt-8 pb-4 border-b border-neutral-200 bg-white">
                <LaneHeader
                    icon="auto_stories"
                    label="STUDY"
                    title="공부"
                    subtitle="강의·필기·자기학습"
                    accent="#A855F7"
                    backLink={<DomainBackLink domain="study" />}
                    actions={
                        <button onClick={() => setAddOpen(true)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-500 text-white hover:bg-purple-600 rounded-lg">
                            <Plus className="h-3.5 w-3.5" /> 직접 입력
                        </button>
                    }
                />
            </header>

            {/* 통계 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4">
                <StatCard icon={Clock} label="오늘" value={`${Math.floor(todayMin / 60)}h ${todayMin % 60}m`} color="#A855F7" />
                <StatCard icon={Target} label="이번 주" value={`${Math.floor(weekMin / 60)}h ${weekMin % 60}m`} color="#6366F1" />
                <StatCard icon={Trophy} label="전체" value={`${Math.floor(totalMin / 60)}h`} color="#F59E0B" />
                <StatCard icon={Flame} label="연속 학습" value={`${streak}일`} color="#EF4444" />
            </div>

            {/* 타이머 */}
            <div className="mx-4 mb-4 bg-white border border-neutral-200 rounded-xl p-5">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3">학습 타이머</p>
                {!timerRunning ? (
                    <div className="flex items-center gap-3">
                        <select value={timerSubject} onChange={e => setTimerSubject(e.target.value)}
                            className="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400">
                            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={startTimer}
                            className="flex items-center gap-1.5 px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600">
                            <Play className="h-4 w-4" /> 시작
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-mono font-bold text-purple-600 tabular-nums">{fmt(timerSeconds)}</p>
                            <p className="text-xs text-neutral-500 mt-1">{timerSubject} 학습 중</p>
                        </div>
                        <button onClick={stopTimer}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600">
                            <Square className="h-4 w-4" /> 완료
                        </button>
                    </div>
                )}
                {timerRunning && timerSeconds < 60 && (
                    <p className="text-[10px] text-neutral-400 mt-2">1분 이상 학습 시 자동 저장됩니다</p>
                )}
            </div>

            {/* 세션 목록 */}
            <div className="px-4 pb-4">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">최근 기록</p>
                {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-10 text-sm text-neutral-400">학습 기록이 없습니다. 타이머로 시작해보세요.</div>
                ) : (
                    <div className="space-y-2">
                        {sessions.map(s => <SessionCard key={s.id} session={s} />)}
                    </div>
                )}
            </div>

            {addOpen && memberId && (
                <AddSessionModal memberId={memberId} onClose={() => setAddOpen(false)} onAdded={reload} />
            )}
        </div>
    );
}

function SessionCard({ session: s }: { session: StudySession }) {
    const dt = new Date(s.date + "T00:00:00+09:00");
    const label = `${dt.getMonth() + 1}/${dt.getDate()}`;
    const dur = s.body_data?.duration_min as number | undefined;
    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-3 flex items-center gap-3">
            <div className="shrink-0 text-[10px] text-neutral-400 tabular-nums w-8 text-center">{label}</div>
            <div className="h-8 w-8 shrink-0 rounded-lg bg-purple-100 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{s.activity}</p>
                {s.note && <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">{s.note}</p>}
            </div>
            {dur !== undefined && (
                <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-purple-600 tabular-nums">
                        {dur >= 60 ? `${Math.floor(dur / 60)}h ${dur % 60}m` : `${dur}m`}
                    </p>
                    {s.start_time && (
                        <p className="text-[10px] text-neutral-400">{s.start_time.slice(0, 5)}{s.end_time ? `–${s.end_time.slice(0, 5)}` : ""}</p>
                    )}
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Clock; label: string; value: string; color: string }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3 w-3" style={{ color }} />
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">{label}</span>
            </div>
            <p className="text-base font-semibold text-neutral-900 tabular-nums">{value}</p>
        </div>
    );
}

/* ── 직접 입력 모달 ── */
function AddSessionModal({ memberId, onClose, onAdded }: { memberId: string; onClose: () => void; onAdded: () => void }) {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const [date, setDate] = useState(today);
    const [subject, setSubject] = useState(SUBJECTS[0]);
    const [start, setStart] = useState("");
    const [dur, setDur] = useState("");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);

    async function submit() {
        if (!subject || !dur) return;
        setSaving(true);
        try {
            const supabase = createClient();
            const durMin = parseInt(dur, 10);
            await supabase.from("myverse_daily_routines").insert({
                member_id: memberId,
                date,
                start_time: start || null,
                activity: subject,
                note: note.trim() || null,
                domain: "study",
                visibility: "private",
                body_data: { duration_min: durMin },
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
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl flex flex-col md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                    <h2 className="text-sm font-semibold text-neutral-900">학습 기록 직접 입력</h2>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
                </div>
                <div className="px-5 py-4 space-y-3">
                    <div>
                        <label className="text-[11px] text-neutral-500">과목</label>
                        <select value={subject} onChange={e => setSubject(e.target.value)}
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400">
                            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                            <label className="text-[11px] text-neutral-500">날짜</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400" />
                        </div>
                        <div>
                            <label className="text-[11px] text-neutral-500">시작</label>
                            <input type="time" value={start} onChange={e => setStart(e.target.value)}
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400" />
                        </div>
                        <div>
                            <label className="text-[11px] text-neutral-500">시간(분) *</label>
                            <input type="number" placeholder="60" value={dur} onChange={e => setDur(e.target.value)}
                                className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] text-neutral-500">메모</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="오늘 뭘 공부했나요?" rows={3}
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-purple-400" />
                    </div>
                </div>
                <div className="px-5 pb-5">
                    <button onClick={submit} disabled={saving || !dur}
                        className="w-full py-2.5 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 disabled:opacity-40 flex items-center justify-center gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />} 저장
                    </button>
                </div>
            </div>
        </>
    );
}
