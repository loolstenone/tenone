"use client";

import { useState, useEffect } from "react";
import { Sparkles, Hash, FileText, FolderOpen, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import * as heroDb from "@/lib/supabase/hero";
import { useAuth } from "@/lib/auth-context";

const mockProjects = [
    {
        id: "1",
        name: "TenOne Universe",
        role: "Founder & CEO",
        desc: "AI 크리에이터와 대학 네트워크를 연결하는 멀티 브랜드 생태계",
        period: "2024 - 현재",
    },
    {
        id: "2",
        name: "MADLeague",
        role: "설립자 / 운영 총괄",
        desc: "10개 대학 동아리 연합체, 인재 발굴-육성-매칭 파이프라인",
        period: "2025 - 현재",
    },
    {
        id: "3",
        name: "LUKI AI Group",
        role: "기획 디렉터",
        desc: "AI 아이돌 그룹 세계관 설계 및 콘텐츠 전략",
        period: "2025 - 현재",
    },
];

export default function PersonalBrandingPage() {
    const { user } = useAuth();
    const [keywords, setKeywords] = useState<string[]>(["전략", "연결", "세계관", "AI", "브랜드", "리더십"]);
    const [newKeyword, setNewKeyword] = useState("");
    const [story, setStory] = useState(
        "나는 사람과 브랜드, 기술을 연결하는 전략가입니다. Ten:One™ Universe를 통해 AI 크리에이터 생태계와 대학 네트워크를 잇는 새로운 엔터테인먼트 모델을 만들고 있습니다. 모든 인재가 자신만의 브랜드를 가질 수 있는 세상을 꿈꿉니다."
    );
    const [isPublic, setIsPublic] = useState(false);

    // DB에서 커리어 프로필 로드 (브랜딩 데이터 연동)
    useEffect(() => {
        if (!user?.id) return;
        heroDb.fetchCareerProfile(user.id)
            .then(data => {
                if (data) {
                    if (data.brand_keywords) setKeywords(data.brand_keywords as string[]);
                    if (data.brand_story) setStory(data.brand_story as string);
                    if (data.is_public !== undefined) setIsPublic(data.is_public as boolean);
                }
            })
            .catch(() => { /* Mock fallback */ });
    }, [user?.id]);

    // 브랜딩 데이터 변경 시 DB 저장
    const saveBrandingToDb = () => {
        if (!user?.id) return;
        heroDb.upsertCareerProfile(user.id, {
            brand_keywords: keywords,
            brand_story: story,
            is_public: isPublic,
        }).catch(() => { /* silent */ });
    };

    const addKeyword = () => {
        if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
            const updated = [...keywords, newKeyword.trim()];
            setKeywords(updated);
            setNewKeyword("");
            if (user?.id) heroDb.upsertCareerProfile(user.id, { brand_keywords: updated, brand_story: story, is_public: isPublic }).catch(() => {});
        }
    };

    const removeKeyword = (kw: string) => {
        const updated = keywords.filter(k => k !== kw);
        setKeywords(updated);
        if (user?.id) heroDb.upsertCareerProfile(user.id, { brand_keywords: updated, brand_story: story, is_public: isPublic }).catch(() => {});
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">퍼스널 브랜딩</h1>
                <p className="text-sm text-neutral-500">나만의 브랜드를 기획합니다</p>
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
                        <p className="text-xs text-neutral-500 italic mb-2">The Visionary Strategist</p>
                        <p className="text-sm text-neutral-600">
                            큰 그림을 그리고, 사람을 모으며, 세계관을 설계하는 리더형 인재.
                        </p>
                        <div className="flex gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 bg-neutral-900 text-white">ENTJ</span>
                            <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600">D 주도형</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Brand Keywords */}
            <div className="border border-neutral-200 bg-white p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                    <Hash className="h-4 w-4 text-neutral-900" />
                    <h3 className="text-sm font-semibold">나의 브랜드 키워드</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                    {keywords.map(kw => (
                        <span key={kw} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-neutral-100 text-neutral-700 font-medium">
                            #{kw}
                            <button
                                onClick={() => removeKeyword(kw)}
                                className="text-neutral-300 hover:text-red-500 text-xs"
                            >
                                x
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        value={newKeyword}
                        onChange={e => setNewKeyword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addKeyword()}
                        placeholder="키워드 추가 (Enter)"
                        className="flex-1 border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                    />
                    <button onClick={addKeyword} className="px-3 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                        추가
                    </button>
                </div>
            </div>

            {/* Brand Story */}
            <div className="border border-neutral-200 bg-white p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-neutral-900" />
                    <h3 className="text-sm font-semibold">브랜드 스토리</h3>
                </div>
                <p className="text-xs text-neutral-400 mb-3">나는 어떤 사람인가? 어떤 가치를 전달하고 싶은가?</p>
                <textarea
                    value={story}
                    onChange={e => setStory(e.target.value)}
                    onBlur={() => saveBrandingToDb()}
                    rows={5}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400 resize-none"
                />
                <p className="text-xs text-neutral-400 mt-1 text-right">{story.length}자</p>
            </div>

            {/* Portfolio Highlights */}
            <div className="border border-neutral-200 bg-white p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                    <FolderOpen className="h-4 w-4 text-neutral-900" />
                    <h3 className="text-sm font-semibold">포트폴리오 하이라이트</h3>
                </div>
                <p className="text-xs text-neutral-400 mb-4">대표 프로젝트 3개를 공개합니다.</p>
                <div className="grid grid-cols-1 gap-3">
                    {mockProjects.map(p => (
                        <div key={p.id} className="border border-neutral-100 p-4 hover:border-neutral-300 transition-colors">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold mb-0.5">{p.name}</h4>
                                    <p className="text-xs text-neutral-400 mb-2">{p.role} / {p.period}</p>
                                    <p className="text-xs text-neutral-500">{p.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Public Toggle */}
            <div className="border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isPublic ? <Eye className="h-4 w-4 text-neutral-900" /> : <EyeOff className="h-4 w-4 text-neutral-400" />}
                        <div>
                            <h3 className="text-sm font-semibold">브랜드 프로필 공개</h3>
                            <p className="text-xs text-neutral-400">
                                {isPublic ? "프로필이 공개 상태입니다. 외부에서 확인할 수 있습니다." : "프로필이 비공개 상태입니다."}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsPublic(prev => { const next = !prev; if (user?.id) heroDb.upsertCareerProfile(user.id, { brand_keywords: keywords, brand_story: story, is_public: next }).catch(() => {}); return next; })}
                        className={clsx(
                            "relative w-12 h-6 rounded-full transition-colors",
                            isPublic ? "bg-neutral-900" : "bg-neutral-300"
                        )}
                    >
                        <div className={clsx(
                            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                            isPublic ? "translate-x-6" : "translate-x-0.5"
                        )} />
                    </button>
                </div>
            </div>
        </div>
    );
}
