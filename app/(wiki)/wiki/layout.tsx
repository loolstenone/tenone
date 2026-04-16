import Link from "next/link";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { getSiteConfigServer } from "@/lib/supabase/site-configs";

export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('wiki');
    const site = siteConfigs.wiki;
    return {
        title: { default: db?.meta_title ?? site.meta.title, template: `%s | ${db?.name ?? site.name}` },
        description: db?.meta_description ?? site.meta.description,
        icons: { icon: db?.favicon_url ?? site.faviconUrl, apple: db?.apple_touch_icon ?? site.appleTouchIcon },
        openGraph: {
            title: db?.meta_title ?? site.meta.title,
            description: db?.meta_description ?? site.meta.description,
            siteName: 'Ten:One™ Universe',
            type: 'website',
            ...((db?.meta_og_image ?? site.meta.ogImage) && { images: [db?.meta_og_image ?? site.meta.ogImage!] }),
        },
    };
}

const NAV_GROUPS = [
    {
        label: "세계관",
        href: "/wiki/universe",
        children: [
            { label: "비전하우스", href: "/wiki/vision-house" },
            { label: "코어 밸류", href: "/wiki/core-values" },
            { label: "프로토콜", href: "/wiki/protocols" },
        ],
    },
    { label: "브랜드", href: "/wiki/brands" },
    { label: "에이전트", href: "/wiki/agents" },
    { label: "연대기", href: "/wiki/chronicle" },
    { label: "인사이트", href: "/wiki/insights" },
    { label: "온보딩", href: "/wiki/onboarding" },
    { label: "FAQ", href: "/wiki/faq" },
];

export default function WikiLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            {/* 헤더 */}
            <header className="border-b border-neutral-200 bg-white sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between h-12">
                        <Link href="/wiki" className="text-sm font-bold tracking-tight text-neutral-900 hover:text-neutral-600 transition-colors">
                            Ten:One™ Wiki
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/wiki/search" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                                검색
                            </Link>
                            <Link href="/wiki/index" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                                색인
                            </Link>
                            <Link href="/wiki/graph" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                                그래프
                            </Link>
                        </div>
                    </div>
                    {/* 카테고리 네비 */}
                    <nav className="flex items-center gap-0.5 pb-2 overflow-x-auto scrollbar-hide">
                        {NAV_GROUPS.map(item => (
                            <div key={item.href} className="flex items-center gap-0.5">
                                <Link
                                    href={item.href}
                                    className="text-[11px] text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 px-2 py-1 rounded transition-colors whitespace-nowrap font-medium"
                                >
                                    {item.label}
                                </Link>
                                {item.children?.map(child => (
                                    <Link
                                        key={child.href}
                                        href={child.href}
                                        className="text-[11px] text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 px-2 py-1 rounded transition-colors whitespace-nowrap"
                                    >
                                        {child.label}
                                    </Link>
                                ))}
                                {item.children && (
                                    <span className="text-neutral-200 text-[11px] mx-1">|</span>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
                {children}
            </main>

            {/* 푸터 */}
            <footer className="border-t border-neutral-100 bg-neutral-50 py-6">
                <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                    <div className="text-[10px] text-neutral-400">
                        <span className="font-medium">Ten:One™ Universe Wiki</span>
                        <span className="mx-2">·</span>
                        <span>AI(Claude)가 주 1회 컴파일합니다</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/wiki/changelog" className="text-[10px] text-neutral-400 hover:text-neutral-600">변경 이력</Link>
                        <Link href="/wiki/llms.txt" className="text-[10px] text-neutral-400 hover:text-neutral-600">llms.txt</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
