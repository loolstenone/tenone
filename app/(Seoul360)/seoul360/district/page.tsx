import type { Metadata } from "next";
import { Building2, MapPin } from "lucide-react";

export const metadata: Metadata = {
    title: "District",
};

const districts = [
    {
        id: 1, name: "Jongno-gu", korean: "종로구",
        description: "Heart of traditional Seoul. Home to Gyeongbokgung Palace, Bukchon Hanok Village, Insadong, and Gwanghwamun Square.",
        highlights: ["Gyeongbokgung Palace", "Bukchon Hanok Village", "Insadong", "Gwanghwamun"],
        lines: ["Line 1", "Line 3", "Line 5"],
    },
    {
        id: 2, name: "Jung-gu", korean: "중구",
        description: "City center with Myeongdong shopping, Namdaemun Market, N Seoul Tower, and Deoksugung Palace.",
        highlights: ["Myeongdong", "Namdaemun Market", "N Seoul Tower", "Deoksugung"],
        lines: ["Line 1", "Line 2", "Line 4"],
    },
    {
        id: 3, name: "Yongsan-gu", korean: "용산구",
        description: "Itaewon international district, National Museum of Korea, and Yongsan Electronics Market.",
        highlights: ["Itaewon", "National Museum", "War Memorial", "Yongsan Park"],
        lines: ["Line 1", "Line 4", "Line 6"],
    },
    {
        id: 4, name: "Seongdong-gu", korean: "성동구",
        description: "Rising trendy area with Seongsu-dong (Seoul's Brooklyn), cafes, and creative spaces.",
        highlights: ["Seongsu-dong", "Seoul Forest", "Ttukseom Resort"],
        lines: ["Line 2", "Line 5"],
    },
    {
        id: 5, name: "Gwangjin-gu", korean: "광진구",
        description: "Home to Children's Grand Park, Konkuk University area, and Gwangnaru Hangang Park.",
        highlights: ["Children's Grand Park", "Konkuk Univ. area", "Gwangnaru"],
        lines: ["Line 2", "Line 5", "Line 7"],
    },
    {
        id: 6, name: "Dongdaemun-gu", korean: "동대문구",
        description: "Famous for Dongdaemun Design Plaza (DDP), fashion wholesale markets, and 24-hour shopping.",
        highlights: ["DDP", "Dongdaemun Market", "Cheongnyangni"],
        lines: ["Line 1", "Line 2", "Line 4"],
    },
    {
        id: 7, name: "Jungnang-gu", korean: "중랑구",
        description: "Residential area with Jungnang Stream and Manguri Park. Gateway to eastern Seoul.",
        highlights: ["Jungnang Stream", "Manguri Park"],
        lines: ["Line 7", "GyeongEui-JungAng"],
    },
    {
        id: 8, name: "Seongbuk-gu", korean: "성북구",
        description: "Cultural and academic area near the old Seoul Fortress Wall. Quiet residential neighborhood.",
        highlights: ["Seoul Fortress Wall", "Seongbuk-dong", "Korea Univ."],
        lines: ["Line 4", "Line 6"],
    },
    {
        id: 9, name: "Gangbuk-gu", korean: "강북구",
        description: "Northern Seoul district near Bukhansan National Park, great for hiking.",
        highlights: ["Bukhansan", "4.19 Memorial", "Suyu Market"],
        lines: ["Line 4"],
    },
    {
        id: 10, name: "Dobong-gu", korean: "도봉구",
        description: "Gateway to Dobongsan mountain hiking trails. Peaceful residential area.",
        highlights: ["Dobongsan", "Banghak-dong"],
        lines: ["Line 1", "Line 7"],
    },
    {
        id: 11, name: "Nowon-gu", korean: "노원구",
        description: "Large residential district in northeastern Seoul with Bukhansan access.",
        highlights: ["Suraksan", "Nowon Station area"],
        lines: ["Line 4", "Line 7"],
    },
    {
        id: 12, name: "Eunpyeong-gu", korean: "은평구",
        description: "Northwestern Seoul with Bukhansan views. Eunpyeong Hanok Village is a hidden gem.",
        highlights: ["Eunpyeong Hanok Village", "Bukhansan trailhead"],
        lines: ["Line 3", "Line 6"],
    },
    {
        id: 13, name: "Seodaemun-gu", korean: "서대문구",
        description: "Home to Seodaemun Prison History Hall, Yonsei/Ewha universities, and Ansan Jarak-gil trail.",
        highlights: ["Seodaemun Prison", "Yonsei Univ.", "Ewha Womans Univ."],
        lines: ["Line 2", "Line 3", "Line 5"],
    },
    {
        id: 14, name: "Mapo-gu", korean: "마포구",
        description: "Young and vibrant area with Hongdae (indie culture hub), Mangwon Market, and Mapo waterfront.",
        highlights: ["Hongdae", "Mangwon Market", "Mapo Bridge", "Yeontral Park"],
        lines: ["Line 2", "Line 5", "Line 6", "Airport Railroad"],
    },
    {
        id: 15, name: "Yangcheon-gu", korean: "양천구",
        description: "Residential area in western Seoul, close to Gimpo Airport and Mokdong entertainment district.",
        highlights: ["Mokdong", "Paris Park"],
        lines: ["Line 2", "Line 5", "Line 9"],
    },
    {
        id: 16, name: "Gangseo-gu", korean: "강서구",
        description: "Western Seoul district with Gimpo Airport, botanical garden, and emerging development areas.",
        highlights: ["Gimpo Airport", "Seoul Botanical Garden", "Magok"],
        lines: ["Line 5", "Line 9", "Airport Railroad"],
    },
    {
        id: 17, name: "Guro-gu", korean: "구로구",
        description: "Former industrial area transformed into G-Valley digital complex. Multicultural dining options.",
        highlights: ["G-Valley", "Guro Digital Complex"],
        lines: ["Line 1", "Line 2", "Line 7"],
    },
    {
        id: 18, name: "Geumcheon-gu", korean: "금천구",
        description: "Southern Seoul with affordable dining, Doksan and Gasan digital valleys.",
        highlights: ["Gasan Digital Valley", "Doksan"],
        lines: ["Line 1", "Line 7"],
    },
    {
        id: 19, name: "Yeongdeungpo-gu", korean: "영등포구",
        description: "Business district with Yeouido (Korea's Wall Street), 63 Building, and IFC Mall.",
        highlights: ["Yeouido", "63 Building", "IFC Mall", "Times Square"],
        lines: ["Line 1", "Line 2", "Line 5", "Line 9"],
    },
    {
        id: 20, name: "Dongjak-gu", korean: "동작구",
        description: "Home to Seoul National Cemetery and Noryangjin Fish Market. Residential area south of the river.",
        highlights: ["Seoul National Cemetery", "Noryangjin Fish Market"],
        lines: ["Line 4", "Line 7", "Line 9"],
    },
    {
        id: 21, name: "Gwanak-gu", korean: "관악구",
        description: "Seoul National University area with Gwanaksan mountain hiking. Student-friendly dining.",
        highlights: ["Seoul National Univ.", "Gwanaksan", "Sillim-dong"],
        lines: ["Line 2"],
    },
    {
        id: 22, name: "Seocho-gu", korean: "서초구",
        description: "Upscale southern district with Express Bus Terminal, Gangnam Station south side, and arts center.",
        highlights: ["Express Bus Terminal", "Seoul Arts Center", "Banpo Bridge Rainbow Fountain"],
        lines: ["Line 2", "Line 3", "Line 4", "Line 7", "Line 9"],
    },
    {
        id: 23, name: "Gangnam-gu", korean: "강남구",
        description: "Seoul's most famous district. Premium shopping on Garosu-gil, COEX Mall, and Bongeunsa Temple.",
        highlights: ["Gangnam Station", "COEX Mall", "Garosu-gil", "Bongeunsa Temple"],
        lines: ["Line 2", "Line 7", "Line 9", "BunDang Line", "SinBunDang Line"],
    },
    {
        id: 24, name: "Songpa-gu", korean: "송파구",
        description: "Olympic Park, Lotte World, Seokchon Lake, and the iconic Lotte World Tower (555m).",
        highlights: ["Lotte World Tower", "Olympic Park", "Seokchon Lake", "Lotte World"],
        lines: ["Line 2", "Line 5", "Line 8", "Line 9"],
    },
    {
        id: 25, name: "Gangdong-gu", korean: "강동구",
        description: "Eastern Seoul with Amsa-dong Prehistoric Settlement Site and Gil-dong Ecological Park.",
        highlights: ["Amsa Prehistoric Site", "Gil-dong Eco Park", "Dunchon-dong"],
        lines: ["Line 5", "Line 8", "Line 9"],
    },
];

