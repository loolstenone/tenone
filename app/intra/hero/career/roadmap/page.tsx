"use client";

import { useState } from "react";
import { MapPin, CheckCircle, Circle, ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface Level {
    title: string;
    skills: string[];
    experiences: string[];
    isCurrent: boolean;
    isComplete: boolean;
}

interface Track {
    code: string;
    name: string;
    fullName: string;
    desc: string;
    levels: Level[];
}

const tracks: Track[] = [
    {
        code: "CMO",
        name: "CMO",
        fullName: "Chief Marketing Officer",
        desc: "마케팅 / 브랜드",
        levels: [
            { title: "마케팅 인턴", skills: ["SNS 운영", "콘텐츠 제작"], experiences: ["캠페인 보조", "데이터 수집"], isCurrent: false, isComplete: true },
            { title: "마케팅 매니저", skills: ["퍼포먼스 마케팅", "브랜드 전략"], experiences: ["캠페인 리드", "예산 관리"], isCurrent: false, isComplete: true },
            { title: "마케팅 디렉터", skills: ["팀 리딩", "예산 총괄", "파트너십"], experiences: ["부서 관리", "대규모 캠페인"], isCurrent: false, isComplete: true },
            { title: "CMO", skills: ["전사 마케팅 전략", "브랜드 포트폴리오"], experiences: ["이사회 보고", "M&A 마케팅"], isCurrent: false, isComplete: true },
        ],
    },
    {
        code: "CTO",
        name: "CTO",
        fullName: "Chief Technology Officer",
        desc: "기술 / 개발",
        levels: [
            { title: "주니어 개발자", skills: ["프로그래밍 기초", "버전 관리"], experiences: ["기능 개발", "코드 리뷰 참여"], isCurrent: false, isComplete: true },
            { title: "시니어 개발자", skills: ["아키텍처 설계", "코드 품질"], experiences: ["기술 리드", "신기술 도입"], isCurrent: false, isComplete: true },
            { title: "테크 리드", skills: ["팀 리딩", "기술 전략"], experiences: ["개발팀 관리", "플랫폼 설계"], isCurrent: false, isComplete: true },
            { title: "CTO", skills: ["기술 비전", "R&D 전략", "인프라 총괄"], experiences: ["기술 로드맵", "투자 의사결정"], isCurrent: false, isComplete: true },
        ],
    },
    {
        code: "CSO",
        name: "CSO",
        fullName: "Chief Strategy Officer",
        desc: "전략 / 기획",
        levels: [
            { title: "전략 기획 사원", skills: ["시장 분석", "보고서 작성"], experiences: ["리서치 지원", "경쟁사 분석"], isCurrent: false, isComplete: true },
            { title: "전략 기획 매니저", skills: ["사업 모델링", "재무 분석"], experiences: ["신사업 기획", "투자 검토"], isCurrent: false, isComplete: true },
            { title: "전략 디렉터", skills: ["포트폴리오 전략", "파트너십 협상"], experiences: ["전사 전략 수립", "이사회 대응"], isCurrent: false, isComplete: true },
            { title: "CSO", skills: ["비전 설계", "조직 혁신", "M&A"], experiences: ["중장기 전략", "그룹 전략 총괄"], isCurrent: false, isComplete: true },
        ],
    },
    {
        code: "CBO",
        name: "CBO",
        fullName: "Chief Business Officer",
        desc: "사업 / 영업",
        levels: [
            { title: "영업 사원", skills: ["고객 관리", "제안서 작성"], experiences: ["B2B 영업", "신규 고객 발굴"], isCurrent: false, isComplete: true },
            { title: "사업개발 매니저", skills: ["파트너십", "수익 모델"], experiences: ["제휴 체결", "매출 관리"], isCurrent: false, isComplete: true },
            { title: "사업 디렉터", skills: ["사업 총괄", "팀 빌딩"], experiences: ["사업부 운영", "P&L 관리"], isCurrent: false, isComplete: true },
            { title: "CBO", skills: ["사업 포트폴리오", "해외 확장"], experiences: ["전사 사업 총괄", "투자 유치"], isCurrent: false, isComplete: true },
        ],
    },
];

export default function CareerRoadmapPage() {
    const [expandedTrack, setExpandedTrack] = useState<string>("CSO");

    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <h1 className="text-xl font-bold mb-1">성장 로드맵</h1>
                <p className="text-sm text-neutral-500">C-Level을 향한 경로 설계</p>
            </div>

            {/* Current Position */}
            <div className="border border-neutral-200 bg-white p-5 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-900 text-white flex items-center justify-center">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 uppercase tracking-wider">현재 위치</p>
                        <h2 className="text-sm font-bold">CEO — 전 트랙 완료</h2>
                        <p className="text-xs text-neutral-500">모든 C-Level 경로를 경험한 경영자 포지션입니다.</p>
                    </div>
                </div>
            </div>

            {/* Tracks */}
            <div className="space-y-3">
                {tracks.map(track => {
                    const isExpanded = expandedTrack === track.code;
                    return (
                        <div key={track.code} className="border border-neutral-200 bg-white">
                            <button
                                onClick={() => setExpandedTrack(isExpanded ? "" : track.code)}
                                className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold px-2 py-1 bg-neutral-900 text-white">{track.code}</span>
                                    <div className="text-left">
                                        <h3 className="text-sm font-semibold">{track.fullName}</h3>
                                        <p className="text-xs text-neutral-400">{track.desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500">전체 완료</span>
                                    {isExpanded ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="px-5 pb-5">
                                    <div className="relative pl-6 border-l-2 border-neutral-200 ml-4 space-y-6">
                                        {track.levels.map((level, idx) => (
                                            <div key={level.title} className="relative">
                                                <div className={clsx(
                                                    "absolute -left-[25px] w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                                    level.isComplete ? "border-neutral-900 bg-neutral-900" : "border-neutral-300 bg-white"
                                                )}>
                                                    {level.isComplete && <CheckCircle className="h-3 w-3 text-white" />}
                                                </div>
                                                <div className="ml-2">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="text-sm font-medium">{level.title}</h4>
                                                        {level.isComplete && (
                                                            <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500">완료</span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-xs text-neutral-400 mb-1">필요 역량</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {level.skills.map(s => (
                                                                    <span key={s} className="text-xs px-1.5 py-0.5 bg-neutral-50 text-neutral-500 border border-neutral-100">{s}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-neutral-400 mb-1">권장 경험</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {level.experiences.map(e => (
                                                                    <span key={e} className="text-xs px-1.5 py-0.5 bg-neutral-50 text-neutral-500 border border-neutral-100">{e}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
