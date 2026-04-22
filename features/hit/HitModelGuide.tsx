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
          HIT A는 개인의 타고난 기질과 성장 과정에서 형성된 기저요인(UF)을 먼저 측정한 뒤,
          성격유형(MBTI) · 행동유형(DISC) · 인성 · 적성까지 통합 측정하고,
          이 결과를 AI 알고리즘으로 교차 분석하여 개인 고유의 <strong className="text-neutral-900">핵심 강점(S-Power)</strong>과 64유형을 도출합니다.
          <strong className="text-neutral-900">HIT B ~ F</strong>는 HIT A의 결과를 기반으로
          신입 · 이직 · 리더십 전환 · 인생 2막 · 경력 복귀 등 <strong className="text-neutral-900">생애주기별 국면</strong>에 맞춘 심화 진단을 제공합니다.
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

        {/* 인성 */}
        <div className="grid grid-cols-[90px_1fr_120px] items-center px-6 py-5 border-b border-neutral-100">
          <span className="text-[15px] font-semibold text-neutral-800">인성</span>
          <p className="text-center text-sm text-neutral-500">진정성 · 관계성 · 정서 · 윤리 · 성장</p>
          <span className="text-sm font-semibold text-neutral-700 text-right">인성 검사</span>
        </div>

        {/* 적성 */}
        <div className="grid grid-cols-[90px_1fr_120px] items-center px-6 py-5 border-b border-neutral-100">
          <span className="text-[15px] font-semibold text-neutral-800">적성</span>
          <p className="text-center text-sm text-neutral-500">Holland RIASEC 6 차원</p>
          <span className="text-sm font-semibold text-neutral-700 text-right">기초 적성검사</span>
        </div>

        {/* 강점 */}
        <div className="grid grid-cols-[90px_1fr_120px] items-center px-6 py-4 bg-neutral-50">
          <span className="text-[15px] font-semibold text-neutral-800">강점</span>
          <p className="text-center text-sm text-neutral-400">UF × MBTI × DISC × 인성 × 적성 교차분석 → S-Power 도출</p>
          <span className="text-sm text-neutral-400 text-right">종합 산출</span>
        </div>

        {/* 구분선 */}
        <div className="border-t-2 border-neutral-300" />

        {/* HIT B ~ F 헤더 */}
        <div className="grid grid-cols-[90px_1fr_120px] bg-neutral-100 text-sm font-semibold text-neutral-600 px-6 py-3 border-b border-neutral-200">
          <span>HIT B ~ F</span>
          <span className="text-center">생애주기별 심화 진단</span>
          <span className="text-right">검사 항목</span>
        </div>

        {[
          { k: "B", scope: "신입 · 사회 초년", test: "취업준비도 · 역량" },
          { k: "C", scope: "경력 이직 고민", test: "이직 전환 진단" },
          { k: "D", scope: "시니어 리더십 전환", test: "리더십 전환 진단" },
          { k: "E", scope: "인생 2막 준비", test: "인생 2막 설계" },
          { k: "F", scope: "경력 공백 · 복귀", test: "재진입 로드맵" },
        ].map((r, i, arr) => (
          <div key={r.k} className={`grid grid-cols-[90px_1fr_120px] items-center px-6 py-4 ${i < arr.length - 1 ? "border-b border-neutral-100" : ""}`}>
            <span className="text-[15px] font-semibold text-neutral-800">HIT {r.k}</span>
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

      {/* 인성 */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700">HIT A</span>
          <span className="text-lg font-bold text-neutral-900">인성검사</span>
          <span className="text-sm text-neutral-400 ml-auto">5 차원</span>
        </div>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-6">
          성격·행동으로 드러나는 외면 너머, 사람이 일과 관계에서 보여주는 <strong className="text-neutral-800">내면의 결</strong>을 측정합니다.
          동일한 DISC D형이라도 인성의 결이 다르면 조직에서 발휘하는 영향은 전혀 다릅니다.
        </p>
        <div className="grid grid-cols-5 gap-3">
          {[
            { n: "진정성", e: "Integrity", d: "말과 행동의 일치" },
            { n: "관계성", e: "Relational", d: "타인과의 연결 감수성" },
            { n: "정서", e: "Emotional", d: "감정 조절·회복력" },
            { n: "윤리", e: "Ethics", d: "원칙·책임" },
            { n: "성장", e: "Growth", d: "학습·변화 의지" },
          ].map((c) => (
            <div key={c.e} className="bg-neutral-50 rounded-lg p-3 text-center">
              <p className="text-sm font-semibold text-neutral-700 mb-0.5">{c.n}</p>
              <p className="text-[11px] text-neutral-400 mb-1">{c.e}</p>
              <p className="text-[11px] text-neutral-500 leading-snug">{c.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 적성 */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700">HIT A</span>
          <span className="text-lg font-bold text-neutral-900">기초 적성검사</span>
          <span className="text-sm text-neutral-400 ml-auto">RIASEC 6 차원</span>
        </div>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-4">
          Holland의 직업 흥미 이론(RIASEC)에 기반해 어떤 환경에서 에너지가 솟고, 어떤 활동에 몰입하는지를 측정합니다.
          상위 3 코드(Holland Code)가 직무·환경 매칭의 기준점이 됩니다.
        </p>
        <div className="bg-neutral-50 rounded-xl p-5 mb-6 text-sm text-neutral-500 leading-relaxed">
          <span className="font-semibold text-neutral-600">이론적 근거</span> — John L. Holland의 직업 흥미 이론(1959).
          사람과 환경의 적합도(Person-Environment Fit)가 커리어 만족을 예측한다는 모델입니다.
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { k: "R", n: "현실형 Realistic", d: "도구·제작·실체" },
            { k: "I", n: "탐구형 Investigative", d: "분석·연구·원리" },
            { k: "A", n: "예술형 Artistic", d: "표현·창작·감성" },
            { k: "S", n: "사회형 Social", d: "돕고·가르치고·연결" },
            { k: "E", n: "진취형 Enterprising", d: "설득·리더·사업" },
            { k: "C", n: "관습형 Conventional", d: "체계·정확·관리" },
          ].map((h) => (
            <div key={h.k} className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs font-bold text-neutral-700">{h.k} · {h.n}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">{h.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 교차분석 → S-Power 연결 */}
      <div className="border-l-2 border-amber-300 bg-neutral-50 rounded-r-xl pl-5 pr-6 py-5 mb-14">
        <p className="text-[15px] text-neutral-600 leading-[1.9]">
          <span className="font-semibold text-neutral-800">UF × MBTI × DISC × 인성 × 적성 교차분석 → S-Power</span> :
          다섯 축의 교차점에서 개인 고유의 핵심 강점이 드러납니다.
          DISC D(주도) + MBTI T(사고)의 교차는 <strong>냉철한 결단력</strong>으로,
          I(사교) + A(예술)의 교차는 <strong>창의적 설득력</strong>으로 발현됩니다.
          여기에 기저요인(UF)과 인성의 결이 가중치로 작용해 "같은 강점도 다르게 쓰이는" 맥락을 만듭니다.
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
          UF · MBTI · DISC · 인성 · 적성 다섯 축을 교차 가중해 8가지 핵심 역량 차원을 산출합니다.
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

      {/* HIT B ~ F — 생애주기별 심화 */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">심화 검사</p>
          <h3 className="text-lg font-bold text-neutral-900 mb-2">HIT B ~ F · 생애주기별 특화 진단</h3>
          <p className="text-sm text-neutral-500 leading-relaxed">
            HIT A 완료 이후, 지금 내 국면의 구체적 질문에 맞춰 다음 한 걸음을 설계하는 심화 진단입니다.
            현재 상황에 맞는 1~2개만 선택해도 충분합니다.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              key: "B",
              title: "신입 · 사회 초년",
              tone: "text-green-700 bg-green-50",
              desc: "첫 회사 · 첫 직무를 준비하거나 시작한 시기. HIT A의 적성과 희망 직무를 기반으로 직무별 역량(48문항)과 취업준비도(32문항)를 진단해 어디서부터 채워야 할지 방향을 잡아줍니다.",
              dims: ["직무 역량", "취업준비도", "자기 PR", "포트폴리오"],
            },
            {
              key: "C",
              title: "경력 이직 고민",
              tone: "text-blue-700 bg-blue-50",
              desc: "1~3년 경력을 쌓고 다음 회사를 고민하는 시기. 경력 자본 · 이직 동기 · 전환 가능성 · 준비도를 측정해 어디로 · 언제 움직일지 방향을 잡아줍니다.",
              dims: ["경력 자본", "이직 동기", "전환 가능성", "준비도"],
            },
            {
              key: "D",
              title: "시니어 리더십 전환",
              tone: "text-red-700 bg-red-50",
              desc: "실무자에서 리더 · 임원으로 넘어가는 지점. 전문성 · 리더십 · 정체성 · 네트워크 · 준비도를 측정해 리더십 전환 지도를 제시합니다.",
              dims: ["전문성", "리더십", "정체성", "네트워크", "준비도"],
            },
            {
              key: "E",
              title: "인생 2막 준비",
              tone: "text-amber-700 bg-amber-50",
              desc: "주된 경력을 마치고 다음 장을 설계하는 시기. 삶의 만족도 · 방향 탐색 · 레거시 · 사회적 연결 · 준비도로 인생 2막의 설계도를 그립니다.",
              dims: ["삶의 만족도", "방향 탐색", "레거시", "사회적 연결", "준비도"],
            },
            {
              key: "F",
              title: "경력 공백 · 복귀 준비",
              tone: "text-violet-700 bg-violet-50",
              desc: "육아 · 학업 · 건강 등으로 비운 시간 이후 돌아오는 시기. 공백 맥락 · 잠재 역량 · 회복탄력성 · 재진입 준비도를 측정해 재진입 로드맵을 만듭니다.",
              dims: ["공백 맥락", "잠재 역량", "회복탄력성", "재진입 준비도"],
            },
          ].map((t) => (
            <div key={t.key} className="border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${t.tone}`}>HIT {t.key}</span>
                <span className="text-base font-bold text-neutral-900">{t.title}</span>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed mb-3">{t.desc}</p>
              <div className="flex flex-wrap gap-2">
                {t.dims.map((d) => (
                  <span key={d} className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">{d}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          HIT B ~ F는 HIT A가 완료된 상태에서만 의미 있게 해석됩니다.
        </p>
      </div>

      {/* 요약 */}
      <div className="bg-neutral-50 rounded-xl p-8 mb-8">
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-4">
          <span className="font-bold text-neutral-900">HIT A</span>는 기저요인(UF) · 성격(MBTI) · 행동(DISC) · 인성 · 적성 다섯 축을 통합 측정하고,
          이 결과를 교차분석하여 개인의 핵심 강점(S-Power)과 64유형 프로필을 도출합니다.
        </p>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-4">
          <span className="font-bold text-neutral-900">HIT B</span>는 HIT A의 결과를 기반으로
          직무별 역량과 취업준비도를 심화 분석합니다.
        </p>
        <p className="text-[15px] text-neutral-600 leading-[1.9] mb-4">
          <span className="font-bold text-neutral-900">HIT C ~ F</span>는 생애주기별 심화 진단으로,
          이직 · 리더십 전환 · 인생 2막 · 경력 공백 복귀 같은 구체적 국면에서 다음 한 걸음을 설계합니다.
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
