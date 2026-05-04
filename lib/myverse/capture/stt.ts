// STT — 음성 → 텍스트 (브라우저 Web Speech API)
//
// 1차: Web Speech API (브라우저 네이티브, 무료, Chrome/Safari/Edge 지원)
// 폴백: 서버 Whisper API (브라우저 미지원 시 — 추후 구현)
// 사용자 동의(stt_recording)가 필요.

// 브라우저 Web Speech API — 표준 타입 정의가 일관되지 않아 unknown 캐스팅 사용
type SR = {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((e: unknown) => void) | null;
    onerror: ((e: unknown) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
    abort: () => void;
};

type WindowWithSR = Window & {
    SpeechRecognition?: { new (): SR };
    webkitSpeechRecognition?: { new (): SR };
};

export function isSttSupported(): boolean {
    if (typeof window === "undefined") return false;
    const w = window as unknown as WindowWithSR;
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export interface SttSession {
    stop: () => void;
    abort: () => void;
}

export interface SttHandlers {
    onPartial?: (text: string) => void;        // 진행 중 부분 결과
    onFinal: (text: string, confidence: number) => void;  // 종료 시 최종
    onError?: (msg: string) => void;
}

/**
 * 한국어 STT 시작.
 * 반환된 SttSession.stop() 호출 → onFinal 콜백.
 */
export function startStt(handlers: SttHandlers): SttSession | null {
    if (!isSttSupported()) {
        handlers.onError?.("이 브라우저는 음성 인식을 지원하지 않습니다 (Chrome/Safari/Edge 권장)");
        return null;
    }

    const w = window as unknown as WindowWithSR;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition!;
    const recog = new Ctor();
    recog.lang = "ko-KR";
    recog.continuous = true;
    recog.interimResults = true;

    let finalText = "";
    let finalConfidence = 0;

    recog.onresult = (e: unknown) => {
        const ev = e as { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string; confidence?: number } }> };
        let interim = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const result = ev.results[i];
            const transcript = result[0].transcript;
            if (result.isFinal) {
                finalText += transcript;
                finalConfidence = Math.max(finalConfidence, result[0].confidence ?? 0);
            } else {
                interim += transcript;
            }
        }
        if (interim) handlers.onPartial?.(interim);
    };

    recog.onerror = (e: unknown) => {
        const ev = e as { error?: string };
        handlers.onError?.(ev.error === "not-allowed"
            ? "마이크 권한이 거부되었습니다"
            : `STT 오류: ${ev.error ?? "unknown"}`);
    };

    recog.onend = () => {
        handlers.onFinal(finalText.trim(), finalConfidence);
    };

    try {
        recog.start();
    } catch (e) {
        handlers.onError?.(`STT 시작 실패: ${(e as Error).message}`);
        return null;
    }

    const r = recog as unknown as SR;
    return {
        stop: () => r.stop(),
        abort: () => r.abort(),
    };
}
