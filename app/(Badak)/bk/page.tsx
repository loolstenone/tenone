"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

/* ── Mock 데이터 ── */

const universeWarpBrands = [
    { name: "MAD League", color: "#E53935", href: "https://madleague.net" },
    { name: "HeRo", color: "#E53935", href: "/bk/hero" },
    { name: "FWN", color: "#171717", href: "https://fwn.co.kr" },
    { name: "RooK", color: "#171717", href: "https://rook.co.kr" },
    { name: "공감자", color: "#F5C518", href: "https://0gamja.com" },
    { name: "TenOne", color: "#171717", href: "https://tenone.biz" },
];

const jobPostings = [
    "[한컴] 광고 기획 AE 4년차 이상 경력직 채용",
    "CRM 마케터(신입~2년 이하) 모집",
    "퍼포먼스/그로스 마케터 구인",
    "글로벌 광고대행사 Sr. Account Manager / 광고기획자 시니어",
    "[종합광고대행사] 2D 디자이너 채용",
    "[종합광고대행사] 디지털 마케팅 AE 신입 및 경력 채용",
    "하바스코리아 Media Manager",
    "하바스코리아 Media Planner",
];

const badakNowPosts = [
    { title: "챗GPT 겁대기만 씌운 K-스타트업들 현재 초비상 걸린 이유?", source: "s-valueup", excerpt: "챗GPT 겁대기만 씌운 K-스타트업들 현재 초비상 걸린 이유?구글이 무려 29억 원의 투자금을 걸고 진행한 AI 스타트업 육성 프로그램에서 충격적인 결과가 나왔습니다..." },
    { title: "2026 서울시 자영업자 안심통장 신청 방법 및 조건은? (최대 1천만 원)", source: "s-valueup", excerpt: "최대 1천만 원!고금리 시대에 사업 운영하시느라 고생 많으신 사장님들을 위한 역대급 소식을 전해드립니다..." },
    { title: "스타트업 경영권 방어, 벤처기업 특례 '복수의결권' 도입과 복수의결권주식 공시 방법은?", source: "s-valueup", excerpt: "스타트업 경영권 방어, 벤처기업 특례 '복수의결권' 도입과 복수의결권주식 공시 방법은?..." },
    { title: "2026 중소·벤처기업 M&A (기업가치평가, 실사, PMI)", source: "s-valueup", excerpt: "2026 중소·벤처기업 M&A (기업가치평가, 실사, PMI)중소·벤처기업 M&A를 검토 중인데, 어디서부터 비용이 들고 어떤 지원을 받을..." },
    { title: "2025 스타트업이 알아야 할 기업공시, 상장(IPO) 전 체크리스트는 뭘까?", source: "s-valueup", excerpt: "상장 스타트업 대표님, 혹시 최근 스톡옵션을 발행하셨거나 크라우드펀딩을 진행하셨나요?..." },
];

const badakPickPosts = [
    { title: "2026년 플래너'스 플래너 3종 출시", image: "planner" },
    { title: "[한컴] 광고 기획 AE 4년차 이상 경력직 채용", image: "job" },
];

const shopProducts = [
    { name: "2026 플래너'스 플래너 주간 (가로형)", price: "무료", tags: ["BEST", "MD"] },
    { name: "2026 플래너'스 플래너 연간 (가로형)", price: "무료", tags: ["BEST", "MD"] },
    { name: "2026 플래너'스 플래너 All in One", price: "무료", tags: ["BEST", "MD"] },
];

const jakkaAuthors = [
    { name: "[추천 작가] 김승은" },
    { name: "[추천 작가] 김종혁" },
    { name: "[추천 작가] 일러스트레이터 이효성" },
    { name: "[추천 작가] 종이컵 작가 김수민" },
    { name: "[추천 작가] bigg_jun" },
];

const bacademyPosts = [
    "[한경닷컴] 프로젝트 기반 UX/UI 디자인 실전캠프5기...",
    "AI로 만드는 MINI 전기차 배지 디자인 공모전",
    "[랜덤코리아] 2026 가스비 숏폼 영상 공모전 (~4/26)",
    "제22회 가구리빙디자인공모전(22nd GaGu Living D...",
    "2026 영스타즈 경진대회 (Young Stars MAD Compe...",
    "[재직자교육] 솔트룩스 반복 없는 AI 영업 실무 - AI 생...",
    "[재직자교육] 솔트룩스 AI 활용 영업 실무 과정 - 불황...",
];

