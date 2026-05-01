"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Copy, RefreshCw, Loader2, Check, Info } from "lucide-react";

type PermName = "geolocation" | "microphone" | "camera";

interface Props {
    open: boolean;
    onClose: () => void;
    /** 사용자가 "다시 시도" 클릭 시 호출 — 보통 getCurrentPosition / getUserMedia 재시도 */
    onRetry: () => Promise<void> | void;
    /** 어떤 권한인가 — 안내 문구 분기 */
    permission: PermName;
    /** 권한이 granted 로 바뀌었을 때 호출 (자동 폴링 감지) */
    onGranted?: () => void;
}

interface BrowserGuide {
    name: string;
    settingsUrl?: string;
    steps: string[];
}

const PERMISSION_LABEL: Record<PermName, string> = {
    geolocation: "위치 정보",
    microphone: "마이크",
    camera: "카메라",
};

function detectBrowser(): { id: string; os: string } {
    if (typeof navigator === "undefined") return { id: "unknown", os: "unknown" };
    const ua = navigator.userAgent;
    const os = /iPhone|iPad|iPod/i.test(ua) ? "ios"
            : /Android/i.test(ua) ? "android"
            : /Mac/i.test(ua) ? "mac"
            : /Windows/i.test(ua) ? "windows"
            : "linux";
    const id = /Edg\//i.test(ua) ? "edge"
            : /OPR\//i.test(ua) ? "opera"
            : /Chrome/i.test(ua) && !/Edg\//i.test(ua) ? "chrome"
            : /Firefox/i.test(ua) ? "firefox"
            : /Safari/i.test(ua) ? "safari"
            : "other";
    return { id, os };
}

function getGuide(permission: PermName): BrowserGuide {
    const { id, os } = detectBrowser();
    const permKey = permission === "geolocation" ? "location"
                  : permission === "microphone" ? "microphone"
                  : "camera";
    const permKo = PERMISSION_LABEL[permission];

    // iOS Safari (브라우저 설정 + 시스템 설정 둘 다 필요)
    if (os === "ios") {
        return {
            name: "iOS Safari",
            steps: permission === "geolocation" ? [
                "iOS 설정 앱 열기",
                "개인정보 보호 및 보안 → 위치 서비스 → 켜짐 확인",
                "Safari 웹사이트 → 위치 → 묻기 또는 허용 선택",
                "Safari로 돌아와 페이지를 새로고침",
                "다시 권한 요청 시 허용 선택",
            ] : [
                "iOS 설정 앱 → Safari → 마이크 → 묻기 또는 허용",
                "Safari 페이지 새로고침",
                "권한 요청 시 허용",
            ],
        };
    }

    // Android Chrome
    if (os === "android" && (id === "chrome" || id === "edge")) {
        return {
            name: id === "edge" ? "Android Edge" : "Android Chrome",
            steps: [
                "주소창 왼쪽의 자물쇠/(i) 아이콘 탭",
                "권한 또는 사이트 설정 선택",
                `${permKo} → 허용으로 변경`,
                "페이지를 새로고침한 뒤 다시 시도",
            ],
        };
    }

    // Chrome/Edge desktop — 직접 링크 가능
    if (id === "chrome" || id === "edge") {
        const scheme = id === "edge" ? "edge" : "chrome";
        return {
            name: id === "edge" ? "Microsoft Edge" : "Google Chrome",
            settingsUrl: `${scheme}://settings/content/${permKey}`,
            steps: [
                "아래 주소를 복사해 새 탭에서 열기 (브라우저는 자동 이동을 차단합니다)",
                `차단됨 목록에서 ${window.location.hostname} 항목 찾기`,
                "쓰레기통 아이콘으로 항목 제거 또는 허용으로 변경",
                "이 탭으로 돌아와 새로고침 후 다시 시도",
            ],
        };
    }

    // Safari macOS
    if (id === "safari") {
        return {
            name: "Safari (macOS)",
            steps: [
                "메뉴 막대 → Safari → 설정… (또는 ⌘,)",
                "웹사이트 탭 선택",
                `왼쪽 목록에서 ${permKo} 클릭`,
                `오른쪽에서 ${window.location.hostname} 항목을 찾아 허용으로 변경`,
                "이 탭으로 돌아와 새로고침 후 다시 시도",
            ],
        };
    }

    // Firefox
    if (id === "firefox") {
        return {
            name: "Mozilla Firefox",
            settingsUrl: "about:preferences#privacy",
            steps: [
                "주소창에 about:preferences#privacy 입력 후 이동",
                `권한 섹션에서 ${permKo} 옆 설정… 클릭`,
                `${window.location.hostname} 항목 제거 또는 허용`,
                "또는 주소창 왼쪽 자물쇠 아이콘 클릭 → 차단됨 ✕ 클릭",
                "페이지 새로고침 후 다시 시도",
            ],
        };
    }

    // 기타
    return {
        name: "브라우저 설정",
        steps: [
            "주소창 왼쪽 자물쇠 또는 (i) 아이콘 클릭",
            `사이트 설정에서 ${permKo} 권한 허용으로 변경`,
            "페이지 새로고침 후 다시 시도",
        ],
    };
}

