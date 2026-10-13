"use client";

/**
 * AI 면접 예행연습 — 면접 화면 (interview.tenone.biz)
 * 시작 → 면접관 메시지 타이핑 → 답 고르기 ×7 → '판정 중' 연출 → 결과 통지서 /r/{code}
 * 답변은 저장하지 않는다 — 결과는 URL 코드로만 (lib/projects/interview.ts)
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { INTERVIEWER, INTRO, QUESTIONS, SITE, toCode } from "@/lib/projects/interview";
import { interviewBase } from "@/features/projects/interview/base";

const GREEN = "#3DDC84";

function useTyped(text: string, speed = 22) {
    const [n, setN] = useState(0);
    useEffect(() => {
        setN(0);
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setN(text.length); return; }
        const t = setInterval(() => setN(v => { if (v >= text.length) { clearInterval(t); return v; } return v + 1; }), speed);
        return () => clearInterval(t);
    }, [text, speed]);
    return { shown: text.slice(0, n), done: n >= text.length, skip: () => setN(text.length) };
}

const JUDGING = ["답변 7건 수신 완료", "인간미 함량 측정 중…", "전기요금 대비 효율 계산 중…", "AI 대체 가능성 산출 중…", "결과 통지서 출력 중…"];

export default function InterviewPage() {
    const router = useRouter();
    const [stage, setStage] = useState<"intro" | "q" | "judging">("intro");
    const [idx, setIdx] = useState(0);
    const [picks, setPicks] = useState<number[]>([]);
    const [judgeStep, setJudgeStep] = useState(0);
    const lock = useRef(false);

    const message = stage === "intro" ? INTRO.join("\n") : stage === "q" ? QUESTIONS[idx].q : "";
    const typed = useTyped(message);

    function pick(i: number) {
        if (lock.current) return;
        lock.current = true;
        const next = [...picks, i];
        setPicks(next);
        setTimeout(() => {
            lock.current = false;
            if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
            else setStage("judging");
        }, 250);
    }

    useEffect(() => {
        if (stage !== "judging") return;
        if (judgeStep < JUDGING.length) {
            const t = setTimeout(() => setJudgeStep(s => s + 1), 550);
            return () => clearTimeout(t);
        }
        router.push(`${interviewBase(window.location.host)}/r/${toCode(picks)}`);
    }, [stage, judgeStep, picks, router]);

    return (
        <main className="mx-auto max-w-xl px-4 sm:px-6 py-10 sm:py-16 font-mono">
            {/* 상단 바 */}
            <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-8">
                <span><span style={{ color: GREEN }}>●</span> 면접관 {INTERVIEWER} 연결됨</span>
                {stage === "q" && <span>질문 {idx + 1} / {QUESTIONS.length}</span>}
            </div>
            {stage === "q" && (
                <div className="h-1 bg-neutral-800 rounded mb-8 overflow-hidden">
                    <div className="h-full transition-all duration-300" style={{ width: `${(idx / QUESTIONS.length) * 100}%`, backgroundColor: GREEN }} />
                </div>
            )}

            {stage === "intro" && (
                <header className="mb-8">
                    <p className="text-xs mb-3" style={{ color: GREEN }}>{SITE.eyebrow}</p>
                    <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight mb-3 break-keep">{SITE.title}</h1>
                    <p className="font-sans text-neutral-300 break-keep">{SITE.tagline}</p>
                    <p className="text-xs text-neutral-500 mt-2">{SITE.meta}</p>
                </header>
            )}

            {stage !== "judging" ? (
                <section>
                    {/* 면접관 메시지 — 누르면 타이핑 건너뛰기 */}
                    <button type="button" onClick={typed.skip} className="block w-full text-left bg-[#111813] border border-[#1F2A22] rounded-lg p-4 sm:p-5 mb-6 min-h-[7rem]">
                        <p className="text-[11px] text-neutral-500 mb-2">{INTERVIEWER} &gt;</p>
                        <p className="font-sans text-[15px] leading-relaxed whitespace-pre-line break-keep" style={{ color: "#D7F5E1" }}>
                            {typed.shown}{!typed.done && <span className="inline-block w-2 h-4 align-middle ml-0.5 animate-pulse" style={{ backgroundColor: GREEN }} />}
                        </p>
                    </button>

                    {stage === "intro" && typed.done && (
                        <button type="button" onClick={() => setStage("q")}
                            className="w-full py-4 rounded-lg font-sans font-bold text-[#0B0F0C] hover:opacity-90 transition-opacity" style={{ backgroundColor: GREEN }}>
                            면접 시작하기
                        </button>
                    )}

                    {stage === "q" && typed.done && (
                        <ul className="space-y-2.5">
                            {QUESTIONS[idx].answers.map((a, i) => (
                                <li key={a.text}>
                                    <button type="button" onClick={() => pick(i)}
                                        className="w-full text-left font-sans text-[15px] px-4 py-3.5 rounded-lg border border-neutral-700 hover:border-[#3DDC84] hover:bg-[#3DDC84]/10 transition-colors break-keep">
                                        <span className="font-mono text-xs text-neutral-500 mr-2">{"ABCD"[i]}.</span>{a.text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            ) : (
                <section className="bg-[#111813] border border-[#1F2A22] rounded-lg p-5 text-sm space-y-1.5" aria-live="polite">
                    {JUDGING.slice(0, judgeStep + 1).map((l, i) => (
                        <p key={l} style={{ color: i < judgeStep ? "#6B8F76" : GREEN }}>&gt; {l}</p>
                    ))}
                </section>
            )}

            <p className="font-sans text-[11px] text-neutral-600 mt-10 break-keep">{SITE.disclaimer}</p>
        </main>
    );
}
