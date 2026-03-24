"use client";

import { MapPin, Camera, Clock, Mail, Phone, MessageCircle } from "lucide-react";

const galleryImages = [
    { id: 1, alt: "문래동 철공소 골목", color: "bg-neutral-700" },
    { id: 2, alt: "문래 창작촌 벽화", color: "bg-neutral-600" },
    { id: 3, alt: "철공소와 카페", color: "bg-neutral-500" },
    { id: 4, alt: "문래동 야경", color: "bg-neutral-800" },
    { id: 5, alt: "작업하는 예술가", color: "bg-neutral-600" },
    { id: 6, alt: "레트로 감성 골목", color: "bg-neutral-700" },
];

const timelineEvents = [
    {
        era: "1930년대",
        title: "방직공장의 시대",
        desc: "일본인들이 세운 방직공장이 자리잡던 시절. '문래'라는 이름은 실을 짓는 '물레'에서 변형되었다는 설이 있다.",
    },
    {
        era: "1970년대",
        title: "철공소의 전성기",
        desc: "기계 부품 생산의 호황기. 좁은 골목마다 쇠를 두드리는 소리가 울려 퍼지던 시절.",
    },
    {
        era: "1990년대 말",
        title: "쇠락의 시작",
        desc: "중국산 저가 부품의 유입으로 철공소들이 하나둘 문을 닫기 시작했다.",
    },
    {
        era: "2000년대",
        title: "예술가들의 유입",
        desc: "저렴한 임대료에 이끌린 예술인들이 빈 철공소에 작업실을 차리며 '문래 창작촌'이 형성되었다.",
    },
    {
        era: "현재",
        title: "공존과 변화",
        desc: "녹이 슨 철공소 옆에 예술가의 공방과 레트로 감성의 카페가 공존한다. 천천히 걸어 다니며 숨은 작품 찾기를 해보는 것을 추천한다.",
    },
];

