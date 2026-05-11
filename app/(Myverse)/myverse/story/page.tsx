// 브랜드 스토리 — 철학 + About 통합
// 추상·중복 제거. 서사 (어둠의 점) + 3원칙 (운영/소유/성장) + 다섯 번의 전환 + Personal Black Box.

import type { Metadata } from "next";
import Link from "next/link";
import {
    Sparkles, Database, Brain, User, Globe, Orbit, Shield, ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
    title: "브랜드 스토리 — Myverse",
    description: "나를 운영하는 OS. 어둠 속의 점 하나에서 시작해 디지털 속 나를 키우는 서사.",
    openGraph: {
        title: "브랜드 스토리 | Myverse",
        description: "Personal OS — 나를 운영하는 OS",
    },
};

const PRINCIPLES = [
    {
        title: "운영한다",
        desc: "사진·메모·일정·관계가 자동으로 9 영역에 정리되는 시스템. 의식적으로 분류하지 않아도 하루치만큼 쌓인다.",
        icon: Sparkles,
    },
    {
        title: "소유한다",
        desc: "내 데이터, 내 OS, 내 결정. 서비스는 사라져도 나의 기록은 남는다. 일괄 다운로드·영구 삭제가 항상 1탭 거리.",
        icon: Shield,
    },
    {
        title: "성장한다",
        desc: "AI가 패턴을 보여주고, 나는 더 잘 살 수 있도록. 모든 분석은 사용자 동의 위에서 단계적으로 도입된다.",
        icon: Brain,
    },
];

const TRANSITIONS = [
    { num: "1", title: "나를 모은다",         desc: "흩어진 조각을 한 곳에 데려온다. 잊혀져가는 기록을 구출한다.",                             icon: Database },
    { num: "2", title: "나를 쌓는다",         desc: "특별한 노력 없이, 하루가 하루치만큼 기록된다.",                                           icon: Sparkles },
    { num: "3", title: "나를 알아간다",       desc: "AI가 소비·수면·관계·감정 패턴을 읽지만, 나서지 않는다. 단계적 도입.",                       icon: Brain },
    { num: "4", title: "나를 대표한다",       desc: "AI가 디지털 세상에서 나를 대표한다. 더 이상 앱이 아니라 디지털 세상에서의 나 자신.",       icon: User },
    { num: "5", title: "세상이 나에게 접속한다", desc: "내가 서비스에 접속하는 게 아니라, 서비스가 나에게 접속한다. 내가 허락한 만큼만.",            icon: Globe },
];

export default function StoryPage() {
    return (
        <div className="bg-white">
            {/* ── HERO ── */}
            <section className="relative overflow-hidden py-28 lg:py-36 px-5">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-100/60 blur-[120px] pointer-events-none" />
                <div className="relative mx-auto max-w-3xl text-center">
                    <p className="text-indigo-600 font-semibold text-xs tracking-widest uppercase mb-3">BRAND STORY</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-neutral-900">
                        어둠 속의 점 하나
                    </h1>
                    <p className="mt-6 text-base sm:text-lg text-neutral-500 leading-relaxed">
                        처음에는 아무것도 없습니다. 어두운 공간에 작은 점 하나.<br className="hidden sm:block" />
                        그게 디지털 세상에서의 나. 아직 형태도, 빛도, 기억도 없습니다.
                    </p>
                </div>
            </section>

            {/* ── 흩뿌린 조각들 ── */}
            <section className="py-20 lg:py-24 bg-neutral-50 px-5">
                <div className="mx-auto max-w-3xl">
                    <p className="text-lg text-neutral-700 leading-relaxed">
                        지난 20년간 우리는 수십 개의 서비스에 자신의 조각들을 흩뿌려왔습니다.
                    </p>
                    <div className="my-8 grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                        {["싸이월드에 10대", "페이스북에 20대", "인스타그램에 30대", "카카오톡에 대화", "구글에 위치", "토스에 소비"].map(t => (
                            <div key={t} className="p-3 rounded-xl bg-white border border-neutral-200 text-center text-[11px] text-neutral-500">{t}</div>
                        ))}
                    </div>
                    <p className="text-lg text-neutral-700 leading-relaxed">
                        그리고 서비스가 사라질 때마다 그 안의 &ldquo;나&rdquo;도 함께 사라졌습니다.
                    </p>
                    <p className="text-lg text-neutral-700 leading-relaxed mt-4">
                        조각들을 다시 하나씩 가져와 어두운 공간에 갖다 놓으면 — 점이 조금씩 커집니다. 빛이 생기고, 형태가 잡힙니다.
                    </p>
                    <p className="mt-8 text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
                        Myverse는 디지털 속 나를 키우는 일입니다.
                    </p>
                </div>
            </section>

            {/* ── 3원칙 ── */}
            <section className="py-24 lg:py-32 px-5">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-14">
                        <p className="text-indigo-600 font-semibold text-xs tracking-widest uppercase mb-3">THREE PRINCIPLES</p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">세 가지 원칙</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-5">
                        {PRINCIPLES.map((p, i) => (
                            <div key={p.title} className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                                    <p.icon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-mono text-indigo-500">0{i + 1}</span>
                                    <h3 className="text-lg font-semibold text-neutral-900">{p.title}</h3>
                                </div>
                                <p className="text-sm text-neutral-600 leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 다섯 번의 전환 ── */}
            <section className="py-24 lg:py-32 px-5 bg-neutral-50">
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-14">
                        <p className="text-indigo-600 font-semibold text-xs tracking-widest uppercase mb-3">FIVE TRANSITIONS</p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">다섯 번의 전환</h2>
                        <p className="mt-3 text-sm text-neutral-500">현재는 1·2단계 개발 중. 3단계 이후는 단계적으로 도입됩니다.</p>
                    </div>
                    <div className="space-y-4">
                        {TRANSITIONS.map(t => (
                            <div key={t.num} className="flex gap-5 p-5 rounded-2xl bg-white border border-neutral-200">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                    <t.icon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-indigo-500">{t.num}차</span>
                                        <h3 className="font-semibold text-neutral-900">{t.title}</h3>
                                    </div>
                                    <p className="text-sm text-neutral-600 leading-relaxed">{t.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Personal Black Box ── */}
            <section className="py-24 lg:py-32 px-5">
                <div className="mx-auto max-w-3xl text-center">
                    <Orbit className="h-10 w-10 text-indigo-600 mx-auto mb-6" />
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-5">
                        나의 Personal Black Box
                    </h2>
                    <p className="text-base text-neutral-500 leading-relaxed mb-6">
                        비행기에는 블랙박스가 있어 모든 비행 데이터를 기록합니다. 사람에게는 그런 게 없었습니다.<br className="hidden sm:block" />
                        기억은 왜곡되고, 흐려지고, 사라집니다.
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                        Myverse는 당신의 Personal Black Box입니다.
                    </p>
                    <Link
                        href="/Myverse"
                        className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:opacity-90 transition-colors"
                    >
                        시작하기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
