"use client";

import { useState } from "react";
import { timelineData, universeNodes, universeLinks } from "@/lib/universe";
import { TimelineView } from "@/components/TimelineView";
import { RelationshipMap } from "@/components/RelationshipMap";
import { GitGraph, Network } from "lucide-react";
import clsx from "clsx";

export default function UniversePage() {
    const [view, setView] = useState<'timeline' | 'graph'>('graph');

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Universe Visualization</h2>
                    <p className="mt-2 text-zinc-400">The structure and history of Ten:One™ Universe.</p>
                </div>
                <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button
                        onClick={() => setView('timeline')}
                        className={clsx("flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium", view === 'timeline' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white")}
                    >
                        <GitGraph className="h-4 w-4" /> Timeline
                    </button>
                    <button
                        onClick={() => setView('graph')}
                        className={clsx("flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium", view === 'graph' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white")}
                    >
                        <Network className="h-4 w-4" /> Relationships
                    </button>
                </div>
            </div>

            <div className="min-h-[600px]">
                {view === 'timeline' ? (
                    <div className="max-w-3xl mx-auto animation-fade-in">
                        <TimelineView data={timelineData} />
                    </div>
                ) : (
                    <div className="animation-fade-in">
                        <RelationshipMap nodes={universeNodes} links={universeLinks} />
                    </div>
                )}
            </div>
        </div>
    );
}