export default function DistrictPage() {
    return (
        <div>
            {/* Hero */}
            <section className="relative bg-[#3D3D3D] text-white overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1583400225507-04489d3e8cc1?w=1600&q=80')",
                    }}
                />
                <div className="relative text-center py-16">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-light">District of Seoul</h1>
                    <p className="text-neutral-400 mt-2 text-sm">25 Districts (Gu) of Seoul</p>
                </div>
                <div className="h-1.5 bg-[#F5C518]" />
            </section>

            {/* District Grid */}
            <section className="mx-auto max-w-6xl px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {districts.map((d) => (
                        <div
                            key={d.id}
                            className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-base flex items-center gap-2">
                                        <span className="text-xs text-neutral-400 font-normal">
                                            {d.id}.
                                        </span>
                                        {d.name}
                                    </h3>
                                    <span className="text-xs text-neutral-400">{d.korean}</span>
                                </div>
                                <MapPin className="h-4 w-4 text-[#F5C518] shrink-0 mt-1" />
                            </div>
                            <p className="text-sm text-neutral-600 mb-3">{d.description}</p>
                            <div className="mb-2">
                                <p className="text-xs text-neutral-400 mb-1">Highlights:</p>
                                <div className="flex flex-wrap gap-1">
                                    {d.highlights.map((h) => (
                                        <span
                                            key={h}
                                            className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full"
                                        >
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-400 mb-1">Subway Access:</p>
                                <div className="flex flex-wrap gap-1">
                                    {d.lines.map((l) => (
                                        <span
                                            key={l}
                                            className="text-[11px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full"
                                        >
                                            {l}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
