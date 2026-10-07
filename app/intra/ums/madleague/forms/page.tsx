import { FormsAdmin } from "@/components/intra/forms/FormsAdmin";
import { adminTitle } from "@/lib/brand-site-menus";
import { MAD_FORM_PROGRAMS } from "../form-programs";

// 사이트 프로그램(크리에이지·댐 파티 등)의 "참가 신청" — 이벤트마다 새 신청서 (유니버스 공통 폼 모듈)
export default function MadleagueFormsPage() {
    return <FormsAdmin brandId="madleague" title={adminTitle("/intra/ums/madleague/forms", "참가 신청")} basePath="/intra/ums/madleague/forms" programs={MAD_FORM_PROGRAMS} />;
}
