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
                className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Brands
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar / Logo Area */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="aspect-square bg-white border border-neutral-200 flex items-center justify-center relative overflow-hidden">
                        {/* Placeholder for Logo */}
                        {brand.logoUrl ? (
                            <span className="text-6xl font-bold text-neutral-300">{brand.name.substring(0, 2).toUpperCase()}</span>
                        ) : (
                            <span className="text-6xl font-bold text-neutral-300">{brand.name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-white border border-neutral-200">
                            <h3 className="text-sm font-medium text-neutral-500 mb-3">Brand Info</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between">
                                    <span className="text-neutral-400">Category</span>
                                    <span>{brand.category}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-neutral-400">Founded</span>
                                    <span>{brand.foundedDate || '-'}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-neutral-400">Status</span>
                                    <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{brand.status}</span>
                                </li>
                            </ul>
                        </div>

                        {brand.websiteUrl && (
                            <a
                                href={brand.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center w-full py-3 bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
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
                        <h1 className="text-4xl font-bold">{brand.name}</h1>
                        <p className="mt-4 text-lg text-neutral-500 leading-relaxed">
                            {brand.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {brand.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center px-3 py-1 bg-neutral-100 text-sm border border-neutral-200">
                                <Tag className="mr-1.5 h-3 w-3 text-neutral-400" />
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Tabs / Sections */}
                    <div className="border-t border-neutral-200 pt-8">
                        <h2 className="text-xl font-bold mb-4">Latest Activity</h2>
                        <div className="border border-neutral-200 bg-white p-8 text-center">
                            <p className="text-neutral-400">No recent activity recorded for this brand.</p>
                            <button className="mt-4 text-neutral-500 hover:text-neutral-900 text-sm font-medium">
                                + Add Activity Log
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
