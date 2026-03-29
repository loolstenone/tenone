"use client";

import Link from "next/link";
import {
  ArrowRight,
  Rocket,
  GraduationCap,
  ChevronRight,
  Sparkles,
  HandCoins,
  Brain,
  Award,
  School,
  Landmark,
} from "lucide-react";

/* ── 프로그램 3종 ── */
const programs = [
  {
    icon: GraduationCap,
    title: "고등학생 창업 캠프",
    sub: "방학 집중 2주 프로그램",
    desc: "AI 도구를 활용한 아이디어 발굴부터 비즈니스 모델 설계까지. 실전 창업 사고력을 기릅니다.",
    badge: "고등학생",
    badgeColor: "bg-[#0D9488]/10 text-[#0D9488]",
    features: ["아이디어 워크숍", "AI 프로토타입", "피칭 대회", "멘토링"],
  },
  {
    icon: Rocket,
    title: "대학생 스타트업 부트캠프",
    sub: "실전 창업 12주",
    desc: "팀 빌딩, MVP 개발, 투자 유치 피칭까지. 실제 스타트업을 만드는 과정을 경험합니다.",
    badge: "대학생",
    badgeColor: "bg-blue-50 text-blue-700",
    features: ["팀 빌딩", "MVP 개발", "투자 피칭", "데모데이"],
  },
  {
    icon: Brain,
    title: "AI 비즈니스 워크숍",
    sub: "실무 중심 4주",
    desc: "ChatGPT, AI 에이전트, 자동화 도구로 실제 수익 모델을 만드는 실전 워크숍.",
    badge: "전체",
    badgeColor: "bg-purple-50 text-purple-700",
    features: ["AI 도구 실습", "수익 모델 설계", "자동화 구축", "수료증 발급"],
  },
];

/* ── 졸업생 성과 ── */
const graduates = [
  {
    team: "에코박스",
    founder: "김서연 (고2 때 시작)",
    desc: "AI로 재활용 분류를 자동화하는 앱. 가족 투자 100만원으로 시작해 시드 투자 유치.",
    raised: "5,000만원",
    status: "시드 라운드 완료",
    program: "고등학생 캠프 1기",
  },
  {
    team: "스터디메이트",
    founder: "박준영 (대학교 2학년)",
    desc: "AI 튜터링 매칭 플랫폼. 지역 커뮤니티 펀드 1호 투자받고 MAU 2,000 달성.",
    raised: "1.2억원",
    status: "프리-A 라운드",
    program: "부트캠프 3기",
  },
  {
    team: "로컬잇",
    founder: "이하나 (대학교 3학년)",
    desc: "동네 소상공인 AI 마케팅 도구. 학교 창업 지원금으로 MVP 개발 후 B2B 전환.",
    raised: "8,000만원",
    status: "매출 발생 중",
    program: "부트캠프 2기",
  },
  {
    team: "펫닥터",
    founder: "정민호 (대학교 4학년)",
    desc: "반려동물 AI 건강 진단 서비스. ChangeUp 데모데이에서 VC 투자 제안 받음.",
    raised: "3,000만원",
    status: "시드 라운드",
    program: "AI 워크숍 2기",
  },
];

/* ── 파트너 ── */
const schoolPartners = [
  "서울대학교", "연세대학교", "고려대학교", "KAIST", "포항공대",
  "한양대학교", "성균관대학교", "경희대학교",
];

const investorPartners = [
  "소풍벤처스", "프라이머", "스파크랩", "매쉬업엔젤스",
  "본엔젤스", "블루포인트파트너스",
];

/* ── 통계 ── */
const stats = [
  { value: "120+", label: "수료생", icon: GraduationCap },
  { value: "24", label: "탄생 창업팀", icon: Rocket },
  { value: "23억+", label: "누적 투자 유치", icon: HandCoins },
  { value: "95%", label: "프로그램 만족도", icon: Award },
];

/* ── 공지사항 ── */
const notices = [
  { id: 1, title: "2026 여름 고등학생 창업 캠프 모집 (7.14~7.25)", date: "2026.03.20", pinned: true },
  { id: 2, title: "AI 비즈니스 워크숍 4기 참가자 모집 중", date: "2026.03.18", pinned: true },
  { id: 3, title: "대학생 스타트업 부트캠프 5기 데모데이 결과 발표", date: "2026.03.15", pinned: false },
  { id: 4, title: "지역사회 커뮤니티 펀드 2차 모집 안내", date: "2026.03.10", pinned: false },
];

/* ── Universe 연결 ── */
const universeLinks = [
  { brand: "HeRo", desc: "인재 발굴 — 졸업생 커리어 연결", color: "bg-orange-100 text-orange-700" },
  { brand: "MAD League", desc: "대학 동아리 연합 — 참가자 소스", color: "bg-violet-100 text-violet-700" },
  { brand: "Badak", desc: "네트워킹 — 투자자 & 멘토 연결", color: "bg-emerald-100 text-emerald-700" },
  { brand: "RooK", desc: "AI 크리에이터 — 콘텐츠 창업 협업", color: "bg-blue-100 text-blue-700" },
];

