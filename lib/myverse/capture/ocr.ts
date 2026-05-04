// OCR — 사진 속 글자 추출 (클라이언트, Tesseract.js)
//
// 한국어 + 영어 동시 인식. 결과 텍스트는 content_axis로 저장되어 검색 인덱스에 들어간다.
// 사용자 동의(ocr_auto)가 필요하며, 동의 없으면 호출 안 함.

let workerCache: unknown = null;

export async function ocrImage(file: File | Blob): Promise<{ text: string; confidence: number } | null> {
    try {
        // 동적 import — 초기 번들 크기 감소 (Tesseract.js는 무겁다)
        const Tesseract = await import("tesseract.js");

        // 워커 재사용 (성능)
        interface Worker {
            recognize: (image: File | Blob) => Promise<{ data: { text: string; confidence: number } }>;
        }

        if (!workerCache) {
            workerCache = await Tesseract.createWorker(["kor", "eng"], 1, {
                // 모델·언어 데이터는 jsdelivr CDN에서 자동 로드
                logger: () => { /* silent */ },
            });
        }

        const worker = workerCache as Worker;
        const result = await worker.recognize(file);
        return {
            text: result.data.text.trim(),
            confidence: result.data.confidence / 100,
        };
    } catch {
        return null;
    }
}

/** 워커 정리 — 페이지 unmount 시 호출 */
export async function disposeOcrWorker(): Promise<void> {
    if (workerCache) {
        try {
            const worker = workerCache as { terminate: () => Promise<void> };
            await worker.terminate();
        } catch { /* silent */ }
        workerCache = null;
    }
}
