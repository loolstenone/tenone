import { PlannersChrome } from "@/features/planners/PlannersChrome";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { getSiteConfigServer } from "@/lib/supabase/site-configs";

export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('planners');
    const site = siteConfigs.planners;
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

const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Planner's",
    "url": "https://planners.tenone.biz",
    "description": "기획·기획자 교육 커뮤니티 + 능동 AI 플래너. 22년 기획 노하우를 담은 Planner's Planner AI.",
    "potentialAction": {
        "@type": "SearchAction",
        "target": "https://planners.tenone.biz/planners/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
    }
};

const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Planner's Planner AI",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web, Android, iOS",
    "description": "22년 기획 노하우를 담은 종이 플래너 + 능동 AI 비서. 아침 브리핑, 저녁 회고, 59종 템플릿.",
    "url": "https://planners.tenone.biz/planners/app",
    "offers": {
        "@type": "Offer",
        "price": "19000",
        "priceCurrency": "KRW",
        "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "19000",
            "priceCurrency": "KRW",
            "unitText": "년"
        }
    },
    "publisher": {
        "@type": "Organization",
        "name": "Ten:One™",
        "url": "https://tenone.biz"
    }
};

export default function PlannersLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
            />
            <PlannersChrome>{children}</PlannersChrome>
        </div>
    );
}
