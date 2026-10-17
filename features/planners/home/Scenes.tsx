import { AiAtWork, type AiScene } from "@/features/planners/home/AiAtWork";

// 플래너를 그만두게 되는 세 가지 고통 → 플래너'스 AI가 덜어 주는 장면 (2026-10-18 핸드오프 "기능은 장면으로 설득된다")
// 첫 화면·플래너'스 AI 소개가 같이 쓴다. 그림은 설명용 예시(AiAtWork) - 실제 앱 화면 캡처가 생기면 visual만 바꾼다
export interface PainScene {
    key: AiScene;
    pain: string;
    title: string;
    before: string;
    after: string;
}

export const PAIN_SCENES: PainScene[] = [
    {
        key: "carry",
        pain: "밀린 일 다시 쓰기",
        title: "못 끝낸 일, 다시 놓아 드립니다",
        before: "못 끝낸 일 일곱 개를 다음 날 칸에 옮겨 적던 저녁",
        after: "일정 사이 빈 시간에 다시 놓여 있고, 나는 확인만",
    },
    {
        key: "handwriting",
        pain: "손으로 쓴 것 옮기기",
        title: "손글씨 사진 한 장이 할 일로",
        before: "종이와 패드에 쓴 할 일을 앱에 다시 치던 시간",
        after: "사진 한 장이면 글자로, 끝냄·미룸 표시까지 그대로",
    },
    {
        key: "focus",
        pain: "혼자 돌아보기",
        title: "아침엔 세 가지, 저녁엔 함께 돌아보기",
        before: "다 못 했다는 기분만 남던 하루의 끝",
        after: "오늘 꼭 할 세 가지로 시작하고, 저녁과 주말엔 함께 돌아봅니다",
    },
];

/** 장면 한 줄 - 왼쪽 글(고통 · 제목 · 전/후), 오른쪽 그림. reverse면 좌우를 바꾼다 */
export function SceneRow({ scene, reverse = false }: { scene: PainScene; reverse?: boolean }) {
    return (
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-24">
            <div className={reverse ? "lg:order-2" : ""}>
                <p className="text-sm font-bold text-[#0F766E]">{scene.pain}</p>
                <h3 className="mt-4 break-keep text-3xl font-bold md:text-4xl">{scene.title}</h3>
                <dl className="mt-8 space-y-4 break-keep md:text-lg">
                    <div className="flex gap-4">
                        <dt className="w-10 shrink-0 font-bold text-neutral-400">전</dt>
                        <dd className="text-neutral-500">{scene.before}</dd>
                    </div>
                    <div className="flex gap-4">
                        <dt className="w-10 shrink-0 font-bold text-[#0F766E]">후</dt>
                        <dd className="font-medium text-neutral-900">{scene.after}</dd>
                    </div>
                </dl>
            </div>
            <div className={`bg-[#134E4A] p-6 text-white md:p-10 ${reverse ? "lg:order-1" : ""}`}>
                <AiAtWork scene={scene.key} />
            </div>
        </div>
    );
}
