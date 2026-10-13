"use client";

/**
 * 팀 진단 (2026-10-13) — 기업이 팀원에게 기본 성향 검사를 안내 → 팀 단위 구성·빈자리 분석
 * 개인 결과는 팀원 본인이 공유에 동의한 경우만 기업에 (개인정보보호법 제17조) · 기본은 팀 요약
 */
import { Users, Puzzle, MessagesSquare } from "lucide-react";
import { BusinessServicePage } from "@/features/hero/business/BusinessServicePage";
import { hitStageMinutes } from "@/lib/hit/stages";

export default function TeamDiagnosisPage() {
    return (
        <BusinessServicePage
            service="team_diagnosis"
            title={<>우리 팀은 어떤 사람들로<br />이루어져 있을까요</>}
            desc="팀원들이 HeRo 기본 성향 검사를 받으면, 팀 전체의 성향·일하는 방식 구성과 비어 있는 역할을 한 장의 리포트로 정리해 드립니다. 다음에 어떤 사람을 뽑아야 할지도 여기서 보입니다."
            deliverables={[
                { icon: Users, title: "팀 구성표", desc: "팀원의 성향 유형·행동 유형 분포를 한눈에 봅니다. 한쪽으로 쏠린 곳과 고르게 퍼진 곳이 드러납니다." },
                { icon: Puzzle, title: "비어 있는 역할", desc: "추진·조율·분석·실행 중 팀에 부족한 역할을 짚고, 다음 채용에서 어떤 사람을 찾으면 좋을지 제안합니다." },
                { icon: MessagesSquare, title: "함께 일하는 법", desc: "성향이 다른 사람끼리 부딪히기 쉬운 지점과 회의·피드백 방식 조언을 리더용 가이드로 드립니다." },
            ]}
            steps={[
                { title: "신청·상담", desc: "팀 규모와 요즘의 고민을 남겨 주시면 담당자가 진행 방식과 일정을 정합니다." },
                { title: "팀원 검사 안내", desc: `팀원에게 검사 링크를 보냅니다. 팀원은 HeRo 회원으로 기본 성향 검사를 받습니다 (약 ${hitStageMinutes("a")}분).` },
                { title: "팀 리포트", desc: "응한 팀원의 결과를 모아 팀 단위 리포트를 만듭니다. 개인 결과는 본인이 공유에 동의한 경우만 포함합니다." },
                { title: "리뷰 미팅", desc: "리포트를 함께 보며 팀 운영과 다음 채용 방향을 이야기합니다." },
            ]}
            principles={[
                { title: "팀 요약이 기본", desc: "기업에 드리는 것은 팀 전체의 분포와 해석입니다. 개인별 결과는 그 팀원이 직접 공유에 동의한 경우만 담습니다." },
                { title: "참여는 자유", desc: "검사는 팀원이 원할 때만 받습니다. 받지 않거나 공유하지 않아도 불이익이 없도록 회사에 안내합니다." },
                { title: "평가에 쓰지 않기", desc: "성향 검사는 맞고 틀림이 없습니다. 인사 평가·승진 결정의 근거로 쓰지 않도록 함께 약속합니다." },
            ]}
            faq={[
                { q: "몇 명부터 할 수 있나요?", a: "결과가 특정인으로 드러나지 않도록 응한 팀원이 3명 이상일 때 팀 리포트를 만듭니다." },
                { q: "팀원이 이미 검사를 받았다면요?", a: "이미 받은 결과를 공유에 동의하면 다시 받지 않아도 됩니다." },
                { q: "여러 팀을 함께 볼 수 있나요?", a: "됩니다. 신청 때 팀 구성을 알려 주시면 팀별 리포트와 팀 사이 비교를 함께 드립니다." },
            ]}
        />
    );
}
