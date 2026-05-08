"use client";

// ===== GPR Section =====
function GPRSection() {
  return (
    <section id="gpr" className="px-6 md:px-16 lg:px-24 py-20 md:py-28 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-tight">
          GPR — 성장의 나침반
        </h2>
        <p className="mt-4 text-[#666] text-lg">
          Goal &middot; Plan &middot; Result. 목표를 세우고, 실행하고, 돌아본다.
        </p>

        <div className="mt-12 space-y-3 text-[#1a1a1a] text-base md:text-lg leading-relaxed max-w-2xl">
          <p>GPR은 평가 도구가 아니다.</p>
          <p>성장의 나침반이다.</p>
          <p className="mt-4 text-[#444]">&ldquo;지금 내가 어디에 있고, 어디로 가고 있는가&rdquo;를</p>
          <p className="text-[#444]">스스로 알게 해주는 프로토콜.</p>
          <p className="mt-4 text-[#444]">위에서 내려오는 관리가 아니라</p>
          <p className="text-[#444]">자기 스스로 방향을 잡는 습관이다.</p>
        </div>

        {/* 3단계 */}
        <div className="mt-16 space-y-12">
          <div className="border-t border-[#d0d0d0] pt-8">
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">Goal — 어디로 갈 것인가</h3>
            <div className="mt-4 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-xl">
              <p>명확하고 측정 가능한 목표.</p>
              <p>숫자와 기한이 있어야 한다.</p>
              <p>&ldquo;열심히 하겠습니다&rdquo;는 Goal이 아니다.</p>
              <p>&ldquo;3월 말까지 참석률 80%를 달성한다&rdquo;가 Goal이다.</p>
            </div>
          </div>

          <div className="border-t border-[#d0d0d0] pt-8">
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">Plan — 어떻게 갈 것인가</h3>
            <div className="mt-4 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-xl">
              <p>목표를 달성하기 위한 구체적 액션.</p>
              <p>누가, 무엇을, 언제까지.</p>
              <p>필요한 리소스와 예상 장애물.</p>
            </div>
          </div>

          <div className="border-t border-[#d0d0d0] pt-8">
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">Result — 무엇을 배웠는가</h3>
            <div className="mt-4 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-xl">
              <p>실행 결과를 기록하고 다음 사이클에 반영한다.</p>
              <p>Result는 점수가 아니다.</p>
              <p>&ldquo;이번에 뭘 배웠는가, 다음에 뭘 다르게 할 것인가&rdquo;가 핵심이다.</p>
              <p>성공도 실패도 기록하면 자산이 된다.</p>
            </div>
          </div>
        </div>

        {/* GPR의 정신 */}
        <div className="mt-16 border border-[#d0d0d0] p-8 md:p-10 bg-white">
          <div className="space-y-3 text-[#1a1a1a] text-base md:text-lg leading-relaxed">
            <p className="font-medium">나의 성장이 우리의 성장이다.</p>
            <p className="mt-4 text-[#444]">보고가 아니라 공유다.</p>
            <p className="text-[#444]">평가가 아니라 개선이다.</p>
            <p className="text-[#444]">기록하지 않으면 흘러간다.</p>
            <p className="text-[#444]">기록하면 자산이 된다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== GPR Page =====
export function GprPage() {
  return (
    <div className="bg-white text-[#1a1a1a] min-h-screen">
      <GPRSection />
    </div>
  );
}
