import type { Metadata } from "next";
import { ROOK_ASSETS, RooKContainer } from "@/features/rook/RooKUI";
import { RooKContactModalButton } from "@/features/rook/RooKContactForm";

export const metadata: Metadata = {
    title: "About",
    description: "AI 크리에이터 루크 — AI 기술로 세상에 꼭 필요한 콘텐츠를 만드는 창의적이고 전략적인 전문가",
};

const VALUES = [
    ["창의성", "AI 기술을 활용하여 기존에 없던 독창적인 콘텐츠를 만듭니다."],
    ["전략", "시장과 사람들의 마음을 움직이는 콘텐츠를 기획하고 실행합니다."],
    ["인재 육성", "AI 크리에이터를 양성하고, 함께 성장하는 커뮤니티를 만듭니다."],
    ["선순환", "새로운 콘텐츠가 새로운 기회를 만들고, 이것이 다시 새로운 인재와 콘텐츠로 이어지는 구조를 만들어갑니다."],
];

/** 원본 rook.co.kr/about: 왼쪽 소개 글 · 오른쪽 Rook 이미지·뜻 → 상담 / 문의(팝업) → 철학·핵심 가치 */
export default function RooKAboutPage() {
    return (
        <RooKContainer className="py-12 md:py-16 text-[16px] leading-[1.6] text-black">
            <div className="grid gap-10 md:grid-cols-[623fr_297fr] md:gap-[30px] md:px-[15px]">
                <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ROOK_ASSETS.aboutTitle} alt="RooK" className="w-full max-w-[400px] md:w-[133px]" />
                    <p className="mt-8 text-[24px]"><strong>AI 크리에이터 루크</strong>를 소개합니다.</p>
                    <div className="mt-8 break-keep">
                        <p>AI를 통한 콘텐츠 제작, 누구나 쉽게 만들 수 있는 세상이 되었습니다.</p>
                        <p className="mt-6">심심풀이로 인공지능에게 요청만 해도 감탄할만한 콘텐츠가 만들어 지고 있습니다.</p>
                        <p>그런 소비자의 시간과 인식 사이로 브랜드는 어떻게 들어 갈 수 있을까요?</p>
                        <p>루크는 고민하고 실천하고 있습니다.</p>
                        <p>AI 시대에 브랜드와 소비자를 위한 크리에이터가 되어야겠다고</p>
                    </div>
                    <div className="mt-10 break-keep">
                        <p>AI 크리에이터 루크는</p>
                        <p className="mt-6">AI 기술을 활용해 세상에 꼭 필요한 콘텐츠를 만드는 데 집중하는</p>
                        <p>창의적이고 전략적인 전문가입니다.</p>
                        <p>우리는 AI 기반 영상 제작 기술을 넘어, 시, 노래, 소설, 영화 등</p>
                        <p>사람들이 사랑하는 다양한 콘텐츠를 새로운 방식으로 창작하는 것을 선도합니다.</p>
                    </div>
                </div>
                <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ROOK_ASSETS.aboutRook} alt="Rook" loading="lazy" className="w-full" />
                    <p className="mt-6 text-[24px] font-bold">Rook</p>
                    <p className="mt-3">1: 체스판의 기물, 한국 장기의 차(車)와 같이 상하좌우로 직진한다.</p>
                    <p className="mt-2">2: 떼 까마귀, 철새 (까마귀: Crow)</p>
                </div>
            </div>

            <div className="my-14 text-center">
                <RooKContactModalButton kind="inquiry" label="상담 / 문의" />
            </div>

            <div className="md:px-[15px] break-keep">
                <h2 className="text-[24px] font-bold">우리의 철학</h2>
                <p className="mt-4">루크는 우리가 앞으로 마주할 미래의 새로운 일하는 방식을 실천하고 있습니다. 단순히 기술을 사용하는 것을 넘어, AI가 사람의 창의성을 확장하는 도구가 될 수 있음을 보여줍니다.</p>
                <p className="mt-4">우리의 목표는 AI와 사람의 협력을 통해 새로운 가치를 창출하는 것입니다. 우리는 AI를 활용하여 세상에 꼭 필요한 콘텐츠를 만들고, 동시에 새로운 인재를 발굴하고 육성하는 선순환 구조를 만들어 나가고 있습니다.</p>
                <p className="mt-4">이를 통해 우리는 AI와 인간이 함께 성장하며 더 나은 미래를 만들어가는 생태계를 구축하고 있습니다.</p>

                <h2 className="mt-12 text-[24px] font-bold">핵심 가치</h2>
                <ul className="mt-4 list-disc space-y-3 pl-10">
                    {VALUES.map(([k, v]) => <li key={k}><strong>{k}</strong>: {v}</li>)}
                </ul>
            </div>
        </RooKContainer>
    );
}