const referencePosts = [
    { title: "일상에서 얻은 영감으로 그린 건축 조감도" },
    { title: "시간 멈춤" },
    { title: "뭔가 착착 위기를 모면 하는" },
    { title: "인공지능이 그린 자동차 브랜드 이미지" },
];

/* ── 컴포넌트 ── */

export default function BadakHome() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div>
            {/* ── Hero Section ── */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-neutral-500 text-sm mb-6">약한 연결 고리가 만드는 강력한 기회</p>
                    <h1 className="text-7xl md:text-9xl font-black text-neutral-900 mb-10 tracking-tight">
                        Badak
                    </h1>

                    {/* Search */}
                    <div className="max-w-lg mx-auto flex border border-neutral-300 rounded overflow-hidden">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-3 text-sm focus:outline-none"
                        />
                        <button className="px-4 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors">
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Featured Banner ── */}
            <section className="px-6 pb-10">
                <div className="mx-auto max-w-3xl">
                    <div className="aspect-[16/9] bg-gradient-to-br from-neutral-200 to-neutral-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <div className="text-center p-8">
                            <div className="w-64 h-40 mx-auto bg-neutral-300/50 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-4xl">📋</span>
                            </div>
                            <p className="text-neutral-500 text-sm">플래너 이미지</p>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-neutral-700">2026년 플래너&apos;스 플래너 3종 출시</p>
                </div>
            </section>

            {/* ── Universe Warp ── */}
            <section className="py-8 px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-sm font-semibold text-neutral-700 mb-4 underline underline-offset-4">Universe Warp</h2>
                    <div className="flex items-center justify-center gap-6 flex-wrap">
                        {universeWarpBrands.map((brand) => (
                            <Link
                                key={brand.name}
                                href={brand.href}
                                className="w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-bold border border-neutral-200 hover:scale-110 transition-transform"
                                style={{ backgroundColor: brand.color === "#171717" ? "#171717" : brand.color, color: "#fff" }}
                            >
                                {brand.name.substring(0, 3)}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Job Postings (간단 리스트) ── */}
            <section className="py-6 px-6">
                <div className="mx-auto max-w-3xl space-y-2">
                    {jobPostings.slice(0, 4).map((job, i) => (
                        <Link key={i} href="/bk/hero" className="block text-sm text-neutral-700 hover:text-neutral-900 transition-colors py-1">
                            {job}
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── 커뮤니티 메시지 ── */}
            <section className="py-10 px-6 text-center">
                <p className="text-neutral-500 text-sm">오랜만이야! 바닥 춥다고 했잖아! ㅎㅎㅎ</p>
                <ChevronDown className="mx-auto mt-2 h-5 w-5 text-neutral-300" />
            </section>

            {/* ── 구분선 ── */}
            <div className="mx-auto max-w-5xl border-t border-neutral-200" />

            {/* ── Badak Pick + Badak Now ── */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Badak Pick */}
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Badak Pick</h2>
                        <div className="space-y-6">
                            {badakPickPosts.map((post, i) => (
                                <Link key={i} href="/bk/contents" className="block group">
                                    <div className="aspect-[4/3] bg-neutral-100 rounded-lg flex items-center justify-center mb-3">
                                        <span className="text-5xl">{post.image === "planner" ? "📋" : "💼"}</span>
                                    </div>
                                    <p className="text-sm font-medium text-neutral-800 group-hover:text-neutral-900">{post.title}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Badak Now */}
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Badak Now</h2>
                        <div className="border-t border-neutral-900 pt-4 space-y-0">
                            {badakNowPosts.map((post, i) => (
                                <Link key={i} href="/bk/contents" className="block py-4 border-b border-neutral-200 group">
                                    <h3 className="font-bold text-sm text-neutral-900 group-hover:text-blue-600 transition-colors mb-1">
                                        {post.title}
                                    </h3>
                                    <p className="text-xs text-neutral-500 line-clamp-2 mb-1">{post.excerpt}</p>
                                    <span className="text-xs text-neutral-400">{post.source}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 구분선 ── */}
            <div className="mx-auto max-w-5xl border-t border-neutral-200" />

            {/* ── 바닥 상회 Hot / New ── */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">바닥 상회 Hot</h2>
                    <div className="border-t border-neutral-900 pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {shopProducts.map((product, i) => (
                                <Link key={i} href="/bk/shop" className="block group">
                                    <div className="aspect-[4/3] bg-neutral-100 rounded-lg flex items-center justify-center mb-3">
                                        <span className="text-4xl">🗓️</span>
                                    </div>
                                    <p className="text-sm font-medium text-neutral-800">{product.name}</p>
                                    <p className="text-sm text-blue-600 font-semibold">{product.price}</p>
                                    <div className="flex gap-1 mt-1">
                                        {product.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className={`text-[10px] px-1.5 py-0.5 border rounded ${tag === "BEST" ? "border-red-500 text-red-500" : "border-neutral-400 text-neutral-500"}`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-neutral-900 mt-12 mb-2">바닥 상회 New</h2>
                    <div className="border-t border-neutral-900 pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {shopProducts.map((product, i) => (
                                <Link key={i} href="/bk/shop" className="block group">
                                    <div className="aspect-[4/3] bg-neutral-100 rounded-lg flex items-center justify-center mb-3">
                                        <span className="text-4xl">🗓️</span>
                                    </div>
                                    <p className="text-sm font-medium text-neutral-800">{product.name}</p>
                                    <p className="text-sm text-blue-600 font-semibold">{product.price}</p>
                                    <div className="flex gap-1 mt-1">
                                        {product.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className={`text-[10px] px-1.5 py-0.5 border rounded ${tag === "BEST" ? "border-red-500 text-red-500" : "border-neutral-400 text-neutral-500"}`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 구분선 ── */}
            <div className="mx-auto max-w-5xl border-t border-neutral-200" />

            {/* ── HeRo + Jakka ── */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* HeRo 캐릭터 영역 */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-32 h-32 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-5xl">🦸</span>
                        </div>
                        <p className="text-sm text-neutral-600 text-center italic">
                            We believe in<br />your talent
                        </p>
                    </div>

                    {/* HeRo 채용 공지 */}
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 mb-1">
                            HeRo <span className="text-sm font-normal text-neutral-500">(채용 공지)</span>
                        </h2>
                        <div className="border-t border-neutral-900 pt-3 space-y-0">
                            {jobPostings.map((job, i) => (
                                <Link key={i} href="/bk/hero" className="block text-sm text-neutral-700 hover:text-neutral-900 py-2 border-b border-neutral-100 transition-colors">
                                    {job}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Jakka (작가 추천) */}
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 mb-1">
                            Jakka <span className="text-sm font-normal text-neutral-500">(작가 추천)</span>
                        </h2>
                        <div className="border-t border-neutral-900 pt-3">
                            <div className="grid grid-cols-2 gap-3">
                                {jakkaAuthors.map((author, i) => (
                                    <Link key={i} href="/bk/contents" className="block group">
                                        <div className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center mb-1">
                                            <span className="text-3xl">🎨</span>
                                        </div>
                                        <p className="text-xs text-neutral-600 line-clamp-1">{author.name}</p>
                                    </Link>
                                ))}
                                <Link href="/bk/contents" className="block group">
                                    <div className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center mb-1">
                                        <span className="text-3xl">📸</span>
                                    </div>
                                    <p className="text-xs text-neutral-600">단편만화</p>
                                </Link>
                                <Link href="/bk/contents" className="block group">
                                    <div className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center mb-1">
                                        <span className="text-3xl">📷</span>
                                    </div>
                                    <p className="text-xs text-neutral-600">사진 그림</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 구분선 ── */}
            <div className="mx-auto max-w-5xl border-t border-neutral-200" />

            {/* ── 바카데미 + 레퍼런스 창고 ── */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* 바카데미 */}
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 mb-1">
                            바카데미 <span className="text-sm font-normal text-neutral-500">(교육, 세미나)</span>
                        </h2>
                        <div className="border-t border-neutral-900 pt-3 space-y-0">
                            {bacademyPosts.map((post, i) => (
                                <Link key={i} href="/bk/bacademy" className="block text-sm text-neutral-700 hover:text-neutral-900 py-2 border-b border-neutral-100 transition-colors">
                                    {post}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 레퍼런스 창고 */}
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 mb-1">레퍼런스 창고</h2>
                        <div className="border-t border-neutral-900 pt-3">
                            <div className="grid grid-cols-2 gap-3">
                                {referencePosts.map((post, i) => (
                                    <Link key={i} href="/bk/contents" className="block group">
                                        <div className="aspect-[4/3] bg-neutral-100 rounded-lg flex items-center justify-center mb-1">
                                            <span className="text-3xl">{["🏛️", "⏸️", "🎯", "🚗"][i]}</span>
                                        </div>
                                        <p className="text-xs text-neutral-600 line-clamp-2">{post.title}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
