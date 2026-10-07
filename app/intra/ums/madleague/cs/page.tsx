import { BrandInquiryInbox } from "@/components/intra/BrandInquiryInbox";
import { adminTitle } from "@/lib/brand-site-menus";

// 사이트 푸터 Contact의 "문의하기" (/madleague/contact, form_type madleague_inquiry)
export default function MadleagueCsPage() {
    return <BrandInquiryInbox brandId="madleague" formType="madleague_inquiry" brandName="MAD League" title={adminTitle("/intra/ums/madleague/cs", "고객 문의")} />;
}
