import type { Metadata } from "next";
import Link from "next/link";
import { Train, Bus, Navigation, Building2, Zap } from "lucide-react";

export const metadata: Metadata = {
    title: "Outside Seoul",
};

const ktxDestinations = [
    { name: "Busan", duration: "2h 15min", korean: "부산", description: "Korea's second largest city. Beaches, seafood, and Gamcheon Culture Village." },
    { name: "Daejeon", duration: "50min", korean: "대전", description: "Science and technology hub in central Korea." },
    { name: "Daegu", duration: "1h 40min", korean: "대구", description: "Fourth largest city with vibrant food culture and Apsan Park." },
    { name: "Gwangju", duration: "1h 30min", korean: "광주", description: "Cultural capital of Korea with rich art scene and democratic history." },
    { name: "Gyeongju", duration: "2h", korean: "경주", description: "Ancient capital of Silla dynasty. UNESCO World Heritage sites everywhere." },
    { name: "Jeonju", duration: "1h 30min", korean: "전주", description: "Famous for Hanok Village and bibimbap. Traditional Korean culture hub." },
    { name: "Gangneung", duration: "1h 50min", korean: "강릉", description: "East coast beach city. Host of 2018 Winter Olympics ice events." },
    { name: "Mokpo", duration: "2h 30min", korean: "목포", description: "Southern port city gateway to islands and seafood paradise." },
];

const busTerminals = [
    {
        name: "Seoul Express Bus Terminal (Gangnam)",
        korean: "서울고속버스터미널",
        subway: "Line 3, 7, 9 — Express Bus Terminal Station",
        description: "Main express bus terminal serving Gyeongbu and Honam routes (Busan, Daejeon, Gwangju, Jeonju, etc.)",
    },
    {
        name: "Dong Seoul Bus Terminal",
        korean: "동서울종합터미널",
        subway: "Line 2 — Gangbyeon Station",
        description: "Major terminal for eastern and northeastern destinations (Gangneung, Sokcho, Chuncheon, etc.)",
    },
    {
        name: "Seoul Nambu Terminal",
        korean: "서울남부터미널",
        subway: "Line 3 — Nambu Terminal Station",
        description: "Terminal for southern Gyeonggi-do and Chungcheong-do destinations.",
    },
    {
        name: "Sangbong Bus Terminal",
        korean: "상봉터미널",
        subway: "Line 7, GyeongEui-JungAng — Sangbong Station",
        description: "Terminal serving various regional destinations, especially east and northeast routes.",
    },
];

const nearbyTrainRoutes = [
    {
        name: "Gyeongchun Line",
        korean: "경춘선",
        color: "#178C72",
        destinations: ["Chuncheon", "Namiseom (Nami Island)", "Gapyeong"],
        from: "Sangbong or Cheongnyangni Station",
    },
    {
        name: "GyeongEui-JungAng Line",
        korean: "경의중앙선",
        color: "#77C4A3",
        destinations: ["Paju (DMZ area)", "Ilsan", "Yongmun"],
        from: "Seoul Station or Yongsan",
    },
    {
        name: "BunDang/Suin Line",
        korean: "분당수인선",
        color: "#F5A200",
        destinations: ["Bundang", "Suwon", "Incheon"],
        from: "Wangsimni Station",
    },
    {
        name: "Shinbundang Line",
        korean: "신분당선",
        color: "#D4003B",
        destinations: ["Pangyo (Tech Hub)", "Gwanggyo"],
        from: "Gangnam Station",
    },
    {
        name: "Airport Railroad (AREX)",
        korean: "공항철도",
        color: "#0090D2",
        destinations: ["Incheon International Airport"],
        from: "Seoul Station",
    },
    {
        name: "Suin-Bundang Line",
        korean: "수인분당선",
        color: "#F5A200",
        destinations: ["Suwon", "Incheon", "Songdo"],
        from: "Wangsimni Station",
    },
];

// Reused navigation section
const subwayLines = [
    "Line 1", "Line 2", "Line 3", "Line 4",
    "Line 5", "Line 6", "Line 7", "Line 8",
    "Line 9", "Airport", "GyeongEui-JungAng Line", "GyeongChun",
];

const districts = [
    "JongNo", "Jung-Gu", "YongSan", "SeongDong",
    "GwangJin", "DongDaeMun", "JungNang",
    "SeongBuk", "GangBuk", "DoBong",
    "NoWon", "EunPyeong", "SeoDaeMun",
    "MaPo", "YangCheon", "GangSeo",
    "GuRo", "GeumCheon", "YeongDeungPo",
    "DongJak", "GwanAk", "SeoCho",
    "GangNam", "SongPa", "GangDong",
];

