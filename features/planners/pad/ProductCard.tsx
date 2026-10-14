import Link from "next/link";
import { fileBadges, fileExt, padPath, type PlannersFile } from "@/lib/planners/library-shared";

/** 플래너'스 PAD 상품 카드 — 썸네일 · 분류 · 이름 · 형식 · 배지 (가격 대신 형식) · 테두리 없이 큰 사진 (logrog 참조) */
export function ProductCard({ file, priority = false, reviewCount = 0 }: { file: PlannersFile; priority?: boolean; reviewCount?: number }) {
    const badges = fileBadges(file);
    return (
        <Link href={padPath(file.id)} className="group block">
            <div className="relative aspect-square overflow-hidden bg-neutral-50">
                {file.thumbnail_url ? (
                    // 바닥상회 상품 사진 (외부 CDN) — next/image 원격 설정 없이 그대로
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={file.thumbnail_url}
                        alt=""
                        loading={priority ? "eager" : "lazy"}
                        className="h-full w-full object-contain p-8 transition-transform duration-500 group-hover:scale-[1.04] md:p-14"
                    />
                ) : (
                    <span className="flex h-full items-center justify-center text-sm text-neutral-400">{fileExt(file.file_name)}</span>
                )}
                {badges.length > 0 && (
                    <span className="absolute left-3 top-3 flex gap-1">
                        {badges.map((b) => (
                            <span key={b} className={`px-1.5 py-0.5 text-[10px] font-bold ${b === "NEW" ? "bg-[#0F766E] text-white" : "bg-neutral-900 text-white"}`}>{b}</span>
                        ))}
                    </span>
                )}
            </div>
            <p className="mt-6 text-xs tracking-wide text-neutral-400">{file.category}</p>
            <p className="mt-1.5 line-clamp-2 break-keep font-medium text-neutral-900 group-hover:text-[#0F766E] md:text-[17px]">{file.title}</p>
            <p className="mt-2 text-xs text-neutral-400">
                {fileExt(file.file_name)}
                {reviewCount > 0 && ` · 후기 ${reviewCount}`}
                {file.download_count > 0 && ` · ${file.download_count.toLocaleString()}회 받음`}
            </p>
        </Link>
    );
}

export function ProductGrid({ files, priorityCount = 0, reviewCounts }: { files: PlannersFile[]; priorityCount?: number; reviewCounts?: Map<string, number> }) {
    return (
        <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:gap-x-12 md:gap-y-24 lg:grid-cols-3">
            {files.map((f, i) => <ProductCard key={f.id} file={f} priority={i < priorityCount} reviewCount={reviewCounts?.get(f.id) ?? 0} />)}
        </div>
    );
}
