"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Users,
  Rocket,
  Target,
  Globe,
  GraduationCap,
  Briefcase,
  Heart,
  Store,
  Lightbulb,
  Share2,
  CheckCircle2,
  Zap,
} from "lucide-react";

/* ── 타이핑 효과 ── */
const typedTexts = [
  "혼자면 꿈이지만, 함께하면 미래가 된다",
  "세대를 넘어, 경험을 연결한다",
  "아이디어에서 실행까지, 함께 달린다",
];

function useTypedText(texts: string[], speed = 80, pause = 2500) {
  const [display, setDisplay] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), speed);
      return () => clearTimeout(t);
    }
    if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx((i) => (i + 1) % texts.length);
    }
  }, [charIdx, deleting, textIdx, texts, speed, pause]);

  useEffect(() => {
    setDisplay(texts[textIdx].slice(0, charIdx));
  }, [charIdx, textIdx, texts]);

  return display;
}

/* ── 진행 중 프로젝트 ── */
const projects = [
  {
    opus: "Op.01",
    title: "로컬 소상공인 디지털 전환 프로젝트",
    desc: "전통시장 소상공인들의 온라인 진출을 돕는 디지털 마케팅 + 브랜딩 프로젝트. 대학생 마케터와 시니어 경영 컨설턴트가 팀을 이루어 실행합니다.",
    crew: ["대학생 마케터 3명", "시니어 컨설턴트 2명", "소상공인 5곳"],
    status: "진행 중",
    progress: 65,
    color: "from-green-500 to-emerald-600",
  },
  {
    opus: "Op.02",
    title: "시니어 IT 리스킬링 프로그램",
    desc: "은퇴 후 새로운 커리어를 준비하는 시니어를 위한 AI/디지털 교육 프로그램. 직장인 멘토와 대학생 튜터가 함께합니다.",
    crew: ["시니어 수강생 15명", "직장인 멘토 4명", "대학생 튜터 6명"],
    status: "진행 중",
    progress: 40,
    color: "from-green-500 to-teal-600",
  },
  {
    opus: "Op.03",
    title: "사회문제 해결 아이디어톤",
    desc: "세대 간 협업으로 지역 사회 문제를 해결하는 아이디어 대회. 기획부터 프로토타입까지 8주 프로그램.",
    crew: ["참가팀 8개", "심사위원 5명", "멘토 10명"],
    status: "모집 중",
    progress: 15,
    color: "from-emerald-500 to-green-600",
  },
];

/* ── 크루 구성 ── */
const crewTypes = [
  {
    icon: GraduationCap,
    label: "대학생",
    desc: "창의적 아이디어와 디지털 네이티브 역량",
    count: "45명",
  },
  {
    icon: Briefcase,
    label: "직장인",
    desc: "실무 경험과 전문성 기반 멘토링",
    count: "28명",
  },
  {
    icon: Heart,
    label: "시니어",
    desc: "30년+ 경험의 전략적 사고와 네트워크",
    count: "18명",
  },
  {
    icon: Store,
    label: "소상공인",
    desc: "현장의 문제와 니즈를 직접 제시",
    count: "12곳",
  },
];

/* ── 참여 방법 ── */
const processSteps = [
  {
    step: "01",
    icon: Lightbulb,
    title: "프로젝트 발제",
    desc: "해결하고 싶은 문제나 아이디어를 제안합니다",
  },
  {
    step: "02",
    icon: Users,
    title: "크루 모집",
    desc: "세대와 전문성이 다른 크루를 구성합니다",
  },
  {
    step: "03",
    icon: Rocket,
    title: "실행",
    desc: "8~12주간 집중 실행. 멘토가 함께합니다",
  },
  {
    step: "04",
    icon: Share2,
    title: "성과 공유",
    desc: "결과를 공유하고 다음 프로젝트로 연결합니다",
  },
];

