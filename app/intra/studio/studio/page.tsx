"use client";

import { useState } from "react";
import { brands, contentItems, ContentItem } from "@/lib/data";
import { Plus, MoreHorizontal, Calendar, Video, FileText, Type, Sparkles } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

const STATUSES: ContentItem['status'][] = ['Idea', 'Scripting', 'Production', 'Review', 'Scheduled', 'Published'];

export default function StudioPage() {
    // In a real app, this state would be managed by a global store or backend
    const [items, setItems] = useState<ContentItem[]>(contentItems);

    const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || id;

    const getIcon = (type: ContentItem['type']) => {
        switch (type) {
            case 'Video': return Video;
            case 'Shorts': return Video;
            case 'Blog': return Type;
            case 'Post': return FileText;
            default: return FileText;
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold">Content Studio</h2>
                    <p className="mt-2 text-neutral-500">Manage content pipeline from idea to publication.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium transition-all">
                        <Sparkles className="h-4 w-4" />
                        AI Brainstorm
                    </button>
                    <Link href="/intra/studio/studio/editor" className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-sm font-medium transition-colors border border-neutral-200">
                        <Plus className="h-4 w-4" />
                        New Content
                    </Link>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 h-full min-w-[1200px]">
                    {STATUSES.map(status => (
                        <div key={status} className="flex-1 flex flex-col min-w-[280px] bg-white border border-neutral-200">
                            {/* Column Header */}
                            <div className="p-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-neutral-400" />
                                    <span className="font-medium">{status}</span>
                                    <span className="text-xs text-neutral-400 bg-neutral-100 px-1.5 py-0.5">
                                        {items.filter(i => i.status === status).length}
                                    </span>
                                </div>
                                <button className="text-neutral-400 hover:text-neutral-900">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                                {items.filter(i => i.status === status).map(item => {
                                    const Icon = getIcon(item.type);
                                    return (
                                        <div key={item.id} className="group bg-white border border-neutral-200 p-3 hover:border-neutral-400 transition-colors cursor-grab active:cursor-grabbing">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-medium text-neutral-500 px-1.5 py-0.5 bg-neutral-100 border border-neutral-200">
                                                    {getBrandName(item.brandId)}
                                                </span>
                                                <button className="text-neutral-300 hover:text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <h4 className="text-sm font-medium mb-3 line-clamp-2 leading-relaxed">
                                                {item.title}
                                            </h4>

                                            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                                                <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                    <Icon className="h-3 w-3" />
                                                    <span>{item.type}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {item.aiGenerated && (
                                                        <span title="AI Generated" className="text-neutral-400">
                                                            <Sparkles className="h-3 w-3" />
                                                        </span>
                                                    )}
                                                    {item.dueDate && (
                                                        <span className={clsx("flex items-center gap-1 text-xs",
                                                            new Date(item.dueDate) < new Date() ? "text-neutral-500" : "text-neutral-400"
                                                        )}>
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
