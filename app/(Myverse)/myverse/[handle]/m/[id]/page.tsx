// myverse.kr/{handle}/m/{moment_id} — 단일 모먼트 공개 상세 페이지 (단축 URL)

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { getPublicMoment } from "@/lib/myverse/handle/public-page";
import { DOMAINS } from "@/lib/myverse/domains";
import type { DomainKey } from "@/lib/myverse/domains";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ handle: string; id: string }> }): Promise<Metadata> {
    const { handle, id } = await params;
    const data = await getPublicMoment(handle, id);
    if (!data) return { title: "찾을 수 없음" };
    const { profile, moment } = data;
    const caption = moment.caption ?? "";
    return {
        title: `${profile.name ?? `@${handle}`} · ${caption.slice(0, 40)}`,
        description: caption || `${profile.name ?? handle}의 한 장면`,
        openGraph: {
            title: `${profile.name ?? `@${handle}`}`,
            description: caption,
            siteName: "Myverse",
            type: "article",
            images: [moment.media_url],
        },
        twitter: { card: "summary_large_image", images: [moment.media_url] },
    };
}

export default async function MomentPage({ params }: { params: Promise<{ handle: string; id: string }> }) {
    const { handle, id } = await params;
    const data = await getPublicMoment(handle, id);
    if (!data) notFound();
    const { profile, moment } = data;

    const domainMeta = moment.domain ? DOMAINS[moment.domain as DomainKey] : null;

    return (
        <div className="min-h-screen bg-neutral-50">
            <main className="max-w-2xl mx-auto px-4 py-6">
                <Link
                    href={`/myverse/${profile.handle}`}
                    className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-[#6366F1] mb-4"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    @{profile.handle}
                </Link>

                <article className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    {/* 미디어 */}
                    <div className="bg-black">
                        {moment.media_type === "image" ? (
                            <img src={moment.media_url} alt={moment.caption ?? ""} className="w-full max-h-[80vh] object-contain mx-auto" />
                        ) : (
                            <video src={moment.media_url} controls className="w-full max-h-[80vh] mx-auto" />
                        )}
                    </div>

                    {/* 메타 */}
                    <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                            <Calendar className="h-3 w-3" />
                            <span className="tabular-nums">
                                {new Date(moment.happened_at ?? moment.date).toLocaleString("ko-KR", {
                                    year: "numeric", month: "long", day: "numeric",
                                    hour: "2-digit", minute: "2-digit",
                                    timeZone: "Asia/Seoul",
                                })}
                            </span>
                            {domainMeta && (
                                <>
                                    <span>·</span>
                                    <span className="inline-flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: domainMeta.color_hex }} />
                                        <span style={{ color: domainMeta.color_hex }}>{domainMeta.label_ko}</span>
                                    </span>
                                </>
                            )}
                        </div>
                        {moment.caption && (
                            <p className="text-base text-neutral-800 leading-relaxed whitespace-pre-wrap">
                                {moment.caption}
                            </p>
                        )}
                    </div>
                </article>

                <footer className="mt-6 text-center">
                    <Link
                        href={`/myverse/${profile.handle}`}
                        className="text-xs text-neutral-400 hover:text-[#6366F1]"
                    >
                        @{profile.handle}의 더 많은 콘텐츠 →
                    </Link>
                </footer>
            </main>
        </div>
    );
}
