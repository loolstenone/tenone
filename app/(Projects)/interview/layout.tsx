import type { Metadata } from "next";
import { SITE } from "@/lib/projects/interview";

// Ten:One™ 프로젝트 — 브랜드 사이트가 아니라 ums_sites·siteConfigs에 없다 (siteId=tenone, lib/domain-registry.ts).
// 공식 주소는 interview.tenone.biz 하나 (tenone.biz/interview는 같은 화면이지만 canonical은 서브도메인)
export const metadata: Metadata = {
    metadataBase: new URL(SITE.url),
    title: { absolute: `${SITE.eyebrow} — ${SITE.title}`, template: `%s | ${SITE.eyebrow}` },
    description: `${SITE.tagline} ${SITE.meta}`,
    alternates: { canonical: "/" },
    openGraph: {
        title: `${SITE.eyebrow} — ${SITE.title}`,
        description: SITE.tagline,
        siteName: "Ten:One™",
        type: "website",
        locale: "ko_KR",
    },
    twitter: { card: "summary_large_image" },
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
    return <div className="min-h-screen bg-[#0B0F0C] text-neutral-100">{children}</div>;
}
