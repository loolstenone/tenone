import { ProgramsAdmin } from "@/components/intra/programs/ProgramsAdmin";

// rook 프로그램 = 코어 프로그램 모듈의 rook 회차 (별도 관리) · docs/Program_Module.md
export default function Page() {
    return <ProgramsAdmin title="실전 프로젝트" description="RooK 실전 프로젝트 회차 — 사이트(/rook/projects·RooKie)와 창구로 지정한 MADLeague에서 신청을 받고, 선발·팀 배정·제출·결과 발표·참여 확인서까지 이어집니다." basePath="/intra/ums/rook/programs" brand="rook" defaultKind="project" />;
}
