"use client";

import Link from "next/link";
import { ArrowRight, Megaphone, Sparkles, Users, Compass, ShieldCheck, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const RED = "#E53935";

export default function TalentAgentPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-900 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, #E53935 0%, transparent 45%), radial-gradient(circle at 85% 80%, #E53935 0%, transparent 45%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold tracking-widest uppercase mb-6">
            <Megaphone className="h-3.5 w-3.5" />
            Talent Agent
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            HeRo는 SM · JYP처럼<br />
            잠재된 인재를 발굴하고<br />키워내는 기획사입니다
          </h1>
          <p className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            혼자 풀기엔 벅찬 커리어의 다음 장을, HeRo가 기획사처럼 함께 설계하고 키웁니다.
            검사로 본질을 이해하고, AI와 전문가가 경로를 그리고, 기업과 조용히 연결해 드립니다.
          </p>
          <Link
            href="/hero/talent-agent/apply"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#E53935] text-white font-bold hover:bg-red-700 transition-colors"
          >
            탤런트 에이전시 신청하기 <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-neutral-400 mt-4">
            무료 · HIT 검사와 희망 직무 작성으로 바로 시작
          </p>
        </div>
      </section>

      {/* Why HeRo */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">Why HeRo</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 mb-3">
              기획사처럼 움직입니다
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              한 번의 매칭이 아닌, 인재의 성장 궤적을 함께 설계합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Sparkles,
                title: "본질로 발굴",
                desc: "이력서 키워드가 아닌, HIT 검사로 사람의 본질을 이해합니다. 숨어 있는 잠재력까지.",
              },
              {
                icon: Compass,
                title: "경로를 설계",
                desc: "AI 커리어 코칭과 전문가 상담으로 다음 한 걸음을 함께 계획합니다.",
              },
              {
                icon: ShieldCheck,
                title: "조용한 연결",
                desc: "노출 없는 비공개 매칭. 원할 때만, 맞는 기업과 조용히 이어드립니다.",
              },
            ].map((t) => (
              <div key={t.title} className="border border-neutral-200 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
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
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">How it works</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">진행 과정</h2>
          </div>

          <ol className="space-y-5">
            {[
              {
                n: "1",
                title: "HIT 검사 · 본질 진단",
                desc: "기저요인 · MBTI · DISC · 인성 · 적성을 통합 측정해 S-Power와 64유형을 도출합니다.",
              },
              {
                n: "2",
                title: "희망 직무 작성",
                desc: "어떤 자리를 원하는지, 어떤 조건이 필요한지 조용히 기록합니다. 공개되지 않습니다.",
              },
              {
                n: "3",
                title: "AI · 전문가 코칭",
                desc: "결과를 기반으로 로드맵 · 이력서 · 포트폴리오를 설계합니다. 유료 플랜에서 확장됩니다.",
              },
              {
                n: "4",
                title: "기업과 조용한 연결",
                desc: "맞는 기업이 당신을 찾으면 HeRo가 먼저 의사를 확인한 뒤 비공개로 연결합니다.",
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-4 p-5 bg-white border border-neutral-200 rounded-2xl">
                <div className="w-9 h-9 shrink-0 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center">
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
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">무엇이 포함되나요</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900">Talent Agent 기본 혜택</h2>
            <p className="text-sm text-neutral-500 mt-3">신청만으로 받을 수 있는 것들입니다.</p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "HIT A 검사 · 전체 웹 보고서 · PDF 1회",
              "희망 직무 등록 · 비공개 매칭 후보 등록",
              "AI 상담 체험 · 하루 3턴 · 3일",
              "나에게 맞는 기업·자리 조용한 추천",
              "커리어 상담 콘텐츠 · 주간 뉴스레터",
              "HeRo 파운더 커뮤니티 (소수 초대)",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 p-4 border border-neutral-200 rounded-xl">
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
            <p className="text-xs font-semibold text-red-400/80 uppercase tracking-widest mb-2">Universe Stages</p>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3 leading-tight">
              HeRo의 유니버스가 만들고 있는<br className="md:hidden" /> 오디션장
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto leading-relaxed">
              HeRo가 발굴한 인재는 Ten:One 유니버스의 다양한 무대에서 실력을 선보이고, 서로를 만납니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "MAD League",
                tagline: "Match · Act · Develop",
                href: "/madleague",
                desc: "실전 프로젝트 경쟁 PT로 성장하는 대학생 리그. 경쟁하고 · 행동하고 · 성장하는 무대.",
                dot: "#D32F2F",
              },
              {
                name: "MADLeap",
                tagline: "실전 프로젝트",
                href: "/madleap",
                desc: "마케팅 · 광고 · 창업을 실전으로 경험하며 도약하는 대학생 연합동아리.",
                dot: "#2E7D32",
              },
              {
                name: "Badak",
                tagline: "약한 연결의 힘",
                href: "/badak",
                desc: "성장을 꿈꾸는 사람들이 모이는 업계 네트워킹 커뮤니티. 약한 연결이 만드는 강한 기회.",
                dot: "#37474F",
              },
              {
                name: "JAKKA",
                tagline: "Creative hands, bold voices",
                href: "/jakka",
                desc: "디자인 · 아트 · 크리에이티브 작업을 선보이는 창작자들의 장.",
                dot: "#EC407A",
              },
              {
                name: "MoNTZ",
                tagline: "U.G.L.Y — Unique, Glory, Lovely, You",
                href: "/montz",
                desc: "모델 · 배우 · 크리에이터의 얼굴과 이야기를 담아내는 무대.",
                dot: "#F59E0B",
              },
              {
                name: "ChangeUp",
                tagline: "미래를 만드는 일, 창업",
                href: "/changeup",
                desc: "아이디어가 사업이 되는 과정을 함께 만드는 창업 교육 · 실전 플랫폼.",
                dot: "#1E88E5",
              },
            ].map((s) => (
              <Link
                key={s.name}
                href={s.href}
                className="group flex flex-col p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-colors min-h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                  <p className="text-base font-bold">{s.name}</p>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-500 group-hover:text-white transition-colors ml-auto" />
                </div>
                <p className="text-[11px] text-red-400/70 font-medium mb-2 uppercase tracking-wider">{s.tagline}</p>
                <p className="text-xs text-neutral-400 leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>

          <p className="text-center text-xs text-neutral-500 mt-8">
            HeRo가 발굴하고 · Universe가 무대를 제공합니다
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="pt-20 pb-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-3xl bg-gradient-to-br from-[#E53935] to-red-700 text-white p-10 md:p-12 text-center">
            <Users className="h-8 w-8 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3 leading-tight">
              당신의 커리어를 함께 키웁니다
            </h2>
            <p className="text-white/90 mb-8 leading-relaxed">
              지금 신청하면 HeRo의 발굴 프로세스가 시작됩니다. 당신이 준비된 만큼 천천히 진행됩니다.
            </p>
            <Link
              href="/hero/talent-agent/apply"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#E53935] font-bold hover:bg-neutral-100 transition-colors"
            >
              탤런트 에이전시 신청하기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
