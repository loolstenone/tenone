"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { CheckCircle2, ArrowRight, FolderKanban, Target, Users, Sparkles } from "lucide-react";

const interests = [
    "기획/전략", "마케팅", "광고", "디자인", "영상/콘텐츠",
    "AI/개발", "커뮤니티 운영", "브랜딩", "데이터 분석", "기타",
];

const clubs = [
    { id: "madleap", name: "MADLeap", region: "서울·경기" },
    { id: "pam", name: "PAM", region: "부산·경남" },
    { id: "adlle", name: "ADlle", region: "대구·경북" },
    { id: "abc", name: "ABC", region: "광주·전남" },
    { id: "suzak", name: "SUZAK", region: "제주" },
    { id: "pad", name: "P:ad", region: "한림대" },
    { id: "adzone", name: "AD Zone", region: "고려대 세종" },
];

export default function ApplyPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [type, setType] = useState<"student" | "professional">("student");
    const [club, setClub] = useState("");
    const [company, setCompany] = useState("");
    const [position, setPosition] = useState("");
    const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const toggleInterest = (item: string) => {
        setSelectedInterests(prev => {
            const next = new Set(prev);
            next.has(item) ? next.delete(item) : next.add(item);
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <CheckCircle2 className="h-16 w-16 text-neutral-900 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold mb-3">초대장이 곧 도착합니다</h1>
                    <p className="text-sm text-neutral-500 mb-2">
                        지원서를 검토한 후 초대 링크를 이메일로 보내드립니다.
                    </p>
                    <p className="text-xs text-neutral-400 mb-8">
                        일반적으로 3~5영업일 내에 회신합니다.
                    </p>
                    <Link href="/" className="px-6 py-2.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors inline-block">
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <PublicHeader />
            {/* 초대장 헤더 */}
            <div className="bg-neutral-900 text-white py-20 px-6 mt-16">
                <div className="max-w-3xl mx-auto text-center">
                    <Link href="/" className="inline-block mb-8">
                        <Image src="/logo-horizontal.png" alt="TEN ONE" width={100} height={34} className="invert" />
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="h-4 w-4 text-neutral-500" />
                        <p className="text-xs tracking-[0.3em] text-neutral-500 uppercase">Invitation</p>
                        <Sparkles className="h-4 w-4 text-neutral-500" />
                    </div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight mb-4">
                        당신을 Ten:One™ Universe로<br />초대합니다.
                    </h1>
                    <p className="text-sm text-neutral-500 leading-relaxed max-w-lg mx-auto mb-3">
                        기막힌 우연을 가진 특별한 사람에게만 보내는 초대장입니다.
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed max-w-lg mx-auto">
                        우리는 기업과 사회의 문제를 해결하는 다양한 프로젝트를 합니다.<br />
                        함께할 동료를 찾고 있습니다.
                    </p>
                </div>
            </div>

            {/* 혜택 */}
            <div className="max-w-3xl mx-auto px-6 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white border border-neutral-200 p-5 text-center shadow-sm">
                        <FolderKanban className="h-5 w-5 text-neutral-400 mx-auto mb-2" />
                        <p className="text-xs font-bold">실전 프로젝트</p>
                        <p className="text-[10px] text-neutral-400 mt-1">기업·지자체 프로젝트 참여</p>
                    </div>
                    <div className="bg-white border border-neutral-200 p-5 text-center shadow-sm">
                        <Target className="h-5 w-5 text-neutral-400 mx-auto mb-2" />
                        <p className="text-xs font-bold">HeRo 역량 진단</p>
                        <p className="text-[10px] text-neutral-400 mt-1">HIT 검사 + 성장 로드맵</p>
                    </div>
                    <div className="bg-white border border-neutral-200 p-5 text-center shadow-sm">
                        <Users className="h-5 w-5 text-neutral-400 mx-auto mb-2" />
                        <p className="text-xs font-bold">네트워크 연결</p>
                        <p className="text-[10px] text-neutral-400 mt-1">현업자 & 기업 파트너</p>
                    </div>
                </div>
            </div>

            {/* 지원 폼 */}
            <div className="max-w-3xl mx-auto px-6 py-12">
                <form onSubmit={handleSubmit} className="border border-neutral-200 p-8">
                    <h2 className="text-lg font-bold mb-1">지원 신청</h2>
                    <p className="text-xs text-neutral-400 mb-1">검토 후 초대 링크를 이메일로 보내드립니다.</p>
                    <p className="text-[10px] text-neutral-300 mb-8"><span className="text-red-400">*</span> 표시는 필수 입력 항목입니다.</p>

                    {/* 기본 정보 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">이름 *</label>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동"
                                className="w-full px-4 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">이메일 *</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
                                className="w-full px-4 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300" />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-xs font-medium text-neutral-600 mb-1">연락처</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000"
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300" />
                    </div>

                    {/* 소속 구분 */}
                    <div className="mb-6">
                        <label className="block text-xs font-medium text-neutral-600 mb-2">소속 *</label>
                        <div className="flex gap-3 mb-3">
                            <button type="button" onClick={() => setType("student")}
                                className={`flex-1 py-3 text-sm border transition-colors ${type === "student" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 hover:border-neutral-400"}`}>
                                <span className="font-bold">대학생 / 동아리</span>
                                <p className="text-[10px] mt-0.5 opacity-70">MADLeague 동아리 또는 대학생</p>
                            </button>
                            <button type="button" onClick={() => setType("professional")}
                                className={`flex-1 py-3 text-sm border transition-colors ${type === "professional" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 hover:border-neutral-400"}`}>
                                <span className="font-bold">현업자 / 프리랜서</span>
                                <p className="text-[10px] mt-0.5 opacity-70">마케팅·광고·크리에이티브 업계</p>
                            </button>
                        </div>

                        {type === "student" && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[10px] text-neutral-400 mb-1">소속 동아리 (해당 시)</label>
                                    <select value={club} onChange={e => setClub(e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white">
                                        <option value="">선택 안 함</option>
                                        {clubs.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                        <option value="other">기타 동아리</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-neutral-400 mb-1">기수</label>
                                    <input type="number" value={position} onChange={e => setPosition(e.target.value)} placeholder="5" min={1}
                                        className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-neutral-400 mb-1">역할</label>
                                    <select value={company} onChange={e => setCompany(e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white">
                                        <option value="">선택</option>
                                        <option value="회장">회장</option>
                                        <option value="부회장">부회장</option>
                                        <option value="총무">총무</option>
                                        <option value="팀장">팀장</option>
                                        <option value="팀원">팀원</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {type === "professional" && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] text-neutral-400 mb-1">회사 / 소속</label>
                                    <input value={company} onChange={e => setCompany(e.target.value)} placeholder="회사명 또는 프리랜서"
                                        className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-neutral-400 mb-1">직무 / 직책</label>
                                    <input value={position} onChange={e => setPosition(e.target.value)} placeholder="마케터, 디자이너 등"
                                        className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 관심 분야 */}
                    <div className="mb-6">
                        <label className="block text-xs font-medium text-neutral-600 mb-2">관심 분야 (복수 선택)</label>
                        <div className="flex flex-wrap gap-2">
                            {interests.map(item => (
                                <button key={item} type="button" onClick={() => toggleInterest(item)}
                                    className={`px-3 py-1.5 text-xs border transition-colors ${selectedInterests.has(item) ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 hover:border-neutral-400"}`}>
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 하고 싶은 말 */}
                    <div className="mb-8">
                        <label className="block text-xs font-medium text-neutral-600 mb-1">하고 싶은 말</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)}
                            placeholder="자기소개, 참여 동기, 관심 프로젝트 등 자유롭게 적어주세요"
                            rows={4} className="w-full px-4 py-2.5 text-sm border border-neutral-200 resize-none focus:outline-none focus:border-neutral-400 placeholder:text-neutral-300" />
                    </div>

                    <button type="submit" disabled={!name.trim() || !email.trim()}
                        className="w-full py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        지원서 제출 <ArrowRight className="h-4 w-4" />
                    </button>

                    <p className="text-[10px] text-neutral-400 text-center mt-4">
                        검토 후 초대 링크를 이메일로 보내드립니다 · 3~5영업일 소요
                    </p>
                </form>
            </div>
            <PublicFooter />
        </div>
    );
}
