"use client";

import Link from "next/link";
import { brands } from "@/lib/data";
import { useCms } from "@/lib/cms-context";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function HomePage() {
    const { getPublishedByChannel } = useCms();
    const latestNews = getPublishedByChannel('newsroom').slice(0, 4);
    const showcaseBrands = brands.filter(b => b.domain && b.id !== 'tenone');

    return (
        <div className="min-h-screen bg-white text-neutral-900">
            <PublicHeader />

            {/* Hero — 좌측 정렬, 비대칭 */}
            <section className="min-h-screen flex items-center px-6 lg:px-0">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="lg:pl-8">
                        <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-6">
                            Value Connector
                        </p>
                        <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-[1.1]">
                            가치로 연결된
                            <br />
                            <span className="font-bold">거대한 세계관</span>을
                            <br />
                            만들기로 했다.
                        </h1>
                        <p className="mt-8 text-base text-neutral-400 leading-relaxed">
                            인재를 발굴하고, 연결하고, 기업과 사회의 문제를 해결합니다.
                        </p>
                        <div className="mt-10 flex gap-4">
                            <Link href="/universe" className="group px-8 py-3.5 bg-neutral-900 text-white text-sm tracking-wide hover:bg-neutral-800 transition-colors flex items-center gap-2">
                                Explore Universe
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/about" className="px-8 py-3.5 border border-neutral-300 text-neutral-700 text-sm tracking-wide hover:border-neutral-900 hover:text-neutral-900 transition-colors">
                                Our Philosophy
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="aspect-[4/5] relative overflow-hidden">
                            <Image
                                src="/hero-banner.png"
                                alt="Ten:One Universe - 브랜드 네트워크 시각화"
                                fill
                                className="object-cover opacity-50"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values — 다크 섹션 */}
            <section className="bg-neutral-900 text-white py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-4">
                        Core Value
                    </p>
                    <h2 className="text-3xl md:text-4xl font-light">
                        변하지 않을 가치에 집중하여<br />
                        <span className="font-bold">빠르게 가치를 창출한다</span>
                    </h2>

                    <div className="mt-20 grid md:grid-cols-3 gap-px bg-neutral-800">
                        {[
                            { num: "01", symbol: "◆", title: "본질", en: "Essence", desc: "변하지 않을 가치에 집요하게 집중한다. 트렌드에 흔들리지 않는 근본적인 가치를 찾는다." },
                            { num: "02", symbol: "→", title: "속도", en: "Speed", desc: "옳은 방향을 계속 확인하며 빠르게 전진한다. 완벽을 기다리지 않고 움직인다." },
                            { num: "03", symbol: "■", title: "이행", en: "Carry Out", desc: "본질이 확인된다면 바로 실행에 옮긴다. 실현되지 않으면 아이디어가 아니다." },
                        ].map((val) => (
                            <div key={val.num} className="bg-neutral-900 p-10 md:p-12">
                                <span className="text-sm text-neutral-600 font-mono">{val.num}</span>
                                <h3 className="text-3xl font-bold mt-4"><span className="text-neutral-600 mr-2">{val.symbol}</span>{val.title}</h3>
                                <p className="text-sm text-neutral-500 mt-1">{val.en}</p>
                                <p className="text-sm text-neutral-400 mt-6 leading-relaxed">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Universe Brands — 화이트 섹션 */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-16">
                        <div>
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Universe
                            </p>
                            <h2 className="text-3xl md:text-4xl font-light">
                                하나의 생태계로 연결된 <span className="font-bold">브랜드들</span>
                            </h2>
                        </div>
                        <Link href="/works" className="hidden md:flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {showcaseBrands.map((brand) => (
                            <a key={brand.id} href={brand.websiteUrl} target="_blank" rel="noopener noreferrer"
                                className="group block border-b border-neutral-200 pb-6 hover:border-neutral-900 transition-colors">
                                <div className="aspect-[3/2] bg-neutral-50 mb-4 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-neutral-200">{brand.name.slice(0, 2)}</span>
                                </div>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-neutral-900">{brand.name}</h3>
                                        <p className="text-xs text-neutral-400 mt-1">{brand.domain}</p>
                                    </div>
                                    <ExternalLink className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-900 transition-colors mt-1" />
                                </div>
                                {brand.tagline && <p className="text-xs text-neutral-500 mt-2">{brand.tagline}</p>}
                            </a>
                        ))}
                    </div>

                    <Link href="/works" className="md:hidden flex items-center justify-center gap-2 mt-12 text-sm text-neutral-500 hover:text-neutral-900">
                        모든 브랜드 보기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* Latest — 이미지 카드, 라이트 그레이 배경 */}
            <section className="py-32 px-6 bg-neutral-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-16">
                        <div>
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                                Latest
                            </p>
                            <h2 className="text-3xl md:text-4xl font-light">
                                새로운 <span className="font-bold">소식</span>
                            </h2>
                        </div>
                        <Link href="/newsroom" className="hidden md:flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {latestNews.map((news) => (
                            <Link key={news.id} href="/newsroom" className="group block">
                                <div className="aspect-[4/3] bg-neutral-200 mb-4 flex items-center justify-center">
                                    <p className="text-xs text-neutral-400 text-center px-4">[{news.image || '이미지'}]</p>
                                </div>
                                <p className="text-xs text-neutral-400">{news.date}</p>
                                <h3 className="font-semibold text-neutral-900 mt-1 group-hover:underline">{news.title}</h3>
                                <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{news.summary}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA — 다크 섹션 */}
            <section className="bg-neutral-900 text-white py-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-light leading-tight">
                            Are you ready to build<br />
                            <span className="font-bold">the Next Universe?</span>
                        </h2>
                        <p className="mt-6 text-neutral-400 leading-relaxed">
                            당신의 작은 세계가 연결되어<br />
                            하나의 거대한 세계관을 만듭니다.
                        </p>
                        <div className="mt-10 flex gap-4">
                            <Link href="/contact" className="px-8 py-3.5 bg-white text-neutral-900 text-sm tracking-wide hover:bg-neutral-100 transition-colors">
                                Join the Universe
                            </Link>
                            <Link href="/universe" className="px-8 py-3.5 border border-neutral-600 text-neutral-300 text-sm tracking-wide hover:border-white hover:text-white transition-colors">
                                Explore
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="aspect-video bg-neutral-800 flex items-center justify-center">
                            <p className="text-sm text-neutral-600 text-center px-12 leading-relaxed">
                                [CTA 비주얼]<br />
                                팀 활동 사진, 네트워킹 이벤트,<br />
                                또는 브랜드 콜라주 이미지<br /><br />
                                <span className="text-xs text-neutral-700">권장: Badak 밋업, MAD League 활동 등<br />실제 활동 사진</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
