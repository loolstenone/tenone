"use client";

// 외부 SNS 공유 시트
// 콘텐츠 카드의 Share2 아이콘 클릭 시 모달로 표시
//
// 채널:
//   링크 복사 / X / Threads / LinkedIn / 카카오톡(SDK) / 이메일 / 모바일 Web Share API
//
// 흐름:
//   1. 사용자가 채널 선택
//   2. 콘텐츠가 비공개라면 "전체 공개로 바꿀까요?" 확인 (자동 공개 토글)
//   3. /api/myverse/share 호출 → 단축 URL 반환 + share_count++
//   4. 채널별 액션 (Web Intent / Kakao SDK / clipboard)

import { useState, useEffect } from "react";
import {
    X, Copy, Check, Loader2, Mail, Share2,
} from "lucide-react";
import { HandleRegisterModal } from "./HandleRegisterModal";

type Channel = "copy" | "x" | "threads" | "linkedin" | "kakao" | "email" | "web_share";

interface Props {
    open: boolean;
    onClose: () => void;
    /** 공유 대상 — 7 capture 테이블 + projects */
    table: string;
    id: string;
    /** 표시용 메타 — 공유 텍스트·이미지에 사용 */
    title?: string;
    text?: string;
    imageUrl?: string;
    /** 현재 공개 범위 — 비공개면 자동 공개 확인 모달 */
    initialVisibility: "private" | "friends" | "public";
    /** 사용자 핸들 — 없으면 등록 모달 */
    handle: string | null;
}

const CHANNELS: { key: Channel; label: string; color: string; icon: string }[] = [
    { key: "copy",     label: "링크 복사",  color: "#6B7280", icon: "🔗" },
    { key: "x",        label: "X",          color: "#000000", icon: "𝕏" },
    { key: "threads",  label: "Threads",    color: "#000000", icon: "@" },
    { key: "linkedin", label: "LinkedIn",   color: "#0A66C2", icon: "in" },
    { key: "kakao",    label: "카카오톡",   color: "#FEE500", icon: "K" },
    { key: "email",    label: "이메일",     color: "#6366F1", icon: "✉" },
];

