"use client";

interface HitModelGuideProps {
  mode?: "modal" | "print";
}

export default function HitModelGuide({ mode = "modal" }: HitModelGuideProps) {
  const wrap = mode === "print" ? "hit-print-section" : "max-w-3xl mx-auto";

  return (
    <div className={wrap}>
      {/* ── 제목 ── */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">HeRo 통합 검사 모델</h2>
        <p className="text-sm text-neutral-400 mt-2 tracking-wider">HIT : HeRo Integrated Test Model</p>
      </div>

      {/* ── 인트로 ── */}
      <div className="mb-12">
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-5">
          HIT(HeRo Integrated Test)는 사람을 깊이 있게 이해하기 위해 설계된 <strong className="text-neutral-900">통합 심리검사 모델</strong>입니다.
          기존에 널리 사용되어 온 MBTI(성격유형), DISC(행동유형) 등 검증된 검사 방법론을 기반으로 하되,
          각 검사를 독립적으로 해석하는 기존 방식의 한계를 넘어 <strong className="text-neutral-900">인공지능 기반의 교차분석</strong>을 적용합니다.
        </p>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-6">
          HIT는 개인의 타고난 기질과 성장 과정에서 형성된 기저요인(UF)을 먼저 측정한 뒤,
          성격유형(MBTI)과 행동유형(DISC)을 측정하고, 이 세 가지 결과를 AI 알고리즘으로 교차 분석하여
          개인 고유의 <strong className="text-neutral-900">핵심 강점(S-Power)</strong>을 도출합니다.
          단일 검사로는 보이지 않던 내면과 외면의 일치/불일치, 강점의 발현 맥락까지 포착하는 것이 HIT의 차별점입니다.
        </p>
        <div className="border border-neutral-200 rounded-xl p-5 bg-neutral-50">
          <p className="text-sm text-neutral-500 leading-relaxed">
            <strong className="text-neutral-600">안내</strong> — 본 검사 결과는 인공지능 알고리즘에 의해 산출된 참고 자료이며, 의학적/심리학적 진단이 아닙니다.
            검사 결과를 바탕으로 자신을 이해하는 출발점으로 활용하되,
            진로/적성/심리 관련 중요한 의사결정은 반드시 <strong className="text-neutral-600">전문 상담사 또는 전문가와의 대면 상담</strong>을 통해 보완하시기 바랍니다.
          </p>
        </div>
      </div>

      {/* ══ 모델 구조표 ══ */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden mb-10">
        {/* HIT A 헤더 */}
        <div className="grid grid-cols-[90px_1fr_120px] bg-neutral-100 text-sm font-semibold text-neutral-600 px-6 py-3 border-b border-neutral-200">
          <span>HIT A</span>
          <span className="text-center">검사의 개념 및 구조</span>
          <span className="text-right">검사 항목</span>
        </div>

        {/* 기질 */}
        <div className="grid grid-cols-[90px_1fr_120px] items-center px-6 py-5 border-b border-neutral-100">
          <span className="text-[15px] font-semibold text-neutral-800">기질</span>
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
            <span className="bg-neutral-100 px-3 py-1 rounded text-xs">타고나는 기질</span>
            <span className="text-neutral-300">→</span>
            <span className="bg-neutral-100 px-3 py-1 rounded text-xs">무의식의 영역</span>
            <span className="text-neutral-300">→</span>
            <span className="bg-neutral-100 px-3 py-1 rounded text-xs">성장환경·교육·경험</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-neutral-700">기저요인검사</p>
            <p className="text-xs text-neutral-400">UF test</p>
          </div>
        </div>

        {/* 성격유형 */}
        <div className="grid grid-cols-[90px_1fr_120px] items-start px-6 py-5 border-b border-neutral-100">
          <span className="text-[15px] font-semibold text-neutral-800 pt-1">성격유형</span>
          <div className="space-y-2.5">
            {[
              { l: "I", ln: "내향", fn: "주의초점", rn: "외향", r: "E" },
              { l: "N", ln: "직관", fn: "인식기능", rn: "감각", r: "S" },
              { l: "F", ln: "감정", fn: "판단기능", rn: "사고", r: "T" },
              { l: "P", ln: "인식", fn: "생활양식", rn: "판단", r: "J" },
            ].map((a) => (
              <div key={a.fn} className="flex items-center gap-3 text-sm">
                <span className="font-bold text-blue-700 w-4 text-center">{a.l}</span>
                <span className="text-neutral-400 text-xs w-8">{a.ln}</span>
                <div className="flex-1 text-center text-xs text-neutral-400 relative">
                  <div className="absolute top-1/2 left-[10%] right-[10%] h-px bg-neutral-200" />
                  <span className="relative bg-white px-3 text-neutral-500">{a.fn}</span>
                </div>
                <span className="text-neutral-400 text-xs w-8 text-right">{a.rn}</span>
                <span className="font-bold text-blue-700 w-4 text-center">{a.r}</span>
              </div>
            ))}
          </div>
          <span className="text-sm font-semibold text-neutral-700 text-right pt-1">MBTI 검사</span>
        </div>

        {/* 행동유형 */}
        <div className="grid grid-cols-[90px_1fr_120px] items-center px-6 py-5 border-b border-neutral-100">
          <span className="text-[15px] font-semibold text-neutral-800">행동유형</span>
          <div className="flex justify-center gap-3">
            {[
              { c: "D", bg: "#2C2C2A" }, { c: "I", bg: "#E24B4A" },
              { c: "S", bg: "#378ADD" }, { c: "C", bg: "#888780" },
            ].map((d) => (
              <span key={d.c} className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: d.bg }}>{d.c}</span>
            ))}
          </div>
          <span className="text-sm font-semibold text-neutral-700 text-right">DISC 검사</span>
        </div>

        {/* 강점 */}
        <div className="grid grid-cols-[90px_1fr_120px] items-center px-6 py-4 bg-neutral-50">
          <span className="text-[15px] font-semibold text-neutral-800">강점</span>
          <p className="text-center text-sm text-neutral-400">MBTI + DISC 교차분석 → S-Power 도출</p>
          <span className="text-sm text-neutral-400 text-right">종합 산출</span>
        </div>

        {/* 구분선 */}
        <div className="border-t-2 border-neutral-300" />

        {/* HIT B 헤더 */}
        <div className="grid grid-cols-[90px_1fr_120px] bg-neutral-100 text-sm font-semibold text-neutral-600 px-6 py-3 border-b border-neutral-200">
          <span>HIT B</span>
          <span className="text-center">검사의 개념 및 구조</span>
          <span className="text-right">검사 항목</span>
        </div>

        {[
          { name: "인성", scope: "공통", test: "인성 검사" },
          { name: "적성", scope: "공통", test: "기초직무적성검사" },
          { name: "역량", scope: "직무별 (적성결과 or 희망)", test: "기초직무역량검사" },
          { name: "취업", scope: "직무별 (적성결과 or 희망)", test: "취업준비도검사" },
        ].map((r, i) => (
          <div key={r.name} className={`grid grid-cols-[90px_1fr_120px] items-center px-6 py-4 ${i < 3 ? "border-b border-neutral-100" : ""}`}>
            <span className="text-[15px] font-semibold text-neutral-800">{r.name}</span>
            <span className="text-sm text-neutral-500 text-center">{r.scope}</span>
            <span className="text-sm font-semibold text-neutral-700 text-right">{r.test}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-neutral-400 mb-12">아래에서 각 검사의 이론적 근거와 상호작용 메커니즘을 확인할 수 있습니다.</p>

      {/* ══ 상세 섹션들 ══ */}

      {/* UF 기저요인 */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700">HIT A</span>
          <span className="text-lg font-bold text-neutral-900">기저요인검사 (UF test)</span>
          <span className="text-sm text-neutral-400 ml-auto">50문항 · 7점 리커트</span>
        </div>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-6">
          모든 성격과 행동의 뿌리에는 기저요인이 있습니다. 타고난 기질(temperament)은
          무의식의 영역을 거쳐 성장환경, 교육, 경험과 상호작용하며 현재의 나를 형성합니다.
          HIT는 이 보이지 않는 토대를 먼저 측정합니다.
        </p>
        <div className="bg-neutral-50 rounded-xl p-5 mb-6 text-sm text-neutral-500 leading-relaxed">
          <span className="font-semibold text-neutral-600">이론적 근거</span> — Thomas &amp; Chess의 기질 이론,
          Bronfenbrenner의 생태체계 이론, Bowlby의 애착 이론, Erikson의 심리사회적 발달 단계,
          Tedeschi의 외상 후 성장(PTG) 모델을 통합 적용합니다.
        </div>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-6">
          기저요인은 성격/행동 검사 결과를 해석하는 렌즈 역할을 합니다.
          같은 DISC D형이라도 안정적 가정환경에서 자란 D형과 트라우마를 겪은 D형의 리더십 패턴은 질적으로 다릅니다.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: "형제관계", d: "협력·경쟁 패턴" }, { n: "부모관계", d: "정서적 안전기지" }, { n: "가정환경", d: "자원·자율성·지지" },
            { n: "또래관계", d: "사회적 위치·소속감" }, { n: "자기개념", d: "자아인식·회복탄력성" }, { n: "기질", d: "선천적 반응 양식" },
            { n: "경제환경", d: "기회·제약 경험" }, { n: "트라우마", d: "전환점·성장 계기" }, { n: "문화·세대", d: "가치관·교육 영향" },
          ].map((u) => (
            <div key={u.n} className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-neutral-700 mb-1">{u.n}</p>
              <p className="text-xs text-neutral-400">{u.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* UF → MBTI 연결 */}
      <div className="border-l-2 border-purple-300 bg-neutral-50 rounded-r-xl pl-5 pr-6 py-5 mb-14">
        <p className="text-[15px] text-neutral-600 leading-[1.9]">
          <span className="font-semibold text-neutral-800">기저요인 → 성격유형</span> :
          기저요인은 MBTI의 선호 강도에 직접 영향을 미칩니다.
          부모의 감정 수용도가 높았던 환경(UF 부모관계 HIGH)은 F(감정) 축의 발달을 촉진하고,
          또래 리더 경험(UF 또래관계 HIGH)은 E(외향) 성향을 강화합니다.
          기질적으로 반응 역치가 높은 사람(UF 기질)은 T(사고) 기반 판단을 발달시키는 경향이 있습니다.
        </p>
      </div>

      {/* MBTI */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700">HIT A</span>
          <span className="text-lg font-bold text-neutral-900">MBTI 성격유형검사</span>
          <span className="text-sm text-neutral-400 ml-auto">160문항</span>
        </div>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-4">
          Jung의 심리유형론에 기반한 4개 축을 측정합니다.
          어느 쪽이 더 좋다가 아니라 에너지가 어디로 향하는가를 파악합니다.
          HIT는 단순 유형 분류를 넘어 각 축의 선호 강도(%)까지 산출하여 연속 스펙트럼으로 해석합니다.
        </p>
        <div className="bg-neutral-50 rounded-xl p-5 mb-6 text-sm text-neutral-500 leading-relaxed">
          <span className="font-semibold text-neutral-600">이론적 근거</span> — Carl Jung의 심리유형론(1921),
          Myers-Briggs 유형 지표를 기반으로 하되, 이분법적 분류의 한계를 보완하기 위해 연속 스펙트럼 방식을 적용합니다.
        </div>
        <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 overflow-hidden">
          {[
            { l: "I 내향", fn: "주의초점", sub: "에너지의 방향", r: "E 외향" },
            { l: "N 직관", fn: "인식기능", sub: "정보 수집 방식", r: "S 감각" },
            { l: "F 감정", fn: "판단기능", sub: "의사결정 기준", r: "T 사고" },
            { l: "P 인식", fn: "생활양식", sub: "외부 세계 대응", r: "J 판단" },
          ].map((a) => (
            <div key={a.fn} className="grid grid-cols-[80px_1fr_80px] items-center px-6 py-5">
              <span className="text-sm font-bold text-blue-700">{a.l}</span>
              <div className="text-center">
                <p className="text-sm text-neutral-600">{a.fn} — {a.sub}</p>
              </div>
              <span className="text-sm font-bold text-blue-700 text-right">{a.r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MBTI → DISC 연결 */}
      <div className="border-l-2 border-blue-300 bg-neutral-50 rounded-r-xl pl-5 pr-6 py-5 mb-14">
        <p className="text-[15px] text-neutral-600 leading-[1.9]">
          <span className="font-semibold text-neutral-800">MBTI → DISC 연결</span> :
          성격유형(사고 패턴)은 행동유형(표현 패턴)의 기반이 됩니다.
          MBTI가 어떻게 생각하고 판단하는가를 측정한다면,
          DISC는 그 사고가 행동으로 어떻게 나타나는가를 측정합니다.
          내면의 T(사고) 성향이 반드시 D(주도) 행동으로 나타나지는 않습니다
          — 두 검사를 교차분석해야 내면과 외면의 일치/불일치를 파악할 수 있습니다.
        </p>
      </div>

      {/* DISC */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700">HIT A</span>
          <span className="text-lg font-bold text-neutral-900">DISC 행동유형검사</span>
          <span className="text-sm text-neutral-400 ml-auto">40문항</span>
        </div>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-4">
          Marston의 행동 모델에 기반하여 관찰 가능한 행동 경향성을 4차원으로 측정합니다.
          모든 사람은 4가지 행동 에너지를 모두 갖고 있으며, 그 배합 비율이 다를 뿐입니다.
        </p>
        <div className="bg-neutral-50 rounded-xl p-5 mb-6 text-sm text-neutral-500 leading-relaxed">
          <span className="font-semibold text-neutral-600">이론적 근거</span> — William M. Marston의 DISC 이론(1928).
          환경 인식(Favorable/Antagonistic) x 자기 인식(Active/Passive)의 2x2 매트릭스에서 4가지 행동 유형이 도출됩니다.
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { c: "D", bg: "#2C2C2A", label: "주도형", en: "Dominance", desc: "결과 지향, 도전, 결단력", lbg: "#F1EFE8" },
            { c: "I", bg: "#E24B4A", label: "사교형", en: "Influence", desc: "영향력, 설득, 열정", lbg: "#FCEBEB" },
            { c: "S", bg: "#378ADD", label: "안정형", en: "Steadiness", desc: "조화, 인내, 신뢰", lbg: "#E6F1FB" },
            { c: "C", bg: "#888780", label: "신중형", en: "Conscientiousness", desc: "정확성, 분석, 체계", lbg: "#F1EFE8" },
          ].map((d) => (
            <div key={d.c} className="flex items-center gap-4 p-5 rounded-xl" style={{ background: d.lbg }}>
              <span className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0" style={{ background: d.bg }}>{d.c}</span>
              <div>
                <p className="text-sm font-bold text-neutral-800">{d.label} <span className="font-normal text-neutral-400">{d.en}</span></p>
                <p className="text-xs text-neutral-500 mt-1">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[15px] text-neutral-600 leading-[1.9]">
          HIT에서는 4유형 중 하나로 분류하는 것이 아니라, 4가지 행동 에너지의 배합 비율을 산출합니다.
        </p>
      </div>

      {/* 교차분석 → S-Power 연결 */}
      <div className="border-l-2 border-amber-300 bg-neutral-50 rounded-r-xl pl-5 pr-6 py-5 mb-14">
        <p className="text-[15px] text-neutral-600 leading-[1.9]">
          <span className="font-semibold text-neutral-800">MBTI x DISC x UF 교차분석 → S-Power</span> :
          성격(내면)과 행동(외면)의 교차점에서 개인 고유의 핵심 강점이 드러납니다.
          DISC D(주도)+MBTI T(사고)의 교차는 냉철한 결단력이라는 구체적 강점으로,
          D+P(인식)의 교차는 기회 포착형 리더십으로 발현됩니다.
          여기에 기저요인(UF)이 강점의 발현 맥락과 잠재력을 해석하는 가중치로 작용합니다.
        </p>
      </div>

      {/* S-Power */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700">HIT A</span>
          <span className="text-lg font-bold text-neutral-900">S-Power 핵심 강점</span>
          <span className="text-sm text-neutral-400 ml-auto">종합 산출</span>
        </div>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-6">
          MBTI와 DISC의 교차분석에 기저요인(UF)을 가중하여 8가지 핵심 역량 차원을 산출합니다.
          상위 3개 강점이 핵심 경쟁력으로, 하위 2개가 성장 영역으로 리포트에 반영됩니다.
        </p>
        <div className="grid grid-cols-4 gap-4">
          {[
            { n: "전략적 사고", e: "Strategic" }, { n: "실행 추진력", e: "Execution" },
            { n: "창의성", e: "Creativity" }, { n: "대인 연결력", e: "Interpersonal" },
            { n: "분석적 판단", e: "Analytical" }, { n: "조직 화합력", e: "Harmony" },
            { n: "돌파 의지력", e: "Breakthrough" }, { n: "원칙 수호력", e: "Guard" },
          ].map((s) => (
            <div key={s.e} className="bg-neutral-50 rounded-lg p-4 text-center">
              <p className="text-xs text-neutral-400 mb-1">{s.n}</p>
              <p className="text-sm font-semibold text-neutral-700">{s.e}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-neutral-200 my-12" />

      {/* HIT B */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700">HIT B</span>
          <span className="text-lg font-bold text-neutral-900">심화 직무 분석</span>
          <span className="text-sm text-neutral-400 ml-auto">HIT A 완료 후 진행</span>
        </div>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-6">
          HIT A의 결과를 기반으로 인성, 적성, 역량, 취업준비도를 직무별로 심화 분석합니다.
          적성검사 결과 또는 본인 희망 직무에 따라 맞춤형 검사가 제공됩니다.
        </p>
        <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 overflow-hidden">
          {[
            { name: "인성", scope: "전체 공통 (84문항)", test: "인성 검사" },
            { name: "적성", scope: "전체 공통 · RIASEC (60문항)", test: "기초직무적성검사" },
            { name: "역량", scope: "직무별 분기 (48문항)", test: "기초직무역량검사" },
            { name: "취업", scope: "직무별 분기 (32문항)", test: "취업준비도검사" },
          ].map((r) => (
            <div key={r.name} className="flex items-center px-6 py-5">
              <span className="text-[15px] font-semibold text-neutral-800 w-16">{r.name}</span>
              <span className="text-sm text-neutral-500 flex-1">{r.scope}</span>
              <span className="text-sm font-semibold text-neutral-700">{r.test}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 요약 */}
      <div className="bg-neutral-50 rounded-xl p-8 mb-8">
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-4">
          <span className="font-bold text-neutral-900">HIT A</span>는 타고난 기질과 성장 과정의 영향(기저요인)을 바탕으로,
          성격유형(MBTI)과 행동유형(DISC)을 측정하고 교차분석하여 개인의 핵심 강점(S-Power)을 도출합니다.
        </p>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-4">
          <span className="font-bold text-neutral-900">HIT B</span>는 HIT A의 결과를 기반으로
          인성, 적성, 역량, 취업준비도를 직무별로 심화 분석합니다.
        </p>
        <p className="text-sm text-neutral-400 leading-relaxed">
          HeRo만의 통합적이고 일관적인 검사 방법을 통해 미래의 가치를 만들어낼 잠재인재를 발굴합니다.
        </p>
      </div>

      {/* 푸터 */}
      <p className="text-center text-xs text-neutral-300 pt-4 border-t border-neutral-100">
        HeRo Integrated Test — Ten:One Universe
      </p>
    </div>
  );
}
