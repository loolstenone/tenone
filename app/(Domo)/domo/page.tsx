"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Shield,
  TrendingUp,
  Handshake,
  Star,
  Clock,
  Globe,
  DollarSign,
  Briefcase,
} from "lucide-react";

/* ── 다음 모임 ── */
const nextMeeting = {
  title: "시니어 비즈니스 네트워킹 디너",
  date: "2026년 4월 12일 (토)",
  time: "18:30 - 21:00",
  location: "서울 강남 르 메르디앙 호텔",
  topic: "AI 시대, 경험의 가치를 재정의하다",
  fee: "15만원",
  capacity: "20명 (선착순)",
  spotsLeft: 7,
};

/* ── 멤버 프로필 ── */
const memberProfiles = [
  {
    initial: "K",
    name: "김재현 전무",
    industry: "광고/마케팅 35년",
    expertise: "브랜드 전략, 미디어 플래닝",
    bg: "bg-stone-700",
  },
  {
    initial: "P",
    name: "박성우 부사장",
    industry: "금융/투자 30년",
    expertise: "자산 운용, 스타트업 투자",
    bg: "bg-amber-800",
  },
  {
    initial: "L",
    name: "이현석 대표",
    industry: "IT/테크 28년",
    expertise: "디지털 전환, AI 비즈니스",
    bg: "bg-stone-600",
  },
];

/* ── 핵심 가치 ── */
const values = [
  {
    icon: Shield,
    title: "신뢰",
    desc: "검증된 시니어 비즈니스맨만을 위한 프리미엄 커뮤니티. 추천과 심사를 거쳐 합류합니다.",
  },
  {
    icon: TrendingUp,
    title: "성장",
    desc: "인생 2회차, 멈추지 않는 도전. 새로운 사업 기회와 배움의 기회를 함께 만듭니다.",
  },
  {
    icon: Handshake,
    title: "연결",
    desc: "30년 경험이 만나면 새로운 시너지가 됩니다. 의미 있는 관계가 기회가 됩니다.",
  },
];

/* ── 다가오는 모임 목록 ── */
const upcomingEvents = [
  {
    date: "4월 19일",
    title: "은퇴 후 자산관리 세미나",
    location: "온라인 Zoom",
    type: "세미나",
    fee: "무료",
  },
  {
    date: "4월 26일",
    title: "골프 라운딩 모임",
    location: "경기도 용인 CC",
    type: "친목",
    fee: "그린피 별도",
  },
  {
    date: "5월 3일",
    title: "스타트업 투자 설명회",
    location: "서울 여의도",
    type: "투자",
    fee: "10만원",
  },
];

/* ── 후기 ── */
const testimonials = [
  {
    name: "K 전무",
    industry: "광고/마케팅 35년",
    quote:
      "집에만 있기엔 아직 할 일이 많습니다. 같은 생각을 가진 분들을 만나니 새로운 에너지가 생깁니다.",
  },
  {
    name: "P 부사장",
    industry: "금융/투자 30년",
    quote:
      "경험과 네트워크를 활용할 수 있는 곳을 찾고 있었습니다. domo에서 좋은 파트너를 만났습니다.",
  },
  {
    name: "L 대표",
    industry: "IT/테크 28년",
    quote:
      "은퇴 후 막연했던 계획이 구체적인 프로젝트로 바뀌었습니다.",
  },
];