export function ShareSheet({
    open, onClose, table, id, title, text, imageUrl, initialVisibility, handle: initialHandle,
}: Props) {
    const [visibility, setVisibility] = useState(initialVisibility);
    const [handle, setHandle] = useState(initialHandle);
    const [pendingChannel, setPendingChannel] = useState<Channel | null>(null);
    const [needsHandle, setNeedsHandle] = useState(false);
    const [loading, setLoading] = useState<Channel | null>(null);
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setShareUrl(null);
            setCopied(false);
            setLoading(null);
        }
    }, [open]);

    if (!open) return null;

    async function go(channel: Channel) {
        // 핸들 없으면 등록 모달 먼저
        if (!handle) {
            setPendingChannel(channel);
            setNeedsHandle(true);
            return;
        }

        // 비공개면 사용자 확인 (간단히 confirm) — 친구·전체는 그대로 공유
        let autoPublish = false;
        if (visibility === "private") {
            const ok = confirm("이 콘텐츠를 외부에 공유하려면 '전체 공개'로 바꿔야 합니다.\n공개로 바꾸고 공유할까요?");
            if (!ok) return;
            autoPublish = true;
        }

        setLoading(channel);
        try {
            const res = await fetch("/api/myverse/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ table, id, channel, autoPublish }),
            });
            const json = await res.json();
            if (!res.ok) {
                alert(`공유 실패: ${json.error ?? res.status}${json.hint ? "\n" + json.hint : ""}`);
                return;
            }
            const url = json.url as string;
            setShareUrl(url);
            if (json.visibility) setVisibility(json.visibility);

            const shareText = text || title || "";
            await dispatchChannel(channel, url, shareText, imageUrl);
        } catch (e) {
            alert(`오류: ${(e as Error).message}`);
        } finally {
            setLoading(null);
        }
    }

    async function dispatchChannel(channel: Channel, url: string, msg: string, img?: string) {
        switch (channel) {
            case "copy":
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                break;
            case "x":
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`, "_blank");
                break;
            case "threads":
                window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(msg + "\n\n" + url)}`, "_blank");
                break;
            case "linkedin":
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
                break;
            case "kakao":
                await shareKakao(url, msg, img);
                break;
            case "email":
                window.location.href = `mailto:?subject=${encodeURIComponent(msg.slice(0, 60))}&body=${encodeURIComponent(msg + "\n\n" + url)}`;
                break;
            case "web_share":
                if (navigator.share) {
                    try {
                        await navigator.share({ title: msg.slice(0, 60), text: msg, url });
                    } catch { /* 사용자 취소 — silent */ }
                }
                break;
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-[9300] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={onClose}>
                <div
                    className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200">
                        <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                            <Share2 className="h-4 w-4" /> 공유
                        </h3>
                        <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* 공유 대상 미리보기 */}
                    {(title || imageUrl) && (
                        <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50 flex items-center gap-3">
                            {imageUrl && (
                                <div className="shrink-0 h-12 w-12 rounded overflow-hidden bg-neutral-200">
                                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                {title && <p className="text-sm text-neutral-800 truncate">{title}</p>}
                                {visibility === "private" && (
                                    <p className="text-[10px] text-amber-600 mt-0.5">⚠️ 현재 비공개 — 공유 시 공개로 전환</p>
                                )}
                                {visibility !== "private" && (
                                    <p className="text-[10px] text-emerald-600 mt-0.5">
                                        ✓ {visibility === "public" ? "전체 공개" : "친구 공개"}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 채널 그리드 */}
                    <div className="grid grid-cols-3 gap-2 p-5">
                        {CHANNELS.map(c => (
                            <button
                                key={c.key}
                                onClick={() => go(c.key)}
                                disabled={loading !== null}
                                className="flex flex-col items-center gap-1.5 py-3 border border-neutral-200 rounded-lg hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-colors disabled:opacity-50"
                            >
                                {loading === c.key ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                                ) : c.key === "copy" && copied ? (
                                    <Check className="h-5 w-5 text-emerald-500" />
                                ) : c.key === "email" ? (
                                    <Mail className="h-5 w-5" style={{ color: c.color }} />
                                ) : (
                                    <span
                                        className="h-5 w-5 rounded-sm flex items-center justify-center text-[11px] font-bold text-white"
                                        style={{ backgroundColor: c.color, color: c.color === "#FEE500" ? "#000" : "#fff" }}
                                    >
                                        {c.icon}
                                    </span>
                                )}
                                <span className="text-[10px] text-neutral-700">{c.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Web Share API (모바일) */}
                    {typeof navigator !== "undefined" && "share" in navigator && (
                        <div className="px-5 pb-3">
                            <button
                                onClick={() => go("web_share")}
                                className="w-full py-2 text-xs text-neutral-500 hover:text-[#6366F1] transition-colors flex items-center justify-center gap-1"
                            >
                                <Share2 className="h-3.5 w-3.5" />
                                기기 공유 시트
                            </button>
                        </div>
                    )}

                    {shareUrl && (
                        <div className="px-5 py-2 border-t border-neutral-100 bg-neutral-50 text-[11px] text-neutral-500 break-all">
                            {shareUrl}
                        </div>
                    )}

                    <p className="text-[10px] text-neutral-400 px-5 py-3 border-t border-neutral-100 leading-relaxed">
                        비공개로 되돌리면 위 단축 링크는 즉시 dead 됩니다. 공유한 SNS 게시물은 직접 삭제 필요.
                    </p>
                </div>
            </div>

            <HandleRegisterModal
                open={needsHandle}
                onClose={() => { setNeedsHandle(false); setPendingChannel(null); }}
                onRegistered={(h) => {
                    setHandle(h);
                    setNeedsHandle(false);
                    if (pendingChannel) {
                        const ch = pendingChannel;
                        setPendingChannel(null);
                        setTimeout(() => go(ch), 100);
                    }
                }}
                contextNote="외부 공유에는 myverse.kr/@핸들 주소가 필요합니다."
            />
        </>
    );
}

/** 카카오톡 공유 — Kakao SDK 동적 로드 + Share.sendDefault */
async function shareKakao(url: string, msg: string, img?: string) {
    interface KakaoSDK {
        isInitialized: () => boolean;
        init: (key: string) => void;
        Share: { sendDefault: (params: Record<string, unknown>) => void };
    }
    const win = window as unknown as { Kakao?: KakaoSDK };
    const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

    if (!appKey) {
        alert("카카오 공유는 NEXT_PUBLIC_KAKAO_APP_KEY 설정 후 사용 가능합니다.");
        return;
    }

    if (!win.Kakao) {
        await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
            s.integrity = "sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4";
            s.crossOrigin = "anonymous";
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("Kakao SDK load failed"));
            document.head.appendChild(s);
        });
    }

    if (!win.Kakao!.isInitialized()) {
        win.Kakao!.init(appKey);
    }

    win.Kakao!.Share.sendDefault({
        objectType: "feed",
        content: {
            title: msg.slice(0, 60),
            description: msg.slice(60, 200),
            imageUrl: img ?? "https://myverse.kr/og-default.png",
            link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [{ title: "보러 가기", link: { mobileWebUrl: url, webUrl: url } }],
    });
}
