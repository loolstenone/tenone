import { BrandInquiryInbox } from "@/components/intra/BrandInquiryInbox";
import { adminTitle } from "@/lib/brand-site-menus";

// 사이트 RooKie 페이지 "RooKie 지원하기" 팝업 (form_type rook_rookie) — 이름은 lib/brand-site-menus.ts
export default function RookRookiePage() {
    return <BrandInquiryInbox brandId="rook" formType="rook_rookie" brandName="RooK" title={adminTitle("/intra/ums/rook/rookie", "RooKie 지원")} />;
}
