import { ProgramsAdmin } from "@/components/intra/programs/ProgramsAdmin";

// planners 프로그램 = 코어 프로그램 모듈의 planners 회차 (별도 관리) · docs/Program_Module.md
export default function Page() {
    return <ProgramsAdmin title="프로젝트" description="Planner's 훈련·실전 프로젝트 회차 — 사이트(/planners/projects)와 창구로 지정한 MADLeague에서 신청을 받고, 선발·팀 배정·제출·결과 발표·참여 확인서까지 이어집니다." basePath="/intra/ums/planners/programs" brand="planners" defaultKind="course" />;
}
