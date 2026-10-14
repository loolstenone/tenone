import { DownloadButton } from "@/features/planners/DownloadButton";
import { fileExt, formatFileSize, type PlannersFile } from "@/lib/planners/library-shared";

/** 자료실 분류 한 묶음 — 제목·형식·크기 + 받기 */
export function FileGroup({ title, files, id, desc }: { title: string; files: PlannersFile[]; id?: string; desc?: string }) {
    return (
        <section id={id} className="scroll-mt-24">
            <h2 className="flex items-baseline gap-2 text-xl font-bold">
                {title} <span className="text-sm font-normal text-neutral-500">{files.length}개</span>
            </h2>
            {desc && <p className="mt-1 break-keep text-sm text-neutral-500">{desc}</p>}
            <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
                {files.map((f) => (
                    <li key={f.id} className="flex items-center gap-4 py-3">
                        <div className="min-w-0 flex-1">
                            <p className="break-keep font-medium">{f.title}</p>
                            <p className="mt-0.5 text-xs text-neutral-500">
                                {fileExt(f.file_name)} · {formatFileSize(f.file_size)}
                                {f.download_count > 0 && ` · ${f.download_count.toLocaleString()}회 받음`}
                            </p>
                        </div>
                        <div className="shrink-0 text-right">
                            <DownloadButton fileId={f.id} />
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
