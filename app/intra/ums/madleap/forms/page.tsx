import { FormsAdmin } from "@/components/intra/forms/FormsAdmin";
import { adminTitle } from "@/lib/brand-site-menus";

// 매드립 지원서 — 기수 모집마다 새 신청서 (유니버스 공통 폼 모듈). 사이트 주소 /madleap/forms/{slug}
export default function MadleapFormsPage() {
    return <FormsAdmin brandId="madleap" title={adminTitle("/intra/ums/madleap/forms", "지원하기")} basePath="/intra/ums/madleap/forms" />;
}