export default function MullaesianHome() {
    return (
        <div>
            {/* ── 히어로 섹션 ── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#007BBF]/5 to-white" />
                <div className="relative mx-auto max-w-4xl px-6 py-20 md:py-32 text-center">
                    <p className="text-[#007BBF] text-sm font-semibold tracking-widest uppercase mb-4">
                        Mullaesian Project
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 leading-tight mb-8">
                        작은 철공소, 골목<br className="hidden md:block" /> 그리고 가난한 예술가들
                    </h1>
                    <div className="max-w-2xl mx-auto text-left space-y-6 text-neutral-700 leading-relaxed">
                        <p>
                            문래 창작촌은 어느 때부터인가 예술가들보다 술집, 카페들이 들어오는 속도가 더 빨라졌다.
                            골목에서 쇠를 두드리는 소리 대신 커피 내리는 소리가 들리기 시작한 것도 꽤 되었다.
                        </p>
                        <p>
                            이 동네에 산 지 18년.
                            변화하는 이 거리를 그저 바라보기만 하는 것이 아쉬워,
                            기록하고 나누기로 했다.
                        </p>
                        <p>
                            <strong className="text-[#007BBF]">문래지앙(Mullaesian)</strong>은 문래동 주민의 시선으로
                            이 동네의 과거와 현재, 그리고 사라져가는 것들을 기록하는 개인 프로젝트이다.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── 뚜르 드 문래 (Tour de Mullae) ── */}
            <section id="tour" className="py-20 px-6 bg-[#007BBF]/5 scroll-mt-16">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 text-[#007BBF] mb-4">
                            <MapPin className="h-5 w-5" />
                            <span className="text-sm font-semibold tracking-widest uppercase">Tour de Mullae</span>
                        </div>
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                            뚜르 드 문래
                        </h2>
                        <p className="text-neutral-600 max-w-xl mx-auto">
                            문래동으로 와요. 철공소 골목 사이사이에 숨겨진 이야기를 찾아
                            함께 걸어보는 로컬 투어를 제안합니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-8 border border-neutral-200 hover:border-[#007BBF]/30 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#007BBF]/10 flex items-center justify-center mb-4">
                                <MapPin className="h-6 w-6 text-[#007BBF]" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">골목 산책</h3>
                            <p className="text-sm text-neutral-600 leading-relaxed">
                                철공소와 예술가 공방이 공존하는 독특한 골목길을 천천히 걸어봅니다.
                                발길 닿는 대로 숨은 작품을 찾아보세요.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border border-neutral-200 hover:border-[#007BBF]/30 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#007BBF]/10 flex items-center justify-center mb-4">
                                <Camera className="h-6 w-6 text-[#007BBF]" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">포토 스팟</h3>
                            <p className="text-sm text-neutral-600 leading-relaxed">
                                녹슨 철과 생동하는 벽화가 만드는 독특한 풍경.
                                레트로 감성이 가득한 문래동만의 포토 스팟을 소개합니다.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border border-neutral-200 hover:border-[#007BBF]/30 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#007BBF]/10 flex items-center justify-center mb-4">
                                <Clock className="h-6 w-6 text-[#007BBF]" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">시간 여행</h3>
                            <p className="text-sm text-neutral-600 leading-relaxed">
                                1930년대 방직공장부터 현재의 창작촌까지.
                                한 걸음마다 다른 시대를 만나는 시간 여행을 떠나보세요.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 갤러리 문래 (Gallery Mullae) ── */}
            <section id="gallery" className="py-20 px-6 scroll-mt-16">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 text-[#007BBF] mb-4">
                            <Camera className="h-5 w-5" />
                            <span className="text-sm font-semibold tracking-widest uppercase">Gallery Mullae</span>
                        </div>
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                            갤러리 문래
                        </h2>
                        <p className="text-neutral-600 max-w-xl mx-auto">
                            문래동의 풍경을 담은 사진 갤러리. 철과 예술이 만나는 순간들.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {galleryImages.map((img) => (
                            <div
                                key={img.id}
                                className={`${img.color} aspect-[4/3] rounded-xl flex items-center justify-center group cursor-pointer hover:opacity-80 transition-opacity relative overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Camera className="h-8 w-8 text-neutral-400" />
                                <span className="absolute bottom-3 left-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    {img.alt}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-neutral-400 mt-6">
                        * 실제 사진은 준비 중입니다
                    </p>
                </div>
            </section>

            {/* ── 문래 꼬뮨 (Mullae Commune) ── */}
            <section id="commune" className="py-20 px-6 bg-neutral-50 scroll-mt-16">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center mb-10 md:mb-16">
                        <div className="inline-flex items-center gap-2 text-[#007BBF] mb-4">
                            <Clock className="h-5 w-5" />
                            <span className="text-sm font-semibold tracking-widest uppercase">Mullae Commune</span>
                        </div>
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                            문래 꼬뮨
                        </h2>
                        <p className="text-neutral-600 max-w-xl mx-auto">
                            방직공장에서 철공소로, 철공소에서 창작촌으로.
                            문래동의 역사를 따라가봅니다.
                        </p>
                    </div>

                    {/* 타임라인 */}
                    <div className="relative">
                        {/* 중앙 라인 */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[#007BBF]/20 -translate-x-1/2" />

                        <div className="space-y-12">
                            {timelineEvents.map((event, idx) => (
                                <div
                                    key={idx}
                                    className={`relative flex items-start gap-8 ${
                                        idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                    }`}
                                >
                                    {/* 도트 */}
                                    <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-[#007BBF] border-4 border-white -translate-x-1/2 mt-1.5 z-10 shadow-sm" />

                                    {/* 콘텐츠 */}
                                    <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${idx % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                                        <span className="inline-block text-[#007BBF] text-sm font-bold mb-1">
                                            {event.era}
                                        </span>
                                        <h3 className="text-lg font-bold text-neutral-900 mb-2">
                                            {event.title}
                                        </h3>
                                        <p className="text-sm text-neutral-600 leading-relaxed">
                                            {event.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Contact 섹션 ── */}
            <section className="py-16 px-6 border-t border-neutral-200">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Contact</h2>
                    <p className="text-neutral-600 mb-8">문래지앙 프로젝트에 관심이 있으시다면 연락 주세요.</p>
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-neutral-600">
                        <a href="mailto:lools@tenone.biz" className="inline-flex items-center gap-2 hover:text-[#007BBF] transition-colors">
                            <Mail className="h-4 w-4" />
                            lools@tenone.biz
                        </a>
                        <span className="inline-flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            +82 10 2795 1001
                        </span>
                        <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[#007BBF] transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            카카오톡 오픈채팅
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
