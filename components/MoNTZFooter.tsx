"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const universeLinks = [
    { name: "TenOne.biz", href: "https://tenone.biz" },
    { name: "Badak.biz", href: "https://badak.biz" },
    { name: "MADLeague.net", href: "https://madleague.net" },
    { name: "YouInOne.com", href: "https://youinone.com" },
];

const contactLinks = [
    { name: "tenone.biz/contact", href: "mailto:tenone.biz/contact" },
];

export function MoNTZFooter() {
    const [universeOpen, setUniverseOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <footer className="relative overflow-hidden">
            {/* 그라데이션 배경 — 원본 사이트와 동일한 어두운 갈색/우주 톤 */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1510] via-[#0d0d1a] to-[#1a1510]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9InN0YXIiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmYiIHN0b3Atb3BhY2l0eT0iMC4zIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjMwIiByPSIxIiBmaWxsPSJ1cmwoI3N0YXIpIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iODAiIHI9IjAuOCIgZmlsbD0idXJsKCNzdGFyKSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjE1MCIgcj0iMC42IiBmaWxsPSJ1cmwoI3N0YXIpIi8+PC9zdmc+')] opacity-30" />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ten:One Universe */}
                    <div>
                        <button
                            onClick={() => setUniverseOpen(!universeOpen)}
                            className="flex items-center justify-between w-full text-left text-white font-semibold text-sm pb-3 border-b border-neutral-700"
                        >
                            Ten:One&trade; Universe
                            <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${universeOpen ? "rotate-180" : ""}`} />
                        </button>
                        {universeOpen && (
                            <div className="mt-3 space-y-2">
                                {universeLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-sm text-neutral-400 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Contact */}
                    <div>
                        <button
                            onClick={() => setContactOpen(!contactOpen)}
                            className="flex items-center justify-between w-full text-left text-white font-semibold text-sm pb-3 border-b border-neutral-700"
                        >
                            Contact
                            <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${contactOpen ? "rotate-180" : ""}`} />
                        </button>
                        {contactOpen && (
                            <div className="mt-3 space-y-2">
                                {contactLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="block text-sm text-neutral-400 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-neutral-500">
                    &copy; 2020. Ten:One&trade; all rights reserved.
                </div>
            </div>
        </footer>
    );
}