export default function DomoHome() {
  return (
    <div className="bg-stone-50">
      {/* ── Hero ── */}
      <section className="relative bg-[#1C1917] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-stone-900/50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-[100px]" />
        <div className="relative mx-auto max-w-4xl text-center py-28 px-6">
          <p className="text-amber-500/80 text-sm font-medium mb-6 tracking-[0.3em] uppercase">
            Business Networking
          </p>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[0.95]">
            미래를
            <br />
            <span className="text-amber-500">도모하다</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-400 max-w-xl mx-auto mb-3 leading-relaxed">
            사업가들의 성장과 성공을 도모하는
            <br />
            비즈니스 네트워킹
          </p>
          <p className="text-sm text-stone-500 mb-10">
            정년 은퇴 후에도 멈추지 않는 도전. 경험이 곧 자산이 되는 곳.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/domo/about"
              className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              domo 알아보기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="border border-stone-600 hover:border-stone-400 text-stone-300 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              멤버 가입
            </Link>
          </div>
        </div>
      </section>

      {/* ── 핵심 가치 ── */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
                  <v.icon className="h-7 w-7 text-amber-700" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 다음 모임 (메인 카드) ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-6">
            Next Gathering
          </h2>
          <div className="bg-[#1C1917] text-white rounded-2xl overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                {/* 왼쪽: 모임 정보 */}
                <div className="flex-1">
                  <span className="inline-block text-[10px] font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                    네트워킹 디너
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
                    {nextMeeting.title}
                  </h3>
                  <p className="text-stone-400 text-sm mb-6 max-w-lg">
                    주제: {nextMeeting.topic}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-stone-300">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      {nextMeeting.date} | {nextMeeting.time}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-300">
                      <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                      {nextMeeting.location}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-300">
                      <DollarSign className="w-4 h-4 text-amber-500 shrink-0" />
                      참가비 {nextMeeting.fee}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-300">
                      <Users className="w-4 h-4 text-amber-500 shrink-0" />
                      {nextMeeting.capacity}{" "}
                      <span className="text-amber-500 font-medium">
                        (잔여 {nextMeeting.spotsLeft}석)
                      </span>
                    </div>
                  </div>
                </div>
                {/* 오른쪽: CTA */}
                <div className="lg:text-right">
                  <div className="inline-flex flex-col items-center lg:items-end gap-3">
                    <div className="text-center lg:text-right mb-2">
                      <p className="text-3xl font-black text-amber-500">
                        {nextMeeting.spotsLeft}
                      </p>
                      <p className="text-xs text-stone-500">남은 자리</p>
                    </div>
                    <Link
                      href="/domo/events"
                      className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                    >
                      참가 신청 <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 추가 모임 목록 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {upcomingEvents.map((ev, i) => (
              <Link
                key={i}
                href="/domo/events"
                className="group bg-white border border-stone-200 rounded-xl p-5 hover:border-amber-300 hover:shadow-md transition-all"
              >
                <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded mb-3">
                  {ev.type}
                </span>
                <p className="text-xs text-stone-400 mb-1">{ev.date}</p>
                <h3 className="font-bold text-sm text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                  {ev.title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {ev.location}
                  </p>
                  <p className="text-xs text-amber-600 font-medium">{ev.fee}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 멤버 프로필 미리보기 ── */}
      <section className="py-16 px-6 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-1">
                멤버 프로필
              </h2>
              <p className="text-stone-400 text-sm">
                30년 이상의 경험을 가진 시니어 프로페셔널
              </p>
            </div>
            <Link
              href="/domo/members"
              className="text-sm text-amber-700 hover:text-amber-600 font-medium flex items-center gap-1 transition-colors"
            >
              전체 보기 <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {memberProfiles.map((member) => (
              <div
                key={member.name}
                className="group bg-stone-50 rounded-xl p-6 hover:bg-stone-100 transition-colors"
              >
                <div
                  className={`w-14 h-14 ${member.bg} rounded-full flex items-center justify-center mb-4`}
                >
                  <span className="text-white font-bold text-lg">
                    {member.initial}
                  </span>
                </div>
                <h3 className="font-bold text-stone-900 mb-1">{member.name}</h3>
                <p className="text-xs text-amber-700 font-medium mb-2">
                  {member.industry}
                </p>
                <p className="text-sm text-stone-500">{member.expertise}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 멤버 후기 ── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-2 text-center">
            멤버 이야기
          </h2>
          <p className="text-stone-400 text-center mb-10 text-sm">
            domo와 함께하는 분들의 이야기
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm"
              >
                <Star className="w-5 h-5 text-amber-500 mb-3" />
                <p className="text-sm text-stone-600 leading-relaxed mb-4 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="text-sm font-bold text-stone-900">{t.name}</p>
                <p className="text-xs text-stone-400">{t.industry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ten:One Universe 연결 ── */}
      <section className="px-6 py-12 border-t border-stone-200">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Ten:One Universe
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                name: "Badak",
                desc: "비즈니스 네트워크 확장",
                href: "/badak",
              },
              {
                name: "HeRo",
                desc: "시니어 인재 매칭",
                href: "/hero",
              },
              {
                name: "YouInOne",
                desc: "세대 간 프로젝트 협업",
                href: "/youinone",
              },
            ].map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                className="group p-5 rounded-xl bg-stone-100 hover:bg-stone-200 transition-all"
              >
                <h4 className="font-bold text-stone-900 text-sm group-hover:text-amber-700 transition-colors">
                  {brand.name}
                </h4>
                <p className="text-xs text-stone-400 mt-1">{brand.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-[#1C1917] text-white text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-xl md:text-3xl font-bold mb-4">
            함께 도모합시다
          </h2>
          <p className="text-stone-400 mb-8 leading-relaxed">
            경험과 네트워크를 활용할 새로운 무대가 여기 있습니다.
            <br />
            미래를 함께 도모할 파트너를 기다립니다.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              멤버 가입하기
            </Link>
            <Link
              href="/domo/about"
              className="border border-stone-600 hover:border-stone-400 text-stone-300 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              자세히 알아보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
