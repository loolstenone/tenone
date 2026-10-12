import StageIntro from "@/features/hit/StageIntro";

// 문항 수 = 실제 출제 (layer_d sub_domain 기준, 2026-10-12 점검)
export default function HitDIntroPage() {
  return (
    <StageIntro
      stage="d"
      modules={[
        { title: "경력 자본", desc: "도메인 전문성 · 성과 · 관계 자본 · 이전 가능한 역량 — 지금까지 쌓은 것.", count: 40 },
        { title: "이직 동기", desc: "지금 환경을 떠나게 하는 이탈 요인(Push)과 새 기회가 끄는 유인 요인(Pull)의 균형.", count: 24 },
        { title: "전환 가능성", desc: "역량 이전 · 목표 시장 적합 · 새 환경 적응력 — 어디로 옮길 수 있는가.", count: 36 },
      ]}
      note="결과: 경력 자본·동기·전환 가능성 점수, 전환 유형(전략적 이직자·성장 추구형·탐색형·환경 탈출형), 보완할 영역, 해설."
    />
  );
}
