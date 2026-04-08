"use client";

import { useState, createContext, useContext } from "react";
import { siteConfigs } from "@/lib/site-config";
import { ChevronDown, Globe } from "lucide-react";
import clsx from "clsx";

// UMS 사이트 필터 Context
interface UmsFilterContextType {
    selectedSiteId: string;
    setSelectedSiteId: (id: string) => void;
}

const UmsFilterContext = createContext<UmsFilterContextType>({
    selectedSiteId: "all",
    setSelectedSiteId: () => {},
});

export function useBumsFilter() {
    return useContext(UmsFilterContext);
}

export function useUmsFilter() {
    return useContext(UmsFilterContext);
}

/** 사이트 필터 드롭다운 — 필요한 페이지 PageHeader 안에서만 사용 */
export function SiteFilterDropdown() {
    const { selectedSiteId, setSelectedSiteId } = useContext(UmsFilterContext);
    const [open, setOpen] = useState(false);

    const allSiteConfigs = Object.entries(siteConfigs).map(([id, config]) => ({
        id,
        name: config.name,
        domain: config.domain,
    }));

    const selectedLabel = selectedSiteId === "all"
        ? "전체 사이트"
        : allSiteConfigs.find(s => s.id === selectedSiteId)?.name || selectedSiteId;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors rounded"
            >
                <Globe className="h-3 w-3 text-neutral-500" />
                <span className="font-medium">{selectedLabel}</span>
                <ChevronDown className={clsx("h-3 w-3 text-neutral-400 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-neutral-200 rounded shadow-lg z-20 max-h-72 overflow-y-auto">
                        <button
                            onClick={() => { setSelectedSiteId("all"); setOpen(false); }}
                            className={clsx("w-full text-left px-4 py-2 text-xs hover:bg-neutral-50 transition-colors border-b border-neutral-100",
                                selectedSiteId === "all" && "bg-neutral-50 font-semibold")}
                        >전체 사이트</button>
                        {allSiteConfigs.map(site => (
                            <button key={site.id}
                                onClick={() => { setSelectedSiteId(site.id); setOpen(false); }}
                                className={clsx("w-full text-left px-4 py-2 text-xs hover:bg-neutral-50 transition-colors",
                                    selectedSiteId === site.id && "bg-neutral-50 font-semibold")}
                            >
                                {site.name}
                                <span className="text-[10px] text-neutral-400 ml-1.5">{site.domain}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function UmsLayout({ children }: { children: React.ReactNode }) {
    const [selectedSiteId, setSelectedSiteId] = useState("all");

    return (
        <UmsFilterContext.Provider value={{ selectedSiteId, setSelectedSiteId }}>
            {children}
        </UmsFilterContext.Provider>
    );
}
