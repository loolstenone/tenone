import type { Metadata } from "next";
import { Search } from "lucide-react";

export const metadata: Metadata = {
    title: "Station",
};

// Station data: [English Name, Korean Name, Line, Station Code, External Code]
const stationData: [string, string, string, string, string][] = [
    ["Achasan", "아차산", "Line 5", "2546", "545"],
    ["Aeogae", "애오개", "Line 5", "2531", "530"],
    ["Ahyeon", "아현", "Line 2", "242", "242"],
    ["Airport Market", "공항시장", "Line 9", "4103", "903"],
    ["Amsa", "암사", "Line 8", "2811", "810"],
    ["Anam", "안암", "Line 6", "2640", "639"],
    ["Anguk", "안국", "Line 3", "318", "328"],
    ["Ansan", "안산", "Line 4", "1759", "453"],
    ["Anyang", "안양", "Line 1", "1706", "P147"],
    ["Apgujeong", "압구정", "Line 3", "326", "336"],
    ["Apgujeongrodeo", "압구정로데오", "BunDang Line", "1848", "K212"],
    ["Balsan", "발산", "Line 5", "2514", "513"],
    ["Banghwa", "방화", "Line 5", "2511", "510"],
    ["Banpo", "반포", "Line 7", "2742", "741"],
    ["Beomgye", "범계", "Line 4", "1762", "456"],
    ["Bogwang", "보광", "Line 6", "2634", "633"],
    ["Bomun", "보문", "Line 6", "2648", "647"],
    ["Bongeunsa", "봉은사", "Line 9", "4123", "923"],
    ["Bulgwang", "불광", "Line 3", "311", "321"],
    ["Bukhansan", "북한산", "Line 4", "1413", "413"],
    ["Changdong", "창동", "Line 1", "1022", "P101"],
    ["Changsin", "창신", "Line 6", "2645", "644"],
    ["Cheongdam", "청담", "Line 7", "2731", "730"],
    ["Cheonggu", "청구", "Line 5", "2541", "540"],
    ["Cheonho", "천호", "Line 5", "2551", "550"],
    ["Chungjeongno", "충정로", "Line 2", "243", "243"],
    ["Chungmuro", "충무로", "Line 3", "330", "340"],
    ["City Hall", "시청", "Line 1", "132", "132"],
    ["Daechi", "대치", "Line 3", "339", "349"],
    ["Daelim", "대림", "Line 2", "232", "232"],
    ["Digital Media City", "디지털미디어시티", "Line 6", "2623", "622"],
    ["Dobongsan", "도봉산", "Line 7", "2717", "716"],
    ["Doksan", "독산", "Line 1", "1711", "P142"],
    ["Dongdaemun", "동대문", "Line 1", "127", "127"],
    ["Dongdaemun Design Plaza", "동대문디자인플라자", "Line 2", "249", "249"],
    ["Dongjak", "동작", "Line 4", "1434", "434"],
    ["Eungam", "응암", "Line 6", "2619", "618"],
    ["Express Bus Terminal", "고속터미널", "Line 3", "339", "340"],
    ["Gaehwa", "개화", "Line 9", "4101", "901"],
    ["Gaepo Digital Innovation", "개포디지털혁신", "Line 3", "343", "353"],
    ["Gangbyeon", "강변", "Line 2", "214", "214"],
    ["Gangnam", "강남", "Line 2", "222", "222"],
    ["Gangnam-gu Office", "강남구청", "Line 7", "2729", "728"],
    ["Gimpo Airport", "김포공항", "Line 5", "2512", "512"],
    ["Gocheok", "고척", "Line 2", "237", "237"],
    ["Godeok", "고덕", "Line 5", "2552", "551"],
    ["Gongdeok", "공덕", "Line 5", "2529", "528"],
    ["Gubanpo", "구반포", "Line 9", "4120", "920"],
    ["Gunja", "군자", "Line 5", "2544", "543"],
    ["Guro", "구로", "Line 1", "1713", "P140"],
    ["Guro Digital Complex", "구로디지털단지", "Line 2", "233", "233"],
    ["Gwanghwamun", "광화문", "Line 5", "2533", "532"],
    ["Gwangnaru", "광나루", "Line 5", "2549", "548"],
    ["Gyeongbokgung", "경복궁", "Line 3", "316", "326"],
    ["Haengdang", "행당", "Line 5", "2540", "539"],
    ["Hakdong", "학동", "Line 7", "2730", "729"],
    ["Hapjeong", "합정", "Line 2", "238", "238"],
    ["Heukseok", "흑석", "Line 9", "4119", "919"],
    ["Hongik Univ.", "홍대입구", "Line 2", "239", "239"],
    ["Hyehwa", "혜화", "Line 4", "1421", "421"],
    ["Ichon", "이촌", "Line 4", "1430", "430"],
    ["Insadong", "인사동", "Line 3", "317", "327"],
    ["Itaewon", "이태원", "Line 6", "2631", "630"],
    ["Jamsil", "잠실", "Line 2", "216", "216"],
    ["Jamsil Naru", "잠실나루", "Line 2", "215", "215"],
    ["Janghanpyeong", "장한평", "Line 5", "2545", "544"],
    ["Jongno 3-ga", "종로3가", "Line 1", "129", "129"],
    ["Jongno 5-ga", "종로5가", "Line 1", "128", "128"],
    ["Jonggak", "종각", "Line 1", "130", "130"],
    ["Magok", "마곡", "Line 5", "2513", "512"],
    ["Mangwon", "망원", "Line 6", "2625", "624"],
    ["Mapo", "마포", "Line 5", "2528", "527"],
    ["Mok-dong", "목동", "Line 5", "2522", "521"],
    ["Moran", "모란", "Line 8", "2817", "816"],
    ["Myeongdong", "명동", "Line 4", "1424", "424"],
    ["Nakseongdae", "낙성대", "Line 2", "228", "228"],
    ["Noksapyeong", "녹사평", "Line 6", "2632", "631"],
    ["Noryangjin", "노량진", "Line 1", "1732", "P136"],
    ["Nowon", "노원", "Line 4", "1415", "415"],
    ["Olympic Park", "올림픽공원", "Line 5", "2555", "554"],
    ["Omokgyo", "오목교", "Line 5", "2520", "519"],
    ["Sadang", "사당", "Line 2", "226", "226"],
    ["Samsung", "삼성", "Line 2", "219", "219"],
    ["Sangsu", "상수", "Line 6", "2624", "623"],
    ["Seokchon", "석촌", "Line 8", "2813", "812"],
    ["Seolleung", "선릉", "Line 2", "220", "220"],
    ["Seoul Forest", "서울숲", "BunDang Line", "1846", "K210"],
    ["Seoul Station", "서울역", "Line 1", "133", "133"],
    ["Sinchon", "신촌", "Line 2", "240", "240"],
    ["Sindorim", "신도림", "Line 1", "1714", "P139"],
    ["Sinsa", "신사", "Line 3", "327", "337"],
    ["Sports Complex", "종합운동장", "Line 2", "218", "218"],
    ["Ttukseom", "뚝섬", "Line 2", "212", "212"],
    ["Wangsimni", "왕십리", "Line 2", "208", "208"],
    ["Yaksu", "약수", "Line 3", "332", "342"],
    ["Yangjae", "양재", "Line 3", "341", "351"],
    ["Yeoksam", "역삼", "Line 2", "221", "221"],
    ["Yeongdeungpo", "영등포", "Line 1", "1728", "P141"],
    ["Yeouido", "여의도", "Line 5", "2526", "525"],
    ["Yeouinaru", "여의나루", "Line 5", "2527", "526"],
    ["Yongsan", "용산", "Line 1", "1735", "P135"],
];

