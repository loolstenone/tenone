// Myverse — 음성 녹음 훅 (MediaRecorder API + Web Speech API)
// 사용처: 캡쳐 페이지 도크의 "녹음" 버튼.
// - getUserMedia 권한 요청 → MediaRecorder 시작 + SpeechRecognition 병렬 실행
// - stop → Blob + transcript(Korean) 반환
// - 지원: webm/opus (대부분 브라우저 기본), 폴백 오디오/오디오/* 자동 선택
// - 권한 거부 / 미지원 / 마이크 부재 시 명확한 에러 메시지

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "requesting" | "recording" | "stopping";

export interface RecorderResult {
    blob: Blob;
    mimeType: string;
    durationSec: number;
    filename: string;
    transcript?: string;
}

interface UseRecorder {
    state: RecorderState;
    error: string | null;
    elapsedSec: number;
    start: () => Promise<void>;
    /** 정지 + Blob 반환. 호출 후 state는 idle로 되돌아감. */
    stop: () => Promise<RecorderResult | null>;
    /** 정지하고 결과는 버림 (취소). */
    cancel: () => void;
}

type SpeechRecognitionType = {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((e: SpeechRecognitionEvent) => void) | null;
    onerror: ((e: Event) => void) | null;
    start(): void;
    stop(): void;
};

type SpeechRecognitionEvent = {
    results: SpeechRecognitionResultList;
    resultIndex: number;
};

type SpeechRecognitionResultList = {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionResult = {
    isFinal: boolean;
    [index: number]: { transcript: string };
};

function getSpeechRecognitionClass(): (new () => SpeechRecognitionType) | null {
    if (typeof window === "undefined") return null;
    const w = window as Window & {
        SpeechRecognition?: new () => SpeechRecognitionType;
        webkitSpeechRecognition?: new () => SpeechRecognitionType;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function pickMimeType(): string {
    if (typeof MediaRecorder === "undefined") return "";
    const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
    ];
    for (const t of candidates) {
        if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return "";
}

function extFromMime(mime: string): string {
    if (mime.includes("webm")) return "webm";
    if (mime.includes("ogg")) return "ogg";
    if (mime.includes("mp4") || mime.includes("aac")) return "m4a";
    return "audio";
}

export function useRecorder(): UseRecorder {
    const [state, setState] = useState<RecorderState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [elapsedSec, setElapsedSec] = useState(0);

    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const startedAtRef = useRef<number>(0);
    const timerRef = useRef<number | null>(null);
    const recognitionRef = useRef<SpeechRecognitionType | null>(null);
    const transcriptRef = useRef<string>("");

    // 타이머 정리
    const clearTimer = useCallback(() => {
        if (timerRef.current != null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // 스트림 정리 — 마이크 인디케이터 끄기
    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    const stopRecognition = useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* ignore */ }
            recognitionRef.current = null;
        }
    }, []);

    // 언마운트 시 안전 정리
    useEffect(() => () => {
        clearTimer();
        stopStream();
        stopRecognition();
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
            try { recorderRef.current.stop(); } catch { /* ignore */ }
        }
    }, [clearTimer, stopStream, stopRecognition]);

    const start = useCallback(async () => {
        if (state !== "idle") return;
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
            setError("이 브라우저는 녹음을 지원하지 않아요");
            return;
        }
        if (typeof MediaRecorder === "undefined") {
            setError("이 브라우저는 녹음 API를 지원하지 않아요");
            return;
        }
        setState("requesting");
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mimeType = pickMimeType();
            const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            recorderRef.current = rec;
            chunksRef.current = [];

            rec.ondataavailable = (e: BlobEvent) => {
                if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
            };

            startedAtRef.current = Date.now();
            setElapsedSec(0);
            timerRef.current = window.setInterval(() => {
                setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
            }, 250);

            rec.start();

            // SpeechRecognition 병렬 시작 (미지원 브라우저 silently skip)
            transcriptRef.current = "";
            const SpeechRecognitionClass = getSpeechRecognitionClass();
            if (SpeechRecognitionClass) {
                const recognition = new SpeechRecognitionClass();
                recognition.continuous = true;
                recognition.interimResults = false;
                recognition.lang = "ko-KR";
                recognition.onresult = (e: SpeechRecognitionEvent) => {
                    for (let i = e.resultIndex; i < e.results.length; i++) {
                        if (e.results[i].isFinal) {
                            transcriptRef.current += (transcriptRef.current ? " " : "") + e.results[i][0].transcript;
                        }
                    }
                };
                recognition.onerror = () => { /* silent — transcript unavailable */ };
                recognition.start();
                recognitionRef.current = recognition;
            }

            setState("recording");
        } catch (err) {
            stopStream();
            stopRecognition();
            recorderRef.current = null;
            const name = (err as { name?: string })?.name;
            if (name === "NotAllowedError" || name === "PermissionDeniedError") setError("마이크 권한이 거부됐어요");
            else if (name === "NotFoundError") setError("마이크 장치를 찾을 수 없어요");
            else setError("녹음 시작 실패");
            setState("idle");
        }
    }, [state, stopStream, stopRecognition]);

    const stop = useCallback(async (): Promise<RecorderResult | null> => {
        const rec = recorderRef.current;
        if (!rec || rec.state === "inactive") return null;

        setState("stopping");
        clearTimer();
        stopRecognition();
        const transcript = transcriptRef.current.trim() || undefined;
        transcriptRef.current = "";

        return await new Promise<RecorderResult | null>(resolve => {
            rec.onstop = () => {
                const mime = rec.mimeType || "audio/webm";
                const blob = new Blob(chunksRef.current, { type: mime });
                const durationSec = Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000));
                const ext = extFromMime(mime);
                const filename = `recording-${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
                chunksRef.current = [];
                stopStream();
                recorderRef.current = null;
                setState("idle");
                setElapsedSec(0);
                resolve(blob.size > 0 ? { blob, mimeType: mime, durationSec, filename, transcript } : null);
            };
            try {
                rec.stop();
            } catch {
                stopStream();
                recorderRef.current = null;
                setState("idle");
                resolve(null);
            }
        });
    }, [clearTimer, stopStream, stopRecognition]);

    const cancel = useCallback(() => {
        clearTimer();
        stopRecognition();
        transcriptRef.current = "";
        chunksRef.current = [];
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
            try { recorderRef.current.stop(); } catch { /* ignore */ }
        }
        recorderRef.current = null;
        stopStream();
        setState("idle");
        setElapsedSec(0);
    }, [clearTimer, stopStream, stopRecognition]);

    return { state, error, elapsedSec, start, stop, cancel };
}
