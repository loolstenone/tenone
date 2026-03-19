import { UniverseTimelineItem } from "@/types/universe";
import { brands } from "@/lib/data";
import clsx from "clsx";

interface Props {
    data: UniverseTimelineItem[];
}

export function TimelineView({ data }: Props) {
    const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || id;

    return (
        <div className="relative mx-auto border-l border-neutral-300 ml-4 md:ml-8 space-y-12 py-4">
            {data.map((item, index) => (
                <div key={item.id} className="relative pl-8 md:pl-12">
                    {/* Dot */}
                    <div className={clsx(
                        "absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border border-white ring-4 ring-neutral-50",
                        item.category === 'Origin' ? "bg-indigo-500" :
                            item.category === 'Expansion' ? "bg-emerald-500" :
                                item.category === 'Conflict' ? "bg-red-500" : "bg-blue-500"
                    )} />

                    {/* Date Label */}
                    <span className="text-sm font-mono text-neutral-500 mb-1 block">{item.year}</span>

                    {/* Content Card */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-5 hover:border-neutral-300 hover:shadow-sm transition-all">
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">{item.title}</h3>
                        <p className="text-neutral-500 text-sm leading-relaxed mb-4">{item.description}</p>

                        {/* Related Brands */}
                        <div className="flex flex-wrap gap-2">
                            {item.relatedBrands.map(brandId => (
                                <span key={brandId} className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
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
