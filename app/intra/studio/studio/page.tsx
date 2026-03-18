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
                    <h2 className="text-3xl font-bold tracking-tight text-white">Content Studio</h2>
                    <p className="mt-2 text-zinc-400">Manage content pipeline from idea to publication.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-md text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">
                        <Sparkles className="h-4 w-4" />
                        AI Brainstorm
                    </button>
                    <Link href="/intra/studio/studio/editor" className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm font-medium transition-colors border border-zinc-700">
                        <Plus className="h-4 w-4" />
                        New Content
                    </Link>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 h-full min-w-[1200px]">
                    {STATUSES.map(status => (
                        <div key={status} className="flex-1 flex flex-col min-w-[280px] bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                            {/* Column Header */}
                            <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between sticky top-0 bg-zinc-900/90 backdrop-blur-sm rounded-t-xl z-10">
                                <div className="flex items-center gap-2">
                                    <div className={clsx("w-2 h-2 rounded-full",
                                        status === 'Idea' ? "bg-zinc-500" :
                                            status === 'Scripting' ? "bg-blue-500" :
                                                status === 'Production' ? "bg-amber-500" :
                                                    status === 'Review' ? "bg-purple-500" :
                                                        status === 'Scheduled' ? "bg-emerald-500" : "bg-indigo-500"
                                    )} />
                                    <span className="font-medium text-zinc-200">{status}</span>
                                    <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">
                                        {items.filter(i => i.status === status).length}
                                    </span>
                                </div>
                                <button className="text-zinc-500 hover:text-white">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                                {items.filter(i => i.status === status).map(item => {
                                    const Icon = getIcon(item.type);
                                    return (
                                        <div key={item.id} className="group bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-600 transition-colors shadow-sm cursor-grab active:cursor-grabbing">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-medium text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                                                    {getBrandName(item.brandId)}
                                                </span>
                                                <button className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <h4 className="text-sm font-medium text-zinc-200 mb-3 line-clamp-2 leading-relaxed">
                                                {item.title}
                                            </h4>

                                            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                    <Icon className="h-3 w-3" />
                                                    <span>{item.type}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {item.aiGenerated && (
                                                        <span title="AI Generated" className="text-indigo-400">
                                                            <Sparkles className="h-3 w-3" />
                                                        </span>
                                                    )}
                                                    {item.dueDate && (
                                                        <span className={clsx("flex items-center gap-1 text-xs",
                                                            new Date(item.dueDate) < new Date() ? "text-red-400" : "text-zinc-500"
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
