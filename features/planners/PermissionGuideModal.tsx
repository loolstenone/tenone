"use client";

import { useEffect, useMemo, useState } from "react";
import { X, ExternalLink, Copy, RefreshCw, Loader2, Check, Info, Smartphone, Monitor, ChevronDown } from "lucide-react";

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

type BrowserId =
    | "chrome" | "edge" | "whale" | "samsung" | "brave" | "opera" | "vivaldi" | "arc"
    | "firefox" | "safari" | "ios-chrome" | "ios-other" | "other";
type OsId = "ios" | "android" | "mac" | "windows" | "linux" | "unknown";

interface BrowserGuide {
    /** 사용자에게 보여줄 정확한 브랜드명 */
    name: string;
    /** 직접 이동 가능한 브라우저 내부 설정 URL (chrome:// 같은 것) */
    settingsUrl?: string;
    /** 모바일/데스크톱 폼팩터 */
    formFactor: "desktop" | "mobile";
    steps: string[];
}

const PERMISSION_LABEL: Record<PermName, string> = {
    geolocation: "위치 정보",
    microphone: "마이크",
    camera: "카메라",
};

const OS_LABEL: Record<OsId, string> = {
    ios: "iOS",
    android: "Android",
    mac: "macOS",
    windows: "Windows",
    linux: "Linux",
    unknown: "Desktop",
};

