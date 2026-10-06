import type { Metadata } from "next";
import { ROOK_ASSETS, ROOK_GREEN, ROOK_YOUTUBE_CHANNEL } from "@/features/rook/RooKUI";
import { RooKContactForm } from "@/features/rook/RooKContactForm";

export const metadata: Metadata = {
    title: "About",
    description: "AI 크리에이터 루크 — AI 기술로 세상에 꼭 필요한 콘텐츠를 만드는 창의적이고 전략적인 전문가",
};

const VALUES = [
    { k: "창의성", v: "AI 기술을 활용하여 기존에 없던 독창적인 콘텐츠를 만듭니다." },
    { k: "전략", v: "시장과 사람들의 마음을 움직이는 콘텐츠를 기획하고 실행합니다." },
    { k: "인재 육성", v: "AI 크리에이터를 양성하고, 함께 성장하는 커뮤니티를 만듭니다." },
    { k: "선순환", v: "새로운 콘텐츠가 새로운 기회를 만들고, 이것이 다시 새로운 인재와 콘텐츠로 이어지는 구조를 만들어갑니다." },
];

export default function RooKAboutPage() {
    return (
        <div className="bg-white text-neutral-900">
            {/* 소개 */}
            <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ROOK_ASSETS.aboutHero} alt="AI 크리에이터 루크를 소개합니다" className="mx-auto w-full max-w-md" />
                <div className="mt-10 space-y-1 text-base md:text-lg leading-relaxed text-neutral-700 break-keep">
                    <p>AI를 통한 콘텐츠 제작, 누구나 쉽게 만들 수 있는 세상이 되었습니다.</p>
                    <p>심심풀이로 인공지능에게 요청만 해도 감탄할만한 콘텐츠가 만들어 지고 있습니다.</p>
                    <p>그런 소비자의 시간과 인식 사이로 브랜드는 어떻게 들어 갈 수 있을까요?</p>
                    <p className="pt-4 font-semibold text-black">루크는 고민하고 실천하고 있습니다.</p>
                    <p>AI 시대에 브랜드와 소비자를 위한 크리에이터가 되어야겠다고</p>
                </div>
                <div className="mt-10 space-y-1 text-base md:text-lg leading-relaxed text-neutral-700 break-keep">
                    <p><strong className="text-black">AI 크리에이터 루크</strong>는</p>
                    <p>AI 기술을 활용해 세상에 꼭 필요한 콘텐츠를 만드는 데 집중하는</p>
                    <p>창의적이고 전략적인 전문가입니다.</p>
                    <p className="pt-4">우리는 AI 기반 영상 제작 기술을 넘어, 시, 노래, 소설, 영화 등</p>
                    <p>사람들이 사랑하는 다양한 콘텐츠를 새로운 방식으로 창작하는 것을 선도합니다.</p>
                </div>
            </section>

            {/* 이름의 의미 */}
            <section className="bg-black text-white">
                <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ROOK_ASSETS.aboutRook} alt="Rook" loading="lazy" className="w-full" />
                    <div>
                        <p className="text-5xl font-bold tracking-tight">Rook</p>
                        <ol className="mt-6 space-y-3 text-white/80">
                            <li><span className="font-semibold" style={{ color: ROOK_GREEN }}>1</span>&nbsp; 체스판의 기물, 한국 장기의 차(車)와 같이 상하좌우로 직진한다.</li>
                            <li><span className="font-semibold" style={{ color: ROOK_GREEN }}>2</span>&nbsp; 떼 까마귀, 철새 (까마귀: Crow)</li>
                        </ol>
                        <a href={ROOK_YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer"
                            className="mt-8 inline-flex border border-white px-5 py-2.5 text-sm font-semibold hover:bg-white hover:text-black transition-colors">
                            YouTube 채널 보기
                        </a>
                    </div>
                </div>
            </section>

            {/* 철학·가치 */}
            <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
                <h2 className="text-3xl font-bold">우리의 철학</h2>
                <div className="mt-6 space-y-4 leading-relaxed text-neutral-700 break-keep">
                    <p>루크는 우리가 앞으로 마주할 미래의 새로운 일하는 방식을 실천하고 있습니다. 단순히 기술을 사용하는 것을 넘어, AI가 사람의 창의성을 확장하는 도구가 될 수 있음을 보여줍니다.</p>
                    <p>우리의 목표는 AI와 사람의 협력을 통해 새로운 가치를 창출하는 것입니다. 우리는 AI를 활용하여 세상에 꼭 필요한 콘텐츠를 만들고, 동시에 새로운 인재를 발굴하고 육성하는 선순환 구조를 만들어 나가고 있습니다.</p>
                    <p>이를 통해 우리는 AI와 인간이 함께 성장하며 더 나은 미래를 만들어가는 생태계를 구축하고 있습니다.</p>
                </div>
                <h2 className="mt-16 text-3xl font-bold">핵심 가치</h2>
                <dl className="mt-6 grid gap-px bg-neutral-200 sm:grid-cols-2">
                    {VALUES.map(x => (
                        <div key={x.k} className="bg-white p-6">
                            <dt className="font-bold" style={{ color: ROOK_GREEN }}>{x.k}</dt>
                            <dd className="mt-2 text-sm leading-relaxed text-neutral-700 break-keep">{x.v}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* 상담 / 문의 */}
            <section id="contact" className="scroll-mt-20 border-t border-neutral-200 bg-neutral-50">
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-20">
                    <h2 className="text-3xl font-bold">상담 / 문의</h2>
                    <p className="mt-2 mb-8 text-neutral-600 break-keep">AI 모델 섭외, 광고·뮤직비디오·콘텐츠 제작 등 무엇이든 문의해 주세요.</p>
                    <RooKContactForm kind="inquiry" />
                </div>
            </section>
        </div>
    );
}
