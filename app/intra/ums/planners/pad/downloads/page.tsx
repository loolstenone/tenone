"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Loader2, Package, Eye } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { PAD_CATEGORIES } from "@/lib/planners/library-shared";
import { plannersApi } from "@/features/planners/admin/upload";

// 플래너'스 PAD › 받기 현황 — 아임웹 '주문' 자리. 무료 자료라 주문·결제가 없고,
// 누가 받았는지는 저장하지 않는다(개인정보 최소 수집) → 상품·분류별 다운로드 수만
interface Row { id: string; category: string; title: string; is_published: boolean; download_count: number; thumbnail_url: string | null }

export default function PlannersPadDownloadsPage() {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        plannersApi<{ files: Row[] }>("GET").then((d) => setRows(d.files)).catch((e) => setError(e.message));
    }, []);

    if (error) return <p className="text-sm text-red-600">{error}</p>;
    if (!rows) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;

    const total = rows.reduce((s, r) => s + r.download_count, 0);
    const byCategory = PAD_CATEGORIES.map((c) => {
        const list = rows.filter((r) => r.category === c);
        return { c, items: list.length, downloads: list.reduce((s, r) => s + r.download_count, 0) };
    }).filter((x) => x.items > 0);
    const max = Math.max(1, ...byCategory.map((x) => x.downloads));
    const top = [...rows].filter((r) => r.download_count > 0).sort((a, b) => b.download_count - a.download_count).slice(0, 20);

    return (
        <div>
            <PageHeader title="받기 현황" description="플래너'스 PAD 상품을 내려받은 수 — 누가 받았는지는 저장하지 않고 수만 셉니다." />

            <div className="mb-8 grid grid-cols-3 gap-4">
                <StatCard label="전체 받기" value={`${total.toLocaleString()}회`} icon={<Download className="h-4 w-4" />} />
                <StatCard label="공개 상품" value={`${rows.filter((r) => r.is_published).length}개`} icon={<Eye className="h-4 w-4" />} />
                <StatCard label="전체 상품" value={`${rows.length}개`} icon={<Package className="h-4 w-4" />} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <SectionTitle title="분류별" />
                    <ul className="space-y-2 text-sm">
                        {byCategory.map((x) => (
                            <li key={x.c} className="flex items-center gap-3">
                                <span className="w-24 shrink-0 text-neutral-600">{x.c}</span>
                                <span className="h-2 flex-1 bg-neutral-100">
                                    <span className="block h-2 bg-[#0F766E]" style={{ width: `${(x.downloads / max) * 100}%` }} />
                                </span>
                                <span className="w-24 shrink-0 text-right text-xs text-neutral-500">{x.downloads.toLocaleString()}회 · {x.items}개</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card>
                    <SectionTitle title="많이 받은 상품" />
                    {top.length === 0 ? (
                        <p className="py-10 text-center text-sm text-neutral-400">아직 받은 기록이 없습니다.</p>
                    ) : (
                        <ol className="space-y-1 text-sm">
                            {top.map((r, i) => (
                                <li key={r.id}>
                                    <Link href={`/intra/ums/planners/pad/${r.id}`} className="flex items-center gap-3 py-1 hover:text-[#0F766E]">
                                        <span className="w-5 text-right text-xs text-neutral-400">{i + 1}</span>
                                        <span className="flex-1 truncate">{r.title}</span>
                                        <span className="text-xs text-neutral-500">{r.download_count.toLocaleString()}회</span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    )}
                </Card>
            </div>
        </div>
    );
}