function detectBrowser(): { id: BrowserId; os: OsId; uaData: string } {
    if (typeof navigator === "undefined") return { id: "other", os: "unknown", uaData: "" };
    const ua = navigator.userAgent;

    // OS 감지
    const os: OsId = /iPhone|iPad|iPod/i.test(ua) ? "ios"
                  : /Android/i.test(ua) ? "android"
                  : /Mac/i.test(ua) ? "mac"
                  : /Windows/i.test(ua) ? "windows"
                  : /Linux/i.test(ua) ? "linux"
                  : "unknown";

    // iOS는 모든 브라우저가 WebKit을 강제 사용 — Chrome/Edge라도 사파리 엔진
    if (os === "ios") {
        if (/CriOS\//i.test(ua) || /EdgiOS\//i.test(ua) || /FxiOS\//i.test(ua) || /OPiOS\//i.test(ua)) {
            return { id: "ios-chrome", os, uaData: ua };
        }
        return { id: "ios-other", os, uaData: ua };
    }

    // 데스크톱·Android — 우선순위 중요 (Whale·Brave·Edge 등은 Chrome UA에 자기 식별자 추가)
    let id: BrowserId;
    if (/Whale\//i.test(ua))                     id = "whale";
    else if (/SamsungBrowser\//i.test(ua))       id = "samsung";
    else if (/Edg\//i.test(ua))                  id = "edge";
    else if (/OPR\//i.test(ua))                  id = "opera";
    else if (/Vivaldi\//i.test(ua))              id = "vivaldi";
    else if (/Arc\//i.test(ua))                  id = "arc";
    else if (/Brave\//i.test(ua))                id = "brave"; // Brave는 보통 UA 숨김 → Brave-only API 보강 가능
    else if (/Firefox\//i.test(ua))              id = "firefox";
    else if (/Chrome\//i.test(ua))               id = "chrome";
    else if (/Safari\//i.test(ua))               id = "safari";
    else                                          id = "other";

    return { id, os, uaData: ua };
}

function buildGuide(id: BrowserId, os: OsId, permission: PermName): BrowserGuide {
    const permKey = permission === "geolocation" ? "location"
                  : permission === "microphone" ? "microphone"
                  : "camera";
    const permKo = PERMISSION_LABEL[permission];
    const host = typeof window !== "undefined" ? window.location.hostname : "이 사이트";
    const isMobile = os === "ios" || os === "android";

    // ── iOS — WebKit 전용. 시스템 설정 + 브라우저 설정 양쪽 안내 ───────────
    if (id === "ios-other") {
        return {
            name: "Safari (iOS)",
            formFactor: "mobile",
            steps: permission === "geolocation" ? [
                "iOS 설정 앱 열기",
                "개인정보 보호 및 보안 → 위치 서비스 → 켜짐 확인",
                "아래로 스크롤 → Safari → 위치 → 묻기 또는 허용",
                "Safari 탭으로 돌아와 주소창 왼쪽 ⓐⒶ → 웹사이트 설정 확인",
                "페이지 새로고침 후 권한 요청 시 허용",
            ] : [
                "iOS 설정 앱 → Safari → 마이크 → 묻기 또는 허용",
                "Safari로 돌아와 새로고침",
                "권한 요청 시 허용",
            ],
        };
    }
    if (id === "ios-chrome") {
        return {
            name: "iOS Chrome / Edge / Firefox (WebKit)",
            formFactor: "mobile",
            steps: permission === "geolocation" ? [
                "iOS 설정 앱 → 개인정보 보호 → 위치 서비스 켜짐",
                "동일 화면에서 사용 중인 브라우저 앱 찾기 (Chrome / Edge / Firefox)",
                "위치 → 묻기 또는 허용",
                "브라우저로 돌아와 페이지 새로고침",
            ] : [
                "iOS 설정 앱 → 사용 중인 브라우저 앱 → 마이크 → 켜기",
                "브라우저로 돌아와 새로고침",
            ],
        };
    }

    // ── Android Chrome / Edge / Whale / Samsung — 브라우저 내부 사이트 설정 ─
    if (os === "android") {
        const brand = id === "edge" ? "Microsoft Edge"
                    : id === "whale" ? "네이버 웨일"
                    : id === "samsung" ? "삼성 인터넷"
                    : id === "firefox" ? "Firefox"
                    : "Chrome";
        return {
            name: `${brand} (Android)`,
            formFactor: "mobile",
            steps: [
                "주소창 왼쪽 자물쇠 🔒 또는 ⓘ 아이콘 탭",
                "권한 또는 사이트 설정 선택",
                `${permKo} 항목 → 허용으로 변경`,
                "또는 브라우저 메뉴 ⋮ → 설정 → 사이트 설정에서도 변경 가능",
                "페이지 새로고침 후 다시 시도",
            ],
        };
    }

    // ── Chromium 계열 데스크톱 — 직접 URL 이동 가능 ──────────────────────
    if (id === "chrome" || id === "edge" || id === "whale" || id === "brave" || id === "opera" || id === "vivaldi" || id === "arc") {
        const scheme = id === "edge" ? "edge"
                     : id === "whale" ? "whale"
                     : id === "brave" ? "brave"
                     : id === "opera" ? "opera"
                     : id === "vivaldi" ? "vivaldi"
                     : "chrome"; // arc는 chrome:// 사용
        const brand = id === "edge" ? "Microsoft Edge"
                    : id === "whale" ? "네이버 웨일"
                    : id === "brave" ? "Brave"
                    : id === "opera" ? "Opera"
                    : id === "vivaldi" ? "Vivaldi"
                    : id === "arc" ? "Arc"
                    : "Google Chrome";
        return {
            name: `${brand} (${OS_LABEL[os]})`,
            settingsUrl: `${scheme}://settings/content/${permKey}`,
            formFactor: "desktop",
            steps: [
                "아래 주소를 복사해 새 탭 주소창에 직접 붙여넣고 이동",
                "(보안상 브라우저는 외부에서 자동 이동을 차단함)",
                `차단됨 목록에서 ${host} 항목 찾기 — 쓰레기통 클릭 또는 허용으로 변경`,
                "이 탭으로 돌아와 새로고침 후 다시 시도",
                "또는 빠른 방법: 주소창 왼쪽 자물쇠 🔒 → 사이트 설정에서 직접 변경",
            ],
        };
    }

    // ── Safari macOS ──────────────────────────────────────────────────
    if (id === "safari") {
        return {
            name: "Safari (macOS)",
            formFactor: "desktop",
            steps: [
                "메뉴 막대 → Safari → 설정… (단축키 ⌘,)",
                "웹사이트 탭 클릭",
                `왼쪽 목록에서 ${permKo} 항목 선택`,
                `오른쪽에서 ${host} 행을 찾아 허용으로 변경`,
                "Safari로 돌아와 새로고침 후 다시 시도",
            ],
        };
    }

    // ── Firefox 데스크톱 ───────────────────────────────────────────────
    if (id === "firefox") {
        return {
            name: `Mozilla Firefox (${OS_LABEL[os]})`,
            settingsUrl: "about:preferences#privacy",
            formFactor: "desktop",
            steps: [
                "빠른 방법: 주소창 왼쪽 자물쇠 🔒 클릭 → 차단됨 옆 ✕ 클릭 → 새로고침",
                "또는 about:preferences#privacy 주소로 이동",
                `권한 섹션에서 ${permKo} 옆 설정… 버튼 클릭`,
                `${host} 행 선택 → 웹사이트 제거 또는 허용으로 변경`,
                "페이지 새로고침 후 다시 시도",
            ],
        };
    }

    // ── 알 수 없는 브라우저 ────────────────────────────────────────────
    return {
        name: `브라우저 설정 (${OS_LABEL[os]})`,
        formFactor: isMobile ? "mobile" : "desktop",
        steps: [
            "주소창 왼쪽 자물쇠 또는 (i) 아이콘 클릭",
            `사이트 설정에서 ${permKo} 권한을 허용으로 변경`,
            "페이지 새로고침 후 다시 시도",
        ],
    };
}

const MANUAL_BROWSERS: { id: BrowserId; label: string }[] = [
    { id: "chrome",     label: "Chrome" },
    { id: "edge",       label: "Edge" },
    { id: "whale",      label: "네이버 웨일" },
    { id: "samsung",    label: "삼성 인터넷" },
    { id: "brave",      label: "Brave" },
    { id: "opera",      label: "Opera" },
    { id: "vivaldi",    label: "Vivaldi" },
    { id: "arc",        label: "Arc" },
    { id: "firefox",    label: "Firefox" },
    { id: "safari",     label: "Safari (macOS)" },
    { id: "ios-other",  label: "Safari (iOS)" },
    { id: "ios-chrome", label: "iOS Chrome / Edge / Firefox" },
];

export function PermissionGuideModal({ open, onClose, onRetry, permission, onGranted }: Props) {
    const [retrying, setRetrying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [currentState, setCurrentState] = useState<PermissionState | null>(null);
    const [overrideId, setOverrideId] = useState<BrowserId | null>(null);
    const [showPicker, setShowPicker] = useState(false);

    const detected = useMemo(() => detectBrowser(), []);
    const activeId = overrideId ?? detected.id;
    const guide = useMemo(
        () => open ? buildGuide(activeId, detected.os, permission) : null,
        [open, activeId, detected.os, permission]
    );

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
            <div className="bg-white myverse-dark:bg-[#1C1C1C] w-full sm:max-w-md sm:rounded-xl rounded-t-2xl border border-neutral-200 myverse-dark:border-[#2A2A2A] shadow-xl max-h-[90vh] flex flex-col">
                {/* 헤더 */}
                <div className="flex items-start justify-between p-5 pb-3 border-b border-neutral-100 myverse-dark:border-[#2A2A2A]">
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900 myverse-dark:text-neutral-100">
                            {permKo} 권한 다시 켜기
                        </h3>
                        <p className="text-xs text-neutral-500 myverse-dark:text-neutral-400 mt-1">
                            거부된 권한은 브라우저 자체 설정에서만 해제할 수 있습니다
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-neutral-100 myverse-dark:hover:bg-[#2A2A2A] text-neutral-400 transition-colors"
                        aria-label="닫기"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* 본문 */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* 감지된 기기·브라우저 칩 + 수동 변경 */}
                    <div className="border border-neutral-200 myverse-dark:border-[#2A2A2A] rounded-lg p-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                {guide.formFactor === "mobile"
                                    ? <Smartphone className="h-3.5 w-3.5 text-[#6366F1] shrink-0" />
                                    : <Monitor className="h-3.5 w-3.5 text-[#6366F1] shrink-0" />}
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                                        {overrideId ? "수동 선택" : "자동 감지된 환경"}
                                    </p>
                                    <p className="text-xs font-medium text-neutral-800 myverse-dark:text-neutral-200 truncate">
                                        {guide.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPicker(p => !p)}
                                className="shrink-0 flex items-center gap-1 text-[10px] text-neutral-500 myverse-dark:text-neutral-400 hover:text-[#6366F1] transition-colors px-2 py-1 rounded border border-neutral-200 myverse-dark:border-[#2A2A2A]"
                            >
                                다른 브라우저인가요?
                                <ChevronDown className={`h-3 w-3 transition-transform ${showPicker ? "rotate-180" : ""}`} />
                            </button>
                        </div>
                        {showPicker && (
                            <div className="mt-3 pt-3 border-t border-neutral-100 myverse-dark:border-[#2A2A2A] grid grid-cols-2 gap-1.5">
                                {MANUAL_BROWSERS.map(b => {
                                    const selected = activeId === b.id;
                                    return (
                                        <button
                                            key={b.id}
                                            onClick={() => { setOverrideId(b.id); setShowPicker(false); }}
                                            className={`text-left text-[11px] px-2 py-1.5 rounded transition-colors ${
                                                selected
                                                    ? "bg-[#6366F1]/10 text-[#6366F1] font-medium"
                                                    : "text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-50 myverse-dark:hover:bg-[#252525]"
                                            }`}
                                        >
                                            {b.label}
                                        </button>
                                    );
                                })}
                                {overrideId && (
                                    <button
                                        onClick={() => { setOverrideId(null); setShowPicker(false); }}
                                        className="col-span-2 text-[10px] text-neutral-400 hover:text-[#6366F1] py-1"
                                    >
                                        ↺ 자동 감지로 되돌리기
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 자동 감지 안내 */}
                    <div className="flex items-start gap-2 px-3 py-2 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-lg">
                        <Info className="h-3.5 w-3.5 text-[#6366F1] mt-0.5 shrink-0" />
                        <p className="text-[11px] text-[#6366F1] leading-relaxed">
                            아래 단계대로 권한을 허용하면 <strong>이 창이 자동으로 닫힙니다</strong>. 별도 새로고침 없이 즉시 인식됩니다.
                        </p>
                    </div>

                    {/* 직접 이동 링크 (Chrome·Edge·Firefox만) */}
                    {guide.settingsUrl && (
                        <div className="border border-neutral-200 myverse-dark:border-[#2A2A2A] rounded-lg p-3">
                            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">설정 페이지 주소</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs bg-neutral-50 myverse-dark:bg-[#252525] px-2 py-1.5 rounded font-mono text-neutral-800 myverse-dark:text-neutral-200 truncate">
                                    {guide.settingsUrl}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    className="shrink-0 p-1.5 rounded hover:bg-neutral-100 myverse-dark:hover:bg-[#2A2A2A] text-neutral-500 transition-colors"
                                    title="주소 복사"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5 text-[#6366F1]" /> : <Copy className="h-3.5 w-3.5" />}
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
                                <span className="shrink-0 w-5 h-5 rounded-full bg-[#6366F1]/10 text-[#6366F1] text-[11px] font-semibold flex items-center justify-center mt-0.5">
                                    {i + 1}
                                </span>
                                <span className="text-xs text-neutral-700 myverse-dark:text-neutral-300 leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ol>

                    {/* 현재 권한 상태 */}
                    {currentState && (
                        <div className="text-[10px] text-neutral-400 text-center pt-2">
                            현재 상태: <span className={`font-medium ${
                                currentState === "granted" ? "text-[#6366F1]"
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
                <div className="p-4 border-t border-neutral-100 myverse-dark:border-[#2A2A2A] flex gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-50 myverse-dark:hover:bg-[#2A2A2A] transition-colors"
                    >
                        나중에
                    </button>
                    <button
                        onClick={handleRetry}
                        disabled={retrying}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-sm hover:bg-[#4F46E5] transition-colors disabled:opacity-60"
                    >
                        {retrying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        지금 다시 시도
                    </button>
                </div>
            </div>
        </div>
    );
}
