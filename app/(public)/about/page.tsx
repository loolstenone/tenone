import { Quote, Sparkles, Link as LinkIcon, Mail, MessageCircle, ArrowUpRight, History, Map as MapIcon, RotateCcw, Box, Network } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface HistoryItem {
    date: string;
    title: string;
    subtitle?: string;
    description: string[];
    link?: string;
    linkText?: string;
}

const HISTORY_DATA: HistoryItem[] = [
    {
        date: "2025. 08. 31",
        title: "LUKI",
        subtitle: "인공지능 4인조 여성 아이돌 - AI dol",
        description: [
            "'LUKI'는 파괴된 행성 '루미나'의 빛의 조각이 되어 지구에 불시착한 네 명의 소녀들로 이루어진 그룹입니다.",
            "하이틴 판타지와 SF를 결합한 독특한 콘셉트, 몽환적인 신스팝과 EDM 기반의 음악을 선보입니다."
        ],
        link: "https://youtube.com/@LUKI-AIdol",
        linkText: "Youtube Channel"
    },
    {
        date: "2025. 08. 29",
        title: "RooK",
        subtitle: "인공지능 크리에이터",
        description: [
            "\"길바닥에 동전은 먼저 줍는 사람이 임자.\"",
            "인공지능으로 다양한 창작 활동을 하는 사람들과 만나 보자는 생각에 인공지능 크리에이터 루크를 만들었습니다."
        ],
        link: "http://RooK.co.kr",
        linkText: "RooK.co.kr"
    },
    {
        date: "2025. 04. 03",
        title: "MADzine",
        subtitle: "MAD league Magazine",
        description: [
            "마케팅, 광고에 미친(MAD) 우리들의 이야기.",
            "형식도, 주기도 없는 새로운 마케팅/광고 매거진. 대학생들의 날것의 아이디어와 스토리를 담습니다."
        ],
        link: "#",
        linkText: "MADzine"
    },
    {
        date: "2025. 03. 31",
        title: "DAM Be",
        subtitle: "MAD League 캐릭터 개발",
        description: [
            "\"범 잡아 먹는 담비가 있다.\"",
            "최상위 포식자이자 영리한 한국의 노란목 담비를 MAD League의 캐릭터로 상징화했습니다."
        ],
        link: "http://MADLeague.net",
        linkText: "MADLeague.net"
    },
    {
        date: "2025. 01. 13",
        title: "제주 수작:SUZAK",
        subtitle: "매드리그 네트워크 합류",
        description: [
            "제주 지역 대학생 마케팅 광고 동아리 '수작'이 합류하며, 매드리그는 전국 5개 권역(서울경기, 대구경북, 부산경남, 광주전남, 제주) 네트워크를 완성했습니다."
        ]
    },
    {
        date: "2024. 11. 12",
        title: "광주전남 ABC",
        subtitle: "매드리그 네트워크 합류",
        description: [
            "조선대학교 마케팅 광고 동아리 'ABC'가 합류했습니다.",
            "혼자 꾸면 꿈이지만 함께 꾸면 미래가 될 것입니다."
        ]
    },
    {
        date: "2024. 09. 27",
        title: "MAD League X 지평주조",
        subtitle: "경쟁 PT 프로젝트",
        description: [
            "지평주조 탄생 100주년을 맞아 전국 막걸리 도약을 위한 마케팅 계획 경쟁 PT를 진행했습니다.",
            "전국 3개 연합 동아리가 실전 프로젝트로 실력을 겨루었습니다."
        ]
    },
    {
        date: "2024. 05. 18",
        title: "ChangeUp",
        subtitle: "인공지능 시대 인재 양성",
        description: [
            "기업가 정신을 가르치는 선생님들과 함께 학생들의 창업 아이디어를 실현하도록 돕는 프로그램을 시작했습니다."
        ],
        link: "http://ChangeUp.company",
        linkText: "ChangeUp.company"
    },
    {
        date: "2024. 02. 02",
        title: "대구경북 ADlle",
        subtitle: "매드리그 네트워크 합류",
        description: [
            "대구 경북 지역 대학생 연합 광고 동아리 ADlle이 합류했습니다.",
            "열정과 현실이 만나 꿈을 이루는 네트워크가 되도록 하겠습니다."
        ]
    },
    {
        date: "2024. 01. 17",
        title: "0gamja",
        subtitle: "하찮고 귀여운 감자들의 공감 이야기",
        description: [
            "인공지능 시대일수록 사람이어야만 하는 이유.",
            "'하찮지만 귀여운' 형태의 콘텐츠와 공감, 영감, young감의 가치를 부여한 캐릭터 브랜드입니다."
        ],
        link: "http://0gamja.com",
        linkText: "0gamja.com"
    },
    {
        date: "2023. 12. 08",
        title: "부산경남 PAM",
        subtitle: "매드리그 네트워크 합류",
        description: [
            "30년 전통의 부산 대학생 연합 광고 동아리 PAM이 합류했습니다."
        ]
    },
    {
        date: "2023. 11. 13",
        title: "Creazy Challenge",
        subtitle: "글로벌 광고제 도전 프로그램",
        description: [
            "국내 공모전을 넘어 전세계 5대 광고제를 무대로 도전할 수 있는 기회를 만듭니다."
        ],
        link: "http://MADLeague.net/Creazy",
        linkText: "Creazy Challenge"
    },
    {
        date: "2023. 11. 02",
        title: "DAM Party Season 3",
        subtitle: "네트워킹 파티",
        description: [
            "홍대 문화 전시 공간 '네버 마인드'에서 진행된 힙한 네트워킹 파티."
        ]
    },
    {
        date: "2023. 09. 25",
        title: "FWN",
        subtitle: "Fashion Week Network",
        description: [
            "전세계 패션 위크를 네트워킹하고 한국 브랜드의 세계 진출을 돕는 패션 산업의 나침반."
        ],
        link: "http://FWN.co.kr",
        linkText: "FWN.co.kr"
    },
    {
        date: "2023. 09. 09",
        title: "#StreetRunway",
        subtitle: "서울패션위크 하이재킹",
        description: [
            "서울패션위크 기간 동안 모두가 주인공이 되어 즐기는 축제의 장을 만들었습니다."
        ]
    },
    {
        date: "2023. 05. 15",
        title: "YouInOne",
        subtitle: "생각하는 유인원들의 프로젝트 그룹",
        description: [
            "사회와 기업의 고민을 해결하는 프로젝트 그룹. 소규모 기업 연합 얼라이언스로 연대합니다."
        ],
        link: "http://YouInOne.com",
        linkText: "YouInOne.com"
    },
    {
        date: "2023. 02. 02",
        title: "Chat with ChatGPT",
        subtitle: "Ask Human, Answer AI",
        description: [
            "인공지능에 대한 궁금증을 인간이 묻고 ChatGPT가 답하는 책을 출간했습니다."
        ]
    },
    {
        date: "2023. 01. 07",
        title: "유인원 인수 & DAM Party",
        subtitle: "새로운 시작",
        description: [
            "대학생 스타트업 '유인원' 인수와 현업-학생 네트워킹 파티 D.A.M의 시작."
        ]
    },
    {
        date: "2022. 07. 18",
        title: "MAD League",
        subtitle: "마케팅&광고 대학생 프로젝트 연합",
        description: [
            "실전 프로젝트를 통해 마케팅/광고 업계로 진출하고자 하는 학생들에게 기회를 제공합니다."
        ],
        link: "http://MADLeague.net",
        linkText: "MADLeague.net"
    },
    {
        date: "2021. 11",
        title: "MAD Leap",
        subtitle: "대학생 마케팅/광고 연합동아리 창단",
        description: [
            "열정과 현실이 만나는 곳. 바닥 커뮤니티를 운영하며 느낀 인재 양성의 필요성으로 창단했습니다."
        ]
    },
    {
        date: "2021. 02. 13",
        title: "Planners",
        subtitle: "누구나 기획자다",
        description: [
            "아이패드 굿노트 등에서 사용할 수 있는 플래너 템플릿 제작 및 배포."
        ]
    },
    {
        date: "2021. 02. 08",
        title: "Badak.biz",
        subtitle: "마케팅/광고 업계 네트워킹 커뮤니티",
        description: [
            "\"바닥 좁다고 했잖아.\" 업계 다양한 사람들을 만나고 이야기할 수 있는 커뮤니티."
        ],
        link: "http://badak.biz",
        linkText: "Badak.biz"
    },
    {
        date: "2020. 03. 11",
        title: "Ten:One™ Universe",
        subtitle: "세계관의 시작",
        description: [
            "\"어느날 꺼내 든 플래너에 적혀있는 수 많은 계획들.\"",
            "과거의 아이디어와 계획들을 세상에 꺼내 놓기로 결심하며 Ten:One™ 사이트를 오픈했습니다."
        ],
        link: "http://tenone.biz/universe",
        linkText: "Older Site"
    }
];

