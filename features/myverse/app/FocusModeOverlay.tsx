"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Play, Pause, RotateCcw, SkipForward, ChevronDown } from "lucide-react";

// ─── 타입 ───────────────────────────────────────────────────────────────────

export type FocusMode = "work" | "break" | "long_break";

interface FocusModeOverlayProps {
    /** 현재 집중 대상 태스크 텍스트 (없으면 일반 집중 모드) */
    taskText?: string;
    onClose: () => void;
}

// ─── 상수 ───────────────────────────────────────────────────────────────────

const DURATIONS: Record<FocusMode, number> = {
    work:       25 * 60,  // 25분
    break:       5 * 60,  //  5분
    long_break: 15 * 60,  // 15분
};

const MODE_LABELS: Record<FocusMode, string> = {
    work:       "집중",
    break:      "짧은 휴식",
    long_break: "긴 휴식",
};

const MODE_COLORS: Record<FocusMode, { bg: string; ring: string; text: string; btn: string }> = {
    work: {
        bg:   "from-[#4F46E5] to-[#6366F1]",
        ring: "ring-[#6366F1]/40",
        text: "text-indigo-100",
        btn:  "bg-white/20 hover:bg-white/30",
    },
    break: {
        bg:   "from-emerald-500 to-teal-500",
        ring: "ring-emerald-400/40",
        text: "text-emerald-50",
        btn:  "bg-white/20 hover:bg-white/30",
    },
    long_break: {
        bg:   "from-sky-500 to-cyan-500",
        ring: "ring-sky-400/40",
        text: "text-sky-50",
        btn:  "bg-white/20 hover:bg-white/30",
    },
};

// ─── 유틸 ───────────────────────────────────────────────────────────────────