// Group stations by first letter
const grouped = stationData.reduce<Record<string, typeof stationData>>((acc, station) => {
    const letter = station[0][0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(station);
    return acc;
}, {});

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function StationPage() {
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
                    <h1 className="text-4xl md:text-5xl font-light">Station</h1>
                    <p className="text-neutral-400 mt-2 text-sm">
                        Find any Seoul subway station by name
                    </p>
                </div>
                <div className="h-1.5 bg-[#F5C518]" />
            </section>

            {/* Alphabet Index */}
            <section className="mx-auto max-w-5xl px-6 py-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex flex-wrap gap-1 justify-center">
                        {alphabet.map((letter) => {
                            const hasStations = !!grouped[letter];
                            return (
                                <a
                                    key={letter}
                                    href={hasStations ? `#letter-${letter}` : undefined}
                                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                                        hasStations
                                            ? "text-neutral-700 hover:bg-[#F5C518] hover:text-white cursor-pointer"
                                            : "text-neutral-300 cursor-default"
                                    }`}
                                >
                                    {letter}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Column Headers */}
            <section className="mx-auto max-w-5xl px-6 pb-2">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-neutral-500">
                        <div className="col-span-3">English Name</div>
                        <div className="col-span-2">Korean Name</div>
                        <div className="col-span-3">Line</div>
                        <div className="col-span-2">Station Code</div>
                        <div className="col-span-2">External Code</div>
                    </div>
                </div>
            </section>

            {/* Station List by Letter */}
            <section className="mx-auto max-w-5xl px-6 pb-12 space-y-4">
                {alphabet.map((letter) => {
                    const stations = grouped[letter];
                    if (!stations) return null;
                    return (
                        <div key={letter} id={`letter-${letter}`} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200">
                                <span className="text-lg font-bold text-[#3D3D3D]">{letter}</span>
                            </div>
                            <div className="divide-y divide-neutral-100">
                                {stations.map(([eng, kor, line, code, ext]) => (
                                    <div
                                        key={`${eng}-${line}-${code}`}
                                        className="grid grid-cols-12 gap-2 px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors"
                                    >
                                        <div className="col-span-3 font-medium flex items-center gap-1">
                                            <span className="text-[#F5C518]">&#9632;</span>
                                            {eng}
                                        </div>
                                        <div className="col-span-2 text-neutral-500">{kor}</div>
                                        <div className="col-span-3 text-neutral-600">{line}</div>
                                        <div className="col-span-2 text-neutral-400">{code}</div>
                                        <div className="col-span-2 text-neutral-400">{ext}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}
