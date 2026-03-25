"use client";

import { useState, createContext, useContext } from "react";
import { siteConfigs } from "@/lib/site-config";
import { ChevronDown, Globe } from "lucide-react";
import clsx from "clsx";

// BU 선택 Context — 모든 BUMS 하위 페이지에서 사용
interface BumsFilterContextType {
    selectedSiteId: string; // "all" or site id
    setSelectedSiteId: (id: string) => void;
}

const BumsFilterContext = createContext<BumsFilterContextType>({
    selectedSiteId: "all",
    setSelectedSiteId: () => {},
});

export function useBumsFilter() {
    return useContext(BumsFilterContext);
}

export default function BumsLayout({ children }: { children: React.ReactNode }) {
    const [selectedSiteId, setSelectedSiteId] = useState("all");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // siteConfigs 기반 전체 사이트 목록
    const allSiteConfigs = Object.entries(siteConfigs).map(([id, config]) => ({
        id,
        name: config.name,
        domain: config.domain,
    }));

    const selectedLabel = selectedSiteId === "all"
        ? "전체 사이트"
        : allSiteConfigs.find(s => s.id === selectedSiteId)?.name || selectedSiteId;

    return (
        <BumsFilterContext.Provider value={{ selectedSiteId, setSelectedSiteId }}>
            <div className="relative">
                {/* BU 선택 드롭다운 — 우측 상단 고정 */}
                <div className="flex justify-end mb-4">
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors rounded"
                        >
                            <Globe className="h-3.5 w-3.5 text-neutral-500" />
                            <span className="font-medium">{selectedLabel}</span>
                            <ChevronDown className={clsx("h-3.5 w-3.5 text-neutral-400 transition-transform", dropdownOpen && "rotate-180")} />
                        </button>

                        {dropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-neutral-200 rounded shadow-lg z-20 max-h-80 overflow-y-auto">
                                    <button
                                        onClick={() => { setSelectedSiteId("all"); setDropdownOpen(false); }}
                                        className={clsx(
                                            "w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors border-b border-neutral-100",
                                            selectedSiteId === "all" && "bg-neutral-50 font-semibold"
                                        )}
                                    >
                                        전체 사이트
                                    </button>
                                    {allSiteConfigs.map(site => (
                                        <button
                                            key={site.id}
                                            onClick={() => { setSelectedSiteId(site.id); setDropdownOpen(false); }}
                                            className={clsx(
                                                "w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors",
                                                selectedSiteId === site.id && "bg-neutral-50 font-semibold"
                                            )}
                                        >
                                            <span>{site.name}</span>
                                            <span className="text-xs text-neutral-400 ml-2">{site.domain}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {children}
            </div>
        </BumsFilterContext.Provider>
    );
}
