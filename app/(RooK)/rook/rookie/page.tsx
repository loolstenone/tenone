import type { Metadata } from "next";
import { ROOK_ASSETS, ROOK_GREEN } from "@/features/rook/RooKUI";
import { RooKContactForm } from "@/features/rook/RooKContactForm";

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
    "추천 제도: 기존 RooKie 멤버, YouInOne 멤버가 검증한 인재 추천",
];
const SECTIONS: { title: string; items: { k: string; v: string }[] }[] = [
    {
        title: "RooKie 멤버십 단계",
        items: [
            { k: "루키 (Rookie)", v: "프로젝트에 참여하며 기술을 배우고, 아이디어를 구체화하는 단계." },
            { k: "슈퍼 루키 (Super Rookie)", v: "특정 분야의 전문성을 가지고 프로젝트를 주도하며, 루키들을 멘토링하는 단계." },
        ],
    },
    {
        title: "커뮤니티 활동",
        items: [
            { k: "주간 아이디어 세션", v: "매주 새로운 AI 기술과 크리에이티브 아이디어를 공유하고 토론하는 시간을 가집니다." },
            { k: "월간 프로젝트 발표", v: "매달 팀을 구성하여 하나의 프로젝트를 완성하고, 그 과정을 공유하며 피드백을 주고받습니다." },
            { k: "자유로운 협업", v: "RooKie들이 자유롭게 팀을 꾸려 원하는 프로젝트를 진행할 수 있도록 지원합니다." },
        ],
    },
    {
        title: "RooKie에게 제공하는 가치",
        items: [
            { k: "성장 지원", v: "최신 AI 기술에 대한 정보와 교육, 그리고 다양한 분야의 전문가들과 교류할 수 있는 기회를 제공합니다." },
            { k: "수익 공유", v: "RooK의 이름으로 진행된 프로젝트의 수익을 RooKie들과 공정하게 분배합니다." },
            { k: "네트워크 확장", v: "다른 크리에이터, 기업, 그리고 미디어 전문가들과의 네트워킹 기회를 제공하여 RooKie들의 활동 범위를 넓혀줍니다." },
            { k: "개인 브랜딩", v: "RooK의 소셜 미디어와 웹사이트를 통해 RooKie들의 포트폴리오를 홍보하고 개인 브랜딩을 돕습니다." },
        ],
    },
];

export default function RooKRookiePage() {
    return (
        <div className="bg-white text-neutral-900">
            <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ROOK_ASSETS.rookieHero} alt="슈퍼 루키를 기다리며" className="mx-auto w-full max-w-md" />
                <div className="mt-10 space-y-1 text-base md:text-lg leading-relaxed text-neutral-700 break-keep">
                    <p>동전을 먼저 봤다고 임자가 되는 것은 아닙니다.</p>
                    <p className="font-semibold text-black">먼저 주워야 임자가 됩니다.</p>
                    <p className="pt-4">세상에는 이미 수 많은 인공지능 전문가들이 있습니다.</p>
                    <p>생각만 하고 있다면 지금 바로 <strong className="text-black">&quot;Just Do It!&quot;</strong> 그냥 해 보는 겁니다.</p>
                    <p className="pt-4">루크에서 함께 창의적인 활동을 할 루키를 모집합니다.</p>
                    <p>함께 정보도 공유하고 연구하여 새로운 시대에 주도적으로 살아 봅시다.</p>
                </div>
            </section>

            <section className="bg-black text-white">
                <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ROOK_ASSETS.rookieRecruit} alt="루키 모집" loading="lazy" className="w-full" />
                    <div>
                        <h2 className="text-3xl font-bold">루키 모집</h2>
                        <h3 className="mt-8 text-sm font-semibold tracking-widest" style={{ color: ROOK_GREEN }}>모집 대상</h3>
                        <ul className="mt-3 space-y-2 text-white/80">{TARGETS.map(t => <li key={t} className="break-keep">· {t}</li>)}</ul>
                        <h3 className="mt-8 text-sm font-semibold tracking-widest" style={{ color: ROOK_GREEN }}>모집 방식</h3>
                        <ul className="mt-3 space-y-2 text-white/80">{METHODS.map(t => <li key={t} className="break-keep">· {t}</li>)}</ul>
                        <a href="#apply" className="mt-8 inline-flex px-6 py-3 text-sm font-semibold text-black" style={{ backgroundColor: ROOK_GREEN }}>
                            RooKie 지원하기
                        </a>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
                <h2 className="text-3xl font-bold">RooKie 운영 방안</h2>
                {SECTIONS.map(s => (
                    <div key={s.title} className="mt-12">
                        <h3 className="text-lg font-bold">{s.title}</h3>
                        <dl className="mt-4 grid gap-px bg-neutral-200 sm:grid-cols-2">
                            {s.items.map(x => (
                                <div key={x.k} className="bg-white p-6">
                                    <dt className="font-bold" style={{ color: ROOK_GREEN }}>{x.k}</dt>
                                    <dd className="mt-2 text-sm leading-relaxed text-neutral-700 break-keep">{x.v}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ))}
            </section>

            <section id="apply" className="scroll-mt-20 border-t border-neutral-200 bg-neutral-50">
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-20">
                    <h2 className="text-3xl font-bold">RooKie 지원하기</h2>
                    <p className="mt-2 mb-8 text-neutral-600 break-keep">AI로 만든 창작물 링크와 하고 싶은 작업을 알려 주세요. 내부 심사 후 연락드립니다. (만 14세 이상)</p>
                    <RooKContactForm kind="rookie" />
                </div>
            </section>
        </div>
    );
}
