// Ten:One™ Universe — 8 역할 그룹 SSOT
// 랜딩(/) · about(/about?tab=universe) 등 본사이트 여러 곳에서 공유.
// 새 브랜드 추가 시 이 파일만 수정하면 전 위치 반영.

export interface UniverseBrand {
    name: string;
    kr?: string;
    desc: string;
    href?: string;
}

export interface UniverseRoleGroup {
    num: string;
    role: string;
    color: string;
    brands: ReadonlyArray<UniverseBrand>;
}

export const UNIVERSE_ROLE_GROUPS: ReadonlyArray<UniverseRoleGroup> = [
    {
        num: "01", role: "철학 · 일하는 방법과 언어를 맞추는", color: "#C9B896",
        brands: [
            { name: "TenOne", kr: "텐원", desc: "Universe 설계자·운영자", href: "/" },
            { name: "Protocols", kr: "프로토콜", desc: "공통 언어 · Vrief · GPR" },
            { name: "Dokdae", kr: "독대", desc: "AI Agent 1:1 채널" },
            { name: "Intra", kr: "인트라", desc: "내부 관제 대시보드" },
            { name: "AI Agent", kr: "에이전트 팀", desc: "자동 브리핑 운영 체계" },
        ]
    },
    {
        num: "02", role: "일이 되게 하는", color: "#7BAE7F",
        brands: [
            { name: "WIO", kr: "Work In One", desc: "120+ 모듈 기업 운영 인프라", href: "/wio" },
            { name: "YouInOne", kr: "유인원", desc: "프로젝트 기획·실행", href: "/youinone" },
        ]
    },
    {
        num: "03", role: "사람을 모으는", color: "#E8845C",
        brands: [
            { name: "MADLeague", kr: "매드리그", desc: "전국 대학생 프로젝트 연합", href: "/madleague" },
            { name: "MADLeap", kr: "매드립", desc: "실전 프로젝트 부트캠프", href: "/madleap" },
            { name: "Badak", kr: "바닥", desc: "업계 실무자 네트워킹", href: "/badak" },
            { name: "ChangeUp", kr: "체인지업", desc: "창업 교육 · 펀딩", href: "/changeup" },
            { name: "0gamja", kr: "공감자", desc: "감성 콘텐츠 · 마음 상담", href: "/0gamja" },
            { name: "Domo", kr: "도모", desc: "하이엔드 비즈니스 연대", href: "/domo" },
            { name: "FWN", desc: "글로벌 패션위크 네트워크", href: "/fwn" },
        ]
    },
    {
        num: "04", role: "사람을 키우고 연결하는", color: "#D85A30",
        brands: [
            { name: "HeRo", kr: "히어로", desc: "데이터 기반 인재 발굴·매칭", href: "/hero" },
            { name: "Planner's", kr: "플래너스", desc: "AI 시대 기획자 교육", href: "/planners" },
        ]
    },
    {
        num: "05", role: "정보를 모으고 해석하는", color: "#5B8FB9",
        brands: [
            { name: "Mindle", kr: "마인들", desc: "트렌드 인텔리전스 엔진", href: "/mindle" },
        ]
    },
    {
        num: "06", role: "문제를 풀고 가치를 만드는", color: "#BA7517",
        brands: [
            { name: "SmarComm", kr: "스마콤", desc: "AI 마케팅 자동화 솔루션", href: "/smarcomm" },
            { name: "Brand Gravity", kr: "브랜드 그래비티", desc: "브랜딩 컨설팅" },
            { name: "Naming Factory", kr: "네이밍 팩토리", desc: "세상에서 가장 짧은 전략" },
            { name: "RooK", kr: "루크", desc: "AI 크리에이터", href: "/rook" },
        ]
    },
    {
        num: "07", role: "개인을 기록하는", color: "#9B7DD4",
        brands: [
            { name: "Myverse", kr: "마이버스", desc: "개인 디지털 기록 보관", href: "/myverse" },
        ]
    },
    {
        num: "08", role: "가능성을 키우는 — 인큐베이팅", color: "#888780",
        brands: [
            { name: "MoNTZ", kr: "몬츠", desc: "AI 버추얼 아티스트 에이전시", href: "/montz" },
            { name: "Townity", kr: "타우니티", desc: "하이퍼로컬 커뮤니티", href: "/townity" },
            { name: "Mullaesian", kr: "물래지앙", desc: "문래동 라이프 미디어", href: "/mullaesian" },
            { name: "Scribble", kr: "스크리블", desc: "출판 · 콘텐츠 IP" },
            { name: "NatureBox", kr: "자연함", desc: "강원도 친환경 농작물", href: "/naturebox" },
            { name: "Korea360", kr: "코리아360", desc: "외국인 커뮤니티 · 관광" },
            { name: "Seoul360", kr: "서울360", desc: "서울 지하철 여행 가이드", href: "/seoul360" },
        ]
    },
];
