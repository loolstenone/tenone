import StageIntro from "@/features/hit/StageIntro";

// 문항 수 = 실제 출제 (layer_e sub_domain 기준, 2026-10-12 점검)
export default function HitEIntroPage() {
  return (
    <StageIntro
      stage="e"
      modules={[
        { title: "전문성 자산", desc: "도메인 깊이 · 암묵지 · 다른 조직에서의 재배치 가능성 · 퍼스널 브랜드.", count: 40 },
        { title: "리더십 유형", desc: "실행형 · 전략형 · 코치형 · 독립형 전문가 중 어떤 방식으로 이끄는가.", count: 32 },
        { title: "정체성 유연성", desc: "직함과 역할에 묶인 정도, 새 역할을 받아들이는 힘.", count: 28 },
        { title: "네트워크", desc: "깊은 신뢰 관계(강한 연결)와 넓은 접점(약한 연결).", count: 20 },
      ]}
      note="결과: 전문성·리더십·정체성·네트워크 점수, 리더십 유형, 차기 역할 적합도(임원·어드바이저·컨설팅·스타트업 등), 해설."
    />
  );
}
