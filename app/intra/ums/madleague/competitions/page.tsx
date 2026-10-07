import { CompetitionsAdmin } from "@/components/intra/madleague/CompetitionsAdmin";
import { adminTitle } from "@/lib/brand-site-menus";

// 경쟁 PT 운영 — 회차 · 참가 신청 폼 연결 · 팀 배정 · 결과 (매드리거 구조 개편 2단계)
export default function MadleagueCompetitionsPage() {
    return <CompetitionsAdmin title={adminTitle("/intra/ums/madleague/competitions", "경쟁 PT")} basePath="/intra/ums/madleague/competitions" />;
}