function fmt(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

export function FocusModeOverlay({ taskText, onClose }: FocusModeOverlayProps) {
    const [mode, setMode] = useState<FocusMode>("work");
    const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
    const [running, setRunning] = useState(false);
    const [sessions, setSessions] = useState(0);   // 완료한 집중 세션 수
    const [minimized, setMinimized] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // 모드 변경 시 타이머 리셋
    useEffect(() => {
        stop();
        setTimeLeft(DURATIONS[mode]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    // 타이머 틱
    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        setRunning(false);
                        handleComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running]);

    // document title 업데이트
    useEffect(() => {
        if (running) {
            document.title = `${fmt(timeLeft)} · ${MODE_LABELS[mode]} — 마이버스`;
        } else {
            document.title = "마이버스";
        }
        return () => { document.title = "마이버스"; };
    }, [running, timeLeft, mode]);

    // 키보드 단축키
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") { onClose(); return; }
            if (e.key === " ") { e.preventDefault(); toggleRun(); }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running]);

    function stop() {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRunning(false);
    }

    function toggleRun() {
        setRunning(r => !r);
    }

    function reset() {
        stop();
        setTimeLeft(DURATIONS[mode]);
    }

    function playBeep() {
        try {
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 660;
            osc.type = "sine";
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch { /* 음소거 환경에서 무시 */ }
    }

    const handleComplete = useCallback(() => {
        playBeep();
        if (mode === "work") {
            const nextSessions = sessions + 1;
            setSessions(nextSessions);
            // 4세션마다 긴 휴식
            setMode(nextSessions % 4 === 0 ? "long_break" : "break");
        } else {
            setMode("work");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, sessions]);

    function skipMode() {
        if (mode === "work") setMode(sessions % 4 === 3 ? "long_break" : "break");
        else setMode("work");
    }

    const c = MODE_COLORS[mode];

    // 진행률 (0~1)
    const progress = 1 - timeLeft / DURATIONS[mode];
    const radius = 88;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress);

    // ── 최소화 상태 ──────────────────────────────────────────────────────────
    if (minimized) {
        return (
            <div
                className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl bg-gradient-to-br ${c.bg} text-white cursor-pointer transition-all`}
                onClick={() => setMinimized(false)}
                title="초집중모드 열기"
            >
                <div className="text-2xl font-mono font-bold tracking-tight">{fmt(timeLeft)}</div>
                <div className="flex flex-col text-[10px] leading-tight opacity-80">
                    <span>{MODE_LABELS[mode]}</span>
                    {taskText && <span className="truncate max-w-[120px]">{taskText}</span>}
                </div>
                <button
                    onClick={e => { e.stopPropagation(); toggleRun(); }}
                    className={`w-7 h-7 rounded-full ${c.btn} flex items-center justify-center`}
                >
                    {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                </button>
            </div>
        );
    }

    // ── 풀 오버레이 ──────────────────────────────────────────────────────────
    return (
        <div className={`fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-gradient-to-br ${c.bg} transition-all`}>
            {/* 닫기 / 최소화 */}
            <div className="absolute top-5 right-5 flex items-center gap-2">
                <button
                    onClick={() => setMinimized(true)}
                    title="최소화 (화면 유지)"
                    className={`p-2 rounded-full ${c.btn} text-white transition-colors`}
                >
                    <ChevronDown className="h-4 w-4" />
                </button>
                <button
                    onClick={onClose}
                    title="초집중모드 종료 (Esc)"
                    className={`p-2 rounded-full ${c.btn} text-white transition-colors`}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* 모드 선택 탭 */}
            <div className="flex items-center gap-1 mb-10 bg-black/20 rounded-full p-1">
                {(Object.keys(DURATIONS) as FocusMode[]).map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            mode === m
                                ? "bg-white text-indigo-700 shadow"
                                : "text-white/70 hover:text-white"
                        }`}
                    >
                        {MODE_LABELS[m]}
                    </button>
                ))}
            </div>

            {/* 원형 타이머 */}
            <div className={`relative ring-4 ${c.ring} rounded-full`}>
                <svg width="220" height="220" className="-rotate-90">
                    {/* 배경 트랙 */}
                    <circle
                        cx="110" cy="110" r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="8"
                    />
                    {/* 진행 아크 */}
                    <circle
                        cx="110" cy="110" r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000"
                    />
                </svg>
                {/* 시간 텍스트 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-mono font-bold text-white tracking-tight">
                        {fmt(timeLeft)}
                    </span>
                    <span className={`text-sm mt-1 ${c.text}`}>{MODE_LABELS[mode]}</span>
                </div>
            </div>

            {/* 집중 대상 태스크 */}
            {taskText && (
                <div className="mt-8 px-6 py-3 bg-black/20 rounded-xl max-w-sm text-center">
                    <p className={`text-sm ${c.text} line-clamp-2`}>{taskText}</p>
                </div>
            )}

            {/* 세션 카운터 */}
            <div className="flex items-center gap-1.5 mt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                            i < (sessions % 4)
                                ? "bg-white scale-110"
                                : "bg-white/30"
                        }`}
                    />
                ))}
                {sessions > 0 && (
                    <span className="ml-2 text-xs text-white/60">{sessions}세션 완료</span>
                )}
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex items-center gap-4 mt-10">
                <button
                    onClick={reset}
                    title="타이머 리셋"
                    className={`w-11 h-11 rounded-full ${c.btn} text-white flex items-center justify-center transition-colors`}
                >
                    <RotateCcw className="h-4.5 w-4.5" />
                </button>

                {/* 재생/일시정지 */}
                <button
                    onClick={toggleRun}
                    title={running ? "일시정지 (Space)" : "시작 (Space)"}
                    className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-indigo-700 hover:scale-105 active:scale-95 transition-transform"
                >
                    {running
                        ? <Pause className="h-7 w-7" />
                        : <Play className="h-7 w-7 ml-1" />
                    }
                </button>

                <button
                    onClick={skipMode}
                    title="다음 단계로 건너뛰기"
                    className={`w-11 h-11 rounded-full ${c.btn} text-white flex items-center justify-center transition-colors`}
                >
                    <SkipForward className="h-4.5 w-4.5" />
                </button>
            </div>

            {/* 키보드 힌트 */}
            <p className="mt-8 text-xs text-white/30">
                Space — 시작/일시정지 · Esc — 종료
            </p>
        </div>
    );
}
