import type { Metadata } from "next";
import Link from "next/link";
import { FileGroup } from "@/features/planners/FileList";
import { groupByCategory, listPlannersFiles, PLANNER_CATEGORIES } from "@/lib/planners/library";

// 원문: 바닥상회 '플래너'스 플래너' 상품 설명 + 구글 사이트 planners-planner (플래너를 다시 만들다 · 작동 방식 · 작성 방식)
export const metadata: Metadata = {
    title: "플래너",
    description: "아이패드·갤럭시 탭의 굿노트·삼성노트·XODO에서 쓰는 기획자의 플래너. 하이퍼링크로 전체 페이지를 오가는 PDF 플래너와 프로젝트 북.",
};

const PACKAGE = [
    { name: "플래너'스 플래너", desc: "나의 사명을 세우고, 연간·월간·일간 단위로 Plan·Do·See" },
    { name: "프로젝트 북 (Frame + Work + Book)", desc: "업무·연구·학습 같은 프로젝트 단위의 Plan·Do·See" },
    { name: "데일리 (Schedule & To-Do)", desc: "가장 작은 단위의 일정 관리" },
    { name: "템플릿 (100여 종)", desc: "창의적인 발상과 분석을 돕는 노트·프레임워크 서식" },
];

const STEPS = [
    { title: "Objective 작성", desc: "나 자신을 돌아보고 평가해 비전(되고 싶은 것)과 미션(그것을 위해 해야 할 것)을 세웁니다. 목표는 비전을 이루기 위한 미션의 구체적인 방향과 위치입니다." },
    { title: "Key Result와 실행 계획", desc: "목표를 이루기 위해 실행할 핵심 결과 지표를 씁니다. 학업·업무·건강·가족 무엇이든, 꾸준히 관리할 수 있고 구체적인 성과를 낼 수 있는 것이어야 합니다." },
    { title: "목표와 지표를 늘 가운데에", desc: "모든 활동에서 목표와 핵심 결과 지표를 중심에 둡니다. 이 일이 맞는지, 효율적인지 판단하는 기준이 됩니다." },
    { title: "다양한 방법으로 점검", desc: "목표와 지표는 언제든 고칠 수 있습니다. 일정을 짜고 메모하고 아이디어를 낼 때도 생각을 정리하고 키워드를 뽑는 습관을 들입니다." },
];

export default async function PlannersPlannerPage() {
    const files = await listPlannersFiles("planner");
    const groups = groupByCategory(files, PLANNER_CATEGORIES);

    return (
        <>
            <section className="bg-[#134E4A] text-white">
                <div className="mx-auto max-w-[980px] px-4 py-20 md:px-[15px] md:py-24">
                    <p className="text-sm font-bold tracking-widest text-teal-300">플래너</p>
                    <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">플래너&apos;스 플래너</h1>
                    <p className="mt-8 max-w-2xl break-keep text-lg leading-relaxed text-teal-50">
                        아이패드·갤럭시 탭에서 굿노트, 삼성노트, XODO 같은 노트 앱으로 쓰는 PDF 플래너입니다.
                        기획에 도움이 되는 양식을 담았고, 하이퍼링크와 인덱스로 전체 페이지를 바로 오갈 수 있습니다.
                    </p>
                    <p className="mt-4 text-sm text-teal-200">Ten:One™ 계정으로 로그인하면 누구나 받을 수 있습니다.</p>
                </div>
            </section>

            <section className="mx-auto max-w-[980px] px-4 py-16 md:px-[15px]">
                <h2 className="text-[28px] font-bold">플래너를 다시 만들다</h2>
                <div className="mt-5 max-w-2xl space-y-4 break-keep leading-[1.85] text-neutral-700">
                    <p>
                        고등학교 시절부터 하드보드지와 한지로 시스템 다이어리 표지와 속지를 만들어 주변에 선물하곤 했습니다.
                        사회에 나와서는 아웃룩, 구글 같은 여러 일정 프로그램과 앱을 써 봤지만 어느 하나에 정착하지 못했습니다.
                    </p>
                    <p>
                        손으로 정리하는 것에 대한 미련이 남아 태블릿용으로 직접 만들어 보았고, 써 보니 괜찮아 함께 나누게 되었습니다.
                        정답은 없습니다. 플래너&apos;스 플래너도 참고할 만한 하나의 방법으로 써 보시고, 자신만의 더 나은 방법을 찾으시기 바랍니다.
                    </p>
                </div>

                <h2 className="mt-14 text-[28px] font-bold">구성</h2>
                <ul className="mt-6 grid gap-px border border-neutral-200 bg-neutral-200 md:grid-cols-2">
                    {PACKAGE.map((p) => (
                        <li key={p.name} className="bg-white p-5">
                            <p className="font-bold">{p.name}</p>
                            <p className="mt-1 break-keep text-sm text-neutral-600">{p.desc}</p>
                        </li>
                    ))}
                </ul>

                <h2 className="mt-14 text-[28px] font-bold">쓰는 방법</h2>
                <p className="mt-3 break-keep text-neutral-600">일을 시작할 때는 언제나 &ldquo;왜?&rdquo;라는 질문을 품고 시작합니다. 따지라는 것이 아니라, 이 일을 왜 하는지 알고 시작하자는 뜻입니다.</p>
                <ol className="mt-6 space-y-4">
                    {STEPS.map((s, i) => (
                        <li key={s.title} className="flex gap-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#0F766E] text-sm font-bold text-white">{i + 1}</span>
                            <div>
                                <p className="font-bold">{s.title}</p>
                                <p className="mt-1 break-keep text-sm leading-relaxed text-neutral-600">{s.desc}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="bg-neutral-50">
                <div className="mx-auto max-w-[980px] space-y-12 px-4 py-16 md:px-[15px]">
                    {groups.length === 0 ? (
                        <p className="text-neutral-500">아직 올라온 플래너가 없습니다.</p>
                    ) : (
                        groups.map(([category, items]) => <FileGroup key={category} title={category} files={items} />)
                    )}
                    <p className="text-sm text-neutral-600">
                        플래너에 더해 쓰는 노트·프레임워크 서식은 <Link href="/planners/templates" className="font-bold text-[#0F766E] hover:underline">템플릿</Link>에 있습니다.
                    </p>
                </div>
            </section>
        </>
    );
}
