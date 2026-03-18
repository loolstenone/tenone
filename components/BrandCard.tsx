import { Brand } from "@/types/brand";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

interface BrandCardProps {
    brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/80">
            <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center">
                    {/* Fallback for missing images */}
                    <span className="text-xl font-bold text-zinc-600">{brand.name.substring(0, 2).toUpperCase()}</span>
                    {/* We will implement Image component when logos are available */}
                    {/* <Image src={brand.logoUrl || ''} alt={brand.name} fill className="object-cover" /> */}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white leading-tight">{brand.name}</h3>
                    <span className={clsx(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset mt-2",
                        brand.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' :
                            brand.status === 'Development' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20' :
                                'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20'
                    )}>
                        {brand.category}
                    </span>
                </div>
            </div>

            <div className="mt-4 flex-1">
                <p className="text-sm text-zinc-400 line-clamp-2">{brand.description}</p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
                <Link
                    href={`/brands/${brand.id}`}
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
                >
                    View Details
                </Link>
                {brand.websiteUrl && (
                    <a
                        href={brand.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-500 hover:text-zinc-300"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>
        </div>
    );
}
