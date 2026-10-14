import Link from "next/link";
import { fileBadges, fileExt, padPath, type PlannersFile } from "@/lib/planners/library-shared";

/** 플래너스 PAD 상품 카드 — 썸네일 · 분류 · 이름 · 형식 · 배지 (바닥상회 몰 카드와 같은 구성, 가격 대신 형식) */
export function ProductCard({ file, priority = false }: { file: PlannersFile; priority?: boolean }) {
    const badges = fileBadges(file);
    return (
        <Link href={padPath(file.id)} className="group block">
            <div className="relative aspect-square overflow-hidden border border-neutral-200 bg-neutral-50">
                {file.thumbnail_url ? (
                    // 바닥상회 상품 사진 (외부 CDN) — next/image 원격 설정 없이 그대로
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={file.thumbnail_url}
                        alt=""
                        loading={priority ? "eager" : "lazy"}
                        className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <span className="flex h-full items-center justify-center text-sm text-neutral-400">{fileExt(file.file_name)}</span>
                )}
                {badges.length > 0 && (
                    <span className="absolute left-2 top-2 flex gap-1">
                        {badges.map((b) => (
                            <span key={b} className={`px-1.5 py-0.5 text-[10px] font-bold ${b === "NEW" ? "bg-[#0F766E] text-white" : "bg-neutral-900 text-white"}`}>{b}</span>
                        ))}
                    </span>
                )}
            </div>
            <p className="mt-2 text-xs text-neutral-500">{file.category}</p>
            <p className="mt-0.5 line-clamp-2 break-keep text-sm font-medium text-neutral-900 group-hover:text-[#0F766E]">{file.title}</p>
            <p className="mt-1 text-xs text-neutral-400">
                {fileExt(file.file_name)}
                {file.download_count > 0 && ` · ${file.download_count.toLocaleString()}회 받음`}
            </p>
        </Link>
    );
}

export function ProductGrid({ files, priorityCount = 0 }: { files: PlannersFile[]; priorityCount?: number }) {
    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {files.map((f, i) => <ProductCard key={f.id} file={f} priority={i < priorityCount} />)}
        </div>
    );
}
