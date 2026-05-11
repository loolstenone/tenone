"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Download,
    Smartphone,
    Share2,
    Plus,
    ChevronLeft,
    Check,
    Apple,
    Monitor,
    Copy,
    QrCode,
} from "lucide-react";
import { usePwaInstall } from "@/lib/myverse/use-pwa-install";

type Platform = "ios" | "android" | "desktop" | "unknown";

function detectPlatform(): Platform {
    if (typeof navigator === "undefined") return "unknown";
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios";
    if (/android/.test(ua)) return "android";
    return "desktop";
}

const APP_URL = "https://myverse.kr/myverse/app";

export function InstallView() {
    const [platform, setPlatform] = useState<Platform>("unknown");
    const [copied, setCopied] = useState(false);
    const [installing, setInstalling] = useState(false);
    const { canInstall, isInstalled: installed, install } = usePwaInstall();

    useEffect(() => {
        setPlatform(detectPlatform());
    }, []);

    async function triggerInstall() {
        setInstalling(true);
        try {
            await install();
        } finally {
            setInstalling(false);
        }
    }
    const bip = canInstall;

    async function copyUrl() {
        try {
            await navigator.clipboard.writeText(APP_URL);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* ignore */ }
    }

    return (
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-14">
            <Link href="/myverse" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
                <ChevronLeft className="h-4 w-4" /> Myverse
            </Link>

            {/* Hero */}
            <header className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/Myverse_logo_black.png"
                        alt="Myverse"
                        className="w-16 h-16 rounded-2xl shadow-lg shadow-black/10 shrink-0"
                    />
                    <div>
                        <h1 className="font-serif text-3xl text-neutral-900 leading-tight">
                            myverse<sup className="text-xs font-bold text-[#6366F1] ml-0.5">AI</sup>
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">홈 화면에 설치하면 앱처럼 빠르게 열립니다.</p>
                    </div>
                </div>

                {installed ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl text-[#6366F1] text-sm">
                        <Check className="h-4 w-4" />
                        이미 홈 화면에 설치되어 있어요. 홈에서 아이콘을 눌러 시작하세요.
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 text-xs">
                            <Smartphone className="h-3 w-3" /> Android · iOS · PC
                        </span>
                        <span className="text-neutral-400">·</span>
                        <span>모든 기능은 웹에서 그대로 작동합니다.</span>
                    </div>
                )}
            </header>

            {/* Platform tabs */}
            <div className="flex gap-2 mb-6 border-b border-neutral-200">
                {([
                    { key: "android" as Platform, label: "Android", icon: Smartphone },
                    { key: "ios"     as Platform, label: "iPhone · iPad", icon: Apple },
                    { key: "desktop" as Platform, label: "PC (Chrome · Edge)", icon: Monitor },
                ]).map(({ key, label, icon: Icon }) => {
                    const active = platform === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setPlatform(key)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
                                active
                                    ? "border-[#6366F1] text-[#6366F1] font-semibold"
                                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Per-platform body */}
            {platform === "android" && (
                <Section title="Android 설치">
                    {bip ? (
                        <ActionCard
                            icon={Download}
                            title="한 번 클릭으로 설치"
                            description="Chrome·삼성 인터넷에서 바로 홈 화면에 추가됩니다."
                        >
                            <button
                                onClick={triggerInstall}
                                disabled={installing}
                                className="w-full mt-3 px-4 py-3 bg-[#6366F1] text-white rounded-lg text-sm font-semibold hover:bg-[#4F46E5] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                {installing ? "설치 중…" : "Myverse AI 설치"}
                            </button>
                        </ActionCard>
                    ) : (
                        <ActionCard
                            icon={Smartphone}
                            title="브라우저에서 직접 설치"
                            description="자동 설치 안내가 안 뜨거나, 설치 버튼을 다시 보고 싶다면 아래 단계로 진행하세요."
                        >
                            <Steps>
                                <Step n={1}>Chrome (또는 삼성 인터넷) 으로 이 페이지를 엽니다.</Step>
                                <Step n={2}>주소창 우측 <b className="text-neutral-900">⋮</b> 메뉴를 눌러 <b className="text-neutral-900">앱 설치</b> 또는 <b className="text-neutral-900">홈 화면에 추가</b> 를 선택합니다.</Step>
                                <Step n={3}>설치 후 홈 화면 아이콘으로 바로 열 수 있습니다.</Step>
                            </Steps>
                        </ActionCard>
                    )}
                </Section>
            )}

            {platform === "ios" && (
                <Section title="iPhone · iPad 설치">
                    <ActionCard
                        icon={Apple}
                        title="홈 화면에 추가 (Safari)"
                        description="iOS 는 보안 정책상 자동 설치 버튼이 없습니다. Safari 에서 아래 3단계로 추가하세요."
                    >
                        <Steps>
                            <Step n={1}>
                                <b className="text-neutral-900">Safari</b> 로 이 페이지를 엽니다.
                                <span className="text-neutral-400 text-xs ml-1">(Chrome·다른 브라우저는 추가 불가)</span>
                            </Step>
                            <Step n={2}>
                                하단(또는 상단) <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700"><Share2 className="h-3 w-3" /> 공유</span> 버튼을 누릅니다.
                            </Step>
                            <Step n={3}>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700"><Plus className="h-3 w-3" /> 홈 화면에 추가</span> 를 선택합니다.
                            </Step>
                            <Step n={4}>이름을 확인 후 <b className="text-neutral-900">추가</b> 를 누르면 완료.</Step>
                        </Steps>
                    </ActionCard>
                </Section>
            )}

            {platform === "desktop" && (
                <Section title="PC 설치 (Chrome · Edge)">
                    {bip ? (
                        <ActionCard
                            icon={Download}
                            title="한 번 클릭으로 설치"
                            description="브라우저 별도 창에서 앱처럼 실행됩니다."
                        >
                            <button
                                onClick={triggerInstall}
                                disabled={installing}
                                className="w-full mt-3 px-4 py-3 bg-[#6366F1] text-white rounded-lg text-sm font-semibold hover:bg-[#4F46E5] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                {installing ? "설치 중…" : "PC에 설치"}
                            </button>
                        </ActionCard>
                    ) : (
                        <ActionCard
                            icon={Monitor}
                            title="브라우저에서 직접 설치"
                            description="Chrome 또는 Edge 의 주소창 우측 설치 아이콘을 사용합니다."
                        >
                            <Steps>
                                <Step n={1}>Chrome 또는 Edge 로 이 페이지를 엽니다.</Step>
                                <Step n={2}>주소창 우측 <b className="text-neutral-900">설치</b> 아이콘 (모니터 + 다운로드) 을 클릭.</Step>
                                <Step n={3}>설치하면 별도 창의 앱으로 실행됩니다. 작업 표시줄·Dock 에 추가 가능.</Step>
                            </Steps>
                        </ActionCard>
                    )}
                </Section>
            )}

            {platform === "unknown" && (
                <Section title="기기 확인 중…">
                    <p className="text-sm text-neutral-500">위 탭에서 기기를 선택해 주세요.</p>
                </Section>
            )}

            {/* Universal: copy link / QR */}
            <Section title="다른 기기로 보내기" topGap>
                <div className="grid sm:grid-cols-2 gap-3">
                    <button
                        onClick={copyUrl}
                        className="flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-colors text-left"
                    >
                        <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                            {copied ? <Check className="h-4 w-4 text-[#6366F1]" /> : <Copy className="h-4 w-4 text-neutral-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-neutral-900">{copied ? "복사됨" : "주소 복사"}</p>
                            <p className="text-[11px] text-neutral-400 font-mono truncate">{APP_URL}</p>
                        </div>
                    </button>
                    <a
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&data=${encodeURIComponent(APP_URL)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-colors text-left"
                    >
                        <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                            <QrCode className="h-4 w-4 text-neutral-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-neutral-900">QR 코드 보기</p>
                            <p className="text-[11px] text-neutral-400">휴대폰으로 스캔해 바로 열기</p>
                        </div>
                    </a>
                </div>
            </Section>

            {/* Notes */}
            <div className="mt-10 p-5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-600 leading-relaxed">
                <p className="font-semibold text-neutral-900 mb-2">설치하면 무엇이 좋아지나요?</p>
                <ul className="space-y-1 list-disc list-inside marker:text-[#6366F1]">
                    <li>홈 화면 아이콘으로 한 번에 진입 — 브라우저 주소창 입력 불필요</li>
                    <li>전체 화면 모드 (브라우저 UI 가림) 로 노트·일정에 집중</li>
                    <li>오프라인에서도 최근에 본 페이지 열람 가능</li>
                </ul>
                <p className="font-semibold text-neutral-900 mt-4 mb-2">앱 스토어 (Play Store · App Store) 에는 없나요?</p>
                <p>현재 Myverse는 <b className="text-neutral-900">PWA (Progressive Web App)</b> 형태로만 제공됩니다.
                    설치 파일을 별도로 받지 않고, 위 절차로 홈 화면에 추가하면 네이티브 앱과 동일하게 사용됩니다.
                    모든 기능은 웹과 100% 동일합니다.</p>
            </div>
        </div>
    );
}

function Section({ title, children, topGap }: { title: string; children: React.ReactNode; topGap?: boolean }) {
    return (
        <section className={topGap ? "mt-10" : ""}>
            <h2 className="text-[11px] uppercase tracking-widest text-neutral-400 mb-3">{title}</h2>
            <div className="space-y-3">{children}</div>
        </section>
    );
}

function ActionCard({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900">{title}</p>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function Steps({ children }: { children: React.ReactNode }) {
    return <ol className="mt-4 space-y-2.5">{children}</ol>;
}
function Step({ n, children }: { n: number; children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-3 text-sm text-neutral-700 leading-relaxed">
            <span className="shrink-0 w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{n}</span>
            <span className="flex-1">{children}</span>
        </li>
    );
}
