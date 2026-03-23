import Link from "next/link";
import { Train, MapPin, Building2, Navigation, Plane } from "lucide-react";

// AREX stations from Incheon Airport to Seoul Station
const arexStations = [
    { name: "Terminal 2", type: "airport" },
    { name: "Terminal 1", type: "airport" },
    { name: "InCheon Cargo Terminal", type: "stop" },
    { name: "WoonSeo", type: "stop" },
    { name: "YoungJong", type: "stop" },
    { name: "CheongNa Intl. City", type: "stop" },
    { name: "GeomAm", type: "stop", transfer: "InCheon Line 2" },
    { name: "KeYang", type: "stop", transfer: "InCheon Line 1" },
    { name: "GimPo Intl. Airport", type: "airport", transfer: "Line 5, 9 & GimPo Gold Line" },
    { name: "MaGokNaRu", type: "stop", transfer: "Line 9" },
    { name: "Digital Media City", type: "stop", transfer: "Line 6 & GyeongEui JoongAng Line" },
    { name: "HongIk Univ.", type: "stop", transfer: "Line 2 & GyeongEui JoongAng Line" },
    { name: "GongDeok", type: "stop", transfer: "Line 5, 6 & GyeongEui JoongAng Line" },
    { name: "Seoul Station", type: "terminal", transfer: "Line 1, 4 & KTX" },
];

// Tour links for right sidebar
const tourLinks = [
    {
        station: "GimPo International Airport",
        transfers: ["Line 5", "Line 9", "GimPo Gold Line"],
    },
    {
        station: "MaGokNaru",
        transfers: ["Line 9"],
    },
    {
        station: "Digital Media City",
        transfers: ["Line 6", "GyeongEui-JungAng Line"],
    },
    {
        station: "HongIk Univ.",
        transfers: ["Line 2", "GyeongEui-JungAng Line"],
    },
    {
        station: "GongDeok",
        transfers: ["Line 5", "Line 6", "GyeongEui-JoongAng Line"],
    },
    {
        station: "Seoul Station",
        transfers: ["Line 1", "Line 4", "GyeongEui-JungAng Line", "KTX"],
    },
];

// 25 districts of Seoul
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

// Subway lines
const subwayLines = [
    { name: "Line 1", color: "#0052A4" },
    { name: "Line 2", color: "#009246" },
    { name: "Line 3", color: "#EF7C1C" },
    { name: "Line 4", color: "#00A5DE" },
    { name: "Line 5", color: "#996CAC" },
    { name: "Line 6", color: "#CD7C2F" },
    { name: "Line 7", color: "#747F00" },
    { name: "Line 8", color: "#E6186C" },
    { name: "Line 9", color: "#BDB092" },
    { name: "Airport (AREX)", color: "#0090D2" },
    { name: "GyeongEui-JungAng", color: "#77C4A3" },
    { name: "GyeongChun", color: "#178C72" },
];

