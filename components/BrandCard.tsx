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
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-neutral-300 hover:shadow-md">
            <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900">
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center">
                    <span className="text-xl font-bold text-neutral-400">{brand.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900 leading-tight">{brand.name}</h3>
                    <span className={clsx(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset mt-2",
                        brand.status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                            brand.status === 'Development' ? 'bg-amber-50 text-amber-700 ring-amber-200' :
                                'bg-neutral-100 text-neutral-500 ring-neutral-200'
                    )}>
                        {brand.category}
                    </span>
                </div>
            </div>

            <div className="mt-4 flex-1">
                <p className="text-sm text-neutral-500 line-clamp-2">{brand.description}</p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
                <Link
                    href={`/brands/${brand.id}`}
                    className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
                >
                    View Details
                </Link>
                {brand.websiteUrl && (
                    <a
                        href={brand.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-neutral-700"
                        aria-label={`${brand.name} 웹사이트 열기`}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>
        </div>
    );
}
