"use client";

import { PageHero } from "@/features/hero/PageHero";
import Link from "next/link";
import { CrossSiteLink } from "@/components/CrossSiteLink";
import { ArrowRight, Megaphone, Sparkles, Users, Compass, ShieldCheck, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const RED = "#E53935";

export default function TalentAgentPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero */}
      <PageHero
        label="탤런트 에이전시"
        title={<>HeRo는 연예 기획사처럼<br />숨은 인재를 찾아 키웁니다</>}
        desc="혼자 정하기 어려운 커리어의 다음 단계를 HeRo가 함께 계획합니다. 검사로 나를 알고, AI와 전문가가 갈 길을 함께 정하고, 회사에 나를 보여 줄 준비를 같이 합니다."
        cta={{ label: "탤런트 에이전시 신청하기", href: "/hero/talent-agent/apply" }}
        note="HIT 검사와 희망 직무 설문으로 바로 시작합니다"
      />

      {/* Why HeRo */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">왜 HeRo인가</p>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">
              기획사처럼 움직입니다
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              한 번 소개하고 끝내지 않고, 오래 성장하도록 곁에서 돕습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Sparkles,
                title: "검사로 발견",
                desc: "이력서 키워드보다 HIT 검사로 사람을 먼저 이해합니다. 아직 드러나지 않은 강점까지 봅니다.",
              },
              {
                icon: Compass,
                title: "갈 길을 함께",
                desc: "AI 커리어 코칭과 전문가 상담으로 다음 한 걸음을 함께 계획합니다.",
              },
              {
                icon: ShieldCheck,
                title: "비공개 원칙",
                desc: "내 정보는 공개되지 않습니다. 회사에 보여 줄지는 내가 정합니다.",
              },
            ].map((t) => (
              <div key={t.title} className="border border-neutral-200 rounded-xs p-6">
                <div className="w-10 h-10 rounded-xs bg-red-50 flex items-center justify-center mb-4">
                  <t.icon className="h-5 w-5 text-[#E53935]" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">{t.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">진행 방법</p>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">진행 과정</h2>
          </div>

          <ol className="space-y-5">
            {[
              {
                n: "1",
                title: "HIT 검사",
                desc: "성격(MBTI)·행동 유형(DISC)·성품·적성·성장 배경을 함께 보고 나의 강점과 64가지 유형 중 내 유형을 알려 드립니다.",
              },
              {
                n: "2",
                title: "희망 직무 작성",
                desc: "어떤 일을 원하는지, 어떤 조건이 필요한지 적어 둡니다. 공개되지 않습니다.",
              },
              {
                n: "3",
                title: "AI · 전문가 코칭",
                desc: "검사 결과를 바탕으로 성장 계획·이력서·포트폴리오를 함께 만듭니다.",
              },
              {
                n: "4",
                title: "회사에 나를 보여 주기",
                desc: "맞는 기업이 당신에게 관심을 보이면, HeRo가 먼저 의사를 확인한 뒤 본인이 허락한 범위만 보여드립니다.",
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-4 p-5 bg-white border border-neutral-200 rounded-xs">
                <div className="w-9 h-9 shrink-0 rounded-none bg-neutral-900 text-white font-bold flex items-center justify-center">
                  {s.n}
                </div>
                <div>
                  <p className="font-bold text-neutral-900 mb-1">{s.title}</p>
                  <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 포함 혜택 */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">무엇이 포함되나요</p>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">탤런트 에이전시 기본 혜택</h2>
            <p className="text-sm text-neutral-500 mt-3">신청만으로 받을 수 있는 것들입니다.</p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "기본 성향 검사 · 전체 웹 보고서",
              "희망 직무 등록 · 비공개 인재 풀 등록",
              "AI 상담 체험 · 하루 3번 · 3일",
              "나와 맞을 만한 회사 정보 안내",
              "커리어 상담 콘텐츠 · 주간 뉴스레터",
              "HeRo 파운더 커뮤니티 (소수 초대)",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 p-4 border border-neutral-200 rounded-xs">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-[#E53935]" />
                <span className="text-sm text-neutral-700 leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Universe 오디션장 */}
      <section className="py-20 bg-neutral-900 text-white overflow-hidden">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-red-400/80 uppercase tracking-widest mb-2">유니버스 성장 단계</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
              HeRo와 함께하는<br className="md:hidden" /> 유니버스 브랜드
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Ten:One™ Universe의 여러 브랜드에서 실력을 보여 주고, 같은 길을 가는 사람들을 만날 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "MADLeague",
                tagline: "Match, Active, Develop",
                href: "/madleague",
                desc: "실제 기업 과제로 경쟁 PT를 하며 성장하는 대학생 리그입니다.",
                dot: "#D32F2F",
              },
              {
                name: "MADLeap",
                tagline: "실전 프로젝트",
                href: "/madleap",
                desc: "마케팅·광고·창업을 직접 해 보며 배우는 대학생 연합동아리입니다.",
                dot: "#2E7D32",
              },
              {
                name: "Badak",
                tagline: "약한 연결의 힘",
                href: "/badak",
                desc: "마케팅·광고 업계 사람들이 모이는 네트워킹 커뮤니티입니다. 느슨한 인맥에서 뜻밖의 기회가 생깁니다.",
                dot: "#37474F",
              },
              {
                name: "Jakka",
                tagline: "Creative hands, bold voices",
                href: "/jakka",
                desc: "디자인·아트·크리에이티브 작업을 보여 주는 창작자 커뮤니티입니다.",
                dot: "#EC407A",
              },
              {
                name: "MoNTZ",
                tagline: "U.G.L.Y — Unique, Glory, Lovely, You",
                href: "/montz",
                desc: "모델·배우·크리에이터의 얼굴과 이야기를 담는 사진 브랜드입니다.",
                dot: "#F59E0B",
              },
              {
                name: "ChangeUp",
                tagline: "미래를 만드는 일, 창업",
                href: "/changeup",
                desc: "아이디어를 사업으로 만드는 과정을 함께하는 창업 교육 프로그램입니다.",
                dot: "#1E88E5",
              },
            ].map((s) => (
              <CrossSiteLink
                key={s.name}
                href={s.href}
                className="group flex flex-col p-5 rounded-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-colors min-h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-none shrink-0" style={{ backgroundColor: s.dot }} />
                  <p className="text-base font-bold">{s.name}</p>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-500 group-hover:text-white transition-colors ml-auto" />
                </div>
                <p className="text-[11px] text-red-400/70 font-normal mb-2 uppercase tracking-wider">{s.tagline}</p>
                <p className="text-xs text-neutral-400 leading-relaxed">{s.desc}</p>
              </CrossSiteLink>
            ))}
          </div>

          <p className="text-center text-xs text-neutral-500 mt-8">
            HeRo에서 나를 알고, 유니버스 브랜드에서 경험을 쌓습니다
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="pt-20 pb-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-xs bg-[#E53935] text-white p-10 md:p-12">
            <Users className="h-8 w-8 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
              당신의 커리어를 함께 키웁니다
            </h2>
            <p className="text-white/90 mb-8 leading-relaxed">
              신청하면 HIT 검사부터 차례로 안내해 드립니다. 내 속도에 맞춰 천천히 진행됩니다.
            </p>
            <Link
              href="/hero/talent-agent/apply"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xs bg-white text-[#E53935] font-bold hover:bg-neutral-100 transition-colors"
            >
              탤런트 에이전시 신청하기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
