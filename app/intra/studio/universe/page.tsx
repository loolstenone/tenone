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
                    <h2 className="text-xl font-bold">Universe Visualization</h2>
                    <p className="mt-2 text-neutral-500">The structure and history of Ten:One™ Universe.</p>
                </div>
                <div className="flex items-center bg-neutral-100 p-1 border border-neutral-200">
                    <button
                        onClick={() => setView('timeline')}
                        className={clsx("flex items-center gap-2 px-4 py-2 transition-colors text-sm font-medium", view === 'timeline' ? "bg-white" : "text-neutral-500 hover:text-neutral-900")}
                    >
                        <GitGraph className="h-4 w-4" /> Timeline
                    </button>
                    <button
                        onClick={() => setView('graph')}
                        className={clsx("flex items-center gap-2 px-4 py-2 transition-colors text-sm font-medium", view === 'graph' ? "bg-white" : "text-neutral-500 hover:text-neutral-900")}
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
