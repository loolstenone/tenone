import { ProgramsAdmin } from "@/components/intra/programs/ProgramsAdmin";

// hero 프로그램 = 코어 프로그램 모듈의 hero 회차 (별도 관리) · docs/Program_Module.md
export default function Page() {
    return <ProgramsAdmin title="프로그램" description="HeRo 프로그램 회차 — 사이트(/hero/programs)와 창구로 지정한 MADLeague에서 신청을 받습니다. 유료 결제는 통신판매업 신고 전까지 열지 않습니다." basePath="/intra/hero/programs" brand="hero" defaultKind="program" />;
}
