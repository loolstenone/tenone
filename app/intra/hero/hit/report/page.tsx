"use client";

import { useState } from "react";
import { Download, User, Zap, AlertTriangle, Briefcase, Sparkles } from "lucide-react";
import clsx from "clsx";

const discData = [
    { label: "D (주도형)", value: 85, desc: "목표 지향적, 결단력, 도전적" },
    { label: "I (사교형)", value: 60, desc: "소통, 설득, 네트워킹" },
    { label: "S (안정형)", value: 30, desc: "인내, 협력, 안정 추구" },
    { label: "C (신중형)", value: 45, desc: "분석, 정확성, 체계적" },
];

const strengths = ["전략적 사고", "네트워크 빌딩", "비전 제시", "실행 추진력", "조직 설계"];
const weaknesses = ["디테일 관리", "인내심", "감정 조절"];

const jobFit = [
    { role: "경영전략", fit: 95 },
    { role: "브랜드 기획", fit: 88 },
    { role: "사업개발", fit: 85 },
    { role: "마케팅 디렉션", fit: 78 },
    { role: "프로젝트 매니지먼트", fit: 72 },
];

export default function HitReportPage() {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = () => {
        setDownloading(true);
        setTimeout(() => setDownloading(false), 1500);
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold mb-1">HIT 결과 리포트</h1>
                    <p className="text-sm text-neutral-500">Cheonil Jeon님의 HeRo 프로필</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                    <Download className="h-3 w-3" />
                    {downloading ? "다운로드 중..." : "리포트 다운로드"}
                </button>
            </div>

            {/* HeRo Character Card */}
            <div className="border border-neutral-200 bg-white p-6 mb-6">
                <div className="flex items-start gap-5">
                    <div className="w-20 h-20 bg-neutral-900 text-white flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">HeRo Character</p>
                        <h2 className="text-lg font-bold mb-1">비전을 제시하는 전략가</h2>
                        <p className="text-xs text-neutral-500 italic">The Visionary Strategist</p>
                        <p className="text-sm text-neutral-600 mt-2">
                            큰 그림을 그리고, 사람을 모으며, 세계관을 설계하는 리더형 인재.
                            강력한 추진력과 전략적 사고로 조직을 이끈다.
                        </p>
                        <div className="flex gap-2 mt-3">
                            <span className="text-xs px-2 py-0.5 bg-neutral-900 text-white">ENTJ</span>
                            <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600">CEO</span>
                            <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600">취업준비도: N/A (경영자)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* DISC Chart */}
            <div className="border border-neutral-200 bg-white p-6 mb-6">
                <h3 className="text-sm font-semibold mb-1">DISC 행동유형</h3>
                <p className="text-xs text-neutral-400 mb-5">행동 성향 분포</p>
                <div className="space-y-4">
                    {discData.map(d => (
                        <div key={d.label}>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="font-medium">{d.label}</span>
                                <span className="text-neutral-400">{d.value}%</span>
                            </div>
                            <div className="w-full h-6 bg-neutral-100 relative">
                                <div
                                    className="h-full bg-neutral-900 transition-all duration-500"
                                    style={{ width: `${d.value}%` }}
                                />
                            </div>
                            <p className="text-xs text-neutral-400 mt-1">{d.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Strengths */}
                <div className="border border-neutral-200 bg-white p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-4 w-4 text-neutral-900" />
                        <h3 className="text-sm font-semibold">강점</h3>
                    </div>
                    <div className="space-y-2">
                        {strengths.map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <span className="text-xs w-5 h-5 flex items-center justify-center bg-neutral-900 text-white font-medium">
                                    {i + 1}
                                </span>
                                <span className="text-sm">{s}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weaknesses */}
                <div className="border border-neutral-200 bg-white p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-4 w-4 text-neutral-400" />
                        <h3 className="text-sm font-semibold">개발 필요 영역</h3>
                    </div>
                    <div className="space-y-2">
                        {weaknesses.map((w, i) => (
                            <div key={w} className="flex items-center gap-2">
                                <span className="text-xs w-5 h-5 flex items-center justify-center bg-neutral-200 text-neutral-500 font-medium">
                                    {i + 1}
                                </span>
                                <span className="text-sm text-neutral-600">{w}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MBTI Breakdown */}
            <div className="border border-neutral-200 bg-white p-6 mb-6">
                <h3 className="text-sm font-semibold mb-1">MBTI 성향 분석</h3>
                <p className="text-xs text-neutral-400 mb-5">일상 태도 기반 분석 결과: ENTJ</p>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { left: "I (내향)", right: "E (외향)", value: 72 },
                        { left: "S (감각)", right: "N (직관)", value: 80 },
                        { left: "F (감정)", right: "T (사고)", value: 68 },
                        { left: "P (인식)", right: "J (판단)", value: 75 },
                    ].map(item => (
                        <div key={item.left} className="text-center">
                            <div className="w-full h-2 bg-neutral-200 mb-2 relative">
                                <div
                                    className="h-full bg-neutral-900 absolute right-0"
                                    style={{ width: `${item.value}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-neutral-400">
                                <span>{item.left}</span>
                                <span className="font-medium text-neutral-900">{item.value}%</span>
                                <span>{item.right}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Job Fit */}
            <div className="border border-neutral-200 bg-white p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-4 w-4 text-neutral-900" />
                    <h3 className="text-sm font-semibold">직무 적합도</h3>
                </div>
                <div className="space-y-3">
                    {jobFit.map((j, i) => (
                        <div key={j.role} className="flex items-center gap-3">
                            <span className={clsx(
                                "text-xs w-5 h-5 flex items-center justify-center font-medium",
                                i === 0 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"
                            )}>
                                {i + 1}
                            </span>
                            <span className="text-sm w-36">{j.role}</span>
                            <div className="flex-1 h-4 bg-neutral-100 relative">
                                <div
                                    className={clsx(
                                        "h-full transition-all duration-500",
                                        i === 0 ? "bg-neutral-900" : "bg-neutral-400"
                                    )}
                                    style={{ width: `${j.fit}%` }}
                                />
                            </div>
                            <span className="text-xs text-neutral-500 w-10 text-right">{j.fit}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
