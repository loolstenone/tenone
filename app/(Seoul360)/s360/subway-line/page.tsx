import type { Metadata } from "next";
import { Train } from "lucide-react";

export const metadata: Metadata = {
    title: "Subway Line",
};

const subwayLines = [
    {
        id: "line1",
        name: "Line 1",
        color: "#0052A4",
        koreanName: "1호선",
        description: "Dark Blue line running north-south through the city center. Connects Seoul Station, City Hall, Jongno, and extends to Incheon and Suwon.",
        keyStations: ["Seoul Station", "City Hall", "Jongno 3-ga", "Dongdaemun", "Cheongnyangni"],
    },
    {
        id: "line2",
        name: "Line 2",
        color: "#009246",
        koreanName: "2호선",
        description: "Green circular line — the busiest line in Seoul. Loops around the city center connecting major areas like Gangnam, Hongdae, and Jamsil.",
        keyStations: ["Gangnam", "Hongik Univ.", "Jamsil", "Sadang", "Sindorim"],
    },
    {
        id: "line3",
        name: "Line 3",
        color: "#EF7C1C",
        koreanName: "3호선",
        description: "Orange line running northwest to southeast. Passes through Anguk (Bukchon), Apgujeong, and Express Bus Terminal.",
        keyStations: ["Anguk", "Gyeongbokgung", "Apgujeong", "Express Bus Terminal", "Daehwa"],
    },
    {
        id: "line4",
        name: "Line 4",
        color: "#00A5DE",
        koreanName: "4호선",
        description: "Light blue line running northeast to south. Connects Nowon, Dongdaemun, Myeongdong, and Seoul Station.",
        keyStations: ["Myeongdong", "Seoul Station", "Dongdaemun", "Chungmuro", "Sadang"],
    },
    {
        id: "line5",
        name: "Line 5",
        color: "#996CAC",
        koreanName: "5호선",
        description: "Purple line running east-west. Connects Gimpo Airport, Yeouido (business district), Gwanghwamun, and Olympic Park.",
        keyStations: ["Gimpo Airport", "Yeouido", "Gwanghwamun", "Gwangnaru", "Olympic Park"],
    },
    {
        id: "line6",
        name: "Line 6",
        color: "#CD7C2F",
        koreanName: "6호선",
        description: "Brown/Orange line serving northern Seoul. Passes through Itaewon, Hangang-jin, and Digital Media City.",
        keyStations: ["Itaewon", "Hangang-jin", "Digital Media City", "Hapjeong", "Eungam"],
    },
    {
        id: "line7",
        name: "Line 7",
        color: "#747F00",
        koreanName: "7호선",
        description: "Olive/Dark Yellow line running northeast to southwest. Connects Dobong to Onsu, passing through Gangnam area.",
        keyStations: ["Dobongsan", "Nopodong", "Gangnam-gu Office", "Express Bus Terminal", "Cheongdam"],
    },
    {
        id: "line8",
        name: "Line 8",
        color: "#E6186C",
        koreanName: "8호선",
        description: "Pink line — shortest line in the Seoul Metro. Connects Jamsil and Moran in the southeast.",
        keyStations: ["Jamsil", "Songpa", "Moran", "Seongnam"],
    },
    {
        id: "line9",
        name: "Line 9",
        color: "#BDB092",
        koreanName: "9호선",
        description: "Gold/Brown line running east-west along the Hangang River. Express and local services available. Great for airport access.",
        keyStations: ["Gimpo Airport", "Yeouido", "Express Bus Terminal", "Sports Complex", "Olympic Park"],
    },
    {
        id: "airport",
        name: "Airport Railroad (AREX)",
        color: "#0090D2",
        koreanName: "공항철도",
        description: "Connects Incheon International Airport to Seoul Station. Express (non-stop, 43 min) and All-Stop services available.",
        keyStations: ["Incheon Airport T2", "Incheon Airport T1", "Gimpo Airport", "Hongik Univ.", "Seoul Station"],
    },
    {
        id: "gyeongeui",
        name: "GyeongEui-JungAng Line",
        color: "#77C4A3",
        koreanName: "경의중앙선",
        description: "Teal/Cyan line connecting Paju (northwest) to Yongmun (southeast). Passes through major transfer stations.",
        keyStations: ["Seoul Station", "Hongik Univ.", "Yongsan", "Wangsimni", "Jungang"],
    },
    {
        id: "bundang",
        name: "BunDang Line",
        color: "#F5A200",
        koreanName: "분당선",
        description: "Yellow line connecting Wangsimni to Suwon. Passes through Gangnam and Bundang new town.",
        keyStations: ["Wangsimni", "Apgujeongrodeo", "Gangnam-gu Office", "Jeongja", "Suwon"],
    },
    {
        id: "sinbundang",
        name: "SinBunDang Line",
        color: "#D4003B",
        koreanName: "신분당선",
        description: "Express line connecting Gangnam to Gwanggyo. Driverless operation with fast service.",
        keyStations: ["Gangnam", "Yangjae", "Pangyo", "Jeongja", "Gwanggyo"],
    },
];

export default function SubwayLinePage() {
    return (
        <div>
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="flex flex-col">
                    {/* Color stripes representing subway lines */}
                    <div className="h-3 bg-[#EF7C1C]" />
                    <div className="h-3 bg-[#00A5DE]" />
                    <div className="h-3 bg-[#996CAC]" />
                    <div className="h-3 bg-[#CD7C2F]" />
                    <div className="h-3 bg-[#747F00]" />
                    <div className="h-3 bg-[#E6186C]" />
                </div>
                <div className="bg-[#3D3D3D] text-white text-center py-12">
                    <h1 className="text-4xl md:text-5xl font-light">Seoul Subway</h1>
                    <p className="text-neutral-400 mt-2 text-sm">
                        13 Lines covering the entire Seoul Metropolitan Area
                    </p>
                </div>
            </section>

            {/* Subway Line Map Legend */}
            <section className="mx-auto max-w-5xl px-6 py-10">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-6">Subway Line Map</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {subwayLines.map((line) => (
                            <a
                                key={line.id}
                                href={`#${line.id}`}
                                className="flex items-center gap-2 text-sm hover:bg-neutral-50 p-2 rounded transition-colors"
                            >
                                <span
                                    className="w-4 h-1 rounded-full inline-block"
                                    style={{ backgroundColor: line.color }}
                                />
                                <span>{line.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Individual Line Details */}
            <section className="mx-auto max-w-5xl px-6 pb-12 space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Train className="h-5 w-5 text-[#F5C518]" />
                    Seoul Subway Lines
                </h2>
                {subwayLines.map((line) => (
                    <div
                        key={line.id}
                        id={line.id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                        <div
                            className="h-1.5"
                            style={{ backgroundColor: line.color }}
                        />
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: line.color }}
                                />
                                <h3 className="text-lg font-semibold">{line.name}</h3>
                                <span className="text-sm text-neutral-400">
                                    {line.koreanName}
                                </span>
                            </div>
                            <p className="text-sm text-neutral-600 mb-4">{line.description}</p>
                            <div>
                                <p className="text-xs text-neutral-400 mb-2">Key Stations:</p>
                                <div className="flex flex-wrap gap-2">
                                    {line.keyStations.map((station) => (
                                        <span
                                            key={station}
                                            className="text-xs px-2 py-1 rounded-full border border-neutral-200 text-neutral-600"
                                        >
                                            {station}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}
