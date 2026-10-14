import type { Metadata } from "next";
import Link from "next/link";
import { PlannersPageHero, PLANNERS_CONTAINER, PLANNERS_SECTION } from "@/features/planners/PageHero";

// 원문: 구글 사이트 sites.google.com/tenone.biz/planners/planning (Planner's 기획론, 2020~) — 2026-10-14 이전하며 문장만 다듬음
export const metadata: Metadata = {
    title: "기획이란",
    description: "기획하다 = 주도적 + 목표 설정 + 전략 수립 + 계획. 이상과 현실의 차이를 문제로 보고, 그 문제를 풀어 가는 과정이 기획입니다.",
};

const FORMULAS = [
    { label: "기획하다", value: "주도적 + 목표 설정 + 전략 수립 + 계획" },
    { label: "해결해야 할 문제", value: "이상과 현실의 차이" },
    { label: "필요한 힘", value: "논리 + 분석 + 창의" },
];

export default function PlannersAboutPage() {
    return (
        <>
            <PlannersPageHero
                eyebrow="기획이란"
                title={<>우리는 모두 기획자다<span className="mt-2 block text-xl font-bold text-neutral-500 md:text-2xl">적어도 자기 인생에서만큼은</span></>}
                description={<>정부나 기업에서 하는 일만 기획이 아닙니다. 사람들은 크든 작든, 완벽하든 엉성하든 일을 시작하기 전에 저마다의 계획을 세웁니다. 하고 싶은 것, 또는 해결해야 하는 무언가를 이루기 위해서입니다.</>}
            />

            <section className={PLANNERS_SECTION}>
                <div className="grid gap-px border border-neutral-200 bg-neutral-200 md:grid-cols-3">
                    {FORMULAS.map((f) => (
                        <div key={f.label} className="bg-white p-6">
                            <p className="text-sm font-bold text-[#0F766E]">{f.label}</p>
                            <p className="mt-2 break-keep text-lg font-bold leading-snug">{f.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            <article className={`${PLANNERS_CONTAINER} pb-20`}>
                <div className="max-w-[760px]">
                <Chapter title="기획이라는 말">
                    <p>
                        기획자는 유독 우리나라에서 많이 쓰는 말입니다. 해외에도 상품 기획·제품 기획(PM)처럼 매니저라는 직함으로
                        비슷한 일을 하는 직업군이 있습니다. 그런데 우리는 왜 매니저와 기획자를 나눠 부를까요?
                    </p>
                    <p>
                        과거 중앙 부처에서 쓰던 &lsquo;기획&rsquo;이라는 말(경제기획원, 기획재정부 등)을 대기업이 기획조정실 같은 부서로
                        이어받은 데서 비롯되었다고 볼 수 있습니다. 그래서 우리말 &lsquo;기획&rsquo;에는 전략(Strategy)이 들어 있고,
                        이를 Planning으로 옮겨 쓰면서 뜻과 기능이 여러 겹으로 섞이게 되었습니다.
                    </p>
                    <p>
                        여기에 관리(Manager)의 개념이 더해지고, 의사결정권자 가까이에서 일하는 경우가 많아 권한이 강한 일이라는
                        인상도 함께 붙었습니다. 사전적으로는 목적을 이루기 위한 방법을 설계하고 계획한다는 뜻입니다.
                    </p>
                    <p>이 모두를 경험에 비추어 정리하면 이렇습니다.</p>
                    <Formula>기획하다 = 주도적 + 목표 설정 + 전략 수립 + 계획</Formula>
                </Chapter>

                <Chapter title="왜 기획하는가 · 문제 해결">
                    <p>
                        하고 싶은 것, 해결하고 싶은 것이 있다는 말은 지금 그것이 없다는 뜻입니다.
                        바라는 이상과 현실 사이에 차이가 있다는 말입니다.
                    </p>
                    <p>이 차이를 문제라고 부를 수 있고, 그 문제를 풀어 가는 과정이 바로 기획입니다.</p>
                    <Formula>이상과 현실의 차이 = 해결해야 할 문제</Formula>
                </Chapter>

                <Chapter title="필요한 것">
                    <p>
                        기획이라고 하면 말끔한 차림의 사람이 정제된 언어로 엑셀과 파워포인트를 다루는 모습이 떠오릅니다.
                        논리적이고 분석적인 일이라는 인상입니다.
                    </p>
                    <p>
                        논리력과 분석력은 분명 기획에 도움이 됩니다. 앞선 사회를 따라가며 성장하던 시기에는 반드시 필요한 힘이었습니다.
                        그러나 사회가 고도화되고 다양해진 지금은 상상력과 기발함에서 나오는 창의성이 꼭 필요합니다.
                        논리와 분석을 기본으로 하되, 그 위에 창의를 더해야 합니다.
                    </p>
                    <Formula>논리 + 분석 + 창의</Formula>
                </Chapter>

                <Chapter title="기획의 완성">
                    <p>
                        논리를 바탕으로 이상과 현실의 차이인 문제를 분석하고, 목표를 정하고, 목표를 이룰 전략을 세우고,
                        실행에 필요한 시간·사람·비용 계획까지 마치면 계획을 만드는 과정은 끝납니다.
                    </p>
                    <p>
                        그다음부터는 이상을 실현하는 매니저의 역할이 필요합니다. 함께하는 사람들과 일정·인력·비용을 관리하고,
                        목표에 맞게 가고 있는지 살피고, 예상하지 못한 문제의 해법까지 찾아내며 끝까지 함께 가야 합니다.
                    </p>
                    <p>
                        일이 크고 조직이 크면 이 과정을 팀 단위로 나눠 맡을 수도 있습니다. 그러나 일의 크기와 상관없이
                        기획자의 기본 마음가짐은 같습니다. <strong>일이 되게 하는 방법을 찾는 것.</strong>
                    </p>
                    <Formula>문제 분석 · 목표 설정 · 계획 → 끝까지 실행</Formula>
                </Chapter>

                <div className="mt-32 border-t border-neutral-200 pt-16">
                    <h2 className="text-2xl font-bold">기획을 손에 익히는 방법</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <NextLink href="/planners/ai" title="AI" desc="Plan · Do · See를 디지털로, 인공지능 플래너" />
                        <NextLink href="/planners/pad" title="PAD" desc="굿노트 등에서 손으로 쓰는 플래너와 서식" />
                        <NextLink href="/planners/projects" title="프로젝트" desc="팀을 꾸려 실제 과제를 기획" />
                    </div>
                </div>
                </div>
            </article>
        </>
    );
}

function Chapter({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mt-24 first:mt-0 md:mt-32">
            <h2 className="border-l-4 border-[#0F766E] pl-5 text-2xl font-bold md:text-3xl">{title}</h2>
            <div className="mt-10 space-y-8 break-keep text-[17px] leading-[1.95] text-neutral-700 md:text-lg">{children}</div>
        </section>
    );
}

function Formula({ children }: { children: React.ReactNode }) {
    return <p className="!my-12 border border-neutral-200 bg-neutral-50 px-6 py-8 text-center font-bold text-neutral-900 md:text-xl">{children}</p>;
}

function NextLink({ href, title, desc }: { href: string; title: string; desc: string }) {
    return (
        <Link href={href} className="block border border-neutral-200 p-5 transition-colors hover:border-[#0F766E]">
            <p className="font-bold">{title} →</p>
            <p className="mt-1 break-keep text-sm text-neutral-600">{desc}</p>
        </Link>
    );
}