export default function YouInOneHomePage() {
  const typed = useTypedText(typedTexts);

  return (
    <div className="bg-[#0A0F0A] min-h-screen">
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-950/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            Project Group of Thinking Apes
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-6 tracking-tight">
            혼자면 꿈이지만,
            <br />
            <span className="text-green-400">함께하면 미래</span>가 된다
          </h1>
          <div className="h-10 flex items-center justify-center mb-8">
            <p className="text-lg sm:text-xl text-neutral-400">
              {typed}
              <span className="animate-pulse text-green-400">|</span>
            </p>
          </div>
          <p className="text-neutral-500 mb-10 leading-relaxed max-w-xl mx-auto text-sm">
            대학생, 직장인, 시니어, 소상공인이 세대를 넘어 함께 모여
            <br />
            아이디어와 전략으로 세상의 문제를 해결합니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/youinone/about"
              className="px-8 py-3 bg-green-500 text-white font-semibold hover:bg-green-400 transition-colors rounded-lg flex items-center gap-2"
            >
              더 알아보기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/youinone/projects"
              className="px-8 py-3 border border-green-500/30 text-green-400 font-semibold hover:bg-green-500/10 transition-colors rounded-lg"
            >
              프로젝트 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ── 진행 중 프로젝트 ── */}
      <section className="py-16 px-6 border-t border-green-500/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                진행 중 프로젝트
              </h2>
              <p className="text-neutral-500 text-sm">
                세대 간 협업으로 만들어가는 프로젝트
              </p>
            </div>
            <Link
              href="/youinone/projects"
              className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
            >
              전체 보기 <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.opus}
                className="group bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden hover:border-green-500/20 transition-all"
              >
                {/* 프로젝트 헤더 */}
                <div
                  className={`h-2 bg-gradient-to-r ${project.color}`}
                  style={{ width: `${project.progress}%` }}
                />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-green-400 text-xs font-bold font-mono tracking-wider">
                      {project.opus}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        project.status === "모집 중"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-2 group-hover:text-green-300 transition-colors leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-4 line-clamp-2">
                    {project.desc}
                  </p>
                  {/* 크루 */}
                  <div className="space-y-1">
                    {project.crew.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-[10px] text-neutral-500"
                      >
                        <Users className="w-2.5 h-2.5 text-green-500/50" />
                        {c}
                      </div>
                    ))}
                  </div>
                  {/* 진행률 */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${project.color} rounded-full`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-green-400/60 font-mono">
                      {project.progress}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 크루 구성 ── */}
      <section className="py-16 px-6 border-t border-green-500/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-white mb-2">크루 구성</h2>
            <p className="text-neutral-500 text-sm">
              다양한 세대와 배경의 사람들이 하나의 팀이 됩니다
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {crewTypes.map((crew) => (
              <div
                key={crew.label}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center hover:border-green-500/20 transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-green-500/10 rounded-full flex items-center justify-center">
                  <crew.icon className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-black text-white mb-1">
                  {crew.count}
                </p>
                <p className="text-sm font-bold text-green-400 mb-1">
                  {crew.label}
                </p>
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  {crew.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 참여 방법 ── */}
      <section className="py-16 px-6 border-t border-green-500/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-white mb-2">참여 방법</h2>
            <p className="text-neutral-500 text-sm">
              아이디어부터 성과 공유까지, 4단계 프로세스
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {processSteps.map((step, i) => (
              <div
                key={step.step}
                className="relative bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:border-green-500/20 transition-all"
              >
                <span className="text-3xl font-black text-green-500/20 absolute top-3 right-4">
                  {step.step}
                </span>
                <div className="w-10 h-10 mb-4 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {step.desc}
                </p>
                {i < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 text-green-500/20">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ten:One Universe 연결 ── */}
      <section className="px-6 py-12 border-t border-green-500/10">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-4 h-4 text-green-500/30" />
            <span className="text-xs font-semibold text-green-500/30 uppercase tracking-wider">
              Ten:One Universe
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                name: "MAD League",
                desc: "대학생 크루의 동아리 연합 네트워크",
                href: "/madleague",
                color: "from-amber-500/10 to-transparent",
              },
              {
                name: "domo",
                desc: "시니어 비즈니스 네트워킹",
                href: "/domo",
                color: "from-stone-500/10 to-transparent",
              },
              {
                name: "Evolution School",
                desc: "리스킬링 교육 프로그램 연계",
                href: "/evolution",
                color: "from-blue-500/10 to-transparent",
              },
            ].map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                className={`group p-5 rounded-xl bg-gradient-to-br ${brand.color} border border-white/5 hover:border-green-500/20 transition-all`}
              >
                <h4 className="font-bold text-white text-sm group-hover:text-green-300 transition-colors">
                  {brand.name}
                </h4>
                <p className="text-xs text-neutral-500 mt-1">{brand.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 border-t border-green-500/10 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-4">
            함께 만들어 갈 미래,
            <br />
            지금 합류하세요
          </h2>
          <p className="text-neutral-500 mb-8 leading-relaxed text-sm">
            세대를 넘어, 경험을 연결하여 더 큰 가치를 만듭니다.
            <br />
            프로젝트 발제부터 크루 참여까지, 누구나 시작할 수 있습니다.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/youinone/projects"
              className="px-8 py-3 bg-green-500 text-white font-semibold hover:bg-green-400 transition-colors rounded-lg"
            >
              프로젝트 참여하기
            </Link>
            <Link
              href="/youinone/contact"
              className="px-8 py-3 border border-green-500/30 text-green-400 font-semibold hover:bg-green-500/10 transition-colors rounded-lg"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
