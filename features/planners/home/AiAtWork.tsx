import { ArrowDown, Check, Sparkles } from "lucide-react";

// 첫 화면 슬라이드 오른쪽 — 플래너'스 AI가 실제로 하는 일을 그림으로 (앱 화면 캡처가 아닌 설명용 예시)
// 장면 = 실제 기능 그대로: 생각 쏟아내기(BrainDump) · 못 끝낸 일 다시 놓기(AutoCarry) · 손글씨 옮기기(handwriting) · 오늘의 세 가지(DayCoach)
export type AiScene = "dump" | "carry" | "handwriting" | "focus";

const SCENES: Record<AiScene, { inputLabel: string; input: string; output: string; rows: { time: string; text: string }[]; foot: string }> = {
    dump: {
        inputLabel: "생각 쏟아내기",
        input: "내일까지 기획서 초안, 어머니 생신 선물 사야 하고, 이번 주엔 운동 세 번은 꼭…",
        output: "이렇게 정리해 볼까요?",
        rows: [
            { time: "10:00", text: "기획서 초안 1장 쓰기" },
            { time: "14:00", text: "어머니 생신 선물 고르기" },
            { time: "19:30", text: "달리기 30분" },
        ],
        foot: "정하는 것은 나, 확인하면 오늘 플래너에 들어갑니다.",
    },
    carry: {
        inputLabel: "어제 못 끝낸 일",
        input: "자료 조사 마무리 · 견적서 회신 · 책 30쪽 읽기",
        output: "오늘 빈 시간에 다시 놓았어요",
        rows: [
            { time: "09:30", text: "견적서 회신" },
            { time: "13:00", text: "자료 조사 마무리" },
            { time: "21:00", text: "책 30쪽 읽기" },
        ],
        foot: "일정 사이 빈 시간에만, 옮겨 적을 필요 없이.",
    },
    handwriting: {
        inputLabel: "손글씨 노트 사진",
        input: "• 팀 회의 안건 정리   × 은행 들르기   > 발표 연습",
        output: "글자로 옮겼어요",
        rows: [
            { time: "할 일", text: "팀 회의 안건 정리" },
            { time: "완료", text: "은행 들르기" },
            { time: "내일로", text: "발표 연습" },
        ],
        foot: "불렛 저널 기호도 알아봅니다. 사진은 저장하지 않습니다.",
    },
    focus: {
        inputLabel: "아침 8시",
        input: "오늘 할 일 9개, 일정 2개. 다 할 수는 없어요.",
        output: "오늘 꼭 할 세 가지",
        rows: [
            { time: "1", text: "제안서 결론 쓰기" },
            { time: "2", text: "고객 미팅 준비" },
            { time: "3", text: "저녁 산책" },
        ],
        foot: "저녁엔 오늘을, 주말엔 한 주를 함께 돌아봅니다.",
    },
};

export function AiAtWork({ scene = "dump" }: { scene?: AiScene }) {
    const s = SCENES[scene];
    // 크기는 화면 높이에 비례 (HeroCarousel과 같은 방식, 2026-10-15)
    return (
        <div className="mx-auto w-full max-w-[min(100%,560px)] space-y-[clamp(6px,1.2svh,16px)] md:mx-0 lg:mx-auto lg:max-w-[clamp(320px,40vw,600px)]" aria-hidden="true">
            <div className="bg-white/10 p-[clamp(14px,2.4svh,36px)]">
                <p className="text-[clamp(11px,1.5svh,14px)] text-teal-200">{s.inputLabel}</p>
                <p className="mt-[clamp(4px,0.8svh,12px)] break-keep text-[clamp(14px,2svh,19px)] leading-relaxed text-white/90">{s.input}</p>
            </div>

            {/* 비유의 방향: 쏟아 낸 것 → AI가 정리한 것 */}
            <div className="flex justify-center text-teal-200/70"><ArrowDown className="h-[clamp(14px,2svh,20px)] w-[clamp(14px,2svh,20px)]" /></div>

            <div className="bg-white p-[clamp(14px,2.4svh,36px)] text-neutral-900">
                <p className="flex items-center gap-2 text-[clamp(11px,1.5svh,14px)] font-bold text-[#0F766E]">
                    <Sparkles className="h-4 w-4" /> {s.output}
                </p>
                <ul className="mt-[clamp(8px,1.6svh,20px)] space-y-[clamp(6px,1.2svh,14px)] text-[clamp(14px,2svh,18px)]">
                    {s.rows.map((r) => (
                        <li key={r.text} className="flex items-center gap-4">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-neutral-300">
                                <Check className="h-3.5 w-3.5 text-[#0F766E]" />
                            </span>
                            <span className="w-12 shrink-0 text-[0.85em] text-neutral-400">{r.time}</span>
                            <span className="break-keep">{r.text}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-[clamp(14px,2.4svh,28px)] hidden border-t border-neutral-100 pt-[clamp(10px,1.6svh,16px)] text-[clamp(12px,1.5svh,14px)] text-neutral-500 [@media(min-width:1024px)_and_(min-height:860px)]:block">{s.foot}</p>
            </div>
        </div>
    );
}