function TimelineItem({ item, isLast }: { item: HistoryItem, isLast: boolean }) {
    return (
        <div className="relative pl-8 md:pl-0">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800 transform -translate-x-1/2"></div>
            <div className={clsx("md:flex items-center justify-between group", isLast ? "" : "mb-16")}>
                <div className="md:w-[45%] md:text-right mb-4 md:mb-0">
                    <div className="md:hidden">
                        <span className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-indigo-400 text-sm font-bold mb-2">
                            {item.date}
                        </span>
                    </div>
                    <div className="hidden md:block">
                        <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{item.date}</h3>
                    </div>
                </div>
                <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-zinc-950 border-2 border-zinc-600 rounded-full transform md:-translate-x-1/2 translate-y-1.5 md:translate-y-0 group-hover:border-indigo-500 group-hover:bg-indigo-500 transition-all z-10"></div>
                <div className="md:w-[45%] md:text-left">
                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                        {item.title}
                    </h4>
                    {item.subtitle && (
                        <p className="text-sm text-indigo-400 mb-3 font-medium">{item.subtitle}</p>
                    )}
                    <div className="space-y-2 text-zinc-400 text-sm leading-relaxed mb-3">
                        {item.description.map((desc, i) => (
                            <p key={i}>{desc}</p>
                        ))}
                    </div>
                    {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">
                            {item.linkText || "Visit Link"} <ArrowUpRight className="h-3 w-3" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AboutPage() {
    return (
        <div className="bg-black text-white min-h-screen">
            {/* Hero Section */}
            <section className="relative py-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black"></div>
                <div className="relative z-10 max-w-3xl mx-auto space-y-8 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                        우연히 시계를 봤을 때<br />
                        <span className="text-indigo-400">10시 01분</span>일 확률은<br />
                        얼마나 될까?
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-zinc-500">
                        <span className="h-px w-8 bg-zinc-800"></span>
                        <span className="text-sm font-medium tracking-widest uppercase">Synchronicity</span>
                        <span className="h-px w-8 bg-zinc-800"></span>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 pb-24 space-y-24">

                {/* Welcome to Universe */}
                <section className="bg-gradient-to-br from-zinc-900/50 to-zinc-950 p-8 md:p-12 rounded-3xl border border-zinc-800/50">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Ten:One™ Multi-universe</h2>
                        <p className="text-zinc-400">멀티 유니버스의 탐험가 여러분, 환영합니다.</p>
                    </div>
                    <div className="space-y-6 text-zinc-300 leading-relaxed font-light text-center">
                        <p>
                            각 유니버스는 고유한 <strong>'본질(Essence)'</strong>을 가지고 있으며, 하나의 거대한 선순환 생태계로 연결되어 있습니다.
                        </p>
                        <p>
                            여행 중 발견한 아이디어나 기회는 빠르게 이행하고 현실로 만드는 것이 가장 중요합니다.<br />
                            우리는 서로의 경험과 지식에서 가치를 창출하는 네트워킹을 중시합니다.
                        </p>
                        <p className="text-lg text-white font-medium">
                            여러분은 단순한 관찰자에서<br />
                            멀티 유니버스의 활발한 참여자로 거듭날 것입니다.
                        </p>
                    </div>
                </section>

                {/* Intro */}
                <section className="space-y-6 text-lg text-zinc-300 leading-relaxed font-light text-center">
                    <p>
                        인과관계 없이 우연히 벌어진 일이지만<br />
                        그런 상황이 자주 일어 난다고 느끼거나<br />
                        특별하게 생각하는 심리를 <strong className="text-white font-medium">공시성(Synchronicity)</strong>이라고 합니다.
                    </p>
                    <p>
                        그냥 지나칠 수 있는 일들이 자꾸 눈에 뜨이고 의미를 부여 한다는 것은<br />
                        그만큼 관심이 많다는 것입니다.
                    </p>
                    <p className="text-xl text-white font-medium pt-4">
                        어쩌면, 우리는 지금 계획된 우연을 만들고 있는지도 모릅니다.
                    </p>
                </section>

                {/* The Realization */}
                <section className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800">
                    <Quote className="h-8 w-8 text-zinc-700 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-6">
                        "그 때 했던 것들을 지금까지 하고 있었다면?..."
                    </h3>
                    <div className="space-y-4 text-zinc-400">
                        <p>
                            PC통신 ID 'lools', 전화번호 끝자리 1001, 10월 1일...<br />
                            나를 나타내는 수많은 '10:01'의 우연들.
                        </p>
                        <p>
                            대학생 때부터 끄적였던 브랜드 공작소, 브랜드 타임즈 등 수많은 아이디어들.<br />
                            시간이 흘러 먼지 쌓인 기록들을 다시 보았을 때, 나의 관심사나 아이디어를 다시 모아 정리하자는 생각이 들었습니다.
                        </p>
                        <p className="pt-4 text-zinc-300 font-medium">
                            반복되는 우연은 그저 우연이 아니라<br />
                            마치 계획된 우연처럼 지금의 나를 만들었습니다.
                        </p>
                    </div>
                </section>

                {/* UNIVERSE PHILOSOPHY SECTIONS */}
                <section className="space-y-16 py-12">
                    <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
                        <Network className="h-8 w-8 text-indigo-500" />
                        <span>The Universe Manual</span>
                    </h2>

                    {/* Big Bang */}
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="order-2 md:order-1 space-y-4">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-500" /> Bigbang
                            </h3>
                            <p className="text-zinc-400 leading-relaxed">
                                머릿속에서 끊임없이 떠오르는 수많은 생각과 구상들.
                                단순한 나열이 아닌, 구조화되고 조직화된 형태로 발전시켜야 한다는 생각이 들었습니다.
                            </p>
                            <p className="text-zinc-300">
                                각각의 독립적인 생각들을 서로 연결하여 <strong>하나의 거대한 세계관</strong>으로 조합하는 것.<br />
                                이것이 Ten:One™ 유니버스의 시작입니다.
                            </p>
                        </div>
                        <div className="order-1 md:order-2 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-8 rounded-2xl border border-indigo-500/10 flex items-center justify-center">
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 bg-white blur-2xl opacity-20 animate-pulse"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold">💥</div>
                            </div>
                        </div>
                    </div>

                    {/* Brand Universe */}
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800 flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">Brand A</div>
                                <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">Brand B</div>
                                <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">Brand C</div>
                                <div className="w-16 h-16 bg-indigo-900/50 rounded-lg flex items-center justify-center border border-indigo-500/50 text-indigo-400 font-bold">Union</div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Box className="h-5 w-5 text-indigo-500" /> Brand Universe
                            </h3>
                            <p className="text-zinc-400 leading-relaxed">
                                개별 브랜드로 존재하지만 서로 유기적으로 연계되고 네트워크 되는 구조.<br />
                                작은 브랜드가 각자 힘을 키워가면서 서로에게 강력한 시너지를 냅니다.
                            </p>
                            <p className="text-zinc-300">
                                <strong>"브랜드에도 세계관이 필요하다."</strong><br />
                                하나의 강력한 스토리를 나누는 것이 아니라, 작은 스토리들이 모여 거대한 세계관을 만듭니다.
                            </p>
                        </div>
                    </div>

                    {/* Flywheel */}
                    <div className="bg-zinc-900/20 p-8 md:p-12 rounded-3xl border border-zinc-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-indigo-900/10 blur-3xl rounded-full"></div>

                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2 relative z-10">
                            <RotateCcw className="h-6 w-6 text-emerald-500" /> Ten:One™ Flywheel
                        </h3>

                        <div className="grid md:grid-cols-4 gap-6 relative z-10">
                            {[
                                { step: "01", title: "신뢰 구축", desc: "Trust Network" },
                                { step: "02", title: "프로젝트", desc: "문제 해결 & 실행" },
                                { step: "03", title: "비즈니스", desc: "가치 창출 & 기회" },
                                { step: "04", title: "성장", desc: "네트워크 강화" },
                            ].map((item, i) => (
                                <div key={i} className="group relative">
                                    <div className="text-5xl font-black text-white/5 mb-2 group-hover:text-emerald-900/20 transition-colors">{item.step}</div>
                                    <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl relative -top-8 hover:-top-10 transition-all duration-300 shadow-xl">
                                        <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                        <p className="text-xs text-zinc-500">{item.desc}</p>
                                    </div>
                                    {i < 3 && < ArrowUpRight className="hidden md:block absolute top-1/2 -right-3 text-zinc-700 h-6 w-6 transform -translate-y-1/2 rotate-45" />}
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-zinc-400 mt-8 max-w-2xl mx-auto text-sm">
                            구성원들의 자발적 참여로 시작되어 프로젝트 성공 경험을 공유하고,
                            이는 다시 신뢰 기반 네트워크를 강화하여 지속적인 성장을 만들어냅니다.
                        </p>
                    </div>
                </section>

                {/* Value Connector */}
                <section className="text-center py-12 border-y border-zinc-800">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        "가치 연결자 <span className="text-indigo-400">Value Connector</span>"
                    </h3>
                    <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                        <span className="block text-white font-medium mb-2">"약한 연결 고리가 만드는 강력한 기회"</span>
                        나는 가치 네트워크를 만드는 연결자가 되기로 했습니다.<br />
                        10,000명의 기획자를 발굴하여 서로 연결하는 것이 우리의 목표입니다.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
                        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-indigo-500/50 transition-colors">
                            <h4 className="font-bold text-white mb-2">Connect</h4>
                            <p className="text-sm text-zinc-500">다른 영역에서 다르게 일하는 사람들을 만나보자.</p>
                        </div>
                        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-indigo-500/50 transition-colors">
                            <h4 className="font-bold text-white mb-2">Create</h4>
                            <p className="text-sm text-zinc-500">본질을 지키며 빠르게 움직이고 실행에 옮긴다.</p>
                        </div>
                    </div>
                </section>

                {/* HISTORY SECTION */}
                <section className="py-12">
                    <div className="flex items-center gap-3 mb-12">
                        <History className="h-6 w-6 text-zinc-500" />
                        <h2 className="text-2xl font-bold text-white">Our Journey</h2>
                        <span className="h-px flex-1 bg-zinc-800"></span>
                    </div>

                    <div className="border-l border-zinc-800 md:border-none space-y-0 relative">
                        {HISTORY_DATA.map((item, index) => (
                            <TimelineItem key={index} item={item} isLast={index === HISTORY_DATA.length - 1} />
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <section className="text-center space-y-8 pt-12 border-t border-zinc-800">
                    <p className="text-lg text-zinc-300 italic">
                        "너, 나의 동료가 되라. 👒"
                    </p>
                    <div className="bg-zinc-900/50 p-8 rounded-2xl max-w-sm mx-auto border border-zinc-800/50">
                        <h4 className="font-bold text-white mb-6">Ten:One™ Universe</h4>
                        <div className="space-y-4">
                            <a href="mailto:lools@tenone.biz" className="flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg">
                                <Mail className="h-4 w-4" />
                                lools@tenone.biz
                            </a>
                            <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-zinc-400 hover:text-yellow-400 transition-colors p-2 hover:bg-zinc-800 rounded-lg">
                                <MessageCircle className="h-4 w-4" />
                                open.kakao.com/me/tenone
                            </a>
                        </div>
                    </div>

                    <div className="pt-8">
                        <Link href="/projects" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition-colors">
                            <LinkIcon className="h-4 w-4" />
                            프로젝트 둘러보기
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}
