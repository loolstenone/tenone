import { getSiteSeoSettings } from "@/lib/site-seo";

/**
 * 브랜드 구조화 데이터 (JSON-LD) — 인트라 › 사이트 설정 › 인공지능 최적화에서 입력 (ums_sites.json_ld)
 * 브랜드 레이아웃에 한 줄: <SiteJsonLd siteId="madleague" />. 비어 있거나 JSON이 깨졌으면 아무것도 그리지 않는다
 */
export async function SiteJsonLd({ siteId }: { siteId: string }) {
    let json: string | null = null;
    try {
        const raw = (await getSiteSeoSettings(siteId)).json_ld;
        if (raw) json = JSON.stringify(JSON.parse(raw)).replace(/</g, "\\u003c");
    } catch {
        json = null; // 저장 시 검사하므로 여기서 깨질 일은 드물다 — 깨져도 화면은 그대로
    }
    if (!json) return null;
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
