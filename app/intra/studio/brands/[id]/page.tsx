import { brands } from "@/lib/data";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Props {
    params: {
        id: string;
    };
}

export default function BrandDetailPage({ params }: Props) {
    const brand = brands.find((b) => b.id === params.id);

    if (!brand) {
        notFound();
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <Link
                href="/intra/studio/brands"
                className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Brands
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar / Logo Area */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden">
                        {/* Placeholder for Logo */}
                        {brand.logoUrl ? (
                            // <Image src={brand.logoUrl} alt={brand.name} fill className="object-cover" />
                            <span className="text-6xl font-bold text-zinc-700">{brand.name.substring(0, 2).toUpperCase()}</span>
                        ) : (
                            <span className="text-6xl font-bold text-zinc-700">{brand.name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <h3 className="text-sm font-medium text-zinc-400 mb-3">Brand Info</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between">
                                    <span className="text-zinc-500">Category</span>
                                    <span className="text-white">{brand.category}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-zinc-500">Founded</span>
                                    <span className="text-white">{brand.foundedDate || '-'}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-zinc-500">Status</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${brand.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                                        }`}>{brand.status}</span>
                                </li>
                            </ul>
                        </div>

                        {brand.websiteUrl && (
                            <a
                                href={brand.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center w-full py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
                            >
                                <Globe className="mr-2 h-4 w-4" />
                                Visit Website
                            </a>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white">{brand.name}</h1>
                        <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
                            {brand.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {brand.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-300 text-sm border border-zinc-700/50">
                                <Tag className="mr-1.5 h-3 w-3 text-indigo-400" />
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Tabs / Sections */}
                    <div className="border-t border-zinc-800 pt-8">
                        <h2 className="text-xl font-bold text-white mb-4">Latest Activity</h2>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-8 text-center">
                            <p className="text-zinc-500">No recent activity recorded for this brand.</p>
                            <button className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                                + Add Activity Log
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
