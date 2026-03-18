import { UniverseTimelineItem } from "@/types/universe";
import { brands } from "@/lib/data";
import clsx from "clsx";

interface Props {
    data: UniverseTimelineItem[];
}

export function TimelineView({ data }: Props) {
    const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || id;

    return (
        <div className="relative mx-auto border-l border-zinc-800 ml-4 md:ml-8 space-y-12 py-4">
            {data.map((item, index) => (
                <div key={item.id} className="relative pl-8 md:pl-12">
                    {/* Dot */}
                    <div className={clsx(
                        "absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border border-black ring-4 ring-zinc-950",
                        item.category === 'Origin' ? "bg-indigo-500" :
                            item.category === 'Expansion' ? "bg-emerald-500" :
                                item.category === 'Conflict' ? "bg-red-500" : "bg-blue-500"
                    )} />

                    {/* Date Label */}
                    <span className="text-sm font-mono text-indigo-400 mb-1 block">{item.year}</span>

                    {/* Content Card */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors">
                        <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">{item.description}</p>

                        {/* Related Brands */}
                        <div className="flex flex-wrap gap-2">
                            {item.relatedBrands.map(brandId => (
                                <span key={brandId} className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                    {getBrandName(brandId)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
