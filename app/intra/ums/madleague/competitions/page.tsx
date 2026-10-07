import { ProgramsAdmin } from "@/components/intra/programs/ProgramsAdmin";
import { adminTitle } from "@/lib/brand-site-menus";

// MADLeague 경쟁 PT·프로젝트 = 코어 프로그램 모듈의 madleague 회차 (별도 관리) · docs/Program_Module.md
export default function MadleagueCompetitionsPage() {
    return (
        <ProgramsAdmin
            title={adminTitle("/intra/ums/madleague/competitions", "경쟁 PT")}
            description="회차를 만들고 참가 신청 폼을 연결한 뒤, 팀을 구성·배정하고 결과를 발표합니다. 팀원은 매드리거 › 경쟁 PT 워크스페이스에서 자기 팀을 봅니다."
            basePath="/intra/ums/madleague/competitions"
            brand="madleague"
        />
    );
}
