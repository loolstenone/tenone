import StageIntro from "@/features/hit/StageIntro";

// 문항 수 = 실제 출제 (layer_f sub_domain 기준, 2026-10-12 점검)
export default function HitFIntroPage() {
  return (
    <StageIntro
      stage="f"
      modules={[
        { title: "삶의 만족도 · 열정", desc: "지금 삶의 만족, 남아 있는 열정, 은퇴·퇴직을 받아들이는 심리적 전환.", count: 32 },
        { title: "2막 방향", desc: "재취업 · 창업·독립 · 사회 공헌 · 멘토링·교육 · 여가·자기실현 중 끌리는 방향.", count: 28 },
        { title: "레거시", desc: "다른 곳에서도 쓸 수 있는 경험, 지식을 전하는 힘, 새 역량을 배우려는 의지.", count: 32 },
        { title: "사회적 연결", desc: "어딘가에 속하고 싶은 마음, 역할이 필요한 정도.", count: 20 },
      ]}
      note="결과: 만족·열정·방향·레거시·연결 점수, 2막 방향 유형, 해설."
    />
  );
}
