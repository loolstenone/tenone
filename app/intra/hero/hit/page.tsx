"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, ChevronRight, ArrowRight } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import * as heroDb from "@/lib/supabase/hero";
import { useAuth } from "@/lib/auth-context";

interface Question {
    id: number;
    text: string;
    type: "likert" | "choice";
    options?: string[];
}

const step1Questions: Question[] = [
    { id: 1, text: "새로운 도전을 시작할 때 나는 주도적으로 방향을 정한다.", type: "likert" },
    { id: 2, text: "사람들과 어울리는 것이 에너지를 준다.", type: "likert" },
    { id: 3, text: "안정적인 환경에서 일할 때 더 효율적이다.", type: "likert" },
    { id: 4, text: "데이터와 논리를 기반으로 판단하는 편이다.", type: "likert" },
    { id: 5, text: "나는 주변 사람들의 감정에 민감하게 반응한다.", type: "likert" },
    { id: 6, text: "계획보다는 즉흥적으로 행동하는 편이다.", type: "likert" },
    { id: 7, text: "혼자 있는 시간이 충전의 시간이다.", type: "likert" },
    { id: 8, text: "구체적인 사실보다 전체적인 흐름을 먼저 파악한다.", type: "likert" },
    { id: 9, text: "내 능력에 대한 자신감이 높은 편이다.", type: "likert" },
    { id: 10, text: "타인의 평가에 민감하게 반응한다.", type: "likert" },
];

const step2Questions: Question[] = [
    { id: 11, text: "나의 가장 큰 강점은 무엇인가요?", type: "choice", options: ["전략적 사고", "실행력", "창의성", "대인관계", "분석력"] },
    { id: 12, text: "프로젝트에서 선호하는 역할은?", type: "choice", options: ["리더/PM", "기획자", "실무 담당", "조율자", "분석가"] },
    { id: 13, text: "새로운 업무를 배울 때 나는...", type: "likert" },
    { id: 14, text: "팀 내 갈등 상황에서 나는 적극적으로 중재한다.", type: "likert" },
    { id: 15, text: "가장 관심 있는 직무 영역은?", type: "choice", options: ["경영전략", "마케팅/브랜드", "기술/개발", "디자인/크리에이티브", "운영/관리"] },
    { id: 16, text: "스트레스 상황에서도 냉정하게 판단할 수 있다.", type: "likert" },
    { id: 17, text: "장기 목표를 세우고 꾸준히 실행하는 편이다.", type: "likert" },
    { id: 18, text: "현재 취업/이직 준비 상태는?", type: "choice", options: ["적극 활동 중", "준비 중", "관심 있음", "해당 없음(재직 중)", "경영자/창업자"] },
    { id: 19, text: "커리어 비전이 명확하다.", type: "likert" },
    { id: 20, text: "나는 끊임없이 자기개발에 투자한다.", type: "likert" },
];

const likertLabels = ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"];

