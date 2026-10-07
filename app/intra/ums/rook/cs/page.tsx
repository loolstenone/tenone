import { BrandInquiryInbox } from "@/components/intra/BrandInquiryInbox";

// 사이트 /rook/about Contact 팝업 폼 (form_type rook_inquiry) — RooKie 지원은 /intra/ums/rook/rookie
export default function RookCsPage() {
    return <BrandInquiryInbox brandId="rook" formType="rook_inquiry" brandName="RooK Contact" />;
}
