"use client";

// 디지털 명함 — 마이버스/WIO 공통 컴포넌트
// 호출 측은 user 정보 + publicUrl + accent만 전달. 데이터 소스(useAuth/useWIO 등)는 호출 측이 결정.
// QR 생성: 클라이언트 자체 (qrcode 패키지) — 외부 API 의존 없음

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { Mail, Phone, Building2, Share2, Copy, Check, ExternalLink, Download, BookUser, ImageDown } from "lucide-react";

/** 명함에 노출되는 브랜드 자산 (DigitalCard 표시용 최소 형태) */
export interface CardBrandAsset {
    id: string;
    type: "logo" | "palette" | "typography" | "image" | "template" | "link" | "tagline" | "mission";
    title: string;
    file_url?: string | null;
    data?: Record<string, unknown>;
    is_primary?: boolean;
}

export interface DigitalCardProps {
    name?: string | null;
    handle?: string | null;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    avatarUrl?: string | null;
    /** QR이 가리킬 공개 페이지 URL */
    publicUrl: string;
    /** 브랜드 색상 (예: 마이버스 #6366F1, WIO #2563EB) */
    accent?: string;
    /** 헤더 라벨 (예: "CARD", "BUSINESS CARD") */
    eyebrow?: string;
    /** 헤더 타이틀 (예: "디지털 명함") */
    title?: string;
    /** 헤더 설명 */
    description?: string;
    /** 핸들 미설정 시 안내 메시지. null이면 안내 숨김. */
    noHandleNotice?: string | null;
    /** show_on_card=true 인 브랜드 자산 — 카드 하단에 자동 렌더링 */
    brandAssets?: CardBrandAsset[];
}

/** vCard line escape — 콤마·세미콜론·줄바꿈만 (RFC 6350 간소화) */
function escapeVCard(s: string): string {
    return s.replace(/\\/g, "\\\\").replace(/[,;]/g, m => `\\${m}`).replace(/\r?\n/g, "\\n");
}

