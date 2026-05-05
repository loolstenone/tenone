"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

// ── 브라우저 SpeechRecognition 타입 보강 ─────────────────────────────────
type SpeechRecognitionResultList = {
    length: number;
    [index: number]: { [index: number]: { transcript: string }; isFinal: boolean };
};
interface SpeechRecognitionEventLite {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}
interface SpeechRecognitionLite {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((e: SpeechRecognitionEventLite) => void) | null;
    onerror: ((e: { error?: string }) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLite;

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
    }
}

interface Props {
    /** 녹음 종료 시 호출 — 변환된 텍스트를 노트로 처리 */
    onTranscribed: (text: string) => void;
    className?: string;
    label?: string;
}

/**
 * Web Speech API 기반 음성 → 텍스트 녹음 버튼.
 * Chrome/Edge/Safari 지원. Firefox는 미지원 (alert).
 */
export function VoiceRecordButton({ onTranscribed, className, label = "녹음" }: Props) {
    const [recording, setRecording] = useState(false);
    const [supported, setSupported] = useState<boolean | null>(null);
    const [interim, setInterim] = useState("");
    const [duration, setDuration] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognitionLite | null>(null);
    const finalTranscriptRef = useRef<string>("");
    const startTsRef = useRef<number>(0);
    const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
        setSupported(!!Ctor);
    }, []);

    function start() {
        if (!supported) {
            setErrorMsg("이 브라우저는 음성 인식을 지원하지 않습니다 (Chrome·Edge·Safari 권장)");
            setTimeout(() => setErrorMsg(null), 4000);
            return;
        }
        const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
        if (!Ctor) return;
        const rec = new Ctor();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "ko-KR";

        finalTranscriptRef.current = "";
        setInterim("");
        setErrorMsg(null);

        rec.onresult = (e) => {
            let interimText = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const result = e.results[i];
                const transcript = result[0]?.transcript ?? "";
                if (result.isFinal) {
                    finalTranscriptRef.current += transcript;
                } else {
                    interimText += transcript;
                }
            }
            setInterim(interimText);
        };
        rec.onerror = (e) => {
            const code = e?.error;
            if (code === "no-speech") return; // 무음은 무시
            if (code === "not-allowed") setErrorMsg("마이크 권한이 거부되었습니다");
            else if (code === "audio-capture") setErrorMsg("마이크를 찾을 수 없습니다");
            else setErrorMsg(`음성 인식 오류: ${code ?? "unknown"}`);
            stop(false);
        };
        rec.onend = () => {
            // 자연 종료 — finish 처리
            const text = (finalTranscriptRef.current + interim).trim();
            if (recording) {
                if (text) onTranscribed(text);
                cleanup();
            }
        };

        try {
            rec.start();
            recognitionRef.current = rec;
            setRecording(true);
            startTsRef.current = Date.now();
            tickerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTsRef.current) / 1000));
            }, 250);
        } catch (e) {
            setErrorMsg(`녹음 시작 실패: ${(e as Error).message}`);
        }
    }

    function stop(commit = true) {
        const rec = recognitionRef.current;
        if (rec) {
            try { rec.stop(); } catch { /* noop */ }
        }
        const text = (finalTranscriptRef.current + interim).trim();
        if (commit && text) onTranscribed(text);
        cleanup();
    }

    function cleanup() {
        if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
        recognitionRef.current = null;
        setRecording(false);
        setInterim("");
        setDuration(0);
        finalTranscriptRef.current = "";
    }

    useEffect(() => () => cleanup(), []);

    function fmtDuration(s: number) {
        const m = Math.floor(s / 60);
        const ss = s % 60;
        return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    }

    return (
        <>
            <button
                onClick={start}
                title={supported === false ? "이 브라우저는 음성 인식을 지원하지 않습니다" : "음성 녹음 → 텍스트"}
                disabled={supported === false || recording}
                className={className ?? "flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-rose-400 hover:text-rose-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"}
            >
                {supported === null
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : recording
                        ? <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                          </span>
                        : <Mic className="h-3.5 w-3.5" />}
                {label && <span>{label}</span>}
            </button>

            {/* 녹음 중 — 화면 하단 고정 토스트 (위치 무관하게 일관) */}
            {recording && typeof document !== "undefined" && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[min(640px,calc(100vw-32px))] flex items-center gap-2 px-4 py-3 border border-rose-300 bg-white myverse-dark:bg-[#1C1C1C] shadow-lg rounded-xl">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                    <span className="text-xs font-medium text-rose-700 myverse-dark:text-rose-300 tabular-nums shrink-0">
                        {fmtDuration(duration)}
                    </span>
                    <span className="text-xs text-neutral-600 myverse-dark:text-neutral-300 flex-1 truncate italic min-w-0">
                        {interim || finalTranscriptRef.current || "말씀해 주세요…"}
                    </span>
                    <button
                        onClick={() => stop(true)}
                        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#6366F1] text-white hover:bg-[#4F46E5] transition-colors"
                    >
                        완료
                    </button>
                    <button
                        onClick={() => stop(false)}
                        className="shrink-0 p-1.5 rounded text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="취소"
                    >
                        <MicOff className="h-4 w-4" />
                    </button>
                </div>
            )}

            {errorMsg && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 shadow">
                    {errorMsg}
                </div>
            )}
        </>
    );
}
