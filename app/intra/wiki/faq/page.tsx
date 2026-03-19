"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

const faqs = [
    {
        category: "일반",
        items: [
            { q: "Ten:One™이 정확히 무엇인가요?", a: "Ten:One™은 '가치로 연결된 거대한 세계관'을 만드는 멀티 브랜드 생태계입니다. AI 아이돌(LUKI), AI 크리에이터(RooK), 커뮤니티(Badak, MAD League), 패션(FWN) 등 10개 이상의 브랜드가 유기적으로 연결되어 있습니다." },
            { q: "어떤 브랜드들이 있나요?", a: "LUKI(AI 걸그룹), RooK(AI 크리에이터), HeRo(탤런트 에이전시), Badak(마케팅 네트워크), MAD Leap(대학 동아리), MAD League(프로젝트 얼라이언스), FWN(패션), 0gamja(캐릭터), YouInOne(비즈니스 얼라이언스), MADzine(콘텐츠) 등이 있습니다." },
            { q: "Principle 10이 뭔가요?", a: "Ten:One™의 핵심 가치를 10개의 원칙으로 정리한 것입니다. '우리는 모두 기획자다'부터 '나의 작은 세계가 연결되어 하나의 거대한 세계관을 만든다'까지. Wiki > Culture에서 전체 내용을 확인할 수 있습니다." },
        ],
    },
    {
        category: "업무 도구",
        items: [
            { q: "Intra Portal에서 무엇을 할 수 있나요?", a: "Studio(워크플로우/칸반), Marketing(CRM/캠페인/리드/콘텐츠/분석), ERP(HR/Staff/GPR), Wiki(교육/문서), CMS(웹사이트 콘텐츠 관리) 등 전사 업무를 관리할 수 있습니다." },
            { q: "GPR은 어떻게 작성하나요?", a: "ERP > HR > GPR에서 작성합니다. Goal(이번 분기 목표), Planning(실행 계획), Result(결과 및 회고)를 순차적으로 작성하며, 리더의 승인 및 피드백을 받습니다." },
            { q: "태스크는 어디서 관리하나요?", a: "Studio > Workflow에서 칸반 보드로 관리합니다. Backlog → Todo → In Progress → Review → Done 순서로 진행되며, 드래그앤드롭으로 상태를 변경할 수 있습니다." },
            { q: "CRM 연락처는 어떻게 추가하나요?", a: "Marketing > CRM > People에서 개별 추가하거나, Import 기능으로 Excel 파일을 일괄 업로드할 수 있습니다." },
        ],
    },
    {
        category: "근무",
        items: [
            { q: "재택근무가 가능한가요?", a: "주 2회 재택근무가 가능합니다. 팀 리더와 사전 협의가 필요하며, 코어타임(11:00~16:00)에는 온라인 상태를 유지해야 합니다." },
            { q: "연차는 어떻게 사용하나요?", a: "슬랙에서 휴가 신청 후 리더 승인. 연차 15일(1년 미만 월 1일), 반차 사용 가능. 3일 이상 연속 휴가는 1주 전 신청을 권장합니다." },
            { q: "야근 수당이 있나요?", a: "자율 출퇴근제로 운영되며, 야근은 원칙적으로 권장하지 않습니다. 불가피한 경우 리더 협의 후 대체 휴무로 처리합니다." },
        ],
    },
    {
        category: "성장 & 지원",
        items: [
            { q: "교육비 지원이 있나요?", a: "연간 100만원의 교육비를 지원합니다. 온라인 강의, 서적, 외부 교육, 컨퍼런스 참가비 등에 사용할 수 있습니다." },
            { q: "사내 스터디는 어떻게 만드나요?", a: "3인 이상 모이면 자율적으로 개설 가능합니다. 슬랙 #study 채널에 공지 후 진행하며, 스터디 자료비를 별도 지원합니다." },
            { q: "다른 브랜드/팀으로 이동할 수 있나요?", a: "분기별 내부 이동 신청이 가능합니다. 현재 팀 리더, 이동 희망 팀 리더, HR의 3자 협의를 거칩니다." },
        ],
    },
];

export default function FaqPage() {
    const [search, setSearch] = useState("");
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggle = (key: string) => {
        setOpenItems(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const filtered = faqs.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div>
                <h1 className="text-2xl font-bold">FAQ</h1>
                <p className="mt-2 text-neutral-500">자주 묻는 질문을 모았습니다.</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                    type="text"
                    placeholder="질문 검색..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-neutral-200 bg-white pl-10 pr-4 py-3 text-sm focus:border-neutral-400 focus:outline-none transition-colors"
                />
            </div>

            {/* FAQ Sections */}
            {filtered.map(cat => (
                <section key={cat.category} className="space-y-2">
                    <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">{cat.category}</h2>
                    <div className="space-y-1">
                        {cat.items.map(item => {
                            const key = `${cat.category}-${item.q}`;
                            const isOpen = openItems.has(key);
                            return (
                                <div key={key} className="border border-neutral-200 bg-white">
                                    <button
                                        onClick={() => toggle(key)}
                                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
                                    >
                                        <span className="text-sm font-medium pr-4">{item.q}</span>
                                        {isOpen
                                            ? <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                                            : <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
                                        }
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 pb-4">
                                            <p className="text-sm text-neutral-500 leading-relaxed">{item.a}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            {filtered.length === 0 && (
                <div className="text-center py-12 text-neutral-400 text-sm">
                    검색 결과가 없습니다.
                </div>
            )}
        </div>
    );
}