function formatPhone(p: string): string {
    const d = p.replace(/\D/g, "");
    if (d.length === 11) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
    if (d.length === 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
    return p;
}

export function DigitalCard({
    name,
    handle,
    email,
    phone,
    company,
    avatarUrl,
    publicUrl,
    accent = "#6366F1",
    eyebrow = "CARD",
    title = "디지털 명함",
    description = "QR을 스캔하거나 링크를 공유해 프로필을 전달하세요",
    noHandleNotice,
    brandAssets,
}: DigitalCardProps) {
    const [copied, setCopied] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [savingImage, setSavingImage] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!publicUrl) { setQrDataUrl(""); return; }
        QRCode.toDataURL(publicUrl, {
            width: 480,
            margin: 1,
            errorCorrectionLevel: "M",
            color: { dark: "#0F172A", light: "#FFFFFF" },
        })
            .then(setQrDataUrl)
            .catch(() => setQrDataUrl(""));
    }, [publicUrl]);

    function downloadQR() {
        if (!qrDataUrl) return;
        const a = document.createElement("a");
        a.href = qrDataUrl;
        a.download = `card-${handle ?? "qr"}.png`;
        a.click();
    }

    // 명함 카드 전체를 PNG로 캡처해 다운로드
    async function downloadCardImage() {
        if (!cardRef.current || savingImage) return;
        setSavingImage(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#FFFFFF",
            });
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `card-${handle ?? name ?? "image"}.png`;
            a.click();
        } catch (e) {
            console.warn("card image capture failed", e);
        } finally {
            setSavingImage(false);
        }
    }

    // vCard 3.0 다운로드 — 주소록 즉시 등록 (.vcf)
    function downloadVCard() {
        const lines = ["BEGIN:VCARD", "VERSION:3.0"];
        if (name) lines.push(`FN:${escapeVCard(name)}`);
        if (name) lines.push(`N:${escapeVCard(name)};;;;`);
        if (company) lines.push(`ORG:${escapeVCard(company)}`);
        if (email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(email)}`);
        if (phone) lines.push(`TEL;TYPE=CELL:${phone.replace(/\D/g, "")}`);
        if (publicUrl) lines.push(`URL:${escapeVCard(publicUrl)}`);
        if (handle) lines.push(`NICKNAME:${escapeVCard(handle)}`);
        lines.push("END:VCARD");
        const blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${handle ?? name ?? "contact"}.vcf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    async function copyLink() {
        if (!publicUrl) return;
        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* noop */ }
    }

    async function share() {
        if (!publicUrl) return;
        const shareData = {
            title: `${name ?? ""} 명함`,
            text: `${name ?? ""}${handle ? ` (@${handle})` : ""}`,
            url: publicUrl,
        };
        try {
            if (navigator.share) await navigator.share(shareData);
            else await copyLink();
        } catch { /* noop */ }
    }

    const initial = useMemo(() => {
        const src = (name ?? email ?? "?").trim();
        return src[0]?.toUpperCase() ?? "?";
    }, [name, email]);

    return (
        <div className="max-w-xl mx-auto">
            {/* 헤더 */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2" style={{ color: accent }}>
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        contact_page
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-widest">{eyebrow}</span>
                </div>
                <h1
                    className="text-[28px] sm:text-[32px] font-medium tracking-tight text-neutral-900 leading-tight"
                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                >
                    {title}
                </h1>
                <p className="text-sm text-neutral-500 mt-1.5">{description}</p>
            </div>

            {/* 명함 카드 (PNG 캡처 대상) */}
            <div
                ref={cardRef}
                className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-100"
                style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}
            >
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                    {/* 좌측: 프로필 */}
                    <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-4 mb-5">
                            <div
                                className="h-20 w-20 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)` }}
                            >
                                {avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={avatarUrl} alt={name ?? ""} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white text-2xl font-semibold" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
                                        {initial}
                                    </span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xl font-semibold text-neutral-900 truncate" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
                                    {name ?? "이름 미설정"}
                                </h2>
                                {handle && (
                                    <p className="text-sm" style={{ color: accent }}>@{handle}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2.5 text-sm">
                            {company && (
                                <div className="flex items-center gap-2.5 text-neutral-700">
                                    <Building2 className="h-4 w-4 text-neutral-400 shrink-0" />
                                    <span className="truncate">{company}</span>
                                </div>
                            )}
                            {email && (
                                <a href={`mailto:${email}`} className="flex items-center gap-2.5 text-neutral-700 transition-colors hover:opacity-80" style={{ ['--hover' as any]: accent }}>
                                    <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                                    <span className="truncate">{email}</span>
                                </a>
                            )}
                            {phone && (
                                <a href={`tel:${phone}`} className="flex items-center gap-2.5 text-neutral-700 transition-colors hover:opacity-80">
                                    <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                                    <span>{formatPhone(phone)}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* 우측: QR */}
                    {publicUrl && qrDataUrl && (
                        <div className="shrink-0 flex flex-col items-center gap-2">
                            <button
                                onClick={downloadQR}
                                title="QR 다운로드"
                                className="p-2 bg-white border border-neutral-200 rounded-xl hover:border-current transition-colors"
                                style={{ color: accent }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={qrDataUrl} alt="QR Code" width={160} height={160} className="block" />
                            </button>
                            <span className="text-[10px] uppercase tracking-widest text-neutral-400">SCAN ME</span>
                        </div>
                    )}
                </div>

                {/* 브랜드 자산 섹션 (show_on_card=true 인 것만) */}
                {brandAssets && brandAssets.length > 0 && (
                    <BrandAssetsSection assets={brandAssets} accent={accent} />
                )}

                {/* 푸터: 공개 링크 */}
                {publicUrl && (
                    <div className="mt-6 pt-5 border-t border-neutral-100">
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                            <ExternalLink className="h-3 w-3" />
                            <span className="uppercase tracking-widest font-semibold">PUBLIC LINK</span>
                        </div>
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                           className="text-sm font-medium break-all hover:underline"
                           style={{ color: accent }}>
                            {publicUrl}
                        </a>
                    </div>
                )}
            </div>

            {/* 액션 버튼 — 5 버튼 (모바일: 공유 풀폭 + 4 그리드 / 데스크톱 1x5) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
                <button
                    onClick={share}
                    disabled={!publicUrl}
                    className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold tracking-wide active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: accent, boxShadow: `0 4px 12px ${accent}26` }}
                >
                    <Share2 className="h-4 w-4" />
                    공유
                </button>
                <button
                    onClick={downloadVCard}
                    disabled={!name && !email && !phone}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-sm font-semibold tracking-wide hover:border-current transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    title="vCard (.vcf) 다운로드 — 주소록 등록"
                >
                    <BookUser className="h-4 w-4" />
                    vCard
                </button>
                <button
                    onClick={copyLink}
                    disabled={!publicUrl}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-sm font-semibold tracking-wide hover:border-current transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "복사됨" : "링크"}
                </button>
                <button
                    onClick={downloadQR}
                    disabled={!qrDataUrl}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-sm font-semibold tracking-wide hover:border-current transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    <Download className="h-4 w-4" />
                    QR
                </button>
                <button
                    onClick={downloadCardImage}
                    disabled={savingImage}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-sm font-semibold tracking-wide hover:border-current transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    title="명함 카드 전체 이미지 (PNG)"
                >
                    <ImageDown className="h-4 w-4" />
                    {savingImage ? "저장 중…" : "이미지"}
                </button>
            </div>

            {/* 핸들 미설정 안내 */}
            {!handle && noHandleNotice && (
                <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
                    <p className="text-xs leading-relaxed">{noHandleNotice}</p>
                </div>
            )}
        </div>
    );
}

/** 브랜드 자산을 카드 내부에 렌더 — 로고/태그라인/팔레트/링크 */
function BrandAssetsSection({ assets, accent }: { assets: CardBrandAsset[]; accent: string }) {
    const logos = assets.filter(a => a.type === "logo" && a.file_url);
    const taglines = assets.filter(a => a.type === "tagline");
    const palettes = assets.filter(a => a.type === "palette");
    const links = assets.filter(a => a.type === "link");

    const primaryTagline = taglines.find(t => t.is_primary) ?? taglines[0];
    const primaryLogo = logos.find(l => l.is_primary) ?? logos[0];
    const primaryPalette = palettes.find(p => p.is_primary) ?? palettes[0];

    if (!primaryTagline && !primaryLogo && !primaryPalette && links.length === 0) return null;

    return (
        <div className="mt-6 pt-5 border-t border-neutral-100 space-y-3">
            {/* 로고 + 태그라인 */}
            {(primaryLogo || primaryTagline) && (
                <div className="flex items-center gap-3">
                    {primaryLogo && primaryLogo.file_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={primaryLogo.file_url} alt={primaryLogo.title} className="h-8 w-auto object-contain" />
                    )}
                    {primaryTagline && (
                        <p className="text-sm text-neutral-700 italic" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
                            &ldquo;{(primaryTagline.data as { text?: string } | undefined)?.text ?? primaryTagline.title}&rdquo;
                        </p>
                    )}
                </div>
            )}

            {/* 컬러 팔레트 */}
            {primaryPalette && (() => {
                const colors = (primaryPalette.data as { colors?: Array<{ hex?: string }> } | undefined)?.colors ?? [];
                if (colors.length === 0) return null;
                return (
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 mr-1">PALETTE</span>
                        {colors.slice(0, 6).map((c, i) => (
                            <span
                                key={i}
                                className="h-4 w-4 rounded-full border border-neutral-200"
                                style={{ backgroundColor: c.hex ?? "#ccc" }}
                                title={c.hex}
                            />
                        ))}
                    </div>
                );
            })()}

            {/* 외부 링크 */}
            {links.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {links.map(l => {
                        const url = (l.data as { url?: string } | undefined)?.url;
                        if (!url) return null;
                        return (
                            <a
                                key={l.id}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-neutral-200 hover:border-current transition-colors"
                                style={{ color: accent }}
                            >
                                <ExternalLink className="h-2.5 w-2.5" />
                                {l.title}
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