export default function HitTestPage() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState<Record<number, number | string>>({});
    const [completed, setCompleted] = useState(false);
    const [previousResults, setPreviousResults] = useState<unknown[]>([]);

    // DB에서 이전 결과 로드
    useEffect(() => {
        if (!user?.id) return;
        heroDb.fetchHitResults(user.id)
            .then(data => setPreviousResults(data))
            .catch(() => { /* Mock fallback */ });
    }, [user?.id]);

    const questions = step === 1 ? step1Questions : step2Questions;
    const answeredCount = questions.filter(q => answers[q.id] !== undefined).length;
    const totalAll = step1Questions.length + step2Questions.length;
    const answeredAll = Object.keys(answers).length;
    const progressPercent = Math.round((answeredAll / totalAll) * 100);

    const handleLikert = (qId: number, val: number) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const handleChoice = (qId: number, val: string) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const canProceed = answeredCount === questions.length;

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        } else {
            setCompleted(true);
            // DB에 결과 저장
            if (user?.id) {
                heroDb.saveHitResult({
                    member_id: user.id,
                    test_type: "HIT_INTEGRATED",
                    scores: answers as Record<string, unknown>,
                    summary: `Step1+Step2 완료, ${Object.keys(answers).length}문항 응답`,
                }).catch(() => { /* silent */ });
            }
        }
    };

    if (completed) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center">
                <div className="w-16 h-16 bg-neutral-900 text-white flex items-center justify-center mx-auto mb-6">
                    <ClipboardCheck className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">검사 완료!</h1>
                <p className="text-sm text-neutral-500 mb-8">
                    결과 리포트를 확인하세요. HIT 기반으로 HeRo 캐릭터가 생성되었습니다.
                </p>
                <Link
                    href="/intra/erp/hero/hit/report"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors"
                >
                    결과 리포트 보기 <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-6">
                <h1 className="text-xl font-bold">HIT — HeRo Integrated Test</h1>
                <p className="text-sm text-neutral-500 mt-1">인성 · 적성 · 역량 · 준비도 통합 진단</p>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                    <span>전체 진행률 {progressPercent}%</span>
                    <span>{answeredAll}/{totalAll}문항</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200">
                    <div
                        className="h-full bg-neutral-900 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-6">
                <div className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 text-xs font-medium border",
                    step === 1 ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-400"
                )}>
                    Step 1: 기질/태도 검사
                </div>
                <ChevronRight className="h-3 w-3 text-neutral-300" />
                <div className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 text-xs font-medium border",
                    step === 2 ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-400"
                )}>
                    Step 2: 역량/적성 검사
                </div>
            </div>

            {/* Step description */}
            <div className="border border-neutral-200 bg-white p-4 mb-6">
                {step === 1 ? (
                    <>
                        <h2 className="text-sm font-semibold mb-1">기질/태도 검사</h2>
                        <p className="text-xs text-neutral-500">
                            행동유형(DISC 기반), 일상태도(MBTI 기반), 자존감/자존심을 측정합니다.
                        </p>
                        <div className="flex gap-4 mt-3">
                            {["주도형(D)", "사교형(I)", "안정형(S)", "신중형(C)"].map(t => (
                                <span key={t} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500">{t}</span>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-sm font-semibold mb-1">역량/적성 검사</h2>
                        <p className="text-xs text-neutral-500">
                            강점유형(S-Power), 직무적성, 취업준비도를 측정합니다.
                        </p>
                    </>
                )}
            </div>

            {/* Questions */}
            <div className="space-y-4 mb-8">
                {questions.map((q, idx) => (
                    <div key={q.id} className="border border-neutral-200 bg-white p-4">
                        <p className="text-sm font-medium mb-3">
                            <span className="text-neutral-400 mr-2">Q{idx + 1}.</span>
                            {q.text}
                        </p>
                        {q.type === "likert" ? (
                            <div className="flex gap-2">
                                {likertLabels.map((label, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleLikert(q.id, i + 1)}
                                        className={clsx(
                                            "flex-1 py-2 text-xs border transition-colors",
                                            answers[q.id] === i + 1
                                                ? "border-neutral-900 bg-neutral-900 text-white"
                                                : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {q.options?.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => handleChoice(q.id, opt)}
                                        className={clsx(
                                            "px-3 py-1.5 text-xs border transition-colors",
                                            answers[q.id] === opt
                                                ? "border-neutral-900 bg-neutral-900 text-white"
                                                : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                {step === 2 && (
                    <button
                        onClick={() => setStep(1)}
                        className="px-4 py-2 text-xs text-neutral-500 border border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                        이전 단계
                    </button>
                )}
                <div className="ml-auto">
                    <button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className={clsx(
                            "px-6 py-2.5 text-xs font-medium transition-colors",
                            canProceed
                                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        )}
                    >
                        {step === 1 ? "다음 단계" : "검사 완료"}
                    </button>
                </div>
            </div>
        </div>
    );
}
