import type { Metadata } from "next";
import { ROOK_ASSETS, RooKContainer } from "@/features/rook/RooKUI";
import { RooKContactModalButton } from "@/features/rook/RooKContactForm";
import { ProgramBoard } from "@/features/programs/ProgramBoard";
import { PROGRAM_THEMES } from "@/features/programs/ProgramTheme";

export const metadata: Metadata = {
    title: "RooKie",
    description: "루크에서 함께 창의적인 활동을 할 루키를 모집합니다. Just Do It!",
};

const TARGETS = [
    "인공지능 기술에 대한 깊은 이해가 있거나, 관심을 가지고 있는 사람",
    "독특하고 창의적인 아이디어를 가진 사람",
    "기술, 창의적 아이디어를 융합하고 싶어하는 열정을 가진 사람",
    "전공, 경력 무관 그러나 책임감, 성실함은 기본 장착 필요",
];
const METHODS = [
    "본인의 관심사를 중심으로 AI를 활용한 창작물을 공모 (내부 심사)",
    "추천 제도: 기존 RooKie 멤버, YouInOne멤버가 검증한 인재 추천",
];
const OPERATIONS: { title: string; items: [string, string][] }[] = [
    {
        title: "RooKie 멤버십 단계",
        items: [
            ["루키(Rookie)", "프로젝트에 참여하며 기술을 배우고, 아이디어를 구체화하는 단계."],
            ["슈퍼 루키(Super Rookie)", "특정 분야의 전문성을 가지고 프로젝트를 주도하며, 루키들을 멘토링하는 단계."],
        ],
    },
    {
        title: "커뮤니티 활동",
        items: [
            ["주간 아이디어 세션", "매주 새로운 AI 기술과 크리에이티브 아이디어를 공유하고 토론하는 시간을 가집니다."],
            ["월간 프로젝트 발표", "매달 팀을 구성하여 하나의 프로젝트를 완성하고, 그 과정을 공유하며 피드백을 주고받습니다."],
            ["자유로운 협업", "RooKie들이 자유롭게 팀을 꾸려 원하는 프로젝트를 진행할 수 있도록 지원합니다."],
        ],
    },
];
const VALUES: [string, string][] = [
    ["성장 지원", "최신 AI 기술에 대한 정보와 교육, 그리고 다양한 분야의 전문가들과 교류할 수 있는 기회를 제공합니다."],
    ["수익 공유", "RooK의 이름으로 진행된 프로젝트의 수익을 RooKie들과 공정하게 분배합니다."],
    ["네트워크 확장", "다른 크리에이터, 기업, 그리고 미디어 전문가들과의 네트워킹 기회를 제공하여 RooKie들의 활동 범위를 넓혀줍니다."],
    ["개인 브랜딩", "RooK의 소셜 미디어와 웹사이트를 통해 RooKie들의 포트폴리오를 홍보하고 개인 브랜딩을 돕습니다."],
];

function Bullets({ items }: { items: (string | [string, string])[] }) {
    return (
        <ul className="mt-3 list-disc space-y-1 pl-10">
            {items.map(it => typeof it === "string"
                ? <li key={it}>{it}</li>
                : <li key={it[0]}><strong>{it[0]}</strong>: {it[1]}</li>)}
        </ul>
    );
}

/** 원본 rook.co.kr/rookie: 왼쪽 소개 글 · 오른쪽 모집 이미지 → 루키 모집 → 지원하기(팝업) → 운영 방안 → 제공 가치 */
export default function RooKRookiePage() {
    return (
        <RooKContainer className="py-12 md:py-16 text-[16px] leading-[1.6] text-black">
            <div className="grid gap-10 md:grid-cols-[542fr_378fr] md:gap-[30px] md:px-[15px]">
                <div className="break-keep">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ROOK_ASSETS.rookieTitle} alt="RooKie" className="w-full max-w-[400px] md:w-[133px]" />
                    <p className="mt-8 text-[24px]"><strong>슈퍼 루키</strong>를 기다리며.</p>
                    <p className="mt-8">동전을 먼저 봤다고 임자가 되는 것은 아닙니다.</p>
                    <p>먼저 주워야 임자가 됩니다.</p>
                    <p className="mt-6">세상에는 이미 수 많은 인공지능 전문가들이 있습니다.</p>
                    <p>생각만 하고 있다면 지금 바로 &quot;Just Do It!&quot;</p>
                    <p>그냥 해 보는 겁니다.</p>
                    <p className="mt-6">루크에서 함께 창의적인 활동을 할 루키를 모집합니다.</p>
                    <p>함께 정보도 공유하고 연구하여 새로운 시대에 주도적으로 살아 봅시다</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ROOK_ASSETS.rookieRecruit} alt="루키 모집" loading="lazy" className="w-full" />
            </div>

            <div className="mt-14 md:px-[15px] break-keep">
                <h2 className="text-[24px] font-bold">루키 모집</h2>
                <h3 className="mt-6 font-bold">모집 대상</h3>
                <Bullets items={TARGETS} />
                <h3 className="mt-6 font-bold">모집 방식</h3>
                <Bullets items={METHODS} />
            </div>

            <div className="my-14 text-center">
                <RooKContactModalButton kind="rookie" label="RooKie 지원하기" />
            </div>

            {/* 모집 중인 실전 프로젝트 (코어 프로그램 모듈) — 회차가 없으면 숨김. 원본 화면은 그대로 유지 */}
            <div className="mb-14 md:px-[15px]">
                <ProgramBoard theme={PROGRAM_THEMES.rook} brands={["rook"]} dark={false} title="모집 중인 실전 프로젝트" hideWhenEmpty />
            </div>

            <div className="md:px-[15px] break-keep">
                <h2 className="text-[24px] font-bold">RooKie 운영 방안</h2>
                {OPERATIONS.map(s => (
                    <div key={s.title} className="mt-6">
                        <h3 className="font-bold">{s.title}</h3>
                        <Bullets items={s.items} />
                    </div>
                ))}
                <h2 className="mt-12 text-[24px] font-bold">RooKie에게 제공하는 가치</h2>
                <Bullets items={VALUES} />
            </div>
        </RooKContainer>
    );
}
