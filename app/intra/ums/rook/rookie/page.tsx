import { BrandInquiryInbox } from "@/components/intra/BrandInquiryInbox";

// 사이트 /rook/rookie 팝업 폼 (form_type rook_rookie) — 사이트 메뉴 1:1 (lib/brand-site-menus.ts)
export default function RookRookiePage() {
    return <BrandInquiryInbox brandId="rook" formType="rook_rookie" brandName="RooKie 지원" />;
}
