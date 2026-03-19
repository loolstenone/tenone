"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const sections = [
    {
        title: "근무 환경",
        items: [
            { q: "근무 시간", a: "자율 출퇴근제 (코어타임 11:00~16:00). 주 40시간 기준. 야근은 권장하지 않으며, 필요 시 사전 협의." },
            { q: "근무 장소", a: "사무실 기본 근무. 주 2회 재택 가능 (팀 리더 협의). 해외 원격 근무는 별도 신청." },
            { q: "휴가", a: "연차 15일 (1년 미만 월 1일). 반차 사용 가능. 연차 외 경조사, 병가 등 특별 휴가 별도 부여." },
            { q: "장비 지원", a: "노트북, 모니터, 키보드 등 업무 장비 회사 지급. 소프트웨어 라이선스 필요 시 신청." },
        ],
    },
    {
        title: "업무 프로세스",
        items: [
            { q: "태스크 관리", a: "Studio > Workflow 칸반 보드에서 태스크 관리. 상태: Backlog → Todo → In Progress → Review → Done. 일일 스탠드업에서 진행 상황 공유." },
            { q: "미팅 문화", a: "일일 스탠드업 (10분), 위클리 팀 미팅 (30분), 월간 전체 회의 (1시간). 미팅은 아젠다 필수, 회의록 작성 담당 로테이션." },
            { q: "의사결정", a: "Principle 5: '리더와 팔로어는 역할이지 직급이 아니다'. 의견은 자유롭게, 결정은 빠르게. 결정 후엔 전력으로 이행." },
            { q: "보고 체계", a: "주간 GPR 업데이트. 긴급 사항은 슬랙 DM 또는 전화. 일반 보고는 비동기 커뮤니케이션 우선." },
        ],
    },
    {
        title: "평가 & 성장",
        items: [
            { q: "GPR 시스템", a: "Goal(목표 설정) → Planning(계획 수립) → Result(결과 평가). 분기별 1회 공식 평가, 중간 체크인 수시." },
            { q: "피드백", a: "360도 피드백 분기 1회. 긍정적/건설적 피드백 모두 중요. 피드백은 행동에 대해, 인격에 대해서가 아닌." },
            { q: "성장 지원", a: "교육비 연간 100만원 지원. 외부 컨퍼런스 참가 지원. 사내 스터디 그룹 자율 운영." },
        ],
    },
    {
        title: "커뮤니케이션 가이드",
        items: [
            { q: "슬랙 사용법", a: "#general: 전사 공지. #random: 자유 대화. #brand-*: 브랜드별 채널. @here는 긴급 시에만. 이모지 리액션으로 확인 표시." },
            { q: "문서화 원칙", a: "'기록되지 않으면 존재하지 않는다.' 모든 결정 사항은 Wiki 또는 Notion에 기록. 구두 합의도 사후 문서화." },
            { q: "비동기 우선", a: "즉답이 필요 없는 건 슬랙 메시지. 30분 내 응답 불필요. 긴급 건만 전화/DM." },
        ],
    },
    {
        title: "보안 & 윤리",
        items: [
            { q: "정보 보안", a: "외부 공유 금지 정보: 미공개 브랜드 계획, 재무 데이터, 인사 정보. 퇴사 시 모든 회사 데이터 반납 및 삭제." },
            { q: "행동 강령", a: "상호 존중, 차별 금지, 이해 충돌 회피. 문제 발생 시 리더 또는 HR에 즉시 보고." },
            { q: "지식재산권", a: "업무 중 생산된 모든 콘텐츠/코드/디자인은 회사 소유. 개인 프로젝트는 사전 협의 필요." },
        ],
    },
];

export default function HandbookPage() {
    const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

    const toggleSection = (idx: number) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div>
                <h1 className="text-2xl font-bold">Handbook</h1>
                <p className="mt-2 text-neutral-500">
                    Ten:One™ 직원 핸드북. 근무 환경, 업무 프로세스, 평가, 커뮤니케이션에 관한 가이드입니다.
                </p>
            </div>

            <div className="space-y-3">
                {sections.map((section, sIdx) => {
                    const isOpen = openSections.has(sIdx);
                    return (
                        <div key={section.title} className="border border-neutral-200 bg-white">
                            <button
                                onClick={() => toggleSection(sIdx)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                            >
                                <h2 className="text-base font-semibold">{section.title}</h2>
                                {isOpen
                                    ? <ChevronDown className="h-4 w-4 text-neutral-400" />
                                    : <ChevronRight className="h-4 w-4 text-neutral-400" />
                                }
                            </button>
                            {isOpen && (
                                <div className="border-t border-neutral-100 divide-y divide-neutral-50">
                                    {section.items.map(item => (
                                        <div key={item.q} className="px-6 py-4">
                                            <h3 className="text-sm font-medium">{item.q}</h3>
                                            <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