export function PermissionGuideModal({ open, onClose, onRetry, permission, onGranted }: Props) {
    const [retrying, setRetrying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [currentState, setCurrentState] = useState<PermissionState | null>(null);
    const [guide, setGuide] = useState<BrowserGuide | null>(null);

    useEffect(() => {
        if (!open) return;
        setGuide(getGuide(permission));
    }, [open, permission]);

    // 권한 폴링 — 사용자가 외부에서 허용하면 자동 감지
    useEffect(() => {
        if (!open) return;
        if (typeof navigator === "undefined" || !navigator.permissions) return;

        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        async function poll() {
            try {
                const result = await navigator.permissions.query({ name: permission as PermissionName });
                if (cancelled) return;
                setCurrentState(result.state);
                if (result.state === "granted") {
                    onGranted?.();
                    onClose();
                    return;
                }
                timer = setTimeout(poll, 2500);
            } catch {
                // microphone 등 일부 브라우저 미지원 — 폴링 중단
            }
        }

        void poll();
        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [open, permission, onGranted, onClose]);

    async function handleRetry() {
        setRetrying(true);
        try {
            await onRetry();
        } finally {
            setRetrying(false);
        }
    }

    async function handleCopy() {
        if (!guide?.settingsUrl) return;
        try {
            await navigator.clipboard.writeText(guide.settingsUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // 클립보드 실패 — 사용자 시각적 피드백만 제공
        }
    }

    if (!open || !guide) return null;

    const permKo = PERMISSION_LABEL[permission];

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white planners-dark:bg-[#1C1C1C] w-full sm:max-w-md sm:rounded-xl rounded-t-2xl border border-neutral-200 planners-dark:border-[#2A2A2A] shadow-xl max-h-[90vh] flex flex-col">
                {/* 헤더 */}
                <div className="flex items-start justify-between p-5 pb-3 border-b border-neutral-100 planners-dark:border-[#2A2A2A]">
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900 planners-dark:text-neutral-100">
                            {permKo} 권한 다시 켜기
                        </h3>
                        <p className="text-xs text-neutral-500 planners-dark:text-neutral-400 mt-1">
                            {guide.name} · 거부된 권한은 브라우저 자체에서만 해제할 수 있습니다
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] text-neutral-400 transition-colors"
                        aria-label="닫기"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* 본문 */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* 자동 감지 안내 */}
                    <div className="flex items-start gap-2 px-3 py-2 bg-[#0F766E]/10 border border-[#0F766E]/20 rounded-lg">
                        <Info className="h-3.5 w-3.5 text-[#0F766E] mt-0.5 shrink-0" />
                        <p className="text-[11px] text-[#0F766E] leading-relaxed">
                            아래 단계대로 권한을 허용하면 <strong>이 창이 자동으로 닫힙니다</strong>. 별도 새로고침 없이 즉시 인식됩니다.
                        </p>
                    </div>

                    {/* 직접 이동 링크 (Chrome·Edge·Firefox만) */}
                    {guide.settingsUrl && (
                        <div className="border border-neutral-200 planners-dark:border-[#2A2A2A] rounded-lg p-3">
                            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">설정 페이지 주소</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs bg-neutral-50 planners-dark:bg-[#252525] px-2 py-1.5 rounded font-mono text-neutral-800 planners-dark:text-neutral-200 truncate">
                                    {guide.settingsUrl}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    className="shrink-0 p-1.5 rounded hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] text-neutral-500 transition-colors"
                                    title="주소 복사"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5 text-[#0F766E]" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-1.5 flex items-center gap-1">
                                <ExternalLink className="h-2.5 w-2.5" />
                                보안상 자동 이동이 차단됨 — 새 탭에 직접 붙여넣기
                            </p>
                        </div>
                    )}

                    {/* 단계별 안내 */}
                    <ol className="space-y-2.5">
                        {guide.steps.map((step, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-[#0F766E]/10 text-[#0F766E] text-[11px] font-semibold flex items-center justify-center mt-0.5">
                                    {i + 1}
                                </span>
                                <span className="text-xs text-neutral-700 planners-dark:text-neutral-300 leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ol>

                    {/* 현재 권한 상태 */}
                    {currentState && (
                        <div className="text-[10px] text-neutral-400 text-center pt-2">
                            현재 상태: <span className={`font-medium ${
                                currentState === "granted" ? "text-[#0F766E]"
                                : currentState === "denied" ? "text-rose-500"
                                : "text-amber-500"
                            }`}>
                                {currentState === "granted" ? "허용됨"
                                : currentState === "denied" ? "차단됨"
                                : "대기 중"}
                            </span>
                            <span className="ml-1">· 2.5초마다 자동 확인</span>
                        </div>
                    )}
                </div>

                {/* 푸터 — 다시 시도 */}
                <div className="p-4 border-t border-neutral-100 planners-dark:border-[#2A2A2A] flex gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg text-neutral-600 planners-dark:text-neutral-300 hover:bg-neutral-50 planners-dark:hover:bg-[#2A2A2A] transition-colors"
                    >
                        나중에
                    </button>
                    <button
                        onClick={handleRetry}
                        disabled={retrying}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors disabled:opacity-60"
                    >
                        {retrying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        지금 다시 시도
                    </button>
                </div>
            </div>
        </div>
    );
}