export default function Seoul360Home() {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-[#3D3D3D] text-white overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1600&q=80')",
                    }}
                />
                <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Seoul/360°
                    </h1>
                    <p className="mt-4 text-lg text-neutral-300">
                        #ChallengeOnlySubwaySeoulTour
                    </p>
                </div>
            </section>

            {/* Intro */}
            <section className="mx-auto max-w-5xl px-6 py-10">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <p className="text-lg text-neutral-700">
                        We provide information for tourists who want to explore Seoul using only the subway.
                    </p>
                    <p className="text-sm text-neutral-500 mt-2">
                        Tip: &quot;Where is the subway?&quot; = &quot;JiHaChul EoDiSeo TaYo?&quot; (지하철 어디서 타요?)
                    </p>
                </div>
            </section>

            {/* Strengths */}
            <section className="mx-auto max-w-5xl px-6 pb-10">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Train className="h-5 w-5 text-[#F5C518]" />
                        Strengths of the Seoul Subway
                    </h2>
                    <ul className="space-y-2 text-neutral-700">
                        <li className="flex items-start gap-2">
                            <span className="text-[#F5C518] mt-1">&#9632;</span>
                            <span>
                                <strong>Coverage &amp; Convenience</strong>: All lines of the Seoul subway can be transferred seamlessly.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#F5C518] mt-1">&#9632;</span>
                            <span>
                                Very <strong>cheap</strong>, <strong>clean</strong>, and <strong>safe</strong>.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#F5C518] mt-1">&#9632;</span>
                            <span>
                                Stations have <strong>English signage</strong> and announcements throughout.
                            </span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Airport to Seoul + Tour Links */}
            <section className="mx-auto max-w-5xl px-6 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* AREX Route */}
                    <div className="lg:col-span-3 bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Plane className="h-5 w-5 text-[#0090D2]" />
                            How to Enter Seoul from InCheon &amp; GimPo Intl. Airport
                        </h2>
                        <p className="text-sm text-neutral-500 mb-6">
                            You can choose Non-Stop or All-Stop Line{" "}
                            <span className="font-bold text-[#0090D2]">A·REX</span>
                        </p>

                        {/* AREX Station List */}
                        <div className="relative pl-8">
                            {/* Vertical line */}
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#0090D2]" />

                            {arexStations.map((station, i) => {
                                const isIncheon = i <= 7;
                                return (
                                    <div key={station.name} className="relative flex items-start mb-3">
                                        {/* Dot */}
                                        <div
                                            className={`absolute -left-5 top-1 w-3 h-3 rounded-full border-2 border-[#0090D2] ${
                                                station.type === "airport"
                                                    ? "bg-[#F5C518]"
                                                    : station.type === "terminal"
                                                    ? "bg-[#0090D2]"
                                                    : "bg-white"
                                            }`}
                                        />
                                        <div className="ml-2">
                                            <span className="font-medium text-sm">{station.name}</span>
                                            {station.transfer && (
                                                <span className="text-xs text-neutral-500 ml-2">
                                                    (Transfer {station.transfer})
                                                </span>
                                            )}
                                        </div>
                                        {/* InCheon/Seoul divider */}
                                        {i === 7 && (
                                            <div className="absolute -left-12 top-8 text-[10px] text-neutral-400">
                                                <div className="border-t border-neutral-300 w-6 mb-1" />
                                                <span>InCheon</span>
                                                <br />
                                                <span>Seoul ↓</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <p className="text-xs text-neutral-400 mt-2 ml-2">
                                Non-Stop Express: 63km, 51 min.
                            </p>
                        </div>
                    </div>

                    {/* Tour Links */}
                    <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-neutral-500 mb-4">
                            <MapPin className="h-4 w-4 inline mr-1 text-[#F5C518]" />
                            Tour Link
                        </h3>
                        <div className="space-y-4">
                            {tourLinks.map((tl) => (
                                <div key={tl.station}>
                                    <p className="font-semibold text-sm">{tl.station}</p>
                                    <ul className="ml-4 mt-1 space-y-0.5">
                                        {tl.transfers.map((t) => (
                                            <li key={t} className="text-xs text-neutral-600">
                                                &#8226; Transfer{" "}
                                                <span className="text-blue-600 hover:underline cursor-pointer">
                                                    {t}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Navigation Cards */}
            <section className="mx-auto max-w-5xl px-6 pb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm space-y-8">
                    {/* Seoul 360 Tour */}
                    <div>
                        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-[#F5C518]" />
                            Seoul 360° Tour
                        </h3>
                        <div className="flex gap-4 text-sm text-blue-600">
                            <Link href="/s360" className="hover:underline">
                                First Plan
                            </Link>
                            <span className="text-neutral-300">|</span>
                            <Link href="/s360" className="hover:underline">
                                Do you know...?
                            </Link>
                        </div>
                    </div>

                    {/* Tour by Subway Line */}
                    <div>
                        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Train className="h-4 w-4 text-[#F5C518]" />
                            Seoul 360° Tour by{" "}
                            <Link href="/s360/subway-line" className="underline">
                                Subway Line
                            </Link>
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                            {subwayLines.map((line, i) => (
                                <span key={line.name}>
                                    <Link
                                        href="/s360/subway-line"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {line.name}
                                    </Link>
                                    {i < subwayLines.length - 1 && (
                                        <span className="text-neutral-300 ml-3">|</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tour by District */}
                    <div>
                        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#F5C518]" />
                            Seoul 360° Tour by{" "}
                            <Link href="/s360/district" className="underline">
                                District
                            </Link>
                        </h3>
                        <div className="flex flex-wrap gap-x-1 gap-y-1 text-sm">
                            {districts.map((d, i) => (
                                <span key={d}>
                                    <span className="text-neutral-400 text-xs mr-0.5">{i + 1}.</span>
                                    <Link
                                        href="/s360/district"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {d}
                                    </Link>
                                    {i < districts.length - 1 && (
                                        <span className="text-neutral-200 mx-1.5"> </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Outside Seoul */}
                    <div>
                        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-[#F5C518]" />
                            Seoul 360° Tour by{" "}
                            <Link href="/s360/outside-seoul" className="underline">
                                Outside Seoul
                            </Link>
                        </h3>
                        <div className="flex gap-3 text-sm text-blue-600">
                            <Link href="/s360/outside-seoul" className="hover:underline">
                                KTX
                            </Link>
                            <span className="text-neutral-300">|</span>
                            <Link href="/s360/outside-seoul" className="hover:underline">
                                Bus Terminal
                            </Link>
                            <span className="text-neutral-300">|</span>
                            <Link href="/s360/outside-seoul" className="hover:underline">
                                Subway &amp; Train
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
