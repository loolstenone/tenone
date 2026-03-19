"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";

const weeks = [
    {
        week: "Day 1",
        title: "첫날: 환영합니다",
        tasks: [
            { label: "슬랙/이메일 계정 발급 및 접속 확인", done: false },
            { label: "Intra 포털 로그인 및 프로필 설정", done: false },
            { label: "Wiki > Culture 페이지 읽기 (Principle 10, Core Value)", done: false },
            { label: "팀 리더와 1:1 미팅 (업무 소개, 기대 사항)", done: false },
            { label: "노트북/장비 수령 및 개발환경 셋업", done: false },
        ],
    },
    {
        week: "Week 1",
        title: "첫째 주: 이해하기",
        tasks: [
            { label: "Ten:One Universe 브랜드 생태계 파악 (About 페이지)", done: false },
            { label: "담당 브랜드/프로젝트 히스토리 학습", done: false },
            { label: "Studio > Workflow 칸반 보드 사용법 익히기", done: false },
            { label: "GPR (Goal-Planning-Result) 시스템 이해", done: false },
            { label: "팀원 전체와 커피챗 1회씩", done: false },
        ],
    },
    {
        week: "Week 2",
        title: "둘째 주: 참여하기",
        tasks: [
            { label: "첫 번째 태스크 할당 및 착수", done: false },
            { label: "스탠드업 미팅 참여 시작", done: false },
            { label: "CRM에서 담당 연락처 확인", done: false },
            { label: "마케팅 캠페인 현황 파악", done: false },
            { label: "Wiki 개선 포인트 1개 이상 제안", done: false },
        ],
    },
    {
        week: "Week 3-4",
        title: "셋째~넷째 주: 기여하기",
        tasks: [
            { label: "독립적으로 태스크 완료 2건 이상", done: false },
            { label: "GPR 첫 Goal 설정 (리더 승인)", done: false },
            { label: "브랜드 프로젝트 1개에 실질적 기여", done: false },
            { label: "온보딩 회고 작성 및 리더와 공유", done: false },
            { label: "30일 리뷰 미팅", done: false },
        ],
    },
];

const tools = [
    { name: "Intra Portal", desc: "업무 관리, CRM, 워크플로우의 중심", url: "/intra" },
    { name: "Slack", desc: "실시간 커뮤니케이션 (채널: #general, #random, #브랜드별)", url: "#" },
    { name: "Notion", desc: "문서 협업 및 장기 기록 (Wiki와 병행)", url: "#" },
    { name: "Figma", desc: "디자인 협업 도구", url: "#" },
    { name: "GitHub", desc: "코드 관리 및 협업", url: "#" },
];

export default function OnboardingPage() {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    const toggle = (key: string) => {
        setCheckedItems(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <h1 className="text-2xl font-bold">Onboarding Guide</h1>
                <p className="mt-2 text-neutral-500">
                    Ten:One™에 오신 것을 환영합니다. 이 가이드를 따라 첫 30일을 보내세요.
                </p>
            </div>

            {/* Timeline Checklist */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold">30일 온보딩 체크리스트</h2>
                {weeks.map((phase) => (
                    <div key={phase.week} className="border border-neutral-200 bg-white">
                        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
                            <Clock className="h-4 w-4 text-neutral-400" />
                            <div>
                                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{phase.week}</span>
                                <h3 className="text-sm font-semibold">{phase.title}</h3>
                            </div>
                        </div>
                        <ul className="divide-y divide-neutral-50">
                            {phase.tasks.map((task) => {
                                const key = `${phase.week}-${task.label}`;
                                const checked = checkedItems.has(key);
                                return (
                                    <li key={key} className="px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-neutral-50 transition-colors" onClick={() => toggle(key)}>
                                        {checked
                                            ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            : <Circle className="h-4 w-4 text-neutral-300 shrink-0" />
                                        }
                                        <span className={`text-sm ${checked ? 'line-through text-neutral-400' : ''}`}>{task.label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </section>

            {/* Tools */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold">사용 도구</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    {tools.map(tool => (
                        <div key={tool.name} className="border border-neutral-200 bg-white p-5 flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-sm">{tool.name}</h3>
                                <p className="text-xs text-neutral-500 mt-0.5">{tool.desc}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-neutral-300" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Tips */}
            <section className="border border-neutral-200 bg-white p-6 space-y-4">
                <h2 className="text-lg font-bold">Tips</h2>
                <ul className="space-y-2 text-sm text-neutral-600">
                    <li>• 모르는 건 바로 물어보세요. 질문은 성장의 시작입니다.</li>
                    <li>• Principle 10을 자주 떠올려 보세요. 특히 <strong>&ldquo;어설픈 완벽주의는 일을 출발시키지 못한다&rdquo;</strong></li>
                    <li>• 첫 2주는 &ldquo;이해&rdquo;에, 나머지 2주는 &ldquo;기여&rdquo;에 집중하세요.</li>
                    <li>• 온보딩 중 발견한 개선점을 반드시 기록해 두세요. 그게 곧 첫 기여입니다.</li>
                </ul>
            </section>
        </div>
    );
}
