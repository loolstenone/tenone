import { BrandInquiryInbox } from "@/components/intra/BrandInquiryInbox";
import { adminTitle } from "@/lib/brand-site-menus";

// 사이트 About 페이지 "상담 / 문의" 팝업 (form_type rook_inquiry) — RooKie 지원은 /intra/ums/rook/rookie
export default function RookCsPage() {
    return <BrandInquiryInbox brandId="rook" formType="rook_inquiry" brandName="RooK" title={adminTitle("/intra/ums/rook/cs", "고객 문의")} />;
}