export default function OutsideSeoulPage() {
    return (
        <div>
            {/* Hero */}
            <section className="relative bg-[#3D3D3D] text-white overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1600&q=80')",
                    }}
                />
                <div className="relative text-center py-16">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-light">Go Outside Seoul</h1>
                    <p className="text-neutral-400 mt-2 text-sm">
                        Explore beyond Seoul by KTX, Bus, and Suburban Rail
                    </p>
                </div>
                <div className="h-1.5 bg-[#F5C518]" />
            </section>

            {/* KTX Section */}
            <section className="mx-auto max-w-5xl px-6 py-10">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#F5C518]" />
                    KTX — Korea Train Express
                </h2>
                <p className="text-sm text-neutral-600 mb-6">
                    Korea&apos;s high-speed rail departs from <strong>Seoul Station</strong> (Line 1, 4, Airport Railroad)
                    and <strong>Yongsan Station</strong> (Line 1, GyeongEui-JungAng Line).
                    Top speed: 305 km/h.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ktxDestinations.map((dest) => (
                        <div
                            key={dest.name}
                            className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">{dest.name}</h3>
                                <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full font-medium">
                                    {dest.duration}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-400 mb-1">{dest.korean}</p>
                            <p className="text-sm text-neutral-600">{dest.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bus Terminal Section */}
            <section className="mx-auto max-w-5xl px-6 pb-10">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Bus className="h-5 w-5 text-[#F5C518]" />
                    Bus Terminals
                </h2>
                <div className="space-y-4">
                    {busTerminals.map((terminal) => (
                        <div
                            key={terminal.name}
                            className="bg-white rounded-lg p-5 shadow-sm"
                        >
                            <h3 className="font-semibold mb-1">{terminal.name}</h3>
                            <p className="text-xs text-neutral-400 mb-2">{terminal.korean}</p>
                            <p className="text-sm text-blue-600 mb-2 flex items-center gap-1">
                                <Train className="h-3 w-3" />
                                {terminal.subway}
                            </p>
                            <p className="text-sm text-neutral-600">{terminal.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Suburban Rail Section */}
            <section className="mx-auto max-w-5xl px-6 pb-10">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Train className="h-5 w-5 text-[#F5C518]" />
                    Subway &amp; Train (Suburban Rail)
                </h2>
                <p className="text-sm text-neutral-600 mb-6">
                    Seoul&apos;s subway system extends far beyond the city limits. These suburban rail lines connect
                    directly to Seoul Metro stations, so you can explore outside Seoul with just your T-money card.
                </p>
                <div className="space-y-4">
                    {nearbyTrainRoutes.map((route) => (
                        <div
                            key={route.name}
                            className="bg-white rounded-lg shadow-sm overflow-hidden"
                        >
                            <div className="h-1" style={{ backgroundColor: route.color }} />
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: route.color }}
                                    />
                                    <h3 className="font-semibold">{route.name}</h3>
                                    <span className="text-xs text-neutral-400">{route.korean}</span>
                                </div>
                                <p className="text-sm text-neutral-500 mb-2">
                                    From: <strong>{route.from}</strong>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {route.destinations.map((d) => (
                                        <span
                                            key={d}
                                            className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full"
                                        >
                                            {d}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Navigation (same as home page bottom) */}
            <section className="mx-auto max-w-5xl px-6 pb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm space-y-8">
                    <div>
                        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-[#F5C518]" />
                            Seoul 360° Tour
                        </h3>
                        <div className="flex gap-4 text-sm text-blue-600">
                            <Link href="/seoul360" className="hover:underline">First Plan</Link>
                            <span className="text-neutral-300">|</span>
                            <Link href="/seoul360" className="hover:underline">Do you know...?</Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Train className="h-4 w-4 text-[#F5C518]" />
                            Seoul 360° Tour by{" "}
                            <Link href="/seoul360/subway-line" className="underline">Subway Line</Link>
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                            {subwayLines.map((line, i) => (
                                <span key={line}>
                                    <Link href="/seoul360/subway-line" className="text-blue-600 hover:underline">{line}</Link>
                                    {i < subwayLines.length - 1 && <span className="text-neutral-300 ml-3">|</span>}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#F5C518]" />
                            Seoul 360° Tour by{" "}
                            <Link href="/seoul360/district" className="underline">District</Link>
                        </h3>
                        <div className="flex flex-wrap gap-x-1 gap-y-1 text-sm">
                            {districts.map((d, i) => (
                                <span key={d}>
                                    <span className="text-neutral-400 text-xs mr-0.5">{i + 1}.</span>
                                    <Link href="/seoul360/district" className="text-blue-600 hover:underline">{d}</Link>
                                    {i < districts.length - 1 && <span className="text-neutral-200 mx-1.5"> </span>}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
