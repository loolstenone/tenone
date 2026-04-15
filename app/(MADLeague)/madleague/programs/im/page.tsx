"use client";

import Link from "next/link";
import {
    Lightbulb,
    AlertTriangle,
    Search,
    Filter,
    Hammer,
    ArrowRight,
    Quote,
    Zap,
    Target,
    Eye,
} from "lucide-react";

const termDefinitions = [
    {
        term: "Idea",
        pronunciation: "아이디어",
        meaning: "발상, 생각, 방안, 계획",
        desc: "문제를 해결하기 위한 창의적 발상. 단순한 생각이 아닌, 실행 가능한 방안을 의미한다.",
    },
    {
        term: "Movement",
        pronunciation: "무브먼트",
        meaning: "움직임, 이동, 운동, 동향, 진전",
        desc: "아이디어에 생명을 불어넣는 행동. 생각에서 실행으로의 전환을 뜻한다.",
    },
];

const principles = [
    {
        icon: Search,
        title: "문제를 정의하라",
        desc: "세상에는 많은 사람들이 있고 그 숫자만큼 문제들이 있다. 문제가 무엇인지 모른다는 것이 진짜 문제다.",
        color: "text-violet-500",
        bg: "bg-violet-50",
    },
    {
        icon: Eye,
        title: "본질에 집중하라",
        desc: "아이디어를 위한 아이디어가 아닌, 문제 해결을 위한 적합한 아이디어가 필요하다. 본질에 집중해야 한다.",
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
    {
        icon: Filter,
        title: "과잉을 경계하라",
        desc: "아이디어 과잉은 방향을 잃게 만든다. 핵심을 꿰뚫는 하나의 아이디어가 백 개의 산만한 생각보다 낫다.",
        color: "text-amber-500",
        bg: "bg-amber-50",
    },
    {
        icon: Hammer,
        title: "돌도끼라도 만들어라",
        desc: "완벽한 아이디어를 기다리는 건 시작하는 시점만 늦출 뿐이다. 일단 만들어 보는 것이 중요하다.",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
    },
];

export default function IdeaMovementPage() {
    return (
        <div>
            {/* Hero */}
            <section className="relative bg-[#212121] text-white min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-[#212121] to-[#212121]" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <p className="text-violet-400 font-bold text-sm tracking-widest uppercase mb-4">
                        MAD League &middot; Project
                    </p>
                    <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                        <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                            Idea
                        </span>{" "}
                        Movement
                    </h1>
                    <p className="text-lg sm:text-xl text-neutral-300 mb-4 leading-relaxed">
                        아이디어로 세상을 바꾼다
                    </p>
                    <p className="text-neutral-500 text-sm max-w-xl mx-auto mb-10">
                        문제를 정의하고, 본질에 집중하고, 실행으로 옮기는 것.
                        <br />
                        그것이 Idea Movement의 전부다.
                    </p>
                    <Link
                        href="/madleague/idea-movement/essence"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors rounded"
                    >
                        Essence 보기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-24 px-6 bg-neutral-950 text-white">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-red-400" />
                        </div>
                        <span className="text-red-400 font-bold text-sm tracking-widest uppercase">
                            Problem
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
                        <div>
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-6 leading-tight">
                                세상에는 많은 사람들이 있고
                                <br />
                                그 숫자만큼{" "}
                                <span className="text-red-400">문제</span>
                                들이 있다
                            </h2>
                            <p className="text-neutral-400 text-lg leading-relaxed mb-6">
                                우리는 매일 수많은 문제와 마주한다. 하지만 정작
                                문제가 무엇인지 모른다는 것이 가장 큰 문제다.
                            </p>
                            <div className="p-6 border border-neutral-800 rounded-xl bg-neutral-900/50">
                                <Quote className="h-5 w-5 text-neutral-600 mb-3" />
                                <p className="text-neutral-300 italic text-lg">
                                    &ldquo;문제가 무엇인지 모른다는 것이
                                    문제다&rdquo;
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-red-500/20 to-transparent rounded-3xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-8xl font-black text-red-500/20">
                                        ?
                                    </div>
                                    <p className="text-neutral-500 text-sm mt-2">
                                        정의되지 않은 문제들
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solving Section */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center">
                            <Target className="h-6 w-6 text-violet-500" />
                        </div>
                        <span className="text-violet-500 font-bold text-sm tracking-widest uppercase">
                            Solving
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 mb-6 leading-tight">
                        하나의 문제에는
                        <br />
                        <span className="text-violet-500">다양한 해결책</span>이
                        존재한다
                    </h2>
                    <p className="text-neutral-500 text-lg leading-relaxed max-w-3xl mb-14">
                        문제를 정확히 정의하면 해결의 실마리가 보인다. 하지만
                        해결책은 하나가 아니다. 다양한 시각과 접근이 필요하며,
                        그래서 우리는 함께 모인다.
                    </p>

                    {/* 4 Principles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {principles.map((item) => (
                            <div
                                key={item.title}
                                className="p-8 border border-neutral-200 rounded-xl hover:shadow-lg transition-shadow group"
                            >
                                <div
                                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.bg} ${item.color} mb-5`}
                                >
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-neutral-500 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Idea Overload Section */}
            <section className="py-24 px-6 bg-neutral-50">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-500 mb-6">
                        <Zap className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 mb-6">
                        아이디어 과잉의 함정
                    </h2>
                    <p className="text-neutral-500 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
                        아이디어가 넘치는 시대. 하지만 아이디어를 위한
                        아이디어는 의미가 없다.
                        <br />
                        문제 해결을 위한 적합한 아이디어만이 가치가 있다.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="p-6 bg-white rounded-xl border border-neutral-200">
                            <div className="text-2xl md:text-4xl font-black text-red-200 mb-3">
                                X
                            </div>
                            <p className="text-sm text-neutral-600">
                                아이디어를 위한 아이디어
                            </p>
                        </div>
                        <div className="p-6 bg-white rounded-xl border border-neutral-200">
                            <div className="text-2xl md:text-4xl font-black text-amber-200 mb-3">
                                !
                            </div>
                            <p className="text-sm text-neutral-600">
                                본질에 집중
                            </p>
                        </div>
                        <div className="p-6 bg-white rounded-xl border-2 border-violet-300 shadow-sm">
                            <div className="text-2xl md:text-4xl font-black text-violet-400 mb-3">
                                O
                            </div>
                            <p className="text-sm text-neutral-700 font-medium">
                                문제 해결을 위한 적합한 아이디어
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Execution Section */}
            <section className="py-24 px-6 bg-[#212121] text-white">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
                        <div>
                            <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase mb-4 block">
                                Execution
                            </span>
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-6 leading-tight">
                                아이디어로
                                <br />
                                세상을{" "}
                                <span className="text-emerald-400">
                                    바꿉시다
                                </span>
                            </h2>
                            <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                                완벽한 아이디어를 기다리는 건 시작하는 시점만
                                늦출 뿐이다. 돌도끼라도 우선 만들어 봅니다.
                            </p>

                            <div className="space-y-4">
                                {[
                                    "문제를 정의한다",
                                    "본질에 집중한다",
                                    "돌도끼라도 만든다",
                                    "세상을 바꾼다",
                                ].map((step, i) => (
                                    <div
                                        key={step}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <span className="text-neutral-200 font-medium">
                                            {step}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-emerald-500/20 to-transparent rounded-3xl flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <Hammer className="h-20 w-20 text-emerald-500/30 mx-auto" />
                                    <p className="text-emerald-400 font-bold text-lg">
                                        돌도끼라도 우선 만들어 봅니다
                                    </p>
                                    <p className="text-neutral-500 text-sm">
                                        실행이 아이디어에 생명을 불어넣는다
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Term Definitions */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl md:text-3xl font-extrabold text-neutral-900 text-center mb-14">
                        용어 정의
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {termDefinitions.map((item) => (
                            <div
                                key={item.term}
                                className="p-8 border border-neutral-200 rounded-xl"
                            >
                                <h3 className="text-2xl font-extrabold text-neutral-900 mb-1">
                                    {item.term}
                                </h3>
                                <p className="text-violet-500 text-sm font-medium mb-1">
                                    {item.pronunciation}
                                </p>
                                <p className="text-neutral-400 text-xs mb-4">
                                    {item.meaning}
                                </p>
                                <p className="text-neutral-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-blue-600 text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <Lightbulb className="h-12 w-12 mx-auto mb-6 opacity-80" />
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-4">
                        당신의 아이디어가
                        <br />
                        세상을 바꿀 수 있습니다
                    </h2>
                    <p className="text-white/70 text-lg mb-10">
                        MAD League와 함께 아이디어를 실행으로 옮기세요
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/madleague/idea-movement/essence"
                            className="px-8 py-3 bg-white text-violet-600 font-semibold hover:bg-neutral-100 transition-colors rounded"
                        >
                            Essence 알아보기
                        </Link>
                        <Link
                            href="/signup"
                            className="px-8 py-3 border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors rounded"
                        >
                            MAD League 합류하기
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
