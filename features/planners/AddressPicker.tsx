"use client";

// Daum Postcode (Kakao 우편번호) 기반 한국 주소 빠른 검색.
// - 스크립트는 버튼 클릭 시 1회만 비동기 로드 (페이지 진입 시 비용 0)
// - 무료 · 무인증 · CORS 무관
// - 결과: roadAddress (도로명) 우선, 없으면 jibunAddress (지번)

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Search, X, Loader2 } from "lucide-react";

const SCRIPT_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

interface DaumPostcodeData {
    roadAddress?: string;
    jibunAddress?: string;
    address?: string;
    zonecode?: string;
    buildingName?: string;
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        daum?: { Postcode: new (opts: { oncomplete: (d: DaumPostcodeData) => void; width: string; height: string }) => { embed: (el: HTMLElement) => void } };
    }
}

let scriptPromise: Promise<void> | null = null;
function loadDaumScript(): Promise<void> {
    if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
    if (window.daum?.Postcode) return Promise.resolve();
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = SCRIPT_SRC;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => { scriptPromise = null; reject(new Error("script_load_failed")); };
        document.head.appendChild(s);
    });
    return scriptPromise;
}

export function AddressPickerButton({
    onSelect,
    className = "",
    label = "주소 검색",
}: {
    onSelect: (address: string, zonecode?: string) => void;
    className?: string;
    label?: string;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const embeddedRef = useRef(false);

    const closeModal = useCallback(() => {
        setOpen(false);
        setError(null);
        embeddedRef.current = false;
    }, []);

    const openModal = useCallback(async () => {
        setOpen(true);
        setError(null);
        setLoading(true);
        try {
            await loadDaumScript();
        } catch {
            setError("주소 검색 서비스를 불러오지 못했습니다. 네트워크 연결을 확인해 주세요.");
            setLoading(false);
        }
    }, []);

    // 스크립트 로드 완료 + 컨테이너 mount 후 임베드
    useEffect(() => {
        if (!open || error) return;
        if (embeddedRef.current) return;
        if (!containerRef.current) return;
        if (!window.daum?.Postcode) return;
        embeddedRef.current = true;
        try {
            const pc = new window.daum.Postcode({
                width: "100%",
                height: "100%",
                oncomplete: (d: DaumPostcodeData) => {
                    const addr = (d.roadAddress || d.jibunAddress || d.address || "").trim();
                    const withBuilding = d.buildingName ? `${addr} (${d.buildingName})` : addr;
                    onSelect(withBuilding, d.zonecode);
                    closeModal();
                },
            });
            pc.embed(containerRef.current);
            setLoading(false);
        } catch {
            setError("검색기를 초기화하지 못했습니다.");
            setLoading(false);
        }
    });

    // ESC to close
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, closeModal]);

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors ${className}`}
                title="우편번호로 주소 빠르게 찾기"
            >
                <Search className="h-3 w-3" />
                {label}
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white w-full max-w-md h-[500px] rounded-xl shadow-2xl flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 shrink-0">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-[#0F766E]" />
                                <span className="text-sm font-semibold text-neutral-900">주소 검색</span>
                            </div>
                            <button
                                onClick={closeModal}
                                className="w-7 h-7 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 relative bg-neutral-50">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-500 gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> 주소 검색 불러오는 중…
                                </div>
                            )}
                            {error && (
                                <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                            <div ref={containerRef} className="absolute inset-0" />
                        </div>

                        <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50 text-[11px] text-neutral-500 shrink-0">
                            도로명/지번/건물명 어떤 키워드로든 검색하세요. (Powered by Daum 우편번호)
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
