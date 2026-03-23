"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useBums } from "@/lib/bums-context";
import { ImageUploader } from "@/components/bums/ImageUploader";
import { ArrowLeft, Check } from "lucide-react";

const inputClass = "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none bg-white rounded";
const labelClass = "text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5";

export default function SiteSettingsPage({ params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = use(params);
    const router = useRouter();
    const { getSiteById, updateSite } = useBums();
    const site = getSiteById(siteId);

    const [name, setName] = useState(site?.name || "");
    const [domain, setDomain] = useState(site?.domain || "");
    const [description, setDescription] = useState(site?.description || "");
    const [faviconUrl, setFaviconUrl] = useState(site?.faviconUrl || "");
    const [logoUrl, setLogoUrl] = useState("");
    const [ogImageUrl, setOgImageUrl] = useState("");
    const [saved, setSaved] = useState(false);

    // 색상
    const [primary, setPrimary] = useState("#171717");
    const [accent, setAccent] = useState("#171717");
    const [headerBg, setHeaderBg] = useState("#ffffff");
    const [footerBg, setFooterBg] = useState("#171717");

    // 메타
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeywords, setMetaKeywords] = useState("");

    if (!site) {
        return <div className="py-20 text-center text-neutral-400">사이트를 찾을 수 없습니다</div>;
    }

    const handleSave = () => {
        updateSite(siteId, {
            name,
            domain,
            description,
            faviconUrl: faviconUrl || site.faviconUrl,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button onClick={() => router.push(`/intra/bums/sites/${siteId}`)}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 mb-4 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> {site.name}
                </button>
                <h2 className="text-2xl font-bold">사이트 설정</h2>
                <p className="text-sm text-neutral-500 mt-1">{site.name} 브랜딩 및 메타 정보 관리</p>
            </div>

            {/* 기본 정보 */}
            <section className="border border-neutral-200 bg-white p-6 rounded-lg space-y-4">
                <h3 className="text-sm font-semibold">기본 정보</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>사이트명</label>
                        <input value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>도메인</label>
                        <input value={domain} onChange={e => setDomain(e.target.value)} className={inputClass} />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>설명</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                        rows={3} className={inputClass + " resize-y"} />
                </div>
            </section>

            {/* 브랜딩 */}
            <section className="border border-neutral-200 bg-white p-6 rounded-lg space-y-6">
                <h3 className="text-sm font-semibold">브랜딩</h3>
                <div className="grid gap-6 sm:grid-cols-3">
                    <ImageUploader value={logoUrl} onChange={setLogoUrl} label="로고" previewSize="sm" />
                    <ImageUploader value={faviconUrl} onChange={setFaviconUrl} label="파비콘" previewSize="sm" />
                    <ImageUploader value={ogImageUrl} onChange={setOgImageUrl} label="OG 이미지" previewSize="sm" />
                </div>
            </section>

            {/* 색상 */}
            <section className="border border-neutral-200 bg-white p-6 rounded-lg space-y-4">
                <h3 className="text-sm font-semibold">색상</h3>
                <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                        <label className={labelClass}>Primary</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={primary} onChange={e => setPrimary(e.target.value)}
                                className="w-10 h-10 rounded border border-neutral-200 cursor-pointer" />
                            <input value={primary} onChange={e => setPrimary(e.target.value)}
                                className={inputClass + " font-mono text-xs"} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Accent</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={accent} onChange={e => setAccent(e.target.value)}
                                className="w-10 h-10 rounded border border-neutral-200 cursor-pointer" />
                            <input value={accent} onChange={e => setAccent(e.target.value)}
                                className={inputClass + " font-mono text-xs"} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>헤더 배경</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={headerBg} onChange={e => setHeaderBg(e.target.value)}
                                className="w-10 h-10 rounded border border-neutral-200 cursor-pointer" />
                            <input value={headerBg} onChange={e => setHeaderBg(e.target.value)}
                                className={inputClass + " font-mono text-xs"} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>푸터 배경</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={footerBg} onChange={e => setFooterBg(e.target.value)}
                                className="w-10 h-10 rounded border border-neutral-200 cursor-pointer" />
                            <input value={footerBg} onChange={e => setFooterBg(e.target.value)}
                                className={inputClass + " font-mono text-xs"} />
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO / 메타 */}
            <section className="border border-neutral-200 bg-white p-6 rounded-lg space-y-4">
                <h3 className="text-sm font-semibold">SEO / 메타 정보</h3>
                <div>
                    <label className={labelClass}>페이지 타이틀</label>
                    <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                        placeholder="예: Badak — 마케팅 광고 네트워킹 커뮤니티" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>메타 설명</label>
                    <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)}
                        rows={2} placeholder="검색 엔진에 표시될 설명" className={inputClass + " resize-y"} />
                </div>
                <div>
                    <label className={labelClass}>키워드</label>
                    <input value={metaKeywords} onChange={e => setMetaKeywords(e.target.value)}
                        placeholder="쉼표로 구분 (예: 마케팅, 네트워킹, 커뮤니티)" className={inputClass} />
                </div>
            </section>

            {/* Save */}
            <div className="flex items-center gap-4">
                <button onClick={handleSave}
                    className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors rounded">
                    {saved ? <Check className="h-4 w-4" /> : null}
                    {saved ? "저장 완료" : "저장"}
                </button>
                <button onClick={() => router.push(`/intra/bums/sites/${siteId}`)}
                    className="border border-neutral-200 px-6 py-2.5 text-sm hover:bg-neutral-50 transition-colors rounded">
                    취소
                </button>
            </div>
        </div>
    );
}
