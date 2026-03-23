"use client";

import Link from "next/link";

const quickLinks = [
    { name: "Seoul/360°", href: "/s360" },
    { name: "Subway Line", href: "/s360/subway-line" },
    { name: "District", href: "/s360/district" },
    { name: "Station", href: "/s360/station" },
    { name: "Outside Seoul", href: "/s360/outside-seoul" },
];

const subwayLines = [
    { name: "Line 1", href: "/s360/subway-line#line1" },
    { name: "Line 2", href: "/s360/subway-line#line2" },
    { name: "Line 3", href: "/s360/subway-line#line3" },
    { name: "Line 4", href: "/s360/subway-line#line4" },
    { name: "Line 5", href: "/s360/subway-line#line5" },
    { name: "Line 6", href: "/s360/subway-line#line6" },
    { name: "Line 7", href: "/s360/subway-line#line7" },
    { name: "Line 8", href: "/s360/subway-line#line8" },
    { name: "Line 9", href: "/s360/subway-line#line9" },
];

export function Seoul360Footer() {
    return (
        <footer className="bg-[#3D3D3D] text-neutral-400">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-1 mb-3">
                            <span className="bg-white text-[#3D3D3D] text-xs font-bold px-1.5 py-0.5 rounded-sm">
                                Seoul
                            </span>
                            <span className="text-white font-light text-lg">/360°</span>
                        </div>
                        <p className="text-sm text-neutral-400 mb-2">
                            #ChallengeOnlySubwaySeoulTour
                        </p>
                        <p className="text-xs text-neutral-500">
                            Your complete guide to exploring Seoul using only the subway.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-3">Quick Links</h3>
                        <div className="flex flex-col gap-1.5">
                            {quickLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Subway Lines */}
                    <div>
                        <h3 className="text-white text-sm font-semibold mb-3">Subway Lines</h3>
                        <div className="grid grid-cols-3 gap-1.5">
                            {subwayLines.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="mt-8 pt-6 border-t border-neutral-600">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs">
                            Contact: lools@tenone.biz
                        </p>
                        <p className="text-xs">
                            &copy; Seoul/360°. Powered by{" "}
                            <a
                                href="https://tenone.biz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                            >
                                Ten:One&trade; Universe
                            </a>.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
