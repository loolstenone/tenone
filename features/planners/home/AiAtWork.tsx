import { Check, Sparkles } from "lucide-react";

// 첫 화면 오른쪽 — 플래너'스 AI가 실제로 하는 일(생각 쏟아내기 → 할 일 제안 → 확인 후 등록)을 그림으로
// 앱 화면 캡처가 아니라 설명용 예시. 문구는 실제 기능(BrainDump·DayCoach) 그대로
const SUGGESTED = [
    { time: "10:00", text: "기획서 초안 1장 쓰기" },
    { time: "14:00", text: "어머니 생신 선물 고르기" },
    { time: "19:30", text: "달리기 30분" },
];

export function AiAtWork() {
    return (
        <div className="mx-auto w-full max-w-[520px] space-y-4" aria-hidden="true">
            <div className="bg-white/10 p-6 md:p-8">
                <p className="text-sm text-teal-200">생각 쏟아내기</p>
                <p className="mt-3 break-keep leading-relaxed text-white/90 md:text-lg">
                    내일까지 기획서 초안, 어머니 생신 선물 사야 하고, 이번 주엔 운동 세 번은 꼭…
                </p>
            </div>

            <div className="bg-white p-6 text-neutral-900 md:p-8">
                <p className="flex items-center gap-2 text-sm font-bold text-[#0F766E]">
                    <Sparkles className="h-4 w-4" /> 이렇게 정리해 볼까요?
                </p>
                <ul className="mt-5 space-y-3">
                    {SUGGESTED.map((s) => (
                        <li key={s.text} className="flex items-center gap-4">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-neutral-300">
                                <Check className="h-3.5 w-3.5 text-[#0F766E]" />
                            </span>
                            <span className="w-12 shrink-0 text-sm text-neutral-400">{s.time}</span>
                            <span className="break-keep">{s.text}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-6 border-t border-neutral-100 pt-4 text-sm text-neutral-500">정하는 것은 나, 확인하면 오늘 플래너에 들어갑니다.</p>
            </div>
        </div>
    );
}
