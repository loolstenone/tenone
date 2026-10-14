import type { Metadata } from "next";
import Link from "next/link";
import { PLANNERS_CONTAINER, PLANNERS_SECTION, PLANNERS_SPACE, PlannersSectionTitle } from "@/features/planners/PageHero";
import { notFound } from "next/navigation";
import { DownloadButton } from "@/features/planners/DownloadButton";
import { Gallery } from "@/features/planners/pad/Gallery";
import { ProductGrid } from "@/features/planners/pad/ProductCard";
import { Reviews } from "@/features/planners/pad/Reviews";
import { listFileReviews } from "@/lib/planners/reviews";
import { sessionMemberId } from "@/lib/programs/access";
import { fileBadges, fileExt, formatFileSize, getPlannersFile, listPlannersFiles, sortFiles } from "@/lib/planners/library";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const file = await getPlannersFile((await params).id);
    if (!file) return { title: "PAD" };
    return {
        title: file.title,
        description: file.description?.split("\n")[0] ?? `${file.category}, 굿노트·삼성노트·XODO에서 쓰는 PAD 서식`,
        ...(file.thumbnail_url && { openGraph: { images: [file.thumbnail_url] } }),
    };
}

const APPS = "아이패드 굿노트 · 갤럭시 탭 삼성노트 · XODO 등 PDF 필기 앱";

export default async function PlannersPadDetailPage({ params }: Props) {
    const file = await getPlannersFile((await params).id);
    if (!file) notFound();
    const related = sortFiles((await listPlannersFiles(file.kind)).filter((f) => f.category === file.category && f.id !== file.id), "popular").slice(0, 8);
    const { reviews, summary } = await listFileReviews(file.id, await sessionMemberId());
    const badges = fileBadges(file);
    const isPdf = fileExt(file.file_name) === "PDF";

    return (
        <>
            <div className={`${PLANNERS_CONTAINER} pt-10 text-sm text-neutral-500 md:pt-16`}>
                <Link href="/planners/pad" className="hover:text-neutral-900">플래너'스 PAD</Link>
                <span className="mx-2">›</span>
                <Link href={`/planners/pad?c=${encodeURIComponent(file.category)}`} className="hover:text-neutral-900">{file.category}</Link>
            </div>

            <section className={`${PLANNERS_CONTAINER} grid gap-12 py-10 md:grid-cols-2 md:gap-28 md:py-20`}>
                <Gallery images={file.images} title={file.title} />

                <div>
                    {badges.length > 0 && (
                        <div className="mb-3 flex gap-1">
                            {badges.map((b) => <span key={b} className={`px-1.5 py-0.5 text-[11px] font-bold text-white ${b === "NEW" ? "bg-[#0F766E]" : "bg-neutral-900"}`}>{b}</span>)}
                        </div>
                    )}
                    <p className="text-sm text-[#0F766E]">{file.category}</p>
                    <h1 className="mt-1 break-keep text-2xl font-bold leading-snug md:text-3xl">{file.title}</h1>
                    {summary.count > 0 && (
                        <a href="#reviews" className="mt-2 inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900">
                            <span className="text-amber-500">★</span> {summary.average.toFixed(1)} · 후기 {summary.count}개
                        </a>
                    )}

                    <dl className="mt-6 divide-y divide-neutral-100 border-y border-neutral-200 text-sm">
                        <Row label="파일 형식">{fileExt(file.file_name)} · {formatFileSize(file.file_size)}</Row>
                        {isPdf && <Row label="쓰는 곳">{APPS}</Row>}
                        {file.year && <Row label="연도">{file.year}년</Row>}
                        {file.download_count > 0 && <Row label="받은 수">{file.download_count.toLocaleString()}회</Row>}
                    </dl>

                    <div className="mt-6 [&_button]:w-full [&_button]:justify-center [&_button]:py-3 [&_button]:text-base">
                        <DownloadButton fileId={file.id} label="받기" />
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">Ten:One™ 계정으로 로그인하면 누구나 받을 수 있습니다.</p>

                    {file.description && <p className="mt-8 whitespace-pre-line break-keep leading-relaxed text-neutral-700">{file.description}</p>}
                    {isPdf && (
                        <p className="mt-4 break-keep text-sm text-neutral-500">
                            노트 앱에서 PDF를 불러와 새 노트로 만들거나, 쓰고 있는 노트에 페이지로 끼워 넣어 쓰세요.
                        </p>
                    )}
                </div>
            </section>

            {file.detail_images.length > 0 && (
                <section className="border-t border-neutral-200">
                    <div className={`mx-auto max-w-[1040px] px-6 md:px-16 ${PLANNERS_SPACE}`}>
                        <PlannersSectionTitle title="상세 보기" />
                        <div className="space-y-4">
                            {file.detail_images.map((src) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={src} src={src} alt="" loading="lazy" className="w-full border border-neutral-100" />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Reviews fileId={file.id} reviews={reviews} summary={summary} />

            {related.length > 0 && (
                <section className="bg-neutral-50">
                    <div className={PLANNERS_SECTION}>
                        <PlannersSectionTitle title="같은 분류의 서식" href={`/planners/pad?c=${encodeURIComponent(file.category)}`} />
                        <ProductGrid files={related} />
                    </div>
                </section>
            )}
        </>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-4 py-3">
            <dt className="w-20 shrink-0 text-neutral-500">{label}</dt>
            <dd className="break-keep text-neutral-800">{children}</dd>
        </div>
    );
}
