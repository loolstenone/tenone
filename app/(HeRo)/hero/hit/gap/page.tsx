import StageIntro from "@/features/hit/StageIntro";

// 문항 수 = 실제 출제 (layer_gap sub_domain 기준, 2026-10-12 점검)
export default function HitGapIntroPage() {
  return (
    <StageIntro
      stage="gap"
      modules={[
        { title: "공백 맥락", desc: "단절의 사정, 공백 기간에 한 활동, 그 사이 길러진 숨은 역량.", count: 32 },
        { title: "경력 유효성", desc: "예전 직무가 지금도 통하는지, 스킬이 현재형인지, 시장에 다시 들어갈 수 있는지.", count: 36 },
        { title: "회복탄력성", desc: "공백을 어떻게 이야기하는지(자기 서사), 자존감, 다시 도전하려는 의지.", count: 28 },
        { title: "복귀 방향", desc: "원래 경력으로 복원 · 다른 경력으로 전환 · 완전한 새 출발 중 끌리는 쪽.", count: 32 },
      ]}
      note="검사를 시작하면 공백 기간(개월)과 직군을 먼저 입력합니다 — 직군마다 기술 변화 속도가 달라 경력 유효성(CVI)에 반영됩니다. 결과: CVI 등급, 회복탄력성, 복귀 방향, 추천 경로, 해설."
    />
  );
}
