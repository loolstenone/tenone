"use client";

import Link from "next/link";

const subNav = [
    { name: "교육/세미나 정보", href: "/bk/bacademy" },
    { name: "공모전 정보", href: "/bk/bacademy/contest" },
];

const contests = [
    "AI로 만드는 MINI 전기차 배지 디자인 공모전",
    "제22회 가구리빙디자인공모전(22nd GaGu Living Design Award)",
    "2026 영스타즈 경진대회 (Young Stars MAD Competition)",
    "2026년 상반기를 함께할 고구마팜 에디터를 모집합...",
    "[부산시] 제11회 전국 창업 아이디어 경진대회 (~7/24...)",
    "[마감 임박] 제1회 공공일터 노동자 사진 공모",
    "[추천 공모전]제1회 공공일터 노동자 사진 공모",
    "[한화생명 주최] LIFEPLUS Creator Campus 모집",
    "2025 뉴스타즈 경진대회 (New Stars MAD Competition...)",
    "2025 영스타즈 경진대회 (Young Stars MAD Compe...)",
];

const seminars = [
    "[한경닷컴] 프로젝트 기반 UX/UI 디자인 실전캠프5기...",
    "[랜덤코리아] 2026 가스비 숏폼 영상 공모전 (~4/26)",
    "[재직자교육] 솔트룩스 반복 없는 AI 영업 실무 - AI 생...",
    "[재직자교육] 솔트룩스 AI 활용 영업 실무 과정 - 불황...",
    "[두산로보틱스] 로키부트캠프 AI·로봇 엔지니어 양성...",
    "현대자동차 H-모빌리티 클래스 교육생 모집 (3/3 (화) ...",
    "[BMW 코리아 미래재단] 영 이노베이터 드림 프로젝...",
    "[한국정보산업연합회] 26년 한이음 드림업 AI·ICT 실...",
    "[과학기술정보통신부/정보통신산업진흥원,한국전파...",
    "[쥬비스다이어트] 2026 쥬비스다이어트 ADD 숏폼 ...",
];

const courses = [
    { name: "온라인 동영상", href: "#" },
    { name: "소셜 미디어 마케팅", href: "#" },
    { name: "퍼포먼스 마케팅", href: "#" },
    { name: "브랜딩", href: "#" },
    { name: "콘텐츠 마케팅", href: "#" },
    { name: "CRM/데이터", href: "#" },
];

export default function BacademyPage() {
    return (
        <div>
            {/* Sub Navigation */}
            <div className="border-b border-neutral-200 bg-white">
                <div className="mx-auto max-w-5xl px-6 flex items-center gap-6 py-3">
                    {subNav.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Banner */}
            <section className="py-8 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="bg-[#1a1a2e] rounded-xl p-8 text-white">
                        <p className="text-sm text-neutral-300 mb-2">너의 이력서는....</p>
                        <p className="text-sm text-neutral-300">좋은 회사가 나타나면 지금 당장 면접 갈 수 있어?</p>
                    </div>
                </div>
            </section>

            {/* Contest + Seminar */}
            <section className="py-8 px-6">
                <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
                    {/* 공모전 정보 */}
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 mb-4">공모전 정보</h2>
                        <div className="border-t border-neutral-900 pt-2 space-y-0">
                            {contests.map((item, i) => (
                                <Link key={i} href="/bk/bacademy" className="block text-sm text-neutral-700 hover:text-neutral-900 py-2.5 border-b border-neutral-100 transition-colors">
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 교육/세미나 정보 */}
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 mb-4">교육/세미나 정보</h2>
                        <div className="border-t border-neutral-900 pt-2 space-y-0">
                            {seminars.map((item, i) => (
                                <Link key={i} href="/bk/bacademy" className="block text-sm text-neutral-700 hover:text-neutral-900 py-2.5 border-b border-neutral-100 transition-colors">
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 자세히 알아보기 */}
            <section className="py-10 px-6 bg-neutral-50">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-xl font-bold text-neutral-900 mb-6">자세히 알아보기</h2>
                    <div className="divide-y divide-neutral-200 bg-white rounded-xl overflow-hidden">
                        {courses.map((course) => (
                            <Link
                                key={course.name}
                                href={course.href}
                                className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
                            >
                                <span className="text-sm font-medium text-neutral-700">{course.name}</span>
                                <span className="text-neutral-400">&rsaquo;</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
