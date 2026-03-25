"use client";

import { useState } from "react";
import { brands, assets } from "@/lib/data";
import { Search, Filter, Folder, FileText, Image as ImageIcon, Video, Terminal } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";

export default function AssetsPage() {
    const [selectedType, setSelectedType] = useState<string>('All');
    const [selectedBrand, setSelectedBrand] = useState<string>('All');

    const filteredAssets = assets.filter(asset => {
        const typeMatch = selectedType === 'All' || asset.type === selectedType;
        const brandMatch = selectedBrand === 'All' || asset.brandId === selectedBrand;
        return typeMatch && brandMatch;
    });

    const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || id;

    const getIcon = (type: string) => {
        switch (type) {
            case 'Image': return ImageIcon;
            case 'Video': return Video;
            case 'Document': return FileText;
            case 'Prompt': return Terminal;
            default: return Folder;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold">Assets Library</h2>
                    <p className="mt-2 text-neutral-500">Manage digital assets, media files, and AI prompts.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium transition-colors">
                        Upload Asset
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-neutral-200">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="w-full h-9 pl-9 pr-4 border border-neutral-200 bg-white text-sm focus:border-neutral-900 focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <Filter className="h-4 w-4 text-neutral-400" />
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="h-9 border border-neutral-200 bg-white text-sm px-3 focus:outline-none focus:border-neutral-900"
                    >
                        <option value="All">All Types</option>
                        <option value="Image">Image</option>
                        <option value="Video">Video</option>
                        <option value="Document">Document</option>
                        <option value="Prompt">Prompt</option>
                    </select>

                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="h-9 border border-neutral-200 bg-white text-sm px-3 focus:outline-none focus:border-neutral-900"
                    >
                        <option value="All">All Brands</option>
                        {brands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredAssets.map(asset => {
                    const Icon = getIcon(asset.type);
                    return (
                        <div key={asset.id} className="group relative border border-neutral-200 bg-white overflow-hidden hover:border-neutral-400 transition-all cursor-pointer">
                            {/* Thumbnail Area */}
                            <div className="aspect-square bg-white flex items-center justify-center relative">
                                {asset.type === 'Image' ? (
                                    <div className="relative w-full h-full bg-neutral-100 flex items-center justify-center">
                                        <ImageIcon className="h-10 w-10 text-neutral-300" />
                                    </div>
                                ) : (
                                    <Icon className="h-10 w-10 text-neutral-300" />
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button className="px-4 py-2 bg-neutral-900 text-white text-xs font-medium">View</button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-sm font-medium truncate" title={asset.title}>{asset.title}</h3>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-neutral-500 px-1.5 py-0.5 bg-neutral-100 border border-neutral-200">
                                        {getBrandName(asset.brandId)}
                                    </span>
                                    <span className="text-xs text-neutral-400 uppercase">{asset.type}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs text-neutral-300">
                                    <span>{asset.size}</span>
                                    <span>{asset.createdAt}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredAssets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Folder className="h-12 w-12 text-neutral-200 mb-4" />
                    <h3 className="text-lg font-medium">No assets found</h3>
                    <p className="text-neutral-400 max-w-sm mt-2">
                        Try adjusting your filters or search query to find what you're looking for.
                    </p>
                </div>
            )}
        </div>
    );
}