export default function ChangeUpHomePage() {
  return (
    <div>
      {/* ━━ Hero Section ━━ */}
      <section className="relative bg-gradient-to-br from-[#0D2818] via-[#0D3320] to-[#0D2818] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#0D9488] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-teal-600 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-8">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span>AI 시대, 창업은 누구나 할 수 있다</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              인공지능 시대의<br />
              <span className="text-[#2DD4BF]">창업가</span>를 키우다
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-neutral-300 leading-relaxed max-w-2xl">
              고등학생부터 대학생까지. AI 도구로 아이디어를 현실로 바꾸고,
              부모·학교·지역사회가 함께 투자하는 <strong className="text-white">청소년 창업 생태계</strong>.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/changeup/programs"
                className="inline-flex items-center gap-2 bg-[#0D9488] hover:bg-[#0B7C73] text-white px-8 py-3.5 rounded-xl text-base font-bold transition-colors shadow-lg shadow-[#0D9488]/30"
              >
                프로그램 보기 <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/changeup/invest"
                className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl text-base font-bold transition-colors"
              >
                투자 참여하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ Stats ━━ */}
      <section className="bg-[#0D9488]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <s.icon className="w-5 h-5 text-white/80 mb-2" />
                <div className="text-2xl sm:text-4xl font-black">{s.value}</div>
                <div className="text-sm mt-1 text-white/80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 프로그램 3종 ━━ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">프로그램</h2>
            <p className="text-neutral-500">단계별 창업 교육 프로그램</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((prog) => (
              <div
                key={prog.title}
                className="border border-neutral-200 rounded-2xl p-8 hover:border-[#0D9488] hover:shadow-xl hover:shadow-[#0D9488]/5 transition-all group"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#0D9488]/10 flex items-center justify-center">
                    <prog.icon className="w-6 h-6 text-[#0D9488]" />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${prog.badgeColor}`}>
                    {prog.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-1 group-hover:text-[#0D9488] transition-colors">{prog.title}</h3>
                <p className="text-xs text-neutral-400 mb-3">{prog.sub}</p>
                <p className="text-sm text-neutral-500 leading-relaxed mb-5">{prog.desc}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {prog.features.map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-500 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>

                <Link
                  href="/changeup/programs"
                  className="inline-flex items-center gap-1 text-sm text-[#0D9488] font-semibold hover:gap-2 transition-all"
                >
                  자세히 보기 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 졸업생 성과 ━━ */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">졸업생 성과</h2>
              <p className="text-neutral-500">ChangeUp에서 시작해 성장한 스타트업들</p>
            </div>
            <Link
              href="/changeup/startups"
              className="inline-flex items-center gap-1 text-sm text-[#0D9488] font-semibold hover:gap-2 transition-all"
            >
              전체 보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {graduates.map((g) => (
              <div key={g.team} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D9488] to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                    {g.team[0]}
                  </div>
                  <div>
                    <h3 className="font-bold">{g.team}</h3>
                    <p className="text-xs text-neutral-400">{g.program}</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mb-1">{g.founder}</p>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">{g.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <HandCoins className="w-4 h-4 text-[#0D9488]" />
                    <span className="text-sm font-bold text-[#0D9488]">{g.raised}</span>
                  </div>
                  <span className="text-xs text-neutral-400">{g.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 파트너 (학교 / 투자자) ━━ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">파트너</h2>
            <p className="text-neutral-500">ChangeUp과 함께하는 학교와 투자자</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* 학교 */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <School className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-lg font-bold">파트너 학교</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {schoolPartners.map((s) => (
                  <div key={s} className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* 투자자 */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Landmark className="w-5 h-5 text-[#0D9488]" />
                <h3 className="text-lg font-bold">파트너 투자사</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {investorPartners.map((inv) => (
                  <div key={inv} className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600">
                    {inv}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ 공지사항 ━━ */}
      <section className="py-16 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">공지사항</h2>
            <Link href="/changeup/community" className="text-sm text-neutral-500 hover:text-[#0D9488] transition-colors">
              전체 보기 &rarr;
            </Link>
          </div>
          <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200 bg-white rounded-xl overflow-hidden">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href="/changeup/community"
                className="flex items-center gap-4 py-4 px-5 hover:bg-[#0D9488]/5 transition-colors"
              >
                {notice.pinned && (
                  <span className="shrink-0 text-xs font-bold text-white bg-[#0D9488] px-2 py-0.5 rounded">
                    필독
                  </span>
                )}
                <span className="text-sm flex-1">{notice.title}</span>
                <span className="text-xs text-neutral-400 shrink-0">{notice.date}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ Universe 연결 ━━ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ten:One Universe</h2>
            <p className="text-neutral-500">ChangeUp이 연결하는 창업 생태계</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {universeLinks.map((u) => (
              <div key={u.brand} className="border border-neutral-200 rounded-2xl p-6 hover:shadow-md transition-all text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mb-3 ${u.color}`}>
                  {u.brand}
                </div>
                <p className="text-sm text-neutral-500">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ CTA ━━ */}
      <section className="bg-gradient-to-r from-[#0D9488] to-teal-500 text-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Rocket className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-4xl font-black mb-4">지금 시작하세요</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
            아이디어만 있으면 충분합니다. AI 도구와 함께라면 누구나 창업할 수 있습니다.
            부모님, 선생님, 이웃이 당신의 첫 투자자가 됩니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-[#0D9488] px-8 py-3.5 rounded-xl text-base font-bold hover:bg-neutral-100 transition-colors"
            >
              무료로 시작하기 <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/changeup/about"
              className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-3.5 rounded-xl text-base font-bold hover:bg-white/10 transition-colors"
            >
              자세히 알아보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
